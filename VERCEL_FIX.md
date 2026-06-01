# Vercel 404 Error - FIXED ✅

## Changes Made

The 404 error was caused by incorrect Vercel configuration. Here's what was fixed:

### 1. Restructured for Vercel Serverless
- Created `backend/api/index.ts` - Vercel serverless entry point
- Split `backend/src/index.ts` into:
  - `backend/src/app.ts` - Express app (exported for Vercel)
  - `backend/src/index.ts` - Local development server

### 2. Fixed vercel.json
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### 3. Database Initialization
- Added middleware to ensure database initializes before handling requests
- Works with both SQLite (local) and PostgreSQL (Vercel)

## How to Deploy

### Step 1: Set up Database
1. Go to https://console.neon.tech/
2. Create a new project
3. Copy the connection string

### Step 2: Deploy to Vercel
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Vercel 404 error"
   git push
   ```

2. Go to https://vercel.com
3. Import your repository
4. **IMPORTANT**: Set Root Directory to `backend`
5. Add Environment Variable:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string

6. Deploy!

### Step 3: Test
After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Should return API info
- `https://your-app.vercel.app/health` - Health check
- `https://your-app.vercel.app/api/jobs` - Jobs API

## File Structure
```
backend/
├── api/
│   └── index.ts          # Vercel entry point (NEW)
├── src/
│   ├── app.ts            # Express app (NEW)
│   ├── index.ts          # Local server (MODIFIED)
│   ├── config/
│   │   ├── db-config.ts
│   │   ├── database.ts
│   │   └── database-postgres.ts
│   └── ...
├── vercel.json           # Vercel config (UPDATED)
└── package.json
```

## Why This Works

Vercel expects Node.js apps to follow the "API Routes" pattern:
- Files in `api/` directory become serverless functions
- `api/index.ts` handles all routes via Express
- The Express app is separated from server startup
- Database initializes via middleware on each request

## Troubleshooting

### Still getting 404?
1. Verify `backend` is set as Root Directory in Vercel settings
2. Check that `api/index.ts` exists
3. Ensure DATABASE_URL is set in environment variables

### Database errors?
1. Verify Neon connection string format
2. Check Vercel function logs for errors
3. Ensure @neondatabase/serverless is installed

### Local development not working?
```bash
cd backend
npm run dev
```
Should work exactly as before using SQLite!
