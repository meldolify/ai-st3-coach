# Architecture & Database Documentation

## 1. Project Overview
**ST3 Plastic Surgery Interview Coach V4** is a web-based AI simulation platform designed to help medical trainees practice for their ST3 interviews. It features a real-time voice interaction system where an AI examiner (powered by GPT-4o-mini) conducts interviews, provides feedback, and speaks using realistic TTS (Google Cloud Text-to-Speech).

The application is built as a **Monorepo** containing both the Frontend (Vanilla JS/HTML) and Backend (Node.js/Express).

---

## 2. Technology Stack

### Frontend
-   **Framework**: Vanilla JavaScript (ES6+), HTML5, CSS3.
-   **Styling**: Custom CSS with Neumorphic design elements.
-   **State Management**: Global state objects in `state.js`.
-   **Authentication**: Supabase Auth (Client-side).
-   **Audio**: Web Audio API, MediaRecorder (for Push-to-Talk).
-   **Communication**: Native WebSocket API.

### Backend
-   **Runtime**: Node.js.
-   **Framework**: Express.js (HTTP) + `ws` (WebSocket).
-   **Database**: Supabase (PostgreSQL).
-   **AI Services**:
    -   **LLM**: OpenAI GPT-4o-mini (via `openai` SDK).
    -   **STT**: OpenAI Whisper API.
    -   **TTS**: Google Cloud Text-to-Speech.
-   **Payments**: Stripe API.
-   **Security**: `helmet`, `cors`, `express-rate-limit`, `express-validator`.

---

## 3. Database Architecture
The project uses **Supabase** (PostgreSQL) as the primary data store.

### Configuration
-   **Project ID**: `vsdiovgjnbziwwukpvqo`
-   **Region**: `eu-west-1`

### Schema Details

#### 1. `profiles`
Stores user profile information, linked to Supabase Auth users.
| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | - | Primary Key (references `auth.users.id`) |
| `email` | `text` | NO | - | User email |
| `full_name` | `text` | YES | - | Display name |
| `specialty` | `text` | YES | - | Medical specialty (e.g., 'plastics') |
| `training_level` | `text` | YES | - | Current training level |
| `created_at` | `timestamptz` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | YES | `now()` | Last update timestamp |

#### 2. `session_history`
Logs all practice sessions for analytics and user history.
| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary Key |
| `user_id` | `uuid` | NO | - | Foreign Key to `profiles.id` |
| `scenario_path` | `text` | NO | - | Path to the scenario file used |
| `difficulty` | `text` | NO | - | Difficulty level ('easy', 'medium', 'strict') |
| `started_at` | `timestamptz` | NO | `now()` | Session start time |
| `ended_at` | `timestamptz` | YES | - | Session end time |
| `feedback_data` | `jsonb` | YES | - | Structured feedback from the AI |

#### 3. `subscriptions`
Manages Stripe subscription status for users.
| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary Key |
| `user_id` | `uuid` | NO | - | Foreign Key to `profiles.id` |
| `stripe_customer_id` | `text` | YES | - | Stripe Customer ID |
| `stripe_subscription_id` | `text` | YES | - | Stripe Subscription ID |
| `status` | `text` | YES | `'free'::text` | Status ('active', 'past_due', 'canceled', 'free') |
| `current_period_end` | `timestamptz` | YES | - | Expiry date of current period |
| `created_at` | `timestamptz` | YES | `now()` | Record creation timestamp |

---

## 4. Backend Architecture
The backend is located in the `backend/` directory.

### Entry Point: `server.js`
This file initializes the Express app and the WebSocket server.
-   **Config**: Loads environment variables and secrets via `src/config.js`.
-   **Middlewares**: Sets up CORS, Helmet (CSP), Rate Limiting.
-   **WebSocket Server**: Listens on the configured port for real-time connections.

### API Routes & Controllers

#### WebSocket API (Real-time)
The core functionality runs over WebSockets.
-   **Connection**: Handshake validates the session and loads the requested `scenario` and `difficulty`.
-   **Incoming Events**:
    -   `whisper_audio`: Binary audio data (webm/wav) from client. Sent to **OpenAIService** for transcription.
    -   `user_transcript`: Text transcript (if client handles STT, or fallback). Sent to GPT-4o-mini.
    -   `user_speaking`: Signal to interrupt AI playback.
-   **Outgoing Events**:
    -   `scenario_loaded`: Confirmation of session start.
    -   `whisper_transcript`: Real-time text of what the user said.
    -   `ai_response`: JSON containing `text` (response) and `audio` (base64 MP3 from Google TTS).
    -   `feedback_processing`: Signal that the AI is generating feedback.
    -   `interrupt`: Command to stop audio playback on client.

#### HTTP API (REST)
-   `POST /stripe-webhook`: Handles Stripe events (`checkout.session.completed`, etc.) to update the `subscriptions` table.
-   `POST /create-checkout-session`: Initiates a Stripe Checkout flow.
-   `POST /create-portal-session`: Redirects to Stripe Customer Portal.
-   `GET /health`: Health check endpoint.

### Services (`backend/src/services/`)
1.  **OpenAIService (`OpenAIService.js`)**:
    -   `generateResponse(history)`: Calls GPT-4o-mini with conversation history.
    -   `transcribeAudio(buffer)`: Saves buffer to temp file and calls Whisper API.
2.  **TTSService (`TTSService.js`)**:
    -   `synthesize(text, voiceName)`: Calls Google Cloud TTS to generate MP3 audio.

---

## 5. Frontend Architecture
The frontend is located in the `frontend/` directory. It is a "Thin Client" that relies on the backend for intelligence.

### Core Modules (`frontend/js/`)
1.  **`app.js`**: Main entry point. Handles DOMContentLoaded, UI transitions, global event listeners (Connect, Record, Interrupt).
2.  **`session.js`**:
    -   **`V4Session`**: Manages the WebSocket connection and message routing.
    -   **`AudioPlayer`**: Handles queuing and playing the base64 audio chunks.
3.  **`speech.js`** (inferred): Contains `PushToTalkManager` for capturing microphone input using `MediaRecorder`.
4.  **`auth.js`**: Manages Supabase Auth (Login/Signup/Logout) and UI state updates based on auth status.
5.  **`state.js`**: centralized state for selections (Specialty, Difficulty, Mode).

### Audio Pipeline Flow
1.  **Input**: User presses "Record" -> `PushToTalkManager` records audio.
2.  **Transmission**: User releases "Record" -> Audio blob converted to Base64 -> Sent to Backend via WebSocket (`whisper_audio`).
3.  **Processing**: Backend transcribes -> GPT generates text -> TTS generates audio.
4.  **Output**: Backend sends `ai_response` -> Client `V4Session` receives it -> `AudioPlayer` plays it.

### Design System
-   **Neumorphism**: Heavy use of soft shadows and rounded corners (defined in `index.html` style block and `styles/main.css`).
-   **Animations**: CSS animations for the "Orb" (Idle, Listening, Thinking, Speaking states).

---

## 6. Directory Structure
```
/
├── backend/
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Main Entry Point
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── services/       # OpenAIService, TTSService
│   │   ├── middleware/     # Auth & Security middleware
│   │   └── utils/          # Helper functions
│   └── prompts/            # Scenario text files
├── frontend/
│   ├── index.html          # Main HTML (SPA structure)
│   ├── styles/             # CSS files
│   └── js/                 # Client-side logic modules
│       ├── app.js
│       ├── session.js
│       ├── auth.js
│       └── ...
└── supabase information.txt # Connection details
```

---

## 7. Development Workflow (Two-Agent Setup)

This project utilizes a **Two-Agent Setup** to ensure high-quality planning and execution. The workflow involves two AI agents: **Gemini** (Planner) and **Claude Code** (Implementer).

### Roles & Responsibilities

#### 1. Gemini (Planner & Instructor)
*   **Role**: Strategic planning, architectural oversight, and instruction.
*   **Responsibilities**:
    *   Analyze user requests and existing architecture.
    *   Create detailed, multi-step implementation plans.
    *   Ensure all plans align with the system architecture described in this document.
*   **Workflow**:
    *   Writes instructions to `IMPLEMENTATION_PLAN.md`.
    *   Reads `IMPLEMENTATION_VARIATIONS.md` to track progress and adjust future steps.

#### 2. Claude Code (Implementer & Executor)
*   **Role**: Critical analysis, code execution, and variation management.
*   **Responsibilities**:
    *   Critically appraise plans from Gemini.
    *   Execute code changes.
    *   Document any necessary deviations or variations.
*   **Workflow**:
    *   **Must Read First**: `ARCHITECTURE_AND_DATABASE.md` and `CLAUDE.md`.
    *   **Read Plan**: `IMPLEMENTATION_PLAN.md`.
    *   **Critical Appraisal**: Compare the plan against its understanding of the architecture.
    *   **Execution**: Implement changes.
    *   **Reporting**: Save decisions and variations to `IMPLEMENTATION_VARIATIONS.md`.

### Communication Cycle
1.  **Gemini Plan**: Gemini updates `IMPLEMENTATION_PLAN.md` with the next set of tasks.
2.  **Claude Execute**: Claude Code reads the plan, appraises it, implements it, and logs results in `IMPLEMENTATION_VARIATIONS.md`.
3.  **Gemini Review**: Gemini reads `IMPLEMENTATION_VARIATIONS.md` to understand the current state before creating the next plan.
