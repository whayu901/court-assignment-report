import { JobRepository } from '@repositories/JobRepository';
import { ReporterRepository } from '@repositories/ReporterRepository';
import { EditorRepository } from '@repositories/EditorRepository';
import { Job, JobStatus, Payment, VALID_TRANSITIONS } from '@shared/types';

export class JobService {
  private jobRepo = new JobRepository();
  private reporterRepo = new ReporterRepository();
  private editorRepo = new EditorRepository();

  async getAllJobs(): Promise<Job[]> {
    return this.jobRepo.findAll();
  }

  async getJobById(id: number): Promise<Job> {
    const job = await this.jobRepo.findById(id);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async createJob(caseName: string, duration: number, location: string): Promise<Job> {
    if (!caseName || caseName.trim() === '') {
      throw new Error('Case name is required');
    }
    if (duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    if (!location || location.trim() === '') {
      throw new Error('Location is required');
    }

    return this.jobRepo.create(caseName, duration, location);
  }

  // State machine: validate and transition job status
  async updateJobStatus(id: number, newStatus: JobStatus): Promise<Job> {
    const job = await this.getJobById(id);
    const validNextStates = VALID_TRANSITIONS[job.status];

    if (!validNextStates.includes(newStatus)) {
      throw new Error(
        `Invalid transition: cannot move from ${job.status} to ${newStatus}`
      );
    }

    // Business rule: can't move to TRANSCRIBED without a reporter
    if (newStatus === 'TRANSCRIBED' && !job.reporterId) {
      throw new Error('Cannot mark as transcribed without assigned reporter');
    }

    // Business rule: can't move to REVIEWED without an editor
    if (newStatus === 'REVIEWED' && !job.editorId) {
      throw new Error('Cannot mark as reviewed without assigned editor');
    }

    await this.jobRepo.updateStatus(id, newStatus);
    return this.getJobById(id);
  }

  // Smart assignment: prefer reporters from the same location
  async assignReporter(jobId: number, reporterId: number): Promise<Job> {
    const job = await this.getJobById(jobId);
    const reporter = await this.reporterRepo.findById(reporterId);

    if (!reporter) {
      throw new Error('Reporter not found');
    }

    if (!reporter.isAvailable) {
      throw new Error('Reporter is not available');
    }

    if (job.status !== 'NEW') {
      throw new Error('Can only assign reporter to jobs with NEW status');
    }

    await this.jobRepo.assignReporter(jobId, reporterId);
    return this.getJobById(jobId);
  }

  // Get suggested reporters (same location first, then others)
  async getSuggestedReporters(jobId: number) {
    const job = await this.getJobById(jobId);
    const sameLocationReporters = await this.reporterRepo.findAvailableByLocation(job.location);
    const allAvailableReporters = await this.reporterRepo.findAllAvailable();
    const otherReporters = allAvailableReporters.filter(r => r.location !== job.location);

    return {
      preferred: sameLocationReporters,
      others: otherReporters,
    };
  }

  async assignEditor(jobId: number, editorId: number): Promise<Job> {
    const job = await this.getJobById(jobId);
    const editor = await this.editorRepo.findById(editorId);

    if (!editor) {
      throw new Error('Editor not found');
    }

    if (!editor.isAvailable) {
      throw new Error('Editor is not available');
    }

    if (job.status !== 'TRANSCRIBED') {
      throw new Error('Can only assign editor to transcribed jobs');
    }

    await this.jobRepo.assignEditor(jobId, editorId);
    return this.getJobById(jobId);
  }

  // Calculate payment for a job
  async calculatePayment(jobId: number): Promise<Payment> {
    const job = await this.getJobById(jobId);
    let reporterPayment: number | undefined;
    let editorPayment: number | undefined;

    if (job.reporterId) {
      const reporter = await this.reporterRepo.findById(job.reporterId);
      if (reporter) {
        reporterPayment = job.duration * reporter.ratePerMinute;
      }
    }

    if (job.editorId) {
      const editor = await this.editorRepo.findById(job.editorId);
      if (editor) {
        editorPayment = editor.flatFeePerJob;
      }
    }

    const totalPayment = (reporterPayment || 0) + (editorPayment || 0);

    return {
      jobId: job.id,
      reporterPayment,
      editorPayment,
      totalPayment,
    };
  }
}
