import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getAttendance    = ()        => api.get("/attendance").then(unwrap);
export const markAttendance   = (payload) => api.post("/attendance", payload).then(unwrap);
export const checkOutById     = (id)      => api.put(`/attendance/${id}`).then(unwrap);
