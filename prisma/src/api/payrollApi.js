import axios from "axios";

const BASE = "http://localhost:5000";

export const fetchPayroll = () =>
  axios.get(`${BASE}/payroll`).then((r) => r.data);

export const createPayrollRecord = (data) =>
  axios.post(`${BASE}/payroll`, data).then((r) => r.data);

export const markPayrollPaid = (id) =>
  axios.put(`${BASE}/payroll/${id}`, { status: "Paid" }).then((r) => r.data);

export const deletePayrollRecord = (id) =>
  axios.delete(`${BASE}/payroll/${id}`).then((r) => r.data);
