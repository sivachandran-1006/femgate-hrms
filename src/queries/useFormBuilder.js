import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFormDashboard, getForms, createForm, updateForm,
  deleteForm, publishForm, archiveForm, duplicateForm, getFormTemplates,
  getFormResponses, submitFormResponse, formResponseAction,
  getFormSettings, updateFormSettings,
} from "../api/formBuilderApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

export const useFBDashboard   = ()    => useQuery({ queryKey: ["fb-dashboard"],    queryFn: getFormDashboard });
export const useForms         = (p)   => useQuery({ queryKey: ["forms-b", p],      queryFn: () => getForms(p), select: d => d?.forms ?? d ?? [] });
export const useFBTemplates   = ()    => useQuery({ queryKey: ["fb-templates"],    queryFn: getFormTemplates,  select: d => Array.isArray(d) ? d : [] });
export const useFBResponses   = (p)   => useQuery({ queryKey: ["fb-responses", p], queryFn: () => getFormResponses(p), select: d => d?.responses ?? d ?? [] });
export const useFBSettings    = ()    => useQuery({ queryKey: ["fb-settings"],     queryFn: getFormSettings });

export const useCreateForm    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createForm,    onSuccess: () => inv(qc, "forms-b") }); };
export const useUpdateForm    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateForm(id, d), onSuccess: () => inv(qc, "forms-b") }); };
export const useDeleteForm    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteForm,    onSuccess: () => inv(qc, "forms-b") }); };
export const usePublishForm   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishForm,   onSuccess: () => { inv(qc, "forms-b"); inv(qc, "fb-dashboard"); } }); };
export const useArchiveForm   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: archiveForm,   onSuccess: () => inv(qc, "forms-b") }); };
export const useDuplicateForm = () => { const qc = useQueryClient(); return useMutation({ mutationFn: duplicateForm, onSuccess: () => inv(qc, "forms-b") }); };
export const useSubmitResponse= () => { const qc = useQueryClient(); return useMutation({ mutationFn: submitFormResponse, onSuccess: () => inv(qc, "fb-responses") }); };
export const useFBResponseAction = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => formResponseAction(id, d), onSuccess: () => inv(qc, "fb-responses") }); };
export const useUpdateFBSettings = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateFormSettings, onSuccess: () => inv(qc, "fb-settings") }); };
