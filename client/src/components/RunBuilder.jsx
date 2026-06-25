import { useState, useEffect } from 'react';
import * as testCaseApi from '../api/testCase.api';

function RunBuilder({ projectId, initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    type: 'custom',
    description: '',
    testCases: [],
  });
  const [allCases, setAllCases] = useState([]);
  const [filterModule, setFilterModule] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    testCaseApi.getTestCases(projectId).then((res) => {
      setAllCases(res.data.data);
    }).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        type: initial.type || 'custom',
        description: initial.description || '',
        testCases: initial.testCases?.map((tc) => tc._id || tc) || [],
      });
    }
  }, [initial]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleCase = (id) => {
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.includes(id)
        ? prev.testCases.filter((x) => x !== id)
        : [...prev.testCases, id],
    }));
  };

  const filteredCases = allCases.filter((tc) => {
    if (filterModule && tc.module !== filterModule) return false;
    if (filterTag && !tc.tags.includes(filterTag)) return false;
    return true;
  });

  const modules = [...new Set(allCases.map((tc) => tc.module).filter(Boolean))];
  const tags = [...new Set(allCases.flatMap((tc) => tc.tags))];

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Name</label>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          value={form.name}
          onChange={set('name')}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-40">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Type</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.type}
            onChange={set('type')}
          >
            <option value="custom">Custom</option>
            <option value="smoke">Smoke</option>
            <option value="regression">Regression</option>
            <option value="sanity">Sanity</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Description</label>
        <textarea
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          rows={2}
          value={form.description}
          onChange={set('description')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Test cases ({form.testCases.length} selected)
        </label>

        <div className="flex gap-2 mb-2">
          <select
            className="border border-line rounded-lg px-2 py-1 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            className="border border-line rounded-lg px-2 py-1 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="text-xs font-mono text-muted self-center">
            {filteredCases.length} visible
          </span>
        </div>

        <div className="border border-line rounded-lg max-h-48 overflow-y-auto">
          {filteredCases.map((tc) => (
            <label
              key={tc._id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-body hover:bg-line/20 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={form.testCases.includes(tc._id)}
                onChange={() => toggleCase(tc._id)}
                className="accent-ink"
              />
              <span className="text-ink">{tc.title}</span>
              <span className="text-xs font-mono text-muted ml-auto">{tc.module}</span>
            </label>
          ))}
          {filteredCases.length === 0 && (
            <p className="px-3 py-4 text-sm font-body text-muted text-center">
              No test cases match filters
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-body hover:bg-line/20 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default RunBuilder;
