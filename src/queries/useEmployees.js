import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEmployees, getEmployee,
  createEmployee, updateEmployee, deleteEmployee,
} from "../services/employeeService";

export const useFetchAllEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployees(),
  });
};

export const useFetchEmployee = (id) => {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateEmployee(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};
