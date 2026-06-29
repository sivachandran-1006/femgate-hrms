import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeatureFlags, createFeatureFlag, updateFeatureFlag, toggleFeatureFlag, deleteFeatureFlag, overrideFlag,
  getReleases, createRelease, updateRelease, publishRelease, rollbackRelease, deleteRelease,
  getMarketplaceApps, createMarketplaceApp, updateMarketplaceApp, deleteMarketplaceApp, installApp, uninstallApp, getInstalledApps,
  getPlatformHealth, getHealthHistory, getPlatformStats,
  getBackups, triggerBackup, deleteBackupRecord,
  getSubscriptions, getSubscriptionDashboard, getSubscription, updateSubscription, cancelSubscription, reactivateSubscription,
} from "../api/platformApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

// ── Feature Flags ──────────────────────────────────────────────────────────
export const useFeatureFlags   = ()      => useQuery({ queryKey: ["feature-flags"],       queryFn: getFeatureFlags,      select: d => d?.flags ?? d ?? [] });
export const useCreateFlag     = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: createFeatureFlag,  onSuccess: () => inv(qc, "feature-flags") }); };
export const useUpdateFlag     = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateFeatureFlag(id, d), onSuccess: () => inv(qc, "feature-flags") }); };
export const useToggleFlag     = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: toggleFeatureFlag,  onSuccess: () => inv(qc, "feature-flags") }); };
export const useDeleteFlag     = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteFeatureFlag,  onSuccess: () => inv(qc, "feature-flags") }); };
export const useOverrideFlag   = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => overrideFlag(id, d), onSuccess: () => inv(qc, "feature-flags") }); };

// ── Releases ──────────────────────────────────────────────────────────────
export const useReleases       = (p)     => useQuery({ queryKey: ["releases", p],          queryFn: () => getReleases(p),     select: d => d?.releases ?? d ?? [] });
export const useCreateRelease  = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: createRelease,   onSuccess: () => inv(qc, "releases") }); };
export const useUpdateRelease  = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateRelease(id, d), onSuccess: () => inv(qc, "releases") }); };
export const usePublishRelease = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: publishRelease,  onSuccess: () => inv(qc, "releases") }); };
export const useRollback       = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: rollbackRelease, onSuccess: () => inv(qc, "releases") }); };
export const useDeleteRelease  = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteRelease,   onSuccess: () => inv(qc, "releases") }); };

// ── Marketplace ───────────────────────────────────────────────────────────
export const useMarketplaceApps  = (p)   => useQuery({ queryKey: ["marketplace", p],      queryFn: () => getMarketplaceApps(p), select: d => d?.apps ?? d ?? [] });
export const useInstalledApps    = ()    => useQuery({ queryKey: ["marketplace-installed"], queryFn: getInstalledApps, select: d => d?.installs ?? d ?? [] });
export const useInstallApp       = ()    => { const qc = useQueryClient(); return useMutation({ mutationFn: installApp,   onSuccess: () => { inv(qc, "marketplace"); inv(qc, "marketplace-installed"); } }); };
export const useUninstallApp     = ()    => { const qc = useQueryClient(); return useMutation({ mutationFn: uninstallApp, onSuccess: () => { inv(qc, "marketplace"); inv(qc, "marketplace-installed"); } }); };
export const useCreateMktApp     = ()    => { const qc = useQueryClient(); return useMutation({ mutationFn: createMarketplaceApp, onSuccess: () => inv(qc, "marketplace") }); };
export const useUpdateMktApp     = ()    => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateMarketplaceApp(id, d), onSuccess: () => inv(qc, "marketplace") }); };

// ── Monitoring ────────────────────────────────────────────────────────────
export const usePlatformHealth = ()      => useQuery({ queryKey: ["platform-health"],      queryFn: getPlatformHealth,    refetchInterval: 30000 });
export const usePlatformStats  = ()      => useQuery({ queryKey: ["platform-stats"],       queryFn: getPlatformStats,     refetchInterval: 60000 });
export const useHealthHistory  = (p)     => useQuery({ queryKey: ["health-history", p],    queryFn: () => getHealthHistory(p), select: d => d?.logs ?? d ?? [] });

// ── Backup ────────────────────────────────────────────────────────────────
export const useBackups        = ()      => useQuery({ queryKey: ["backups"],               queryFn: getBackups,           select: d => ({ backups: d?.backups ?? [], summary: d?.summary ?? {} }) });
export const useTriggerBackup  = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: triggerBackup,       onSuccess: () => inv(qc, "backups") }); };
export const useDeleteBackup   = ()      => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteBackupRecord,  onSuccess: () => inv(qc, "backups") }); };

// ── Subscriptions ─────────────────────────────────────────────────────────
export const useSubscriptions      = (p) => useQuery({ queryKey: ["subscriptions", p],     queryFn: () => getSubscriptions(p) });
export const useSubDashboard       = ()  => useQuery({ queryKey: ["sub-dashboard"],         queryFn: getSubscriptionDashboard });
export const useSubscription       = (cid) => useQuery({ queryKey: ["subscription", cid],  queryFn: () => getSubscription(cid), enabled: !!cid });
export const useUpdateSub          = ()  => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ cid, ...d }) => updateSubscription(cid, d), onSuccess: () => { inv(qc, "subscriptions"); inv(qc, "sub-dashboard"); } }); };
export const useCancelSub          = ()  => { const qc = useQueryClient(); return useMutation({ mutationFn: cancelSubscription,     onSuccess: () => { inv(qc, "subscriptions"); inv(qc, "sub-dashboard"); } }); };
export const useReactivateSub      = ()  => { const qc = useQueryClient(); return useMutation({ mutationFn: reactivateSubscription, onSuccess: () => { inv(qc, "subscriptions"); inv(qc, "sub-dashboard"); } }); };
