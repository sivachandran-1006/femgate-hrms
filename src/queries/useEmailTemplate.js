import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboard, getTemplates, getTemplate, createTemplate, updateTemplate,
  deleteTemplate, duplicateTemplate, publishTemplate, archiveTemplate, sendTestEmail,
  getCategories, createCategory, updateCategory, deleteCategory,
  getVariableLibrary, createVariable, updateVariable, deleteVariable,
  getLayoutLibrary, getEmailHistory, resendEmail,
  getVersionHistory, restoreVersion, getSettings, updateSettings,
} from "../api/emailTemplateApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

export const useETDashboard      = ()    => useQuery({ queryKey: ["email-template-dashboard"],  queryFn: getDashboard });
export const useTemplates        = (p)   => useQuery({ queryKey: ["email-templates", p],         queryFn: () => getTemplates(p),       select: d => d?.templates ?? d ?? [] });
export const useTemplate         = (id)  => useQuery({ queryKey: ["email-templates", id],        queryFn: () => getTemplate(id),        enabled: !!id });
export const useEmailCategories  = ()    => useQuery({ queryKey: ["email-categories"],            queryFn: getCategories,                select: d => Array.isArray(d) ? d : [] });
export const useEmailVariables   = ()    => useQuery({ queryKey: ["email-variables"],             queryFn: getVariableLibrary,           select: d => Array.isArray(d) ? d : [] });
export const useEmailLayouts     = ()    => useQuery({ queryKey: ["email-layouts"],               queryFn: getLayoutLibrary,             select: d => Array.isArray(d) ? d : [] });
export const useEmailHistory     = (p)   => useQuery({ queryKey: ["email-history", p],           queryFn: () => getEmailHistory(p),    select: d => d?.history ?? d ?? [] });
export const useEmailVersions    = (id)  => useQuery({ queryKey: ["email-versions", id],         queryFn: () => getVersionHistory(id),  enabled: !!id, select: d => Array.isArray(d) ? d : [] });
export const useEmailSettings    = ()    => useQuery({ queryKey: ["email-settings"],              queryFn: getSettings });

export const useCreateTemplate    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createTemplate,    onSuccess: () => { inv(qc, "email-templates"); inv(qc, "email-template-dashboard"); } }); };
export const useUpdateTemplate    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateTemplate(id, d), onSuccess: () => inv(qc, "email-templates") }); };
export const useDeleteTemplate    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteTemplate,    onSuccess: () => { inv(qc, "email-templates"); inv(qc, "email-template-dashboard"); } }); };
export const useDuplicateTemplate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: duplicateTemplate, onSuccess: () => inv(qc, "email-templates") }); };
export const usePublishTemplate   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishTemplate,   onSuccess: () => { inv(qc, "email-templates"); inv(qc, "email-template-dashboard"); } }); };
export const useArchiveTemplate   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: archiveTemplate,   onSuccess: () => inv(qc, "email-templates") }); };
export const useSendTestEmail     = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => sendTestEmail(id, d), onSuccess: () => inv(qc, "email-history") }); };
export const useCreateCategory    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createCategory,    onSuccess: () => inv(qc, "email-categories") }); };
export const useUpdateCategory    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateCategory(id, d), onSuccess: () => inv(qc, "email-categories") }); };
export const useDeleteCategory    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteCategory,    onSuccess: () => inv(qc, "email-categories") }); };
export const useCreateVariable    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createVariable,    onSuccess: () => inv(qc, "email-variables") }); };
export const useUpdateVariable    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateVariable(id, d), onSuccess: () => inv(qc, "email-variables") }); };
export const useDeleteVariable    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteVariable,    onSuccess: () => inv(qc, "email-variables") }); };
export const useResendEmail       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: resendEmail,       onSuccess: () => inv(qc, "email-history") }); };
export const useRestoreVersion    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ver }) => restoreVersion(id, ver), onSuccess: () => { inv(qc, "email-templates"); inv(qc, "email-versions"); } }); };
export const useUpdateEmailSettings = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateSettings, onSuccess: () => inv(qc, "email-settings") }); };
