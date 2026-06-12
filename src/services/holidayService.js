import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getHolidays    = ()            => api.get("/holidays").then(unwrap);
export const createHoliday  = (payload)     => api.post("/holidays", payload).then(unwrap);
export const updateHoliday  = (id, payload) => api.put(`/holidays/${id}`, payload).then(unwrap);
export const deleteHoliday  = (id)          => api.delete(`/holidays/${id}`).then(unwrap);
