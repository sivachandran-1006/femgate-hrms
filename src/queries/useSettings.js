import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSettings, getSettingsGroup, saveSettingsGroup, getSettingsAudit } from "../api/settingsApi";

const KEY = ["settings"];
export const useAllSettings   = () => useQuery({ queryKey: KEY, queryFn: getAllSettings });
export const useSettingsGroup = (group) => useQuery({ queryKey: [...KEY, group], queryFn: () => getSettingsGroup(group), enabled: !!group });
export const useSettingsAudit = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getSettingsAudit });

export const useSaveSettings = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ group, data }) => saveSettingsGroup(group, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
