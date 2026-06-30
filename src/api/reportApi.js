import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getReportDashboard = () => api.get("/reports/dashboard").then(unwrap);
export const getReportCatalog   = () => api.get("/reports/catalog").then(unwrap);
export const generateReport     = (module, report) => api.get("/reports/generate", { params: { module, report } }).then(unwrap);
export const getReportAudit     = () => api.get("/reports/audit").then(unwrap);

export const getSavedReports   = ()       => api.get("/reports/saved").then(unwrap);
export const createSavedReport = (data)   => api.post("/reports/saved", data).then(unwrap);
export const updateSavedReport = (id, d)  => api.patch(`/reports/saved/${id}`, d).then(unwrap);
export const deleteSavedReport = (id)     => api.delete(`/reports/saved/${id}`).then(unwrap);

// Schedules
export const getReportSchedules    = ()       => api.get("/reports/schedules").then(unwrap);
export const createReportSchedule  = (data)   => api.post("/reports/schedules", data).then(unwrap);
export const updateReportSchedule  = (id, d)  => api.patch(`/reports/schedules/${id}`, d).then(unwrap);
export const deleteReportSchedule  = (id)     => api.delete(`/reports/schedules/${id}`).then(unwrap);

// Shares
export const getReportShares   = ()       => api.get("/reports/shares").then(unwrap);
export const createReportShare = (data)   => api.post("/reports/shares", data).then(unwrap);
export const deleteReportShare = (id)     => api.delete(`/reports/shares/${id}`).then(unwrap);

// Export Center
export const getExportLogs    = ()     => api.get("/reports/export-logs").then(unwrap);
export const createExportLog  = (data) => api.post("/reports/export-logs", data).then(unwrap);

// Settings
export const getReportSettings    = ()     => api.get("/reports/settings").then(unwrap);
export const updateReportSettings = (data) => api.put("/reports/settings", data).then(unwrap);
