# Quick Deploy Checklist

## ✅ All Code Changes Complete!

Your app is now ready for deployment. Here's what was done:

### Files Changed:
1. ✅ `frontend/config.js` - Created (environment-aware backend URL)
2. ✅ `frontend/index.html` - Updated (includes config.js)
3. ✅ `frontend/index.js` - Updated (uses CONFIG.BACKEND_URL)
4. ✅ `backend/server.js` - Updated (binds to 0.0.0.0, handles production credentials)
5. ✅ `backend/package.json` - Updated (added Node.js engine specification)
6. ✅ `.gitignore` - Created (protects secrets)

---

## 🚀 Deploy in 5 Steps

### 1. Push to GitHub (5 minutes)

```bash
cd "d:\Projects 2025\AI ST3 Coach V4"
git init
git add .
git commit -m "Ready for deployment"
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-st3-coach.git
git push -u origin main
```

### 2. Deploy Backend on Railway (5 minutes)

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables:
   - `OPENAI_API_KEY` = (your OpenAI key)
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON` = (paste entire credentials.json content)
5. Copy your backend URL: `your-app.up.railway.app`

### 3. Update Frontend Config (1 minute)

Edit `frontend/config.js`:
```javascript
const productionBackendUrl = 'your-app.up.railway.app'; // Replace with your Railway URL
```

Commit and push:
```bash
git add frontend/config.js
git commit -m "Add production backend URL"
git push
```

### 4. Deploy Frontend on Netlify (3 minutes)

1. Sign up at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select repository
4. **Publish directory:** `frontend`
5. Click "Deploy"
6. Copy your URL: `your-site.netlify.app`

### 5. Test! (2 minutes)

Visit your Netlify URL and test the app!

---

## 📋 What You Need Ready

Before starting:
- [ ] GitHub account
- [ ] OpenAI API key (from platform.openai.com)
- [ ] Google Cloud credentials.json file
- [ ] Railway account (for backend)
- [ ] Netlify account (for frontend)

---

## 💰 Expected Costs

**Free Tier Testing:**
- Railway: $5 credit/month (free)
- Netlify: Free
- Google TTS: ~$4/month
- OpenAI: ~$5-10/month (based on usage)
- **Total: ~$10/month**

**Production (Paid):**
- Railway: $20/month
- Netlify: Free
- Google TTS: ~$10-30/month
- OpenAI: ~$20-50/month
- **Total: ~$50-100/month**

---

## ⚠️ Important Notes

1. **Never commit secrets:**
   - `.env` is in `.gitignore` ✓
   - `credentials.json` is in `.gitignore` ✓
   - Always use platform environment variables

2. **Security:**
   - Frontend uses wss:// (secure WebSocket) in production
   - Backend binds properly for cloud deployment
   - All secrets stored securely

3. **Testing:**
   - Test locally first before deploying
   - Monitor Railway logs for errors
   - Check browser console on frontend

---

## 🆘 Quick Troubleshooting

**"WebSocket connection failed"**
→ Check frontend config.js has correct backend URL
→ Ensure no typos in Railway URL

**"Google TTS not working"**
→ Verify credentials JSON is pasted correctly in Railway (no extra spaces)
→ Check Google Cloud TTS API is enabled

**"OpenAI errors"**
→ Verify API key is correct
→ Check you have credits remaining

---

## 📞 Support

- Full guide: `DEPLOYMENT.md`
- Detailed explanations: `.claude/plans/zany-puzzling-glade.md`
- Railway docs: https://docs.railway.app
- Netlify docs: https://docs.netlify.com
