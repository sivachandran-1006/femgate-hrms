import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, approveExpense, rejectExpense, deleteExpense } from "../services/expenseService";

const KEY = ["expenses"];

export const useExpenses = () =>
  useQuery({ queryKey: KEY, queryFn: getExpenses });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useApproveExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useRejectExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
