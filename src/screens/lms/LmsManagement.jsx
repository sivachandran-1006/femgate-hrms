import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  Progress, RingProgress, NumberInput, Switch, Loader, Center,
} from "@mantine/core";
import {
  IconBook, IconCertificate, IconUsers, IconChartBar,
  IconPlus, IconPencil, IconTrash, IconDownload, IconSearch,
  IconClipboardList, IconAward, IconRefresh,
  IconCheck, IconX, IconEye, IconPlayerPlay, IconClock,
} from "@tabler/icons-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { topSlices } from "../dashboard/components/DashboardKit";

// ── Mock stubs for removed service functions ──
const exportLms = async (...args) => { console.log("Mock: exportLms"); return new Blob(["mock data"], { type: "text/csv" }); };


const COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2", "#fd7014", "#15aabf"];
const CATEGORY_OPTIONS = ["Technical", "Soft Skills", "Compliance", "Leadership", "Other"];
const LEVEL_OPTIONS    = ["Beginner", "Intermediate", "Advanced"];
const FORMAT_OPTIONS   = ["Online", "Classroom", "Blended", "Self-Paced"];
const STATUS_OPTIONS   = ["Active", "Inactive", "Draft", "Archived"];
const ENROLL_STATUS    = ["Enrolled", "In Progress", "Completed", "Failed", "Dropped"];
const CERT_STATUS      = ["Active", "Expired", "Revoked"];
const ASSESSMENT_TYPES = ["Quiz", "Assignment", "Practical", "MCQ"];

// ─── Mock data (main_v1 UI-only fallback) ─────────────────────────────────────
const MOCK_COURSES = [
  { id: 1, title: "Workplace Safety Fundamentals", code: "CRS-101", category: "Compliance", description: "Core safety practices for all employees.", durationHrs: 4, level: "Beginner", format: "Online", trainer: "Anita Rao", maxSeats: 100, passingScore: 70, status: "Active", tags: "safety,compliance", _count: { enrollments: 42 } },
  { id: 2, title: "Advanced React Patterns", code: "CRS-102", category: "Technical", description: "Hooks, performance, and architecture patterns.", durationHrs: 12, level: "Advanced", format: "Self-Paced", trainer: "Karthik Iyer", maxSeats: 40, passingScore: 75, status: "Active", tags: "react,frontend", _count: { enrollments: 28 } },
  { id: 3, title: "Effective Communication Skills", code: "CRS-103", category: "Soft Skills", description: "Building clear, confident workplace communication.", durationHrs: 6, level: "Beginner", format: "Classroom", trainer: "Priya Menon", maxSeats: 30, passingScore: 60, status: "Active", tags: "communication", _count: { enrollments: 35 } },
  { id: 4, title: "Leadership Essentials", code: "CRS-104", category: "Leadership", description: "First-time manager training program.", durationHrs: 16, level: "Intermediate", format: "Blended", trainer: "Suresh Nair", maxSeats: 25, passingScore: 70, status: "Active", tags: "leadership,management", _count: { enrollments: 19 } },
  { id: 5, title: "Data Privacy & GDPR", code: "CRS-105", category: "Compliance", description: "Understanding data protection obligations.", durationHrs: 3, level: "Beginner", format: "Online", trainer: "Anita Rao", maxSeats: 150, passingScore: 80, status: "Active", tags: "privacy,gdpr", _count: { enrollments: 61 } },
  { id: 6, title: "Node.js Backend Development", code: "CRS-106", category: "Technical", description: "Building scalable APIs with Node.js.", durationHrs: 20, level: "Intermediate", format: "Self-Paced", trainer: "Karthik Iyer", maxSeats: 35, passingScore: 75, status: "Draft", tags: "node,backend", _count: { enrollments: 8 } },
  { id: 7, title: "Conflict Resolution at Work", code: "CRS-107", category: "Soft Skills", description: "Practical techniques for resolving team conflicts.", durationHrs: 5, level: "Intermediate", format: "Classroom", trainer: "Priya Menon", maxSeats: 20, passingScore: 65, status: "Inactive", tags: "hr,soft-skills", _count: { enrollments: 12 } },
  { id: 8, title: "Diversity & Inclusion Training", code: "CRS-108", category: "Compliance", description: "Fostering an inclusive workplace culture.", durationHrs: 4, level: "Beginner", format: "Online", trainer: "Meera Pillai", maxSeats: 200, passingScore: 70, status: "Active", tags: "dei,compliance", _count: { enrollments: 74 } },
];

const MOCK_ENROLLMENTS = [
  { id: 101, courseId: 1, course: { title: "Workplace Safety Fundamentals" }, employeeName: "Ravi Kumar", employeeDept: "Operations", assignedBy: "Anita Rao", dueDate: "2026-08-05", status: "In Progress", progress: 60, score: null },
  { id: 102, courseId: 2, course: { title: "Advanced React Patterns" }, employeeName: "Divya Shankar", employeeDept: "Engineering", assignedBy: "Karthik Iyer", dueDate: "2026-07-25", status: "Completed", progress: 100, score: 88 },
  { id: 103, courseId: 3, course: { title: "Effective Communication Skills" }, employeeName: "Arjun Das", employeeDept: "Sales", assignedBy: "Priya Menon", dueDate: "2026-07-30", status: "Enrolled", progress: 0, score: null },
  { id: 104, courseId: 4, course: { title: "Leadership Essentials" }, employeeName: "Sneha Reddy", employeeDept: "Marketing", assignedBy: "Suresh Nair", dueDate: "2026-08-10", status: "In Progress", progress: 45, score: null },
  { id: 105, courseId: 5, course: { title: "Data Privacy & GDPR" }, employeeName: "Vikram Singh", employeeDept: "Legal", assignedBy: "Anita Rao", dueDate: "2026-07-20", status: "Completed", progress: 100, score: 92 },
  { id: 106, courseId: 8, course: { title: "Diversity & Inclusion Training" }, employeeName: "Fatima Sheikh", employeeDept: "HR", assignedBy: "Meera Pillai", dueDate: "2026-07-15", status: "Failed", progress: 100, score: 55 },
  { id: 107, courseId: 3, course: { title: "Effective Communication Skills" }, employeeName: "Naveen Gupta", employeeDept: "Support", assignedBy: "Priya Menon", dueDate: "2026-06-30", status: "Dropped", progress: 20, score: null },
];

const MOCK_CERTIFICATES = [
  { id: 201, courseId: 2, course: { title: "Advanced React Patterns" }, employeeName: "Divya Shankar", employeeDept: "Engineering", certificateNo: "CERT-2026-0021", score: 88, issueDate: "2026-06-15", expiryDate: null, issuedBy: "Karthik Iyer", status: "Active" },
  { id: 202, courseId: 5, course: { title: "Data Privacy & GDPR" }, employeeName: "Vikram Singh", employeeDept: "Legal", certificateNo: "CERT-2026-0022", score: 92, issueDate: "2026-06-20", expiryDate: "2027-06-20", issuedBy: "Anita Rao", status: "Active" },
  { id: 203, courseId: 1, course: { title: "Workplace Safety Fundamentals" }, employeeName: "Ramesh Chandra", employeeDept: "Operations", certificateNo: "CERT-2025-0110", score: 78, issueDate: "2025-05-10", expiryDate: "2026-05-10", issuedBy: "Anita Rao", status: "Expired" },
  { id: 204, courseId: 8, course: { title: "Diversity & Inclusion Training" }, employeeName: "Meena Iyer", employeeDept: "HR", certificateNo: "CERT-2026-0045", score: 95, issueDate: "2026-07-01", expiryDate: null, issuedBy: "Meera Pillai", status: "Active" },
  { id: 205, courseId: 3, course: { title: "Effective Communication Skills" }, employeeName: "Rohit Verma", employeeDept: "Sales", certificateNo: "CERT-2026-0033", score: 82, issueDate: "2026-05-18", expiryDate: null, issuedBy: "Priya Menon", status: "Revoked" },
  { id: 206, courseId: 4, course: { title: "Leadership Essentials" }, employeeName: "Kavya Nair", employeeDept: "Marketing", certificateNo: "CERT-2026-0050", score: 90, issueDate: "2026-07-10", expiryDate: "2028-07-10", issuedBy: "Suresh Nair", status: "Active" },
];

const MOCK_ASSESSMENTS = [
  { id: 301, courseId: 1, course: { title: "Workplace Safety Fundamentals" }, title: "Safety Basics Quiz", type: "Quiz", passingScore: 70, timeLimit: 20, maxAttempts: 3, status: "Active" },
  { id: 302, courseId: 2, course: { title: "Advanced React Patterns" }, title: "React Patterns Practical", type: "Practical", passingScore: 75, timeLimit: 60, maxAttempts: 2, status: "Active" },
  { id: 303, courseId: 3, course: { title: "Effective Communication Skills" }, title: "Communication Assessment", type: "Assignment", passingScore: 60, timeLimit: null, maxAttempts: 1, status: "Active" },
  { id: 304, courseId: 4, course: { title: "Leadership Essentials" }, title: "Leadership Case Study", type: "Assignment", passingScore: 70, timeLimit: 90, maxAttempts: 2, status: "Active" },
  { id: 305, courseId: 5, course: { title: "Data Privacy & GDPR" }, title: "GDPR Compliance MCQ", type: "MCQ", passingScore: 80, timeLimit: 30, maxAttempts: 3, status: "Active" },
  { id: 306, courseId: 8, course: { title: "Diversity & Inclusion Training" }, title: "D&I Knowledge Check", type: "Quiz", passingScore: 70, timeLimit: 15, maxAttempts: 3, status: "Inactive" },
];

const MOCK_DASHBOARD = {
  totalCourses: 8,
  totalEnrollments: 279,
  inProgress: 62,
  completionRate: 68,
  completions: 190,
  certs: 41,
  overdue: 7,
  monthlyCompletions: [
    { month: "Feb", count: 18 }, { month: "Mar", count: 24 }, { month: "Apr", count: 21 },
    { month: "May", count: 30 }, { month: "Jun", count: 27 }, { month: "Jul", count: 33 },
  ],
  categories: [
    { category: "Compliance", count: 177 }, { category: "Technical", count: 36 },
    { category: "Soft Skills", count: 47 }, { category: "Leadership", count: 19 },
  ],
  topCourses: [
    { courseId: 8, title: "Diversity & Inclusion Training", enrollments: 74 },
    { courseId: 5, title: "Data Privacy & GDPR", enrollments: 61 },
    { courseId: 1, title: "Workplace Safety Fundamentals", enrollments: 42 },
    { courseId: 3, title: "Effective Communication Skills", enrollments: 35 },
    { courseId: 2, title: "Advanced React Patterns", enrollments: 28 },
  ],
};

const MOCK_ANALYTICS = {
  enrollmentsByStatus: [
    { status: "Completed", count: 190 }, { status: "In Progress", count: 62 },
    { status: "Enrolled", count: 15 }, { status: "Failed", count: 8 }, { status: "Dropped", count: 4 },
  ],
  enrollmentsByDept: [
    { dept: "Operations", count: 58 }, { dept: "Engineering", count: 45 }, { dept: "Sales", count: 51 },
    { dept: "Marketing", count: 32 }, { dept: "Legal", count: 20 }, { dept: "HR", count: 41 }, { dept: "Support", count: 32 },
  ],
  certsByMonth: [
    { month: "Feb", count: 4 }, { month: "Mar", count: 6 }, { month: "Apr", count: 5 },
    { month: "May", count: 8 }, { month: "Jun", count: 9 }, { month: "Jul", count: 9 },
  ],
  avgScorePerCourse: [
    { title: "Workplace Safety", avgScore: 82 }, { title: "React Patterns", avgScore: 86 },
    { title: "Communication Skills", avgScore: 75 }, { title: "Leadership Essentials", avgScore: 88 },
    { title: "Data Privacy & GDPR", avgScore: 90 },
  ],
};

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
  const { data: rawDash, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const dash = rawDash ?? MOCK_DASHBOARD;

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
                <Pie data={topSlices(dash.categories || [], "count", 5, "category")} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} label>
                  {topSlices(dash.categories || [], "count", 5, "category").map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
  const [delId, setDelId]       = useState(null);

  const params = { search: search || undefined, category: filterCat || undefined, status: filterStatus || undefined };
  const { data: rawCourses, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const createCourse  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateCourse  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteCourse  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

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
    if (!id) return;
    try {
      await deleteCourse.mutateAsync(id);
      show("Course deleted", "success");
      setDelId(null);
    } catch (e) {
      show(e.message, "error");
      setDelId(null);
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
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(c.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
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

      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Delete Course" centered radius="lg" size="sm">
        <Text size="sm" mb="lg">Are you sure you want to delete this course?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={deleteCourse.isPending} onClick={() => del(delId)}>Delete</Button>
        </Group>
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
  const [delId, setDelId]   = useState(null);

  const params = { employeeName: search || undefined, status: filterStatus || undefined };
  const { data: rawEnrollments, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const enrollments = rawEnrollments?.length ? rawEnrollments : MOCK_ENROLLMENTS;
  const { data: rawCourses } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const update = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const remove = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

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
    if (!id) return;
    try { await remove.mutateAsync(id); show("Enrollment removed", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
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
                    <Tooltip label="Remove"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(e.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
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

      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Remove Enrollment" centered radius="lg" size="sm">
        <Text size="sm" mb="lg">Are you sure you want to remove this enrollment?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={remove.isPending} onClick={() => del(delId)}>Remove</Button>
        </Group>
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
  const [delId, setDelId]     = useState(null);

  const { data: rawCerts, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const certs = rawCerts?.length ? rawCerts : MOCK_CERTIFICATES;
  const { data: rawCourses } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const remove = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

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
    if (!id) return;
    try { await remove.mutateAsync(id); show("Certificate revoked", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
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
                  <Tooltip label="Revoke"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(c.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
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

      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Revoke Certificate" centered radius="lg" size="sm">
        <Text size="sm" mb="lg">Are you sure you want to revoke this certificate?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={remove.isPending} onClick={() => del(delId)}>Revoke</Button>
        </Group>
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
  const [delId, setDelId]   = useState(null);

  const { data: rawAssessments, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const assessments = rawAssessments?.length ? rawAssessments : MOCK_ASSESSMENTS;
  const { data: rawCourses } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const courses = rawCourses?.length ? rawCourses : MOCK_COURSES;
  const create = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const update = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const remove = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

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
    if (!id) return;
    try { await remove.mutateAsync(id); show("Deleted", "success"); setDelId(null); } catch (e) { show(e.message, "error"); setDelId(null); }
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
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(a.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
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
      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Delete Assessment" centered radius="lg" size="sm">
        <Text size="sm" mb="lg">Are you sure you want to delete this assessment?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={remove?.isPending} onClick={() => del(delId)}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: rawAnalytics, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const analytics = rawAnalytics ?? MOCK_ANALYTICS;

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
  const { data: logs = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

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
      <AppPageHeader title="Learning Management System" sub="Courses · Enrollments · Certifications · Assessments" />

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
