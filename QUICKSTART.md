# Quick Start Guide

Get the Court Reporting Workflow System up and running in 2 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Application

```bash
npm run dev
```

This will start:
- **Backend API** on http://localhost:3001
- **Frontend App** on http://localhost:3000

## Step 3: Open Your Browser

Navigate to **http://localhost:3000**

You'll see the dashboard with sample data already loaded:
- 4 reporters from different locations
- 3 editors
- Ready to create jobs and test the workflow

## What to Try

### 1. Create Your First Job
- Click **"Create Job"** button
- Fill in:
  - Case name: "Case No. 001/2024"
  - Duration: 120 (minutes)
  - Location: Jakarta (or Bandung, Surabaya)
- Submit

### 2. Assign a Reporter
- Find your new job (status: NEW)
- Click **"Assign Reporter"**
- Notice how reporters from the same location appear first (highlighted in blue)
- Select a reporter and assign

### 3. Progress the Workflow
- Click **"→ TRANSCRIBED"** to mark transcription as done
- Click **"Assign Editor"** to assign an editor
- Click **"→ REVIEWED"** after editor review
- Click **"→ COMPLETED"** to finish the job

### 4. Check Payment
Once a reporter is assigned, you'll see the calculated payment on the job card showing the total cost for that job.

## Filtering Jobs

Use the status buttons at the top to filter:
- **All** - Show all jobs
- **NEW** - Jobs waiting for reporter assignment
- **ASSIGNED** - Jobs ready for transcription
- **TRANSCRIBED** - Jobs ready for editor review
- **REVIEWED** - Jobs ready to be marked complete
- **COMPLETED** - Finished jobs

## Sample Data

The system comes pre-loaded with:

**Reporters:**
- Ahmad Hidayat (Jakarta) - Rp 2,000/min
- Siti Nurhaliza (Jakarta) - Rp 2,500/min
- Budi Santoso (Bandung) - Rp 1,800/min
- Dewi Kusuma (Surabaya) - Rp 2,200/min

**Editors:**
- Rina Wijaya - Rp 150,000/job
- Eko Prasetyo - Rp 175,000/job
- Mega Putri - Rp 160,000/job

## Understanding the Workflow

```
NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED
 ↓       ↓           ↓            ↓
 |    Reporter    Editor       Final
 |    Needed     Needed      Complete
```

**Business Rules:**
- Can only assign reporter to NEW jobs
- Can only assign editor to TRANSCRIBED jobs
- Cannot skip workflow stages
- Location-based reporter suggestions (same city preferred)

## Troubleshooting

**Port already in use?**
- Change ports in `backend/src/index.ts` (line 5) and `frontend/vite.config.ts` (line 6)

**Dependencies not installing?**
- Make sure you have Node.js 18+ installed
- Try `rm -rf node_modules package-lock.json && npm install`

**Database issues?**
- The SQLite database is auto-created on first run
- Location: `backend/data/workflow.db`
- To reset: Delete the file and restart the backend

## Next Steps

Check out the full [README.md](README.md) for:
- Complete API documentation
- Architecture details
- Production deployment guide
- Feature explanations

---

**Need help?** All the code is documented and follows clean architecture patterns. Start with `backend/src/index.ts` and `frontend/src/App.tsx` to understand the flow.
