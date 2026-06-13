import axios from "axios";

const BASE = "http://localhost:5000";

export const fetchAttendance = () =>
  axios.get(`${BASE}/attendance`).then((r) => r.data);

export const createAttendanceRecord = (data) =>
  axios.post(`${BASE}/attendance`, data).then((r) => r.data);

export const checkOutAttendance = (id, data) =>
  axios.put(`${BASE}/attendance-checkout/${id}`, data).then((r) => r.data);
