import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getTickets         = ()           => api.get("/tickets").then(unwrap);
export const raiseTicket        = (payload)    => api.post("/tickets", payload).then(unwrap);
export const updateTicketStatus = (id, status) => api.patch(`/tickets/${id}/status`, { status }).then(unwrap);
