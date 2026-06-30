import { useState, useCallback } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  Paper, Grid, ThemeIcon, ScrollArea, Divider, Switch, ColorInput,
  Stepper, SegmentedControl, RingProgress, Progress, Loader, Center,
  NumberInput, MultiSelect,
} from "@mantine/core";
import {
  IconLayoutDashboard, IconPlus, IconSearch, IconPencil, IconTrash,
  IconEye, IconCopy, IconRocket, IconShare, IconArchive, IconDownload,
  IconChartBar, IconChartLine, IconChartPie, IconTable, IconCalendar,
  IconUsers, IconClock, IconCurrencyRupee, IconTarget, IconBook,
  IconReceipt, IconPackage, IconLifebuoy, IconBuildingArch,
  IconBell, IconBriefcase, IconClipboard, IconStar, IconStarFilled,
  IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile, IconSettings,
  IconDragDrop, IconLayoutGrid, IconLayoutColumns, IconGauge,
  IconTrendingUp, IconTrendingDown, IconChevronRight, IconCheck,
  IconBolt, IconFilter, IconRefresh, IconBookmark, IconGrid3x3,
  IconList, IconTemplate, IconAdjustments, IconChartDonut,
  IconMapPin, IconGridDots, IconArrowUpRight, IconArrowDownRight,
} from "@tabler/icons-react";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useDBBuilderDashboard, useDashboards, useSharedDashboards,
  useCreateDashboard, useDeleteDashboard, usePublishDashboard,
  useArchiveDashboard, useDuplicateDashboard, useUnshare,
} from "../../queries/useDashboardBuilder";

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DASHBOARDS = [
  { id: 1, name: "HR Operations HQ",      role: "HR",          dept: "Human Resources", widgets: 12, status: "Published", createdBy: "Priya Nair",    updatedAt: "2026-06-28", starred: true  },
  { id: 2, name: "CEO Executive View",    role: "Super Admin", dept: "Leadership",      widgets: 8,  status: "Published", createdBy: "Raj Kumar",     updatedAt: "2026-06-25", starred: true  },
  { id: 3, name: "Manager Team Board",    role: "Manager",     dept: "Engineering",     widgets: 10, status: "Published", createdBy: "Arun Sharma",   updatedAt: "2026-06-20", starred: false },
  { id: 4, name: "Finance Analytics",     role: "Finance",     dept: "Finance",         widgets: 9,  status: "Published", createdBy: "Kavya Iyer",    updatedAt: "2026-06-18", starred: false },
  { id: 5, name: "Recruitment Tracker",   role: "HR",          dept: "Talent",          widgets: 7,  status: "Draft",     createdBy: "Meera Reddy",   updatedAt: "2026-06-15", starred: false },
  { id: 6, name: "Employee Self-Service", role: "Employee",    dept: "All",             widgets: 6,  status: "Published", createdBy: "Siva Kumar",    updatedAt: "2026-06-10", starred: false },
  { id: 7, name: "IT Assets & Helpdesk",  role: "IT Admin",    dept: "IT",              widgets: 8,  status: "Draft",     createdBy: "Dev Nair",      updatedAt: "2026-06-08", starred: false },
  { id: 8, name: "Attendance Daily View", role: "Manager",     dept: "Operations",      widgets: 5,  status: "Published", createdBy: "Priya Nair",    updatedAt: "2026-06-05", starred: false },
];

const MOCK_SHARED = [
  { id: 1, name: "HR Operations HQ",   owner: "Priya Nair",  sharedWith: "All HR",      permission: "View",  updatedAt: "2026-06-28" },
  { id: 2, name: "CEO Executive View", owner: "Raj Kumar",   sharedWith: "Leadership",  permission: "Edit",  updatedAt: "2026-06-25" },
  { id: 3, name: "Finance Analytics",  owner: "Kavya Iyer",  sharedWith: "Finance Team",permission: "View",  updatedAt: "2026-06-18" },
];

const TEMPLATES = [
  { id: 1, name: "CEO Dashboard",       icon: IconTarget,         color: "violet", tags: ["executive","analytics"],    widgets: 8  },
  { id: 2, name: "HR Dashboard",        icon: IconUsers,          color: "blue",   tags: ["hr","recruitment","leave"],  widgets: 12 },
  { id: 3, name: "Manager Dashboard",   icon: IconBriefcase,      color: "teal",   tags: ["team","performance"],        widgets: 10 },
  { id: 4, name: "Employee Dashboard",  icon: IconLayoutDashboard,color: "green",  tags: ["self-service","leave"],      widgets: 6  },
  { id: 5, name: "Recruiter Dashboard", icon: IconBriefcase,      color: "orange", tags: ["recruitment","pipeline"],    widgets: 7  },
  { id: 6, name: "Finance Dashboard",   icon: IconCurrencyRupee,  color: "yellow", tags: ["payroll","expense"],         widgets: 9  },
  { id: 7, name: "Executive Dashboard", icon: IconChartBar,       color: "red",    tags: ["kpi","analytics"],           widgets: 11 },
  { id: 8, name: "IT Dashboard",        icon: IconPackage,        color: "gray",   tags: ["assets","helpdesk"],         widgets: 8  },
];

const WIDGET_CATEGORIES = {
  HR:          [
    { id: "emp-count",    name: "Employee Count",     icon: IconUsers,          type: "kpi"    },
    { id: "dept-summary", name: "Department Summary", icon: IconBriefcase,      type: "chart"  },
    { id: "birthdays",    name: "Upcoming Birthdays", icon: IconCalendar,       type: "list"   },
    { id: "anniversaries",name: "Work Anniversaries", icon: IconStar,           type: "list"   },
  ],
  Payroll:     [
    { id: "payroll-sum",  name: "Payroll Summary",    icon: IconCurrencyRupee,  type: "kpi"    },
    { id: "expense-sum",  name: "Expense Summary",    icon: IconReceipt,        type: "kpi"    },
  ],
  Attendance:  [
    { id: "att-summary",  name: "Attendance Summary", icon: IconClock,          type: "kpi"    },
    { id: "leave-bal",    name: "Leave Balance",       icon: IconCalendar,       type: "ring"   },
  ],
  Recruitment: [
    { id: "rec-funnel",   name: "Recruitment Funnel", icon: IconChartBar,       type: "chart"  },
    { id: "interviews",   name: "Interview Schedule", icon: IconCalendar,       type: "list"   },
  ],
  Learning:    [
    { id: "lms-progress", name: "Learning Progress",  icon: IconBook,           type: "progress"},
  ],
  Performance: [
    { id: "perf-rating",  name: "Performance Rating", icon: IconTarget,         type: "ring"   },
  ],
  Assets:      [
    { id: "asset-sum",    name: "Asset Summary",      icon: IconPackage,        type: "kpi"    },
  ],
  Finance:     [
    { id: "travel-sum",   name: "Travel Summary",     icon: IconMapPin,         type: "kpi"    },
  ],
  Analytics:   [
    { id: "bar-chart",    name: "Bar Chart",          icon: IconChartBar,       type: "chart"  },
    { id: "line-chart",   name: "Line Chart",         icon: IconChartLine,      type: "chart"  },
    { id: "pie-chart",    name: "Pie Chart",          icon: IconChartPie,       type: "chart"  },
    { id: "donut-chart",  name: "Donut Chart",        icon: IconChartDonut,     type: "chart"  },
    { id: "area-chart",   name: "Area Chart",         icon: IconTrendingUp,     type: "chart"  },
    { id: "heat-map",     name: "Heat Map",           icon: IconGridDots,       type: "chart"  },
    { id: "gauge",        name: "Gauge",              icon: IconGauge,          type: "gauge"  },
    { id: "table-widget", name: "Table Widget",       icon: IconTable,          type: "table"  },
    { id: "calendar-wdg", name: "Calendar Widget",    icon: IconCalendar,       type: "calendar"},
  ],
  "AI Widgets":[
    { id: "ai-insights",  name: "AI Insights",        icon: IconBolt,           type: "ai"     },
    { id: "ai-alerts",    name: "Smart Alerts",       icon: IconBell,           type: "ai"     },
  ],
  Custom:      [
    { id: "quick-links",  name: "Quick Links",        icon: IconBriefcase,      type: "list"   },
    { id: "recent-act",   name: "Recent Activities",  icon: IconClipboard,      type: "list"   },
    { id: "announcements",name: "Announcements",      icon: IconBell,           type: "list"   },
    { id: "approvals",    name: "Approvals",          icon: IconCheck,          type: "list"   },
    { id: "tasks",        name: "Tasks",              icon: IconBookmark,       type: "list"   },
  ],
};

const ROLES       = ["Super Admin","Admin","HR","Manager","Finance","IT Admin","Employee"];
const DEPTS       = ["All","Human Resources","Engineering","Finance","Sales","Operations","IT","Leadership","Talent"];
const CATEGORIES  = ["Operations","Analytics","Executive","Self-Service","Team","Finance","Custom"];
const LAYOUTS     = [
  { id: "1col",       label: "1 Column",        desc: "Single column full-width" },
  { id: "2col",       label: "2 Column",        desc: "Equal two-column split"   },
  { id: "3col",       label: "3 Column",        desc: "Triple column grid"       },
  { id: "4col",       label: "4 Column",        desc: "Dense four-column grid"   },
  { id: "executive",  label: "Executive",       desc: "Hero KPIs + side charts"  },
  { id: "analytics",  label: "Analytics",       desc: "Charts-first wide layout" },
  { id: "compact",    label: "Compact",         desc: "Small cards, more density"},
  { id: "responsive", label: "Responsive",      desc: "Auto-adapts to viewport"  },
];
const FREQ       = ["On Load","Every 30s","Every 1min","Every 5min","Every 15min","Hourly","Manual"];
const COLORS_OPT = ["blue","violet","teal","green","orange","red","yellow","gray","cyan","pink"];
const STATUS_COLOR = { Published: "green", Draft: "orange", Archived: "gray" };
const PERM_COLOR   = { View: "blue", Edit: "teal", Manage: "violet" };

// ── Helper components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, change, icon: Icon, color, sub }) {
  const up = change >= 0;
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={6}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: "0.04em" }}>{label}</Text>
        <ThemeIcon size={32} radius={8} variant="light" color={color}><Icon size={16} /></ThemeIcon>
      </Group>
      <Text fw={800} size="xl" mb={2}>{value}</Text>
      {change !== undefined && (
        <Group gap={4}>
          {up ? <IconArrowUpRight size={13} color="var(--mantine-color-green-6)" /> : <IconArrowDownRight size={13} color="var(--mantine-color-red-6)" />}
          <Text size="xs" c={up ? "green" : "red"}>{Math.abs(change)}%</Text>
          <Text size="xs" c="dimmed">{sub || "vs last month"}</Text>
        </Group>
      )}
    </Card>
  );
}

// ── 1. Dashboard Home ─────────────────────────────────────────────────────────
function DashboardHomeTab({ onNav }) {
  const USAGE_TREND = [78,82,91,88,95,103,110,108,115,122,118,130];
  const { data: rawDash = [] }   = useDashboards();
  const { data: rawShared = [] } = useSharedDashboards();
  const dash   = rawDash.length   ? rawDash   : MOCK_DASHBOARDS;
  const shared = rawShared.length ? rawShared : MOCK_SHARED;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
        <KpiCard label="Total Dashboards"     value={dash.length}                                          change={12}  icon={IconLayoutDashboard} color="blue"   />
        <KpiCard label="Published"            value={dash.filter(d=>d.status==="Published").length}        change={8}   icon={IconRocket}          color="green"  />
        <KpiCard label="Drafts"               value={dash.filter(d=>d.status==="Draft").length}            change={-2}  icon={IconPencil}          color="orange" />
        <KpiCard label="Total Widgets"        value={dash.reduce((s,d)=>s+(d.widgets||0),0)}               change={15}  icon={IconGrid3x3}         color="violet" />
        <KpiCard label="Active Users"         value="247"                                                   change={5}   icon={IconUsers}           color="teal"   />
        <KpiCard label="Shared Dashboards"    value={shared.length}                                         change={0}   icon={IconShare}           color="cyan"   />
        <KpiCard label="Favorite Dashboards"  value={dash.filter(d=>d.starred).length}                    icon={IconStarFilled} color="yellow" />
        <KpiCard label="Templates Available"  value={TEMPLATES.length}                                               icon={IconTemplate}  color="gray"  />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Dashboard Usage Trend</Text>
              <Badge variant="light" color="blue">Last 12 months</Badge>
            </Group>
            <Group gap={0} align="flex-end" style={{ height: 80 }}>
              {USAGE_TREND.map((v, i) => (
                <Stack key={i} gap={4} align="center" style={{ flex: 1 }}>
                  <Box style={{ width: "70%", height: `${(v / 130) * 72}px`, background: `var(--mantine-color-blue-${3 + (i % 4)})`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                </Stack>
              ))}
            </Group>
            <Group gap={0} mt={4}>
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map(m => (
                <Text key={m} size="xs" c="dimmed" ta="center" style={{ flex: 1 }}>{m}</Text>
              ))}
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="lg" h="100%">
            <Text fw={600} mb="md">Most Used Widgets</Text>
            <Stack gap="xs">
              {[
                { name: "KPI Card",          pct: 92 },
                { name: "Attendance Summary",pct: 78 },
                { name: "Leave Balance",     pct: 71 },
                { name: "Bar Chart",         pct: 65 },
                { name: "Employee Count",    pct: 58 },
              ].map((w) => (
                <Stack key={w.name} gap={3}>
                  <Group justify="space-between"><Text size="xs">{w.name}</Text><Text size="xs" c="dimmed">{w.pct}%</Text></Group>
                  <Progress value={w.pct} size="sm" radius="xl" color="blue" />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Role-wise Dashboard Usage</Text>
            <Stack gap="xs">
              {[
                { role: "HR",          count: 3, color: "blue"   },
                { role: "Manager",     count: 2, color: "teal"   },
                { role: "Super Admin", count: 2, color: "violet" },
                { role: "Employee",    count: 1, color: "green"  },
                { role: "Finance",     count: 1, color: "yellow" },
              ].map(r => (
                <Group key={r.role} justify="space-between">
                  <Group gap="xs">
                    <Box w={8} h={8} style={{ borderRadius: "50%", background: `var(--mantine-color-${r.color}-5)` }} />
                    <Text size="sm">{r.role}</Text>
                  </Group>
                  <Badge size="xs" variant="light" color={r.color}>{r.count} dashboards</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Recent Activity</Text>
            <Stack gap="xs">
              {[
                { action: "Published",  name: "HR Operations HQ",  user: "Priya Nair",  time: "2h ago" },
                { action: "Created",    name: "Finance Analytics",  user: "Kavya Iyer",  time: "5h ago" },
                { action: "Shared",     name: "CEO Executive View", user: "Raj Kumar",   time: "1d ago" },
                { action: "Edited",     name: "Manager Team Board", user: "Arun Sharma", time: "2d ago" },
              ].map((a, i) => (
                <Group key={i} justify="space-between">
                  <Group gap="xs">
                    <Badge size="xs" variant="dot" color={a.action==="Published"?"green":a.action==="Created"?"blue":"orange"}>{a.action}</Badge>
                    <Text size="xs">{a.name}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">{a.time}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ── 2. Dashboard Library ──────────────────────────────────────────────────────
function DashboardLibraryTab({ onCreate }) {
  const { show } = useToast();
  const [search, setSearch]     = useState("");
  const [role, setRole]         = useState("");
  const [status, setStatus]     = useState("");
  const [viewDash, setViewDash] = useState(null);
  const { data: rawDash = [] } = useDashboards({ role: role || undefined, status: status || undefined, search: search || undefined });
  const dashboards = rawDash.length ? rawDash : MOCK_DASHBOARDS;
  const deleteMut    = useDeleteDashboard();
  const publishMut   = usePublishDashboard();
  const archiveMut   = useArchiveDashboard();
  const duplicateMut = useDuplicateDashboard();

  const filtered = dashboards.filter(d => {
    const q = search.toLowerCase();
    return (!q || d.name.toLowerCase().includes(q) || (d.createdBy||"").toLowerCase().includes(q))
      && (!role   || d.role === role)
      && (!status || d.status === status);
  });

  const toggleStar = () => {};

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <TextInput placeholder="Search dashboards…" leftSection={<IconSearch size={14} />}
            value={search} onChange={e => setSearch(e.currentTarget.value)} w={220} radius="md" />
          <Select placeholder="Role" data={ROLES} value={role} onChange={setRole} clearable w={150} radius="md" />
          <Select placeholder="Status" data={["Published","Draft","Archived"]} value={status} onChange={setStatus} clearable w={130} radius="md" />
        </Group>
        <Button leftSection={<IconPlus size={14} />} onClick={onCreate}>New Dashboard</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th>Dashboard Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Widgets</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created By</Table.Th>
                <Table.Th>Last Updated</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(d => (
                <Table.Tr key={d.id}>
                  <Table.Td>
                    <ActionIcon size="sm" variant="subtle" color={d.starred?"yellow":"gray"} onClick={() => toggleStar(d.id)}>
                      {d.starred ? <IconStarFilled size={13} /> : <IconStar size={13} />}
                    </ActionIcon>
                  </Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{d.name}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="blue">{d.role}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{d.dept}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="outline">{d.widgets} widgets</Badge></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[d.status]} variant="light">{d.status}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{d.createdBy}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{d.updatedAt}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewDash(d)}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" loading={duplicateMut.isPending} onClick={() => duplicateMut.mutate(d.id, { onSuccess: () => show(`"${d.name}" duplicated`, "success"), onError: () => show("Duplicate failed","error") })}><IconCopy size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" loading={publishMut.isPending} onClick={() => publishMut.mutate(d.id, { onSuccess: () => show(`"${d.name}" published`, "success"), onError: () => show("Publish failed","error") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Share"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => show("Share link copied", "info")}><IconShare size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" loading={archiveMut.isPending} onClick={() => archiveMut.mutate(d.id, { onSuccess: () => show(`"${d.name}" archived`, "info"), onError: () => show("Archive failed","error") })}><IconArchive size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(d.id, { onSuccess: () => show(`"${d.name}" deleted`, "error"), onError: () => show("Delete failed","error") })}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {filtered.length === 0 && <AppEmptyState icon={<IconLayoutDashboard size={22} />} message="No dashboards found" sub="Try adjusting your filters or create a new dashboard." py={40} />}
      </Paper>

      <Modal opened={!!viewDash} onClose={() => setViewDash(null)} title="Dashboard Details" size="md" radius="lg">
        {viewDash && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Name</Text><Text fw={700}>{viewDash.name}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Role</Text><Badge variant="light" color="blue">{viewDash.role}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Department</Text><Text>{viewDash.dept}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Widgets</Text><Badge variant="outline">{viewDash.widgets}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color={STATUS_COLOR[viewDash.status]} variant="light">{viewDash.status}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Created By</Text><Text>{viewDash.createdBy}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Last Updated</Text><Text>{viewDash.updatedAt}</Text></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 3. Create Dashboard (8-step Stepper) ─────────────────────────────────────
function CreateDashboardTab() {
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState("2col");
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [configWidget, setConfigWidget] = useState(null);
  const [preview, setPreview] = useState("desktop");
  const [form, setForm] = useState({
    name: "", description: "", category: "", department: "", role: "",
    icon: "", color: "blue", visibility: "All",
  });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const toggleWidget = (wid) => setSelectedWidgets(prev =>
    prev.includes(wid) ? prev.filter(x => x !== wid) : [...prev, wid]
  );

  const STEPS = [
    "Basic Info", "Layout", "Widgets", "Configure",
    "Drag & Drop", "Permissions", "Preview", "Publish",
  ];

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 2) return selectedWidgets.length > 0;
    return true;
  };

  const handlePublish = () => {
    show(`"${form.name || "Dashboard"}" published successfully`, "success");
    setStep(0);
    setForm({ name:"",description:"",category:"",department:"",role:"",icon:"",color:"blue",visibility:"All" });
    setSelectedWidgets([]);
  };

  return (
    <Stack gap="md">
      <Stepper active={step} onStepClick={setStep} size="sm" mb="md" breakpoint="sm">
        {STEPS.map((s, i) => <Stepper.Step key={i} label={s} />)}
      </Stepper>

      {/* Step 0: Basic Information */}
      {step === 0 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="lg">Basic Information</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <TextInput label="Dashboard Name *" placeholder="e.g. HR Operations HQ" value={form.name} onChange={e => f("name")(e.target.value)} radius="md" />
                <Textarea label="Description" placeholder="What this dashboard shows…" value={form.description} onChange={e => f("description")(e.target.value)} minRows={3} radius="md" />
                <Select label="Category" data={CATEGORIES} value={form.category} onChange={f("category")} radius="md" />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Select label="Department" data={DEPTS} value={form.department} onChange={f("department")} radius="md" />
                <Select label="Role" data={ROLES} value={form.role} onChange={f("role")} radius="md" />
                <Group grow gap="sm">
                  <Select label="Visibility" data={["All","Role-specific","Private"]} value={form.visibility} onChange={f("visibility")} radius="md" />
                  <Select label="Icon" data={["🏠","📊","📈","👥","⚡","🎯","💰","📋"]} value={form.icon} onChange={f("icon")} radius="md" />
                </Group>
                <Group grow gap="sm">
                  <Select label="Color Theme" data={COLORS_OPT} value={form.color} onChange={f("color")} radius="md" />
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {/* Step 1: Layout Selection */}
      {step === 1 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Layout Selection</Text>
          <Text c="dimmed" size="sm" mb="lg">Choose a starting layout. You can customise it in the drag-and-drop step.</Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {LAYOUTS.map(l => (
              <Paper key={l.id} withBorder p="md" radius="lg" onClick={() => setSelectedLayout(l.id)}
                style={{ cursor:"pointer", border: selectedLayout === l.id ? "2px solid var(--mantine-color-blue-5)" : undefined, background: selectedLayout === l.id ? "var(--mantine-color-blue-0)" : undefined }}>
                <Group gap="xs" mb={6}>
                  <ThemeIcon size={28} radius={6} variant="light" color={selectedLayout===l.id?"blue":"gray"}><IconLayoutGrid size={14} /></ThemeIcon>
                  {selectedLayout === l.id && <Badge size="xs" color="blue">Selected</Badge>}
                </Group>
                <Text size="sm" fw={600}>{l.label}</Text>
                <Text size="xs" c="dimmed" mt={2}>{l.desc}</Text>
                {/* Mini preview */}
                <Group mt="sm" gap={4} wrap="wrap" p={6} style={{ background:"var(--mantine-color-gray-1)", borderRadius:6 }}>
                  {Array.from({ length: l.id === "1col" ? 1 : l.id === "2col" ? 2 : l.id === "3col" ? 3 : 4 }, (_, i) => (
                    <Box key={i} style={{ flex:1, minWidth:10, height:18, background:"var(--mantine-color-gray-3)", borderRadius:3 }} />
                  ))}
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Step 2: Widget Library */}
      {step === 2 && (
        <Paper withBorder p="xl" radius="lg">
          <Group justify="space-between" mb="lg">
            <Stack gap={2}>
              <Text fw={700} size="lg">Widget Library</Text>
              <Text c="dimmed" size="sm">Click widgets to add them to your dashboard</Text>
            </Stack>
            <Badge size="md" variant="light" color="blue">{selectedWidgets.length} selected</Badge>
          </Group>
          <Stack gap="md">
            {Object.entries(WIDGET_CATEGORIES).map(([cat, widgets]) => (
              <Stack key={cat} gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>{cat}</Text>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                  {widgets.map(w => {
                    const Icon = w.icon;
                    const sel = selectedWidgets.includes(w.id);
                    return (
                      <Paper key={w.id} withBorder p="sm" radius="md" onClick={() => toggleWidget(w.id)}
                        style={{ cursor:"pointer", border: sel ? "1.5px solid var(--mantine-color-blue-5)" : undefined, background: sel ? "var(--mantine-color-blue-0)" : undefined }}>
                        <Group gap="xs">
                          <ThemeIcon size={24} radius={6} variant="light" color={sel?"blue":"gray"}><Icon size={12} /></ThemeIcon>
                          <Text size="xs" fw={sel?600:400}>{w.name}</Text>
                          {sel && <IconCheck size={12} color="var(--mantine-color-blue-5)" style={{ marginLeft:"auto" }} />}
                        </Group>
                      </Paper>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Step 3: Widget Configuration */}
      {step === 3 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Widget Configuration</Text>
          <Text c="dimmed" size="sm" mb="lg">Configure each selected widget. Click a widget on the left to edit its settings.</Text>
          {selectedWidgets.length === 0 ? (
            <AppEmptyState icon={<IconGrid3x3 size={22} />} message="No widgets selected" sub="Go back to Step 3 and pick some widgets." py={40} />
          ) : (
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="xs">
                  {selectedWidgets.map(wid => {
                    const w = Object.values(WIDGET_CATEGORIES).flat().find(x => x.id === wid);
                    if (!w) return null;
                    const Icon = w.icon;
                    return (
                      <Paper key={wid} withBorder p="sm" radius="md" onClick={() => setConfigWidget(wid)}
                        style={{ cursor:"pointer", background: configWidget===wid?"var(--mantine-color-blue-0)":undefined, border: configWidget===wid?"1.5px solid var(--mantine-color-blue-5)":undefined }}>
                        <Group gap="xs">
                          <ThemeIcon size={26} radius={6} variant="light" color="blue"><Icon size={13} /></ThemeIcon>
                          <Text size="sm" fw={500}>{w.name}</Text>
                          <IconChevronRight size={13} style={{ marginLeft:"auto" }} color="var(--mantine-color-dimmed)" />
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 8 }}>
                {configWidget ? (() => {
                  const w = Object.values(WIDGET_CATEGORIES).flat().find(x => x.id === configWidget);
                  return w ? (
                    <Paper withBorder p="lg" radius="lg">
                      <Text fw={600} mb="md">Configure: {w.name}</Text>
                      <Stack gap="sm">
                        <TextInput label="Widget Title" defaultValue={w.name} radius="md" />
                        <Select label="Data Source" data={["Live API","Mock Data","Static"]} defaultValue="Live API" radius="md" />
                        <Group grow gap="sm">
                          <Select label="Date Range" data={["Today","This Week","This Month","This Quarter","This Year","Custom"]} defaultValue="This Month" radius="md" />
                          <Select label="Refresh Interval" data={FREQ} defaultValue="Every 5min" radius="md" />
                        </Group>
                        <Select label="Color Theme" data={COLORS_OPT} defaultValue="blue" radius="md" />
                        <Group grow gap="sm">
                          <Select label="Visibility" data={["All","Managers+","HR+","Admin Only"]} defaultValue="All" radius="md" />
                          <Switch label="Export Option" defaultChecked mt={22} />
                        </Group>
                        <Textarea label="Filters" placeholder="e.g. department=Engineering" radius="md" minRows={2} />
                      </Stack>
                    </Paper>
                  ) : null;
                })() : (
                  <Center h={200}><Text c="dimmed" size="sm">Select a widget on the left to configure it</Text></Center>
                )}
              </Grid.Col>
            </Grid>
          )}
        </Paper>
      )}

      {/* Step 4: Drag & Drop Layout */}
      {step === 4 && (
        <Paper withBorder p="xl" radius="lg">
          <Group justify="space-between" mb="lg">
            <Stack gap={2}>
              <Text fw={700} size="lg">Drag & Drop Layout</Text>
              <Text c="dimmed" size="sm">Arrange widgets by dragging. Click ⊞ to resize, ✕ to remove.</Text>
            </Stack>
            <Badge variant="light" color="blue">{selectedWidgets.length} widgets</Badge>
          </Group>
          {selectedWidgets.length === 0 ? (
            <AppEmptyState icon={<IconDragDrop size={22} />} message="No widgets to arrange" sub="Add widgets in Step 3 first." py={40} />
          ) : (
            <Box style={{ background:"var(--mantine-color-gray-0)", borderRadius:12, border:"2px dashed var(--mantine-color-gray-3)", padding:16, minHeight:260 }}>
              <SimpleGrid cols={{ base: 1, sm: 2, md: selectedLayout === "1col" ? 1 : selectedLayout === "3col" ? 3 : selectedLayout === "4col" ? 4 : 2 }} spacing="sm">
                {selectedWidgets.map(wid => {
                  const w = Object.values(WIDGET_CATEGORIES).flat().find(x => x.id === wid);
                  if (!w) return null;
                  const Icon = w.icon;
                  return (
                    <Paper key={wid} withBorder p="md" radius="md" style={{ cursor:"grab", minHeight:80 }}>
                      <Group justify="space-between" mb={6}>
                        <Group gap="xs">
                          <ThemeIcon size={22} radius={6} variant="light" color="blue"><Icon size={11} /></ThemeIcon>
                          <Text size="xs" fw={500}>{w.name}</Text>
                        </Group>
                        <Group gap={2}>
                          <ActionIcon size="xs" variant="subtle"><IconDragDrop size={11} /></ActionIcon>
                          <ActionIcon size="xs" variant="subtle" color="red"><IconTrash size={11} /></ActionIcon>
                        </Group>
                      </Group>
                      <Box style={{ height:36, background:"var(--mantine-color-gray-1)", borderRadius:6 }} />
                    </Paper>
                  );
                })}
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="sm" ta="center">Drag widgets to rearrange · Resize handles appear on hover</Text>
            </Box>
          )}
        </Paper>
      )}

      {/* Step 5: Permissions */}
      {step === 5 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Permissions</Text>
          <Text c="dimmed" size="sm" mb="lg">Control who can view or edit this dashboard.</Text>
          <Stack gap="md">
            {[
              { role: "Platform Owner", perm: "Full Access",     color: "violet" },
              { role: "Super Admin",    perm: "Full Access",     color: "violet" },
              { role: "Admin",          perm: "Create & Manage", color: "blue"   },
              { role: "HR",             perm: "View & Edit",     color: "teal"   },
              { role: "Manager",        perm: "View Only",       color: "green"  },
              { role: "Employee",       perm: "Personal Only",   color: "gray"   },
            ].map(r => (
              <Paper key={r.role} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size={26} radius={6} variant="light" color={r.color}><IconUsers size={13} /></ThemeIcon>
                    <Text size="sm" fw={500}>{r.role}</Text>
                  </Group>
                  <Group gap="sm">
                    <Badge size="sm" variant="light" color={r.color}>{r.perm}</Badge>
                    <Select size="xs" data={["Full Access","Create & Manage","View & Edit","View Only","No Access"]} defaultValue={r.perm} radius="md" w={150} />
                  </Group>
                </Group>
              </Paper>
            ))}
            <Divider label="Advanced" labelPosition="center" />
            <Group grow gap="sm">
              <MultiSelect label="Department Access" data={DEPTS} radius="md" placeholder="Select departments" />
              <MultiSelect label="Location Access" data={["All","Mumbai","Delhi","Bangalore","Chennai","Hyderabad"]} radius="md" placeholder="Select locations" />
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Step 6: Preview */}
      {step === 6 && (
        <Paper withBorder p="xl" radius="lg">
          <Group justify="space-between" mb="lg">
            <Stack gap={2}>
              <Text fw={700} size="lg">Preview</Text>
              <Text c="dimmed" size="sm">See how your dashboard looks across devices.</Text>
            </Stack>
            <SegmentedControl
              value={preview}
              onChange={setPreview}
              data={[
                { label: <Group gap={4}><IconDeviceDesktop size={14} /><Text size="sm">Desktop</Text></Group>, value: "desktop" },
                { label: <Group gap={4}><IconDeviceTablet size={14} /><Text size="sm">Tablet</Text></Group>,  value: "tablet"  },
                { label: <Group gap={4}><IconDeviceMobile size={14} /><Text size="sm">Mobile</Text></Group>,  value: "mobile"  },
              ]}
            />
          </Group>
          <Box style={{
            maxWidth: preview === "desktop" ? "100%" : preview === "tablet" ? 640 : 375,
            margin: "0 auto",
            border: "2px solid var(--mantine-color-gray-3)",
            borderRadius: preview === "mobile" ? 24 : 12,
            overflow: "hidden",
          }}>
            <Box style={{ background:"var(--mantine-color-gray-0)", padding:"8px 16px", borderBottom:"1px solid var(--mantine-color-gray-2)" }}>
              <Group gap="xs">
                <Box w={10} h={10} style={{ borderRadius:"50%", background:"#f87171" }} />
                <Box w={10} h={10} style={{ borderRadius:"50%", background:"#fbbf24" }} />
                <Box w={10} h={10} style={{ borderRadius:"50%", background:"#4ade80" }} />
                <Text size="xs" c="dimmed" ml="auto">{form.name || "Preview Dashboard"}</Text>
              </Group>
            </Box>
            <Box p="md">
              <SimpleGrid cols={preview === "mobile" ? 1 : preview === "tablet" ? 2 : (selectedLayout === "1col" ? 1 : selectedLayout === "3col" ? 3 : selectedLayout === "4col" ? 4 : 2)} spacing="xs">
                {(selectedWidgets.length > 0 ? selectedWidgets : ["emp-count","att-summary","leave-bal","payroll-sum"]).slice(0, preview==="mobile"?4:8).map(wid => {
                  const w = Object.values(WIDGET_CATEGORIES).flat().find(x => x.id === wid);
                  const label = w ? w.name : wid;
                  return (
                    <Paper key={wid} withBorder p="xs" radius="md">
                      <Text size="xs" c="dimmed" mb={4}>{label}</Text>
                      <Box style={{ height:36, background:`var(--mantine-color-${form.color||"blue"}-1)`, borderRadius:6 }} />
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 7: Publish */}
      {step === 7 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Publish Dashboard</Text>
          <Text c="dimmed" size="sm" mb="lg">Review and publish your dashboard.</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                {[
                  ["Name",        form.name       || "—"],
                  ["Role",        form.role       || "All"],
                  ["Department",  form.department || "All"],
                  ["Category",    form.category   || "—"],
                  ["Layout",      LAYOUTS.find(l=>l.id===selectedLayout)?.label || selectedLayout],
                  ["Widgets",     `${selectedWidgets.length} selected`],
                  ["Visibility",  form.visibility || "All"],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" py="xs"
                    style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                    <Text size="sm" c="dimmed">{k}</Text>
                    <Text size="sm" fw={500}>{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-green-0)"
                  style={{ border:"1.5px solid var(--mantine-color-green-3)" }}>
                  <Group gap="xs" mb={6}><IconCheck size={16} color="var(--mantine-color-green-6)" /><Text size="sm" fw={600} c="green">Ready to Publish</Text></Group>
                  <Text size="xs" c="dimmed">All required fields are complete. Your dashboard will be immediately visible to the assigned role.</Text>
                </Paper>
                <Button fullWidth size="md" leftSection={<IconRocket size={16} />} color="green" onClick={handlePublish}>Publish Dashboard</Button>
                <Button fullWidth variant="outline" onClick={() => show("Draft saved", "info")}>Save as Draft</Button>
                <Button fullWidth variant="default">Duplicate</Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      <Group justify="space-between" mt="md">
        <Button variant="default" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
        {step < 7
          ? <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Next</Button>
          : null
        }
      </Group>
    </Stack>
  );
}

// ── 4. Widget Library ─────────────────────────────────────────────────────────
function WidgetLibraryTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const allCats = ["All", ...Object.keys(WIDGET_CATEGORIES)];
  const allWidgets = Object.entries(WIDGET_CATEGORIES).flatMap(([c, ws]) => ws.map(w => ({ ...w, cat: c })));
  const filtered = allWidgets.filter(w =>
    (cat === "All" || w.cat === cat) &&
    (!search || w.name.toLowerCase().includes(search.toLowerCase()))
  );

  const TYPE_COLOR = { kpi:"blue", chart:"violet", ring:"teal", list:"green", progress:"orange", table:"gray", gauge:"red", calendar:"cyan", ai:"pink" };

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search widgets…" leftSection={<IconSearch size={14} />}
          value={search} onChange={e => setSearch(e.currentTarget.value)} w={220} radius="md" />
        <SegmentedControl
          value={cat}
          onChange={setCat}
          data={allCats.map(c => ({ label: c, value: c }))}
          size="xs"
          style={{ flexWrap: "wrap" }}
        />
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
        {filtered.map(w => {
          const Icon = w.icon;
          return (
            <Paper key={`${w.cat}-${w.id}`} withBorder p="md" radius="md" style={{ cursor:"pointer" }}
              onClick={() => show(`"${w.name}" added to clipboard`, "info")}>
              <Stack gap="xs" align="center">
                <ThemeIcon size={40} radius={10} variant="light" color={TYPE_COLOR[w.type] || "blue"}><Icon size={20} /></ThemeIcon>
                <Text size="xs" fw={600} ta="center">{w.name}</Text>
                <Badge size="xs" variant="dot" color={TYPE_COLOR[w.type] || "gray"}>{w.type}</Badge>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      {filtered.length === 0 && <AppEmptyState icon={<IconGrid3x3 size={22} />} message="No widgets found" sub="Try a different category or search term." py={40} />}
    </Stack>
  );
}

// ── 5. My Dashboards ──────────────────────────────────────────────────────────
function MyDashboardsTab() {
  const { show } = useToast();
  const { data: rawDash = [] } = useDashboards();
  const all     = rawDash.length ? rawDash : MOCK_DASHBOARDS;
  const starred = all.filter(d => d.starred);
  const recent  = [...all].sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||"")).slice(0,4);
  const drafts  = all.filter(d => d.status === "Draft");
  const pinned  = all.slice(0, 2);

  const DashCard = ({ d }) => (
    <Paper withBorder p="md" radius="lg">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <ThemeIcon size={28} radius={8} variant="light" color="blue"><IconLayoutDashboard size={14} /></ThemeIcon>
          <Text size="sm" fw={600}>{d.name}</Text>
        </Group>
        <Badge size="xs" color={STATUS_COLOR[d.status]} variant="light">{d.status}</Badge>
      </Group>
      <Group gap="xs" mb="xs">
        <Badge size="xs" variant="outline">{d.role}</Badge>
        <Badge size="xs" variant="outline">{d.widgets} widgets</Badge>
      </Group>
      <Group gap="xs" mt="sm">
        <Button size="xs" variant="light" leftSection={<IconEye size={11} />} onClick={() => show(`Opening "${d.name}"…`, "info")}>Open</Button>
        <Button size="xs" variant="default" leftSection={<IconPencil size={11} />}>Edit</Button>
      </Group>
    </Paper>
  );

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Group gap="xs"><IconStarFilled size={16} color="var(--mantine-color-yellow-5)" /><Text fw={600}>Favorites</Text></Group>
        {starred.length === 0
          ? <AppEmptyState icon={<IconStar size={20} />} message="No favorites yet" sub="Star a dashboard from the Library." py={30} />
          : <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">{starred.map(d => <DashCard key={d.id} d={d} />)}</SimpleGrid>}
      </Stack>
      <Divider />
      <Stack gap="sm">
        <Group gap="xs"><IconClock size={16} /><Text fw={600}>Recently Opened</Text></Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">{recent.map(d => <DashCard key={d.id} d={d} />)}</SimpleGrid>
      </Stack>
      <Divider />
      <Stack gap="sm">
        <Group gap="xs"><IconBookmark size={16} /><Text fw={600}>Pinned</Text></Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">{pinned.map(d => <DashCard key={d.id} d={d} />)}</SimpleGrid>
      </Stack>
      {drafts.length > 0 && (
        <>
          <Divider />
          <Stack gap="sm">
            <Group gap="xs"><IconPencil size={16} /><Text fw={600}>Drafts</Text></Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">{drafts.map(d => <DashCard key={d.id} d={d} />)}</SimpleGrid>
          </Stack>
        </>
      )}
    </Stack>
  );
}

// ── 6. Shared Dashboards ──────────────────────────────────────────────────────
function SharedDashboardsTab() {
  const { show } = useToast();
  const [viewShared, setViewShared] = useState(null);
  const { data: rawShared = [] } = useSharedDashboards();
  const shared   = rawShared.length ? rawShared : MOCK_SHARED;
  const unshareMut = useUnshare();

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Dashboard</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Shared With</Table.Th>
              <Table.Th>Permission</Table.Th>
              <Table.Th>Last Updated</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shared.map(s => (
              <Table.Tr key={s.id}>
                <Table.Td><Text size="sm" fw={500}>{s.name}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{s.owner}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="teal">{s.sharedWith}</Badge></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color={PERM_COLOR[s.permission]}>{s.permission}</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{s.updatedAt}</Text></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewShared(s)}><IconEye size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Copy link"><ActionIcon size="sm" variant="subtle" onClick={() => show("Share link copied", "info")}><IconShare size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Remove"><ActionIcon size="sm" variant="subtle" color="red" loading={unshareMut.isPending} onClick={() => unshareMut.mutate(s.id, { onSuccess: () => show("Removed share", "info"), onError: () => show("Remove failed","error") })}><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={!!viewShared} onClose={() => setViewShared(null)} title="Shared Dashboard" size="md" radius="lg">
        {viewShared && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Name</Text><Text fw={600}>{viewShared.name}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Owner</Text><Text>{viewShared.owner}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Shared With</Text><Badge variant="light" color="teal">{viewShared.sharedWith}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Permission</Text><Badge variant="light" color={PERM_COLOR[viewShared.permission]}>{viewShared.permission}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Last Updated</Text><Text>{viewShared.updatedAt}</Text></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 7. Dashboard Templates ────────────────────────────────────────────────────
function DashboardTemplatesTab({ onUseTemplate }) {
  const { show } = useToast();
  const [viewTpl, setViewTpl] = useState(null);

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">Start from a pre-built template to save time. All templates are fully customisable.</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <Paper key={t.id} withBorder p="lg" radius="lg">
              <ThemeIcon size={44} radius={12} variant="light" color={t.color} mb="md"><Icon size={22} /></ThemeIcon>
              <Text fw={700} mb={4}>{t.name}</Text>
              <Group gap={4} mb="sm" style={{ flexWrap:"wrap" }}>
                {t.tags.map(tag => <Badge key={tag} size="xs" variant="outline">{tag}</Badge>)}
              </Group>
              <Text size="xs" c="dimmed" mb="md">{t.widgets} pre-configured widgets</Text>
              <Group gap="xs">
                <Button size="xs" variant="light" leftSection={<IconEye size={11} />} onClick={() => setViewTpl(t)}>Preview</Button>
                <Button size="xs" color={t.color} leftSection={<IconPlus size={11} />} onClick={() => { onUseTemplate?.(); show(`"${t.name}" loaded in Create Dashboard`, "success"); }}>Use</Button>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Modal opened={!!viewTpl} onClose={() => setViewTpl(null)} title={`Template: ${viewTpl?.name || ""}`} size="md" radius="lg">
        {viewTpl && (
          <Stack gap="sm">
            <Group gap="xs" mb="xs">
              {viewTpl.tags.map(t => <Badge key={t} variant="light" size="sm">{t}</Badge>)}
            </Group>
            <Text size="sm" c="dimmed">{viewTpl.widgets} pre-configured widgets included in this template.</Text>
            <Divider />
            {[
              "KPI Summary Cards", "Attendance Overview", "Leave Balance Ring",
              "Recruitment Funnel", "Performance Ratings", "Learning Progress",
            ].slice(0, viewTpl.widgets > 6 ? 6 : viewTpl.widgets).map((w, i) => (
              <Group key={i} gap="xs"><IconCheck size={13} color="var(--mantine-color-green-6)" /><Text size="sm">{w}</Text></Group>
            ))}
            <Button fullWidth mt="sm" onClick={() => { setViewTpl(null); show(`"${viewTpl.name}" loaded`, "success"); }}>Use This Template</Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 8. Analytics Widgets ──────────────────────────────────────────────────────
function AnalyticsWidgetsTab() {
  const { show } = useToast();
  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">Explore advanced analytics widgets. These widgets connect to live data sources and support drill-down.</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {[
          { name: "Bar Chart",       icon: IconChartBar,    color: "blue",   desc: "Compare values across categories. Supports stacked & grouped." },
          { name: "Line Chart",      icon: IconChartLine,   color: "teal",   desc: "Track trends over time. Supports multiple series." },
          { name: "Pie Chart",       icon: IconChartPie,    color: "violet", desc: "Show proportional breakdown. Click segments to drill down." },
          { name: "Donut Chart",     icon: IconChartDonut,  color: "pink",   desc: "Pie variant with centre label. Supports ring fill animation." },
          { name: "Area Chart",      icon: IconTrendingUp,  color: "green",  desc: "Line chart with filled area. Great for cumulative data." },
          { name: "Heat Map",        icon: IconGridDots,    color: "orange", desc: "Colour-coded matrix. Ideal for attendance or performance grids." },
          { name: "Gauge",           icon: IconGauge,       color: "red",    desc: "Semicircular dial for single KPI against a target." },
          { name: "Table Widget",    icon: IconTable,       color: "gray",   desc: "Tabular data with sorting, filtering and pagination." },
          { name: "Calendar Widget", icon: IconCalendar,    color: "cyan",   desc: "Monthly/weekly calendar showing events, leaves, holidays." },
        ].map(w => {
          const Icon = w.icon;
          return (
            <Paper key={w.name} withBorder p="lg" radius="lg">
              <ThemeIcon size={40} radius={10} variant="light" color={w.color} mb="sm"><Icon size={20} /></ThemeIcon>
              <Text fw={700} mb={4}>{w.name}</Text>
              <Text size="xs" c="dimmed" mb="md">{w.desc}</Text>
              <Button size="xs" variant="light" leftSection={<IconPlus size={11} />} onClick={() => show(`"${w.name}" added to dashboard`, "info")}>Add Widget</Button>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

// ── 9. Dashboard Settings ─────────────────────────────────────────────────────
function DashboardSettingsTab() {
  const { show } = useToast();
  const { data: rawDash = [] } = useDashboards();
  const dashNames = (rawDash.length ? rawDash : MOCK_DASHBOARDS).map(d => d.name);
  const [settings, setSettings] = useState({
    defaultDash: "HR Operations HQ",
    autoRefresh: "Every 5min",
    theme: "System",
    gridSize: "Medium",
    defaultLayout: "2col",
    exportFormat: "PDF",
    showWelcome: true,
    compactMode: false,
    animations: true,
  });
  const s = k => v => setSettings(p => ({ ...p, [k]: v }));

  return (
    <Stack gap="md" maw={640}>
      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Dashboard Defaults</Text>
        <Stack gap="sm">
          <Select label="Default Dashboard" data={dashNames} value={settings.defaultDash} onChange={s("defaultDash")} radius="md" />
          <Select label="Auto Refresh" data={FREQ} value={settings.autoRefresh} onChange={s("autoRefresh")} radius="md" />
          <Select label="Default Layout" data={LAYOUTS.map(l => l.label)} value={LAYOUTS.find(l=>l.id===settings.defaultLayout)?.label} radius="md" />
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Appearance</Text>
        <Stack gap="sm">
          <Select label="Theme" data={["System","Light","Dark","High Contrast"]} value={settings.theme} onChange={s("theme")} radius="md" />
          <Select label="Grid Size" data={["Small","Medium","Large","Auto"]} value={settings.gridSize} onChange={s("gridSize")} radius="md" />
          <Group justify="space-between"><Text size="sm">Show Welcome Banner</Text><Switch checked={settings.showWelcome} onChange={e => s("showWelcome")(e.currentTarget.checked)} /></Group>
          <Group justify="space-between"><Text size="sm">Compact Mode</Text><Switch checked={settings.compactMode} onChange={e => s("compactMode")(e.currentTarget.checked)} /></Group>
          <Group justify="space-between"><Text size="sm">Widget Animations</Text><Switch checked={settings.animations} onChange={e => s("animations")(e.currentTarget.checked)} /></Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Export Settings</Text>
        <Stack gap="sm">
          <Select label="Default Export Format" data={["PDF","PNG","CSV","Excel","PowerPoint"]} value={settings.exportFormat} onChange={s("exportFormat")} radius="md" />
          <Group justify="space-between"><Text size="sm">Include Headers in Export</Text><Switch defaultChecked /></Group>
          <Group justify="space-between"><Text size="sm">Include Timestamps</Text><Switch defaultChecked /></Group>
        </Stack>
      </Paper>

      <Button w={160} onClick={() => show("Settings saved", "success")}>Save Settings</Button>
    </Stack>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function DashboardBuilder({ darkMode }) {
  const [tab, setTab] = useState("home");

  const goCreate = () => setTab("create");

  return (
    <Box>
      <AppPageHeader
        title="Dashboard Builder"
        sub="Design, configure, and publish role-based dashboards with drag-and-drop ease"
        action={<Button leftSection={<IconPlus size={14} />} onClick={goCreate}>New Dashboard</Button>}
      />

      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List mb="md" style={{ flexWrap: "wrap" }}>
          <Tabs.Tab value="home"       leftSection={<IconLayoutDashboard size={14} />}>Home</Tabs.Tab>
          <Tabs.Tab value="library"    leftSection={<IconList size={14} />}>Library</Tabs.Tab>
          <Tabs.Tab value="create"     leftSection={<IconPlus size={14} />}>Create Dashboard</Tabs.Tab>
          <Tabs.Tab value="widgets"    leftSection={<IconGrid3x3 size={14} />}>Widget Library</Tabs.Tab>
          <Tabs.Tab value="mine"       leftSection={<IconBookmark size={14} />}>My Dashboards</Tabs.Tab>
          <Tabs.Tab value="shared"     leftSection={<IconShare size={14} />}>Shared</Tabs.Tab>
          <Tabs.Tab value="templates"  leftSection={<IconTemplate size={14} />}>Templates</Tabs.Tab>
          <Tabs.Tab value="analytics"  leftSection={<IconChartBar size={14} />}>Analytics Widgets</Tabs.Tab>
          <Tabs.Tab value="settings"   leftSection={<IconSettings size={14} />}>Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="home">     <DashboardHomeTab onNav={setTab} /></Tabs.Panel>
        <Tabs.Panel value="library">  <DashboardLibraryTab onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="create">   <CreateDashboardTab /></Tabs.Panel>
        <Tabs.Panel value="widgets">  <WidgetLibraryTab /></Tabs.Panel>
        <Tabs.Panel value="mine">     <MyDashboardsTab /></Tabs.Panel>
        <Tabs.Panel value="shared">   <SharedDashboardsTab /></Tabs.Panel>
        <Tabs.Panel value="templates"><DashboardTemplatesTab onUseTemplate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="analytics"><AnalyticsWidgetsTab /></Tabs.Panel>
        <Tabs.Panel value="settings"> <DashboardSettingsTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
