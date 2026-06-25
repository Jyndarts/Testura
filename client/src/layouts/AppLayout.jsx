import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

function AppLayout() {
  const { user, logout } = useAuth();
  const { projects, activeProject, setActiveProject } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-paper">
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:flex md:flex-col w-64 bg-card border-r border-line`}
      >
        <div className="p-5 border-b border-line">
          <h1 className="text-[20px] font-display font-medium tracking-tight text-ink">
            Testura
          </h1>
        </div>

        <div className="p-4 border-b border-line">
          <label className="text-xs font-body text-muted uppercase tracking-wide">
            Project
          </label>
          <select
            className="w-full mt-1 border border-line rounded-lg px-2 py-1.5 text-sm font-body text-ink bg-card"
            value={activeProject?._id || ''}
            onChange={(e) => {
              const p = projects.find((x) => x._id === e.target.value);
              setActiveProject(p || null);
            }}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Projects
          </Link>
          <Link
            to="/test-cases"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Test cases
          </Link>
          <Link
            to="/test-runs"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Test runs
          </Link>
          <Link
            to="/bugs"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Bugs
          </Link>
          <Link
            to="/integrations"
            className="block px-3 py-2 rounded-lg text-sm font-body text-ink hover:bg-line/40 transition-colors"
          >
            Integrations
          </Link>
        </nav>

        <div className="p-4 border-t border-line">
          <p className="text-sm font-body text-ink truncate">{user?.name}</p>
          <p className="text-xs font-mono text-muted truncate">{user?.email}</p>
          <button
            className="mt-2 text-sm font-body text-muted hover:text-ink transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-card border-b border-line px-4 py-3 flex items-center">
          <button
            className="text-ink mr-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-display font-medium text-ink">Testura</h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
