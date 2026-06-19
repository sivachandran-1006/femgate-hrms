import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPayroll, getPayrollDashboard, getPayrollAnalytics, getPayrollAudit, getPayslip,
  setPayrollStatus, generatePayroll,
  getSalaryStructures, createSalaryStructure, updateSalaryStructure, deleteSalaryStructure,
} from "../api/payrollApi";

const KEY = ["payroll"];

export const usePayroll          = (params) => useQuery({ queryKey: [...KEY, params], queryFn: () => fetchPayroll(params).then((r) => r.data?.data ?? r.data ?? r) });
export const usePayrollDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getPayrollDashboard });
export const usePayrollAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getPayrollAnalytics });
export const usePayrollAudit     = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getPayrollAudit });
export const usePayslip          = (id) => useQuery({ queryKey: [...KEY, "payslip", id], queryFn: () => getPayslip(id), enabled: !!id });
export const useSalaryStructures = () => useQuery({ queryKey: [...KEY, "structures"], queryFn: getSalaryStructures });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useSetPayrollStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => setPayrollStatus(id, status), onSuccess: () => inv(qc) }); };
export const useGeneratePayroll  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ month, year }) => generatePayroll(month, year), onSuccess: () => inv(qc) }); };
export const useCreateStructure  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSalaryStructure, onSuccess: () => inv(qc) }); };
export const useUpdateStructure  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateSalaryStructure(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteStructure  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteSalaryStructure(id), onSuccess: () => inv(qc) }); };
