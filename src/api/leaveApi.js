import api from "./axios";

export const fetchLeaves       = (params) => api.get("/leaves", { params }).then(r => r.data);
export const applyLeave        = (data)   => api.post("/leaves", data).then(r => r.data);
export const updateLeaveStatus = (id, status) => api.patch(`/leaves/${id}/status`, { status }).then(r => r.data);
export const deleteLeave       = (id)    => api.delete(`/leaves/${id}`).then(r => r.data);
export const fetchLeaveBalance = ()      => api.get("/leaves/balance").then(r => r.data);
