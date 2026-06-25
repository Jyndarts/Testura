import api from './axios';

export const listRuns = (projectId, params) =>
  api.get(`/projects/${projectId}/test-runs`, { params });

export const getRun = (projectId, runId) =>
  api.get(`/projects/${projectId}/test-runs/${runId}`);

export const createRun = (projectId, data) =>
  api.post(`/projects/${projectId}/test-runs`, data);

export const updateRun = (projectId, runId, data) =>
  api.put(`/projects/${projectId}/test-runs/${runId}`, data);

export const cloneRun = (projectId, runId) =>
  api.post(`/projects/${projectId}/test-runs/${runId}/clone`);

export const deleteRun = (projectId, runId) =>
  api.delete(`/projects/${projectId}/test-runs/${runId}`);
