import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssets, getAsset, createAsset, updateAsset, deleteAsset,
  getAssetDashboard, getAssetAnalytics, getAssetAssignments, getAssetMaintenance, getAssetAudit,
  assignAsset, returnAsset, addMaintenance,
  getLicenses, createLicense, updateLicense, deleteLicense,
} from "../api/assetApi";

const KEY = ["assets"];

export const useAssets    = (params) => useQuery({ queryKey: [...KEY, params], queryFn: () => getAssets(params) });
export const useAsset     = (id)     => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getAsset(id), enabled: !!id });
export const useAssetDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getAssetDashboard });
export const useAssetAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getAssetAnalytics });
export const useAssetAssignments = (id) => useQuery({ queryKey: [...KEY, id, "assignments"], queryFn: () => getAssetAssignments(id), enabled: !!id });
export const useAssetMaintenance = (id) => useQuery({ queryKey: [...KEY, id, "maintenance"], queryFn: () => getAssetMaintenance(id), enabled: !!id });
export const useAssetAudit       = (id) => useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getAssetAudit(id), enabled: !!id });
export const useLicenses  = () => useQuery({ queryKey: [...KEY, "licenses"], queryFn: getLicenses });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });
export const useCreateAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAsset, onSuccess: () => inv(qc) }); };
export const useUpdateAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateAsset(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteAsset(id), onSuccess: () => inv(qc) }); };
export const useAssignAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => assignAsset(id, d), onSuccess: () => inv(qc) }); };
export const useReturnAsset = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => returnAsset(id, d), onSuccess: () => inv(qc) }); };
export const useAddMaintenance = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => addMaintenance(id, d), onSuccess: () => inv(qc) }); };
export const useCreateLicense = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createLicense, onSuccess: () => inv(qc) }); };
export const useUpdateLicense = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateLicense(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteLicense = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteLicense(id), onSuccess: () => inv(qc) }); };
