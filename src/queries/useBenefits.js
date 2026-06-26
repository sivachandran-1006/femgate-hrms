import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBenefitsDashboard, getBenefitsReports, getBenefitsAuditLog,
  getPlans, createPlan, updatePlan, deletePlan,
  getEnrollments, enroll, updateEnrollmentStatus,
  getDependents, addDependent, deleteDependent,
  getClaims, submitClaim, updateClaimStatus,
} from "../api/benefitsApi";

const KEY = ["benefits"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useBenefitsDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getBenefitsDashboard });
export const useBenefitsReports = () => useQuery({ queryKey: [...KEY, "reports"], queryFn: getBenefitsReports });
export const useBenefitsAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getBenefitsAuditLog });

export const usePlans = (p) => useQuery({ queryKey: [...KEY, "plans", p], queryFn: () => getPlans(p) });
export const useCreatePlan = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createPlan, onSuccess: () => inv(qc) }); };
export const useUpdatePlan = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updatePlan(id, d), onSuccess: () => inv(qc) }); };
export const useDeletePlan = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deletePlan, onSuccess: () => inv(qc) }); };

export const useEnrollments = (p) => useQuery({ queryKey: [...KEY, "enrollments", p], queryFn: () => getEnrollments(p) });
export const useEnroll = () => { const qc = useQueryClient(); return useMutation({ mutationFn: enroll, onSuccess: () => inv(qc) }); };
export const useUpdateEnrollmentStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateEnrollmentStatus(id, d), onSuccess: () => inv(qc) }); };

export const useDependents = (p) => useQuery({ queryKey: [...KEY, "dependents", p], queryFn: () => getDependents(p) });
export const useAddDependent = () => { const qc = useQueryClient(); return useMutation({ mutationFn: addDependent, onSuccess: () => inv(qc) }); };
export const useDeleteDependent = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteDependent, onSuccess: () => inv(qc) }); };

export const useClaims = () => useQuery({ queryKey: [...KEY, "claims"], queryFn: getClaims });
export const useSubmitClaim = () => { const qc = useQueryClient(); return useMutation({ mutationFn: submitClaim, onSuccess: () => inv(qc) }); };
export const useUpdateClaimStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateClaimStatus(id, d), onSuccess: () => inv(qc) }); };
