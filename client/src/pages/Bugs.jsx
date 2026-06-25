import { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../context/ProjectContext';
import * as bugApi from '../api/bug.api';
import BugForm from '../components/BugForm';
import * as githubApi from '../api/github.api';

const statusIcons = {
  open: '○',
  in_progress: '⋯',
  resolved: '✓',
  closed: '✗',
  reopened: '↻',
};

function Bugs() {
  const { activeProject } = useProjects();
  const [bugs, setBugs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterBugType, setFilterBugType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!activeProject) return;
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterSeverity) params.severity = filterSeverity;
    if (filterBugType) params.bugType = filterBugType;
    const res = await bugApi.listBugs(activeProject._id, params);
    setBugs(res.data.data);
  }, [activeProject, filterStatus, filterSeverity, filterBugType]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    const res = await bugApi.createBug(activeProject._id, data);
    setShowForm(false);
    load();
    return res.data.data;
  };

  const handleUpdate = async (data) => {
    await bugApi.updateBug(activeProject._id, editing._id, data);
    setEditing(null);
    setShowForm(false);
    load();
  };

  const handleStatusChange = async (bugId, status) => {
    await bugApi.changeBugStatus(activeProject._id, bugId, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bug?')) return;
    await bugApi.deleteBug(activeProject._id, id);
    load();
  };

  const handlePushToGitHub = async (bugId) => {
    try {
      await githubApi.pushBugAsIssue(activeProject._id, bugId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to push to GitHub');
    }
  };

  const handleExport = async () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterSeverity) params.severity = filterSeverity;
    if (filterBugType) params.bugType = filterBugType;
    await bugApi.exportReport(activeProject._id, params);
  };

  const openEdit = (bug) => {
    setEditing(bug);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to manage bugs
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-display font-medium text-ink">
          Bugs — {activeProject.name}
        </h1>
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={openCreate}
        >
          New bug
        </button>
      </div>

      <div className="flex items-center gap-4">
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterBugType}
          onChange={(e) => setFilterBugType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="UI">UI</option>
          <option value="Functional">Functional</option>
          <option value="Performance">Performance</option>
          <option value="Security">Security</option>
          <option value="Compatibility">Compatibility</option>
          <option value="Content">Content</option>
          <option value="Usability">Usability</option>
        </select>
        <button
          className="border border-line text-ink px-3 py-1.5 rounded-lg text-sm font-body hover:bg-line/20 transition-colors flex items-center gap-1.5"
          onClick={handleExport}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export report
        </button>
      </div>

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide font-mono">Bug ID</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Priority</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Severity</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => (
              <tr key={bug._id} className="border-b border-line hover:bg-line/20 transition-colors">
                <td className="px-4 py-3 font-mono text-ink">{bug.bugKey}</td>
                <td className="px-4 py-3 text-ink">{bug.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-mono text-muted bg-neutral/30">
                    {bug.bugType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block text-xs font-mono text-muted">{bug.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block text-xs font-mono text-muted">{bug.severity}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
                    <span>{statusIcons[bug.status] || '○'}</span>
                    {bug.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <select
                    className="text-xs font-mono border border-line rounded px-1 py-0.5 bg-card text-muted focus:outline-none focus:border-ink"
                    value={bug.status}
                    onChange={(e) => handleStatusChange(bug._id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="reopened">Reopened</option>
                  </select>
                  {bug.githubIssueNumber ? (
                    <span className="text-xs font-mono text-muted">#{bug.githubIssueNumber}</span>
                  ) : (
                    <button
                      className="text-xs font-mono text-muted hover:text-ink transition-colors border border-line rounded px-1.5 py-0.5"
                      onClick={() => handlePushToGitHub(bug._id)}
                    >
                      Push
                    </button>
                  )}
                  <button
                    className="text-xs font-mono text-muted hover:text-ink transition-colors"
                    onClick={() => openEdit(bug)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs font-mono text-muted hover:text-fail transition-colors"
                    onClick={() => handleDelete(bug._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {bugs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No bugs yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">
              {editing ? 'Edit bug' : 'Log bug'}
            </h2>
            <BugForm
              initial={editing}
              onSave={editing ? handleUpdate : handleCreate}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Bugs;
