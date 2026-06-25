import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  Progress, RingProgress, NumberInput, Switch, Loader, Center,
} from "@mantine/core";
import {
  IconBook, IconCertificate, IconUsers, IconChartBar,
  IconPlus, IconPencil, IconTrash, IconDownload, IconSearch,
  IconSchool, IconClipboardList, IconAward, IconRefresh,
  IconCheck, IconX, IconEye, IconPlayerPlay, IconClock,
} from "@tabler/icons-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useLmsDashboard, useLmsAnalytics, useCourses, useEnrollments, useCertificates, useAssessments, useLmsAudit,
  useCreateCourse, useUpdateCourse, useDeleteCourse,
  useCreateEnrollment, useUpdateEnrollment, useDeleteEnrollment,
  useCreateCertificate, useDeleteCertificate,
  useCreateAssessment, useUpdateAssessment, useDeleteAssessment } from "../../queries/useLms";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { exportLms } from "../../api/lmsApi";

const COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2", "#fd7014", "#15aabf"];
const CATEGORY_OPTIONS = ["Technical", "Soft Skills", "Compliance", "Leadership", "Other"];
const LEVEL_OPTIONS    = ["Beginner", "Intermediate", "Advanced"];
const FORMAT_OPTIONS   = ["Online", "Classroom", "Blended", "Self-Paced"];
const STATUS_OPTIONS   = ["Active", "Inactive", "Draft", "Archived"];
const ENROLL_STATUS    = ["Enrolled", "In Progress", "Completed", "Failed", "Dropped"];
const CERT_STATUS      = ["Active", "Expired", "Revoked"];
const ASSESSMENT_TYPES = ["Quiz", "Assignment", "Practical", "MCQ"];

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: dash, isLoading } = useLmsDashboard();

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <KpiCard label="Active Courses"      value={dash.totalCourses}      icon={IconBook}          color="blue"   sub="in catalog" />
        <KpiCard label="Total Enrollments"   value={dash.totalEnrollments}  icon={IconUsers}         color="teal"   sub={`${dash.inProgress} in progress`} />
        <KpiCard label="Completion Rate"     value={`${dash.completionRate}%`} icon={IconCheck}       color="green"  sub={`${dash.completions} completed`} />
        <KpiCard label="Certificates Issued" value={dash.certs}             icon={IconCertificate}   color="violet" sub={`${dash.overdue} overdue`} />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="md">Monthly Completions</Text>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dash.monthlyCompletions || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="count" fill="#228be6" radius={[4, 4, 0, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="md">By Category</Text>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dash.categories || []} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {(dash.categories || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="md">Top Courses by Enrollment</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Enrollments</Table.Th>
              <Table.Th>Progress</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(dash.topCourses || []).map((c, i) => (
              <Table.Tr key={c.courseId}>
                <Table.Td>{i + 1}</Table.Td>
                <Table.Td><Text fw={500} size="sm">{c.title}</Text></Table.Td>
                <Table.Td><Badge variant="light">{c.enrollments}</Badge></Table.Td>
                <Table.Td>
                  <Progress value={Math.min((c.enrollments / (dash.totalEnrollments || 1)) * 100, 100)} size="sm" />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────
function CoursesTab() {
  const { show } = useToast();
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal]       = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState({});

  const params = { search: search || undefined, category: filterCat || undefined, status: filterStatus || undefined };
  const { data: courses = [], isLoading, refetch } = useCourses(params);
  const createCourse  = useCreateCourse();
  const updateCourse  = useUpdateCourse();
  const deleteCourse  = useDeleteCourse();

  const openNew = () => {
    setForm({ title: "", code: "", category: "Technical", description: "", durationHrs: 1, level: "Beginner", format: "Online", trainer: "", maxSeats: "", passingScore: 70, status: "Active", tags: "" });
    setEditItem(null);
    setModal(true);
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setEditItem(c);
    setModal(true);
  };

  const save = async () => {
    try {
      if (editItem) {
        await updateCourse.mutateAsync({ id: editItem.id, ...form });
        show("Course updated", "success");
      } else {
        await createCourse.mutateAsync(form);
        show("Course created", "success");
      }
      setModal(false);
    } catch (e) {
      show(e.message, "error");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse.mutateAsync(id);
      show("Course deleted", "success");
    } catch (e) {
      show(e.message, "error");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportLms("courses", "csv");
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "lms_courses.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { show(e.message, "error"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search courses..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Category" data={["", ...CATEGORY_OPTIONS]} value={filterCat} onChange={setFilterCat} w={140} clearable />
          <Select placeholder="Status" data={["", ...STATUS_OPTIONS]} value={filterStatus} onChange={setFilterStatus} w={130} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={openNew}>Add Course</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Code</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Level</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Trainer</Table.Th>
              <Table.Th>Enrollments</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses.map((c) => (
              <Table.Tr key={c.id}>
                <Table.Td><Text fw={500} size="sm">{c.title}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{c.code || "—"}</Text></Table.Td>
                <Table.Td><Badge variant="light" color="blue" size="sm">{c.category}</Badge></Table.Td>
                <Table.Td><Badge variant="outline" size="sm">{c.level}</Badge></Table.Td>
                <Table.Td><Text size="sm">{c.durationHrs}h</Text></Table.Td>
                <Table.Td><Text size="sm">{c.trainer || "—"}</Text></Table.Td>
                <Table.Td><Badge>{c._count?.enrollments ?? 0}</Badge></Table.Td>
                <Table.Td>
                  <Badge color={c.status === "Active" ? "green" : c.status === "Draft" ? "yellow" : "gray"} size="sm">{c.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => openEdit(c)}><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => del(c.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {courses.length === 0 && (
              <Table.Tr><Table.Td colSpan={9}><AppEmptyState icon={<IconBook size={24} />} message="No courses found" sub="Add a course to get started." /></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modal} onClose={() => setModal(false)} title={editItem ? "Edit Course" : "Add Course"} size="lg">
        <Stack gap="sm">
          <Grid>
            <Grid.Col span={8}><TextInput label="Title" required value={form.title || ""} onChange={(e) => f("title")(e.target.value)} /></Grid.Col>
            <Grid.Col span={4}><TextInput label="Course Code" value={form.code || ""} onChange={(e) => f("code")(e.target.value)} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><Select label="Category" data={CATEGORY_OPTIONS} value={form.category} onChange={f("category")} /></Grid.Col>
            <Grid.Col span={6}><Select label="Level" data={LEVEL_OPTIONS} value={form.level} onChange={f("level")} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><Select label="Format" data={FORMAT_OPTIONS} value={form.format} onChange={f("format")} /></Grid.Col>
            <Grid.Col span={6}><Select label="Status" data={STATUS_OPTIONS} value={form.status} onChange={f("status")} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={4}><NumberInput label="Duration (hrs)" value={form.durationHrs} onChange={f("durationHrs")} min={0.5} step={0.5} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Max Seats" value={form.maxSeats || ""} onChange={f("maxSeats")} min={1} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Passing Score %" value={form.passingScore} onChange={f("passingScore")} min={0} max={100} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><TextInput label="Trainer" value={form.trainer || ""} onChange={(e) => f("trainer")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Tags (comma separated)" value={form.tags || ""} onChange={(e) => f("tags")(e.target.value)} /></Grid.Col>
          </Grid>
          <Textarea label="Description" value={form.description || ""} onChange={(e) => f("description")(e.target.value)} rows={3} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save} loading={createCourse.isPending || updateCourse.isPending}>
              {editItem ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Enrollments Tab ──────────────────────────────────────────────────────────
function EnrollmentsTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState({});

  const params = { employeeName: search || undefined, status: filterStatus || undefined };
  const { data: enrollments = [], isLoading } = useEnrollments(params);
  const { data: courses = [] } = useCourses({});
  const create = useCreateEnrollment();
  const update = useUpdateEnrollment();
  const remove = useDeleteEnrollment();

  const courseOptions = courses.map((c) => ({ value: String(c.id), label: c.title }));

  const openNew = () => {
    setForm({ courseId: "", employeeName: "", employeeDept: "", assignedBy: "", dueDate: "", status: "Enrolled", progress: 0 });
    setEditItem(null);
    setModal(true);
  };

  const openEdit = (e) => { setForm({ ...e, courseId: String(e.courseId) }); setEditItem(e); setModal(true); };

  const save = async () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId), progress: Number(form.progress || 0) };
      if (editItem) { await update.mutateAsync({ id: editItem.id, ...payload }); show("Enrollment updated", "success"); }
      else { await create.mutateAsync(payload); show("Enrolled successfully", "success"); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Remove enrollment?")) return;
    try { await remove.mutateAsync(id); show("Enrollment removed", "success"); } catch (e) { show(e.message, "error"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const statusColor = { Enrolled: "blue", "In Progress": "yellow", Completed: "green", Failed: "red", Dropped: "gray" };

  const handleExport = async () => {
    try {
      const blob = await exportLms("enrollments", "csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "lms_enrollments.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { show(e.message, "error"); }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search employee..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Status" data={["", ...ENROLL_STATUS]} value={filterStatus} onChange={setFilterStatus} w={150} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={openNew}>Assign Course</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Progress</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {enrollments.map((e) => (
              <Table.Tr key={e.id}>
                <Table.Td><Text fw={500} size="sm">{e.employeeName}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{e.employeeDept || "—"}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.course?.title || `Course #${e.courseId}`}</Text></Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Progress value={e.progress || 0} size="sm" w={80} color={e.progress >= 100 ? "green" : "blue"} />
                    <Text size="xs">{e.progress || 0}%</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{e.score != null ? `${e.score}%` : "—"}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.dueDate ? new Date(e.dueDate).toLocaleDateString() : "—"}</Text></Table.Td>
                <Table.Td><Badge color={statusColor[e.status] || "gray"} size="sm">{e.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => openEdit(e)}><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Remove"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => del(e.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {enrollments.length === 0 && (
              <Table.Tr><Table.Td colSpan={8}><AppEmptyState icon={<IconUsers size={24} />} message="No enrollments found" sub="Assign a course to enroll employees." /></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modal} onClose={() => setModal(false)} title={editItem ? "Update Enrollment" : "Assign Course"} size="md">
        <Stack gap="sm">
          <Select label="Course" required data={courseOptions} value={form.courseId} onChange={f("courseId")} searchable />
          <Grid>
            <Grid.Col span={6}><TextInput label="Employee Name" required value={form.employeeName || ""} onChange={(e) => f("employeeName")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Department" value={form.employeeDept || ""} onChange={(e) => f("employeeDept")(e.target.value)} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><TextInput label="Assigned By" value={form.assignedBy || ""} onChange={(e) => f("assignedBy")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><TextInput type="date" label="Due Date" value={form.dueDate ? form.dueDate.slice(0, 10) : ""} onChange={(e) => f("dueDate")(e.target.value)} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><Select label="Status" data={ENROLL_STATUS} value={form.status} onChange={f("status")} /></Grid.Col>
            <Grid.Col span={6}><NumberInput label="Progress %" value={form.progress || 0} onChange={f("progress")} min={0} max={100} /></Grid.Col>
          </Grid>
          {(form.status === "Completed" || form.status === "Failed") && (
            <NumberInput label="Score %" value={form.score || ""} onChange={f("score")} min={0} max={100} />
          )}
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save} loading={create.isPending || update.isPending}>{editItem ? "Update" : "Assign"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Certificates Tab ─────────────────────────────────────────────────────────
function CertificatesTab() {
  const { show } = useToast();
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({});

  const { data: certs = [], isLoading } = useCertificates({ employeeName: search || undefined });
  const { data: courses = [] } = useCourses({});
  const create = useCreateCertificate();
  const remove = useDeleteCertificate();

  const courseOptions = courses.map((c) => ({ value: String(c.id), label: c.title }));

  const openNew = () => {
    setForm({ courseId: "", employeeName: "", employeeDept: "", issuedBy: "", issueDate: new Date().toISOString().slice(0, 10), expiryDate: "", score: "", certificateNo: "", status: "Active" });
    setModal(true);
  };

  const save = async () => {
    try {
      await create.mutateAsync({ ...form, courseId: Number(form.courseId), score: form.score ? Number(form.score) : undefined });
      show("Certificate issued", "success");
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Revoke certificate?")) return;
    try { await remove.mutateAsync(id); show("Certificate revoked", "success"); } catch (e) { show(e.message, "error"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleExport = async () => {
    try {
      const blob = await exportLms("certificates", "csv");
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = "lms_certificates.csv"; a.click(); URL.revokeObjectURL(url);
    } catch (e) { show(e.message, "error"); }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput placeholder="Search employee..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={240} />
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={openNew}>Issue Certificate</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Certificate No</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Issue Date</Table.Th>
              <Table.Th>Expiry</Table.Th>
              <Table.Th>Issued By</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {certs.map((c) => (
              <Table.Tr key={c.id}>
                <Table.Td><Text fw={500} size="sm">{c.employeeName}</Text></Table.Td>
                <Table.Td><Text size="sm">{c.course?.title || "—"}</Text></Table.Td>
                <Table.Td><Text size="sm" c="blue" ff="monospace">{c.certificateNo || "—"}</Text></Table.Td>
                <Table.Td><Text size="sm">{c.score != null ? `${c.score}%` : "—"}</Text></Table.Td>
                <Table.Td><Text size="sm">{new Date(c.issueDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td><Text size="sm">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "No expiry"}</Text></Table.Td>
                <Table.Td><Text size="sm">{c.issuedBy || "—"}</Text></Table.Td>
                <Table.Td><Badge color={c.status === "Active" ? "green" : c.status === "Expired" ? "orange" : "red"} size="sm">{c.status}</Badge></Table.Td>
                <Table.Td>
                  <Tooltip label="Revoke"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => del(c.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
            {certs.length === 0 && (
              <Table.Tr><Table.Td colSpan={9}><AppEmptyState icon={<IconCertificate size={24} />} message="No certificates found" sub="Issue a certificate to get started." /></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modal} onClose={() => setModal(false)} title="Issue Certificate" size="md">
        <Stack gap="sm">
          <Select label="Course" required data={courseOptions} value={form.courseId} onChange={f("courseId")} searchable />
          <Grid>
            <Grid.Col span={6}><TextInput label="Employee Name" required value={form.employeeName || ""} onChange={(e) => f("employeeName")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Department" value={form.employeeDept || ""} onChange={(e) => f("employeeDept")(e.target.value)} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><TextInput label="Certificate No" value={form.certificateNo || ""} onChange={(e) => f("certificateNo")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><NumberInput label="Score %" value={form.score || ""} onChange={f("score")} min={0} max={100} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}><TextInput type="date" label="Issue Date" value={form.issueDate || ""} onChange={(e) => f("issueDate")(e.target.value)} /></Grid.Col>
            <Grid.Col span={6}><TextInput type="date" label="Expiry Date" value={form.expiryDate || ""} onChange={(e) => f("expiryDate")(e.target.value)} /></Grid.Col>
          </Grid>
          <TextInput label="Issued By" value={form.issuedBy || ""} onChange={(e) => f("issuedBy")(e.target.value)} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save} loading={create.isPending}>Issue</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Assessments Tab ──────────────────────────────────────────────────────────
function AssessmentsTab() {
  const { show } = useToast();
  const [modal, setModal]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState({});

  const { data: assessments = [], isLoading } = useAssessments({});
  const { data: courses = [] } = useCourses({});
  const create = useCreateAssessment();
  const update = useUpdateAssessment();
  const remove = useDeleteAssessment();

  const courseOptions = courses.map((c) => ({ value: String(c.id), label: c.title }));

  const openNew = () => {
    setForm({ courseId: "", title: "", type: "Quiz", passingScore: 70, timeLimit: 30, maxAttempts: 3, status: "Active" });
    setEditItem(null);
    setModal(true);
  };

  const openEdit = (a) => { setForm({ ...a, courseId: String(a.courseId) }); setEditItem(a); setModal(true); };

  const save = async () => {
    try {
      const payload = { ...form, courseId: Number(form.courseId) };
      if (editItem) { await update.mutateAsync({ id: editItem.id, ...payload }); show("Assessment updated", "success"); }
      else { await create.mutateAsync(payload); show("Assessment created", "success"); }
      setModal(false);
    } catch (e) { show(e.message, "error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete assessment?")) return;
    try { await remove.mutateAsync(id); show("Deleted", "success"); } catch (e) { show(e.message, "error"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={14} />} size="sm" onClick={openNew}>Add Assessment</Button>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Passing Score</Table.Th>
              <Table.Th>Time Limit</Table.Th>
              <Table.Th>Max Attempts</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assessments.map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td><Text fw={500} size="sm">{a.title}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.course?.title || "—"}</Text></Table.Td>
                <Table.Td><Badge variant="light" size="sm">{a.type}</Badge></Table.Td>
                <Table.Td><Text size="sm">{a.passingScore}%</Text></Table.Td>
                <Table.Td><Text size="sm">{a.timeLimit ? `${a.timeLimit} min` : "No limit"}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.maxAttempts}</Text></Table.Td>
                <Table.Td><Badge color={a.status === "Active" ? "green" : "gray"} size="sm">{a.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => openEdit(a)}><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => del(a.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {assessments.length === 0 && (
              <Table.Tr><Table.Td colSpan={8}><AppEmptyState icon={<IconClipboardList size={24} />} message="No assessments found" sub="Add an assessment to get started." /></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modal} onClose={() => setModal(false)} title={editItem ? "Edit Assessment" : "Add Assessment"} size="md">
        <Stack gap="sm">
          <Select label="Course" required data={courseOptions} value={form.courseId} onChange={f("courseId")} searchable />
          <Grid>
            <Grid.Col span={8}><TextInput label="Title" required value={form.title || ""} onChange={(e) => f("title")(e.target.value)} /></Grid.Col>
            <Grid.Col span={4}><Select label="Type" data={ASSESSMENT_TYPES} value={form.type} onChange={f("type")} /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={4}><NumberInput label="Passing Score %" value={form.passingScore} onChange={f("passingScore")} min={0} max={100} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Time Limit (min)" value={form.timeLimit || ""} onChange={f("timeLimit")} min={1} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Max Attempts" value={form.maxAttempts} onChange={f("maxAttempts")} min={1} /></Grid.Col>
          </Grid>
          <Select label="Status" data={["Active", "Inactive"]} value={form.status} onChange={f("status")} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save} loading={create.isPending || update.isPending}>{editItem ? "Update" : "Create"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: analytics, isLoading } = useLmsAnalytics();

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!analytics) return null;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="md">Enrollments by Status</Text>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={analytics.enrollmentsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {analytics.enrollmentsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="md">Enrollments by Department</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.enrollmentsByDept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={100} />
              <RTooltip />
              <Bar dataKey="count" fill="#40c057" radius={[0, 4, 4, 0]} name="Enrollments" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="md">Certificates Issued Per Month</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.certsByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="count" fill="#7950f2" radius={[4, 4, 0, 0]} name="Certificates" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="md">Average Score by Course</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.avgScorePerCourse || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="title" type="category" tick={{ fontSize: 10 }} width={120} />
              <RTooltip />
              <Bar dataKey="avgScore" fill="#fab005" radius={[0, 4, 4, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────
function AuditTab() {
  const { data: logs = [], isLoading } = useLmsAudit();

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Action</Table.Th>
          <Table.Th>Details</Table.Th>
          <Table.Th>Actor</Table.Th>
          <Table.Th>Date</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {logs.map((l) => (
          <Table.Tr key={l.id}>
            <Table.Td><Badge variant="light" size="sm">{l.action}</Badge></Table.Td>
            <Table.Td><Text size="sm">{l.details || "—"}</Text></Table.Td>
            <Table.Td><Text size="sm">{l.actorName || "—"}</Text></Table.Td>
            <Table.Td><Text size="sm" c="dimmed">{new Date(l.createdAt).toLocaleString()}</Text></Table.Td>
          </Table.Tr>
        ))}
        {logs.length === 0 && (
          <Table.Tr><Table.Td colSpan={4}><AppEmptyState icon={<IconAward size={24} />} message="No audit logs yet" sub="Activity will appear here as it happens." /></Table.Td></Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LmsManagement() {
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconSchool size={24} color="var(--mantine-color-blue-6)" />
          <Box>
            <Text fw={700} size="lg">Learning Management System</Text>
            <Text size="xs" c="dimmed">Courses · Enrollments · Certifications · Assessments</Text>
          </Box>
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard"    leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="courses"      leftSection={<IconBook size={14} />}>Courses</Tabs.Tab>
          <Tabs.Tab value="enrollments"  leftSection={<IconUsers size={14} />}>Enrollments</Tabs.Tab>
          <Tabs.Tab value="certificates" leftSection={<IconCertificate size={14} />}>Certificates</Tabs.Tab>
          <Tabs.Tab value="assessments"  leftSection={<IconClipboardList size={14} />}>Assessments</Tabs.Tab>
          <Tabs.Tab value="analytics"    leftSection={<IconChartBar size={14} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="audit"        leftSection={<IconAward size={14} />}>Audit Log</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard">    <DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="courses">      <CoursesTab /></Tabs.Panel>
        <Tabs.Panel value="enrollments">  <EnrollmentsTab /></Tabs.Panel>
        <Tabs.Panel value="certificates"> <CertificatesTab /></Tabs.Panel>
        <Tabs.Panel value="assessments">  <AssessmentsTab /></Tabs.Panel>
        <Tabs.Panel value="analytics">    <AnalyticsTab /></Tabs.Panel>
        <Tabs.Panel value="audit">        <AuditTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
