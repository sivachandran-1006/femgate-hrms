import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getTickets   = (params) => api.get("/tickets", { params }).then(unwrap);
export const getTicket    = (id)     => api.get(`/tickets/${id}`).then(unwrap);
export const createTicket = (data)   => api.post("/tickets", data).then(unwrap);
export const setTicketStatus = (id, status) => api.patch(`/tickets/${id}/status`, { status }).then(unwrap);
export const assignTicket = (id, data) => api.patch(`/tickets/${id}/assign`, data).then(unwrap);

export const getTicketDashboard = () => api.get("/tickets/dashboard").then(unwrap);
export const getTicketAnalytics = () => api.get("/tickets/analytics").then(unwrap);

export const getTicketComments = (id) => api.get(`/tickets/${id}/comments`).then(unwrap);
export const addTicketComment  = (id, data) => api.post(`/tickets/${id}/comments`, data).then(unwrap);
export const getTicketAudit    = (id) => api.get(`/tickets/${id}/audit`).then(unwrap);

// Knowledge base
export const getKnowledge    = (params) => api.get("/tickets/knowledge", { params }).then(unwrap);
export const createKnowledge = (data)   => api.post("/tickets/knowledge", data).then(unwrap);
export const updateKnowledge = (id, d)  => api.put(`/tickets/knowledge/${id}`, d).then(unwrap);
export const deleteKnowledge = (id)     => api.delete(`/tickets/knowledge/${id}`).then(unwrap);

export const exportTickets = (format = "csv") =>
  api.get("/tickets/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
