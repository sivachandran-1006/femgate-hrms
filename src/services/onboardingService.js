import api from "../api/axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getOnboarding     = ()              => api.get("/onboarding").then(unwrap);
export const createJoiner      = (payload)       => api.post("/onboarding", payload).then(unwrap);
export const toggleTask        = (id, key, done) => api.patch(`/onboarding/${id}/task`, { key, done }).then(unwrap);
export const startOnboarding   = (id)            => api.patch(`/onboarding/${id}/start`).then(unwrap);
export const deleteOnboarding  = (id)            => api.delete(`/onboarding/${id}`).then(unwrap);
