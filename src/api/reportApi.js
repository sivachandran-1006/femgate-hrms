import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getReportDashboard = () => api.get("/reports/dashboard").then(unwrap);
export const getReportCatalog   = () => api.get("/reports/catalog").then(unwrap);
export const generateReport     = (module, report) => api.get("/reports/generate", { params: { module, report } }).then(unwrap);
export const getReportAudit     = () => api.get("/reports/audit").then(unwrap);

export const getSavedReports  = ()      => api.get("/reports/saved").then(unwrap);
export const createSavedReport = (data) => api.post("/reports/saved", data).then(unwrap);
export const updateSavedReport = (id, d) => api.patch(`/reports/saved/${id}`, d).then(unwrap);
export const deleteSavedReport = (id)   => api.delete(`/reports/saved/${id}`).then(unwrap);
