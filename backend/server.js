// Load configuration first (handles env vars, validation, and Google Cloud credentials)
const config = require('./src/config');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import services
const openaiService = require('./src/services/OpenAIService');
const ttsService = require('./src/services/TTSService');
const { isNoiseTranscript, buildNaturalSSML } = require('./src/utils/audioHelpers');

// Import security middleware
const {
  generateSecureSessionId,
  WebSocketRateLimiter,
  validateMessage,
  sanitizeForLog
} = require('./src/middleware/websocketSecurity');

// Initialize WebSocket rate limiter
const wsRateLimiter = new WebSocketRateLimiter({
  windowMs: 60000,       // 1 minute window
  maxMessages: 60,       // 60 messages per minute
  maxAudioPerMinute: 10  // 10 audio uploads per minute
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

console.log('API clients initialized');

const sessions = new Map();

// Use secure session ID generation from middleware
// (keeping function name for backwards compatibility)

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
    return 'You are a Plastic Surgery ST3 interview examiner. Conduct a professional interview.';
  }
}

// Wrapper functions that use the services (for backwards compatibility with existing code flow)
async function callGPT4oMini(history) {
  return openaiService.generateResponse(history);
}

async function googleTTS(text, voiceName) {
  return ttsService.synthesize(text, voiceName);
}

const wss = new WebSocket.Server({
  port: config.PORT,
  host: '0.0.0.0' // Bind to all network interfaces for production deployment
});

console.log('WebSocket server running on port ' + config.PORT);

wss.on('connection', (ws, req) => {
  console.log('\n[CLIENT] New client connected');

  const queryParams = url.parse(req.url, true).query;
  const scenarioFile = queryParams.scenario || 'template.txt';
  const difficulty = queryParams.difficulty || null;
  const voice = queryParams.voice || config.TTS_VOICE;
  console.log('[CLIENT] Requested scenario: ' + scenarioFile + (difficulty ? ' (difficulty: ' + difficulty + ')' : '') + (voice ? ' (voice: ' + voice + ')' : ''));

  const scenarioPrompt = loadScenarioPrompt(scenarioFile, difficulty);
  const sessionId = generateSecureSessionId();

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
      const messageType = msg.type === 'whisper_audio' ? 'audio' : 'other';
      const rateCheck = wsRateLimiter.checkLimit(msg.sessionId, messageType);
      if (!rateCheck.allowed) {
        console.warn(`[SECURITY] Rate limit exceeded for session ${msg.sessionId}: ${rateCheck.reason}`);
        ws.send(JSON.stringify({ type: 'error', message: rateCheck.reason }));
        return;
      }

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

            // Transcribe using OpenAI service
            const transcriptionText = await openaiService.transcribeAudio(audioBuffer, msg.sessionId);

            const t2 = Date.now();
            console.log('[WHISPER STT] ' + transcriptionText);
            console.log(`[TIMING] Whisper: ${t2 - t1}ms`);

            // Filter out noise transcripts before sending
            if (isNoiseTranscript(transcriptionText)) {
              console.log('[WHISPER] Filtered noise transcript, not sending to frontend');
              return; // Don't send noise to frontend
            }

            // Send transcript back to frontend
            ws.send(JSON.stringify({
              type: 'whisper_transcript',
              text: transcriptionText
            }));
          } catch (error) {
            console.error('[WHISPER ERROR]', error.message);
            ws.send(JSON.stringify({ type: 'error', message: 'Transcription failed' }));
          }
          break;

        case 'user_transcript':
          console.log('[USER] ' + sanitizeForLog(msg.text));
          session.history.push({ role: 'user', content: msg.text });

          const t1 = Date.now();
          const responseText = await callGPT4oMini(session.history);
          const t2 = Date.now();
          console.log('[AI] ' + responseText);
          console.log(`[TIMING] GPT: ${t2 - t1}ms`);
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
          console.log(`[TIMING] TTS: ${t4 - t3}ms, Total: ${t4 - t1}ms`);

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
                console.log(`[TIMING] GPT: ${t2 - t1}ms`);
                session.history.push({ role: 'assistant', content: responseText });

                const ssmlText = buildNaturalSSML(responseText);
                const t3 = Date.now();
                const audioBuffer = await googleTTS(ssmlText, session.voice);
                const t4 = Date.now();
                console.log(`[TIMING] TTS: ${t4 - t3}ms, Total: ${t4 - t1}ms`);

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
    wsRateLimiter.removeClient(sessionId);
    console.log(`[CLIENT] Disconnected: ${sessionId}`);
  });
});

// ============================================================================
// EXPRESS HTTP SERVER (for Stripe webhooks and REST endpoints)
// ============================================================================

const app = express();

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Enable CORS for frontend
app.use(cors({
  origin: config.FRONTEND_URL || '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'stripe-signature']
}));

// Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.onrender.com', 'https://api.stripe.com'],
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
}));

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

// Stripe webhook endpoint (must use raw body)
app.post('/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !supabaseAdmin) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[STRIPE WEBHOOK] Event received:', event.type);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const customerId = session.customer;
          const subscriptionId = session.subscription;

          if (userId) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active'
              })
              .eq('user_id', userId);

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
  }
);

// Create Stripe checkout session with input validation
app.post('/create-checkout-session',
  express.json(),
  [
    body('userId').isString().isLength({ min: 1, max: 100 }).trim().escape(),
    body('email').isEmail().normalizeEmail()
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
      const { userId, email } = req.body;

      // Verify STRIPE_PRICE_ID is configured
      if (!config.STRIPE_PRICE_ID) {
        console.error('[STRIPE] STRIPE_PRICE_ID not configured');
        return res.status(500).json({ error: 'Payment configuration error' });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        line_items: [{
          price: config.STRIPE_PRICE_ID,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${config.FRONTEND_URL}?payment=success`,
        cancel_url: `${config.FRONTEND_URL}?payment=cancelled`,
        metadata: { userId }
      });

      console.log('[STRIPE] Checkout session created for:', email);
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create Stripe customer portal session with input validation
app.post('/create-portal-session',
  express.json(),
  [
    body('customerId').isString().isLength({ min: 1, max: 100 }).trim().escape()
  ],
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

// Start HTTP server (only if we're not in a serverless environment)
if (config.NODE_ENV !== 'test') {
  app.listen(config.HTTP_PORT, '0.0.0.0', () => {
    console.log(`HTTP server running on port ${config.HTTP_PORT}`);
  });
}

console.log('\nServer ready\n');
