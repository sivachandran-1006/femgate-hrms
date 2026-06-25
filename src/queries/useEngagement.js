import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEngagementDashboard,
  getAwards, createAward, deleteAward,
  getKudos, sendKudos, reactKudos, commentKudos,
  getPointsBalance, awardPoints, getLeaderboard,
  getRewards, createReward, updateReward, deleteReward, redeemReward, getRedemptions, updateRedemptionStatus,
  getSurveys, getSurveyDashboard, createSurvey, publishSurvey, respondSurvey, deleteSurvey,
  getSuggestions, createSuggestion, updateSuggestionStatus,
  getWellness, createWellness, joinWellness,
  getEvents, createEvent, deleteEvent,
  getWall, getMilestones, createMilestone, getEngagementReports, getEngagementAudit,
} from "../api/engagementApi";

const KEY = ["engagement"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

// ── Dashboard ──
export const useEngagementDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getEngagementDashboard });

// ── Awards ──
export const useAwards = (p) => useQuery({ queryKey: [...KEY, "awards", p], queryFn: () => getAwards(p) });
export const useCreateAward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAward, onSuccess: () => inv(qc) }); };
export const useDeleteAward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteAward, onSuccess: () => inv(qc) }); };

// ── Kudos ──
export const useKudos = () => useQuery({ queryKey: [...KEY, "kudos"], queryFn: getKudos });
export const useSendKudos = () => { const qc = useQueryClient(); return useMutation({ mutationFn: sendKudos, onSuccess: () => inv(qc) }); };
export const useReactKudos = () => { const qc = useQueryClient(); return useMutation({ mutationFn: reactKudos, onSuccess: () => inv(qc) }); };
export const useCommentKudos = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => commentKudos(id, d), onSuccess: () => inv(qc) }); };

// ── Points ──
export const usePointsBalance = (employee) => useQuery({ queryKey: [...KEY, "points", employee || "me"], queryFn: () => getPointsBalance(employee) });
export const useAwardPoints = () => { const qc = useQueryClient(); return useMutation({ mutationFn: awardPoints, onSuccess: () => inv(qc) }); };
export const useLeaderboard = () => useQuery({ queryKey: [...KEY, "leaderboard"], queryFn: getLeaderboard });

// ── Rewards ──
export const useRewards = () => useQuery({ queryKey: [...KEY, "rewards"], queryFn: getRewards });
export const useCreateReward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createReward, onSuccess: () => inv(qc) }); };
export const useUpdateReward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateReward(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteReward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteReward, onSuccess: () => inv(qc) }); };
export const useRedeemReward = () => { const qc = useQueryClient(); return useMutation({ mutationFn: redeemReward, onSuccess: () => inv(qc) }); };
export const useRedemptions = () => useQuery({ queryKey: [...KEY, "redemptions"], queryFn: getRedemptions });
export const useUpdateRedemptionStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => updateRedemptionStatus(id, status), onSuccess: () => inv(qc) }); };

// ── Surveys ──
export const useSurveys = () => useQuery({ queryKey: [...KEY, "surveys"], queryFn: getSurveys });
export const useSurveyDashboard = () => useQuery({ queryKey: [...KEY, "surveys", "dashboard"], queryFn: getSurveyDashboard });
export const useCreateSurvey = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSurvey, onSuccess: () => inv(qc) }); };
export const usePublishSurvey = () => { const qc = useQueryClient(); return useMutation({ mutationFn: publishSurvey, onSuccess: () => inv(qc) }); };
export const useRespondSurvey = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => respondSurvey(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteSurvey = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteSurvey, onSuccess: () => inv(qc) }); };

// ── Suggestions ──
export const useSuggestions = () => useQuery({ queryKey: [...KEY, "suggestions"], queryFn: getSuggestions });
export const useCreateSuggestion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createSuggestion, onSuccess: () => inv(qc) }); };
export const useUpdateSuggestionStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateSuggestionStatus(id, d), onSuccess: () => inv(qc) }); };

// ── Wellness ──
export const useWellness = () => useQuery({ queryKey: [...KEY, "wellness"], queryFn: getWellness });
export const useCreateWellness = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createWellness, onSuccess: () => inv(qc) }); };
export const useJoinWellness = () => { const qc = useQueryClient(); return useMutation({ mutationFn: joinWellness, onSuccess: () => inv(qc) }); };

// ── Events ──
export const useEvents = () => useQuery({ queryKey: [...KEY, "events"], queryFn: getEvents });
export const useCreateEvent = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createEvent, onSuccess: () => inv(qc) }); };
export const useDeleteEvent = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteEvent, onSuccess: () => inv(qc) }); };

// ── Wall / Milestones / Reports / Audit ──
export const useWall = () => useQuery({ queryKey: [...KEY, "wall"], queryFn: getWall });
export const useMilestones = () => useQuery({ queryKey: [...KEY, "milestones"], queryFn: getMilestones });
export const useCreateMilestone = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createMilestone, onSuccess: () => inv(qc) }); };
export const useEngagementReports = () => useQuery({ queryKey: [...KEY, "reports"], queryFn: getEngagementReports });
export const useEngagementAudit = () => useQuery({ queryKey: [...KEY, "audit"], queryFn: getEngagementAudit });
