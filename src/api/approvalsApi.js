import api from "./axios";

export const fetchApprovals        = ()          => api.get("/approvals");
export const approveLeave          = (id, data)  => api.patch(`/approvals/leave/${id}`, data);
export const approveExpense        = (id, data)  => api.patch(`/approvals/expense/${id}`, data);
export const fetchMyTeam           = ()          => api.get("/employees/my-team");
export const reviewOnboarding      = (id, data)  => api.post(`/employees/${id}/review`, data);
export const updateMyProfile       = (data)      => api.put("/employees/me", data);
export const fetchMyEmployee       = ()          => api.get("/employees/me");
