import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getDepartments   = ()            => api.get("/departments").then(unwrap);
export const createDepartment = (payload)     => api.post("/departments", payload).then(unwrap);
export const updateDepartment = (id, payload) => api.put(`/departments/${id}`, payload).then(unwrap);
export const deleteDepartment = (id)          => api.delete(`/departments/${id}`).then(unwrap);
