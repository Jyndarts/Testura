import api from './axios';

export const startRun = (projectId, runId) =>
  api.post(`/projects/${projectId}/test-runs/${runId}/start`);

export const getRunExecutions = (projectId, runId) =>
  api.get(`/projects/${projectId}/test-runs/${runId}/executions`);

export const updateExecution = (projectId, runId, executionId, data) =>
  api.put(`/projects/${projectId}/test-runs/${runId}/executions/${executionId}`, data);

export const completeRun = (projectId, runId) =>
  api.post(`/projects/${projectId}/test-runs/${runId}/complete`);
