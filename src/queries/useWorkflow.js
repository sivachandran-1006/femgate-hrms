import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkflowDashboard,
  getWorkflows, createWorkflow, getWorkflow, updateWorkflow, deleteWorkflow,
  getApprovalInbox, approveRequest, rejectRequest, escalateRequest,
  getWorkflowAnalytics
} from "../api/workflowApi";

const KEY = ["workflows"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

// Dashboard
export const useWorkflowDashboard = () => useQuery({
  queryKey: [...KEY, "dashboard"],
  queryFn: getWorkflowDashboard,
});

// Workflows
export const useWorkflows = (p) => useQuery({
  queryKey: [...KEY, "list", p],
  queryFn: () => getWorkflows(p),
});

export const useWorkflow = (id) => useQuery({
  queryKey: [...KEY, id],
  queryFn: () => getWorkflow(id),
  enabled: !!id,
});

export const useCreateWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => inv(qc),
  });
};

export const useUpdateWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => updateWorkflow(id, d),
    onSuccess: () => inv(qc),
  });
};

export const useDeleteWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => inv(qc),
  });
};

// Approvals
export const useApprovalInbox = (p) => useQuery({
  queryKey: [...KEY, "inbox", p],
  queryFn: () => getApprovalInbox(p),
});

export const useApproveRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => approveRequest(id, d),
    onSuccess: () => inv(qc),
  });
};

export const useRejectRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => rejectRequest(id, d),
    onSuccess: () => inv(qc),
  });
};

export const useEscalateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: escalateRequest,
    onSuccess: () => inv(qc),
  });
};

// Analytics
export const useWorkflowAnalytics = () => useQuery({
  queryKey: [...KEY, "analytics"],
  queryFn: getWorkflowAnalytics,
});
