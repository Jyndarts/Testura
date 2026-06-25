import api from './axios';

export const getConnection = (projectId) =>
  api.get(`/projects/${projectId}/github/connection`);

export const connectRepo = (projectId, data) =>
  api.post(`/projects/${projectId}/github/connect`, data);

export const disconnect = (projectId) =>
  api.delete(`/projects/${projectId}/github/disconnect`);

export const pushBugAsIssue = (projectId, bugId) =>
  api.post(`/projects/${projectId}/github/push-bug/${bugId}`);

export const syncRunResult = (projectId, runId, issueNumber) =>
  api.post(`/projects/${projectId}/github/sync-run/${runId}`, { issueNumber });
