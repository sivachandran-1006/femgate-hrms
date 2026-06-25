import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getEmployees    = ()           => api.get("/employees");
export const createEmployee  = (data)       => api.post("/employees", data);
export const updateEmployee  = (id, data)   => api.put(`/employees/${id}`, data);
export const deleteEmployee  = (id)         => api.delete(`/employees/${id}`);

// ── Profile sub-resources (unwrapped) ──
export const getEmpDocuments   = (id) => api.get(`/employees/${id}/documents`).then(unwrap);
export const getEmpAssets      = (id) => api.get(`/employees/${id}/assets`).then(unwrap);
export const getEmpAttendance  = (id) => api.get(`/employees/${id}/attendance`).then(unwrap);
export const getEmpLeave       = (id) => api.get(`/employees/${id}/leave`).then(unwrap);
export const getEmpPayroll     = (id) => api.get(`/employees/${id}/payroll`).then(unwrap);
export const getEmpPerformance = (id) => api.get(`/employees/${id}/performance`).then(unwrap);
export const getEmpActivity    = (id) => api.get(`/employees/${id}/activity`).then(unwrap);

// ── Actions ──
export const transferEmployee     = (id, data)   => api.post(`/employees/${id}/transfer`, data).then(unwrap);
export const setEmployeeStatus    = (id, status) => api.patch(`/employees/${id}/status`, { status }).then(unwrap);
export const sendEmployeeInvite   = (id)         => api.post(`/employees/${id}/invite`).then(unwrap);
export const cancelEmployeeInvite = (id)         => api.delete(`/employees/${id}/invite`).then(unwrap);
export const resetEmployeePassword = (id)        => api.post(`/employees/${id}/reset-password`).then(unwrap);

// ── Import / Export ──
export const importEmployees = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/employees/import", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
};
export const exportEmployees = (format = "csv") =>
  api.get("/employees/export/data", { params: { format }, responseType: "blob" }).then((r) => r.data);
