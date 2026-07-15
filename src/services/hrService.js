import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Recruitment
export const getJobs                = ()            => api.get("/recruitment/jobs").then(unwrap);
export const createJob              = (payload)     => api.post("/recruitment/jobs", payload).then(unwrap);
export const updateJobStatus        = (id, status)  => api.patch(`/recruitment/jobs/${id}/status`, { status }).then(unwrap);
export const getCandidates          = ()            => api.get("/recruitment/candidates").then(unwrap);
export const createCandidate        = (payload)     => api.post("/recruitment/candidates", payload).then(unwrap);
export const updateCandidateStatus  = (id, status)  => api.patch(`/recruitment/candidates/${id}/status`, { status }).then(unwrap);

// Offer Management
export const getOffers        = (status)            => api.get("/offers", { params: status && status !== "All" ? { status } : {} }).then(unwrap);
export const createOffer      = (payload)           => api.post("/offers", payload).then(unwrap);
export const updateOffer      = (id, payload)       => api.patch(`/offers/${id}`, payload).then(unwrap);
export const approveOffer     = (id)                => api.post(`/offers/${id}/approve`).then(unwrap);
export const releaseOffer     = (id)                => api.post(`/offers/${id}/release`).then(unwrap);
export const acceptOffer      = (id)                => api.post(`/offers/${id}/accept`).then(unwrap);
export const declineOffer     = (id, reason)        => api.post(`/offers/${id}/decline`, { reason }).then(unwrap);
export const negotiateOffer   = (id, payload)       => api.post(`/offers/${id}/negotiate`, payload).then(unwrap);
export const withdrawOffer    = (id)                => api.post(`/offers/${id}/withdraw`).then(unwrap);
export const deleteOffer      = (id)                => api.delete(`/offers/${id}`).then(unwrap);

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
