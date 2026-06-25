import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import * as githubApi from '../api/github.api';

function Integrations() {
  const { activeProject } = useProjects();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    try {
      const res = await githubApi.getConnection(activeProject._id);
      setConnection(res.data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeProject]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setConnecting(true);
    try {
      const res = await githubApi.connectRepo(activeProject._id, {
        repoOwner,
        repoName,
        token,
      });
      setConnection(res.data.data);
      setRepoOwner('');
      setRepoName('');
      setToken('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect');
    }
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect GitHub repository?')) return;
    await githubApi.disconnect(activeProject._id);
    setConnection(null);
  };

  if (!activeProject) {
    return (
      <div className="text-center font-body text-muted mt-20">
        Select a project to manage integrations
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-[20px] font-display font-medium text-ink">
        Integrations — {activeProject.name}
      </h1>

      <div className="bg-card border border-line rounded-xl p-5">
        <h2 className="text-[16px] font-display font-medium text-ink mb-1">
          GitHub
        </h2>
        <p className="text-sm font-body text-muted mb-4">
          Connect a repository to push bugs as issues and sync test run results.
        </p>

        {connection?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-ink shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-mono text-ink">{connection.repoOwner}/{connection.repoName}</p>
                <p className="text-xs font-body text-muted">Connected</p>
              </div>
            </div>
            <button
              className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-body hover:bg-line/20 transition-colors"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body text-muted mb-1">Owner</label>
                <input
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  placeholder="e.g. my-org"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body text-muted mb-1">Repository</label>
                <input
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. my-repo"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-body text-muted mb-1">Personal access token</label>
              <input
                type="password"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                required
              />
            </div>
            {error && (
              <p className="text-sm font-body text-fail">{error}</p>
            )}
            <button
              type="submit"
              className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect repository'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Integrations;
