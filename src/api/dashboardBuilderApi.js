import api from "./axios";
const r = (res) => res.data?.data ?? res.data ?? res;

export const getDashboardBuilderDashboard = ()        => api.get("/dashboard-builder/dashboard").then(r);
export const getDashboards                = (params)  => api.get("/dashboard-builder", { params }).then(r);
export const getDashboard                 = (id)      => api.get(`/dashboard-builder/${id}`).then(r);
export const createDashboard              = (d)       => api.post("/dashboard-builder", d).then(r);
export const updateDashboard              = (id, d)   => api.put(`/dashboard-builder/${id}`, d).then(r);
export const deleteDashboard              = (id)      => api.delete(`/dashboard-builder/${id}`).then(r);
export const publishDashboard             = (id)      => api.post(`/dashboard-builder/${id}/publish`).then(r);
export const archiveDashboard             = (id)      => api.post(`/dashboard-builder/${id}/archive`).then(r);
export const duplicateDashboard           = (id)      => api.post(`/dashboard-builder/${id}/duplicate`).then(r);
export const shareDashboard               = (id, d)   => api.post(`/dashboard-builder/${id}/share`, d).then(r);
export const unshareaDashboard            = (id)      => api.delete(`/dashboard-builder/${id}/share`).then(r);
export const getSharedDashboards          = ()        => api.get("/dashboard-builder/shared").then(r);
export const getDashboardTemplates        = ()        => api.get("/dashboard-builder/templates").then(r);
export const getDashboardSettings         = ()        => api.get("/dashboard-builder/settings").then(r);
export const updateDashboardSettings      = (d)       => api.put("/dashboard-builder/settings", d).then(r);
