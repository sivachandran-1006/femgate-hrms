import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRosterDashboard, getRosterAnalytics, getRosterAuditLog,
  getShifts, createShift, updateShift, deleteShift,
  getAssignments, createAssignment, bulkAssign, deleteAssignment,
  getChangeRequests, createChangeRequest, reviewChangeRequest,
  getOvertime, requestOvertime, reviewOvertime,
  getSwapRequests, createSwapRequest, updateSwapStatus,
} from "../api/rosterApi";

const KEY = ["roster"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useRosterDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getRosterDashboard });
export const useRosterAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getRosterAnalytics });
export const useRosterAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getRosterAuditLog });

export const useShifts = (p) => useQuery({ queryKey: [...KEY, "shifts", p], queryFn: () => getShifts(p) });
export const useCreateShift = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createShift, onSuccess: () => inv(qc) }); };
export const useUpdateShift = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateShift(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteShift = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteShift, onSuccess: () => inv(qc) }); };

export const useAssignments = (p) => useQuery({ queryKey: [...KEY, "assignments", p], queryFn: () => getAssignments(p) });
export const useCreateAssignment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAssignment, onSuccess: () => inv(qc) }); };
export const useBulkAssign = () => { const qc = useQueryClient(); return useMutation({ mutationFn: bulkAssign, onSuccess: () => inv(qc) }); };
export const useDeleteAssignment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteAssignment, onSuccess: () => inv(qc) }); };

export const useChangeRequests = () => useQuery({ queryKey: [...KEY, "changes"], queryFn: getChangeRequests });
export const useCreateChangeRequest = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createChangeRequest, onSuccess: () => inv(qc) }); };
export const useReviewChangeRequest = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => reviewChangeRequest(id, status), onSuccess: () => inv(qc) }); };

export const useOvertime = () => useQuery({ queryKey: [...KEY, "overtime"], queryFn: getOvertime });
export const useRequestOvertime = () => { const qc = useQueryClient(); return useMutation({ mutationFn: requestOvertime, onSuccess: () => inv(qc) }); };
export const useReviewOvertime = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => reviewOvertime(id, status), onSuccess: () => inv(qc) }); };

export const useSwapRequests = () => useQuery({ queryKey: [...KEY, "swaps"], queryFn: getSwapRequests });
export const useCreateSwapRequest = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSwapRequest, onSuccess: () => inv(qc) }); };
export const useUpdateSwapStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateSwapStatus(id, status), onSuccess: () => inv(qc) }); };
