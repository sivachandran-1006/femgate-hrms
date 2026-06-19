import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReportDashboard, getReportCatalog, generateReport, getReportAudit,
  getSavedReports, createSavedReport, updateSavedReport, deleteSavedReport,
} from "../api/reportApi";

const KEY = ["reports"];
export const useReportDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getReportDashboard });
export const useReportCatalog   = () => useQuery({ queryKey: [...KEY, "catalog"], queryFn: getReportCatalog });
export const useReportData = (module, report) => useQuery({ queryKey: [...KEY, "gen", module, report], queryFn: () => generateReport(module, report), enabled: !!module && !!report });
export const useReportAudit = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getReportAudit });
export const useSavedReports = () => useQuery({ queryKey: [...KEY, "saved"], queryFn: getSavedReports });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });
export const useCreateSavedReport = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSavedReport, onSuccess: () => inv(qc) }); };
export const useUpdateSavedReport = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateSavedReport(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteSavedReport = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteSavedReport(id), onSuccess: () => inv(qc) }); };
