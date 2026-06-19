import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const fetchPayroll         = (params) => api.get("/payroll", { params }).then(r => r.data);
export const createPayrollRecord  = (data)   => api.post("/payroll", data).then(r => r.data);
export const markPayrollPaid      = (id)     => api.put(`/payroll/${id}`, { status: "Paid" }).then(r => r.data);
export const deletePayrollRecord  = (id)     => api.delete(`/payroll/${id}`).then(r => r.data);

// Dashboard & analytics
export const getPayrollDashboard = () => api.get("/payroll/dashboard").then(unwrap);
export const getPayrollAnalytics = () => api.get("/payroll/analytics").then(unwrap);
export const getPayrollAudit     = () => api.get("/payroll/audit").then(unwrap);
export const getPayslip          = (id) => api.get(`/payroll/${id}/payslip`).then(unwrap);

// Workflow
export const setPayrollStatus    = (id, status) => api.patch(`/payroll/${id}/status`, { status }).then(unwrap);
export const generatePayroll     = (month, year) => api.post("/payroll/generate", { month, year }).then(unwrap);

// Salary structures
export const getSalaryStructures  = ()      => api.get("/payroll/structures").then(unwrap);
export const createSalaryStructure = (data) => api.post("/payroll/structures", data).then(unwrap);
export const updateSalaryStructure = (id, d) => api.put(`/payroll/structures/${id}`, d).then(unwrap);
export const deleteSalaryStructure = (id)   => api.delete(`/payroll/structures/${id}`).then(unwrap);

export const exportPayroll = (format = "csv") =>
  api.get("/payroll/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
