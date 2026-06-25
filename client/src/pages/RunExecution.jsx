import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import * as testRunApi from '../api/testRun.api';
import * as testExecutionApi from '../api/testExecution.api';
import ResultMeter from '../components/ResultMeter';
import BugForm from '../components/BugForm';
import * as bugApi from '../api/bug.api';
import * as githubApi from '../api/github.api';

function RunExecution() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { activeProject } = useProjects();
  const [run, setRun] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBugForm, setShowBugForm] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncIssueNumber, setSyncIssueNumber] = useState('');

  const load = useCallback(async () => {
    if (!activeProject) return;
    try {
      await testExecutionApi.startRun(activeProject._id, runId);
      const [runRes, execRes] = await Promise.all([
        testRunApi.getRun(activeProject._id, runId),
        testExecutionApi.getRunExecutions(activeProject._id, runId),
      ]);
      setRun(runRes.data.data);
      setExecutions(execRes.data.data);
      if (execRes.data.data.length > 0) {
        setSelectedId(execRes.data.data[0]._id);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [activeProject, runId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => executions.find((e) => e._id === selectedId),
    [executions, selectedId]
  );

  const counts = useMemo(() => {
    const c = { pass: 0, fail: 0, blocked: 0, skipped: 0, untested: 0 };
    executions.forEach((e) => {
      if (c[e.status] !== undefined) c[e.status]++;
    });
    return c;
  }, [executions]);

  const statusColor = (status) => {
    const map = {
      pass: 'var(--pass)',
      fail: 'var(--fail)',
      blocked: 'var(--blocked)',
      skipped: 'var(--neutral)',
      untested: 'var(--neutral)',
    };
    return map[status] || 'var(--neutral)';
  };

  const statusBg = (status) => {
    const map = {
      pass: 'bg-pass/10 text-pass',
      fail: 'bg-fail/10 text-fail',
      blocked: 'bg-blocked/10 text-blocked',
      skipped: 'bg-neutral/40 text-muted',
      untested: 'bg-neutral/40 text-muted',
    };
    return map[status] || 'bg-neutral/40 text-muted';
  };

  const handleStepResult = async (stepIndex, stepStatus) => {
    if (!selected) return;
    const stepResults = [...(selected.stepResults || [])];
    const existing = stepResults.findIndex((s) => s.stepIndex === stepIndex);
    const entry = { stepIndex, status: stepStatus, actualResult: '' };

    if (existing >= 0) {
      stepResults[existing] = { ...stepResults[existing], status: stepStatus };
    } else {
      stepResults.push(entry);
    }

    await testExecutionApi.updateExecution(activeProject._id, runId, selected._id, {
      stepResults,
    });

    const res = await testExecutionApi.getRunExecutions(activeProject._id, runId);
    setExecutions(res.data.data);
  };

  const handleOverallStatus = async (status) => {
    if (!selected) return;
    await testExecutionApi.updateExecution(activeProject._id, runId, selected._id, {
      status,
      stepResults: selected.stepResults || [],
      notes: selected.notes || '',
    });

    const res = await testExecutionApi.getRunExecutions(activeProject._id, runId);
    setExecutions(res.data.data);
  };

  const handleNotesChange = async (notes) => {
    if (!selected) return;
    await testExecutionApi.updateExecution(activeProject._id, runId, selected._id, {
      status: selected.status,
      stepResults: selected.stepResults || [],
      notes,
    });

    const res = await testExecutionApi.getRunExecutions(activeProject._id, runId);
    setExecutions(res.data.data);
  };

  const handleComplete = async () => {
    if (!window.confirm('Complete this run?')) return;
    await testExecutionApi.completeRun(activeProject._id, runId);
    navigate(`/test-runs`);
  };

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to execute test runs
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-body text-muted">
        Loading...
      </div>
    );
  }

  const overallCount = executions.length;
  const executedCount = counts.pass + counts.fail + counts.blocked + counts.skipped;

  return (
    <>
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-card border border-line rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-body font-medium text-ink">{run?.name}</h1>
            {run?.status === 'in_progress' && (
              <span className="inline-block w-2 h-2 rounded-full bg-running animate-running" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-body hover:bg-line/20 transition-colors"
              onClick={() => setShowSyncModal(true)}
            >
              Sync result to GitHub
            </button>
            <button
              className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
              onClick={handleComplete}
            >
              Complete run
            </button>
          </div>
        </div>
        <ResultMeter
          pass={counts.pass}
          fail={counts.fail}
          blocked={counts.blocked}
          total={executions.length}
        />
        <div className="flex items-center gap-4 mt-2 font-mono text-xs text-muted">
          <span>{executedCount}/{overallCount} executed</span>
          <span className="text-pass">{counts.pass} pass</span>
          <span className="text-fail">{counts.fail} fail</span>
          <span className="text-blocked">{counts.blocked} blocked</span>
          {counts.skipped > 0 && <span>{counts.skipped} skipped</span>}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel — case list */}
        <div className="w-72 bg-card border border-line rounded-xl overflow-y-auto shrink-0">
          <div className="p-3 border-b border-line">
            <h2 className="text-xs font-medium text-muted uppercase tracking-wide">
              Test cases
            </h2>
          </div>
          {executions.map((exec) => (
            <button
              key={exec._id}
              className={`w-full text-left px-3 py-2.5 border-b border-line last:border-0 transition-colors ${
                selectedId === exec._id ? 'bg-line/30' : 'hover:bg-line/20'
              }`}
              onClick={() => setSelectedId(exec._id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-body text-ink truncate">
                  {exec.testCase?.title || 'Unknown'}
                </span>
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    exec.status === 'in_progress' ? 'animate-running' : ''
                  }`}
                  style={{ background: statusColor(exec.status) }}
                />
              </div>
              {exec.testCase?.module && (
                <span className="text-xs font-mono text-muted">{exec.testCase.module}</span>
              )}
            </button>
          ))}
          {executions.length === 0 && (
            <p className="px-3 py-8 text-sm font-body text-muted text-center">
              No test cases in this run
            </p>
          )}
        </div>

        {/* Main panel — case detail */}
        <div className="flex-1 bg-card border border-line rounded-xl overflow-y-auto p-5">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-body font-medium text-ink mb-1">
                  {selected.testCase?.title}
                </h2>
                {selected.testCase?.module && (
                  <span className="text-xs font-mono text-muted">{selected.testCase.module}</span>
                )}
              </div>

              {selected.testCase?.preconditions && (
                <div>
                  <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                    Preconditions
                  </h3>
                  <p className="text-sm font-body text-ink whitespace-pre-wrap">
                    {selected.testCase.preconditions}
                  </p>
                </div>
              )}

              {/* Steps */}
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                  Steps
                </h3>
                <div className="space-y-2">
                  {(selected.testCase?.steps || []).map((step, i) => {
                    const stepResult = (selected.stepResults || []).find(
                      (s) => s.stepIndex === i
                    );
                    const stepStatus = stepResult?.status || 'untested';

                    return (
                      <div
                        key={i}
                        className="border border-line rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-xs font-mono text-muted mr-2">
                              {i + 1}.
                            </span>
                            <span className="text-sm font-body text-ink">
                              {step.action}
                            </span>
                            <p className="text-xs font-mono text-muted mt-1">
                              Expected: {step.expectedResult}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {['pass', 'fail', 'untested'].map((s) => (
                              <button
                                key={s}
                                className={`px-2 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                                  stepStatus === s
                                    ? s === 'pass'
                                      ? 'bg-pass text-paper border-pass'
                                      : s === 'fail'
                                        ? 'bg-fail text-paper border-fail'
                                        : 'bg-neutral text-muted border-neutral'
                                    : 'border-line text-muted hover:border-ink'
                                }`}
                                onClick={() => handleStepResult(i, s)}
                              >
                                {s === 'untested' ? 'skip' : s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!selected.testCase?.steps || selected.testCase.steps.length === 0) && (
                    <p className="text-sm font-body text-muted">No steps defined</p>
                  )}
                </div>
              </div>

              {/* Overall result */}
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                  Overall result
                </h3>
                <div className="flex gap-2">
                  {[
                    { key: 'pass', label: 'Pass', color: 'var(--pass)' },
                    { key: 'fail', label: 'Fail', color: 'var(--fail)' },
                    { key: 'blocked', label: 'Blocked', color: 'var(--blocked)' },
                    { key: 'skipped', label: 'Skip', color: 'var(--neutral)' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      className={`px-4 py-2 rounded-lg text-sm font-body font-medium border transition-colors ${
                        selected.status === opt.key
                          ? opt.key === 'skipped'
                            ? 'border-neutral text-muted'
                            : 'text-paper'
                          : 'border-line text-muted hover:border-ink'
                      }`}
                      style={
                        selected.status === opt.key && opt.key !== 'skipped'
                          ? { background: opt.color, borderColor: opt.color }
                          : {}
                      }
                      onClick={() => handleOverallStatus(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}

                  <button
                    className="px-4 py-2 rounded-lg text-sm font-body font-medium border border-line text-muted hover:border-ink transition-colors"
                    onClick={() => setShowBugForm(true)}
                  >
                    Log bug
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                  Notes
                </h3>
                <textarea
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                  rows={3}
                  value={selected.notes || ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Notes about this execution..."
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full font-body text-muted">
              Select a test case to begin
            </div>
          )}
        </div>
      </div>
    </div>

      {showSyncModal && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-sm">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">
              Sync result to GitHub
            </h2>
            <p className="text-sm font-body text-muted mb-4">
              Post a summary of this run to an existing GitHub issue or PR.
            </p>
            <label className="block text-sm font-body text-muted mb-1">
              Issue / PR number
            </label>
            <input
              className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card focus:outline-none focus:border-ink transition-colors"
              value={syncIssueNumber}
              onChange={(e) => setSyncIssueNumber(e.target.value)}
              placeholder="e.g. 42"
              type="number"
              min="1"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-body hover:bg-line/20 transition-colors"
                onClick={() => { setShowSyncModal(false); setSyncIssueNumber(''); }}
              >
                Cancel
              </button>
              <button
                className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
                onClick={async () => {
                  if (!syncIssueNumber) return;
                  try {
                    await githubApi.syncRunResult(activeProject._id, runId, parseInt(syncIssueNumber, 10));
                    setShowSyncModal(false);
                    setSyncIssueNumber('');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to sync');
                  }
                }}
              >
                Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {showBugForm && selected && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">Log bug</h2>
            <BugForm
              linkedTestCase={selected.testCase}
              linkedExecution={selected}
              onSave={async (data) => {
                const res = await bugApi.createBug(activeProject._id, data);
                setShowBugForm(false);
                return res.data.data;
              }}
              onCancel={() => setShowBugForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default RunExecution;
