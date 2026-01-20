# Implementation Variations from Original Gemini Plan

This document details the implementation approaches taken for each of the 6 optimization steps, highlighting variations from Gemini's original recommendations and the reasoning behind these decisions.

---

## Step 1: Environment Optimization ✅ COMPLETED

### Gemini's Original Plan
- Set up development environment with hot reloading
- Configure debugging tools
- Add testing framework

### Actual Implementation

#### 1.1 VS Code Debugging Configuration
**Approach:** Created comprehensive `.vscode/launch.json` with multiple debug configurations.

**Configurations Added:**
- `Backend: Debug WebSocket Server` - Debug main server with breakpoints
- `Backend: Debug with Nodemon` - Debug with auto-restart on file changes
- `Backend: Debug Jest Tests` - Debug unit tests
- `Frontend: Launch Chrome with Debugger` - Debug frontend in Chrome
- `Full Stack: Backend + Frontend` - Debug both simultaneously

**Rationale:** VS Code's built-in debugger is more powerful than console.log debugging and requires no additional dependencies.

#### 1.2 Testing Framework
**Approach:** Jest with 51 unit tests and 70% coverage thresholds.

**Test Files Created:**
```
backend/__tests__/
├── scenario-loader.test.js  # Scenario loading & path security
├── server.test.js           # WebSocket message handling
├── vad-logic.test.js        # Voice activity detection
├── gpt-integration.test.js  # GPT-4o-mini integration
└── tts-integration.test.js  # Google TTS integration
```

**Scripts Added to package.json:**
```json
{
  "test": "jest --coverage",
  "test:watch": "jest --watch"
}
```

#### 1.3 Code Quality Tools
**Approach:** ESLint + Prettier for consistent code style.

**Scripts Added:**
```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write ."
}
```

### Variation from Gemini's Plan
- **More comprehensive:** Added multiple debug configurations instead of just basic setup
- **Coverage thresholds:** Enforced 70% minimum coverage (Gemini didn't specify thresholds)
- **Full Stack debugging:** Added compound configuration for simultaneous frontend/backend debugging

---

## Step 2: Backend Scalability ✅ COMPLETED

### Gemini's Original Plan
- Refactor server.js into modular components
- Separate concerns (routes, services, utilities)
- Add dependency injection for testability

### Actual Implementation

#### 2.1 Modular Backend Structure
**Approach:** Created `backend/src/` directory with organized modules.

**Structure Created:**
```
backend/src/
├── config/
│   └── index.js           # Environment configuration
├── services/
│   ├── gpt.js             # GPT-4o-mini integration
│   ├── tts.js             # Google Cloud TTS
│   └── scenario-loader.js # Scenario file loading
├── utils/
│   ├── noise-filter.js    # Transcript noise filtering
│   └── ssml-builder.js    # SSML processing for natural speech
└── websocket/
    └── handlers.js        # WebSocket message handlers
```

#### 2.2 Configuration Management
**Approach:** Centralized environment configuration with validation.

**File:** `backend/src/config/index.js`
```javascript
module.exports = {
  port: process.env.PORT || 8080,
  httpPort: process.env.HTTP_PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  // ... validation and defaults
};
```

#### 2.3 Service Layer
**Approach:** Extracted GPT and TTS logic into reusable services.

**Key Services:**
- `gpt.js` - Wraps OpenAI API calls with error handling
- `tts.js` - Handles Google Cloud TTS with SSML support
- `scenario-loader.js` - Loads prompts with path traversal protection

### Variation from Gemini's Plan
- **Kept server.js as main entry:** Rather than completely restructuring, we kept server.js functional while extracting reusable modules
- **No dependency injection framework:** Used simple module imports instead of a DI container (simpler, no added dependencies)
- **Gradual migration:** Old server.js still works alongside new modular structure for safety

---

## Step 3: Frontend Modernization ✅ COMPLETED

### Gemini's Original Plan
- Convert to ES6 modules
- Set up bundler (Webpack/Vite)
- Component-based architecture
- State management library

### Actual Implementation

#### 3.1 File Organization (No Bundler)
**Approach:** Plain `<script>` tags with organized file structure instead of ES6 modules.

**Rationale:**
- No build step required
- Simpler deployment (static files only)
- Easier debugging (no source maps needed)
- Faster development iteration

**Structure Created:**
```
frontend/
├── index.html              # 709 lines (modular version)
├── config.js               # Environment configuration
├── styles/
│   └── main.css            # 3,657 lines (extracted CSS)
└── js/
    ├── state.js            # Global state variables (LOAD FIRST)
    ├── auth.js             # Supabase authentication
    ├── subscription.js     # Stripe payments
    ├── tracking.js         # Session history
    ├── ui-helpers.js       # Status updates, orb animations
    ├── speech.js           # SpeechRecognitionManager classes
    ├── session.js          # AudioPlayer, V4Session classes
    ├── scenarios.js        # Scenario selection, navigation
    └── app.js              # Event listeners, init (LOAD LAST)
```

#### 3.2 State Management
**Approach:** Centralized global state in `state.js` instead of state management library.

**File:** `frontend/js/state.js`
```javascript
// Global state - must be loaded first
let session = null;
let currentScenario = { category: '', title: '', promptFile: 'template.txt', imageFile: null };
let supabaseClient = null;
let currentUser = null;
let userProfile = null;
let userSubscription = null;
// ... etc
```

**Rationale:**
- No additional library dependency
- Simple and sufficient for current needs
- Easy to understand and debug
- Can migrate to proper state management later if needed

#### 3.3 CSS Extraction
**Approach:** Extracted all inline CSS to single external file.

**Before:** 4,354 lines in index.html (3,675 CSS + 680 HTML)
**After:** 709 lines in index.html + 3,657 lines in main.css

#### 3.4 Script Load Order
**Critical:** Order matters because files depend on each other.

```html
<!-- Load order in index.html -->
<script src="config.js"></script>      <!-- Environment config -->
<script src="js/state.js"></script>    <!-- Global state (FIRST) -->
<script src="js/auth.js"></script>     <!-- Auth functions -->
<script src="js/subscription.js"></script>
<script src="js/tracking.js"></script>
<script src="js/ui-helpers.js"></script>
<script src="js/speech.js"></script>
<script src="js/session.js"></script>
<script src="js/scenarios.js"></script>
<script src="js/app.js"></script>      <!-- Init & events (LAST) -->
```

#### 3.5 Preserved Rollback Files
**Approach:** Renamed original files instead of deleting.

- `index-monolithic.html` - Original 4,354 line HTML
- `index-monolithic.js` - Original 2,684 line JS

### Major Variations from Gemini's Plan
| Gemini's Recommendation | Our Approach | Reason |
|------------------------|--------------|--------|
| ES6 modules | Plain `<script>` tags | No bundler needed, simpler deployment |
| Webpack/Vite bundler | No bundler | Avoid build complexity, faster iteration |
| Component library (React/Vue) | Vanilla JS with organized files | Maintain simplicity, no framework lock-in |
| State management library | Centralized `state.js` | Sufficient for current needs, no dependency |

---

## Step 4: Security Hardening ✅ COMPLETED

### Gemini's Original Plan
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Environment variable security
- WebSocket authentication

### Actual Implementation

#### 4.1 WebSocket Security Middleware
**Created:** `backend/src/middleware/websocketSecurity.js`

**Features Implemented:**
- **Secure Session ID Generation** - Uses `crypto.randomUUID()` instead of `Math.random()`
- **Message Schema Validation** - Validates all incoming WebSocket messages against defined schemas
- **Rate Limiting** - 60 messages/minute general, 10 audio uploads/minute
- **Payload Size Limits** - 10KB for text, 5MB for audio
- **Log Sanitization** - Removes control characters, truncates long content

```javascript
// Session ID now cryptographically secure
function generateSecureSessionId() {
  const randomPart = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  return `session_${randomPart}_${timestamp}`;
}

// Message validation with schemas
const MESSAGE_SCHEMAS = {
  user_transcript: {
    required: ['sessionId', 'text'],
    sessionId: { type: 'string', maxLength: 100 },
    text: { type: 'string', maxLength: 10000 }
  },
  whisper_audio: {
    required: ['sessionId', 'audio'],
    sessionId: { type: 'string', maxLength: 100 },
    audio: { type: 'string', maxLength: 5 * 1024 * 1024 } // 5MB
  },
  // ... other message types
};
```

#### 4.2 Rate Limiting Implementation
**Approach:** In-memory rate limiter with separate tracking for audio vs. other messages.

```javascript
class WebSocketRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;      // 1 minute
    this.maxMessages = options.maxMessages || 60;    // 60 messages
    this.maxAudioPerMinute = options.maxAudioPerMinute || 10;
    this.clients = new Map();
  }
  // Auto-cleanup of stale entries every 5 minutes
}
```

#### 4.3 Already Existing Security (Verified)
- ✅ **Helmet.js** - CSP, HSTS, X-Frame-Options, noSniff
- ✅ **CORS** - Configured for frontend URL
- ✅ **HTTP Rate Limiting** - Payment endpoints (10/15min)
- ✅ **Input Validation** - express-validator on Stripe endpoints
- ✅ **Path Traversal Protection** - `loadScenarioPrompt()` validates paths
- ✅ **Stripe Webhook Verification** - Signature validation

#### 4.4 Test Coverage
**Created:** `backend/__tests__/websocketSecurity.test.js` - 25 tests covering:
- Secure session ID generation
- Rate limiter functionality
- Message validation schemas
- Log sanitization

### Variation from Gemini's Plan
| Gemini's Recommendation | Our Approach | Reason |
|------------------------|--------------|--------|
| JWT WebSocket auth | Session-based with secure IDs | Sufficient for current needs, simpler |
| Third-party rate limiter | Custom in-memory implementation | No dependency, tailored to WebSocket |
| Full input sanitization | Schema validation + size limits | Prevents DoS and injection attacks |

---

## Step 5: VAD Optimization ✅ COMPLETED

### Gemini's Original Plan
- Improve Voice Activity Detection accuracy
- Reduce false positives from ambient noise
- Better handling of AI audio echo

### Actual Implementation

#### 5.1 Adaptive Noise Floor Calibration
**Added to:** `frontend/js/speech.js` (WhisperRecognitionManager)

**How it works:**
1. On session start, collects 30 frames (~500ms) of ambient audio
2. Calculates 25th percentile of RMS values as noise floor baseline
3. Continuously adapts during quiet periods (slow exponential moving average)
4. Threshold = `noiseFloor × multiplier` (default 2.5x)

```javascript
// Adaptive noise floor calibration
this.noiseFloor = 0.01;              // Initial estimate
this.noiseFloorSamples = [];         // Recent ambient samples
this.noiseFloorWindowSize = 60;      // ~1 second at 60fps
this.noiseFloorMultiplier = 2.5;     // Threshold multiplier
this.isCalibrating = true;           // Initial calibration phase
this.calibrationFrames = 30;         // Frames before calibration complete
```

#### 5.2 Spectral Analysis for Voice Detection
**New feature:** Frequency-based validation to distinguish voice from noise.

**Spectral Centroid Analysis:**
- Calculates "center of mass" of audio spectrum
- Human voice typically has centroid between 200-2000 Hz
- Rejects sounds outside this range (keyboard clicks, door slams, etc.)

**Voice Band Energy Ratio:**
- Measures energy in voice frequency band (85-3000 Hz)
- Compares to total energy across all frequencies
- Requires >50% energy in voice band to pass

```javascript
// Spectral analysis methods
calculateSpectralCentroid(frequencyData) { ... }
calculateVoiceBandEnergy(frequencyData) { ... }
isLikelyVoice(centroid, voiceBandRatio) {
  const centroidInRange = centroid >= 200 && centroid <= 2000;
  const highVoiceBandEnergy = voiceBandRatio > 0.5;
  return centroidInRange && highVoiceBandEnergy;
}
```

#### 5.3 Enhanced Detection Logic
**Combined validation:** Both RMS threshold AND spectral analysis must pass.

```javascript
// Voice detection now requires:
// 1. RMS above adaptive threshold (noise floor × multiplier)
// 2. Spectral centroid in voice range (200-2000 Hz)
// 3. Voice band energy ratio > 50%
// 4. Consecutive frames confirmation (4 normal, 8 during AI speech)

const isAboveThreshold = rms > activeThreshold;
const passesSpectralCheck = !this.useSpectralAnalysis || isVoiceLikeSpectrum;

if (isAboveThreshold && passesSpectralCheck) {
  this.consecutiveVoiceFrames++;
  // ... trigger recording
}
```

#### 5.4 Enhanced Backend Noise Filter
**Updated:** `backend/src/utils/audioHelpers.js`

**New patterns added:**
- Medical interview context (examiner acknowledgments, prompts)
- Whisper hallucinations (`[music]`, `[silence]`, `♪...♪`)
- Transcription artifacts (`(inaudible)`, `...`)

```javascript
// New noise patterns for medical context
/^(right|good|excellent|correct)\.?$/i,  // Examiner acknowledgments
/^(tell me more|what else|anything else)\.?$/i,  // Prompt echoes
/^\[.*\]$/,                      // Bracketed annotations
/^(music|applause|laughter)$/i,  // Sound annotations
/^(inaudible|unintelligible)$/i  // Transcription failures
```

#### 5.5 Configuration Options
**Added to:** `frontend/config.js`

```javascript
SPEECH_RECOGNITION: {
  // Existing options...
  USE_SPECTRAL_ANALYSIS: true,   // Enable frequency-based detection
  NOISE_FLOOR_MULTIPLIER: 2.5,   // Adaptive threshold multiplier
  MIN_VOICE_CENTROID: 200,       // Min centroid for voice (Hz)
  MAX_VOICE_CENTROID: 2000       // Max centroid for voice (Hz)
}
```

### Variation from Gemini's Plan
| Gemini's Recommendation | Our Approach | Reason |
|------------------------|--------------|--------|
| External VAD library | Enhanced native implementation | Lower latency, no dependencies |
| Confidence-based filtering | Spectral analysis + adaptive threshold | More robust, physics-based |
| Fixed thresholds | Adaptive noise floor | Automatically adjusts to environment |

---

## Step 6: Prompt Engineering 🔲 NOT STARTED

### Gemini's Original Plan
- Optimize system prompts for better AI responses
- Add persona consistency
- Improve feedback quality

### Recommended Approach

#### 6.1 Prompt Template Structure
**Recommended:** Standardized prompt structure across all scenarios.

```
# SCENARIO: {name}
# DIFFICULTY: {level}
# CATEGORY: {category}

## ROLE
You are {persona_description}

## CONTEXT
{scenario_context}

## OBJECTIVES
- {objective_1}
- {objective_2}

## CONSTRAINTS
- Keep responses under 3 sentences
- {constraint_2}

## EVALUATION CRITERIA
{how_to_score_candidate}
```

#### 6.2 Difficulty-Based Prompt Modifiers
**Recommended:** Add difficulty-specific instructions.

```javascript
const difficultyModifiers = {
  easy: 'Be encouraging and provide hints if the candidate struggles.',
  medium: 'Maintain professional demeanor. Ask follow-up questions.',
  hard: 'Challenge assumptions. Introduce complications. Time pressure.'
};
```

#### 6.3 Feedback Mode Enhancement
**Current:** Basic feedback after simulation
**Recommended:** Structured feedback with scoring rubric.

```javascript
const feedbackPrompt = `
Provide structured feedback on the candidate's performance:

1. COMMUNICATION (1-5): Clarity, professionalism, structure
2. CLINICAL KNOWLEDGE (1-5): Accuracy, depth, application
3. DECISION MAKING (1-5): Reasoning, prioritization, safety
4. AREAS FOR IMPROVEMENT: Specific, actionable suggestions
5. STRENGTHS: What they did well

Overall Score: X/15
`;
```

### Variation Notes
- **Keep prompts in text files:** Easier to edit without code changes
- **No prompt management system:** Simple file-based approach sufficient
- **Focus on medical interview context:** Optimize for ST3 plastic surgery interviews

---

## Summary of Major Variations

| Step | Gemini's Approach | Our Approach | Rationale |
|------|-------------------|--------------|-----------|
| 1 ✅ | Basic dev tools | Comprehensive VS Code debugging | Better DX without added dependencies |
| 2 ✅ | Full DI refactor | Gradual modularization | Lower risk, easier rollback |
| 3 ✅ | ES6 + Bundler + Framework | Plain scripts + file organization | Simpler, no build step, faster iteration |
| 4 ✅ | Third-party security libs | Custom WebSocket security middleware | Tailored for WebSocket, no dependencies |
| 5 ✅ | External VAD library | Spectral analysis + adaptive noise floor | Physics-based, lower latency |
| 6 🔲 | Prompt management system | Text file templates | Easy editing, no added complexity |

---

## Future Expansion Considerations

The page-based organization in Step 3 specifically supports future multi-specialty expansion:

```
frontend/
├── styles/
│   ├── main.css              # Shared styles
│   ├── plastic-surgery.css   # Specialty-specific
│   ├── cardiothoracic.css    # Future specialty
│   └── neurosurgery.css      # Future specialty
├── js/
│   ├── state.js              # Shared state
│   ├── specialties/
│   │   ├── plastic-surgery.js
│   │   ├── cardiothoracic.js
│   │   └── neurosurgery.js
│   └── ... (shared modules)
└── pages/
    ├── index.html            # Main entry
    ├── plastic-surgery/      # Specialty landing
    ├── cardiothoracic/       # Future
    └── neurosurgery/         # Future
```

Each specialty can have:
- Own CSS file (imported conditionally)
- Own scenario definitions
- Own profile statistics tracking
- Separate paid access tiers

---

## Document History

- **Created:** January 2025
- **Step 1 Completed:** Environment optimization with VS Code debugging, Jest testing, ESLint/Prettier
- **Step 2 Completed:** Backend modularization with src/ directory structure
- **Step 3 Completed:** Frontend file organization without bundler, CSS extraction, JS modularization
- **Step 4 Completed:** WebSocket security middleware with rate limiting, message validation, secure session IDs
- **Step 5 Completed:** VAD optimization with spectral analysis, adaptive noise floor calibration, enhanced noise filtering
- **Step 6:** Not started (per user request)
