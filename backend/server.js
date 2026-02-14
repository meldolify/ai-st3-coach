// Load configuration first (handles env vars, validation, and Google Cloud credentials)
const config = require('./src/config');

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Create Express app and HTTP server early so both REST and WebSocket share one port
const app = express();
const server = http.createServer(app);

// Import services
const openaiService = require('./src/services/OpenAIService');
const ttsService = require('./src/services/TTSService');
const { ServerVAD, float32ToWavBuffer } = require('./src/services/ServerVAD');
const { isNoiseTranscript, buildNaturalSSML } = require('./src/utils/audioHelpers');
const { loadScenarioPrompt } = require('./src/utils/scenarioLoader');
const SentenceBuffer = require('./src/utils/sentenceBuffer');

// Import security middleware
const {
  generateSecureSessionId,
  WebSocketRateLimiter,
  validateMessage,
  sanitizeForLog
} = require('./src/middleware/websocketSecurity');

// Initialize WebSocket rate limiter
// Audio streaming: ScriptProcessorNode(4096) at 48kHz = 85ms/callback = ~12 chunks/sec = ~720/min
const wsRateLimiter = new WebSocketRateLimiter({
  windowMs: 60000, // 1 minute window
  maxMessages: 1200, // ~720 audio + control messages, with headroom
  maxAudioPerMinute: 900 // ~12 chunks/sec = 720/min, with 25% headroom
});

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => wsRateLimiter.cleanup(), 5 * 60 * 1000);

// Stripe for payments (optional - only if configured)
let stripe = null;
if (config.isStripeEnabled) {
  stripe = require('stripe')(config.STRIPE_SECRET_KEY);
}

// Supabase for database operations (optional - only if configured)
let supabaseAdmin = null;
if (config.isSupabaseEnabled) {
  const { createClient } = require('@supabase/supabase-js');
  supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
}

process.on('unhandledRejection', (reason, _promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});
process.on('uncaughtException', error => {
  console.error('[FATAL] Uncaught Exception:', error);
});

console.log('API clients initialized');

const sessions = new Map();

// Use secure session ID generation from middleware
// (keeping function name for backwards compatibility)

// Wrapper functions that use the services (for backwards compatibility with existing code flow)
async function callGPT4oMini(history, options) {
  return openaiService.generateResponse(history, options);
}

/**
 * Map a scenario file path to its dedicated feedback prompt path.
 * Falls back to generic feedback prompt if no dedicated file exists.
 * @param {string} scenarioFile - e.g. "prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt"
 * @returns {string} - The feedback prompt text
 */
function loadFeedbackPrompt(scenarioFile) {
  // Extract the scenario name from the path
  // e.g. "prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt"
  // -> directory name "necrotising_fasciitis" -> feedback file "clinical_necrotising_fasciitis_feedback.txt"
  try {
    const parts = scenarioFile.replace(/\\/g, '/').split('/');
    // The scenario directory is the second-to-last part
    const scenarioDir = parts.length >= 2 ? parts[parts.length - 2] : '';
    const feedbackFileName = `clinical_${scenarioDir}_feedback.txt`;
    const feedbackPath = path.join(__dirname, 'prompts/feedback', feedbackFileName);

    if (fs.existsSync(feedbackPath)) {
      console.log('[FEEDBACK] Loading dedicated feedback prompt:', feedbackFileName);
      return fs.readFileSync(feedbackPath, 'utf8');
    }
  } catch (err) {
    console.warn('[FEEDBACK] Error resolving dedicated feedback prompt:', err.message);
  }

  // Fallback to generic feedback prompt
  const genericPath = path.join(__dirname, 'prompts/feedback/generic_feedback.txt');
  if (fs.existsSync(genericPath)) {
    console.log('[FEEDBACK] Using generic feedback prompt');
    return fs.readFileSync(genericPath, 'utf8');
  }

  // Last resort fallback
  console.warn('[FEEDBACK] No feedback prompt files found, using inline fallback');
  return 'You are an expert plastic surgery examiner. Review the following interview transcript and provide feedback in 6 sections: (1) Overall Impression with score 0-5, (2) Diagnosis & Assessment, (3) Management & Treatment, (4) Strengths, (5) Areas for Improvement, (6) Closing Summary. Deliver one section at a time. When the user sends "continue", move to the next section. Begin with Section 1 now.';
}

/**
 * Serialize conversation history into a readable transcript string.
 * Skips the system message. Maps roles to [Examiner] and [Candidate].
 * @param {Array} history - Conversation history array of {role, content}
 * @returns {string} - Formatted transcript
 */
function serializeTranscript(history) {
  return history
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const label = msg.role === 'assistant' ? '[Examiner]' : '[Candidate]';
      return `${label}: ${msg.content}`;
    })
    .join('\n');
}

async function googleTTS(text, voiceName) {
  return ttsService.synthesize(text, voiceName);
}

/**
 * Stream GPT response with sentence-level TTS to client.
 * Sends ai_response_start, then ai_response_chunk per sentence, then ai_response_end.
 * @param {Object} session - Session object from sessions Map
 * @param {WebSocket} ws - WebSocket connection
 * @param {Array} history - Conversation history (user message already pushed)
 * @param {Object} options - GPT options (optional)
 */
async function streamResponseToClient(session, ws, history, options = {}) {
  const sentenceBuffer = new SentenceBuffer();
  let fullText = '';
  let chunkIndex = 0;
  const t0 = Date.now();

  session.isAISpeaking = true;
  ws.send(JSON.stringify({ type: 'ai_response_start' }));

  try {
    for await (const token of openaiService.generateResponseStream(history, options)) {
      // Abort if user interrupted
      if (!session.isAISpeaking) {
        console.log('[STREAM] Aborted — user interrupted');
        break;
      }

      fullText += token;
      const sentences = sentenceBuffer.addToken(token);

      for (const sentence of sentences) {
        if (!session.isAISpeaking) {
          break;
        }
        const ssml = buildNaturalSSML(sentence);
        const audio = await googleTTS(ssml, session.voice);
        ws.send(
          JSON.stringify({
            type: 'ai_response_chunk',
            text: sentence,
            audio: audio.toString('base64'),
            chunkIndex: chunkIndex++
          })
        );
      }
    }

    // Flush remaining text
    const remaining = sentenceBuffer.flush();
    if (remaining && session.isAISpeaking) {
      const ssml = buildNaturalSSML(remaining);
      const audio = await googleTTS(ssml, session.voice);
      ws.send(
        JSON.stringify({
          type: 'ai_response_chunk',
          text: remaining,
          audio: audio.toString('base64'),
          chunkIndex: chunkIndex++
        })
      );
    }

    const tEnd = Date.now();
    console.log(`[TIMING] Streaming pipeline: ${tEnd - t0}ms, ${chunkIndex} chunks`);
    console.log('[AI] ' + fullText);

    // Push full response to history
    history.push({ role: 'assistant', content: fullText });

    ws.send(JSON.stringify({ type: 'ai_response_end', fullText }));
  } catch (error) {
    console.error('[STREAM] Error:', error.message);
    // If we got partial text, still save it
    if (fullText) {
      history.push({ role: 'assistant', content: fullText });
    }
    ws.send(JSON.stringify({ type: 'error', message: 'Streaming response failed' }));
    session.isAISpeaking = false;
  }
}

const wss = new WebSocket.Server({
  server, // Attach to shared HTTP server (same port for REST + WebSocket)
  verifyClient: info => {
    if (config.isProduction) {
      const origin = info.origin || info.req.headers.origin;
      return origin === config.FRONTEND_URL;
    }
    return true; // Allow all origins in development
  }
});

console.log('WebSocket server attached to HTTP server');

// Ping/pong heartbeat to detect dead connections and prevent zombie sessions
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeatInterval));

wss.on('connection', (ws, req) => {
  console.log('\n[CLIENT] New client connected');

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  const queryParams = url.parse(req.url, true).query;
  const scenarioFile = queryParams.scenario || 'template.txt';
  const difficulty = queryParams.difficulty || null;
  const voice = queryParams.voice || config.TTS_VOICE;
  const userId = queryParams.userId || null;
  const authToken = queryParams.token || null;

  console.log(
    '[CLIENT] Requested scenario: ' +
      scenarioFile +
      (difficulty ? ' (difficulty: ' + difficulty + ')' : '') +
      (voice ? ' (voice: ' + voice + ')' : '')
  );

  // Async IIFE for access validation
  (async () => {
    // Server-side tier validation if Supabase is enabled
    if (config.DEV_BYPASS_AUTH) {
      console.log('[ACCESS] DEV_BYPASS_AUTH enabled - skipping all access checks');
    } else if (config.isSupabaseEnabled && supabaseAdmin) {
      try {
        // Check if this is a free tier scenario (no auth required)
        const isFreeScenario = config.FREE_TIER_SCENARIOS.includes(scenarioFile);

        if (!isFreeScenario) {
          // Premium scenario - require authentication
          if (!userId || !authToken) {
            console.warn('[ACCESS] Rejected: No auth credentials for premium scenario');
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
            ws.close(4001, 'Unauthorized');
            return;
          }

          // Verify the auth token with Supabase
          const {
            data: { user },
            error: authError
          } = await supabaseAdmin.auth.getUser(authToken);

          if (authError || !user) {
            console.warn('[ACCESS] Rejected: Invalid auth token');
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            ws.close(4001, 'Unauthorized');
            return;
          }

          if (user.id !== userId) {
            console.warn('[ACCESS] Rejected: User ID mismatch');
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            ws.close(4001, 'Unauthorized');
            return;
          }

          // Check subscription status
          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('status')
            .eq('user_id', userId)
            .single();

          const isPremium = subscription?.status === 'active';

          if (!isPremium) {
            console.warn('[ACCESS] Rejected: No active subscription for premium scenario');
            ws.send(JSON.stringify({ type: 'error', message: 'Subscription required' }));
            ws.close(4003, 'Subscription required');
            return;
          }

          console.log('[ACCESS] Verified: Premium user accessing premium scenario');
        } else {
          console.log('[ACCESS] Allowed: Free tier scenario');
        }
      } catch (err) {
        console.error('[ACCESS] Validation error:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Access validation failed' }));
        ws.close(4002, 'Validation error');
        return;
      }
    }

    // Access validated - create session
    const scenarioPrompt = loadScenarioPrompt(scenarioFile, difficulty);
    const sessionId = generateSecureSessionId();

    // Create server-side VAD instance for this session
    const vadInstance = new ServerVAD();
    try {
      await vadInstance.initialize();
    } catch (vadError) {
      console.error('[VAD] Failed to initialize:', vadError.message);
      ws.send(JSON.stringify({ type: 'error', message: 'Server VAD initialization failed' }));
      ws.close(1011, 'VAD initialization failed');
      return;
    }

    // Per-session incremental Whisper state
    const incrementalState = {
      latestTranscript: '', // Most recent cumulative transcript
      pendingTranscription: null, // Promise for in-flight Whisper call
      exportCount: 0
    };

    sessions.set(sessionId, {
      history: [{ role: 'system', content: scenarioPrompt }],
      ws: ws,
      scenario: scenarioFile,
      voice: voice,
      userId: userId,
      isAISpeaking: false,
      inFeedbackMode: false,
      feedbackCount: 0,
      vad: vadInstance,
      incrementalState
    });

    // Wire up VAD callbacks
    vadInstance.onSpeechStart = () => {
      console.log(`[VAD] Speech started for ${sessionId}`);
      // Reset incremental state for new utterance
      incrementalState.latestTranscript = '';
      incrementalState.pendingTranscription = null;
      incrementalState.exportCount = 0;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'vad_speech_start' }));
      }
    };

    // Incremental Whisper: transcribe cumulative audio every ~15s during long speech
    vadInstance.onIncrementalAudio = async (audioSnapshot, frameIndex) => {
      if (incrementalState.pendingTranscription) {
        await incrementalState.pendingTranscription;
      }
      incrementalState.exportCount++;
      console.log(
        `[INCREMENTAL] Export #${incrementalState.exportCount} at frame ${frameIndex}, ${Math.round(audioSnapshot.length / 16000)}s audio`
      );

      incrementalState.pendingTranscription = (async () => {
        try {
          const wavBuffer = float32ToWavBuffer(audioSnapshot, 16000);
          const transcript = await openaiService.transcribeAudio(wavBuffer, sessionId, 'wav');
          incrementalState.latestTranscript = transcript;
          console.log(`[INCREMENTAL] Transcript: "${transcript.substring(0, 80)}..."`);
        } catch (err) {
          console.error('[INCREMENTAL] Whisper error:', err.message);
        }
      })();
    };

    vadInstance.onSpeechEnd = async (audioFloat32, hadIncrementalExports, audioSinceExport) => {
      const session = sessions.get(sessionId);
      if (!session || ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const t0 = Date.now();
      const durationMs = (audioFloat32.length / 16000) * 1000;
      const vadLatency = vadInstance.speechStartTime ? t0 - vadInstance.speechStartTime : 0;
      console.log(
        `[VAD] Speech ended for ${sessionId}, ${Math.round(durationMs)}ms audio, VAD held ${vadLatency}ms`
      );

      // Skip very short utterances (< 300ms) — likely noise
      if (audioFloat32.length < 4800) {
        console.log('[VAD] Too short, skipping');
        return;
      }

      try {
        let transcript;
        const tWav = Date.now();

        if (hadIncrementalExports && incrementalState.exportCount > 0) {
          // Long utterance: use incremental transcript + transcribe only final segment
          if (incrementalState.pendingTranscription) {
            await incrementalState.pendingTranscription;
          }

          // audioSinceExport is pre-computed by ServerVAD before clearing buffers.
          // If final segment is too short (< 0.1s = 1600 samples), skip Whisper and use incremental transcript as-is.
          if (audioSinceExport && audioSinceExport.length >= 1600) {
            const finalWav = float32ToWavBuffer(audioSinceExport, 16000);
            console.log(
              `[TIMING] Incremental: ${incrementalState.exportCount} exports, final segment ${Math.round(audioSinceExport.length / 16000)}s (${finalWav.length} bytes)`
            );
            const finalTranscript = await openaiService.transcribeAudio(finalWav, sessionId, 'wav');
            transcript = (incrementalState.latestTranscript + ' ' + finalTranscript).trim();
          } else {
            console.log(
              `[TIMING] Incremental: ${incrementalState.exportCount} exports, final segment too short (${audioSinceExport?.length || 0} samples) — using incremental transcript`
            );
            transcript = incrementalState.latestTranscript;
          }

          const tWhisper = Date.now();
          console.log(
            `[TIMING] Whisper STT (incremental): ${tWhisper - tWav}ms → "${transcript.substring(0, 100)}..."`
          );
        } else {
          // Short utterance: standard full transcription
          const wavBuffer = float32ToWavBuffer(audioFloat32, 16000);
          console.log(`[TIMING] WAV encode: ${Date.now() - t0}ms (${wavBuffer.length} bytes)`);

          transcript = await openaiService.transcribeAudio(wavBuffer, sessionId, 'wav');
          const tWhisper = Date.now();
          console.log(`[TIMING] Whisper STT: ${tWhisper - tWav}ms → "${transcript}"`);
        }

        // Filter noise transcripts
        if (isNoiseTranscript(transcript)) {
          console.log('[VAD] Filtered as noise');
          return;
        }

        // Send transcript to client for display
        ws.send(JSON.stringify({ type: 'user_transcript_display', text: transcript }));

        // Process with streaming GPT → sentence-level TTS
        session.history.push({ role: 'user', content: transcript });
        await streamResponseToClient(session, ws, session.history);
      } catch (error) {
        console.error('[VAD] Pipeline error:', error.message);
        ws.send(JSON.stringify({ type: 'error', message: 'Processing failed' }));
      }
    };

    ws.send(
      JSON.stringify({
        type: 'scenario_loaded',
        sessionId: sessionId,
        scenario: scenarioFile
      })
    );

    // Set up message handler only after validation passes
    ws.on('message', async data => {
      try {
        // Parse and validate message
        let msg;
        try {
          msg = JSON.parse(data);
        } catch (parseError) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
          return;
        }

        // Validate message schema
        const validation = validateMessage(msg);
        if (!validation.valid) {
          console.warn(`[SECURITY] Invalid message rejected: ${validation.error}`);
          ws.send(JSON.stringify({ type: 'error', message: validation.error }));
          return;
        }

        // Check rate limits
        const messageType =
          msg.type === 'whisper_audio' || msg.type === 'audio_chunk' ? 'audio' : 'other';
        const rateCheck = wsRateLimiter.checkLimit(msg.sessionId, messageType);
        if (!rateCheck.allowed) {
          console.warn(
            `[SECURITY] Rate limit exceeded for session ${msg.sessionId}: ${rateCheck.reason}`
          );
          ws.send(JSON.stringify({ type: 'error', message: rateCheck.reason }));
          return;
        }

        const session = sessions.get(msg.sessionId);

        if (!session) {
          ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
          return;
        }

        switch (msg.type) {
          case 'audio_chunk':
            // Server-side VAD: receive PCM audio, run through Silero VAD
            try {
              if (session.isAISpeaking || session.inFeedbackMode) {
                break;
              } // Ignore audio during AI speech/feedback

              const pcmData = Buffer.from(msg.audio, 'base64');
              // Copy to aligned ArrayBuffer — Buffer pool can give odd byteOffset
              // which causes Int16Array to throw RangeError
              const alignedBuffer = pcmData.buffer.slice(
                pcmData.byteOffset,
                pcmData.byteOffset + pcmData.byteLength
              );
              const int16Array = new Int16Array(alignedBuffer);

              // Diagnostic: log first chunk details
              if (!session._chunkCount) {
                session._chunkCount = 0;
                const samples = int16Array.slice(0, 10);
                console.log(
                  `[VAD] First chunk: ${int16Array.length} samples, first 10: [${Array.from(samples)}]`
                );
              }
              session._chunkCount++;

              await session.vad.processChunk(int16Array);
            } catch (error) {
              console.error('[VAD] Chunk processing error:', error.message);
            }
            break;

          case 'whisper_audio':
            // Handle Whisper API transcription for browsers without Web Speech API
            try {
              const audioBuffer = Buffer.from(msg.audio, 'base64');
              const audioFormat = msg.format || 'webm'; // Support WAV from Silero VAD
              const t1 = Date.now();

              // Transcribe using OpenAI service
              const transcriptionText = await openaiService.transcribeAudio(
                audioBuffer,
                msg.sessionId,
                audioFormat
              );

              const t2 = Date.now();
              console.log('[WHISPER STT] ' + transcriptionText);
              console.log(`[TIMING] Whisper: ${t2 - t1}ms`);

              // Filter noise transcripts (important for VAD mode)
              if (isNoiseTranscript(transcriptionText)) {
                console.log('[WHISPER] Filtered as noise, not sending to frontend');
                break;
              }

              // Send transcript back to frontend
              ws.send(
                JSON.stringify({
                  type: 'whisper_transcript',
                  text: transcriptionText
                })
              );
            } catch (error) {
              console.error('[WHISPER ERROR]', error.message);
              ws.send(JSON.stringify({ type: 'error', message: 'Transcription failed' }));
            }
            break;

          case 'user_transcript':
            console.log('[USER] ' + sanitizeForLog(msg.text));
            session.history.push({ role: 'user', content: msg.text });
            await streamResponseToClient(session, ws, session.history);
            break;

          case 'user_speaking':
            if (session.isAISpeaking) {
              session.isAISpeaking = false;
              ws.send(JSON.stringify({ type: 'interrupt' }));
            }
            break;

          case 'ai_finished':
            session.isAISpeaking = false;

            // Auto-continue feedback if we're in feedback mode (using separate feedbackHistory)
            if (session.inFeedbackMode && session.feedbackHistory) {
              if (session.feedbackCount < 6) {
                // Continue to next feedback section
                session.feedbackCount++;
                console.log(
                  `[FEEDBACK] Auto-continuing feedback section (${session.feedbackCount}/6)`
                );

                // Notify frontend that we're preparing next chunk
                ws.send(
                  JSON.stringify({
                    type: 'feedback_processing'
                  })
                );

                setTimeout(async () => {
                  if (ws.readyState !== WebSocket.OPEN || !sessions.has(sessionId)) {
                    return;
                  }
                  try {
                    session.feedbackHistory.push({ role: 'user', content: 'continue' });

                    const t1 = Date.now();
                    const responseText = await callGPT4oMini(session.feedbackHistory, {
                      max_tokens: 200
                    });
                    const t2 = Date.now();
                    console.log('[FEEDBACK] ' + responseText);
                    console.log(`[TIMING] Feedback GPT: ${t2 - t1}ms`);
                    session.feedbackHistory.push({ role: 'assistant', content: responseText });

                    const ssmlText = buildNaturalSSML(responseText);
                    const t3 = Date.now();
                    const audioBuffer = await googleTTS(ssmlText, session.voice);
                    const t4 = Date.now();
                    console.log(`[TIMING] Feedback TTS: ${t4 - t3}ms, Total: ${t4 - t1}ms`);

                    session.isAISpeaking = true;
                    ws.send(
                      JSON.stringify({
                        type: 'feedback_response',
                        text: responseText,
                        audio: audioBuffer.toString('base64'),
                        section: session.feedbackCount,
                        totalSections: 6
                      })
                    );
                  } catch (error) {
                    console.error('[FEEDBACK AUTO-CONTINUE ERROR]', error.message);
                    try {
                      ws.send(
                        JSON.stringify({
                          type: 'error',
                          message: 'Feedback generation failed. Please try again.'
                        })
                      );
                    } catch (sendErr) {
                      /* ws may be closed */
                    }
                    session.inFeedbackMode = false;
                    session.feedbackCount = 0;
                  }
                }, 300);
              } else if (session.feedbackCount === 6) {
                // All 6 spoken sections delivered - now generate JSON summary
                console.log('[FEEDBACK] All sections delivered, generating JSON summary');
                try {
                  const jsonTemplatePath = path.join(
                    __dirname,
                    'prompts/system/feedback_json_template.txt'
                  );
                  const jsonTemplatePrompt = fs.readFileSync(jsonTemplatePath, 'utf8');

                  session.feedbackHistory.push({ role: 'user', content: jsonTemplatePrompt });

                  const t1 = Date.now();
                  const feedbackText = await callGPT4oMini(session.feedbackHistory, {
                    max_tokens: 500
                  });
                  const t2 = Date.now();
                  console.log('[FEEDBACK] JSON response:', feedbackText);
                  console.log(`[TIMING] Feedback JSON GPT: ${t2 - t1}ms`);

                  // Parse JSON from response (with fallback)
                  let feedback;
                  try {
                    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      feedback = JSON.parse(jsonMatch[0]);
                    } else {
                      throw new Error('No JSON found in response');
                    }
                  } catch (parseError) {
                    console.warn(
                      '[FEEDBACK] JSON parse failed, using fallback:',
                      parseError.message
                    );
                    feedback = {
                      score: 3,
                      overallImpression: 'Unable to parse detailed feedback',
                      clinicalKnowledge: {
                        diagnosis: 'See spoken feedback',
                        management: 'See spoken feedback'
                      },
                      strengths: ['See spoken feedback above'],
                      improvements: ['Please try again for detailed report'],
                      summary: feedbackText.substring(0, 500)
                    };
                  }

                  ws.send(
                    JSON.stringify({
                      type: 'feedback_summary',
                      feedback: feedback
                    })
                  );
                  console.log('[FEEDBACK] Summary sent');
                  session.inFeedbackMode = false;
                } catch (error) {
                  console.error('[FEEDBACK JSON ERROR]', error.message);
                  ws.send(
                    JSON.stringify({
                      type: 'feedback_summary',
                      feedback: {
                        score: 3,
                        overallImpression: 'Session completed',
                        clinicalKnowledge: {
                          diagnosis: 'Feedback generation error',
                          management: 'Feedback generation error'
                        },
                        strengths: ['Session completed'],
                        improvements: ['Feedback generation encountered an error'],
                        summary: 'Unable to generate detailed feedback. Please try again.'
                      }
                    })
                  );
                  session.inFeedbackMode = false;
                }
              }
            }
            break;

          case 'request_feedback':
            // Spawn NEW GPT session with dedicated feedback prompt + full transcript
            console.log('[FEEDBACK] Starting hybrid feedback flow');
            try {
              // 1. Serialize full conversation into transcript
              const transcript = serializeTranscript(session.history);
              console.log('[FEEDBACK] Transcript length:', transcript.length, 'chars');

              // 2. Load the appropriate feedback prompt
              const feedbackPrompt = loadFeedbackPrompt(session.scenario);

              // 3. Create a NEW conversation history for feedback (separate from interview)
              session.feedbackHistory = [
                { role: 'system', content: feedbackPrompt },
                { role: 'user', content: 'Here is the interview transcript:\n\n' + transcript }
              ];

              // 4. Call GPT for first feedback section
              const t1 = Date.now();
              const responseText = await callGPT4oMini(session.feedbackHistory, {
                max_tokens: 200
              });
              const t2 = Date.now();
              console.log('[FEEDBACK] Section 1: ' + responseText);
              console.log(`[TIMING] Feedback GPT: ${t2 - t1}ms`);
              session.feedbackHistory.push({ role: 'assistant', content: responseText });

              // 5. Generate TTS audio
              const ssmlText = buildNaturalSSML(responseText);
              const t3 = Date.now();
              const audioBuffer = await googleTTS(ssmlText, session.voice);
              const t4 = Date.now();
              console.log(`[TIMING] Feedback TTS: ${t4 - t3}ms, Total: ${t4 - t1}ms`);

              // 6. Send as feedback_response (new message type)
              session.isAISpeaking = true;
              session.inFeedbackMode = true;
              session.feedbackCount = 1;

              ws.send(
                JSON.stringify({
                  type: 'feedback_response',
                  text: responseText,
                  audio: audioBuffer.toString('base64'),
                  section: 1,
                  totalSections: 6
                })
              );
              console.log('[FEEDBACK] Section 1 sent');
            } catch (error) {
              console.error('[FEEDBACK ERROR]', error.message);
              ws.send(
                JSON.stringify({
                  type: 'feedback_summary',
                  feedback: {
                    score: 3,
                    overallImpression: 'Session completed',
                    clinicalKnowledge: {
                      diagnosis: 'Feedback generation error',
                      management: 'Feedback generation error'
                    },
                    strengths: ['Session completed'],
                    improvements: ['Feedback generation encountered an error'],
                    summary: 'Unable to generate detailed feedback. Please try again.'
                  }
                })
              );
            }
            break;
        }
      } catch (error) {
        console.error('[ERROR]', error.message);
        ws.send(
          JSON.stringify({ type: 'error', message: 'An error occurred processing your request' })
        );
      }
    });

    ws.on('close', () => {
      const session = sessions.get(sessionId);
      if (session?.vad) {
        session.vad.destroy();
      }
      sessions.delete(sessionId);
      wsRateLimiter.removeClient(sessionId);
      console.log(`[CLIENT] Disconnected: ${sessionId}`);
    });
  })();
});

// ============================================================================
// EXPRESS HTTP SERVER (for Stripe webhooks and REST endpoints)
// Express app created at top of file and shared with WebSocket via http.createServer
// ============================================================================

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Enable CORS for frontend
app.use(
  cors({
    origin: config.FRONTEND_URL || (config.isProduction ? false : '*'),
    methods: ['POST', 'GET', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'stripe-signature']
  })
);

// Security headers (helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://js.stripe.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'wss://*.onrender.com',
          'https://api.stripe.com'
        ],
        frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// HTTPS enforcement in production
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (config.isProduction && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: { error: 'Too many payment requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests. Please slow down.' }
});

// Apply rate limiters
app.use('/create-checkout-session', paymentLimiter);
app.use('/create-portal-session', paymentLimiter);
app.use('/stripe-webhook', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prompt Lab routes (text-only prompt testing environment)
if (process.env.PROMPT_LAB_ENABLED === 'true' || !config.isProduction) {
  const promptLabRoutes = require('./src/routes/promptLab');
  app.use('/prompt-lab/api', express.json(), promptLabRoutes);
  console.log('[PROMPT LAB] Routes enabled at /prompt-lab/api');
}

// Stripe webhook endpoint (must use raw body)
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(503).json({ error: 'Payment processing not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).send('Webhook processing failed');
  }

  console.log('[STRIPE WEBHOOK] Event received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const priceType = session.metadata?.priceType || 'monthly';
        const specialty = session.metadata?.specialty || 'plastic-surgery';

        if (userId) {
          // Use upsert to create or update the subscription record
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              price_type: priceType,
              specialty: specialty,
              created_at: new Date().toISOString()
            },
            {
              onConflict: 'user_id'
            }
          );

          console.log('[STRIPE] Subscription activated for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'active' : 'past_due';

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('[STRIPE] Subscription updated:', subscription.id, status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);

        console.log('[STRIPE] Subscription cancelled:', subscription.id);
        break;
      }
    }
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error processing event:', error);
  }

  res.json({ received: true });
});

// Create Stripe checkout session with input validation
app.post(
  '/create-checkout-session',
  express.json(),
  [
    body('userId').isString().isLength({ min: 1, max: 100 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('priceType').optional().isIn(['monthly', 'annual']),
    body('specialty').optional().isString().isLength({ max: 50 }).trim().escape()
  ],
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[STRIPE] Validation errors:', errors.array());
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    try {
      const { userId, email, priceType = 'monthly', specialty = 'plastic-surgery' } = req.body;

      // Select price ID based on plan type
      const priceId =
        priceType === 'annual' ? config.STRIPE_PRICE_ID_ANNUAL : config.STRIPE_PRICE_ID_MONTHLY;

      // Verify price ID is configured
      if (!priceId) {
        console.error('[STRIPE] Price ID not configured for:', priceType);
        return res.status(500).json({ error: 'Payment configuration error' });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${config.FRONTEND_URL}?payment=success`,
        cancel_url: `${config.FRONTEND_URL}?payment=cancelled`,
        metadata: { userId, priceType, specialty }
      });

      console.log(
        '[STRIPE] Checkout session created for:',
        email,
        'plan:',
        priceType,
        'specialty:',
        specialty
      );
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create Stripe customer portal session with input validation
app.post(
  '/create-portal-session',
  express.json(),
  [body('customerId').isString().isLength({ min: 1, max: 100 }).trim().escape()],
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[STRIPE] Portal validation errors:', errors.array());
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    try {
      const { customerId } = req.body;

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${config.FRONTEND_URL}?page=profile`
      });

      console.log('[STRIPE] Portal session created for customer:', customerId);
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }
);

// Start shared HTTP + WebSocket server on single port
if (config.NODE_ENV !== 'test') {
  server.listen(config.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${config.PORT} (HTTP + WebSocket)`);
  });
}

console.log('\nServer ready\n');
