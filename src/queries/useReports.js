import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReportDashboard, getReportCatalog, generateReport, getReportAudit,
  getSavedReports, createSavedReport, updateSavedReport, deleteSavedReport,
  getReportSchedules, createReportSchedule, updateReportSchedule, deleteReportSchedule,
  getReportShares, createReportShare, deleteReportShare,
  getExportLogs, createExportLog,
  getReportSettings, updateReportSettings,
} from "../api/reportApi";

const KEY = ["reports"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useReportDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getReportDashboard });
export const useReportCatalog   = () => useQuery({ queryKey: [...KEY, "catalog"],   queryFn: getReportCatalog });
export const useReportData      = (module, report) => useQuery({ queryKey: [...KEY, "gen", module, report], queryFn: () => generateReport(module, report), enabled: !!module && !!report });
export const useReportAudit     = () => useQuery({ queryKey: [...KEY, "audit"],     queryFn: getReportAudit });
export const useSavedReports    = () => useQuery({ queryKey: [...KEY, "saved"],     queryFn: getSavedReports });
export const useReportSchedules = () => useQuery({ queryKey: [...KEY, "schedules"], queryFn: getReportSchedules });
export const useReportShares    = () => useQuery({ queryKey: [...KEY, "shares"],    queryFn: getReportShares });
export const useExportLogs      = () => useQuery({ queryKey: [...KEY, "exports"],   queryFn: getExportLogs });
export const useReportSettings  = () => useQuery({ queryKey: [...KEY, "settings"],  queryFn: getReportSettings });

export const useCreateSavedReport    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSavedReport,    onSuccess: () => inv(qc) }); };
export const useUpdateSavedReport    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateSavedReport(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteSavedReport    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteSavedReport(id),    onSuccess: () => inv(qc) }); };
export const useCreateReportSchedule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createReportSchedule, onSuccess: () => inv(qc) }); };
export const useUpdateReportSchedule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateReportSchedule(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteReportSchedule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteReportSchedule(id), onSuccess: () => inv(qc) }); };
export const useCreateReportShare    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createReportShare,    onSuccess: () => inv(qc) }); };
export const useDeleteReportShare    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteReportShare(id),    onSuccess: () => inv(qc) }); };
export const useCreateExportLog      = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createExportLog,      onSuccess: () => inv(qc) }); };
export const useUpdateReportSettings = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateReportSettings, onSuccess: () => inv(qc) }); };
