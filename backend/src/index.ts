import app from './app';

const PORT = process.env.PORT || 3001;

// Start server for local development
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ Health check at http://localhost:${PORT}/health\n`);
});
