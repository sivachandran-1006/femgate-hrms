import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOnboarding, createJoiner, toggleTask, startOnboarding, deleteOnboarding } from "../services/onboardingService";

const KEY = ["onboarding"];

export const useOnboarding = () =>
  useQuery({ queryKey: KEY, queryFn: getOnboarding });

export const useCreateJoiner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJoiner,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useToggleTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, key, done }) => toggleTask(id, key, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useStartOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => startOnboarding(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteOnboarding(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
