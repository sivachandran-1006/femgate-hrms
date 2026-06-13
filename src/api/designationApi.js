import api from "./axios";

export const fetchDesignations   = ()         => api.get("/designations");
export const createDesignation   = (data)     => api.post("/designations", data);
export const updateDesignation   = (id, data) => api.put(`/designations/${id}`, data);
export const deleteDesignation   = (id)       => api.delete(`/designations/${id}`);
