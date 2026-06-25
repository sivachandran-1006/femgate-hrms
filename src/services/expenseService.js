import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getExpenses    = ()        => api.get("/expenses").then(unwrap);
export const createExpense  = (payload) => api.post("/expenses", payload).then(unwrap);
export const approveExpense = (id)      => api.patch(`/expenses/${id}/approve`).then(unwrap);
export const rejectExpense  = (id)      => api.patch(`/expenses/${id}/reject`).then(unwrap);
export const deleteExpense  = (id)      => api.delete(`/expenses/${id}`).then(unwrap);
