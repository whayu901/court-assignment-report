import express from 'express';
import cors from 'cors';
import { initializeDatabase } from '@config/db-config';
import routes from '@routes/index';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Initialize database
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// Initialize database and setup routes
ensureDatabaseInitialized().then(() => {
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
});

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  ensureDatabaseInitialized().then(() => {
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Health check at http://localhost:${PORT}/health\n`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

// Export for Vercel serverless
export default app;
