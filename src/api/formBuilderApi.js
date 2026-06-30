import api from "./axios";
const r = (res) => res.data?.data ?? res.data ?? res;

export const getFormDashboard   = ()         => api.get("/form-builder/dashboard").then(r);
export const getForms           = (params)   => api.get("/form-builder", { params }).then(r);
export const getForm            = (id)       => api.get(`/form-builder/${id}`).then(r);
export const createForm         = (d)        => api.post("/form-builder", d).then(r);
export const updateForm         = (id, d)    => api.put(`/form-builder/${id}`, d).then(r);
export const deleteForm         = (id)       => api.delete(`/form-builder/${id}`).then(r);
export const publishForm        = (id)       => api.post(`/form-builder/${id}/publish`).then(r);
export const archiveForm        = (id)       => api.post(`/form-builder/${id}/archive`).then(r);
export const duplicateForm      = (id)       => api.post(`/form-builder/${id}/duplicate`).then(r);
export const getFormTemplates   = ()         => api.get("/form-builder/templates").then(r);
export const getFormResponses   = (params)   => api.get("/form-builder/responses", { params }).then(r);
export const submitFormResponse = (d)        => api.post("/form-builder/responses", d).then(r);
export const formResponseAction = (id, d)    => api.post(`/form-builder/responses/${id}/action`, d).then(r);
export const getFormSettings    = ()         => api.get("/form-builder/settings").then(r);
export const updateFormSettings = (d)        => api.put("/form-builder/settings", d).then(r);
