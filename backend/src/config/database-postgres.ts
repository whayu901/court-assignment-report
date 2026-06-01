import { neon } from '@neondatabase/serverless';

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(connectionString);

export async function initializeDatabase() {
  console.log('Initializing PostgreSQL database...');

  // Create reporters table
  await sql`
    CREATE TABLE IF NOT EXISTS reporters (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT true,
      rate_per_minute INTEGER NOT NULL
    )
  `;

  // Create editors table
  await sql`
    CREATE TABLE IF NOT EXISTS editors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT true,
      flat_fee_per_job INTEGER NOT NULL
    )
  `;

  // Create jobs table
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      case_name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      reporter_id INTEGER REFERENCES reporters(id),
      editor_id INTEGER REFERENCES editors(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CHECK (status IN ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'))
    )
  `;

  // Check if we need to insert sample data
  const reporterCount = await sql`SELECT COUNT(*) as count FROM reporters`;

  if (reporterCount[0].count === '0' || reporterCount[0].count === 0) {
    // Insert sample reporters
    await sql`
      INSERT INTO reporters (name, location, is_available, rate_per_minute) VALUES
      ('Ahmad Hidayat', 'Jakarta', true, 2000),
      ('Siti Nurhaliza', 'Jakarta', true, 2500),
      ('Budi Santoso', 'Bandung', true, 1800),
      ('Dewi Kusuma', 'Surabaya', true, 2200)
    `;

    // Insert sample editors
    await sql`
      INSERT INTO editors (name, is_available, flat_fee_per_job) VALUES
      ('Rina Wijaya', true, 150000),
      ('Eko Prasetyo', true, 175000),
      ('Mega Putri', true, 160000)
    `;

    // Insert sample jobs
    await sql`
      INSERT INTO jobs (case_name, duration, location, status) VALUES
      ('Smith v. Johnson - Personal Injury Deposition', 240, 'Jakarta', 'NEW'),
      ('ABC Corp v. XYZ Inc - Commercial Contract Dispute', 420, 'Jakarta', 'NEW'),
      ('Dr. Rahman Expert Witness - Medical Malpractice', 360, 'Surabaya', 'NEW'),
      ('Doe v. City of Jakarta - Employment Discrimination', 180, 'Bandung', 'NEW'),
      ('Estate of Williams - Probate Hearing', 120, 'Jakarta', 'NEW')
    `;

    console.log('✓ Sample data inserted');
  }

  console.log('✓ PostgreSQL database initialized');
}
