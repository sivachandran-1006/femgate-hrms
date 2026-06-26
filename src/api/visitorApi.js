import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// ── Dashboard / reports ──
export const getVisitorDashboard = () => api.get("/visitors/dashboard").then(unwrap);
export const getVisitorReports   = () => api.get("/visitors/reports/summary").then(unwrap);
export const getVisitorAuditLog  = () => api.get("/visitors/audit/log").then(unwrap);

// ── Visitors ──
export const getVisitors  = (p)  => api.get("/visitors", { params: p }).then(unwrap);
export const getVisitor   = (id) => api.get(`/visitors/${id}`).then(unwrap);
export const registerVisitor = (d) => api.post("/visitors", d).then(unwrap);
export const registerWalkIn  = (d) => api.post("/visitors/walk-in", d).then(unwrap);

// ── Workflow ──
export const approveVisitor = (id)       => api.patch(`/visitors/${id}/approve`).then(unwrap);
export const rejectVisitor  = (id, reason) => api.patch(`/visitors/${id}/reject`, { reason }).then(unwrap);
export const cancelVisitor  = (id)       => api.patch(`/visitors/${id}/cancel`).then(unwrap);
export const checkInVisitor = (id)       => api.patch(`/visitors/${id}/check-in`).then(unwrap);
export const checkOutVisitor = (id)      => api.patch(`/visitors/${id}/check-out`).then(unwrap);
export const printBadge      = (id)      => api.patch(`/visitors/${id}/badge`).then(unwrap);
export const qrCheckIn       = (qrCode)  => api.post("/visitors/qr-checkin", { qrCode }).then(unwrap);

// ── Blacklist ──
export const getBlacklist    = ()    => api.get("/visitors/blacklist/list").then(unwrap);
export const addBlacklist    = (d)   => api.post("/visitors/blacklist", d).then(unwrap);
export const removeBlacklist = (id)  => api.delete(`/visitors/blacklist/${id}`).then(unwrap);
