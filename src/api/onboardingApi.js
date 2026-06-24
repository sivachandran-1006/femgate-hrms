import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Onboarding
export const getOnboardingDashboard = () => api.get("/onboarding/dashboard").then(unwrap);
export const getOnboardings      = (p) => api.get("/onboarding", { params: p }).then(unwrap);
export const getOnboarding       = (id) => api.get(`/onboarding/${id}`).then(unwrap);
export const createOnboarding    = (d) => api.post("/onboarding", d).then(unwrap);
export const updateOnboarding    = (id, d) => api.put(`/onboarding/${id}`, d).then(unwrap);
export const getChecklists       = (id) => api.get(`/onboarding/${id}/checklist`).then(unwrap);
export const getTasks            = (id) => api.get(`/onboarding/${id}/tasks`).then(unwrap);
export const exportOnboardingCSV = () => api.get("/onboarding/export/csv", { responseType: "blob" }).then((r) => r.data);

// Offboarding
export const getOffboardingDashboard = () => api.get("/onboarding/offboarding/dashboard").then(unwrap);
export const getOffboardings        = (p) => api.get("/onboarding/offboarding/list", { params: p }).then(unwrap);
export const getOffboarding         = (id) => api.get(`/onboarding/offboarding/${id}`).then(unwrap);
export const createOffboarding      = (d) => api.post("/onboarding/offboarding/new", d).then(unwrap);
export const updateOffboarding      = (id, d) => api.put(`/onboarding/offboarding/${id}`, d).then(unwrap);
export const createClearance        = (id, d) => api.post(`/onboarding/offboarding/${id}/clearance`, d).then(unwrap);
export const approveClearance       = (id, cid, d) => api.patch(`/onboarding/offboarding/${id}/clearance/${cid}`, d).then(unwrap);
export const createAssetReturn      = (id, d) => api.post(`/onboarding/offboarding/${id}/asset-return`, d).then(unwrap);
export const updateAssetReturn      = (id, aid, d) => api.patch(`/onboarding/offboarding/${id}/asset-return/${aid}`, d).then(unwrap);
export const createExitInterview    = (id, d) => api.post(`/onboarding/offboarding/${id}/exit-interview`, d).then(unwrap);
export const createSettlement       = (id, d) => api.post(`/onboarding/offboarding/${id}/settlement`, d).then(unwrap);
export const exportOffboardingCSV   = () => api.get("/onboarding/offboarding/export/csv", { responseType: "blob" }).then((r) => r.data);
