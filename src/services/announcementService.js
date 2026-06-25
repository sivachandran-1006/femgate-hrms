import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getAnnouncements  = ()         => api.get("/announcements").then(unwrap);
export const getAnnouncement   = (id)       => api.get(`/announcements/${id}`).then(unwrap);
export const createAnnouncement = (payload) => api.post("/announcements", payload).then(unwrap);
export const updateAnnouncement = (id, payload) => api.put(`/announcements/${id}`, payload).then(unwrap);
export const publishAnnouncement = (id)    => api.patch(`/announcements/${id}/publish`).then(unwrap);
export const deleteAnnouncement  = (id)    => api.delete(`/announcements/${id}`).then(unwrap);
