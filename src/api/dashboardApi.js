import api from "./axios";

export const getDashboardSummary = () => api.get("/dashboard/summary").then(r => r.data);
export const getRecentActivity    = () => api.get("/dashboard/activity").then(r => r.data);
export const getAnnouncements     = () => api.get("/dashboard/announcements").then(r => r.data);
export const getUpcomingEvents    = () => api.get("/dashboard/events").then(r => r.data);
export const getAttendanceSummary = () => api.get("/dashboard/attendance").then(r => r.data);
export const getPayrollSummary    = () => api.get("/dashboard/payroll").then(r => r.data);
export const getLeaveBalance      = () => api.get("/leaves/balance").then(r => r.data);
export const getSystemHealth      = () => api.get("/dashboard/health").then(r => r.data);
export const getMyAttendance      = () => api.get("/dashboard/my-attendance").then(r => r.data);
export const getMyPayslip         = () => api.get("/dashboard/my-payslip").then(r => r.data);
