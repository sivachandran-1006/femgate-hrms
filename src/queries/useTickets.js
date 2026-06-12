import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, raiseTicket, updateTicketStatus } from "../services/ticketService";

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
