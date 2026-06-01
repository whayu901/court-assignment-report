import { Request, Response } from 'express';
import { ReporterService } from '@services/ReporterService';
import { CreateReporterRequest } from '@shared/types';

export class ReporterController {
  private reporterService = new ReporterService();

  getAllReporters = async (req: Request, res: Response) => {
    try {
      const reporters = this.reporterService.getAllReporters();
      res.json(reporters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reporters' });
    }
  };

  getReporterById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const reporter = this.reporterService.getReporterById(id);
      res.json(reporter);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reporter';
      res.status(404).json({ error: message });
    }
  };

  createReporter = async (req: Request, res: Response) => {
    try {
      const { name, location, ratePerMinute } = req.body as CreateReporterRequest;
      const reporter = this.reporterService.createReporter(name, location, ratePerMinute);
      res.status(201).json(reporter);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create reporter';
      res.status(400).json({ error: message });
    }
  };

  updateAvailability = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isAvailable } = req.body;
      const reporter = this.reporterService.updateAvailability(id, isAvailable);
      res.json(reporter);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update availability';
      res.status(400).json({ error: message });
    }
  };
}
