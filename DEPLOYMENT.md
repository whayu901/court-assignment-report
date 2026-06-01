# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Set up Neon Database

1. Go to https://console.neon.tech/
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)

### 2. Deploy Backend

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Vercel deployment support"
   git push
   ```

2. Go to https://vercel.com/new
3. Import your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave default or use `npm run vercel-build`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - `DATABASE_URL` = your Neon connection string

6. Deploy!

### 3. Test Your Deployment

Visit these endpoints:
- `https://your-backend.vercel.app/` - Root endpoint
- `https://your-backend.vercel.app/health` - Health check
- `https://your-backend.vercel.app/api/jobs` - API endpoint

## How It Works

The application automatically detects the environment:

- **Local**: Uses SQLite (better-sqlite3)
- **Vercel**: Uses PostgreSQL (Neon)

Key files:
- `backend/src/config/db-config.ts` - Database switcher
- `backend/src/config/database.ts` - SQLite config
- `backend/src/config/database-postgres.ts` - PostgreSQL config
- `backend/vercel.json` - Vercel deployment config

## Troubleshooting

### 404 NOT_FOUND Error
- Check that `src/index.ts` exists
- Verify `vercel.json` is in the backend directory
- Make sure you selected `backend` as the root directory

### Build Errors with better-sqlite3
- This is normal! better-sqlite3 is optional
- It's only used for local development
- Vercel will use PostgreSQL via the DATABASE_URL

### Database Connection Errors
- Verify DATABASE_URL is set in Vercel environment variables
- Check the connection string format
- Ensure your Neon database is active

### CORS Errors
- The backend uses `cors()` middleware which allows all origins
- For production, you may want to restrict this in `backend/src/index.ts`
