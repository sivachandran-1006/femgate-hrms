import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVisitorDashboard, getVisitorReports, getVisitorAuditLog,
  getVisitors, getVisitor, registerVisitor, registerWalkIn,
  approveVisitor, rejectVisitor, cancelVisitor, checkInVisitor, checkOutVisitor, printBadge, qrCheckIn,
  getBlacklist, addBlacklist, removeBlacklist,
} from "../api/visitorApi";

const KEY = ["visitors"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useVisitorDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getVisitorDashboard });
export const useVisitorReports = () => useQuery({ queryKey: [...KEY, "reports"], queryFn: getVisitorReports });
export const useVisitorAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getVisitorAuditLog });

export const useVisitors = (p) => useQuery({ queryKey: [...KEY, "list", p], queryFn: () => getVisitors(p) });
export const useVisitor = (id) => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getVisitor(id), enabled: !!id });

export const useRegisterVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: registerVisitor, onSuccess: () => inv(qc) }); };
export const useRegisterWalkIn = () => { const qc = useQueryClient(); return useMutation({ mutationFn: registerWalkIn, onSuccess: () => inv(qc) }); };

export const useApproveVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: approveVisitor, onSuccess: () => inv(qc) }); };
export const useRejectVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, reason }) => rejectVisitor(id, reason), onSuccess: () => inv(qc) }); };
export const useCancelVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: cancelVisitor, onSuccess: () => inv(qc) }); };
export const useCheckInVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: checkInVisitor, onSuccess: () => inv(qc) }); };
export const useCheckOutVisitor = () => { const qc = useQueryClient(); return useMutation({ mutationFn: checkOutVisitor, onSuccess: () => inv(qc) }); };
export const usePrintBadge = () => { const qc = useQueryClient(); return useMutation({ mutationFn: printBadge, onSuccess: () => inv(qc) }); };
export const useQrCheckIn = () => { const qc = useQueryClient(); return useMutation({ mutationFn: qrCheckIn, onSuccess: () => inv(qc) }); };

export const useBlacklist = () => useQuery({ queryKey: [...KEY, "blacklist"], queryFn: getBlacklist });
export const useAddBlacklist = () => { const qc = useQueryClient(); return useMutation({ mutationFn: addBlacklist, onSuccess: () => inv(qc) }); };
export const useRemoveBlacklist = () => { const qc = useQueryClient(); return useMutation({ mutationFn: removeBlacklist, onSuccess: () => inv(qc) }); };
