# Court Reporting Workflow System

A full-stack workflow management system for court reporting agencies to manage transcription jobs, reporter assignments, and payment tracking.

## Project Overview

This application demonstrates a complete workflow system with:

- **Job Management** - Track transcription cases through their lifecycle (NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED)
- **Smart Assignment Logic** - Automatically suggests reporters from the same location as the job for cost efficiency
- **Payment Calculation** - Track reporter earnings (per-minute rates) and editor fees (flat rate)
- **State Machine** - Enforces valid workflow transitions and business rules

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js (REST API)
- SQLite (Database)
- Better-sqlite3 (Database driver)

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)

**Architecture:**
- Monorepo structure with npm workspaces
- Clean layered architecture (Controllers → Services → Repositories)
- Shared TypeScript types between frontend and backend
- Path aliases (`@shared/*`) for cleaner imports

## Project Structure

```
voice-over/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Database operations
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   └── data/              # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   ├── App.tsx        # Main application
│   │   └── main.tsx       # Entry point
│   └── index.html
└── shared/
    └── types/             # Shared TypeScript types
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

This will install dependencies for both backend and frontend using npm workspaces.

### Running the Application

**Option 1: Run both backend and frontend together**

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend app on `http://localhost:3000`

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### First Time Setup

When you first run the backend, it will:
- Create a SQLite database at `backend/data/workflow.db`
- Initialize the database schema (jobs, reporters, editors tables)
- Insert sample data (4 reporters, 3 editors)

## Using the Application

### Creating a Job

1. Click "Create Job" button
2. Enter case name, duration (in minutes), and location
3. Job starts in NEW status

### Assigning a Reporter

1. Find a job with NEW status
2. Click "Assign Reporter"
3. The system shows:
   - **Preferred**: Reporters from the same location (highlighted)
   - **Others**: Reporters from different locations
4. Select a reporter - job moves to ASSIGNED status

### Workflow Progression

Jobs follow this strict workflow:

```
NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED
```

- **NEW**: Just created, waiting for reporter assignment
- **ASSIGNED**: Reporter assigned, ready for transcription
- **TRANSCRIBED**: Transcription done, waiting for editor assignment
- **REVIEWED**: Editor has reviewed the transcription
- **COMPLETED**: Job finished

### Business Rules

The system enforces several business rules:

- Can't assign reporter if job isn't NEW
- Can't move to TRANSCRIBED without a reporter
- Can't assign editor unless job is TRANSCRIBED
- Can't move to REVIEWED without an editor
- Can only transition to valid next states (no skipping)

### Payment Tracking

- **Reporters**: Paid per minute (e.g., 2,000 IDR/minute)
- **Editors**: Flat fee per job (e.g., 150,000 IDR)
- Total payment shows on job cards once assignments are made

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id/status` - Update job status
- `POST /api/jobs/:id/assign-reporter` - Assign reporter to job
- `POST /api/jobs/:id/assign-editor` - Assign editor to job
- `GET /api/jobs/:id/suggested-reporters` - Get suggested reporters (location-based)
- `GET /api/jobs/:id/payment` - Get payment calculation

### Reporters
- `GET /api/reporters` - List all reporters
- `POST /api/reporters` - Create new reporter
- `PATCH /api/reporters/:id/availability` - Update availability

### Editors
- `GET /api/editors` - List all editors
- `POST /api/editors` - Create new editor
- `PATCH /api/editors/:id/availability` - Update availability

## Key Features

### State Machine Implementation

The workflow uses a state machine pattern defined in `shared/types/index.ts`:

```typescript
export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [], // Terminal state
};
```

This ensures jobs can only move through valid states.

### Location-Based Assignment

The system prefers same-location assignments:

```typescript
getSuggestedReporters(jobId: number) {
  const job = this.getJobById(jobId);
  const sameLocationReporters = this.reporterRepo.findAvailableByLocation(job.location);
  const otherReporters = this.reporterRepo
    .findAllAvailable()
    .filter(r => r.location !== job.location);

  return {
    preferred: sameLocationReporters,
    others: otherReporters,
  };
}
```

This helps reduce travel costs for physical court reporting jobs.

### Payment Calculation

Payment is calculated based on:
- Reporter: `duration × ratePerMinute`
- Editor: `flatFeePerJob`
- Total: Sum of both

## Development Notes

### Why SQLite?

SQLite is used for simplicity and portability. The schema design is production-ready and could easily be migrated to PostgreSQL by:
1. Installing `pg` instead of `better-sqlite3`
2. Updating the database connection in `backend/src/config/database.ts`
3. Adjusting SQL syntax if needed (SQLite is mostly compatible)

### Error Handling

The API returns meaningful error messages for validation failures:
- "Cannot mark as transcribed without assigned reporter"
- "Invalid transition: cannot move from NEW to COMPLETED"
- "Reporter is not available"

### Type Safety

The project uses shared TypeScript types between frontend and backend to ensure type safety across the full stack.

### Path Aliases

The project uses TypeScript path aliases to keep imports clean:

**Instead of:**
```typescript
import { Job } from '../../../shared/types';
```

**We use:**
```typescript
import { Job } from '@shared/types';
```

This is configured in:
- `tsconfig.json` for TypeScript compilation
- `vite.config.ts` for frontend bundling
- `tsconfig-paths` package for backend runtime

See [PATH_ALIASES.md](PATH_ALIASES.md) for detailed configuration.

## Building for Production

```bash
npm run build
```

This builds both backend and frontend:
- Backend: Compiled to `backend/dist/`
- Frontend: Static files in `frontend/dist/`

To run in production:

```bash
cd backend
npm start
```

Serve the frontend static files using nginx or similar.

## Deploying to Vercel

This application is ready to deploy to Vercel with a PostgreSQL database (Neon).

### Database Setup

1. **Create a Neon Database** (recommended for Vercel):
   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project
   - Copy the connection string

2. **Alternative: Use Vercel Postgres**:
   - In your Vercel project dashboard, go to Storage
   - Create a Postgres database
   - Copy the `DATABASE_URL` from the connection details

### Backend Deployment

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Vercel deployment support"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Root Directory**: `backend`
     - **Framework Preset**: Other
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Set Environment Variables** in Vercel:
   - `DATABASE_URL`: Your Neon or Vercel Postgres connection string
   - `PORT`: 3001 (optional, defaults to 3001)

4. Deploy! The backend will:
   - Automatically detect `DATABASE_URL` and use PostgreSQL (Neon)
   - Skip installing `better-sqlite3` (it's optional)
   - Create database tables on first run
   - Insert sample data if tables are empty

### Frontend Deployment

1. **Deploy to Vercel**:
   - Add another project for the frontend
   - Configure the project:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Set Environment Variables**:
   - `VITE_API_URL`: Your backend Vercel URL (e.g., `https://your-backend.vercel.app`)

### How It Works

The application automatically switches between databases based on the `DATABASE_URL` environment variable:

- **Local Development** (no `DATABASE_URL`): Uses SQLite with `better-sqlite3`
- **Production** (with `DATABASE_URL`): Uses PostgreSQL via Neon serverless driver

This is handled in `backend/src/config/db-config.ts` which dynamically imports the correct database module and repository implementations.

### Troubleshooting

**Build fails with better-sqlite3 errors**:
- This is expected when `DATABASE_URL` is set
- `better-sqlite3` is marked as optional and won't be installed in production
- The app will use PostgreSQL instead

**Database tables not created**:
- Check Vercel function logs
- Ensure `DATABASE_URL` is correctly set
- The `initializeDatabase()` function runs on server startup

**CORS errors**:
- Update the CORS configuration in `backend/src/index.ts` to allow your frontend domain
- Or use Vercel's built-in proxy features

## Future Enhancements

Possible improvements for a production system:
- User authentication and authorization
- Real-time updates using WebSockets
- File upload for transcription documents
- Email notifications for assignments
- Advanced reporting and analytics
- Audit log for state changes
- Pagination for large job lists

## Assessment Notes

This project demonstrates:
- ✅ Full-stack TypeScript development
- ✅ Clean architecture with separation of concerns
- ✅ RESTful API design
- ✅ Database schema design and relationships
- ✅ Business logic implementation (state machine, assignment algorithm)
- ✅ React component composition
- ✅ State management in React
- ✅ Type safety across the stack
- ✅ User-friendly UI/UX

---

Built for VoiceScript Full Stack Developer Assessment
