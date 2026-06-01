// Database configuration - using SQLite

import { initializeDatabase as initSQLite } from './database';
import { JobRepository } from '@repositories/JobRepository';
import { ReporterRepository } from '@repositories/ReporterRepository';
import { EditorRepository } from '@repositories/EditorRepository';

// Export the database initialization
export async function initializeDatabase() {
  console.log('Using SQLite database');
  return initSQLite();
}

// Export repository factories
export async function createJobRepository() {
  return new JobRepository();
}

export async function createReporterRepository() {
  return new ReporterRepository();
}

export async function createEditorRepository() {
  return new EditorRepository();
}
