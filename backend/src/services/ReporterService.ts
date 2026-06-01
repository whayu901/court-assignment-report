import { ReporterRepository } from '@repositories/ReporterRepository';
import { Reporter } from '@shared/types';

export class ReporterService {
  private reporterRepo = new ReporterRepository();

  async getAllReporters(): Promise<Reporter[]> {
    return this.reporterRepo.findAll();
  }

  async getReporterById(id: number): Promise<Reporter> {
    const reporter = await this.reporterRepo.findById(id);
    if (!reporter) throw new Error('Reporter not found');
    return reporter;
  }

  async createReporter(name: string, location: string, ratePerMinute: number): Promise<Reporter> {
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }
    if (!location || location.trim() === '') {
      throw new Error('Location is required');
    }
    if (ratePerMinute <= 0) {
      throw new Error('Rate per minute must be greater than 0');
    }

    return this.reporterRepo.create(name, location, ratePerMinute);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<Reporter> {
    await this.getReporterById(id); // Ensure reporter exists
    await this.reporterRepo.updateAvailability(id, isAvailable);
    return this.getReporterById(id);
  }
}
