require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const url = require('url');
const OpenAI = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');

// Handle Google Cloud credentials for production deployment
// In production, credentials are passed as a JSON string via environment variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credsPath = '/tmp/credentials.json';
  fs.writeFileSync(credsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
  console.log('[GOOGLE CLOUD] Using credentials from environment variable');
}

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PROMPTS_DIR = path.join(__dirname, 'prompts');

// TTS Voice Configuration - Change this single line to switch voices
const TTS_VOICE = 'en-GB-Neural2-D';  // Options: Neural2-D (fast), Wavenet-D (natural), Studio-D (premium)

if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const ttsClient = new textToSpeech.TextToSpeechClient();

console.log('API clients initialized');

const sessions = new Map();

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function loadScenarioPrompt(scenarioFile) {
  try {
    // The scenarioFile now includes the full path from prompts/ directory
    // e.g., "prompts/digital_amputation/easy_digital_amputation_1.txt"
    const filePath = path.join(__dirname, scenarioFile);

    // Security check: ensure the file is within the backend directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(__dirname)) {
      throw new Error('Invalid scenario file path');
    }

    if (!fs.existsSync(filePath)) {
      console.warn('[SCENARIO] File not found: ' + scenarioFile);
      // Try fallback to a default scenario in the old structure
      const fallbackPath = path.join(__dirname, 'scenarios', 'template.txt');
      if (fs.existsSync(fallbackPath)) {
        console.warn('[SCENARIO] Using fallback template.txt');
        return fs.readFileSync(fallbackPath, 'utf8');
      }
      throw new Error('Scenario file not found and no fallback available');
    }

    const prompt = fs.readFileSync(filePath, 'utf8');
    console.log('[SCENARIO] Loaded prompt from: ' + scenarioFile);
    return prompt;
  } catch (error) {
    console.error('[SCENARIO] Error loading prompt: ' + error.message);
    // Return a basic template as last resort
    return `You are a Plastic Surgery ST3 interview examiner. Conduct a professional interview.`;
  }
}

function buildNaturalSSML(text) {
  // Minimal SSML - only natural pauses, no artificial emphasis
  let ssml = text;

  // Add natural pauses using strength levels
  ssml = ssml.replace(/\.\s+/g, '.<break strength="medium"/> ');
  ssml = ssml.replace(/\?\s+/g, '?<break strength="medium"/> ');
  ssml = ssml.replace(/,\s+/g, ',<break strength="weak"/> ');

  // Wrap in speak tags
  return `<speak>${ssml}</speak>`;
}

async function callGPT4oMini(history) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: history,
      temperature: 0.7,
      max_tokens: 150  // Keep responses concise for conversational flow
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('[GPT-4o-mini] Error:', error.message);
    throw error;
  }
}

async function googleTTS(text, voiceName) {
  voiceName = voiceName || TTS_VOICE;
  console.log('[TTS] Using voice: ' + voiceName);

  // Determine gender based on voice name (Female voices: Aoede, Kore, Leda, Zephyr)
  const femaleVoices = ['Aoede', 'Kore', 'Leda', 'Zephyr', '-F'];
  const gender = femaleVoices.some(v => voiceName.includes(v)) ? 'FEMALE' : 'MALE';

  // Use default speaking rate for all voices
  let speakingRate = 1.0;

  try {
    const request = {
      input: { ssml: text },
      voice: {
        languageCode: 'en-GB',
        name: voiceName,
        ssmlGender: gender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speakingRate,
        volumeGainDb: 0.0
      }
    };
    const response = await ttsClient.synthesizeSpeech(request);
    return response[0].audioContent;
  } catch (error) {
    console.error('[Google TTS] Error:', error.message);
    throw error;
  }
}

const wss = new WebSocket.Server({
  port: PORT,
  host: '0.0.0.0' // Bind to all network interfaces for production deployment
});

console.log('WebSocket server running on port ' + PORT);

wss.on('connection', (ws, req) => {
  console.log('\n[CLIENT] New client connected');

  const queryParams = url.parse(req.url, true).query;
  const scenarioFile = queryParams.scenario || 'template.txt';
  const difficulty = queryParams.difficulty || null;
  const voice = queryParams.voice || TTS_VOICE;
  console.log('[CLIENT] Requested scenario: ' + scenarioFile + (difficulty ? ' (difficulty: ' + difficulty + ')' : '') + (voice ? ' (voice: ' + voice + ')' : ''));

  const scenarioPrompt = loadScenarioPrompt(scenarioFile, difficulty);
  const sessionId = generateSessionId();

  sessions.set(sessionId, {
    history: [{ role: 'system', content: scenarioPrompt }],
    ws: ws,
    scenario: scenarioFile,
    voice: voice,
    isAISpeaking: false,
    inFeedbackMode: false,
    feedbackCount: 0
  });

  ws.send(JSON.stringify({
    type: 'scenario_loaded',
    sessionId: sessionId,
    scenario: scenarioFile
  }));

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      const session = sessions.get(msg.sessionId);

      if (!session) {
        ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
        return;
      }

      switch (msg.type) {
        case 'whisper_audio':
          // Handle Whisper API transcription for browsers without Web Speech API
          try {
            const audioBuffer = Buffer.from(msg.audio, 'base64');
            const t1 = Date.now();

            // Write audio to temporary file for Whisper API
            const tempFilePath = path.join(__dirname, `temp_audio_${sessionId}.webm`);
            fs.writeFileSync(tempFilePath, audioBuffer);

            // Transcribe using Whisper API
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(tempFilePath),
              model: 'whisper-1',
              language: 'en'
            });

            // Clean up temp file
            fs.unlinkSync(tempFilePath);

            const t2 = Date.now();
            console.log('[WHISPER STT] ' + transcription.text);
            console.log(`[TIMING] Whisper: ${t2-t1}ms`);

            // Send transcript back to frontend
            ws.send(JSON.stringify({
              type: 'whisper_transcript',
              text: transcription.text
            }));
          } catch (error) {
            console.error('[WHISPER ERROR]', error.message);
            ws.send(JSON.stringify({ type: 'error', message: 'Transcription failed' }));
          }
          break;

        case 'user_transcript':
          console.log('[USER] ' + msg.text);
          session.history.push({ role: 'user', content: msg.text });

          const t1 = Date.now();
          const responseText = await callGPT4oMini(session.history);
          const t2 = Date.now();
          console.log('[AI] ' + responseText);
          console.log(`[TIMING] GPT: ${t2-t1}ms`);
          session.history.push({ role: 'assistant', content: responseText });

          // Detect if we've entered feedback mode
          if (responseText.toLowerCase().includes('feedback') ||
              responseText.toLowerCase().includes('concludes the scenario')) {
            session.inFeedbackMode = true;
            session.feedbackCount = 0;
            console.log('[FEEDBACK] Feedback mode activated');
          }

          const ssmlText = buildNaturalSSML(responseText);
          const t3 = Date.now();
          const audioBuffer = await googleTTS(ssmlText, session.voice);
          const t4 = Date.now();
          console.log(`[TIMING] TTS: ${t4-t3}ms, Total: ${t4-t1}ms`);

          session.isAISpeaking = true;
          ws.send(JSON.stringify({
            type: 'ai_response',
            text: responseText,
            audio: audioBuffer.toString('base64')
          }));
          break;

        case 'user_speaking':
          if (session.isAISpeaking) {
            session.isAISpeaking = false;
            ws.send(JSON.stringify({ type: 'interrupt' }));
          }
          break;

        case 'ai_finished':
          session.isAISpeaking = false;

          // Auto-continue feedback if we're in feedback mode
          if (session.inFeedbackMode && session.feedbackCount < 6) {
            session.feedbackCount++;
            console.log(`[FEEDBACK] Auto-continuing feedback (${session.feedbackCount}/6)`);

            // Notify frontend that we're preparing next chunk
            ws.send(JSON.stringify({
              type: 'feedback_processing'
            }));

            // Wait a brief moment, then trigger next feedback chunk
            setTimeout(async () => {
              try {
                session.history.push({ role: 'user', content: 'continue' });

                const t1 = Date.now();
                const responseText = await callGPT4oMini(session.history);
                const t2 = Date.now();
                console.log('[AI] ' + responseText);
                console.log(`[TIMING] GPT: ${t2-t1}ms`);
                session.history.push({ role: 'assistant', content: responseText });

                const ssmlText = buildNaturalSSML(responseText);
                const t3 = Date.now();
                const audioBuffer = await googleTTS(ssmlText, session.voice);
                const t4 = Date.now();
                console.log(`[TIMING] TTS: ${t4-t3}ms, Total: ${t4-t1}ms`);

                session.isAISpeaking = true;
                ws.send(JSON.stringify({
                  type: 'ai_response',
                  text: responseText,
                  audio: audioBuffer.toString('base64')
                }));
              } catch (error) {
                console.error('[FEEDBACK AUTO-CONTINUE ERROR]', error.message);
              }
            }, 300); // Reduced from 500ms to 300ms for faster transitions
          } else if (session.inFeedbackMode && session.feedbackCount >= 6) {
            console.log('[FEEDBACK] Feedback complete');
            session.inFeedbackMode = false;
          }
          break;
      }
    } catch (error) {
      console.error('[ERROR]', error.message);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    sessions.delete(sessionId);
  });
});

console.log('\nServer ready\n');
