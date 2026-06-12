import api from "../api/axios";

export const getAllEmployees = async () => {
  const res = await api.get("/employees");
  return res.data?.data ?? res.data ?? [];
};

export const getEmployee = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data?.data ?? res.data ?? {};
};

export const createEmployee = async (payload) => {
  const res = await api.post("/employees", payload);
  return res.data?.data ?? res.data;
};

export const updateEmployee = async (id, payload) => {
  const res = await api.put(`/employees/${id}`, payload);
  return res.data?.data ?? res.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data?.data ?? res.data;
};
