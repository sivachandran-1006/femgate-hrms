import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getAssets    = (params) => api.get("/assets", { params }).then(unwrap);
export const getAsset     = (id)     => api.get(`/assets/${id}`).then(unwrap);
export const createAsset  = (data)   => api.post("/assets", data).then(unwrap);
export const updateAsset  = (id, d)  => api.put(`/assets/${id}`, d).then(unwrap);
export const deleteAsset  = (id)     => api.delete(`/assets/${id}`).then(unwrap);

export const getAssetDashboard = () => api.get("/assets/dashboard").then(unwrap);
export const getAssetAnalytics = () => api.get("/assets/analytics").then(unwrap);

export const getAssetAssignments = (id) => api.get(`/assets/${id}/assignments`).then(unwrap);
export const getAssetMaintenance = (id) => api.get(`/assets/${id}/maintenance`).then(unwrap);
export const getAssetAudit       = (id) => api.get(`/assets/${id}/audit`).then(unwrap);

export const assignAsset  = (id, data) => api.post(`/assets/${id}/assign`, data).then(unwrap);
export const returnAsset  = (id, data) => api.post(`/assets/${id}/return`, data).then(unwrap);
export const addMaintenance = (id, data) => api.post(`/assets/${id}/maintenance`, data).then(unwrap);

// Licenses
export const getLicenses    = ()      => api.get("/assets/licenses").then(unwrap);
export const createLicense  = (data)  => api.post("/assets/licenses", data).then(unwrap);
export const updateLicense  = (id, d) => api.put(`/assets/licenses/${id}`, d).then(unwrap);
export const deleteLicense  = (id)    => api.delete(`/assets/licenses/${id}`).then(unwrap);

export const exportAssets = (format = "csv") =>
  api.get("/assets/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
