import api from "../api/axios";

export const getAllEmployees = async () => {
  const res = await api.get("/employees");
  return res.data?.data ?? res.data ?? [];
};

export const getEmployee = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data?.data ?? res.data ?? {};
};
