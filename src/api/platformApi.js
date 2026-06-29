import api from "./axios";

const r = (res) => res.data?.data ?? res.data ?? res;

// ── Feature Flags ──────────────────────────────────────────────────────────
export const getFeatureFlags    = ()         => api.get("/superadmin/feature-flags").then(r);
export const createFeatureFlag  = (d)        => api.post("/superadmin/feature-flags", d).then(r);
export const updateFeatureFlag  = (id, d)    => api.put(`/superadmin/feature-flags/${id}`, d).then(r);
export const toggleFeatureFlag  = (id)       => api.patch(`/superadmin/feature-flags/${id}/toggle`).then(r);
export const deleteFeatureFlag  = (id)       => api.delete(`/superadmin/feature-flags/${id}`).then(r);
export const overrideFlag       = (id, d)    => api.post(`/superadmin/feature-flags/${id}/override`, d).then(r);

// ── Releases ──────────────────────────────────────────────────────────────
export const getReleases        = (params)   => api.get("/superadmin/releases", { params }).then(r);
export const getRelease         = (id)       => api.get(`/superadmin/releases/${id}`).then(r);
export const createRelease      = (d)        => api.post("/superadmin/releases", d).then(r);
export const updateRelease      = (id, d)    => api.put(`/superadmin/releases/${id}`, d).then(r);
export const publishRelease     = (id)       => api.patch(`/superadmin/releases/${id}/publish`).then(r);
export const rollbackRelease    = (id)       => api.patch(`/superadmin/releases/${id}/rollback`).then(r);
export const deleteRelease      = (id)       => api.delete(`/superadmin/releases/${id}`).then(r);

// ── Marketplace ───────────────────────────────────────────────────────────
export const getMarketplaceApps = (params)   => api.get("/superadmin/marketplace/apps", { params }).then(r);
export const createMarketplaceApp = (d)      => api.post("/superadmin/marketplace/apps", d).then(r);
export const updateMarketplaceApp = (id, d)  => api.put(`/superadmin/marketplace/apps/${id}`, d).then(r);
export const deleteMarketplaceApp = (id)     => api.delete(`/superadmin/marketplace/apps/${id}`).then(r);
export const installApp         = (id)       => api.post(`/superadmin/marketplace/apps/${id}/install`).then(r);
export const uninstallApp       = (id)       => api.delete(`/superadmin/marketplace/apps/${id}/install`).then(r);
export const getInstalledApps   = ()         => api.get("/superadmin/marketplace/installed").then(r);

// ── Monitoring ────────────────────────────────────────────────────────────
export const getPlatformHealth  = ()         => api.get("/superadmin/monitoring/health").then(r);
export const getHealthHistory   = (params)   => api.get("/superadmin/monitoring/history", { params }).then(r);
export const getPlatformStats   = ()         => api.get("/superadmin/monitoring/stats").then(r);

// ── Backup ────────────────────────────────────────────────────────────────
export const getBackups         = ()         => api.get("/superadmin/backup").then(r);
export const triggerBackup      = (d)        => api.post("/superadmin/backup/trigger", d).then(r);
export const deleteBackupRecord = (id)       => api.delete(`/superadmin/backup/${id}`).then(r);

// ── Subscriptions ─────────────────────────────────────────────────────────
export const getSubscriptions       = (params)   => api.get("/superadmin/subscriptions", { params }).then(r);
export const getSubscriptionDashboard = ()       => api.get("/superadmin/subscriptions/dashboard").then(r);
export const getSubscription        = (cid)      => api.get(`/superadmin/subscriptions/${cid}`).then(r);
export const updateSubscription     = (cid, d)   => api.put(`/superadmin/subscriptions/${cid}`, d).then(r);
export const cancelSubscription     = (cid)      => api.post(`/superadmin/subscriptions/${cid}/cancel`).then(r);
export const reactivateSubscription = (cid)      => api.post(`/superadmin/subscriptions/${cid}/reactivate`).then(r);
