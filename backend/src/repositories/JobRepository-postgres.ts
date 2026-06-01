import { sql } from "../config/database-postgres";
import { Job, JobStatus } from "@shared/types";

export class JobRepository {
  async findAll(): Promise<Job[]> {
    const rows = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    return rows.map(this.mapRowToJob);
  }

  async findById(id: number): Promise<Job | null> {
    const rows = await sql`SELECT * FROM jobs WHERE id = ${id}`;
    return rows.length > 0 ? this.mapRowToJob(rows[0]) : null;
  }

  async create(
    caseName: string,
    duration: number,
    location: string,
  ): Promise<Job> {
    const rows = await sql`
      INSERT INTO jobs (case_name, duration, location, status)
      VALUES (${caseName}, ${duration}, ${location}, 'NEW')
      RETURNING *
    `;

    return this.mapRowToJob(rows[0]);
  }

  async updateStatus(id: number, status: JobStatus): Promise<boolean> {
    const result = await sql`
      UPDATE jobs
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return result.length > 0;
  }

  async assignReporter(id: number, reporterId: number): Promise<boolean> {
    const result = await sql`
      UPDATE jobs
      SET reporter_id = ${reporterId}, status = 'ASSIGNED', updated_at = NOW()
      WHERE id = ${id}
    `;

    return result.length > 0;
  }

  async assignEditor(id: number, editorId: number): Promise<boolean> {
    const result = await sql`
      UPDATE jobs
      SET editor_id = ${editorId}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return result.length > 0;
  }

  private mapRowToJob(row: any): Job {
    return {
      id: row.id,
      caseName: row.case_name,
      duration: row.duration,
      location: row.location,
      status: row.status as JobStatus,
      reporterId: row.reporter_id ?? undefined,
      editorId: row.editor_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
