import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getDocuments  = (params) => api.get("/documents", { params }).then(unwrap);
export const getDocument   = (id)     => api.get(`/documents/${id}`).then(unwrap);
export const uploadDocument = (data)  => api.post("/documents", data).then(unwrap);
export const updateDocument = (id, d) => api.put(`/documents/${id}`, d).then(unwrap);
export const archiveDocument = (id)   => api.delete(`/documents/${id}`).then(unwrap);

export const getDocDashboard = () => api.get("/documents/dashboard").then(unwrap);
export const getDocAnalytics = () => api.get("/documents/analytics").then(unwrap);

export const getDocVersions = (id) => api.get(`/documents/${id}/versions`).then(unwrap);
export const getDocAudit    = (id) => api.get(`/documents/${id}/audit`).then(unwrap);
export const addDocVersion  = (id, data) => api.post(`/documents/${id}/version`, data).then(unwrap);
export const verifyDocument = (id, data) => api.patch(`/documents/${id}/verify`, data).then(unwrap);

// Requests
export const getDocRequests    = ()      => api.get("/documents/requests").then(unwrap);
export const createDocRequest  = (data)  => api.post("/documents/requests", data).then(unwrap);
export const fulfilDocRequest  = (id, s) => api.patch(`/documents/requests/${id}`, { status: s }).then(unwrap);

export const exportDocuments = (format = "csv") =>
  api.get("/documents/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
