import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "../services/holidayService";

const KEY = ["holidays"];

export const useHolidays = () =>
  useQuery({ queryKey: KEY, queryFn: getHolidays });

export const useCreateHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateHoliday(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteHoliday(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
