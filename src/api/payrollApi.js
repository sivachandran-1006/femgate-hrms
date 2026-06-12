import api from "./axios";

export const fetchPayroll         = (params) => api.get("/payroll", { params }).then(r => r.data);
export const createPayrollRecord  = (data)   => api.post("/payroll", data).then(r => r.data);
export const markPayrollPaid      = (id)     => api.put(`/payroll/${id}`, { status: "Paid" }).then(r => r.data);
export const deletePayrollRecord  = (id)     => api.delete(`/payroll/${id}`).then(r => r.data);
