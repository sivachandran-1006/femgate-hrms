import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Tasks
export const fetchTasks   = (params)  => api.get("/tasks", { params }).then(unwrap);
export const createTask   = (data)    => api.post("/tasks", data).then(unwrap);
export const updateTask   = (id, data) => api.put(`/tasks/${id}`, data).then(unwrap);
export const deleteTask   = (id)      => api.delete(`/tasks/${id}`).then(unwrap);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(unwrap);

// Dashboard & analytics
export const getTaskDashboard = () => api.get("/tasks/dashboard").then(unwrap);

export const exportTasks = (format = "csv") =>
  api.get("/tasks/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
