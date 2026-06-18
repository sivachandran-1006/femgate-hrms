import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Backward-compatible (return full axios response)
export const fetchBranches      = ()         => api.get("/branches");
export const createBranch       = (data)     => api.post("/branches", data);
export const updateBranch       = (id, data) => api.put(`/branches/${id}`, data);
export const deleteBranch       = (id)       => api.delete(`/branches/${id}`);

// New unwrapped helpers (return data directly)
export const getBranches    = (params)      => api.get("/branches", { params }).then(unwrap);
export const getBranch      = (id)          => api.get(`/branches/${id}`).then(unwrap);
export const getBranchHeads = ()            => api.get("/branches/heads").then(unwrap);

export const getBranchDepartments = (id) => api.get(`/branches/${id}/departments`).then(unwrap);
export const getBranchEmployees   = (id) => api.get(`/branches/${id}/employees`).then(unwrap);
export const getBranchHolidays    = (id) => api.get(`/branches/${id}/holidays`).then(unwrap);
export const getBranchAnalytics   = (id) => api.get(`/branches/${id}/analytics`).then(unwrap);
export const getBranchAudit       = (id) => api.get(`/branches/${id}/audit`).then(unwrap);

export const addBranchHoliday    = (id, data)      => api.post(`/branches/${id}/holidays`, data).then(unwrap);
export const updateBranchHoliday = (id, hid, data) => api.put(`/branches/${id}/holidays/${hid}`, data).then(unwrap);
export const deleteBranchHoliday = (id, hid)       => api.delete(`/branches/${id}/holidays/${hid}`).then(unwrap);

export const importBranches = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/branches/import", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
};
export const exportBranches = (format = "csv") =>
  api.get("/branches/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
