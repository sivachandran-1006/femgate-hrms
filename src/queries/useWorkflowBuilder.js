import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkflowDashboard, getWorkflows, createWorkflow, updateWorkflow,
  deleteWorkflow, publishWorkflow, duplicateWorkflow, getWorkflowTemplates,
  getWorkflowHistory, executeWorkflow, workflowAction,
  getWorkflowSettings, updateWorkflowSettings,
} from "../api/workflowBuilderApi";

const inv = (qc, key) => qc.invalidateQueries({ queryKey: [key] });

export const useWFDashboard      = ()      => useQuery({ queryKey: ["wf-dashboard"],   queryFn: getWorkflowDashboard });
export const useWorkflows        = (p)     => useQuery({ queryKey: ["workflows-b", p], queryFn: () => getWorkflows(p), select: d => d?.workflows ?? d ?? [] });
export const useWFTemplates      = ()      => useQuery({ queryKey: ["wf-templates"],   queryFn: getWorkflowTemplates,  select: d => Array.isArray(d) ? d : [] });
export const useWFHistory        = (p)     => useQuery({ queryKey: ["wf-history", p],  queryFn: () => getWorkflowHistory(p), select: d => d?.executions ?? d ?? [] });
export const useWFSettings       = ()      => useQuery({ queryKey: ["wf-settings"],    queryFn: getWorkflowSettings });

export const useCreateWF   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createWorkflow,    onSuccess: () => inv(qc, "workflows-b") }); };
export const useUpdateWF   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateWorkflow(id, d),    onSuccess: () => inv(qc, "workflows-b") }); };
export const useDeleteWF   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteWorkflow,    onSuccess: () => inv(qc, "workflows-b") }); };
export const usePublishWF  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishWorkflow,   onSuccess: () => { inv(qc, "workflows-b"); inv(qc, "wf-dashboard"); } }); };
export const useDuplicateWF= () => { const qc = useQueryClient(); return useMutation({ mutationFn: duplicateWorkflow, onSuccess: () => inv(qc, "workflows-b") }); };
export const useExecuteWF  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: executeWorkflow,   onSuccess: () => inv(qc, "wf-history") }); };
export const useWFAction   = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => workflowAction(id, d), onSuccess: () => inv(qc, "wf-history") }); };
export const useUpdateWFSettings = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateWorkflowSettings, onSuccess: () => inv(qc, "wf-settings") }); };
