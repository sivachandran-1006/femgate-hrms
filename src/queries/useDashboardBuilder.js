import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardBuilderDashboard, getDashboards, createDashboard, updateDashboard,
  deleteDashboard, publishDashboard, archiveDashboard, duplicateDashboard,
  shareDashboard, unshareaDashboard, getSharedDashboards, getDashboardTemplates,
  getDashboardSettings, updateDashboardSettings,
} from "../api/dashboardBuilderApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

export const useDBBuilderDashboard = ()    => useQuery({ queryKey: ["db-builder-dash"],   queryFn: getDashboardBuilderDashboard });
export const useDashboards         = (p)   => useQuery({ queryKey: ["dashboards-b", p],   queryFn: () => getDashboards(p), select: d => d?.dashboards ?? d ?? [] });
export const useSharedDashboards   = ()    => useQuery({ queryKey: ["dashboards-shared"],  queryFn: getSharedDashboards, select: d => d?.shared ?? d ?? [] });
export const useDBTemplates        = ()    => useQuery({ queryKey: ["db-templates"],       queryFn: getDashboardTemplates, select: d => Array.isArray(d) ? d : [] });
export const useDBSettings         = ()    => useQuery({ queryKey: ["db-settings"],        queryFn: getDashboardSettings });

export const useCreateDashboard    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createDashboard,    onSuccess: () => inv(qc, "dashboards-b") }); };
export const useUpdateDashboard    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateDashboard(id, d), onSuccess: () => inv(qc, "dashboards-b") }); };
export const useDeleteDashboard    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteDashboard,    onSuccess: () => inv(qc, "dashboards-b") }); };
export const usePublishDashboard   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishDashboard,   onSuccess: () => { inv(qc, "dashboards-b"); inv(qc, "db-builder-dash"); } }); };
export const useArchiveDashboard   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: archiveDashboard,   onSuccess: () => inv(qc, "dashboards-b") }); };
export const useDuplicateDashboard = () => { const qc = useQueryClient(); return useMutation({ mutationFn: duplicateDashboard, onSuccess: () => inv(qc, "dashboards-b") }); };
export const useShareDashboard     = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => shareDashboard(id, d), onSuccess: () => { inv(qc, "dashboards-b"); inv(qc, "dashboards-shared"); } }); };
export const useUnshare            = () => { const qc = useQueryClient(); return useMutation({ mutationFn: unshareaDashboard,  onSuccess: () => inv(qc, "dashboards-shared") }); };
export const useUpdateDBSettings   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateDashboardSettings, onSuccess: () => inv(qc, "db-settings") }); };
