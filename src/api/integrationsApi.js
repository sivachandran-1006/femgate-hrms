import api from "./axios";

// GET /superadmin/integrations
export const getIntegrations = () => api.get("/superadmin/integrations").then(r => r.data);

// POST /superadmin/integrations/:id/connect  — { apiKey?, config? }
export const connectIntegration = (id, config) => api.post(`/superadmin/integrations/${id}/connect`, config).then(r => r.data);

// DELETE /superadmin/integrations/:id  — disconnect
export const disconnectIntegration = (id) => api.delete(`/superadmin/integrations/${id}`).then(r => r.data);

// GET /superadmin/integrations/:id/status  — { connected, lastSync, error? }
export const getIntegrationStatus = (id) => api.get(`/superadmin/integrations/${id}/status`).then(r => r.data);

// POST /superadmin/integrations/:id/test  — test connection
export const testIntegration = (id) => api.post(`/superadmin/integrations/${id}/test`).then(r => r.data);
