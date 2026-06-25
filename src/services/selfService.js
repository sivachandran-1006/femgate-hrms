import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getMyProfile    = ()        => api.get("/employees/me").then(unwrap);
export const updateMyProfile = (payload) => api.put("/employees/me", payload).then(unwrap);
export const getMyAttendance = ()        => api.get("/attendance/my").then(unwrap);
export const selfCheckIn     = ()        => api.post("/attendance/checkin").then(unwrap);
export const selfCheckOut    = ()        => api.post("/attendance/checkout").then(unwrap);
export const getMyPayslips   = ()        => api.get("/payroll/my").then(unwrap);
export const getMyDocuments  = ()        => api.get("/documents/my").then(unwrap);
export const createDocument  = (payload) => api.post("/documents", payload).then(unwrap);
export const deleteDocument  = (id)      => api.delete(`/documents/${id}`).then(unwrap);
export const getMyAssets     = ()        => api.get("/assets/my").then(unwrap);
