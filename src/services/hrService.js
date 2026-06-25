import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Recruitment
export const getJobs                = ()            => api.get("/recruitment/jobs").then(unwrap);
export const createJob              = (payload)     => api.post("/recruitment/jobs", payload).then(unwrap);
export const updateJobStatus        = (id, status)  => api.patch(`/recruitment/jobs/${id}/status`, { status }).then(unwrap);
export const getCandidates          = ()            => api.get("/recruitment/candidates").then(unwrap);
export const createCandidate        = (payload)     => api.post("/recruitment/candidates", payload).then(unwrap);
export const updateCandidateStatus  = (id, status)  => api.patch(`/recruitment/candidates/${id}/status`, { status }).then(unwrap);

// Shifts
export const getShifts  = (weekStart)               => api.get("/shifts", { params: weekStart ? { weekStart } : {} }).then(unwrap);
export const setShift   = (payload)                 => api.put("/shifts", payload).then(unwrap);

// Performance
export const getPerformance    = ()                 => api.get("/performance").then(unwrap);
export const createGoal        = (payload)          => api.post("/performance/goals", payload).then(unwrap);
export const updateGoal        = (id, payload)      => api.patch(`/performance/goals/${id}`, payload).then(unwrap);
export const createAppraisal   = (payload)          => api.post("/performance/appraisals", payload).then(unwrap);
export const updateAppraisal   = (id, payload)      => api.patch(`/performance/appraisals/${id}`, payload).then(unwrap);

// Exits
export const getExits    = ()                       => api.get("/exits").then(unwrap);
export const createExit  = (payload)                => api.post("/exits", payload).then(unwrap);
export const updateExit  = (id, payload)            => api.patch(`/exits/${id}`, payload).then(unwrap);

// Documents (company-wide, admin view)
export const getAllDocuments = ()                   => api.get("/documents").then(unwrap);

// Assets
export const getAssets   = ()                       => api.get("/assets").then(unwrap);
export const createAsset = (payload)                => api.post("/assets", payload).then(unwrap);
