import api from "./axios";
const r = (res) => res.data?.data ?? res.data ?? res;

export const getWorkflowDashboard  = ()         => api.get("/workflow-builder/dashboard").then(r);
export const getWorkflows          = (params)   => api.get("/workflow-builder", { params }).then(r);
export const getWorkflow           = (id)       => api.get(`/workflow-builder/${id}`).then(r);
export const createWorkflow        = (d)        => api.post("/workflow-builder", d).then(r);
export const updateWorkflow        = (id, d)    => api.put(`/workflow-builder/${id}`, d).then(r);
export const deleteWorkflow        = (id)       => api.delete(`/workflow-builder/${id}`).then(r);
export const publishWorkflow       = (id)       => api.post(`/workflow-builder/${id}/publish`).then(r);
export const duplicateWorkflow     = (id)       => api.post(`/workflow-builder/${id}/duplicate`).then(r);
export const getWorkflowTemplates  = ()         => api.get("/workflow-builder/templates").then(r);
export const getWorkflowHistory    = (params)   => api.get("/workflow-builder/history", { params }).then(r);
export const executeWorkflow       = (d)        => api.post("/workflow-builder/execute", d).then(r);
export const workflowAction        = (id, d)    => api.post(`/workflow-builder/executions/${id}/action`, d).then(r);
export const getWorkflowSettings   = ()         => api.get("/workflow-builder/settings").then(r);
export const updateWorkflowSettings= (d)        => api.put("/workflow-builder/settings", d).then(r);
