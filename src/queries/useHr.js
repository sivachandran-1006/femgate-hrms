import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as hr from "../services/hrService";

const inv = (qc, key) => () => qc.invalidateQueries({ queryKey: key });

// ── Recruitment ──
export const useJobs       = () => useQuery({ queryKey: ["jobs"],       queryFn: hr.getJobs });
export const useCandidates = () => useQuery({ queryKey: ["candidates"], queryFn: hr.getCandidates });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.createJob, onSuccess: inv(qc, ["jobs"]) });
};
export const useUpdateJobStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => hr.updateJobStatus(id, status), onSuccess: inv(qc, ["jobs"]) });
};
export const useCreateCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hr.createCandidate,
    onSuccess: () => { inv(qc, ["candidates"])(); inv(qc, ["jobs"])(); },
  });
};
export const useUpdateCandidateStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => hr.updateCandidateStatus(id, status), onSuccess: inv(qc, ["candidates"]) });
};

// ── Shifts ──
export const useShifts = (weekStart) =>
  useQuery({ queryKey: ["shifts", weekStart || "current"], queryFn: () => hr.getShifts(weekStart) });

export const useSetShift = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.setShift, onSuccess: () => qc.invalidateQueries({ queryKey: ["shifts"] }) });
};

// ── Performance ──
export const usePerformance = () => useQuery({ queryKey: ["performance"], queryFn: hr.getPerformance });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.createGoal, onSuccess: inv(qc, ["performance"]) });
};
export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...p }) => hr.updateGoal(id, p), onSuccess: inv(qc, ["performance"]) });
};
export const useCreateAppraisal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.createAppraisal, onSuccess: inv(qc, ["performance"]) });
};
export const useUpdateAppraisal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...p }) => hr.updateAppraisal(id, p), onSuccess: inv(qc, ["performance"]) });
};

// ── Exits ──
export const useExits = () => useQuery({ queryKey: ["exits"], queryFn: hr.getExits });

export const useCreateExit = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.createExit, onSuccess: inv(qc, ["exits"]) });
};
export const useUpdateExit = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...p }) => hr.updateExit(id, p), onSuccess: inv(qc, ["exits"]) });
};

// ── Documents (admin) ──
export const useAllDocuments = () => useQuery({ queryKey: ["documents", "all"], queryFn: hr.getAllDocuments });

// ── Assets ──
export const useAssets = () => useQuery({ queryKey: ["assets"], queryFn: hr.getAssets });

export const useCreateAsset = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hr.createAsset, onSuccess: inv(qc, ["assets"]) });
};
