import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment,
  getDeptHeads, getDeptEmployees, getDeptDesignations, getDeptAnalytics, getDeptAudit,
  importDepartments,
} from "../services/departmentService";

const KEY = ["departments"];

export const useDepartments = (params) =>
  useQuery({ queryKey: [...KEY, params], queryFn: () => getDepartments(params) });

export const useDepartment = (id) =>
  useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getDepartment(id), enabled: !!id });

export const useDeptHeads = () =>
  useQuery({ queryKey: ["dept-heads"], queryFn: getDeptHeads });

export const useDeptEmployees = (id) =>
  useQuery({ queryKey: [...KEY, id, "employees"], queryFn: () => getDeptEmployees(id), enabled: !!id });

export const useDeptDesignations = (id) =>
  useQuery({ queryKey: [...KEY, id, "designations"], queryFn: () => getDeptDesignations(id), enabled: !!id });

export const useDeptAnalytics = (id) =>
  useQuery({ queryKey: [...KEY, id, "analytics"], queryFn: () => getDeptAnalytics(id), enabled: !!id });

export const useDeptAudit = (id) =>
  useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getDeptAudit(id), enabled: !!id });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateDepartment(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useImportDepartments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => importDepartments(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
