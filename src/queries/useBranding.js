import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrandSettings, saveBrandSettings, publishBrand, resetBrand,
  getBrandDashboard, getEmailTemplates, updateEmailTemplate,
  getBrandAssets, addBrandAsset, deleteBrandAsset, verifyDomain, getBrandAuditLog,
} from "../api/brandingApi";

const KEY = ["branding"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useBrandSettings = () => useQuery({ queryKey: [...KEY, "settings"], queryFn: getBrandSettings });
export const useSaveBrandSettings = () => { const qc = useQueryClient(); return useMutation({ mutationFn: saveBrandSettings, onSuccess: () => inv(qc) }); };
export const usePublishBrand = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishBrand, onSuccess: () => inv(qc) }); };
export const useResetBrand = () => { const qc = useQueryClient(); return useMutation({ mutationFn: resetBrand, onSuccess: () => inv(qc) }); };

export const useBrandDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getBrandDashboard });
export const useEmailTemplates = () => useQuery({ queryKey: [...KEY, "email-templates"], queryFn: getEmailTemplates });
export const useUpdateEmailTemplate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateEmailTemplate(id, d), onSuccess: () => inv(qc) }); };

export const useBrandAssets = () => useQuery({ queryKey: [...KEY, "assets"], queryFn: getBrandAssets });
export const useAddBrandAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: addBrandAsset, onSuccess: () => inv(qc) }); };
export const useDeleteBrandAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteBrandAsset, onSuccess: () => inv(qc) }); };

export const useVerifyDomain = () => { const qc = useQueryClient(); return useMutation({ mutationFn: verifyDomain, onSuccess: () => inv(qc) }); };
export const useBrandAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getBrandAuditLog });
