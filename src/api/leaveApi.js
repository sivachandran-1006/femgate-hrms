import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const fetchLeaves       = (params) => api.get("/leaves", { params }).then(r => r.data);
export const applyLeave        = (data)   => api.post("/leaves", data).then(r => r.data);
export const updateLeaveStatus = (id, status, reviewNote) => api.patch(`/leaves/${id}/status`, { status, reviewNote }).then(r => r.data);
export const deleteLeave       = (id)    => api.delete(`/leaves/${id}`).then(r => r.data);
export const fetchLeaveBalance = ()      => api.get("/leaves/balance").then(r => r.data);

// Dashboard & analytics
export const getLeaveDashboard = () => api.get("/leaves/dashboard").then(unwrap);
export const getLeaveAnalytics = () => api.get("/leaves/analytics").then(unwrap);
export const getLeaveCalendar  = () => api.get("/leaves/calendar").then(unwrap);
export const getLeaveAudit     = () => api.get("/leaves/audit").then(unwrap);

// Policies
export const getLeavePolicies  = ()       => api.get("/leaves/policies").then(unwrap);
export const createLeavePolicy = (data)   => api.post("/leaves/policies", data).then(unwrap);
export const updateLeavePolicy = (id, d)  => api.put(`/leaves/policies/${id}`, d).then(unwrap);
export const deleteLeavePolicy = (id)     => api.delete(`/leaves/policies/${id}`).then(unwrap);

export const exportLeaves = (format = "csv") =>
  api.get("/leaves/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
