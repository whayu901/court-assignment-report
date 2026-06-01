import { useState, useEffect } from 'react';
import { Job, Reporter, Editor } from '@shared/types';
import { getSuggestedReporters, fetchEditors } from '@services/api';

interface AssignmentModalProps {
  job: Job;
  type: 'reporter' | 'editor';
  onClose: () => void;
  onAssign: (personId: number) => Promise<void>;
}

export function AssignmentModal({ job, type, onClose, onAssign }: AssignmentModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For reporters
  const [preferredReporters, setPreferredReporters] = useState<Reporter[]>([]);
  const [otherReporters, setOtherReporters] = useState<Reporter[]>([]);

  // For editors
  const [editors, setEditors] = useState<Editor[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (type === 'reporter') {
          const suggestions = await getSuggestedReporters(job.id);
          setPreferredReporters(suggestions.preferred);
          setOtherReporters(suggestions.others);
        } else {
          const editorList = await fetchEditors();
          setEditors(editorList.filter(e => e.isAvailable));
        }
      } catch (err) {
        setError('Failed to load options');
      }
    }
    loadData();
  }, [job.id, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onAssign(selectedId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-2">
          Assign {type === 'reporter' ? 'Reporter' : 'Editor'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {job.caseName} • {job.location}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'reporter' && (
            <>
              {preferredReporters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Same Location ({job.location}) - Recommended
                  </label>
                  <div className="space-y-2">
                    {preferredReporters.map((reporter) => (
                      <label
                        key={reporter.id}
                        className="flex items-center p-3 border rounded cursor-pointer hover:bg-blue-50 border-blue-300"
                      >
                        <input
                          type="radio"
                          name="reporter"
                          value={reporter.id}
                          checked={selectedId === reporter.id}
                          onChange={() => setSelectedId(reporter.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{reporter.name}</div>
                          <div className="text-sm text-gray-600">
                            Rp {reporter.ratePerMinute.toLocaleString()}/min
                            {' • '}
                            Rp {(reporter.ratePerMinute * job.duration).toLocaleString()} total
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {otherReporters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Locations
                  </label>
                  <div className="space-y-2">
                    {otherReporters.map((reporter) => (
                      <label
                        key={reporter.id}
                        className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="reporter"
                          value={reporter.id}
                          checked={selectedId === reporter.id}
                          onChange={() => setSelectedId(reporter.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{reporter.name}</div>
                          <div className="text-sm text-gray-600">
                            {reporter.location} • Rp {reporter.ratePerMinute.toLocaleString()}/min
                            {' • '}
                            Rp {(reporter.ratePerMinute * job.duration).toLocaleString()} total
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'editor' && (
            <div className="space-y-2">
              {editors.map((editor) => (
                <label
                  key={editor.id}
                  className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="editor"
                    value={editor.id}
                    checked={selectedId === editor.id}
                    onChange={() => setSelectedId(editor.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{editor.name}</div>
                    <div className="text-sm text-gray-600">
                      Rp {editor.flatFeePerJob.toLocaleString()} per job
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedId || isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
