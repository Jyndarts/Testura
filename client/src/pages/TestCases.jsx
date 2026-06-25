import { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../context/ProjectContext';
import * as testCaseApi from '../api/testCase.api';
import TestCaseEditor from '../components/TestCaseEditor';

function TestCases() {
  const { activeProject } = useProjects();
  const [testCases, setTestCases] = useState([]);
  const [filterModule, setFilterModule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!activeProject) return;
    const params = {};
    if (filterModule) params.module = filterModule;
    if (filterStatus) params.status = filterStatus;
    if (filterTag) params.tag = filterTag;
    const res = await testCaseApi.getTestCases(activeProject._id, params);
    setTestCases(res.data.data);
  }, [activeProject, filterModule, filterStatus, filterTag]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    await testCaseApi.createTestCase(activeProject._id, data);
    setShowEditor(false);
    load();
  };

  const handleUpdate = async (data) => {
    await testCaseApi.updateTestCase(activeProject._id, editing._id, data);
    setEditing(null);
    setShowEditor(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test case?')) return;
    await testCaseApi.deleteTestCase(activeProject._id, id);
    load();
  };

  const openEdit = (tc) => {
    setEditing(tc);
    setShowEditor(true);
  };

  const openCreate = () => {
    setEditing(null);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditing(null);
  };

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to manage test cases
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      active: 'bg-pass/10 text-pass',
      deprecated: 'bg-fail/10 text-fail',
      draft: 'bg-neutral/40 text-muted',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${map[status] || ''}`}>
        {status}
      </span>
    );
  };

  const priorityBadge = (priority) => {
    const map = {
      high: 'text-fail',
      medium: 'text-blocked',
      low: 'text-muted',
    };
    return (
      <span className={`inline-block text-xs font-mono ${map[priority] || ''}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-display font-medium text-ink">
          Test cases — {activeProject.name}
        </h1>
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={openCreate}
        >
          New test case
        </button>
      </div>

      <div className="flex gap-4">
        <input
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card placeholder:text-muted/60 w-40 focus:outline-none focus:border-ink transition-colors"
          placeholder="Filter module"
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
        />
        <select
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <input
          className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card placeholder:text-muted/60 w-40 focus:outline-none focus:border-ink transition-colors"
          placeholder="Filter tag"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
      </div>

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Module</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Priority</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide font-mono">Steps</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => (
              <tr key={tc._id} className="border-b border-line hover:bg-line/20 transition-colors">
                <td className="px-4 py-3 text-ink">{tc.title}</td>
                <td className="px-4 py-3 font-mono text-muted">{tc.module || '\u2014'}</td>
                <td className="px-4 py-3">{statusBadge(tc.status)}</td>
                <td className="px-4 py-3">{priorityBadge(tc.priority)}</td>
                <td className="px-4 py-3 font-mono text-muted">{tc.steps.length}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="text-xs font-mono text-muted hover:text-ink transition-colors"
                    onClick={() => openEdit(tc)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs font-mono text-muted hover:text-fail transition-colors"
                    onClick={() => handleDelete(tc._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {testCases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No test cases yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">
              {editing ? 'Edit test case' : 'New test case'}
            </h2>
            <TestCaseEditor
              initial={editing}
              onSave={editing ? handleUpdate : handleCreate}
              onCancel={closeEditor}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TestCases;
