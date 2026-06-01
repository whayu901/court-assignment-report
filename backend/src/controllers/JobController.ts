import { Request, Response } from 'express';
import { JobService } from '@services/JobService';
import {
  CreateJobRequest,
  AssignReporterRequest,
  AssignEditorRequest,
  UpdateJobStatusRequest,
} from '@shared/types';

export class JobController {
  private jobService = new JobService();

  getAllJobs = async (req: Request, res: Response) => {
    try {
      const jobs = this.jobService.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  };

  getJobById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const job = this.jobService.getJobById(id);
      res.json(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch job';
      res.status(404).json({ error: message });
    }
  };

  createJob = async (req: Request, res: Response) => {
    try {
      const { caseName, duration, location } = req.body as CreateJobRequest;
      const job = this.jobService.createJob(caseName, duration, location);
      res.status(201).json(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      res.status(400).json({ error: message });
    }
  };

  updateJobStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body as UpdateJobStatusRequest;
      const job = this.jobService.updateJobStatus(id, status);
      res.json(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update job status';
      res.status(400).json({ error: message });
    }
  };

  assignReporter = async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const { reporterId } = req.body as AssignReporterRequest;
      const job = this.jobService.assignReporter(jobId, reporterId);
      res.json(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign reporter';
      res.status(400).json({ error: message });
    }
  };

  getSuggestedReporters = async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const suggestions = this.jobService.getSuggestedReporters(jobId);
      res.json(suggestions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get suggestions';
      res.status(404).json({ error: message });
    }
  };

  assignEditor = async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const { editorId } = req.body as AssignEditorRequest;
      const job = this.jobService.assignEditor(jobId, editorId);
      res.json(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign editor';
      res.status(400).json({ error: message });
    }
  };

  getPayment = async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const payment = this.jobService.calculatePayment(jobId);
      res.json(payment);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to calculate payment';
      res.status(404).json({ error: message });
    }
  };
}
