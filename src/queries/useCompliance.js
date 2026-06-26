import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplianceDashboard,
  getPolicies, getPolicy, createPolicy, updatePolicy, publishPolicy, archivePolicy, createPolicyVersion,
  getAcknowledgements, acknowledgePolicy,
  getComplianceTasks, createComplianceTask, updateTaskStatus, deleteComplianceTask,
  getAudits, createAudit, updateAudit, deleteAudit,
  getCorrectiveActions, createCorrectiveAction, updateCorrectiveAction,
  getStatutory, createStatutory, updateStatutory,
  getCertificates, createCertificate, deleteCertificate,
  getComplianceCalendar, getComplianceReports, getComplianceAuditLog,
} from "../api/complianceApi";

const KEY = ["compliance"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useComplianceDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getComplianceDashboard });

// Policies
export const usePolicies = (p) => useQuery({ queryKey: [...KEY, "policies", p], queryFn: () => getPolicies(p) });
export const usePolicy = (id) => useQuery({ queryKey: [...KEY, "policy", id], queryFn: () => getPolicy(id), enabled: !!id });
export const useCreatePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createPolicy, onSuccess: () => inv(qc) }); };
export const useUpdatePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updatePolicy(id, d), onSuccess: () => inv(qc) }); };
export const usePublishPolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishPolicy, onSuccess: () => inv(qc) }); };
export const useArchivePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: archivePolicy, onSuccess: () => inv(qc) }); };
export const useCreatePolicyVersion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => createPolicyVersion(id, d), onSuccess: () => inv(qc) }); };

// Acknowledgements
export const useAcknowledgements = (p) => useQuery({ queryKey: [...KEY, "acks", p], queryFn: () => getAcknowledgements(p) });
export const useAcknowledgePolicy = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => acknowledgePolicy(id, d), onSuccess: () => inv(qc) }); };

// Tasks
export const useComplianceTasks = () => useQuery({ queryKey: [...KEY, "tasks"], queryFn: getComplianceTasks });
export const useCreateComplianceTask = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createComplianceTask, onSuccess: () => inv(qc) }); };
export const useUpdateTaskStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateTaskStatus(id, status), onSuccess: () => inv(qc) }); };
export const useDeleteComplianceTask = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteComplianceTask, onSuccess: () => inv(qc) }); };

// Audits + corrective actions
export const useAudits = () => useQuery({ queryKey: [...KEY, "audits"], queryFn: getAudits });
export const useCreateAudit = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAudit, onSuccess: () => inv(qc) }); };
export const useUpdateAudit = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateAudit(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteAudit = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteAudit, onSuccess: () => inv(qc) }); };
export const useCorrectiveActions = () => useQuery({ queryKey: [...KEY, "actions"], queryFn: getCorrectiveActions });
export const useCreateCorrectiveAction = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createCorrectiveAction, onSuccess: () => inv(qc) }); };
export const useUpdateCorrectiveAction = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateCorrectiveAction(id, d), onSuccess: () => inv(qc) }); };

// Statutory
export const useStatutory = () => useQuery({ queryKey: [...KEY, "statutory"], queryFn: getStatutory });
export const useCreateStatutory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createStatutory, onSuccess: () => inv(qc) }); };
export const useUpdateStatutory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateStatutory(id, d), onSuccess: () => inv(qc) }); };

// Certificates
export const useCertificates = () => useQuery({ queryKey: [...KEY, "certificates"], queryFn: getCertificates });
export const useCreateCertificate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createCertificate, onSuccess: () => inv(qc) }); };
export const useDeleteCertificate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteCertificate, onSuccess: () => inv(qc) }); };

// Calendar / Reports / Audit log
export const useComplianceCalendar = () => useQuery({ queryKey: [...KEY, "calendar"], queryFn: getComplianceCalendar });
export const useComplianceReports = () => useQuery({ queryKey: [...KEY, "reports"], queryFn: getComplianceReports });
export const useComplianceAuditLog = () => useQuery({ queryKey: [...KEY, "auditlog"], queryFn: getComplianceAuditLog });
