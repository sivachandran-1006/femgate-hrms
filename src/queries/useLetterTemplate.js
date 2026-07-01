import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLTDashboard, getLetterTemplates, getLetterTemplate,
  createLetterTemplate, updateLetterTemplate, deleteLetterTemplate,
  duplicateLetterTemplate, publishLetterTemplate, archiveLetterTemplate,
  generateDocument, getLTCategories, createLTCategory, deleteLTCategory,
  getLTVariables, getGeneratedDocuments, downloadDocument, deleteDocument,
  getLTVersionHistory, restoreLTVersion, getLTSettings, updateLTSettings,
} from "../api/letterTemplateApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

export const useLTDashboard       = ()   => useQuery({ queryKey: ["lt-dashboard"],      queryFn: getLTDashboard });
export const useLetterTemplates   = (p)  => useQuery({ queryKey: ["letter-templates", p], queryFn: () => getLetterTemplates(p), select: d => d?.templates ?? d ?? [] });
export const useLetterTemplate    = (id) => useQuery({ queryKey: ["letter-template", id], queryFn: () => getLetterTemplate(id), enabled: !!id });
export const useLTCategories      = ()   => useQuery({ queryKey: ["lt-categories"],     queryFn: getLTCategories, select: d => Array.isArray(d) ? d : [] });
export const useLTVariables       = ()   => useQuery({ queryKey: ["lt-variables"],      queryFn: getLTVariables });
export const useGeneratedDocuments= (p)  => useQuery({ queryKey: ["lt-generated", p],   queryFn: () => getGeneratedDocuments(p), select: d => d?.documents ?? d ?? [] });
export const useLTVersionHistory  = (id) => useQuery({ queryKey: ["lt-versions", id],   queryFn: () => getLTVersionHistory(id), enabled: !!id, select: d => Array.isArray(d) ? d : [] });
export const useLTSettings        = ()   => useQuery({ queryKey: ["lt-settings"],       queryFn: getLTSettings });

export const useCreateLetterTemplate   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createLetterTemplate,   onSuccess: () => { inv(qc, "letter-templates"); inv(qc, "lt-dashboard"); } }); };
export const useUpdateLetterTemplate   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateLetterTemplate(id, d), onSuccess: () => inv(qc, "letter-templates") }); };
export const useDeleteLetterTemplate   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteLetterTemplate,   onSuccess: () => { inv(qc, "letter-templates"); inv(qc, "lt-dashboard"); } }); };
export const useDuplicateLetterTemplate= () => { const qc = useQueryClient(); return useMutation({ mutationFn: duplicateLetterTemplate, onSuccess: () => inv(qc, "letter-templates") }); };
export const usePublishLetterTemplate  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishLetterTemplate,  onSuccess: () => { inv(qc, "letter-templates"); inv(qc, "lt-dashboard"); } }); };
export const useArchiveLetterTemplate  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: archiveLetterTemplate,  onSuccess: () => inv(qc, "letter-templates") }); };
export const useGenerateDocument       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => generateDocument(id, d), onSuccess: () => { inv(qc, "lt-generated"); inv(qc, "lt-dashboard"); } }); };
export const useCreateLTCategory       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createLTCategory,       onSuccess: () => inv(qc, "lt-categories") }); };
export const useDeleteLTCategory       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteLTCategory,       onSuccess: () => inv(qc, "lt-categories") }); };
export const useDeleteDocument         = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteDocument,         onSuccess: () => inv(qc, "lt-generated") }); };
export const useRestoreLTVersion       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ver }) => restoreLTVersion(id, ver), onSuccess: () => { inv(qc, "letter-templates"); inv(qc, "lt-versions"); } }); };
export const useUpdateLTSettings       = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateLTSettings,       onSuccess: () => inv(qc, "lt-settings") }); };
