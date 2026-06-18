import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranches, getBranch, createBranch, updateBranch, deleteBranch,
  getBranchHeads, getBranchDepartments, getBranchEmployees, getBranchHolidays,
  getBranchAnalytics, getBranchAudit, addBranchHoliday, updateBranchHoliday,
  deleteBranchHoliday, importBranches,
} from "../api/branchApi";

const KEY = ["branches"];

export const useBranches = (params) =>
  useQuery({ queryKey: [...KEY, params], queryFn: () => getBranches(params) });

export const useBranch = (id) =>
  useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getBranch(id), enabled: !!id });

export const useBranchHeads = () =>
  useQuery({ queryKey: ["branch-heads"], queryFn: getBranchHeads });

export const useBranchDepartments = (id) =>
  useQuery({ queryKey: [...KEY, id, "departments"], queryFn: () => getBranchDepartments(id), enabled: !!id });

export const useBranchEmployees = (id) =>
  useQuery({ queryKey: [...KEY, id, "employees"], queryFn: () => getBranchEmployees(id), enabled: !!id });

export const useBranchHolidays = (id) =>
  useQuery({ queryKey: [...KEY, id, "holidays"], queryFn: () => getBranchHolidays(id), enabled: !!id });

export const useBranchAnalytics = (id) =>
  useQuery({ queryKey: [...KEY, id, "analytics"], queryFn: () => getBranchAnalytics(id), enabled: !!id });

export const useBranchAudit = (id) =>
  useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getBranchAudit(id), enabled: !!id });

export const useCreateBranch = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d) => createBranch(d).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useUpdateBranch = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => updateBranch(id, d).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useDeleteBranch = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => deleteBranch(id).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useImportBranches = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (file) => importBranches(file), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useAddBranchHoliday = (id) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d) => addBranchHoliday(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, id, "holidays"] }) });
};
export const useUpdateBranchHoliday = (id) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ hid, ...d }) => updateBranchHoliday(id, hid, d), onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, id, "holidays"] }) });
};
export const useDeleteBranchHoliday = (id) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (hid) => deleteBranchHoliday(id, hid), onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, id, "holidays"] }) });
};
