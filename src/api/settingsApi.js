import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? {};

export const getAllSettings   = ()        => api.get("/settings").then(unwrap);
export const getSettingsGroup = (group)   => api.get(`/settings/${group}`).then(unwrap);
export const saveSettingsGroup = (group, data) => api.put(`/settings/${group}`, data).then(unwrap);
export const getSettingsAudit = ()        => api.get("/settings/audit/log").then(unwrap);
