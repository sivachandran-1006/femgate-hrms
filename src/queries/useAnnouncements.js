import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
} from "../services/announcementService";

const KEY = ["announcements"];

export const useAnnouncements = () =>
  useQuery({ queryKey: KEY, queryFn: getAnnouncements });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateAnnouncement(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const usePublishAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => publishAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
