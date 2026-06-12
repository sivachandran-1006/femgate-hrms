import api from "./axios";

// GET /superadmin/companies?search=&status=&plan=
export const getCompanies = (params) => api.get("/superadmin/companies", { params }).then(r => r.data);

// GET /superadmin/companies/:id
export const getCompany = (id) => api.get(`/superadmin/companies/${id}`).then(r => r.data);

// POST /superadmin/companies
export const createCompany = (data) => api.post("/superadmin/companies", data).then(r => r.data);

// PUT /superadmin/companies/:id
export const updateCompany = (id, data) => api.put(`/superadmin/companies/${id}`, data).then(r => r.data);

// DELETE /superadmin/companies/:id
export const deleteCompany = (id) => api.delete(`/superadmin/companies/${id}`).then(r => r.data);

// PATCH /superadmin/companies/:id/status  — { status: "Active" | "Suspended" | "Trial" }
export const updateCompanyStatus = (id, status) => api.patch(`/superadmin/companies/${id}/status`, { status }).then(r => r.data);
