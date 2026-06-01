import express from 'express';
import cors from 'cors';
import { initializeDatabase } from '@config/db-config';
import routes from '@routes/index';
import path from 'path';
import fs from 'fs';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists (only for SQLite/local development)
if (!process.env.DATABASE_URL) {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize database once
let dbInitialized = false;
const dbInitPromise = (async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
})();

// Middleware to ensure DB is initialized
app.use(async (req, res, next) => {
  await dbInitPromise;
  next();
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Voice-over Workflow API',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

export default app;
