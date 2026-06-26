import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getCompDashboard = () => api.get("/compensation/dashboard").then(unwrap);
export const getCompAnalytics = () => api.get("/compensation/analytics").then(unwrap);
export const getCompReports   = () => api.get("/compensation/reports").then(unwrap);
export const getCompAuditLog  = () => api.get("/compensation/audit/log").then(unwrap);
export const getBenchmarking  = () => api.get("/compensation/benchmarking").then(unwrap);
export const getBudget        = () => api.get("/compensation/budget").then(unwrap);
export const getCompHistory   = (employee) => api.get(`/compensation/history/${encodeURIComponent(employee)}`).then(unwrap);

// Bands
export const getBands   = ()  => api.get("/compensation/bands").then(unwrap);
export const createBand = (d) => api.post("/compensation/bands", d).then(unwrap);
export const deleteBand = (id) => api.delete(`/compensation/bands/${id}`).then(unwrap);

// Revisions
export const getRevisions   = (p) => api.get("/compensation/revisions", { params: p }).then(unwrap);
export const createRevision = (d) => api.post("/compensation/revisions", d).then(unwrap);
export const updateRevisionStatus = (id, status) => api.patch(`/compensation/revisions/${id}/status`, { status }).then(unwrap);

// Bonuses
export const getBonuses   = () => api.get("/compensation/bonuses").then(unwrap);
export const createBonus  = (d) => api.post("/compensation/bonuses", d).then(unwrap);
export const updateBonusStatus = (id, status) => api.patch(`/compensation/bonuses/${id}/status`, { status }).then(unwrap);

// Variable pay
export const getVariablePay   = () => api.get("/compensation/variable-pay").then(unwrap);
export const createVariablePay = (d) => api.post("/compensation/variable-pay", d).then(unwrap);
export const updateVariablePayStatus = (id, status) => api.patch(`/compensation/variable-pay/${id}/status`, { status }).then(unwrap);

// Promotions
export const getPromotions   = () => api.get("/compensation/promotions").then(unwrap);
export const createPromotion = (d) => api.post("/compensation/promotions", d).then(unwrap);
export const updatePromotionStatus = (id, status) => api.patch(`/compensation/promotions/${id}/status`, { status }).then(unwrap);
