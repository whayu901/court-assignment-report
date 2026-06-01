import { Job, JobStatus, VALID_TRANSITIONS } from '@shared/types';

interface JobCardProps {
  job: Job;
  reporterName?: string;
  editorName?: string;
  payment?: number;
  onAssignReporter: (job: Job) => void;
  onAssignEditor: (job: Job) => void;
  onUpdateStatus: (job: Job, newStatus: JobStatus) => void;
  onClick: (job: Job) => void;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  NEW: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  TRANSCRIBED: 'bg-yellow-100 text-yellow-800',
  REVIEWED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export function JobCard({
  job,
  reporterName,
  editorName,
  payment,
  onAssignReporter,
  onAssignEditor,
  onUpdateStatus,
  onClick,
}: JobCardProps) {
  const validNextStates = VALID_TRANSITIONS[job.status];
  const canAssignReporter = job.status === 'NEW' && !job.reporterId;
  const canAssignEditor = job.status === 'TRANSCRIBED' && !job.editorId;

  return (
    <div
      className="bg-white rounded-lg shadow p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(job)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.caseName}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {job.duration} min • {job.location}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {reporterName && (
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Reporter:</span>
            <span className="text-gray-900 font-medium">{reporterName}</span>
          </div>
        )}
        {editorName && (
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Editor:</span>
            <span className="text-gray-900 font-medium">{editorName}</span>
          </div>
        )}
        {payment !== undefined && payment > 0 && (
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Total:</span>
            <span className="text-gray-900 font-semibold">
              Rp {payment.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {canAssignReporter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignReporter(job);
            }}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Assign Reporter
          </button>
        )}

        {canAssignEditor && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignEditor(job);
            }}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Assign Editor
          </button>
        )}

        {validNextStates.map((nextStatus) => (
          <button
            key={nextStatus}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(job, nextStatus);
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            → {nextStatus}
          </button>
        ))}
      </div>
    </div>
  );
}
