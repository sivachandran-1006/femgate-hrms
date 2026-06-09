import api from "./axios";

export const fetchAttendance        = (params) => api.get("/attendance", { params }).then(r => r.data);
export const createAttendanceRecord = (data)   => api.post("/attendance", data).then(r => r.data);
export const checkOutAttendance     = (id, data) => api.put(`/attendance/${id}`, data).then(r => r.data);
