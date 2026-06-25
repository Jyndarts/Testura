import api from './axios';

export const getTestCases = (projectId, params) =>
  api.get(`/projects/${projectId}/test-cases`, { params });

export const getTestCase = (projectId, testCaseId) =>
  api.get(`/projects/${projectId}/test-cases/${testCaseId}`);

export const createTestCase = (projectId, data) =>
  api.post(`/projects/${projectId}/test-cases`, data);

export const updateTestCase = (projectId, testCaseId, data) =>
  api.put(`/projects/${projectId}/test-cases/${testCaseId}`, data);

export const deleteTestCase = (projectId, testCaseId) =>
  api.delete(`/projects/${projectId}/test-cases/${testCaseId}`);
