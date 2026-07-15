import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Entries
export const fetchTimesheetEntries = (params) => api.get("/timesheet/entries", { params }).then(unwrap);
export const createTimesheetEntry  = (data)    => api.post("/timesheet/entries", data).then(unwrap);
export const updateTimesheetEntry  = (id, data) => api.put(`/timesheet/entries/${id}`, data).then(unwrap);
export const deleteTimesheetEntry  = (id)      => api.delete(`/timesheet/entries/${id}`).then(unwrap);
export const submitTimesheet       = (data)    => api.post("/timesheet/submit", data).then(unwrap);

// Dashboard & analytics
export const getTimesheetDashboard = () => api.get("/timesheet/dashboard").then(unwrap);
export const getTimesheetAnalytics = (range) => api.get("/timesheet/analytics", { params: { range } }).then(unwrap);

// Projects, clients, tasks (lookups used by the entry form)
export const getTimesheetProjects = () => api.get("/timesheet/projects").then(unwrap);
export const getTimesheetClients  = () => api.get("/timesheet/clients").then(unwrap);

// Approval workflow
export const getTimesheetApprovals   = (status) => api.get("/timesheet/approvals", { params: { status } }).then(unwrap);
export const reviewTimesheetApproval = (id, data) => api.patch(`/timesheet/approvals/${id}`, data).then(unwrap);

export const exportTimesheet = (format = "csv") =>
  api.get("/timesheet/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
