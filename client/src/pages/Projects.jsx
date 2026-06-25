import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';

function Projects() {
  const {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    deleteProject,
    addMember,
    removeMember,
  } = useProjects();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', key: '', description: '' });
  const [createError, setCreateError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  const handleCreate = async () => {
    try {
      setCreateError('');
      const project = await createProject(createForm);
      setCreateForm({ name: '', key: '', description: '' });
      setShowCreate(false);
      setActiveProject(project);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAddMember = async () => {
    if (!activeProject) return;
    try {
      setMemberError('');
      await addMember(activeProject._id, { email: memberEmail });
      setMemberEmail('');
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeProject) return;
    try {
      await removeMember(activeProject._id, userId);
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-display font-medium text-ink">Projects</h1>
        <button
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={() => setShowCreate(true)}
        >
          New project
        </button>
      </div>

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Key</th>
              <th className="px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Members</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id} className="border-b border-line hover:bg-line/20 transition-colors">
                <td className="px-4 py-3">
                  <button
                    className="text-ink hover:underline underline-offset-2"
                    onClick={() => setActiveProject(p)}
                  >
                    {p.name}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-muted">{p.key}</td>
                <td className="px-4 py-3 font-mono text-muted">{p.members.length}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-xs font-mono text-muted hover:text-fail transition-colors"
                    onClick={() => deleteProject(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-body text-muted">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeProject && (
        <div className="bg-card border border-line rounded-xl p-5">
          <h2 className="text-[16px] font-display font-medium text-ink mb-4">
            {activeProject.name} <span className="font-mono text-muted">({activeProject.key})</span>
          </h2>

          <h3 className="text-sm font-medium text-muted mb-2 uppercase tracking-wide text-xs">
            Members
          </h3>
          <ul className="space-y-1 mb-4">
            {activeProject.members.map((m) => (
              <li key={m._id} className="flex items-center justify-between text-sm font-body">
                <span className="text-ink">
                  {m.name} <span className="font-mono text-muted">({m.email})</span>
                </span>
                <button
                  className="text-xs font-mono text-muted hover:text-fail transition-colors"
                  onClick={() => handleRemoveMember(m._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <input
              className="border border-line rounded-lg px-3 py-1.5 text-sm font-body text-ink bg-card placeholder:text-muted/60 flex-1 focus:outline-none focus:border-ink transition-colors"
              type="email"
              placeholder="Add member by email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <button
              className="bg-ink text-paper px-3 py-1.5 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
              onClick={handleAddMember}
            >
              Add
            </button>
          </div>
          {memberError && (
            <p className="text-xs font-mono text-fail mt-1">{memberError}</p>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card border border-line rounded-xl p-5 w-full max-w-sm">
            <h2 className="text-[16px] font-display font-medium text-ink mb-4">Create project</h2>
            {createError && (
              <p className="text-xs font-mono text-fail mb-3">{createError}</p>
            )}
            <input
              className="w-full border border-line rounded-lg px-3 py-2 mb-3 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              placeholder="Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <input
              className="w-full border border-line rounded-lg px-3 py-2 mb-3 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              placeholder="Key (e.g. VLT)"
              value={createForm.key}
              onChange={(e) => setCreateForm({ ...createForm, key: e.target.value })}
            />
            <input
              className="w-full border border-line rounded-lg px-3 py-2 mb-4 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              placeholder="Description (optional)"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                className="bg-ink text-paper px-4 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity flex-1"
                onClick={handleCreate}
              >
                Create
              </button>
              <button
                className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-body hover:bg-line/20 transition-colors"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
