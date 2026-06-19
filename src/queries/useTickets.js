import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, raiseTicket, updateTicketStatus } from "../services/ticketService";
import {
  getTickets as apiGetTickets, getTicket, createTicket, setTicketStatus, assignTicket,
  getTicketDashboard, getTicketAnalytics, getTicketComments, addTicketComment, getTicketAudit,
  getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge,
} from "../api/ticketApi";

const KEY = ["tickets"];

export const useTickets = () =>
  useQuery({ queryKey: KEY, queryFn: getTickets });

export const useRaiseTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: raiseTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateTicketStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateTicketStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

// ── Full helpdesk hooks ──
export const useTicketList   = (params) => useQuery({ queryKey: [...KEY, "list", params], queryFn: () => apiGetTickets(params) });
export const useTicket       = (id)     => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getTicket(id), enabled: !!id });
export const useTicketDashboard = () => useQuery({ queryKey: [...KEY, "dashboard"], queryFn: getTicketDashboard });
export const useTicketAnalytics = () => useQuery({ queryKey: [...KEY, "analytics"], queryFn: getTicketAnalytics });
export const useTicketComments = (id) => useQuery({ queryKey: [...KEY, id, "comments"], queryFn: () => getTicketComments(id), enabled: !!id });
export const useTicketAudit    = (id) => useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getTicketAudit(id), enabled: !!id });
export const useKnowledge    = (params) => useQuery({ queryKey: [...KEY, "kb", params], queryFn: () => getKnowledge(params) });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });
export const useCreateTicket = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createTicket, onSuccess: () => inv(qc) }); };
export const useSetTicketStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }) => setTicketStatus(id, status), onSuccess: () => inv(qc) }); };
export const useAssignTicket = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => assignTicket(id, d), onSuccess: () => inv(qc) }); };
export const useAddComment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => addTicketComment(id, d), onSuccess: () => inv(qc) }); };
export const useCreateKnowledge = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createKnowledge, onSuccess: () => inv(qc) }); };
export const useUpdateKnowledge = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateKnowledge(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteKnowledge = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteKnowledge(id), onSuccess: () => inv(qc) }); };
