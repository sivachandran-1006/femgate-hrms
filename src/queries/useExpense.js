import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenseDashboard, getExpenseAnalytics,
  getExpenses, getExpense, createExpense, updateExpense, submitExpense,
  approveExpense, rejectExpense, clarifyExpense, reimburseExpense, deleteExpense,
  getAdvances, createAdvance, approveAdvance,
  getAuditLogs,
} from "../api/expenseApi";

const KEY = ["expenses"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useExpenseDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getExpenseDashboard });
export const useExpenseAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getExpenseAnalytics });
export const useExpenses         = (p) => useQuery({ queryKey: [...KEY, "list", p], queryFn: () => getExpenses(p) });
export const useExpense          = (id) => useQuery({ queryKey: [...KEY, id], queryFn: () => getExpense(id), enabled: !!id });
export const useAdvances         = () => useQuery({ queryKey: [...KEY, "advances"], queryFn: getAdvances });
export const useAuditLogs        = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getAuditLogs });

export const useCreateExpense    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createExpense, onSuccess: () => inv(qc) }); };
export const useUpdateExpense    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateExpense(id, d), onSuccess: () => inv(qc) }); };
export const useSubmitExpense    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => submitExpense(id), onSuccess: () => inv(qc) }); };
export const useApproveExpense   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => approveExpense(id, d), onSuccess: () => inv(qc) }); };
export const useRejectExpense    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => rejectExpense(id, d), onSuccess: () => inv(qc) }); };
export const useClarifyExpense   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => clarifyExpense(id, d), onSuccess: () => inv(qc) }); };
export const useReimburseExpense = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => reimburseExpense(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteExpense    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteExpense(id), onSuccess: () => inv(qc) }); };

export const useCreateAdvance    = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAdvance, onSuccess: () => inv(qc) }); };
export const useApproveAdvance   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => approveAdvance(id), onSuccess: () => inv(qc) }); };
