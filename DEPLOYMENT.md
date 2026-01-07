# Deployment Instructions

## ✅ Code Changes Completed

All necessary code changes for deployment have been made:

1. ✅ Frontend config file created (`frontend/config.js`)
2. ✅ WebSocket URL now environment-aware
3. ✅ Backend binds to 0.0.0.0 for production
4. ✅ .gitignore file created
5. ✅ package.json configured with Node.js engine

## 🚀 Quick Deploy to Railway

### Step 1: Prepare GitHub Repository

```bash
cd "d:\Projects 2025\AI ST3 Coach V4"
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-st3-coach.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `ai-st3-coach` repository
4. Railway will auto-detect Node.js

5. **Add Environment Variables:**
   - Click on your service → **"Variables"** tab
   - Add the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_APPLICATION_CREDENTIALS_JSON=paste_entire_credentials_json_here
   ```

   **Important:** For Google credentials, paste the ENTIRE contents of your `credentials.json` file as a single-line string into the `GOOGLE_APPLICATION_CREDENTIALS_JSON` variable.

6. **Update server.js to use JSON string:**
   You'll need to add this code at the top of `server.js` after the dotenv import:

   ```javascript
   // Handle Google credentials in production
   if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
     const fs = require('fs');
     const credsPath = '/tmp/credentials.json';
     fs.writeFileSync(credsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
     process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
   }
   ```

7. Railway will automatically deploy. Get your backend URL from the **"Settings"** → **"Domains"** section.
   - It will look like: `your-app-name.up.railway.app`

### Step 3: Update Frontend Config

1. Open `frontend/config.js`
2. Replace `YOUR_BACKEND_URL_HERE` with your Railway URL:
   ```javascript
   const productionBackendUrl = 'your-app-name.up.railway.app';
   ```
3. Commit and push:
   ```bash
   git add frontend/config.js
   git commit -m "Update production backend URL"
   git push
   ```

### Step 4: Deploy Frontend

**Option A: Railway (Same Platform)**
1. In Railway, click **"New Service"** → **"GitHub Repo"** → Select same repo
2. Railway will serve the `frontend` folder as static files
3. Get your frontend URL from Railway

**Option B: Netlify (Recommended for Static Files)**
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click **"Add new site"** → **"Import from Git"**
3. Select your repository
4. Set **Publish directory** to: `frontend`
5. Click **Deploy**
6. Your site will be live at: `your-site.netlify.app`

### Step 5: Test Deployment

1. Visit your frontend URL
2. Select a scenario and start a session
3. Check browser console for any errors
4. Verify WebSocket connection succeeds

## 🔧 Troubleshooting

### "WebSocket connection failed"
- Check that frontend config.js has correct backend URL
- Ensure backend is using `wss://` (secure WebSocket)
- Verify Railway backend is running (check Logs tab)

### "Google TTS Error"
- Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
- Check that the JSON is valid (no extra spaces/newlines)
- Ensure Google Cloud TTS API is enabled in your project

### "OpenAI API Error"
- Verify `OPENAI_API_KEY` is set correctly
- Check you have API credits remaining
- Ensure key has correct permissions

## 💰 Cost Monitoring

Once deployed, monitor costs:
- Railway Dashboard → **"Usage"** tab
- Google Cloud Console → **"Billing"**
- OpenAI Dashboard → **"Usage"**

## 🔒 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ `credentials.json` is in `.gitignore`
- ✅ API keys are stored in platform environment variables
- ✅ Never committed secrets to GitHub
- ✅ Using HTTPS/WSS in production

## 📝 Custom Domain (Optional)

To use your own domain (e.g., `st3coach.com`):

1. Buy domain from Namecheap or Google Domains (~$12/year)
2. In Railway/Netlify: **Settings** → **"Custom Domains"**
3. Add your domain
4. Update DNS records at your domain registrar (they provide instructions)
5. Wait for DNS propagation (up to 48 hours)

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Netlify Docs: https://docs.netlify.com
- Deployment Guide: See `.claude/plans/zany-puzzling-glade.md` for detailed explanations
