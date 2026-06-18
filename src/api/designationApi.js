import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Backward-compatible (full axios response)
export const fetchDesignations   = ()         => api.get("/designations");
export const createDesignation   = (data)     => api.post("/designations", data);
export const updateDesignation   = (id, data) => api.put(`/designations/${id}`, data);
export const deleteDesignation   = (id)       => api.delete(`/designations/${id}`);

// New unwrapped helpers
export const getDesignations  = (params) => api.get("/designations", { params }).then(unwrap);
export const getDesignation   = (id)     => api.get(`/designations/${id}`).then(unwrap);
export const getDesigHierarchy = ()      => api.get("/designations/hierarchy").then(unwrap);

export const getDesigEmployees = (id) => api.get(`/designations/${id}/employees`).then(unwrap);
export const getDesigChain     = (id) => api.get(`/designations/${id}/hierarchy`).then(unwrap);
export const getDesigAnalytics = (id) => api.get(`/designations/${id}/analytics`).then(unwrap);
export const getDesigAudit     = (id) => api.get(`/designations/${id}/audit`).then(unwrap);

export const importDesignations = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/designations/import", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
};
export const exportDesignations = (format = "csv") =>
  api.get("/designations/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
