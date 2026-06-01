import { sql } from "../config/database-postgres";
import { Reporter } from "@shared/types";

export class ReporterRepository {
  async findAll(): Promise<Reporter[]> {
    const rows = await sql`SELECT * FROM reporters`;
    return rows.map(this.mapRowToReporter);
  }

  async findById(id: number): Promise<Reporter | null> {
    const rows = await sql`SELECT * FROM reporters WHERE id = ${id}`;
    return rows.length > 0 ? this.mapRowToReporter(rows[0]) : null;
  }

  async findAvailableByLocation(location: string): Promise<Reporter[]> {
    const rows = await sql`
      SELECT * FROM reporters
      WHERE is_available = true AND location = ${location}
    `;
    return rows.map(this.mapRowToReporter);
  }

  async findAllAvailable(): Promise<Reporter[]> {
    const rows = await sql`SELECT * FROM reporters WHERE is_available = true`;
    return rows.map(this.mapRowToReporter);
  }

  async create(
    name: string,
    location: string,
    ratePerMinute: number,
  ): Promise<Reporter> {
    const rows = await sql`
      INSERT INTO reporters (name, location, rate_per_minute)
      VALUES (${name}, ${location}, ${ratePerMinute})
      RETURNING *
    `;

    return this.mapRowToReporter(rows[0]);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<boolean> {
    const result = await sql`
      UPDATE reporters SET is_available = ${isAvailable} WHERE id = ${id}
    `;

    return result.length > 0;
  }

  private mapRowToReporter(row: any): Reporter {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      isAvailable: row.is_available,
      ratePerMinute: row.rate_per_minute,
    };
  }
}
