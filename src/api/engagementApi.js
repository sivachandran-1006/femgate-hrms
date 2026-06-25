import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// ── Dashboard ──
export const getEngagementDashboard = () => api.get("/engagement/dashboard").then(unwrap);

// ── Awards / Recognition ──
export const getAwards   = (p)      => api.get("/engagement/awards", { params: p }).then(unwrap);
export const createAward = (d)      => api.post("/engagement/awards", d).then(unwrap);
export const deleteAward = (id)     => api.delete(`/engagement/awards/${id}`).then(unwrap);

// ── Kudos ──
export const getKudos       = ()        => api.get("/engagement/kudos").then(unwrap);
export const sendKudos      = (d)       => api.post("/engagement/kudos", d).then(unwrap);
export const reactKudos     = (id)      => api.patch(`/engagement/kudos/${id}/react`).then(unwrap);
export const commentKudos   = (id, d)   => api.post(`/engagement/kudos/${id}/comments`, d).then(unwrap);

// ── Points ──
export const getPointsBalance = (employee) => api.get("/engagement/points/balance", { params: employee ? { employee } : {} }).then(unwrap);
export const awardPoints      = (d)         => api.post("/engagement/points/award", d).then(unwrap);
export const getLeaderboard   = ()          => api.get("/engagement/points/leaderboard").then(unwrap);

// ── Rewards + Redemption ──
export const getRewards     = ()        => api.get("/engagement/rewards").then(unwrap);
export const createReward   = (d)       => api.post("/engagement/rewards", d).then(unwrap);
export const updateReward   = (id, d)   => api.put(`/engagement/rewards/${id}`, d).then(unwrap);
export const deleteReward   = (id)      => api.delete(`/engagement/rewards/${id}`).then(unwrap);
export const redeemReward   = (id)      => api.post(`/engagement/rewards/${id}/redeem`).then(unwrap);
export const getRedemptions = ()        => api.get("/engagement/redemptions").then(unwrap);
export const updateRedemptionStatus = (id, status) => api.patch(`/engagement/redemptions/${id}/status`, { status }).then(unwrap);

// ── Surveys ──
export const getSurveys         = ()        => api.get("/engagement/surveys").then(unwrap);
export const getSurveyDashboard = ()        => api.get("/engagement/surveys/dashboard").then(unwrap);
export const createSurvey       = (d)       => api.post("/engagement/surveys", d).then(unwrap);
export const publishSurvey      = (id)      => api.patch(`/engagement/surveys/${id}/publish`).then(unwrap);
export const respondSurvey      = (id, d)   => api.post(`/engagement/surveys/${id}/respond`, d).then(unwrap);
export const deleteSurvey       = (id)      => api.delete(`/engagement/surveys/${id}`).then(unwrap);

// ── Suggestions ──
export const getSuggestions       = ()        => api.get("/engagement/suggestions").then(unwrap);
export const createSuggestion     = (d)       => api.post("/engagement/suggestions", d).then(unwrap);
export const updateSuggestionStatus = (id, d) => api.patch(`/engagement/suggestions/${id}/status`, d).then(unwrap);

// ── Wellness ──
export const getWellness     = ()      => api.get("/engagement/wellness").then(unwrap);
export const createWellness  = (d)     => api.post("/engagement/wellness", d).then(unwrap);
export const joinWellness    = (id)    => api.post(`/engagement/wellness/${id}/join`).then(unwrap);

// ── Events ──
export const getEvents   = ()      => api.get("/engagement/events").then(unwrap);
export const createEvent = (d)     => api.post("/engagement/events", d).then(unwrap);
export const deleteEvent = (id)    => api.delete(`/engagement/events/${id}`).then(unwrap);

// ── Wall / Milestones / Reports / Audit ──
export const getWall        = ()      => api.get("/engagement/wall").then(unwrap);
export const getMilestones  = ()      => api.get("/engagement/milestones").then(unwrap);
export const createMilestone = (d)    => api.post("/engagement/milestones", d).then(unwrap);
export const getEngagementReports = () => api.get("/engagement/reports").then(unwrap);
export const getEngagementAudit   = () => api.get("/engagement/audit").then(unwrap);
