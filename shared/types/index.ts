// Job workflow states
export type JobStatus = 'NEW' | 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED';

// Valid state transitions for the workflow
export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [], // Terminal state
};

export interface Job {
  id: number;
  caseName: string;
  duration: number; // in minutes
  location: string;
  status: JobStatus;
  reporterId?: number;
  editorId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reporter {
  id: number;
  name: string;
  location: string;
  isAvailable: boolean;
  ratePerMinute: number; // in IDR
}

export interface Editor {
  id: number;
  name: string;
  isAvailable: boolean;
  flatFeePerJob: number; // in IDR
}

export interface Payment {
  jobId: number;
  reporterPayment?: number;
  editorPayment?: number;
  totalPayment: number;
}

// API request/response types
export interface CreateJobRequest {
  caseName: string;
  duration: number;
  location: string;
}

export interface AssignReporterRequest {
  reporterId: number;
}

export interface AssignEditorRequest {
  editorId: number;
}

export interface UpdateJobStatusRequest {
  status: JobStatus;
}

export interface CreateReporterRequest {
  name: string;
  location: string;
  ratePerMinute: number;
}

export interface CreateEditorRequest {
  name: string;
  flatFeePerJob: number;
}
