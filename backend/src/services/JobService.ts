import { JobRepository } from '@repositories/JobRepository';
import { ReporterRepository } from '@repositories/ReporterRepository';
import { EditorRepository } from '@repositories/EditorRepository';
import { Job, JobStatus, Payment, VALID_TRANSITIONS } from '@shared/types';

export class JobService {
  private jobRepo = new JobRepository();
  private reporterRepo = new ReporterRepository();
  private editorRepo = new EditorRepository();

  getAllJobs(): Job[] {
    return this.jobRepo.findAll();
  }

  getJobById(id: number): Job {
    const job = this.jobRepo.findById(id);
    if (!job) throw new Error('Job not found');
    return job;
  }

  createJob(caseName: string, duration: number, location: string): Job {
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
  updateJobStatus(id: number, newStatus: JobStatus): Job {
    const job = this.getJobById(id);
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

    this.jobRepo.updateStatus(id, newStatus);
    return this.getJobById(id);
  }

  // Smart assignment: prefer reporters from the same location
  assignReporter(jobId: number, reporterId: number): Job {
    const job = this.getJobById(jobId);
    const reporter = this.reporterRepo.findById(reporterId);

    if (!reporter) {
      throw new Error('Reporter not found');
    }

    if (!reporter.isAvailable) {
      throw new Error('Reporter is not available');
    }

    if (job.status !== 'NEW') {
      throw new Error('Can only assign reporter to jobs with NEW status');
    }

    this.jobRepo.assignReporter(jobId, reporterId);
    return this.getJobById(jobId);
  }

  // Get suggested reporters (same location first, then others)
  getSuggestedReporters(jobId: number) {
    const job = this.getJobById(jobId);
    const sameLocationReporters = this.reporterRepo.findAvailableByLocation(job.location);
    const otherReporters = this.reporterRepo
      .findAllAvailable()
      .filter(r => r.location !== job.location);

    return {
      preferred: sameLocationReporters,
      others: otherReporters,
    };
  }

  assignEditor(jobId: number, editorId: number): Job {
    const job = this.getJobById(jobId);
    const editor = this.editorRepo.findById(editorId);

    if (!editor) {
      throw new Error('Editor not found');
    }

    if (!editor.isAvailable) {
      throw new Error('Editor is not available');
    }

    if (job.status !== 'TRANSCRIBED') {
      throw new Error('Can only assign editor to transcribed jobs');
    }

    this.jobRepo.assignEditor(jobId, editorId);
    return this.getJobById(jobId);
  }

  // Calculate payment for a job
  calculatePayment(jobId: number): Payment {
    const job = this.getJobById(jobId);
    let reporterPayment: number | undefined;
    let editorPayment: number | undefined;

    if (job.reporterId) {
      const reporter = this.reporterRepo.findById(job.reporterId);
      if (reporter) {
        reporterPayment = job.duration * reporter.ratePerMinute;
      }
    }

    if (job.editorId) {
      const editor = this.editorRepo.findById(job.editorId);
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
