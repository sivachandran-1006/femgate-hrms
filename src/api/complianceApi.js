import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// ── Dashboard ──
export const getComplianceDashboard = () => api.get("/compliance/dashboard").then(unwrap);

// ── Policies ──
export const getPolicies   = (p)    => api.get("/compliance/policies", { params: p }).then(unwrap);
export const getPolicy     = (id)   => api.get(`/compliance/policies/${id}`).then(unwrap);
export const createPolicy  = (d)    => api.post("/compliance/policies", d).then(unwrap);
export const updatePolicy  = (id, d) => api.put(`/compliance/policies/${id}`, d).then(unwrap);
export const publishPolicy = (id)   => api.patch(`/compliance/policies/${id}/publish`).then(unwrap);
export const archivePolicy = (id)   => api.delete(`/compliance/policies/${id}`).then(unwrap);
export const createPolicyVersion = (id, d) => api.post(`/compliance/policies/${id}/versions`, d).then(unwrap);

// ── Acknowledgements ──
export const getAcknowledgements = (p) => api.get("/compliance/acknowledgements", { params: p }).then(unwrap);
export const acknowledgePolicy   = (id, d) => api.post(`/compliance/policies/${id}/acknowledge`, d).then(unwrap);

// ── Tasks ──
export const getComplianceTasks = ()      => api.get("/compliance/tasks").then(unwrap);
export const createComplianceTask = (d)   => api.post("/compliance/tasks", d).then(unwrap);
export const updateTaskStatus   = (id, status) => api.patch(`/compliance/tasks/${id}/status`, { status }).then(unwrap);
export const deleteComplianceTask = (id)  => api.delete(`/compliance/tasks/${id}`).then(unwrap);

// ── Audits + Corrective Actions ──
export const getAudits      = ()      => api.get("/compliance/audits").then(unwrap);
export const createAudit    = (d)     => api.post("/compliance/audits", d).then(unwrap);
export const updateAudit    = (id, d) => api.patch(`/compliance/audits/${id}`, d).then(unwrap);
export const deleteAudit    = (id)    => api.delete(`/compliance/audits/${id}`).then(unwrap);
export const getCorrectiveActions = () => api.get("/compliance/corrective-actions").then(unwrap);
export const createCorrectiveAction = (d) => api.post("/compliance/corrective-actions", d).then(unwrap);
export const updateCorrectiveAction = (id, d) => api.patch(`/compliance/corrective-actions/${id}`, d).then(unwrap);

// ── Statutory ──
export const getStatutory   = ()      => api.get("/compliance/statutory").then(unwrap);
export const createStatutory = (d)    => api.post("/compliance/statutory", d).then(unwrap);
export const updateStatutory = (id, d) => api.patch(`/compliance/statutory/${id}`, d).then(unwrap);

// ── Certificates ──
export const getCertificates   = ()    => api.get("/compliance/certificates").then(unwrap);
export const createCertificate = (d)   => api.post("/compliance/certificates", d).then(unwrap);
export const deleteCertificate = (id)  => api.delete(`/compliance/certificates/${id}`).then(unwrap);

// ── Calendar / Reports / Audit log ──
export const getComplianceCalendar = () => api.get("/compliance/calendar").then(unwrap);
export const getComplianceReports  = () => api.get("/compliance/reports").then(unwrap);
export const getComplianceAuditLog = () => api.get("/compliance/audit-log").then(unwrap);
