# Integration Guide

This guide provides step-by-step instructions for setting up all external services required by AI ST3 Coach V4.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [OpenAI Setup](#openai-setup)
4. [Google Cloud TTS Setup](#google-cloud-tts-setup)
5. [Supabase Setup (Optional)](#supabase-setup-optional)
6. [Stripe Setup (Optional)](#stripe-setup-optional)
7. [VS Code Debugging](#vs-code-debugging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js v18+** - [Download](https://nodejs.org/)
- **Chrome or Edge browser** - Required for Web Speech API (speech recognition)
- **OpenAI account** - For GPT-4o-mini and Whisper
- **Google Cloud account** - For Text-to-Speech

### Optional (for production features):
- **Supabase account** - For user authentication
- **Stripe account** - For subscription payments

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd "AI ST3 Coach V4"

# 2. Install backend dependencies
cd backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see sections below)

# 4. Start the development server
npm run dev

# 5. In a new terminal, serve the frontend
cd ../frontend
npx serve -s . -l 5500

# 6. Open http://localhost:5500 in Chrome or Edge
```

---

## OpenAI Setup

OpenAI provides GPT-4o-mini for conversation and Whisper for speech-to-text fallback.

### Step 1: Create an API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### Step 2: Add to Environment

Edit `backend/.env`:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Models Used

| Model | Purpose | Cost |
|-------|---------|------|
| `gpt-4o-mini` | Conversation/responses | ~$0.15/1M input tokens |
| `whisper-1` | Speech-to-text fallback | ~$0.006/minute |

### Verify Setup

```bash
cd backend
npm run dev
# Should start without OpenAI errors
```

---

## Google Cloud TTS Setup

Google Cloud Text-to-Speech provides high-quality British voices for AI responses.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** > **New Project**
3. Name it (e.g., "ST3 Coach TTS")
4. Click **Create**

### Step 2: Enable the Text-to-Speech API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Cloud Text-to-Speech API"
3. Click on it and press **Enable**

### Step 3: Create a Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name it (e.g., "tts-service-account")
4. Click **Create and Continue**
5. For role, select **Cloud Text-to-Speech User** (or skip for now)
6. Click **Done**

### Step 4: Download the JSON Key

1. Click on the service account you created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - the file downloads automatically
6. Rename it to `google-tts-key.json`
7. Move it to the `backend/` directory

### Step 5: Add to Environment

Edit `backend/.env`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json
```

### Available Voices

The default voice is `en-GB-Neural2-D` (British male). To change it, modify `TTS_VOICE` in `backend/server.js`:

| Voice ID | Gender | Style |
|----------|--------|-------|
| `en-GB-Neural2-B` | Male | Professional |
| `en-GB-Neural2-D` | Male | Fast (default) |
| `en-GB-Wavenet-D` | Male | Natural |
| `en-GB-Studio-D` | Male | Premium |
| `en-GB-Neural2-A` | Female | Professional |
| `en-GB-Neural2-C` | Female | Warm |

### Verify Setup

```bash
cd backend
npm run dev
# Should start without Google TTS errors
```

---

## Supabase Setup (Optional)

Supabase provides user authentication and session tracking. Without it, the app runs in demo mode.

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter project name and database password
4. Select a region close to your users
5. Click **Create new project**

### Step 2: Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role key** (NOT the anon key - this is for server-side operations)

### Step 3: Add to Environment

Edit `backend/.env`:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key
```

### Step 4: Configure Frontend

Edit `frontend/config.js`:

```javascript
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...your-anon-key';
```

### Database Schema

The app expects these tables (auto-created by Supabase Auth):
- `auth.users` - User accounts

For session history tracking, you may need to create:
- `public.sessions` - Interview session records

---

## Stripe Setup (Optional)

Stripe handles subscription payments for premium features. Without it, subscription features are disabled.

### Step 1: Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. For development, use **Test mode** (toggle in sidebar)

### Step 2: Get API Keys

1. Go to **Developers** > **API keys**
2. Copy:
   - **Secret key** (starts with `sk_test_` for test mode)

### Step 3: Create a Product and Price

1. Go to **Products** > **Add product**
2. Enter name (e.g., "ST3 Coach Premium")
3. Add a **recurring price** (e.g., £9.99/month)
4. Save and copy the **Price ID** (starts with `price_`)

### Step 4: Set Up Webhooks

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-backend-url/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 5: Add to Environment

Edit `backend/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret
STRIPE_PRICE_ID=price_...your-price-id
FRONTEND_URL=http://localhost:5500
```

---

## VS Code Debugging

The project includes pre-configured VS Code debug configurations.

### Available Configurations

Press `F5` or go to **Run and Debug** to see:

| Configuration | Description |
|--------------|-------------|
| Backend: Debug WebSocket Server | Debug the main backend server |
| Backend: Debug with Nodemon | Debug with auto-restart on file changes |
| Frontend: Launch Chrome with Debugger | Debug frontend with Chrome DevTools |
| Backend: Run Jest Tests | Run all tests |
| Backend: Debug Jest Tests | Debug tests with breakpoints |
| Full Stack: Backend + Frontend | Debug both simultaneously |

### Setting Breakpoints

1. Open any `.js` file in VS Code
2. Click in the gutter (left of line numbers) to set a breakpoint
3. Press `F5` to start debugging
4. Code execution will pause at breakpoints

### Debugging Tips

- Use **Full Stack** configuration for end-to-end debugging
- Check the **Debug Console** for console output
- Use **Watch** panel to monitor variables
- Use **Call Stack** to trace function calls

---

## Troubleshooting

### Common Issues

#### "OPENAI_API_KEY is not set"

**Solution:** Ensure `backend/.env` exists and contains a valid OpenAI key.

```bash
cd backend
cat .env  # Check if OPENAI_API_KEY is set
```

#### "Could not load credentials from GOOGLE_APPLICATION_CREDENTIALS"

**Solution:** Verify the JSON key file exists and path is correct.

```bash
cd backend
ls google-tts-key.json  # Should show the file
```

#### Web Speech API not working

**Cause:** Using an unsupported browser (Safari, Firefox).

**Solution:** Use Chrome or Edge. These are the only browsers with full Web Speech API support.

#### "EADDRINUSE: address already in use"

**Cause:** Port 8080 or 3000 is already in use.

**Solution:**
```bash
# Find and kill the process using the port
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

Or change the port in `.env`:
```bash
PORT=8081
```

#### WebSocket connection failed

**Solution:** Ensure backend is running and check the WebSocket URL in frontend matches the backend port.

### Environment Validation

Run this command to check your environment:

```bash
cd backend
node -e "require('dotenv').config(); console.log('OpenAI:', !!process.env.OPENAI_API_KEY); console.log('Google:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);"
```

Expected output:
```
OpenAI: true
Google: true
```

### Getting Help

- Check `DEVELOPMENT_LOG.md` for known issues
- Review `CLAUDE.md` for codebase guidance
- Open an issue on the repository

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | Path to Google Cloud TTS JSON key |
| `PORT` | No | WebSocket server port (default: 8080) |
| `HTTP_PORT` | No | HTTP server port (default: 3000) |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | No | Supabase service role key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | No | Stripe subscription price ID |
| `FRONTEND_URL` | No | Frontend URL for redirects |
