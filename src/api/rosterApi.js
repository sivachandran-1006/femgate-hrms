import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getRosterDashboard = () => api.get("/roster/dashboard").then(unwrap);
export const getRosterAnalytics = () => api.get("/roster/analytics").then(unwrap);
export const getRosterAuditLog  = () => api.get("/roster/audit/log").then(unwrap);

// Shifts
export const getShifts   = (p)  => api.get("/roster/shifts", { params: p }).then(unwrap);
export const createShift = (d)  => api.post("/roster/shifts", d).then(unwrap);
export const updateShift = (id, d) => api.put(`/roster/shifts/${id}`, d).then(unwrap);
export const deleteShift = (id) => api.delete(`/roster/shifts/${id}`).then(unwrap);

// Assignments
export const getAssignments  = (p) => api.get("/roster/assignments", { params: p }).then(unwrap);
export const createAssignment = (d) => api.post("/roster/assignments", d).then(unwrap);
export const bulkAssign      = (items) => api.post("/roster/assignments/bulk", { items }).then(unwrap);
export const deleteAssignment = (id) => api.delete(`/roster/assignments/${id}`).then(unwrap);

// Change requests
export const getChangeRequests = () => api.get("/roster/change-requests").then(unwrap);
export const createChangeRequest = (d) => api.post("/roster/change-requests", d).then(unwrap);
export const reviewChangeRequest = (id, status) => api.patch(`/roster/change-requests/${id}`, { status }).then(unwrap);

// Overtime
export const getOvertime    = () => api.get("/roster/overtime").then(unwrap);
export const requestOvertime = (d) => api.post("/roster/overtime", d).then(unwrap);
export const reviewOvertime = (id, status) => api.patch(`/roster/overtime/${id}`, { status }).then(unwrap);

// Swap Requests
export const getSwapRequests   = () => api.get("/roster/swaps").then(unwrap);
export const createSwapRequest = (d) => api.post("/roster/swaps", d).then(unwrap);
export const updateSwapStatus  = (id, status) => api.patch(`/roster/swaps/${id}/status`, { status }).then(unwrap);
