// Vercel serverless entry point (plain JavaScript - no TypeScript compilation needed)
const express = require('express');
const cors = require('cors');

// Import database config
const { initializeDatabase } = require('../dist/config/db-config');

// Import routes
const routes = require('../dist/routes/index').default;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
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

module.exports = app;
