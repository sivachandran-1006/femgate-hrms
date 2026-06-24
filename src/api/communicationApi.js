import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// Dashboard
export const getCommunicationDashboard = () => api.get("/communications/dashboard").then(unwrap);

// Announcements
export const getAnnouncements        = (p) => api.get("/communications/announcements", { params: p }).then(unwrap);
export const createAnnouncement      = (d) => api.post("/communications/announcements", d).then(unwrap);
export const updateAnnouncement      = (id, d) => api.put(`/communications/announcements/${id}`, d).then(unwrap);
export const deleteAnnouncement      = (id) => api.delete(`/communications/announcements/${id}`).then(unwrap);

// Events
export const getEvents              = (p) => api.get("/communications/events", { params: p }).then(unwrap);
export const createEvent            = (d) => api.post("/communications/events", d).then(unwrap);
export const updateEvent            = (id, d) => api.put(`/communications/events/${id}`, d).then(unwrap);
export const deleteEvent            = (id) => api.delete(`/communications/events/${id}`).then(unwrap);

// Recognitions
export const getRecognitions        = (p) => api.get("/communications/recognitions", { params: p }).then(unwrap);
export const createRecognition      = (d) => api.post("/communications/recognitions", d).then(unwrap);

// Surveys
export const getSurveys             = (p) => api.get("/communications/surveys", { params: p }).then(unwrap);
export const createSurvey           = (d) => api.post("/communications/surveys", d).then(unwrap);
export const closeSurvey            = (id) => api.patch(`/communications/surveys/${id}/close`).then(unwrap);
export const createSurveyQuestion   = (id, d) => api.post(`/communications/surveys/${id}/questions`, d).then(unwrap);

// Milestones
export const getBirthdaysUpcoming   = () => api.get("/communications/milestones/birthdays").then(unwrap);
export const getAnniversariesUpcoming = () => api.get("/communications/milestones/anniversaries").then(unwrap);

// Export
export const exportAnnouncementsCSV  = () => api.get("/communications/export/announcements-csv", { responseType: "blob" }).then((r) => r.data);
