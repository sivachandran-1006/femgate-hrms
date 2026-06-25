import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttendance, markAttendance, checkOutById } from "../services/attendanceService";
import {
  getAttDashboard, getAttTrends, getAttBreakdown, getLateReport, getOvertime, getWFH,
  getRegularizations, createRegularization, reviewRegularization,
} from "../api/attendanceApi";

const KEY = ["attendance"];

export const useAttendanceRecords = () =>
  useQuery({ queryKey: KEY, queryFn: getAttendance });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => checkOutById(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

// ── Dashboard / analytics ──
export const useAttDashboard = ()      => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getAttDashboard });
export const useAttTrends    = (range) => useQuery({ queryKey: [...KEY, "trends", range], queryFn: () => getAttTrends(range) });
export const useAttBreakdown = ()      => useQuery({ queryKey: [...KEY, "breakdown"], queryFn: getAttBreakdown });
export const useLateReport   = ()      => useQuery({ queryKey: [...KEY, "late"], queryFn: getLateReport });
export const useOvertime     = ()      => useQuery({ queryKey: [...KEY, "overtime"], queryFn: getOvertime });
export const useWFH          = ()      => useQuery({ queryKey: [...KEY, "wfh"], queryFn: getWFH });
export const useRegularizations = (status) => useQuery({ queryKey: [...KEY, "reg", status], queryFn: () => getRegularizations(status) });

export const useCreateRegularization = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createRegularization, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
export const useReviewRegularization = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => reviewRegularization(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
