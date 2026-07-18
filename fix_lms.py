import re

file_path = "src/screens/lms/LmsManagement.jsx"
with open(file_path, "r") as f:
    content = f.read()

# EnrollmentsTab
content = content.replace("""  const params = { employeeName: search || undefined, status: filterStatus || undefined };
  const { data: rawEnrollments, isLoading } = useEnrollments(params);
  const enrollments = rawEnrollments?.length ? rawEnrollments : MOCK_ENROLLMENTS;
  const { data: rawCourses } = useCourses({});
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = useCreateEnrollment();
  const update = useUpdateEnrollment();
  const remove = useDeleteEnrollment();""", """  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS);
  const courses = MOCK_COURSES;
  const isLoading = false;
  const isPending = false;""")

content = content.replace("""  const save = async () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId), progress: Number(form.progress || 0) };
      if (editItem) { await update.mutateAsync({ id: editItem.id, ...payload }); show("Enrollment updated", "success"); }
      else { await create.mutateAsync(payload); show("Enrolled successfully", "success"); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""", """  const save = () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId), progress: Number(form.progress || 0) };
      if (editItem) {
        setEnrollments(prev => prev.map(e => e.id === editItem.id ? { ...e, ...payload } : e));
        show("Enrollment updated", "success");
      } else {
        setEnrollments(prev => [...prev, { id: Date.now(), ...payload }]);
        show("Enrolled successfully", "success");
      }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""")

content = content.replace("""  const del = async (id) => {
    if (!id) return;
    try { await remove.mutateAsync(id); show("Enrollment removed", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
  };""", """  const del = (id) => {
    if (!id) return;
    try {
      setEnrollments(prev => prev.filter(e => e.id !== id));
      show("Enrollment removed", "success");
      setDelId(null);
    } catch (e) { show(e.message, "error"); setDelId(null); }
  };""")

content = content.replace("loading={create.isPending || update.isPending}", "loading={isPending}")
content = content.replace("loading={remove.isPending}", "loading={isPending}")

# CertificatesTab
content = content.replace("""  const { data: rawCerts, isLoading } = useCertificates({ employeeName: search || undefined });
  const certs = rawCerts?.length ? rawCerts : MOCK_CERTIFICATES;
  const { data: rawCourses } = useCourses({});
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = useCreateCertificate();
  const remove = useDeleteCertificate();""", """  const [certs, setCerts] = useState(MOCK_CERTIFICATES);
  const courses = MOCK_COURSES;
  const isLoading = false;
  const isPending = false;""")

content = content.replace("""  const save = async () => {
    try {
      await create.mutateAsync({ ...form, courseId: Number(form.courseId), score: form.score ? Number(form.score) : undefined });
      show("Certificate issued", "success");
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""", """  const save = () => {
    try {
      setCerts(prev => [...prev, { id: Date.now(), ...form, courseId: Number(form.courseId), score: form.score ? Number(form.score) : undefined }]);
      show("Certificate issued", "success");
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""")

content = content.replace("""  const del = async (id) => {
    if (!id) return;
    try { await remove.mutateAsync(id); show("Certificate revoked", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
  };""", """  const del = (id) => {
    if (!id) return;
    try {
      setCerts(prev => prev.filter(c => c.id !== id));
      show("Certificate revoked", "success");
      setDelId(null);
    } catch (e) { show(e.message, "error"); setDelId(null); }
  };""")

content = content.replace("loading={create.isPending}", "loading={isPending}")
content = content.replace("loading={remove?.isPending}", "loading={isPending}")

# AssessmentsTab
content = content.replace("""  const { data: rawAssessments, isLoading } = useAssessments({});
  const assessments = rawAssessments?.length ? rawAssessments : MOCK_ASSESSMENTS;
  const { data: rawCourses } = useCourses({});
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = useCreateAssessment();
  const update = useUpdateAssessment();
  const remove = useDeleteAssessment();""", """  const [assessments, setAssessments] = useState(MOCK_ASSESSMENTS);
  const courses = MOCK_COURSES;
  const isLoading = false;
  const isPending = false;""")

content = content.replace("""  const save = async () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId) };
      if (editItem) { await update.mutateAsync({ id: editItem.id, ...payload }); show("Assessment updated", "success"); }
      else { await create.mutateAsync(payload); show("Assessment created", "success"); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""", """  const save = () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId) };
      if (editItem) {
        setAssessments(prev => prev.map(a => a.id === editItem.id ? { ...a, ...payload } : a));
        show("Assessment updated", "success");
      } else {
        setAssessments(prev => [...prev, { id: Date.now(), ...payload }]);
        show("Assessment created", "success");
      }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };""")

content = content.replace("""  const del = async (id) => {
    if (!id) return;
    try { await remove.mutateAsync(id); show("Deleted", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
  };""", """  const del = (id) => {
    if (!id) return;
    try {
      setAssessments(prev => prev.filter(a => a.id !== id));
      show("Deleted", "success");
      setDelId(null);
    } catch (e) { show(e.message, "error"); setDelId(null); }
  };""")

# AnalyticsTab
content = content.replace("""  const { data: rawAnalytics, isLoading } = useLmsAnalytics();
  const analytics = rawAnalytics ?? MOCK_ANALYTICS;""", """  const analytics = MOCK_ANALYTICS;
  const isLoading = false;""")

# AuditTab
content = content.replace("""  const { data: logs = [], isLoading } = useLmsAudit();""", """  const logs = [];
  const isLoading = false;""")

with open(file_path, "w") as f:
    f.write(content)

