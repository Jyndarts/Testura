import api from './axios';

export const listBugs = (projectId, params) =>
  api.get(`/projects/${projectId}/bugs`, { params });

export const getBug = (projectId, bugId) =>
  api.get(`/projects/${projectId}/bugs/${bugId}`);

export const createBug = (projectId, data) =>
  api.post(`/projects/${projectId}/bugs`, data);

export const updateBug = (projectId, bugId, data) =>
  api.put(`/projects/${projectId}/bugs/${bugId}`, data);

export const changeBugStatus = (projectId, bugId, status) =>
  api.patch(`/projects/${projectId}/bugs/${bugId}/status`, { status });

export const deleteBug = (projectId, bugId) =>
  api.delete(`/projects/${projectId}/bugs/${bugId}`);

export const exportReport = async (projectId, params) => {
  const res = await api.get(`/projects/${projectId}/bugs/export`, {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qa-bug-report.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
