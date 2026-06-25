import { useState, useEffect } from 'react';

function BugForm({ initial, linkedTestCase, linkedExecution, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    bugType: 'Functional',
    severity: 'medium',
    priority: 'medium',
    status: 'open',
    url: '',
    environment: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    githubIssueNumber: '',
  });

  const [savedBugKey, setSavedBugKey] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        bugType: initial.bugType || 'Functional',
        severity: initial.severity || 'medium',
        priority: initial.priority || 'medium',
        status: initial.status || 'open',
        url: initial.url || '',
        environment: initial.environment || '',
        stepsToReproduce: initial.stepsToReproduce || '',
        expectedResult: initial.expectedResult || '',
        actualResult: initial.actualResult || '',
        githubIssueNumber: initial.githubIssueNumber ?? '',
      });
      if (initial.bugKey) setSavedBugKey(initial.bugKey);
    }
  }, [initial]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    const payload = {
      ...form,
      githubIssueNumber: form.githubIssueNumber
        ? Number(form.githubIssueNumber)
        : null,
      linkedTestCase: linkedTestCase?._id || linkedTestCase || null,
      linkedExecution: linkedExecution?._id || linkedExecution || null,
    };
    onSave(payload).then((result) => {
      if (result?.bugKey) setSavedBugKey(result.bugKey);
    });
  };

  return (
    <div className="space-y-4">
      {savedBugKey && (
        <div className="border border-line rounded-lg px-3 py-2 bg-line/20">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Bug ID </span>
          <span className="text-sm font-mono text-ink">{savedBugKey}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Title</label>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          value={form.title}
          onChange={set('title')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Description</label>
        <textarea
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          rows={3}
          value={form.description}
          onChange={set('description')}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Bug type</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.bugType}
            onChange={set('bugType')}
          >
            {['UI', 'Functional', 'Performance', 'Security', 'Compatibility', 'Content', 'Usability'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Severity</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.severity}
            onChange={set('severity')}
          >
            {['low', 'medium', 'high', 'critical'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Priority</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.priority}
            onChange={set('priority')}
          >
            {['low', 'medium', 'high'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Status</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.status}
            onChange={set('status')}
          >
            {['open', 'in_progress', 'resolved', 'closed', 'reopened'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">URL</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            value={form.url}
            onChange={set('url')}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Environment</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            value={form.environment}
            onChange={set('environment')}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Steps to reproduce</label>
        <textarea
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          rows={3}
          value={form.stepsToReproduce}
          onChange={set('stepsToReproduce')}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Expected result</label>
          <textarea
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            rows={2}
            value={form.expectedResult}
            onChange={set('expectedResult')}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Actual result</label>
          <textarea
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            rows={2}
            value={form.actualResult}
            onChange={set('actualResult')}
          />
        </div>
      </div>

      <div className="w-40">
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">GitHub issue #</label>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          type="number"
          value={form.githubIssueNumber}
          onChange={set('githubIssueNumber')}
        />
      </div>

      {(linkedTestCase || linkedExecution) && (
        <div className="border border-line rounded-lg p-3 space-y-1 bg-line/20">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Linked from execution</p>
          {linkedTestCase && (
            <p className="text-sm font-mono text-ink">Test case: {linkedTestCase.title || linkedTestCase}</p>
          )}
          {linkedExecution && (
            <p className="text-sm font-mono text-ink">Execution: {linkedExecution._id || linkedExecution}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={handleSave}
        >
          {initial ? 'Update bug' : 'Log bug'}
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

export default BugForm;
