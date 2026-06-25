import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getPerformance     = () => api.get("/performance").then(unwrap);
export const getPerfDashboard   = () => api.get("/performance/dashboard").then(unwrap);
export const getPerfAnalytics   = () => api.get("/performance/analytics").then(unwrap);
export const getPerfAudit       = () => api.get("/performance/audit").then(unwrap);

// Goals
export const createGoal = (data)   => api.post("/performance/goals", data).then(unwrap);
export const updateGoal = (id, d)  => api.put(`/performance/goals/${id}`, d).then(unwrap);
export const patchGoalProgress = (id, progress) => api.patch(`/performance/goals/${id}`, { progress }).then(unwrap);

// KPIs
export const getKpis    = ()       => api.get("/performance/kpis").then(unwrap);
export const createKpi  = (data)   => api.post("/performance/kpis", data).then(unwrap);
export const updateKpi  = (id, d)  => api.patch(`/performance/kpis/${id}`, d).then(unwrap);
export const deleteKpi  = (id)     => api.delete(`/performance/kpis/${id}`).then(unwrap);

// Reviews
export const getReviews   = (params) => api.get("/performance/reviews", { params }).then(unwrap);
export const createReview = (data)   => api.post("/performance/reviews", data).then(unwrap);
export const updateReview = (id, d)  => api.patch(`/performance/reviews/${id}`, d).then(unwrap);

// Appraisals
export const createAppraisal = (data) => api.post("/performance/appraisals", data).then(unwrap);
export const updateAppraisal = (id, d) => api.patch(`/performance/appraisals/${id}`, d).then(unwrap);
export const appraiseAppraisal = (id, d) => api.patch(`/performance/appraisals/${id}/appraise`, d).then(unwrap);

// PIP
export const getPips    = ()      => api.get("/performance/pips").then(unwrap);
export const createPip  = (data)  => api.post("/performance/pips", data).then(unwrap);
export const updatePip  = (id, d) => api.patch(`/performance/pips/${id}`, d).then(unwrap);

// Recognition
export const getRecognitions   = ()     => api.get("/performance/recognitions").then(unwrap);
export const createRecognition = (data) => api.post("/performance/recognitions", data).then(unwrap);
export const deleteRecognition = (id)   => api.delete(`/performance/recognitions/${id}`).then(unwrap);

export const exportPerformance = (format = "csv") =>
  api.get("/performance/export", { params: { format }, responseType: "blob" }).then((r) => r.data);
