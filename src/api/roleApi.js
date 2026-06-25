import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getRoles      = (params) => api.get("/roles", { params }).then(unwrap);
export const getRole       = (id)     => api.get(`/roles/${id}`).then(unwrap);
export const getRoleMeta   = ()       => api.get("/roles/meta").then(unwrap);
export const getRoleUsers  = (id)     => api.get(`/roles/${id}/users`).then(unwrap);
export const getRoleAudit  = (id)     => api.get(`/roles/${id}/audit`).then(unwrap);

export const createRole = (data)      => api.post("/roles", data).then(unwrap);
export const cloneRole  = (id, data)  => api.post(`/roles/${id}/clone`, data).then(unwrap);
export const updateRole = (id, data)  => api.put(`/roles/${id}`, data).then(unwrap);
export const deleteRole = (id)        => api.delete(`/roles/${id}`).then(unwrap);

export const exportRoles = (format = "csv") =>
  api.get("/roles/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
