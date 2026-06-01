import { ReporterRepository } from '@repositories/ReporterRepository';
import { Reporter } from '@shared/types';

export class ReporterService {
  private reporterRepo = new ReporterRepository();

  getAllReporters(): Reporter[] {
    return this.reporterRepo.findAll();
  }

  getReporterById(id: number): Reporter {
    const reporter = this.reporterRepo.findById(id);
    if (!reporter) throw new Error('Reporter not found');
    return reporter;
  }

  createReporter(name: string, location: string, ratePerMinute: number): Reporter {
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

  updateAvailability(id: number, isAvailable: boolean): Reporter {
    this.getReporterById(id); // Ensure reporter exists
    this.reporterRepo.updateAvailability(id, isAvailable);
    return this.getReporterById(id);
  }
}
