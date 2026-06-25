import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLeaves } from "../services/leaveService";
import {
  getLeaveDashboard, getLeaveAnalytics, getLeaveCalendar, getLeaveAudit,
  getLeavePolicies, createLeavePolicy, updateLeavePolicy, deleteLeavePolicy,
  updateLeaveStatus,
} from "../api/leaveApi";

const KEY = ["leaves"];

export const useFetchAllLeaves = () => useQuery({ queryKey: KEY, queryFn: () => getAllLeaves() });

export const useLeaveDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getLeaveDashboard });
export const useLeaveAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getLeaveAnalytics });
export const useLeaveCalendar  = () => useQuery({ queryKey: [...KEY, "calendar"], queryFn: getLeaveCalendar });
export const useLeaveAudit     = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getLeaveAudit });
export const useLeavePolicies  = () => useQuery({ queryKey: [...KEY, "policies"], queryFn: getLeavePolicies });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useReviewLeave = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status, reviewNote }) => updateLeaveStatus(id, status, reviewNote), onSuccess: () => inv(qc) });
};
export const useCreateLeavePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createLeavePolicy, onSuccess: () => inv(qc) }); };
export const useUpdateLeavePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateLeavePolicy(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteLeavePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteLeavePolicy(id), onSuccess: () => inv(qc) }); };
