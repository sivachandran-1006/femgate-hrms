import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOnboardingDashboard, getOnboardings, getOnboarding, createOnboarding, updateOnboarding, getChecklists, getTasks,
  getOffboardingDashboard, getOffboardings, getOffboarding, createOffboarding, updateOffboarding,
  createClearance, approveClearance, createAssetReturn, updateAssetReturn, createExitInterview, createSettlement
} from "../api/onboardingApi";

const KEY = ["onboarding"];
const OFFKEY = ["offboarding"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });
const offInv = (qc) => qc.invalidateQueries({ queryKey: OFFKEY });

// Onboarding Queries
export const useOnboardingDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getOnboardingDashboard });
export const useOnboardings         = (p) => useQuery({ queryKey: [...KEY, "list", p], queryFn: () => getOnboardings(p) });
export const useOnboarding          = (id) => useQuery({ queryKey: [...KEY, id], queryFn: () => getOnboarding(id), enabled: !!id });
export const useChecklists          = (id) => useQuery({ queryKey: [...KEY, "checklist", id], queryFn: () => getChecklists(id), enabled: !!id });
export const useTasks               = (id) => useQuery({ queryKey: [...KEY, "tasks", id], queryFn: () => getTasks(id), enabled: !!id });

// Onboarding Mutations
export const useCreateOnboarding    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createOnboarding, onSuccess: () => inv(qc) }); };
export const useUpdateOnboarding    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => updateOnboarding(id, d), onSuccess: () => inv(qc) }); };

// Offboarding Queries
export const useOffboardingDashboard = () => useQuery({ queryKey: [...OFFKEY, "dashboard"], queryFn: getOffboardingDashboard });
export const useOffboardings        = (p) => useQuery({ queryKey: [...OFFKEY, "list", p], queryFn: () => getOffboardings(p) });
export const useOffboarding         = (id) => useQuery({ queryKey: [...OFFKEY, id], queryFn: () => getOffboarding(id), enabled: !!id });

// Offboarding Mutations
export const useCreateOffboarding   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createOffboarding, onSuccess: () => offInv(qc) }); };
export const useUpdateOffboarding   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => updateOffboarding(id, d), onSuccess: () => offInv(qc) }); };
export const useCreateClearance     = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => createClearance(id, d), onSuccess: () => offInv(qc) }); };
export const useApproveClearance    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, cid, d]) => approveClearance(id, cid, d), onSuccess: () => offInv(qc) }); };
export const useCreateAssetReturn   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => createAssetReturn(id, d), onSuccess: () => offInv(qc) }); };
export const useUpdateAssetReturn   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, aid, d]) => updateAssetReturn(id, aid, d), onSuccess: () => offInv(qc) }); };
export const useCreateExitInterview = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => createExitInterview(id, d), onSuccess: () => offInv(qc) }); };
export const useCreateSettlement    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => createSettlement(id, d), onSuccess: () => offInv(qc) }); };
