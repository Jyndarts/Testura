import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as projectApi from '../api/project.api';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(() => {
    const id = localStorage.getItem('activeProjectId');
    return id || null;
  });

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      return;
    }

    projectApi.getMyProjects().then((res) => {
      setProjects(res.data.data);
    }).catch(() => {});
  }, [user]);

  const refreshProjects = useCallback(async () => {
    const res = await projectApi.getMyProjects();
    setProjects(res.data.data);
    return res.data.data;
  }, []);

  const handleSetActiveProject = useCallback((project) => {
    if (project) {
      localStorage.setItem('activeProjectId', project._id);
      setActiveProject(project._id);
    } else {
      localStorage.removeItem('activeProjectId');
      setActiveProject(null);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await projectApi.createProject(data);
    setProjects((prev) => [...prev, res.data.data]);
    return res.data.data;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await projectApi.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (activeProject === id) {
      handleSetActiveProject(null);
    }
  }, [activeProject, handleSetActiveProject]);

  const addMember = useCallback(async (projectId, data) => {
    const res = await projectApi.addMember(projectId, data);
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? res.data.data : p))
    );
    return res.data.data;
  }, []);

  const removeMember = useCallback(async (projectId, userId) => {
    const res = await projectApi.removeMember(projectId, userId);
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? res.data.data : p))
    );
    return res.data.data;
  }, []);

  const activeProjectData = projects.find((p) => p._id === activeProject) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject: activeProjectData,
        setActiveProject: handleSetActiveProject,
        refreshProjects,
        createProject,
        deleteProject,
        addMember,
        removeMember,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return ctx;
}
