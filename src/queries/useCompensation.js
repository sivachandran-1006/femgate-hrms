import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompDashboard, getCompAnalytics, getCompReports, getCompAuditLog,
  getBenchmarking, getBudget, getCompHistory,
  getBands, createBand, deleteBand,
  getRevisions, createRevision, updateRevisionStatus,
  getBonuses, createBonus, updateBonusStatus,
  getVariablePay, createVariablePay, updateVariablePayStatus,
  getPromotions, createPromotion, updatePromotionStatus,
} from "../api/compensationApi";

const KEY = ["compensation"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useCompDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getCompDashboard });
export const useCompAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getCompAnalytics });
export const useCompReports = () => useQuery({ queryKey: [...KEY, "reports"], queryFn: getCompReports });
export const useCompAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getCompAuditLog });
export const useBenchmarking = () => useQuery({ queryKey: [...KEY, "benchmarking"], queryFn: getBenchmarking });
export const useBudget = () => useQuery({ queryKey: [...KEY, "budget"], queryFn: getBudget });
export const useCompHistory = (employee) => useQuery({ queryKey: [...KEY, "history", employee], queryFn: () => getCompHistory(employee), enabled: !!employee });

export const useBands = () => useQuery({ queryKey: [...KEY, "bands"], queryFn: getBands });
export const useCreateBand = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createBand, onSuccess: () => inv(qc) }); };
export const useDeleteBand = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteBand, onSuccess: () => inv(qc) }); };

export const useRevisions = (p) => useQuery({ queryKey: [...KEY, "revisions", p], queryFn: () => getRevisions(p) });
export const useCreateRevision = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createRevision, onSuccess: () => inv(qc) }); };
export const useUpdateRevisionStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateRevisionStatus(id, status), onSuccess: () => inv(qc) }); };

export const useBonuses = () => useQuery({ queryKey: [...KEY, "bonuses"], queryFn: getBonuses });
export const useCreateBonus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createBonus, onSuccess: () => inv(qc) }); };
export const useUpdateBonusStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateBonusStatus(id, status), onSuccess: () => inv(qc) }); };

export const useVariablePay = () => useQuery({ queryKey: [...KEY, "varpay"], queryFn: getVariablePay });
export const useCreateVariablePay = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createVariablePay, onSuccess: () => inv(qc) }); };
export const useUpdateVariablePayStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateVariablePayStatus(id, status), onSuccess: () => inv(qc) }); };

export const usePromotions = () => useQuery({ queryKey: [...KEY, "promotions"], queryFn: getPromotions });
export const useCreatePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createPromotion, onSuccess: () => inv(qc) }); };
export const useUpdatePromotionStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updatePromotionStatus(id, status), onSuccess: () => inv(qc) }); };
