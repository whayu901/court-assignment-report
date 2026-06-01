import { useEffect, useState } from 'react';
import { Job, Reporter, Editor, JobStatus, CreateJobRequest, Payment } from '@shared/types';
import { JobCard } from '@components/JobCard';
import { CreateJobModal } from '@components/CreateJobModal';
import { AssignmentModal } from '@components/AssignmentModal';
import { JobDetailModal } from '@components/JobDetailModal';
import * as api from '@services/api';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [payments, setPayments] = useState<Record<number, Payment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState<{
    job: Job;
    type: 'reporter' | 'editor';
  } | null>(null);
  const [detailModalJob, setDetailModalJob] = useState<Job | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [jobsData, reportersData, editorsData] = await Promise.all([
        api.fetchJobs(),
        api.fetchReporters(),
        api.fetchEditors(),
      ]);

      setJobs(jobsData);
      setReporters(reportersData);
      setEditors(editorsData);

      // Load payments for jobs that have assignments
      const paymentsData: Record<number, Payment> = {};
      await Promise.all(
        jobsData
          .filter(job => job.reporterId || job.editorId)
          .map(async (job) => {
            try {
              const payment = await api.getJobPayment(job.id);
              paymentsData[job.id] = payment;
            } catch {
              // Ignore payment errors
            }
          })
      );
      setPayments(paymentsData);

      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(data: CreateJobRequest) {
    await api.createJob(data);
    await loadData();
  }

  async function handleAssignReporter(job: Job) {
    setAssignmentModal({ job, type: 'reporter' });
  }

  async function handleAssignEditor(job: Job) {
    setAssignmentModal({ job, type: 'editor' });
  }

  async function handleAssignment(personId: number) {
    if (!assignmentModal) return;

    if (assignmentModal.type === 'reporter') {
      await api.assignReporter(assignmentModal.job.id, personId);
    } else {
      await api.assignEditor(assignmentModal.job.id, personId);
    }

    await loadData();
  }

  async function handleUpdateStatus(job: Job, newStatus: JobStatus) {
    try {
      await api.updateJobStatus(job.id, newStatus);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  const filteredJobs = statusFilter === 'ALL'
    ? jobs
    : jobs.filter(job => job.status === statusFilter);

  const getReporterName = (reporterId?: number) => {
    if (!reporterId) return undefined;
    return reporters.find(r => r.id === reporterId)?.name;
  };

  const getEditorName = (editorId?: number) => {
    if (!editorId) return undefined;
    return editors.find(e => e.id === editorId)?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Court Reporting Workflow
          </h1>
          <p className="text-gray-600">
            Manage transcription jobs and assignments
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded ${
                statusFilter === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All ({jobs.length})
            </button>
            {(['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as JobStatus[]).map((status) => {
              const count = jobs.filter(j => j.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded ${
                    statusFilter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            + Create Job
          </button>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {statusFilter === 'ALL' ? 'No jobs yet. Create one to get started!' : `No ${statusFilter} jobs.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                reporterName={getReporterName(job.reporterId)}
                editorName={getEditorName(job.editorId)}
                payment={payments[job.id]?.totalPayment}
                onAssignReporter={handleAssignReporter}
                onAssignEditor={handleAssignEditor}
                onUpdateStatus={handleUpdateStatus}
                onClick={setDetailModalJob}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateJobModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateJob}
          />
        )}

        {assignmentModal && (
          <AssignmentModal
            job={assignmentModal.job}
            type={assignmentModal.type}
            onClose={() => setAssignmentModal(null)}
            onAssign={handleAssignment}
          />
        )}

        {detailModalJob && (
          <JobDetailModal
            job={detailModalJob}
            reporter={detailModalJob.reporterId ? reporters.find(r => r.id === detailModalJob.reporterId) : undefined}
            editor={detailModalJob.editorId ? editors.find(e => e.id === detailModalJob.editorId) : undefined}
            payment={payments[detailModalJob.id]}
            onClose={() => setDetailModalJob(null)}
            onAssignReporter={handleAssignReporter}
            onAssignEditor={handleAssignEditor}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
