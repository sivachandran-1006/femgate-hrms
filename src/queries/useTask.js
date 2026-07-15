import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus, getTaskDashboard,
} from "../api/taskApi";

const KEY = ["tasks"];

export const useTasks = (params) =>
  useQuery({ queryKey: [...KEY, "list", params], queryFn: () => fetchTasks(params) });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createTask, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...d }) => updateTask(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteTask, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};

export const useTaskDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getTaskDashboard });
