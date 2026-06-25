import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const fetchAttendance        = (params) => api.get("/attendance", { params }).then(r => r.data);
export const createAttendanceRecord = (data)   => api.post("/attendance", data).then(r => r.data);
export const checkOutAttendance     = (id, data) => api.put(`/attendance/${id}`, data).then(r => r.data);

// Dashboard & analytics
export const getAttDashboard = ()       => api.get("/attendance/dashboard").then(unwrap);
export const getAttTrends    = (range)  => api.get("/attendance/trends", { params: { range } }).then(unwrap);
export const getAttBreakdown = ()       => api.get("/attendance/breakdown").then(unwrap);

// Reports
export const getLateReport   = () => api.get("/attendance/late").then(unwrap);
export const getOvertime     = () => api.get("/attendance/overtime").then(unwrap);
export const getWFH          = () => api.get("/attendance/wfh").then(unwrap);

// Regularization
export const getRegularizations  = (status) => api.get("/attendance/regularization", { params: { status } }).then(unwrap);
export const createRegularization = (data)  => api.post("/attendance/regularization", data).then(unwrap);
export const reviewRegularization = (id, data) => api.patch(`/attendance/regularization/${id}`, data).then(unwrap);

export const exportAttendance = (format = "csv") =>
  api.get("/attendance/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
