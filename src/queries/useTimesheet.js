import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTimesheetEntries, createTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry, submitTimesheet,
  getTimesheetDashboard, getTimesheetAnalytics, getTimesheetProjects, getTimesheetClients,
  getTimesheetApprovals, reviewTimesheetApproval,
} from "../api/timesheetApi";

const KEY = ["timesheet"];

export const useTimesheetEntries = (params) =>
  useQuery({ queryKey: [...KEY, "entries", params], queryFn: () => fetchTimesheetEntries(params) });

export const useCreateTimesheetEntry = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createTimesheetEntry, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useUpdateTimesheetEntry = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => updateTimesheetEntry(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useDeleteTimesheetEntry = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteTimesheetEntry, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useSubmitTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: submitTimesheet, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

// ── Dashboard / analytics ──
export const useTimesheetDashboard = ()      => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getTimesheetDashboard });
export const useTimesheetAnalytics = (range) => useQuery({ queryKey: [...KEY, "analytics", range], queryFn: () => getTimesheetAnalytics(range) });
export const useTimesheetProjects  = ()      => useQuery({ queryKey: [...KEY, "projects"], queryFn: getTimesheetProjects });
export const useTimesheetClients   = ()      => useQuery({ queryKey: [...KEY, "clients"], queryFn: getTimesheetClients });

// ── Approvals ──
export const useTimesheetApprovals = (status) =>
  useQuery({ queryKey: [...KEY, "approvals", status], queryFn: () => getTimesheetApprovals(status) });

export const useReviewTimesheetApproval = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => reviewTimesheetApproval(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
