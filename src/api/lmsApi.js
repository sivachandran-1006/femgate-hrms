import api from "./axios";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export const getLmsDashboard  = () => api.get("/lms/dashboard").then(unwrap);
export const getLmsAnalytics  = () => api.get("/lms/analytics").then(unwrap);

// Courses
export const getCourses    = (params) => api.get("/lms/courses", { params }).then(unwrap);
export const getCourse     = (id)     => api.get(`/lms/courses/${id}`).then(unwrap);
export const createCourse  = (data)   => api.post("/lms/courses", data).then(unwrap);
export const updateCourse  = (id, d)  => api.put(`/lms/courses/${id}`, d).then(unwrap);
export const deleteCourse  = (id)     => api.delete(`/lms/courses/${id}`).then(unwrap);

// Enrollments
export const getEnrollments   = (params) => api.get("/lms/enrollments", { params }).then(unwrap);
export const createEnrollment = (data)   => api.post("/lms/enrollments", data).then(unwrap);
export const updateEnrollment = (id, d)  => api.patch(`/lms/enrollments/${id}`, d).then(unwrap);
export const deleteEnrollment = (id)     => api.delete(`/lms/enrollments/${id}`).then(unwrap);

// Certificates
export const getCertificates   = (params) => api.get("/lms/certificates", { params }).then(unwrap);
export const createCertificate = (data)   => api.post("/lms/certificates", data).then(unwrap);
export const updateCertificate = (id, d)  => api.patch(`/lms/certificates/${id}`, d).then(unwrap);
export const deleteCertificate = (id)     => api.delete(`/lms/certificates/${id}`).then(unwrap);

// Assessments
export const getAssessments   = (params) => api.get("/lms/assessments", { params }).then(unwrap);
export const createAssessment = (data)   => api.post("/lms/assessments", data).then(unwrap);
export const updateAssessment = (id, d)  => api.patch(`/lms/assessments/${id}`, d).then(unwrap);
export const deleteAssessment = (id)     => api.delete(`/lms/assessments/${id}`).then(unwrap);

// Audit
export const getLmsAudit = () => api.get("/lms/audit").then(unwrap);

// Export
export const exportLms = (type = "courses", format = "csv") =>
  api.get("/lms/export", { params: { type, format }, responseType: format === "csv" ? "blob" : "json" }).then((r) => r.data);
