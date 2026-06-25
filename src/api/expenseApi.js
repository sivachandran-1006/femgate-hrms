import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getExpenseDashboard = () => api.get("/expenses/dashboard").then(unwrap);
export const getExpenseAnalytics = () => api.get("/expenses/analytics").then(unwrap);

export const getExpenses      = (p) => api.get("/expenses", { params: p }).then(unwrap);
export const getExpense       = (id) => api.get(`/expenses/${id}`).then(unwrap);
export const createExpense    = (d) => api.post("/expenses", d).then(unwrap);
export const updateExpense    = (id, d) => api.put(`/expenses/${id}`, d).then(unwrap);
export const submitExpense    = (id) => api.patch(`/expenses/${id}/submit`).then(unwrap);
export const approveExpense   = (id, d) => api.patch(`/expenses/${id}/approve`, d).then(unwrap);
export const rejectExpense    = (id, d) => api.patch(`/expenses/${id}/reject`, d).then(unwrap);
export const clarifyExpense   = (id, d) => api.patch(`/expenses/${id}/clarify`, d).then(unwrap);
export const reimburseExpense = (id, d) => api.patch(`/expenses/${id}/reimburse`, d).then(unwrap);
export const deleteExpense    = (id) => api.delete(`/expenses/${id}`).then(unwrap);

export const getAdvances      = () => api.get("/expenses/advances/list").then(unwrap);
export const createAdvance    = (d) => api.post("/expenses/advances/new", d).then(unwrap);
export const approveAdvance   = (id) => api.patch(`/expenses/advances/${id}/approve`).then(unwrap);

export const getAuditLogs     = () => api.get("/expenses/audit/logs").then(unwrap);
export const exportExpensesCSV = () => api.get("/expenses/export/csv", { responseType: "blob" }).then((r) => r.data);
