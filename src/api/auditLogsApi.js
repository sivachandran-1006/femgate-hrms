import api from "./axios";

// GET /superadmin/audit-logs?module=&severity=&actor=&dateRange=&search=&page=&limit=
export const getAuditLogs = (params) => api.get("/superadmin/audit-logs", { params }).then(r => r.data);

// GET /superadmin/audit-logs/export?module=&severity=&dateRange= — returns file download URL
export const exportAuditLogs = (params) => api.get("/superadmin/audit-logs/export", { params, responseType: "blob" });

// GET /superadmin/audit-logs/stats
export const getAuditStats = () => api.get("/superadmin/audit-logs/stats").then(r => r.data);
