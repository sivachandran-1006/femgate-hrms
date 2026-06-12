import api from "./axios";

// GET /superadmin/billing/plan  — current plan, next billing date, usage limits
export const getBillingPlan = () => api.get("/superadmin/billing/plan").then(r => r.data);

// GET /superadmin/billing/invoices
export const getBillingInvoices = () => api.get("/superadmin/billing/invoices").then(r => r.data);

// GET /superadmin/billing/invoice/:id/download  — returns PDF blob
export const downloadInvoice = (id) => api.get(`/superadmin/billing/invoice/${id}/download`, { responseType: "blob" });

// GET /superadmin/billing/usage  — employees used, storage used, API calls
export const getBillingUsage = () => api.get("/superadmin/billing/usage").then(r => r.data);

// GET /superadmin/billing/payment-methods
export const getPaymentMethods = () => api.get("/superadmin/billing/payment-methods").then(r => r.data);

// POST /superadmin/billing/payment-method
export const addPaymentMethod = (data) => api.post("/superadmin/billing/payment-method", data).then(r => r.data);

// POST /superadmin/billing/upgrade  — { plan: "Pro" | "Enterprise" }
export const upgradePlan = (plan) => api.post("/superadmin/billing/upgrade", { plan }).then(r => r.data);
