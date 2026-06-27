import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getBrandSettings = () => api.get("/branding/settings").then(unwrap);
export const saveBrandSettings = (d) => api.put("/branding/settings", d).then(unwrap);
export const publishBrand = () => api.post("/branding/settings/publish").then(unwrap);
export const resetBrand = () => api.post("/branding/settings/reset").then(unwrap);

export const getBrandDashboard = () => api.get("/branding/dashboard").then(unwrap);

export const getEmailTemplates = () => api.get("/branding/email-templates").then(unwrap);
export const updateEmailTemplate = (id, d) => api.put(`/branding/email-templates/${id}`, d).then(unwrap);

export const getBrandAssets = () => api.get("/branding/assets").then(unwrap);
export const addBrandAsset = (d) => api.post("/branding/assets", d).then(unwrap);
export const deleteBrandAsset = (id) => api.delete(`/branding/assets/${id}`).then(unwrap);

export const verifyDomain = (domain) => api.post("/branding/domain/verify", { domain }).then(unwrap);
export const getBrandAuditLog = () => api.get("/branding/audit/log").then(unwrap);
