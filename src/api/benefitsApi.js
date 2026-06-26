import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getBenefitsDashboard = () => api.get("/benefits/dashboard").then(unwrap);
export const getBenefitsReports   = () => api.get("/benefits/reports").then(unwrap);
export const getBenefitsAuditLog  = () => api.get("/benefits/audit/log").then(unwrap);

// Plans
export const getPlans   = (p)  => api.get("/benefits/plans", { params: p }).then(unwrap);
export const createPlan = (d)  => api.post("/benefits/plans", d).then(unwrap);
export const updatePlan = (id, d) => api.put(`/benefits/plans/${id}`, d).then(unwrap);
export const deletePlan = (id) => api.delete(`/benefits/plans/${id}`).then(unwrap);

// Enrollments
export const getEnrollments    = (p) => api.get("/benefits/enrollments", { params: p }).then(unwrap);
export const enroll            = (d) => api.post("/benefits/enrollments", d).then(unwrap);
export const updateEnrollmentStatus = (id, d) => api.patch(`/benefits/enrollments/${id}/status`, d).then(unwrap);

// Dependents
export const getDependents   = (p) => api.get("/benefits/dependents", { params: p }).then(unwrap);
export const addDependent    = (d) => api.post("/benefits/dependents", d).then(unwrap);
export const deleteDependent = (id) => api.delete(`/benefits/dependents/${id}`).then(unwrap);

// Claims
export const getClaims    = () => api.get("/benefits/claims").then(unwrap);
export const submitClaim  = (d) => api.post("/benefits/claims", d).then(unwrap);
export const updateClaimStatus = (id, d) => api.patch(`/benefits/claims/${id}/status`, d).then(unwrap);
