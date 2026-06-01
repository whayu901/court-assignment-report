import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/workflow.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // Create jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      reporter_id INTEGER,
      editor_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES reporters(id),
      FOREIGN KEY (editor_id) REFERENCES editors(id),
      CHECK (status IN ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'))
    )
  `);

  // Create reporters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reporters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      rate_per_minute INTEGER NOT NULL
    )
  `);

  // Create editors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS editors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      flat_fee_per_job INTEGER NOT NULL
    )
  `);

  // Insert some sample data for testing
  const reporterCount = db.prepare('SELECT COUNT(*) as count FROM reporters').get() as { count: number };

  if (reporterCount.count === 0) {
    db.exec(`
      INSERT INTO reporters (name, location, is_available, rate_per_minute) VALUES
      ('Ahmad Hidayat', 'Jakarta', 1, 2000),
      ('Siti Nurhaliza', 'Jakarta', 1, 2500),
      ('Budi Santoso', 'Bandung', 1, 1800),
      ('Dewi Kusuma', 'Surabaya', 1, 2200);
    `);

    db.exec(`
      INSERT INTO editors (name, is_available, flat_fee_per_job) VALUES
      ('Rina Wijaya', 1, 150000),
      ('Eko Prasetyo', 1, 175000),
      ('Mega Putri', 1, 160000);
    `);

    console.log('✓ Sample data inserted');
  }

  console.log('✓ Database initialized');
}
