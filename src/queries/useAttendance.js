import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttendance, markAttendance, checkOutById } from "../services/attendanceService";

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
