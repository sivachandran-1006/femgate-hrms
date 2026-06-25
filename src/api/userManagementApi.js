import api from "./axios";

// GET /superadmin/users?search=&role=&status=
export const getUsers = (params) => api.get("/superadmin/users", { params }).then(r => r.data);

// POST /superadmin/users
export const createUser = (data) => api.post("/superadmin/users", data).then(r => r.data);

// PUT /superadmin/users/:id
export const updateUser = (id, data) => api.put(`/superadmin/users/${id}`, data).then(r => r.data);

// DELETE /superadmin/users/:id
export const deleteUser = (id) => api.delete(`/superadmin/users/${id}`).then(r => r.data);

// PATCH /superadmin/users/:id/toggle-status
export const toggleUserStatus = (id) => api.patch(`/superadmin/users/${id}/toggle-status`).then(r => r.data);

// PATCH /superadmin/users/:id/role
export const updateUserRole = (id, role) => api.patch(`/superadmin/users/${id}/role`, { role }).then(r => r.data);

// POST /superadmin/users/:id/reset-password
export const resetUserPassword = (id) => api.post(`/superadmin/users/${id}/reset-password`).then(r => r.data);

// GET /superadmin/users/:id/activity
export const getUserActivity = (id) => api.get(`/superadmin/users/${id}/activity`).then(r => r.data);
