import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunicationDashboard,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getEvents, createEvent, updateEvent, deleteEvent,
  getRecognitions, createRecognition,
  getSurveys, createSurvey, closeSurvey, createSurveyQuestion,
  getBirthdaysUpcoming, getAnniversariesUpcoming,
} from "../api/communicationApi";

const KEY = ["communications"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

// Dashboard
export const useCommunicationDashboard = () => useQuery({
  queryKey: [...KEY, "dashboard"],
  queryFn: getCommunicationDashboard,
});

// Announcements
export const useAnnouncements = (p) => useQuery({
  queryKey: [...KEY, "announcements", p],
  queryFn: () => getAnnouncements(p),
});

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => inv(qc),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => updateAnnouncement(id, d),
    onSuccess: () => inv(qc),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => inv(qc),
  });
};

// Events
export const useEvents = (p) => useQuery({
  queryKey: [...KEY, "events", p],
  queryFn: () => getEvents(p),
});

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => inv(qc),
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => updateEvent(id, d),
    onSuccess: () => inv(qc),
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => inv(qc),
  });
};

// Recognitions
export const useRecognitions = (p) => useQuery({
  queryKey: [...KEY, "recognitions", p],
  queryFn: () => getRecognitions(p),
});

export const useCreateRecognition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRecognition,
    onSuccess: () => inv(qc),
  });
};

// Surveys
export const useSurveys = (p) => useQuery({
  queryKey: [...KEY, "surveys", p],
  queryFn: () => getSurveys(p),
});

export const useCreateSurvey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSurvey,
    onSuccess: () => inv(qc),
  });
};

export const useCloseSurvey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: closeSurvey,
    onSuccess: () => inv(qc),
  });
};

export const useCreateSurveyQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ([id, d]) => createSurveyQuestion(id, d),
    onSuccess: () => inv(qc),
  });
};

// Milestones
export const useBirthdaysUpcoming = () => useQuery({
  queryKey: [...KEY, "birthdays"],
  queryFn: getBirthdaysUpcoming,
});

export const useAnniversariesUpcoming = () => useQuery({
  queryKey: [...KEY, "anniversaries"],
  queryFn: getAnniversariesUpcoming,
});
