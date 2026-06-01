import {
  Job,
  Reporter,
  Editor,
  Payment,
  CreateJobRequest,
  AssignReporterRequest,
  AssignEditorRequest,
  UpdateJobStatusRequest,
  JobStatus,
} from '@shared/types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Jobs
export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE}/jobs`);
  return handleResponse<Job[]>(response);
}

export async function fetchJob(id: number): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs/${id}`);
  return handleResponse<Job>(response);
}

export async function createJob(data: CreateJobRequest): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Job>(response);
}

export async function updateJobStatus(id: number, status: JobStatus): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status } as UpdateJobStatusRequest),
  });
  return handleResponse<Job>(response);
}

export async function assignReporter(jobId: number, reporterId: number): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/assign-reporter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporterId } as AssignReporterRequest),
  });
  return handleResponse<Job>(response);
}

export async function getSuggestedReporters(jobId: number): Promise<{ preferred: Reporter[], others: Reporter[] }> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/suggested-reporters`);
  return handleResponse(response);
}

export async function assignEditor(jobId: number, editorId: number): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/assign-editor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editorId } as AssignEditorRequest),
  });
  return handleResponse<Job>(response);
}

export async function getJobPayment(jobId: number): Promise<Payment> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/payment`);
  return handleResponse<Payment>(response);
}

// Reporters
export async function fetchReporters(): Promise<Reporter[]> {
  const response = await fetch(`${API_BASE}/reporters`);
  return handleResponse<Reporter[]>(response);
}

// Editors
export async function fetchEditors(): Promise<Editor[]> {
  const response = await fetch(`${API_BASE}/editors`);
  return handleResponse<Editor[]>(response);
}
