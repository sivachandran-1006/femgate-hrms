import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLmsDashboard, getLmsAnalytics,
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getAssessments, createAssessment, updateAssessment, deleteAssessment,
  getLmsAudit,
} from "../api/lmsApi";

const KEY = ["lms"];
const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useLmsDashboard  = () => useQuery({ queryKey: [...KEY, "dashboard"],  queryFn: getLmsDashboard });
export const useLmsAnalytics  = () => useQuery({ queryKey: [...KEY, "analytics"],  queryFn: getLmsAnalytics });
export const useCourses       = (p) => useQuery({ queryKey: [...KEY, "courses", p], queryFn: () => getCourses(p) });
export const useCourse        = (id) => useQuery({ queryKey: [...KEY, "course", id], queryFn: () => getCourse(id), enabled: !!id });
export const useEnrollments   = (p) => useQuery({ queryKey: [...KEY, "enrollments", p], queryFn: () => getEnrollments(p) });
export const useCertificates  = (p) => useQuery({ queryKey: [...KEY, "certificates", p], queryFn: () => getCertificates(p) });
export const useAssessments   = (p) => useQuery({ queryKey: [...KEY, "assessments", p], queryFn: () => getAssessments(p) });
export const useLmsAudit      = () => useQuery({ queryKey: [...KEY, "audit"],       queryFn: getLmsAudit });

export const useCreateCourse  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createCourse,             onSuccess: () => inv(qc) }); };
export const useUpdateCourse  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateCourse(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteCourse  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteCourse(id), onSuccess: () => inv(qc) }); };

export const useCreateEnrollment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createEnrollment, onSuccess: () => inv(qc) }); };
export const useUpdateEnrollment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateEnrollment(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteEnrollment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteEnrollment(id), onSuccess: () => inv(qc) }); };

export const useCreateCertificate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createCertificate, onSuccess: () => inv(qc) }); };
export const useUpdateCertificate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateCertificate(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteCertificate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteCertificate(id), onSuccess: () => inv(qc) }); };

export const useCreateAssessment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createAssessment, onSuccess: () => inv(qc) }); };
export const useUpdateAssessment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateAssessment(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteAssessment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteAssessment(id), onSuccess: () => inv(qc) }); };
