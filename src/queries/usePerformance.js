import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPerformance, getPerfDashboard, getPerfAnalytics,
  createGoal, updateGoal, patchGoalProgress,
  getKpis, createKpi, updateKpi, deleteKpi,
  getReviews, createReview, updateReview,
  createAppraisal, updateAppraisal, appraiseAppraisal,
  getPips, createPip, updatePip,
  getRecognitions, createRecognition, deleteRecognition,
} from "../api/performanceApi";

const KEY = ["performance"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const usePerformance   = () => useQuery({ queryKey: [...KEY, "all"], queryFn: getPerformance });
export const usePerfDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getPerfDashboard });
export const usePerfAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getPerfAnalytics });
export const useKpis     = () => useQuery({ queryKey: [...KEY, "kpis"], queryFn: getKpis });
export const useReviews  = (params) => useQuery({ queryKey: [...KEY, "reviews", params], queryFn: () => getReviews(params) });
export const usePips     = () => useQuery({ queryKey: [...KEY, "pips"], queryFn: getPips });
export const useRecognitions = () => useQuery({ queryKey: [...KEY, "recognitions"], queryFn: getRecognitions });

export const useCreateGoal = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createGoal, onSuccess: () => inv(qc) }); };
export const useUpdateGoal = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateGoal(id, d), onSuccess: () => inv(qc) }); };
export const useGoalProgress = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, progress }) => patchGoalProgress(id, progress), onSuccess: () => inv(qc) }); };
export const useCreateKpi = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createKpi, onSuccess: () => inv(qc) }); };
export const useUpdateKpi = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateKpi(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteKpi = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteKpi(id), onSuccess: () => inv(qc) }); };
export const useCreateReview = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createReview, onSuccess: () => inv(qc) }); };
export const useUpdateReview = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateReview(id, d), onSuccess: () => inv(qc) }); };
export const useCreateAppraisal = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAppraisal, onSuccess: () => inv(qc) }); };
export const useUpdateAppraisal = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateAppraisal(id, d), onSuccess: () => inv(qc) }); };
export const useAppraise = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => appraiseAppraisal(id, d), onSuccess: () => inv(qc) }); };
export const useCreatePip = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createPip, onSuccess: () => inv(qc) }); };
export const useUpdatePip = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updatePip(id, d), onSuccess: () => inv(qc) }); };
export const useCreateRecognition = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createRecognition, onSuccess: () => inv(qc) }); };
export const useDeleteRecognition = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteRecognition(id), onSuccess: () => inv(qc) }); };
