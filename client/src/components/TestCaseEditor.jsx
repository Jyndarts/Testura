import { useState, useEffect } from 'react';

const emptyStep = () => ({ action: '', expectedResult: '', order: 0 });

function TestCaseEditor({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    module: '',
    priority: 'medium',
    status: 'draft',
    preconditions: '',
    steps: [emptyStep()],
    tags: '',
    githubIssueNumber: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        module: initial.module || '',
        priority: initial.priority || 'medium',
        status: initial.status || 'draft',
        preconditions: initial.preconditions || '',
        steps: initial.steps?.length
          ? initial.steps.map((s, i) => ({ ...s, order: i }))
          : [emptyStep()],
        tags: initial.tags?.join(', ') || '',
        githubIssueNumber: initial.githubIssueNumber ?? '',
      });
    }
  }, [initial]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setStep = (index, field) => (e) => {
    const steps = [...form.steps];
    steps[index] = { ...steps[index], [field]: e.target.value };
    setForm((prev) => ({ ...prev, steps }));
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { ...emptyStep(), order: prev.steps.length }],
    }));
  };

  const removeStep = (index) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    }));
  };

  const moveStep = (index, direction) => {
    const steps = [...form.steps];
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setForm((prev) => ({
      ...prev,
      steps: steps.map((s, i) => ({ ...s, order: i })),
    }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      githubIssueNumber: form.githubIssueNumber
        ? Number(form.githubIssueNumber)
        : null,
    };
    onSave(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Title</label>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          value={form.title}
          onChange={set('title')}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Module</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            value={form.module}
            onChange={set('module')}
          />
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Priority</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.priority}
            onChange={set('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Status</label>
          <select
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card focus:outline-none focus:border-ink transition-colors"
            value={form.status}
            onChange={set('status')}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Preconditions</label>
        <textarea
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          rows={2}
          value={form.preconditions}
          onChange={set('preconditions')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Steps</label>
        <div className="space-y-2">
          {form.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 border border-line rounded-lg p-2">
              <span className="text-xs font-mono text-muted mt-2 w-6">{i + 1}.</span>
              <div className="flex-1 space-y-1">
                <input
                  className="w-full border border-line rounded-lg px-2 py-1 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                  placeholder="Action"
                  value={step.action}
                  onChange={setStep(i, 'action')}
                />
                <input
                  className="w-full border border-line rounded-lg px-2 py-1 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                  placeholder="Expected result"
                  value={step.expectedResult}
                  onChange={setStep(i, 'expectedResult')}
                />
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  className="text-xs font-mono text-muted hover:text-ink disabled:opacity-30 transition-colors"
                  disabled={i === 0}
                  onClick={() => moveStep(i, -1)}
                >
                  Up
                </button>
                <button
                  className="text-xs font-mono text-muted hover:text-ink disabled:opacity-30 transition-colors"
                  disabled={i === form.steps.length - 1}
                  onClick={() => moveStep(i, 1)}
                >
                  Down
                </button>
                <button
                  className="text-xs font-mono text-muted hover:text-fail transition-colors"
                  onClick={() => removeStep(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-2 text-sm font-mono text-muted hover:text-ink transition-colors"
          onClick={addStep}
        >
          + Add step
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
            Tags (comma-separated)
          </label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            value={form.tags}
            onChange={set('tags')}
            placeholder="e.g. smoke, regression"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
            GitHub issue #
          </label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            type="number"
            value={form.githubIssueNumber}
            onChange={set('githubIssueNumber')}
          />
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

export default TestCaseEditor;
