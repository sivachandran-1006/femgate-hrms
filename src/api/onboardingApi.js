import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getOnboardingDashboard = () => api.get("/onboarding/dashboard").then(unwrap);
export const getOnboardings      = (p) => api.get("/onboarding", { params: p }).then(unwrap);
export const getOnboarding       = (id) => api.get(`/onboarding/${id}`).then(unwrap);
export const createOnboarding    = (d) => api.post("/onboarding", d).then(unwrap);
export const updateOnboarding    = (id, d) => api.put(`/onboarding/${id}`, d).then(unwrap);
export const getChecklists       = (id) => api.get(`/onboarding/${id}/checklist`).then(unwrap);
export const getTasks            = (id) => api.get(`/onboarding/${id}/tasks`).then(unwrap);
export const getOffboardings     = (p) => api.get("/onboarding/offboarding/list", { params: p }).then(unwrap);
export const exportOnboardingCSV = () => api.get("/onboarding/export/csv", { responseType: "blob" }).then((r) => r.data);
