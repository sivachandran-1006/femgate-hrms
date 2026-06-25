import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile, updateMyProfile, getMyAttendance,
  getMyPayslips, getMyDocuments, getMyAssets,
  createDocument, deleteDocument, selfCheckIn, selfCheckOut,
} from "../services/selfService";
import { addMaintenance, returnAsset } from "../api/assetApi";

export const useMyProfile = () =>
  useQuery({ queryKey: ["me", "profile"], queryFn: getMyProfile });

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "profile"] }),
  });
};

export const useMyAttendance = () =>
  useQuery({ queryKey: ["me", "attendance"], queryFn: getMyAttendance });

export const useSelfCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfCheckIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "attendance"] });
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
    },
  });
};

export const useSelfCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfCheckOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "attendance"] });
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
    },
  });
};

export const useMyPayslips = () =>
  useQuery({ queryKey: ["me", "payslips"], queryFn: getMyPayslips });

export const useMyDocuments = () =>
  useQuery({ queryKey: ["me", "documents"], queryFn: getMyDocuments });

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "documents"] }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "documents"] }),
  });
};

export const useMyAssets = () =>
  useQuery({ queryKey: ["me", "assets"], queryFn: getMyAssets });

// Report an issue → logs a maintenance record + flags the asset for repair
export const useReportAssetIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description }) =>
      addMaintenance(id, { type: "Issue Reported", description, status: "Pending", setUnderRepair: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "assets"] }),
  });
};

// Request return → marks the assignment returned (pending IT pickup)
export const useRequestAssetReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }) =>
      returnAsset(id, { remarks: remarks || "Return requested by employee", accept: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "assets"] }),
  });
};
