import api from "./axios";

// GET /superadmin/security/settings
export const getSecuritySettings = () => api.get("/superadmin/security/settings").then(r => r.data);

// PUT /superadmin/security/settings
export const updateSecuritySettings = (data) => api.put("/superadmin/security/settings", data).then(r => r.data);

// GET /superadmin/security/sessions
export const getActiveSessions = () => api.get("/superadmin/security/sessions").then(r => r.data);

// DELETE /superadmin/security/sessions/:id  — force logout a session
export const forceLogoutSession = (id) => api.delete(`/superadmin/security/sessions/${id}`).then(r => r.data);

// DELETE /superadmin/security/sessions  — force logout all sessions
export const forceLogoutAll = () => api.delete("/superadmin/security/sessions").then(r => r.data);

// GET /superadmin/security/stats  — active sessions count, failed logins, MFA count, score
export const getSecurityStats = () => api.get("/superadmin/security/stats").then(r => r.data);

// POST /superadmin/security/ip-whitelist  — add IP
export const addIpToWhitelist = (ip) => api.post("/superadmin/security/ip-whitelist", { ip }).then(r => r.data);

// DELETE /superadmin/security/ip-whitelist  — remove IP
export const removeIpFromWhitelist = (ip) => api.delete("/superadmin/security/ip-whitelist", { data: { ip } }).then(r => r.data);
