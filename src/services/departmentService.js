import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getDepartments   = (params)      => api.get("/departments", { params }).then(unwrap);
export const getDepartment    = (id)          => api.get(`/departments/${id}`).then(unwrap);
export const createDepartment = (payload)     => api.post("/departments", payload).then(unwrap);
export const updateDepartment = (id, payload) => api.put(`/departments/${id}`, payload).then(unwrap);
export const deleteDepartment = (id)          => api.delete(`/departments/${id}`).then(unwrap);

// Dropdown of active employees for "Department Head"
export const getDeptHeads     = ()            => api.get("/departments/heads").then(unwrap);

// Profile sub-resources
export const getDeptEmployees    = (id) => api.get(`/departments/${id}/employees`).then(unwrap);
export const getDeptDesignations = (id) => api.get(`/departments/${id}/designations`).then(unwrap);
export const getDeptAnalytics    = (id) => api.get(`/departments/${id}/analytics`).then(unwrap);
export const getDeptAudit        = (id) => api.get(`/departments/${id}/audit`).then(unwrap);

// Import / Export
export const importDepartments = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/departments/import", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
};
// Returns a blob (csv) or html (pdf). Caller triggers the download.
export const exportDepartments = (format = "csv") =>
  api.get(`/departments/export`, { params: { format }, responseType: "blob" }).then((r) => r.data);
