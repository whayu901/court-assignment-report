# Quick Deploy - 5 Minutes to Production

Fastest way to get your app deployed and get a live demo URL.

## 🚀 Super Quick Deploy (No Code Changes Needed)

### Option 1: Railway (Easiest - Keep SQLite)

**Why**: Railway supports persistent storage, so you can keep using SQLite without any code changes!

1. **Create Railway Account**:
   - Go to https://railway.app
   - Sign up with GitHub (free $5 credit/month)

2. **Deploy**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link to new project
   railway init

   # Deploy
   railway up

   # Add persistent volume for SQLite
   railway volume create
   railway volume mount /app/backend/data
   ```

3. **Get URL**:
   ```bash
   railway domain
   ```

4. **Done!** ✅
   - Your backend is live at: `https://your-app.railway.app`
   - SQLite database persists between deploys
   - No code changes needed!

---

### Option 2: Render (Also Easy - Keep SQLite)

**Why**: Render has persistent disks built-in

1. **Create Render Account**:
   - Go to https://render.com
   - Sign up (free tier available)

2. **Deploy**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select "Node" environment
   - Build command: `npm install && npm run build --workspace=backend`
   - Start command: `npm start --workspace=backend`
   - Add disk: `/app/backend/data` (for SQLite)

3. **Deploy Frontend**:
   - Click "New +" → "Static Site"
   - Connect same GitHub repo
   - Build command: `npm install && npm run build --workspace=frontend`
   - Publish directory: `frontend/dist`

4. **Done!** ✅

---

### Option 3: Vercel + Neon (PostgreSQL Migration)

**Why**: Best for serverless, auto-scaling

**Time**: 15-20 minutes (includes database migration)

Follow the full guide in **DEPLOYMENT_GUIDE.md**

**Quick steps**:

1. **Create Neon Database**:
   - https://neon.tech → Sign up → Create project
   - Copy connection string

2. **Modify code to use PostgreSQL** (I've already created the files!):

   Update `backend/src/index.ts`:
   ```typescript
   // Add at the top
   import 'dotenv/config';

   // Change this line:
   import { initializeDatabase } from '@config/database-postgres';
   ```

   Update each service file (`JobService.ts`, `ReporterService.ts`, `EditorService.ts`):
   ```typescript
   // Change imports from:
   import { JobRepository } from '@repositories/JobRepository';

   // To:
   import { JobRepository } from '@repositories/JobRepository-postgres';
   ```

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Add Environment Variable**:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon connection string

5. **Done!** ✅

---

## 🎯 Recommended: Railway (No Code Changes!)

For your interview demo, I recommend **Railway** because:

✅ **Zero code changes** - works with SQLite as-is
✅ **Persistent storage** - database survives deploys
✅ **Simple setup** - 5 minutes total
✅ **Free tier** - $5/month credit (enough for demo)
✅ **Auto HTTPS** - SSL certificate included

### Railway Deploy Commands:

```bash
# One-time setup
npm install -g @railway/cli
railway login
railway init

# Deploy (run this every time you update code)
railway up

# Get your URL
railway domain

# View logs
railway logs
```

---

## 📱 Getting Your Demo URL

After deploying to Railway:

```bash
railway domain
```

You'll get a URL like: `https://voice-over-production.railway.app`

**Share this in your interview!**

---

## ⚡ Fastest Path (Step-by-Step)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Initialize Project
```bash
railway init
# Select: "Create new project"
# Name it: "voice-over-workflow"
```

### 4. Deploy
```bash
railway up
```

### 5. Get URL
```bash
railway domain
```

### 6. Test
Open the URL in your browser!

---

## 🐛 If Something Goes Wrong

### Railway deployment fails:
```bash
# Check logs
railway logs

# Redeploy
railway up --detach
```

### Database file not found:
```bash
# Add persistent volume
railway volume create
railway volume mount /app/backend/data

# Redeploy
railway up
```

### Port issues:
Railway automatically detects the port from your code. No changes needed!

---

## 💡 Tips for Interview

**When they ask "Can I see it live?"**

> "Yes! I deployed it to Railway with persistent storage. Here's the live demo: [your-railway-url]
>
> I chose Railway because it supports persistent volumes, so I could keep using SQLite without rewriting the database layer. For a production system, I would migrate to PostgreSQL and deploy to Vercel for better serverless scaling, but for this demo, Railway provides the perfect balance of speed and functionality."

---

## 📊 Deployment Comparison

| Platform | Time | Code Changes | SQLite Support | Cost |
|----------|------|--------------|----------------|------|
| **Railway** | 5 min | ❌ None | ✅ Yes | Free $5/month |
| **Render** | 10 min | ❌ None | ✅ Yes | Free tier |
| **Vercel + Neon** | 20 min | ✅ Required | ❌ No (PostgreSQL) | Free |

---

**My recommendation: Start with Railway, switch to Vercel+Neon later if you want to show serverless skills.**

Good luck! 🚀
