# ST3 Plastic Surgery Interview Trainer - V4

**Cost-Optimized Architecture: Web Speech API + GPT-4o-mini + Google Cloud TTS**

---

## Overview

V4 replaces OpenAI Realtime API with a text-based pipeline to achieve **94% cost reduction** while maintaining all features from V3.

### Cost Comparison
- **V3 (Realtime API):** £0.20-0.35 per 5-minute session
- **V4 (Text Pipeline):** £0.0003 per 5-minute session
- **Savings:** 94% reduction

### Architecture
```
User Speech → Web Speech API (FREE) → Text Transcript
    ↓
WebSocket → Backend Server
    ↓
GPT-4o-mini Text API → AI Response Text
    ↓
Google Cloud TTS → MP3 Audio
    ↓
Frontend → HTML5 Audio Playback → Speakers
```

---

## Features

All V3 features preserved:
- ✅ Hierarchical scenario selection (3 levels)
- ✅ Clinical image display with modal viewer
- ✅ Scenario-specific prompts from text files
- ✅ Professional UI with status indicators
- ✅ Session logging
- ✅ British voice (Google Neural2)

**New in V4:**
- ✅ 94% cost reduction
- ✅ Better voice quality options
- ✅ Full conversation history
- ✅ Simpler architecture

---

## Prerequisites

1. **Node.js** v18 or higher
2. **Google Chrome** or **Microsoft Edge** (Web Speech API requirement)
3. **OpenAI API Key**
4. **Google Cloud Account** with Text-to-Speech API enabled

---

## Quick Start

### 1. Google Cloud Setup

1. Go to https://console.cloud.google.com/
2. Create new project: "ST3-Coach-V4"
3. Enable "Cloud Text-to-Speech API"
4. Create Service Account:
   - Name: st3-tts-service
   - Role: Cloud Text-to-Speech User
5. Create JSON key, download it
6. Save as `backend/google-tts-key.json`

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.template .env

# Edit .env and add your API keys:
# OPENAI_API_KEY=sk-your-key-here
# GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json

# Start backend
npm start
```

Expected output:
```
✓ API clients initialized
✓ WebSocket server running on port 8080
✓ Server ready
```

### 3. Frontend Setup

Open new terminal:

```bash
cd frontend

# Start frontend server
node serve.js
```

Expected output:
```
✓ Frontend server running at http://localhost:3000/
```

### 4. Use the App

1. Open **Chrome or Edge**
2. Navigate to http://localhost:3000/
3. Allow microphone access
4. Select a scenario (e.g., "Necrotising Fasciitis")
5. Click "Start Session"
6. Start speaking!

---

## File Structure

```
AI ST3 Coach V4/
├── backend/
│   ├── server.js              - WebSocket + GPT-4o-mini + Google TTS
│   ├── package.json           - Dependencies
│   ├── .env.template          - Environment template
│   ├── .env                   - Your API keys (create this)
│   ├── google-tts-key.json    - Google credentials (you provide)
│   └── scenarios/
│       ├── template.txt       - Scenario template
│       └── nec_fasc.txt       - Necrotising Fasciitis
│
├── frontend/
│   ├── index.html             - UI (from V3)
│   ├── index.js               - Web Speech API implementation
│   ├── serve.js               - Static server
│   └── images/
│       └── nec_fasc_1.jpg     - Clinical images
│
└── README.md                  - This file
```

---

## How It Works

### 1. Speech Recognition (Web Speech API)
- Browser-native speech-to-text
- Continuous listening mode
- British English (en-GB)
- Auto-restarts after each recognition

### 2. Text Generation (GPT-4o-mini)
- Maintains full conversation history
- System prompt from scenario file
- Temperature: 0.7
- Max tokens: 300 per response

### 3. Text-to-Speech (Google Cloud)
- Voice: en-GB-Neural2-B (British male)
- Speaking rate: 0.95 (slightly slower)
- Pitch: -1.0 (slightly lower)
- Output: MP3 format

### 4. Message Flow
1. User speaks → Web Speech API detects → Sends transcript to backend
2. Backend adds to history → Calls GPT-4o-mini → Gets text response
3. Backend calls Google TTS → Gets MP3 audio
4. Backend sends text + base64 audio to frontend
5. Frontend plays audio → Pauses microphone during playback
6. Audio ends → Resumes microphone listening

---

## Usage Guide

### Starting a Session
1. Click a scenario from the menu
2. Review clinical image (if available)
3. Click "Start Session"
4. Wait for "Session ready!" message
5. Begin speaking

### During Interview
- Speak naturally - AI asks questions
- Microphone auto-pauses during AI speech
- Can interrupt AI (speak while it's talking)
- Say "skip to feedback" to end early

### Ending Session
- Click "End Session"
- Click "Back to Scenarios" for new scenario

---

## Adding New Scenarios

### 1. Create Scenario File
Create `backend/scenarios/your_scenario.txt`:
```
You are a Plastic Surgery ST3 interview consultant examiner in the UK.

[Follow template.txt structure]
```

### 2. Add to Menu
Edit `frontend/index.html`, add:
```html
<div class="scenario-item" onclick="startScenario('category', 'Title', 'your_scenario.txt', 'image.jpg')">
  📋 Title
</div>
```

### 3. Add Image (Optional)
Place image in `frontend/images/` folder

---

## Cost Breakdown

### Per 5-Minute Session

| Component | Usage | Cost |
|---|---|---|
| Web Speech API | FREE | £0.00 |
| GPT-4o-mini | 8 turns × 200 tokens | £0.0002 |
| Google TTS | 800 chars × 8 turns | £0.0001 |
| **Total** | - | **£0.0003** |

### Monthly Costs

- 100 sessions: £0.03
- 1,000 sessions: £0.30
- 10,000 sessions: £3.00

Compare to V3: £250/month for 1,000 sessions

---

## Troubleshooting

### "Speech Recognition not supported"
**Solution:** Use Chrome or Edge. Safari/Firefox don't support Web Speech API.

### "OPENAI_API_KEY not found"
**Solution:** Create `.env` in backend/ with your API key

### "Google TTS Error"
**Check:**
1. `google-tts-key.json` exists in backend/
2. Path correct in `.env` file
3. Text-to-Speech API enabled in Google Cloud
4. Service account has correct permissions

### Microphone Issues
1. Allow microphone in browser permissions
2. Check browser console for errors
3. Reload page

### WebSocket Connection Failed
1. Backend server running? (`npm start` in backend/)
2. Port 8080 available?
3. Check firewall settings

---

## Browser Compatibility

| Browser | Supported |
|---|---|
| Chrome | ✅ Recommended |
| Edge | ✅ Recommended |
| Safari | ❌ No Web Speech API |
| Firefox | ❌ No Web Speech API |

---

## Voice Options

Change in [backend/server.js:134](backend/server.js#L134):

### Available British Voices

| Voice | Gender | Style |
|---|---|---|
| en-GB-Neural2-B | Male | Professional (current) |
| en-GB-Neural2-D | Male | Warmer |
| en-GB-Neural2-A | Female | Professional |
| en-GB-Neural2-C | Female | Warmer |

```javascript
const audioBuffer = await googleTTS(responseText, 'en-GB-Neural2-D');
```

---

## V3 vs V4 Comparison

| Feature | V3 | V4 |
|---|---|---|
| Cost/session | £0.25 | £0.0003 |
| Latency | ~500ms | ~1700ms |
| Voice Quality | Good | Excellent |
| Browser Support | All modern | Chrome/Edge |
| Setup | Easy | Moderate |
| Interruption | Seamless | Good |

---

## Next Steps

1. ✅ Basic conversation flow
2. ⬜ Test cost in production
3. ⬜ Add more scenarios
4. ⬜ Implement 8-minute timer
5. ⬜ User authentication
6. ⬜ Analytics dashboard
7. ⬜ Production deployment

---

---

## Development Setup

### Prerequisites for Development
- Node.js v18+
- VS Code (recommended IDE)
- Git

### Initial Setup

1. **Clone and open workspace:**
```bash
# Open the workspace file in VS Code
code "AI ST3 Coach V4.code-workspace"
```

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Install recommended VS Code extensions:**
- Prettier - Code formatter
- ESLint - Linting
- Jest - Test runner
- Debugger for Chrome - Frontend debugging
- GitLens - Git integration

### Development Workflow

#### Running Development Server
```bash
# Terminal 1: Backend with auto-restart
cd backend
npm run dev

# Terminal 2: Frontend dev server
cd frontend
npx serve -s . -l 5500

# Terminal 3 (optional): Watch tests
cd backend
npm run test:watch
```

#### Debugging in VS Code

**Backend Debugging:**
1. Press `F5` or go to Run & Debug
2. Select "Backend: Debug WebSocket Server"
3. Set breakpoints in `server.js`
4. Connect from frontend to hit breakpoints

**Frontend Debugging:**
1. Start backend first
2. Press `F5` and select "Frontend: Launch Chrome with Debugger"
3. Chrome opens with debugging enabled
4. Set breakpoints in browser DevTools or VS Code

**Full Stack Debugging:**
- Select "Full Stack: Backend + Frontend" compound configuration
- Debugs both simultaneously

#### Running Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Watch mode (auto-run on file changes)
npm run test:watch

# Run specific test file
npx jest __tests__/scenario-loader.test.js

# Debug tests in VS Code
# Press F5 → Select "Backend: Debug Jest Tests"
```

**Test Coverage:**
- 51 unit tests covering:
  - Scenario loading (6 tests)
  - WebSocket server (5 tests)
  - VAD logic (13 tests)
  - GPT integration (12 tests)
  - TTS integration (15 tests)

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

#### Code Quality

```bash
cd backend

# Check linting errors
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

#### Git Workflow

```bash
# Check current changes
git status

# Run tests before committing
npm test

# Stage and commit
git add .
git commit -m "Description of changes"

# View development log
cat DEVELOPMENT_LOG.md
```

### Project Structure

```
AI ST3 Coach V4/
├── .vscode/                       # VS Code configuration
│   ├── launch.json               # Debugging configurations
│   ├── tasks.json                # Build/dev tasks
│   ├── settings.json             # Workspace settings
│   └── extensions.json           # Recommended extensions
├── backend/
│   ├── server.js                 # Main server (637 lines)
│   ├── package.json              # Dependencies + scripts
│   ├── jest.config.js            # Jest configuration
│   ├── .eslintrc.json            # ESLint rules
│   ├── .prettierrc.json          # Prettier config
│   ├── __tests__/                # Unit tests (51 tests)
│   │   ├── scenario-loader.test.js
│   │   ├── server.test.js
│   │   ├── vad-logic.test.js
│   │   ├── gpt-integration.test.js
│   │   └── tts-integration.test.js
│   └── prompts/                  # 231 scenario files
├── frontend/
│   ├── index.html                # UI (4,354 lines)
│   ├── index.js                  # Client logic (2,684 lines)
│   ├── config.js                 # Environment config
│   └── images/                   # Clinical images
├── AI ST3 Coach V4.code-workspace # Multi-root workspace
├── DEVELOPMENT_LOG.md            # Change tracking
└── README.md                     # This file
```

### NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ci` | Run tests for CI environment |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format code with Prettier |

### Environment Variables

**Development (`.env`):**
```bash
OPENAI_API_KEY=sk-your-dev-key
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json
PORT=8080
HTTP_PORT=3000
NODE_ENV=development
```

**Testing:**
- Tests use mocked API responses
- No real API calls during testing
- Test environment variables set in `jest.config.js`

### Troubleshooting Development Issues

**"Cannot find module 'jest'":**
```bash
cd backend
npm install
```

**ESLint not working:**
1. Install ESLint extension in VS Code
2. Reload VS Code window
3. Check `.eslintrc.json` exists

**Debugger not attaching:**
1. Kill existing Node processes
2. Restart VS Code
3. Try "Backend: Debug with Nodemon" configuration

**Tests failing:**
1. Check all dependencies installed
2. Run `npm test` to see specific errors
3. Check `DEVELOPMENT_LOG.md` for known issues

### Development Best Practices

1. **Always run tests before committing:**
   ```bash
   npm test
   ```

2. **Use the development log:**
   - Update `DEVELOPMENT_LOG.md` after significant changes
   - Include: what changed, why, and any gotchas

3. **Debug instead of console.log:**
   - Set breakpoints in VS Code
   - Inspect variables in debugger
   - Step through code line-by-line

4. **Write tests for new features:**
   - Add test file in `__tests__/`
   - Maintain 70% coverage threshold
   - Run `npm run test:watch` while developing

5. **Use consistent code style:**
   - Prettier formats on save
   - ESLint auto-fixes on save
   - Follow existing patterns

### Git Tags and Rollback

**Backup point before dev environment setup:**
```bash
# View backup tag
git tag -l

# Rollback if needed
git checkout pre-dev-environment-setup

# Return to main
git checkout main
```

### Development Time Estimates

| Task | Time |
|------|------|
| Fix linting error | 5-10 min |
| Add unit test | 15-30 min |
| Debug WebSocket issue | 30-60 min |
| Add new scenario | 20-40 min |
| Update prompt file | 10-20 min |

---

## Support

- Development Log: See `DEVELOPMENT_LOG.md`
- V3 comparison: See `../AI ST3 coach v3/PROJECT_SUMMARY.md`
- Google TTS docs: https://cloud.google.com/text-to-speech
- OpenAI API: https://platform.openai.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Jest docs: https://jestjs.io/
- ESLint rules: https://eslint.org/docs/rules/

---

## License

Internal use - ST3 Plastic Surgery Interview Training
