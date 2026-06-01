import { Job, Reporter, Editor, Payment, JobStatus, VALID_TRANSITIONS } from '@shared/types';

interface JobDetailModalProps {
  job: Job;
  reporter?: Reporter;
  editor?: Editor;
  payment?: Payment;
  onClose: () => void;
  onAssignReporter: (job: Job) => void;
  onAssignEditor: (job: Job) => void;
  onUpdateStatus: (job: Job, newStatus: JobStatus) => void;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  NEW: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  TRANSCRIBED: 'bg-yellow-100 text-yellow-800',
  REVIEWED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export function JobDetailModal({
  job,
  reporter,
  editor,
  payment,
  onClose,
  onAssignReporter,
  onAssignEditor,
  onUpdateStatus,
}: JobDetailModalProps) {
  const validNextStates = VALID_TRANSITIONS[job.status];
  const canAssignReporter = job.status === 'NEW' && !job.reporterId;
  const canAssignEditor = job.status === 'TRANSCRIBED' && !job.editorId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{job.caseName}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[job.status]}`}>
              {job.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-4"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Job Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Job ID:</span>
                <span className="font-medium text-gray-900">#{job.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">
                  {job.duration} minutes ({(job.duration / 60).toFixed(1)} hours)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">{formatDate(job.updatedAt)}</span>
              </div>
            </div>
          </section>

          {/* Reporter Assignment */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Reporter Assignment</h3>
            {reporter ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{reporter.name}</div>
                    <div className="text-sm text-gray-600">{reporter.location}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reporter.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {reporter.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-sm text-gray-600">Rate:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(reporter.ratePerMinute)}/minute
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(reporter.ratePerMinute * job.duration)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-3">No reporter assigned yet</p>
                {canAssignReporter && (
                  <button
                    onClick={() => onAssignReporter(job)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Assign Reporter
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Editor Assignment */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Editor Assignment</h3>
            {editor ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{editor.name}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    editor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {editor.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-200">
                  <span className="text-sm text-gray-600">Flat Fee:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(editor.flatFeePerJob)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-3">
                  {job.status === 'TRANSCRIBED'
                    ? 'No editor assigned yet'
                    : 'Editor can be assigned after transcription'}
                </p>
                {canAssignEditor && (
                  <button
                    onClick={() => onAssignEditor(job)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Assign Editor
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Payment Summary */}
          {payment && (payment.reporterPayment || payment.editorPayment) && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                {payment.reporterPayment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reporter Payment:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(payment.reporterPayment)}
                    </span>
                  </div>
                )}
                {payment.editorPayment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Editor Payment:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(payment.editorPayment)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t-2 border-green-300">
                  <span className="font-semibold text-gray-900">Total Cost:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(payment.totalPayment)}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Workflow Progress */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow Progress</h3>
            <div className="space-y-2">
              {(['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as JobStatus[]).map((status, index) => {
                const currentIndex = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'].indexOf(job.status);
                const statusIndex = index;
                const isComplete = statusIndex <= currentIndex;
                const isCurrent = statusIndex === currentIndex;

                return (
                  <div key={status} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isComplete ? '✓' : index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                        {status}
                      </div>
                      {isCurrent && (
                        <div className="text-sm text-gray-600">Current stage</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {canAssignReporter && (
                <button
                  onClick={() => onAssignReporter(job)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign Reporter
                </button>
              )}

              {canAssignEditor && (
                <button
                  onClick={() => onAssignEditor(job)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Assign Editor
                </button>
              )}

              {validNextStates.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => onUpdateStatus(job, nextStatus)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Move to {nextStatus}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
