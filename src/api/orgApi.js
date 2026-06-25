import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? {};

export const getOrgTree      = () => api.get("/orgchart/tree").then(unwrap);
export const getOrgAnalytics = () => api.get("/orgchart/analytics").then(unwrap);
export const getOrgVacant    = () => api.get("/orgchart/vacant").then(unwrap);
