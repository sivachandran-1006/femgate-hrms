import api from "./axios";

// GET /superadmin/company/settings
export const getCompanySettings = () => api.get("/superadmin/company/settings").then(r => r.data);

// PUT /superadmin/company/settings  — update company profile + branding text + regional settings
export const updateCompanySettings = (data) => api.put("/superadmin/company/settings", data).then(r => r.data);

// POST /superadmin/company/logo  — multipart/form-data, field: file
export const uploadCompanyLogo = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/superadmin/company/logo", form, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
};

// POST /superadmin/company/favicon  — multipart/form-data, field: file
export const uploadCompanyFavicon = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/superadmin/company/favicon", form, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
};

// GET /superadmin/company/email-templates
export const getEmailTemplates = () => api.get("/superadmin/company/email-templates").then(r => r.data);

// PUT /superadmin/company/email-templates/:id
export const updateEmailTemplate = (id, data) => api.put(`/superadmin/company/email-templates/${id}`, data).then(r => r.data);

// GET /superadmin/company/notification-settings
export const getNotificationSettings = () => api.get("/superadmin/company/notification-settings").then(r => r.data);

// PUT /superadmin/company/notification-settings
export const updateNotificationSettings = (data) => api.put("/superadmin/company/notification-settings", data).then(r => r.data);
