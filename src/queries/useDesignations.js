import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDesignations, getDesignation, createDesignation, updateDesignation, deleteDesignation,
  getDesigHierarchy, getDesigEmployees, getDesigChain, getDesigAnalytics, getDesigAudit,
  importDesignations,
} from "../api/designationApi";

const KEY = ["designations"];

export const useDesignations = (params) =>
  useQuery({ queryKey: [...KEY, params], queryFn: () => getDesignations(params) });

export const useDesignation = (id) =>
  useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getDesignation(id), enabled: !!id });

export const useDesigHierarchy = () =>
  useQuery({ queryKey: [...KEY, "hierarchy"], queryFn: getDesigHierarchy });

export const useDesigEmployees = (id) =>
  useQuery({ queryKey: [...KEY, id, "employees"], queryFn: () => getDesigEmployees(id), enabled: !!id });

export const useDesigChain = (id) =>
  useQuery({ queryKey: [...KEY, id, "chain"], queryFn: () => getDesigChain(id), enabled: !!id });

export const useDesigAnalytics = (id) =>
  useQuery({ queryKey: [...KEY, id, "analytics"], queryFn: () => getDesigAnalytics(id), enabled: !!id });

export const useDesigAudit = (id) =>
  useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getDesigAudit(id), enabled: !!id });

export const useCreateDesignation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d) => createDesignation(d).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useUpdateDesignation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => updateDesignation(id, d).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useDeleteDesignation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => deleteDesignation(id).then((r) => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useImportDesignations = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (file) => importDesignations(file), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
