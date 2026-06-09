import api from "./axios";

// GET /notifications?category=&unreadOnly=&search=
export const getNotifications = (params) => api.get("/notifications", { params }).then(r => r.data);

// PATCH /notifications/:id/read
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data);

// PATCH /notifications/read-all
export const markAllNotificationsRead = () => api.patch("/notifications/read-all").then(r => r.data);

// DELETE /notifications/:id
export const deleteNotification = (id) => api.delete(`/notifications/${id}`).then(r => r.data);

// DELETE /notifications/clear-read
export const clearReadNotifications = () => api.delete("/notifications/clear-read").then(r => r.data);

// GET /notifications/unread-count
export const getUnreadCount = () => api.get("/notifications/unread-count").then(r => r.data);
