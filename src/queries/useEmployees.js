import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEmployees, getEmployee,
  createEmployee, updateEmployee, deleteEmployee,
} from "../services/employeeService";
import {
  getEmpDocuments, getEmpAssets, getEmpAttendance, getEmpLeave, getEmpPayroll,
  getEmpPerformance, getEmpActivity, transferEmployee, setEmployeeStatus,
  sendEmployeeInvite, cancelEmployeeInvite, resetEmployeePassword,
} from "../api/employeeApi";

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

// ── Profile sub-resource hooks ──
export const useEmpDocuments   = (id) => useQuery({ queryKey: ["employees", id, "documents"], queryFn: () => getEmpDocuments(id), enabled: !!id });
export const useEmpAssets      = (id) => useQuery({ queryKey: ["employees", id, "assets"], queryFn: () => getEmpAssets(id), enabled: !!id });
export const useEmpAttendance  = (id) => useQuery({ queryKey: ["employees", id, "attendance"], queryFn: () => getEmpAttendance(id), enabled: !!id });
export const useEmpLeave       = (id) => useQuery({ queryKey: ["employees", id, "leave"], queryFn: () => getEmpLeave(id), enabled: !!id });
export const useEmpPayroll     = (id) => useQuery({ queryKey: ["employees", id, "payroll"], queryFn: () => getEmpPayroll(id), enabled: !!id });
export const useEmpPerformance = (id) => useQuery({ queryKey: ["employees", id, "performance"], queryFn: () => getEmpPerformance(id), enabled: !!id });
export const useEmpActivity    = (id) => useQuery({ queryKey: ["employees", id, "activity"], queryFn: () => getEmpActivity(id), enabled: !!id });

const invalidateEmp = (qc) => qc.invalidateQueries({ queryKey: ["employees"] });

export const useTransferEmployee = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...data }) => transferEmployee(id, data), onSuccess: () => invalidateEmp(qc) });
};
export const useSetEmployeeStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => setEmployeeStatus(id, status), onSuccess: () => invalidateEmp(qc) });
};
export const useSendInvite = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => sendEmployeeInvite(id), onSuccess: () => invalidateEmp(qc) });
};
export const useCancelInvite = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => cancelEmployeeInvite(id), onSuccess: () => invalidateEmp(qc) });
};
export const useResetPassword = () =>
  useMutation({ mutationFn: (id) => resetEmployeePassword(id) });
