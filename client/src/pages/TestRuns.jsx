import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import * as testRunApi from '../api/testRun.api';
import RunBuilder from '../components/RunBuilder';
import ResultMeter from '../components/ResultMeter';

function TestRuns() {
  const { activeProject } = useProjects();
  const [runs, setRuns] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!activeProject) return;
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    const res = await testRunApi.listRuns(activeProject._id, params);
    setRuns(res.data.data);
  }, [activeProject, filterStatus, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    await testRunApi.createRun(activeProject._id, data);
    setShowBuilder(false);
    load();
  };

  const handleUpdate = async (data) => {
    await testRunApi.updateRun(activeProject._id, editing._id, data);
    setEditing(null);
    setShowBuilder(false);
    load();
  };

  const handleClone = async (id) => {
    await testRunApi.cloneRun(activeProject._id, id);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test run?')) return;
    await testRunApi.deleteRun(activeProject._id, id);
    load();
  };

  const openEdit = (run) => {
    if (run.status !== 'not_started') {
      alert('Can only edit runs with status not_started');
      return;
    }
    setEditing(run);
    setShowBuilder(true);
  };

  const openCreate = () => {
    setEditing(null);
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditing(null);
  };

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to manage test runs
      </div>
    );
  }

  const statusPill = (status) => {
    const map = {
      completed: 'bg-pass/10 text-pass',
      in_progress: 'bg-running/10 text-running',
      not_started: 'bg-neutral/40 text-muted',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${map[status] || ''}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-display font-medium text-ink">
          Test runs — {activeProject.name}
        </h1>
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={openCreate}
        >
          New run
        </button>
      </div>

      <div className="flex gap-4">
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="smoke">Smoke</option>
          <option value="regression">Regression</option>
          <option value="sanity">Sanity</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="space-y-3">
        {runs.map((run) => (
          <div
            key={run._id}
            className="bg-card border border-line rounded-xl p-5 hover:border-ink/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-body font-medium text-ink">{run.name}</h2>
                <span className="text-xs font-mono text-muted capitalize">{run.type}</span>
                {statusPill(run.status)}
              </div>
              <div className="flex gap-2">
                {(run.status === 'not_started' || run.status === 'in_progress') && (
                  <button
                    className="text-xs font-mono text-ink hover:opacity-70 transition-opacity"
                    onClick={() => navigate(`/test-runs/${run._id}/execute`)}
                  >
                    {run.status === 'in_progress' ? 'Resume' : 'Execute'}
                  </button>
                )}
                <button
                  className="text-xs font-mono text-muted hover:text-ink transition-colors"
                  onClick={() => openEdit(run)}
                >
                  Edit
                </button>
                <button
                  className="text-xs font-mono text-muted hover:text-running transition-colors"
                  onClick={() => handleClone(run._id)}
                >
                  Clone
                </button>
                <button
                  className="text-xs font-mono text-muted hover:text-fail transition-colors"
                  onClick={() => handleDelete(run._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <ResultMeter total={run.testCases.length} />
          </div>
        ))}
        {runs.length === 0 && (
          <div className="text-center font-body text-muted py-12">
            No test runs yet
          </div>
        )}
      </div>

      {showBuilder && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">
              {editing ? 'Edit test run' : 'New test run'}
            </h2>
            <RunBuilder
              projectId={activeProject._id}
              initial={editing}
              onSave={editing ? handleUpdate : handleCreate}
              onCancel={closeBuilder}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TestRuns;
