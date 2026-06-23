import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOnboardingDashboard, getOnboardings, getOnboarding, createOnboarding, updateOnboarding, getChecklists, getTasks, getOffboardings } from "../api/onboardingApi";

const KEY = ["onboarding"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useOnboardingDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getOnboardingDashboard });
export const useOnboardings         = (p) => useQuery({ queryKey: [...KEY, "list", p], queryFn: () => getOnboardings(p) });
export const useOnboarding          = (id) => useQuery({ queryKey: [...KEY, id], queryFn: () => getOnboarding(id), enabled: !!id });
export const useChecklists          = (id) => useQuery({ queryKey: [...KEY, "checklist", id], queryFn: () => getChecklists(id), enabled: !!id });
export const useTasks               = (id) => useQuery({ queryKey: [...KEY, "tasks", id], queryFn: () => getTasks(id), enabled: !!id });
export const useOffboardings        = (p) => useQuery({ queryKey: [...KEY, "offboarding", p], queryFn: () => getOffboardings(p) });

export const useCreateOnboarding    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createOnboarding, onSuccess: () => inv(qc) }); };
export const useUpdateOnboarding    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ([id, d]) => updateOnboarding(id, d), onSuccess: () => inv(qc) }); };
