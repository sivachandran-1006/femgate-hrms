import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Dashboard
export const getWorkflowDashboard = () => api.get("/workflows/dashboard").then(unwrap);

// Workflows
export const getWorkflows = (p) => api.get("/workflows", { params: p }).then(unwrap);
export const createWorkflow = (d) => api.post("/workflows", d).then(unwrap);
export const getWorkflow = (id) => api.get(`/workflows/${id}`).then(unwrap);
export const updateWorkflow = (id, d) => api.put(`/workflows/${id}`, d).then(unwrap);
export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`).then(unwrap);

// Approvals
export const getApprovalInbox = (p) => api.get("/workflows/approvals/inbox", { params: p }).then(unwrap);
export const approveRequest = (id, d) => api.post(`/workflows/approvals/${id}/approve`, d).then(unwrap);
export const rejectRequest = (id, d) => api.post(`/workflows/approvals/${id}/reject`, d).then(unwrap);
export const escalateRequest = (id) => api.post(`/workflows/approvals/${id}/escalate`, {}).then(unwrap);

// Analytics
export const getWorkflowAnalytics = () => api.get("/workflows/analytics/summary").then(unwrap);
