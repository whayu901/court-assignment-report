import { sql } from '../config/database-postgres';
import { Editor } from '@shared/types';

export class EditorRepository {
  async findAll(): Promise<Editor[]> {
    const rows = await sql`SELECT * FROM editors`;
    return rows.map(this.mapRowToEditor);
  }

  async findById(id: number): Promise<Editor | null> {
    const rows = await sql`SELECT * FROM editors WHERE id = ${id}`;
    return rows.length > 0 ? this.mapRowToEditor(rows[0]) : null;
  }

  async findAllAvailable(): Promise<Editor[]> {
    const rows = await sql`SELECT * FROM editors WHERE is_available = true`;
    return rows.map(this.mapRowToEditor);
  }

  async create(name: string, flatFeePerJob: number): Promise<Editor> {
    const rows = await sql`
      INSERT INTO editors (name, flat_fee_per_job)
      VALUES (${name}, ${flatFeePerJob})
      RETURNING *
    `;

    return this.mapRowToEditor(rows[0]);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<boolean> {
    const result = await sql`
      UPDATE editors SET is_available = ${isAvailable} WHERE id = ${id}
    `;

    return result.count > 0;
  }

  private mapRowToEditor(row: any): Editor {
    return {
      id: row.id,
      name: row.name,
      isAvailable: row.is_available,
      flatFeePerJob: row.flat_fee_per_job,
    };
  }
}
