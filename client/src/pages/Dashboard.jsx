import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import * as dashboardApi from '../api/dashboard.api';
import ResultMeter from '../components/ResultMeter';

const statusColors = {
  draft: '#D6D3D1',
  active: '#78716C',
  deprecated: '#A8A29E',
};

const severityColors = {
  low: '#D6D3D1',
  medium: '#A8A29E',
  high: '#78716C',
  critical: '#44403C',
};

function Dashboard() {
  const { activeProject } = useProjects();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    try {
      const res = await dashboardApi.getDashboard(activeProject._id);
      setData(res.data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [activeProject]);

  useEffect(() => {
    load();
  }, [load]);

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to view its dashboard
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-body text-muted">
        No data available
      </div>
    );
  }

  const { testCasesByStatus, latestRuns, openBugsBySeverity, totals } = data;

  const testCaseTotal = Object.values(testCasesByStatus).reduce(
    (a, b) => a + b,
    0
  );
  const bugTotal = Object.values(openBugsBySeverity).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-[20px] font-display font-medium text-ink">
        Dashboard — {activeProject.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-line rounded-xl p-5">
          <p className="text-sm font-body text-muted">Total test cases</p>
          <p className="text-[32px] font-display font-medium text-ink mt-1">
            {totals.testCases}
          </p>
        </div>
        <div className="bg-card border border-line rounded-xl p-5">
          <p className="text-sm font-body text-muted">Total runs</p>
          <p className="text-[32px] font-display font-medium text-ink mt-1">
            {totals.testRuns}
          </p>
        </div>
        <div className="bg-card border border-line rounded-xl p-5">
          <p className="text-sm font-body text-muted">Total bugs</p>
          <p className="text-[32px] font-display font-medium text-ink mt-1">
            {totals.bugs}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-line rounded-xl p-5">
          <h2 className="text-[16px] font-display font-medium text-ink mb-4">
            Test cases by status
          </h2>
          <div className="space-y-3">
            {['draft', 'active', 'deprecated'].map((status) => {
              const count = testCasesByStatus[status] || 0;
              const pct =
                testCaseTotal > 0 ? (count / testCaseTotal) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm font-body mb-1">
                    <span className="text-muted">{status}</span>
                    <span className="font-mono text-muted">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral/50 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: statusColors[status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl p-5">
          <h2 className="text-[16px] font-display font-medium text-ink mb-4">
            Open bugs by severity
          </h2>
          <div className="space-y-3">
            {['low', 'medium', 'high', 'critical'].map((severity) => {
              const count = openBugsBySeverity[severity] || 0;
              const pct =
                bugTotal > 0 ? (count / bugTotal) * 100 : 0;
              return (
                <div key={severity}>
                  <div className="flex items-center justify-between text-sm font-body mb-1">
                    <span className="text-muted">{severity}</span>
                    <span className="font-mono text-muted">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral/50 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: severityColors[severity],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-display font-medium text-ink">
            Recent runs
          </h2>
          <Link
            to="/test-runs"
            className="text-sm font-body text-muted hover:text-ink transition-colors"
          >
            View all
          </Link>
        </div>
        {latestRuns.length === 0 ? (
          <p className="text-sm font-body text-muted">No runs yet</p>
        ) : (
          <div className="space-y-4">
            {latestRuns.map((run) => (
              <div
                key={run._id}
                className="border-b border-line last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body text-ink">
                      {run.name}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      {run.type}
                    </span>
                    {run.status === 'in_progress' && (
                      <span className="inline-block w-2 h-2 rounded-full bg-running animate-running" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <ResultMeter
                  pass={run.pass || 0}
                  fail={run.fail || 0}
                  blocked={run.blocked || 0}
                  total={run.totalExecutions || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
