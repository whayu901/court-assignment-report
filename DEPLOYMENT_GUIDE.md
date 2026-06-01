# Deployment Guide - Vercel + Neon PostgreSQL

Complete guide to deploy your Court Reporting Workflow System to production.

## 🎯 Deployment Stack

- **Frontend**: Vercel (serverless, auto-scaling)
- **Backend API**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL (serverless, free tier)

---

## 📋 Prerequisites

- Vercel account (free): https://vercel.com
- Neon account (free): https://neon.tech
- GitHub repository (optional but recommended)

---

## Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up (free tier: 512 MB storage, 3 projects)
3. Click "Create Project"

### 1.2 Create Database
1. **Project name**: `court-reporting-workflow`
2. **Region**: Choose closest to your users
3. **PostgreSQL version**: 16 (latest)
4. Click "Create Project"

### 1.3 Get Connection String
1. After creation, you'll see the connection string
2. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Save this** - you'll need it for Vercel

---

## Step 2: Prepare Code for PostgreSQL

### 2.1 Update Services to Use PostgreSQL Repositories

You need to update your services to use the PostgreSQL repositories when `DATABASE_URL` is set.

**Option A: Manual Switch (Easiest for now)**

Update `backend/src/services/JobService.ts`:

```typescript
import { JobRepository } from process.env.DATABASE_URL
  ? '@repositories/JobRepository-postgres'
  : '@repositories/JobRepository';
// Repeat for ReporterRepository and EditorRepository
```

**Option B: Conditional Import (Recommended)**

Update `backend/src/index.ts`:

```typescript
import { initializeDatabase } from process.env.DATABASE_URL
  ? '@config/database-postgres'
  : '@config/database';
```

### 2.2 Add Environment Variable Support

Install `dotenv`:
```bash
npm install dotenv --workspace=backend
```

Update `backend/src/index.ts` (add at top):
```typescript
import 'dotenv/config';
```

---

## Step 3: Deploy to Vercel

### 3.1 Prepare for Deployment

Create `vercel.json` in the root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### 3.2 Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Or deploy via GitHub:

### 3.3 Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### 3.4 Add Environment Variables in Vercel

1. In Vercel dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   Key: DATABASE_URL
   Value: [paste your Neon connection string]
   ```
3. Click "Save"
4. Redeploy (Vercel will auto-redeploy)

---

## Step 4: Configure Frontend API Endpoint

Update `frontend/src/services/api.ts`:

```typescript
const API_BASE = process.env.NODE_ENV === 'production'
  ? '/api'  // Vercel routes /api to backend
  : '/api'; // Already proxied in vite.config.ts
```

---

## Step 5: Verify Deployment

### 5.1 Check Database Connection
1. Visit: `https://your-app.vercel.app/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Check API
1. Visit: `https://your-app.vercel.app/api/reporters`
2. Should return JSON array of reporters

### 5.3 Check Frontend
1. Visit: `https://your-app.vercel.app`
2. Should load the dashboard
3. Try creating a job

---

## 🔧 Alternative Deployment Options

### Option 1: Split Deployment (Recommended for Scale)

**Backend → Railway/Render (with SQLite)**
- Deploy backend to Railway (supports persistent volumes)
- Keep using SQLite
- No database migration needed

**Frontend → Vercel**
- Deploy only frontend to Vercel
- Point API calls to Railway backend URL

**Steps:**

1. **Deploy Backend to Railway**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize
   railway init

   # Deploy
   railway up
   ```

2. **Update Frontend API URL**:
   ```typescript
   const API_BASE = 'https://your-backend.railway.app/api';
   ```

3. **Deploy Frontend to Vercel**:
   - Deploy only the `frontend` folder
   - No backend environment variables needed

---

### Option 2: All-in-One Vercel Deployment

Keep backend and frontend together on Vercel with Neon PostgreSQL (what we set up above).

**Pros:**
- ✅ Single deployment
- ✅ Free tier for both
- ✅ Easy to manage

**Cons:**
- ⚠️ Need to migrate to PostgreSQL
- ⚠️ Serverless functions (cold starts)

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] PostgreSQL repositories created (`*-postgres.ts` files)
- [ ] Services updated to use PostgreSQL repos when `DATABASE_URL` is set
- [ ] `.env.example` created
- [ ] `vercel.json` configured
- [ ] Code committed to Git

### Neon Setup
- [ ] Neon account created
- [ ] Database project created
- [ ] Connection string copied

### Vercel Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] `DATABASE_URL` environment variable added
- [ ] Deployment successful

### Verification
- [ ] `/health` endpoint returns OK
- [ ] `/api/reporters` returns data
- [ ] Frontend loads
- [ ] Can create jobs
- [ ] Can assign reporters
- [ ] Can complete workflow

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"
**Solution**: Add `DATABASE_URL` to Vercel environment variables

### Error: "Module not found"
**Solution**: Make sure `tsconfig-paths` is installed and paths are configured

### Error: "Cannot connect to database"
**Solution**: Check Neon connection string, ensure SSL mode is included

### Frontend can't reach API
**Solution**: Check `vercel.json` routes configuration

### Cold start slow
**Solution**: This is normal for serverless. First request after idle takes 1-2 seconds

---

## 💡 Tips for Production

### 1. Enable Neon Autoscaling
- Neon automatically scales with traffic
- Free tier: 512 MB storage
- Paid tier: Autoscales compute based on load

### 2. Add Custom Domain
In Vercel:
- Settings → Domains → Add Domain
- Follow DNS configuration steps

### 3. Monitor Performance
- Vercel Analytics (built-in)
- Neon Monitoring dashboard

### 4. Set Up CI/CD
- Auto-deploy on Git push (Vercel does this automatically)
- Add GitHub Actions for tests

### 5. Environment Variables Best Practices
```env
# Development (.env.local)
DATABASE_URL=

# Production (Vercel)
DATABASE_URL=postgresql://...

# Staging (optional)
DATABASE_URL=postgresql://staging...
```

---

## 🎬 Quick Deploy Commands

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Deploy to Vercel
vercel --prod

# 4. View deployment
vercel open
```

---

## 📊 Cost Estimate (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Free | 100 GB bandwidth/month, 100 deployments/day |
| **Neon** | Free | 512 MB storage, 3 projects |
| **Total** | **$0/month** | Perfect for demo/interview! |

---

## 🚀 Interview Demo URL

After deployment, share this URL:
```
https://your-project.vercel.app
```

Mention in your interview:
> "I deployed the full application to Vercel with Neon PostgreSQL. The backend uses serverless functions which auto-scale based on traffic. Here's the live demo: [your-url]"

---

## 📖 Additional Resources

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

**Good luck with deployment! 🎉**

Need help? The Neon and Vercel communities are very responsive on Discord.
