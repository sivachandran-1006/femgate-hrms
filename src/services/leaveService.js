import api from "../api/axios";

export const getAllLeaves = async () => {
  const res = await api.get("/leaves");
  return res.data?.data ?? res.data ?? [];
};
