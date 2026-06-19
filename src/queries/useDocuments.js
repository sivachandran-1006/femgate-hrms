import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments, getDocument, uploadDocument, updateDocument, archiveDocument,
  getDocDashboard, getDocAnalytics, getDocVersions, getDocAudit, addDocVersion, verifyDocument,
  getDocRequests, createDocRequest, fulfilDocRequest,
} from "../api/documentApi";

const KEY = ["documents"];

export const useDocuments  = (params) => useQuery({ queryKey: [...KEY, params], queryFn: () => getDocuments(params) });
export const useDocument   = (id)     => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getDocument(id), enabled: !!id });
export const useDocDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getDocDashboard });
export const useDocAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getDocAnalytics });
export const useDocVersions = (id) => useQuery({ queryKey: [...KEY, id, "versions"], queryFn: () => getDocVersions(id), enabled: !!id });
export const useDocAudit    = (id) => useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getDocAudit(id), enabled: !!id });
export const useDocRequests = () => useQuery({ queryKey: [...KEY, "requests"], queryFn: getDocRequests });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });
export const useUploadDocument = () => { const qc = useQueryClient(); return useMutation({ mutationFn: uploadDocument, onSuccess: () => inv(qc) }); };
export const useUpdateDocument = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateDocument(id, d), onSuccess: () => inv(qc) }); };
export const useArchiveDocument = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => archiveDocument(id), onSuccess: () => inv(qc) }); };
export const useVerifyDocument = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => verifyDocument(id, d), onSuccess: () => inv(qc) }); };
export const useAddDocVersion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => addDocVersion(id, d), onSuccess: () => inv(qc) }); };
export const useCreateDocRequest = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createDocRequest, onSuccess: () => inv(qc) }); };
export const useFulfilDocRequest = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => fulfilDocRequest(id, status), onSuccess: () => inv(qc) }); };
