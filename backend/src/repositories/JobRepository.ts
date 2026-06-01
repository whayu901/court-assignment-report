import { db } from '@config/database';
import { Job, JobStatus } from '@shared/types';

interface JobRow {
  id: number;
  case_name: string;
  duration: number;
  location: string;
  status: JobStatus;
  reporter_id: number | null;
  editor_id: number | null;
  created_at: string;
  updated_at: string;
}

export class JobRepository {
  private mapRowToJob(row: JobRow): Job {
    return {
      id: row.id,
      caseName: row.case_name,
      duration: row.duration,
      location: row.location,
      status: row.status,
      reporterId: row.reporter_id ?? undefined,
      editorId: row.editor_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(): Promise<Job[]> {
    const rows = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all() as JobRow[];
    return rows.map(this.mapRowToJob);
  }

  async findById(id: number): Promise<Job | null> {
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow | undefined;
    return row ? this.mapRowToJob(row) : null;
  }

  async create(caseName: string, duration: number, location: string): Promise<Job> {
    const result = db.prepare(`
      INSERT INTO jobs (case_name, duration, location, status)
      VALUES (?, ?, ?, 'NEW')
    `).run(caseName, duration, location);

    const job = await this.findById(result.lastInsertRowid as number);
    if (!job) throw new Error('Failed to create job');
    return job;
  }

  async updateStatus(id: number, status: JobStatus): Promise<boolean> {
    const result = db.prepare(`
      UPDATE jobs
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, id);

    return result.changes > 0;
  }

  async assignReporter(id: number, reporterId: number): Promise<boolean> {
    const result = db.prepare(`
      UPDATE jobs
      SET reporter_id = ?, status = 'ASSIGNED', updated_at = datetime('now')
      WHERE id = ?
    `).run(reporterId, id);

    return result.changes > 0;
  }

  async assignEditor(id: number, editorId: number): Promise<boolean> {
    const result = db.prepare(`
      UPDATE jobs
      SET editor_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(editorId, id);

    return result.changes > 0;
  }
}
