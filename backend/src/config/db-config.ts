// Database configuration - automatically selects SQLite or PostgreSQL based on environment

// Check DATABASE_URL lazily (when function is called, not at module load time)
function usePostgres() {
  return process.env.DATABASE_URL !== undefined;
}

// Export the appropriate database module
export async function initializeDatabase() {
  if (usePostgres()) {
    console.log('Using PostgreSQL (Neon)');
    const { initializeDatabase: initPostgres } = await import('./database-postgres');
    return initPostgres();
  } else {
    console.log('Using SQLite (local development)');
    const { initializeDatabase: initSQLite } = await import('./database');
    return initSQLite();
  }
}

// Export repository factories
export async function createJobRepository() {
  if (usePostgres()) {
    const { JobRepository } = await import('@repositories/JobRepository-postgres');
    return new JobRepository();
  } else {
    const { JobRepository } = await import('@repositories/JobRepository');
    return new JobRepository();
  }
}

export async function createReporterRepository() {
  if (usePostgres()) {
    const { ReporterRepository } = await import('@repositories/ReporterRepository-postgres');
    return new ReporterRepository();
  } else {
    const { ReporterRepository } = await import('@repositories/ReporterRepository');
    return new ReporterRepository();
  }
}

export async function createEditorRepository() {
  if (usePostgres()) {
    const { EditorRepository } = await import('@repositories/EditorRepository-postgres');
    return new EditorRepository();
  } else {
    const { EditorRepository } = await import('@repositories/EditorRepository');
    return new EditorRepository();
  }
}
