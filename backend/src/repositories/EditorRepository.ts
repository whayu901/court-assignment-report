import { db } from '@config/database';
import { Editor } from '@shared/types';

interface EditorRow {
  id: number;
  name: string;
  is_available: number;
  flat_fee_per_job: number;
}

export class EditorRepository {
  private mapRowToEditor(row: EditorRow): Editor {
    return {
      id: row.id,
      name: row.name,
      isAvailable: row.is_available === 1,
      flatFeePerJob: row.flat_fee_per_job,
    };
  }

  findAll(): Editor[] {
    const rows = db.prepare('SELECT * FROM editors').all() as EditorRow[];
    return rows.map(this.mapRowToEditor);
  }

  findById(id: number): Editor | null {
    const row = db.prepare('SELECT * FROM editors WHERE id = ?').get(id) as EditorRow | undefined;
    return row ? this.mapRowToEditor(row) : null;
  }

  findAllAvailable(): Editor[] {
    const rows = db.prepare('SELECT * FROM editors WHERE is_available = 1').all() as EditorRow[];
    return rows.map(this.mapRowToEditor);
  }

  create(name: string, flatFeePerJob: number): Editor {
    const result = db.prepare(`
      INSERT INTO editors (name, flat_fee_per_job)
      VALUES (?, ?)
    `).run(name, flatFeePerJob);

    const editor = this.findById(result.lastInsertRowid as number);
    if (!editor) throw new Error('Failed to create editor');
    return editor;
  }

  updateAvailability(id: number, isAvailable: boolean): boolean {
    const result = db.prepare(`
      UPDATE editors SET is_available = ? WHERE id = ?
    `).run(isAvailable ? 1 : 0, id);

    return result.changes > 0;
  }
}
