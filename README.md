# Court Reporting Workflow System

A full-stack workflow management system for court reporting agencies to manage transcription jobs, reporter assignments, and payment tracking.

## Overview

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

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation & Running

1. **Install dependencies:**

```bash
npm install
```

2. **Run the application:**

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend app on `http://localhost:5173`

### First Time Setup

When you first run the backend, it will:
- Create a SQLite database at `backend/data/workflow.db`
- Initialize the database schema (jobs, reporters, editors tables)
- Insert sample data (4 reporters, 3 editors)

## Screenshots

| Screenshot | Description |
|------------|-------------|
| ![Main Dashboard](./assets/Screenshot%202026-06-01%20at%2009.46.31.png) | **Main Dashboard** - Job list view showing all jobs with their current status |
| ![Create Job](./assets/Screenshot%202026-06-01%20at%2009.46.43.png) | **Create New Job** - Form to create a new transcription job with case name, duration, and location |
| ![Job Created](./assets/Screenshot%202026-06-01%20at%2009.46.50.png) | **Job Created Successfully** - New job appears in the list with NEW status |
| ![Assign Reporter](./assets/Screenshot%202026-06-01%20at%2009.47.09.png) | **Assign Reporter** - Location-based reporter suggestions (preferred reporters highlighted in green) |
| ![Reporter Assigned](./assets/Screenshot%202026-06-01%20at%2009.47.32.png) | **Reporter Assigned** - Job status updated to ASSIGNED with reporter information |
| ![Transcribed](./assets/Screenshot%202026-06-01%20at%2009.47.39.png) | **Mark as Transcribed** - Moving job to TRANSCRIBED status after reporter completes work |
| ![Assign Editor](./assets/Screenshot%202026-06-01%20at%2009.47.58.png) | **Assign Editor** - Selecting an available editor for review |
| ![Complete Workflow](./assets/Screenshot%202026-06-01%20at%2009.48.14.png) | **Complete Workflow** - Final status with full payment calculation (reporter + editor fees) |

## Features

### State Machine Workflow

Jobs follow a strict workflow with enforced transitions:

```
NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED
```

**Business Rules:**
- Can't assign reporter if job isn't NEW
- Can't move to TRANSCRIBED without a reporter
- Can't assign editor unless job is TRANSCRIBED
- Can't move to REVIEWED without an editor
- Can only transition to valid next states (no skipping)

### Location-Based Assignment

The system intelligently suggests reporters:
- **Preferred**: Reporters from the same location (highlighted in green)
- **Others**: Reporters from different locations (shown separately)

This helps reduce travel costs for physical court reporting jobs.

### Payment Tracking

Automatic payment calculation:
- **Reporters**: Paid per minute (e.g., 2,000 IDR/minute)
- **Editors**: Flat fee per job (e.g., 150,000 IDR)
- **Total**: Sum of both, displayed on job cards

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id/status` - Update job status
- `POST /api/jobs/:id/assign-reporter` - Assign reporter to job
- `POST /api/jobs/:id/assign-editor` - Assign editor to job
- `GET /api/jobs/:id/suggested-reporters` - Get location-based suggestions
- `GET /api/jobs/:id/payment` - Get payment calculation

### Reporters
- `GET /api/reporters` - List all reporters
- `POST /api/reporters` - Create new reporter
- `PATCH /api/reporters/:id/availability` - Update availability

### Editors
- `GET /api/editors` - List all editors
- `POST /api/editors` - Create new editor
- `PATCH /api/editors/:id/availability` - Update availability

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
│   │   └── App.tsx        # Main application
│   └── index.html
└── shared/
    └── types/             # Shared TypeScript types
```

## Key Implementation Details

### State Machine Pattern

```typescript
export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [], // Terminal state
};
```

### Location-Based Assignment Algorithm

```typescript
getSuggestedReporters(jobId: number) {
  const job = this.getJobById(jobId);
  const sameLocationReporters = this.reporterRepo
    .findAvailableByLocation(job.location);
  const otherReporters = this.reporterRepo
    .findAllAvailable()
    .filter(r => r.location !== job.location);

  return {
    preferred: sameLocationReporters,
    others: otherReporters,
  };
}
```

### Type Safety

Shared TypeScript types ensure type safety across the full stack:
- `Job`, `Reporter`, `Editor` types
- `JobStatus` enum
- API request/response types
- Validation types

## Development Notes

### Clean Architecture

The backend follows a layered architecture pattern:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic and orchestration
- **Repositories**: Handle database operations
- **Types**: Shared type definitions

### Error Handling

The API returns meaningful error messages:
- "Cannot mark as transcribed without assigned reporter"
- "Invalid transition: cannot move from NEW to COMPLETED"
- "Reporter is not available"

### Build for Production

```bash
npm run build
```

This builds both backend and frontend:
- Backend: Compiled to `backend/dist/`
- Frontend: Static files in `frontend/dist/`

## Assessment Checklist

This project demonstrates:
- ✅ Full-stack TypeScript development
- ✅ Clean architecture with separation of concerns
- ✅ RESTful API design
- ✅ Database schema design and relationships
- ✅ Business logic implementation (state machine, assignment algorithm)
- ✅ React component composition and state management
- ✅ Type safety across the stack
- ✅ User-friendly UI/UX with TailwindCSS
- ✅ Monorepo structure with npm workspaces

---

**Built for VoiceScript Full Stack Developer Assessment**
