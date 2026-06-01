import { db } from '@config/database';
import { Reporter } from '@shared/types';

interface ReporterRow {
  id: number;
  name: string;
  location: string;
  is_available: number;
  rate_per_minute: number;
}

export class ReporterRepository {
  private mapRowToReporter(row: ReporterRow): Reporter {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      isAvailable: row.is_available === 1,
      ratePerMinute: row.rate_per_minute,
    };
  }

  async findAll(): Promise<Reporter[]> {
    const rows = db.prepare('SELECT * FROM reporters').all() as ReporterRow[];
    return rows.map(this.mapRowToReporter);
  }

  async findById(id: number): Promise<Reporter | null> {
    const row = db.prepare('SELECT * FROM reporters WHERE id = ?').get(id) as ReporterRow | undefined;
    return row ? this.mapRowToReporter(row) : null;
  }

  async findAvailableByLocation(location: string): Promise<Reporter[]> {
    const rows = db.prepare(`
      SELECT * FROM reporters
      WHERE is_available = 1 AND location = ?
    `).all(location) as ReporterRow[];
    return rows.map(this.mapRowToReporter);
  }

  async findAllAvailable(): Promise<Reporter[]> {
    const rows = db.prepare('SELECT * FROM reporters WHERE is_available = 1').all() as ReporterRow[];
    return rows.map(this.mapRowToReporter);
  }

  async create(name: string, location: string, ratePerMinute: number): Promise<Reporter> {
    const result = db.prepare(`
      INSERT INTO reporters (name, location, rate_per_minute)
      VALUES (?, ?, ?)
    `).run(name, location, ratePerMinute);

    const reporter = await this.findById(result.lastInsertRowid as number);
    if (!reporter) throw new Error('Failed to create reporter');
    return reporter;
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<boolean> {
    const result = db.prepare(`
      UPDATE reporters SET is_available = ? WHERE id = ?
    `).run(isAvailable ? 1 : 0, id);

    return result.changes > 0;
  }
}
