import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  Paper, Grid, ThemeIcon, ScrollArea, Divider, Switch,
  Stepper, SegmentedControl, Progress, NumberInput, MultiSelect,
} from "@mantine/core";
import {
  IconSitemap, IconPlus, IconSearch, IconPencil, IconTrash, IconEye,
  IconCopy, IconRocket, IconDownload, IconArchive, IconX, IconCheck,
  IconChartBar, IconChartLine, IconClock, IconAlertCircle, IconBell,
  IconMail, IconMessage, IconArrowRight, IconGitBranch, IconCircleCheck,
  IconPlayerPlay, IconPlayerStop, IconRefresh, IconHistory,
  IconUsers, IconShieldCheck, IconTemplate, IconSettings,
  IconArrowUpRight, IconArrowDownRight, IconFilter, IconBolt,
  IconApi, IconFileText, IconCalendar, IconFlag, IconTag,
  IconCircleDot, IconDiamond, IconHexagon, IconSquare, IconOctagon,
  IconList, IconBookmark, IconStarFilled, IconStar,
  IconClipboard, IconDragDrop, IconMaximize, IconMinus,
  IconArrowsMove, IconGridDots, IconZoomIn, IconZoomOut,
  IconInfoCircle, IconChevronRight,
} from "@tabler/icons-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useWFDashboard, useWorkflows, useWFHistory,
  useCreateWF, useUpdateWF, useDeleteWF, usePublishWF, useDuplicateWF,
} from "../../queries/useWorkflowBuilder";

// ── Mock data ────────────────────────────────────────────────────────────────

const MODULES = ["Leave","Attendance","Expense","Travel","Asset","Recruitment","Onboarding","Exit","Payroll","Document","Compliance","Custom Form"];
const CATEGORIES = ["Approval","Automation","Notification","Onboarding","Offboarding","Custom"];
const STATUSES = ["Active","Draft","Inactive","Archived"];
const STATUS_COLOR = { Active:"green", Draft:"orange", Inactive:"gray", Archived:"dimmed" };

const MOCK_WORKFLOWS = [
  { id: 1, name: "Leave Approval — 2 Level",     module: "Leave",       trigger: "Leave Applied",          version: "v2.1", status: "Active",   createdBy: "Priya Nair",   updatedAt: "2026-06-28", executions: 312, successRate: 96 },
  { id: 2, name: "Expense Claim Approval",        module: "Expense",     trigger: "Expense Submitted",      version: "v1.3", status: "Active",   createdBy: "Kavya Iyer",   updatedAt: "2026-06-25", executions: 187, successRate: 91 },
  { id: 3, name: "Asset Request Flow",            module: "Asset",       trigger: "Asset Requested",        version: "v1.0", status: "Active",   createdBy: "Dev Nair",     updatedAt: "2026-06-20", executions: 94,  successRate: 98 },
  { id: 4, name: "Recruitment Stage Automation",  module: "Recruitment", trigger: "Stage Changed",          version: "v3.0", status: "Active",   createdBy: "Meera Reddy",  updatedAt: "2026-06-18", executions: 241, successRate: 89 },
  { id: 5, name: "Onboarding Checklist Flow",     module: "Onboarding",  trigger: "Employee Created",       version: "v2.0", status: "Active",   createdBy: "Raj Kumar",    updatedAt: "2026-06-15", executions: 56,  successRate: 100 },
  { id: 6, name: "Travel Request Approval",       module: "Travel",      trigger: "Travel Request",         version: "v1.1", status: "Draft",    createdBy: "Arun Sharma",  updatedAt: "2026-06-12", executions: 0,   successRate: 0 },
  { id: 7, name: "Exit Clearance Workflow",       module: "Exit",        trigger: "Employee Updated",       version: "v1.0", status: "Draft",    createdBy: "Priya Nair",   updatedAt: "2026-06-10", executions: 0,   successRate: 0 },
  { id: 8, name: "Payroll Sign-off",              module: "Payroll",     trigger: "Payroll Generated",      version: "v1.2", status: "Inactive", createdBy: "Kavya Iyer",   updatedAt: "2026-06-01", executions: 48,  successRate: 94 },
];

const EXEC_TREND = [
  { day: "Mon", executions: 42, completed: 39, failed: 3 },
  { day: "Tue", executions: 58, completed: 55, failed: 3 },
  { day: "Wed", executions: 51, completed: 49, failed: 2 },
  { day: "Thu", executions: 67, completed: 63, failed: 4 },
  { day: "Fri", executions: 73, completed: 70, failed: 3 },
  { day: "Sat", executions: 22, completed: 22, failed: 0 },
  { day: "Sun", executions: 14, completed: 14, failed: 0 },
];

const APPROVAL_TREND = [
  { month: "Jan", rate: 88 }, { month: "Feb", rate: 91 }, { month: "Mar", rate: 87 },
  { month: "Apr", rate: 93 }, { month: "May", rate: 95 }, { month: "Jun", rate: 96 },
];

const MODULE_PIE = [
  { name: "Leave",       value: 35, color: "#228be6" },
  { name: "Expense",     value: 22, color: "#40c057" },
  { name: "Recruitment", value: 18, color: "#7950f2" },
  { name: "Asset",       value: 12, color: "#fab005" },
  { name: "Onboarding",  value: 8,  color: "#fa5252" },
  { name: "Other",       value: 5,  color: "#94a3b8" },
];

const MOCK_HISTORY = [
  { id: "WF-1041", workflow: "Leave Approval",     employee: "Asha Kumar",    started: "2026-06-28 09:15", completed: "2026-06-28 10:30", duration: "1h 15m", status: "Completed" },
  { id: "WF-1040", workflow: "Expense Claim",       employee: "Siva Raj",      started: "2026-06-28 08:00", completed: "2026-06-28 11:45", duration: "3h 45m", status: "Completed" },
  { id: "WF-1039", workflow: "Asset Request",        employee: "Meera Iyer",    started: "2026-06-27 14:20", completed: "—",                duration: "Ongoing",status: "Running" },
  { id: "WF-1038", workflow: "Leave Approval",       employee: "Dev Kumar",     started: "2026-06-27 11:00", completed: "—",                duration: "Pending",status: "Escalated" },
  { id: "WF-1037", workflow: "Recruitment Stage",    employee: "Raj Sharma",    started: "2026-06-27 09:30", completed: "2026-06-27 16:00", duration: "6h 30m", status: "Completed" },
  { id: "WF-1036", workflow: "Expense Claim",        employee: "Kavya Nair",    started: "2026-06-26 10:00", completed: "—",                duration: "—",      status: "Failed" },
];

const HIST_COLOR = { Completed:"green", Running:"blue", Escalated:"orange", Failed:"red" };

const APPROVAL_MATRIX = [
  { workflow: "Leave Approval",   level: 1, approver: "Reporting Manager", escalation: "After 2 days → HR",       status: "Active" },
  { workflow: "Leave Approval",   level: 2, approver: "HR Admin",          escalation: "After 3 days → Admin",    status: "Active" },
  { workflow: "Expense Approval", level: 1, approver: "Department Head",   escalation: "After 1 day → Finance",   status: "Active" },
  { workflow: "Expense Approval", level: 2, approver: "Finance Team",      escalation: "After 2 days → Admin",    status: "Active" },
  { workflow: "Asset Request",    level: 1, approver: "IT Admin",          escalation: "After 3 days → Super Admin",status: "Active"},
];

const TEMPLATES = [
  { id: 1, name: "Leave Approval",      icon: IconCalendar,    color: "blue",   nodes: 5,  desc: "2-level leave approval with HR escalation" },
  { id: 2, name: "Expense Approval",    icon: IconClipboard,   color: "green",  nodes: 6,  desc: "Manager + Finance dual-approval flow" },
  { id: 3, name: "Travel Approval",     icon: IconArrowRight,  color: "teal",   nodes: 4,  desc: "Manager approval with travel policy check" },
  { id: 4, name: "Asset Request",       icon: IconBookmark,    color: "orange", nodes: 5,  desc: "IT admin approval with availability check" },
  { id: 5, name: "Recruitment Stage",   icon: IconUsers,       color: "violet", nodes: 8,  desc: "Auto-advance pipeline stages with emails" },
  { id: 6, name: "Onboarding",          icon: IconCheck,       color: "cyan",   nodes: 10, desc: "Day-0 to day-30 onboarding task automation" },
  { id: 7, name: "Exit Clearance",      icon: IconPlayerStop,  color: "red",    nodes: 7,  desc: "Multi-department clearance & final settlement" },
  { id: 8, name: "Payroll Sign-off",    icon: IconShieldCheck, color: "indigo", nodes: 4,  desc: "Finance + HR dual sign-off before processing" },
  { id: 9, name: "Custom Form",         icon: IconFileText,    color: "gray",   nodes: 3,  desc: "Blank canvas with form-submission trigger" },
];

const TRIGGERS = [
  "Employee Created","Employee Updated","Attendance Submitted","Leave Applied",
  "Leave Cancelled","Expense Submitted","Travel Request","Recruitment Stage Changed",
  "Payroll Generated","Asset Requested","Custom Form Submitted",
  "Manual Trigger","Scheduled Trigger","Webhook Trigger",
];

const NODE_TYPES = [
  { type: "start",     label: "Start",              icon: IconPlayerPlay,   color: "green"  },
  { type: "approval",  label: "Approval",           icon: IconCheck,        color: "blue"   },
  { type: "condition", label: "Condition",          icon: IconGitBranch,    color: "orange" },
  { type: "decision",  label: "Decision",           icon: IconDiamond,      color: "violet" },
  { type: "email",     label: "Email",              icon: IconMail,         color: "teal"   },
  { type: "notify",    label: "Notification",       icon: IconBell,         color: "cyan"   },
  { type: "sms",       label: "SMS",                icon: IconMessage,      color: "green"  },
  { type: "teams",     label: "MS Teams",           icon: IconMessage,      color: "indigo" },
  { type: "slack",     label: "Slack",              icon: IconMessage,      color: "yellow" },
  { type: "delay",     label: "Delay",              icon: IconClock,        color: "gray"   },
  { type: "timer",     label: "Timer",              icon: IconCalendar,     color: "orange" },
  { type: "task",      label: "Task Assignment",    icon: IconClipboard,    color: "blue"   },
  { type: "document",  label: "Document Generation",icon: IconFileText,     color: "violet" },
  { type: "api",       label: "API Call",           icon: IconApi,          color: "red"    },
  { type: "end",       label: "End",                icon: IconPlayerStop,   color: "red"    },
];

const APPROVER_LEVELS = [
  "Reporting Manager","Department Head","HR","Finance","CEO","Custom Approver",
  "Multiple Approvers","Parallel Approval","Sequential Approval",
];

const NOTIF_CHANNELS = ["Email","SMS","Push Notification","Microsoft Teams","Slack","WhatsApp","In-App Notification"];
const ESCALATE_AFTER  = ["1 Day","2 Days","3 Days","1 Week","2 Weeks"];
const ESCALATE_TO     = ["Reporting Manager","HR","Admin","Super Admin","Custom User"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, change, icon: Icon, color }) {
  const up = change >= 0;
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={6}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing:"0.04em" }}>{label}</Text>
        <ThemeIcon size={32} radius={8} variant="light" color={color}><Icon size={16} /></ThemeIcon>
      </Group>
      <Text fw={800} size="xl" mb={2}>{value}</Text>
      {change !== undefined && (
        <Group gap={4}>
          {up ? <IconArrowUpRight size={13} color="var(--mantine-color-green-6)" /> : <IconArrowDownRight size={13} color="var(--mantine-color-red-6)" />}
          <Text size="xs" c={up?"green":"red"}>{Math.abs(change)}%</Text>
          <Text size="xs" c="dimmed">vs last week</Text>
        </Group>
      )}
    </Card>
  );
}

// ── 1. Dashboard ──────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: kpis } = useWFDashboard();
  const active    = kpis?.active    ?? MOCK_WORKFLOWS.filter(w => w.status === "Active").length;
  const draft     = kpis?.draft     ?? MOCK_WORKFLOWS.filter(w => w.status === "Draft").length;
  const total     = kpis?.total     ?? MOCK_WORKFLOWS.length;
  const running   = kpis?.running   ?? 14;
  const pending   = kpis?.pending   ?? 38;
  const failed    = kpis?.failed    ?? 3;
  const escalated = kpis?.escalated ?? 5;
  const totalExec = kpis?.totalExecutions ?? EXEC_TREND.reduce((s, d) => s + d.executions, 0);
  const completedToday = EXEC_TREND[4].completed;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KpiCard label="Total Workflows"  value={total}   change={8}   icon={IconSitemap}       color="blue"   />
        <KpiCard label="Active"           value={active}  change={2}   icon={IconPlayerPlay}    color="green"  />
        <KpiCard label="Drafts"           value={draft}   change={-1}  icon={IconPencil}        color="orange" />
        <KpiCard label="Running Now"      value={running}              change={12}  icon={IconRefresh}       color="violet" />
        <KpiCard label="Completed Today"  value={completedToday}       change={5}   icon={IconCircleCheck}   color="teal"   />
        <KpiCard label="Pending Approvals"value={pending}              change={-3}  icon={IconClock}         color="yellow" />
        <KpiCard label="Failed"           value={failed}               change={1}   icon={IconX}             color="red"    />
        <KpiCard label="Escalated"        value={escalated}            change={0}   icon={IconAlertCircle}   color="pink"   />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Workflow Executions — This Week</Text>
              <Badge variant="light" color="blue">Last 7 days</Badge>
            </Group>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={EXEC_TREND} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="completed" fill="var(--mantine-color-green-5)" radius={[4,4,0,0]} name="Completed" />
                <Bar dataKey="failed"    fill="var(--mantine-color-red-4)"   radius={[4,4,0,0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="lg" h="100%">
            <Text fw={600} mb="md">Workflow Usage by Module</Text>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={MODULE_PIE} dataKey="value" outerRadius={65} innerRadius={30} paddingAngle={2}>
                  {MODULE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Stack gap={4} mt="xs">
              {MODULE_PIE.slice(0,4).map(m => (
                <Group key={m.name} justify="space-between">
                  <Group gap={6}><Box w={8} h={8} style={{ borderRadius:"50%", background:m.color }} /><Text size="xs">{m.name}</Text></Group>
                  <Text size="xs" c="dimmed">{m.value}%</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Approval Success Rate</Text>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={APPROVAL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[80,100]} tick={{ fontSize: 11 }} unit="%" />
                <RTooltip formatter={v => `${v}%`} />
                <Area type="monotone" dataKey="rate" stroke="var(--mantine-color-teal-5)" fill="var(--mantine-color-teal-1)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="sm">Average Approval Time</Text>
            <Stack gap="xs">
              {[
                { mod: "Leave",       avg: "2h 30m", color: "blue"   },
                { mod: "Expense",     avg: "5h 10m", color: "green"  },
                { mod: "Asset",       avg: "1h 45m", color: "orange" },
                { mod: "Recruitment", avg: "8h 00m", color: "violet" },
                { mod: "Travel",      avg: "3h 20m", color: "teal"   },
              ].map(r => (
                <Group key={r.mod} justify="space-between">
                  <Group gap={6}><Box w={8} h={8} style={{ borderRadius:"50%", background:`var(--mantine-color-${r.color}-5)` }} /><Text size="sm">{r.mod}</Text></Group>
                  <Badge size="xs" variant="light" color={r.color}>{r.avg}</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ── 2. Workflow Library ───────────────────────────────────────────────────────
function WorkflowLibraryTab({ onCreate }) {
  const { show } = useToast();
  const [search, setSearch]   = useState("");
  const [module, setModule]   = useState("");
  const [status, setStatus]   = useState("");
  const [viewWf, setViewWf]   = useState(null);
  const { data: rawWfs = [] } = useWorkflows({ module: module || undefined, status: status || undefined, search: search || undefined });
  const wfs = rawWfs.length ? rawWfs : MOCK_WORKFLOWS;
  const deleteMut    = useDeleteWF();
  const publishMut   = usePublishWF();
  const duplicateMut = useDuplicateWF();

  const filtered = wfs.filter(w => {
    const q = search.toLowerCase();
    return (!q || w.name.toLowerCase().includes(q) || w.createdBy.toLowerCase().includes(q))
      && (!module || w.module === module)
      && (!status || w.status === status);
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <TextInput placeholder="Search workflows…" leftSection={<IconSearch size={14} />}
            value={search} onChange={e => setSearch(e.currentTarget.value)} w={230} radius="md" />
          <Select placeholder="Module" data={MODULES} value={module} onChange={setModule} clearable w={150} radius="md" />
          <Select placeholder="Status" data={STATUSES} value={status} onChange={setStatus} clearable w={130} radius="md" />
        </Group>
        <Button leftSection={<IconPlus size={14} />} onClick={onCreate}>New Workflow</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Workflow Name</Table.Th>
                <Table.Th>Module</Table.Th>
                <Table.Th>Trigger</Table.Th>
                <Table.Th>Version</Table.Th>
                <Table.Th>Executions</Table.Th>
                <Table.Th>Success Rate</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created By</Table.Th>
                <Table.Th>Updated</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(w => (
                <Table.Tr key={w.id}>
                  <Table.Td><Text size="sm" fw={500}>{w.name}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="blue">{w.module}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{w.trigger}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="outline">{w.version}</Badge></Table.Td>
                  <Table.Td><Text size="xs">{w.executions > 0 ? w.executions.toLocaleString() : "—"}</Text></Table.Td>
                  <Table.Td>
                    {w.successRate > 0
                      ? <Group gap={4}><Progress value={w.successRate} size="xs" color={w.successRate>=95?"green":w.successRate>=85?"yellow":"red"} style={{ width:50 }} /><Text size="xs">{w.successRate}%</Text></Group>
                      : <Text size="xs" c="dimmed">—</Text>}
                  </Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[w.status]} variant="light">{w.status}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{w.createdBy}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{w.updatedAt}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={3} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewWf(w)}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" onClick={() => duplicateMut.mutate(w.id, { onSuccess: () => show(`"${w.name}" duplicated`, "success") })}><IconCopy size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => publishMut.mutate(w.id, { onSuccess: () => show("Published", "success") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Export"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => { const blob = new Blob([JSON.stringify(w, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${w.name}.json`; a.click(); }}><IconDownload size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteMut.mutate(w.id, { onSuccess: () => show("Deleted", "success") })}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {filtered.length === 0 && <AppEmptyState icon={<IconSitemap size={22} />} message="No workflows found" sub="Try adjusting your filters or create a new workflow." py={40} />}
      </Paper>

      <Modal opened={!!viewWf} onClose={() => setViewWf(null)} title="Workflow Details" size="md" radius="lg">
        {viewWf && (
          <Stack gap="sm">
            {[["Name",viewWf.name],["Module",viewWf.module],["Trigger",viewWf.trigger],["Version",viewWf.version],["Status",viewWf.status],["Executions",viewWf.executions||"—"],["Success Rate",viewWf.successRate>0?`${viewWf.successRate}%`:"—"],["Created By",viewWf.createdBy],["Last Updated",viewWf.updatedAt]].map(([k,v])=>(
              <Group key={k} justify="space-between" py={4} style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                <Text size="sm" c="dimmed">{k}</Text>
                <Text size="sm" fw={500}>{v}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 3. Create Workflow (8-step Stepper) ───────────────────────────────────────
function CreateWorkflowTab() {
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [canvasNodes, setCanvasNodes] = useState([
    { id: 1, type: "start",    label: "Start",           x: 80,  y: 90  },
    { id: 2, type: "approval", label: "Manager Approval",x: 240, y: 90  },
    { id: 3, type: "condition",label: "Approved?",       x: 400, y: 90  },
    { id: 4, type: "email",    label: "Notify Applicant",x: 520, y: 40  },
    { id: 5, type: "email",    label: "Send Rejection",  x: 520, y: 140 },
    { id: 6, type: "end",      label: "End",             x: 660, y: 90  },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [form, setForm] = useState({ name:"", description:"", category:"", module:"", version:"v1.0", color:"blue" });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const STEPS = ["Basic Info","Trigger","Designer","Conditions","Approval Levels","Notifications","Escalation","Preview & Publish"];

  const handlePublish = () => {
    show(`"${form.name || "Workflow"}" published successfully`, "success");
    setStep(0);
    setForm({ name:"",description:"",category:"",module:"",version:"v1.0",color:"blue" });
  };

  const NODE_COLOR_MAP = { start:"green", approval:"blue", condition:"orange", decision:"violet", email:"teal", notify:"cyan", sms:"green", teams:"indigo", slack:"yellow", delay:"gray", timer:"orange", task:"blue", document:"violet", api:"red", end:"red" };

  const addNode = (type) => {
    const meta = NODE_TYPES.find(n => n.type === type);
    if (!meta) return;
    setCanvasNodes(prev => [...prev, { id: Date.now(), type, label: meta.label, x: 80 + (prev.length % 6) * 120, y: 90 + Math.floor(prev.length / 6) * 90 }]);
  };

  return (
    <Stack gap="md">
      <Stepper active={step} onStepClick={setStep} size="sm" mb="md" breakpoint="sm">
        {STEPS.map((s, i) => <Stepper.Step key={i} label={s} />)}
      </Stepper>

      {/* Step 0 – Basic Info */}
      {step === 0 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="lg">Basic Information</Text>
          <Grid>
            <Grid.Col span={{ base:12, md:6 }}>
              <Stack gap="sm">
                <TextInput label="Workflow Name *" placeholder="e.g. Leave Approval — 2 Level" value={form.name} onChange={e => f("name")(e.target.value)} radius="md" />
                <Textarea label="Description" placeholder="What this workflow does…" minRows={3} value={form.description} onChange={e => f("description")(e.target.value)} radius="md" />
                <Select label="Category" data={CATEGORIES} value={form.category} onChange={f("category")} radius="md" />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base:12, md:6 }}>
              <Stack gap="sm">
                <Select label="Module *" data={MODULES} value={form.module} onChange={f("module")} radius="md" />
                <TextInput label="Version" value={form.version} onChange={e => f("version")(e.target.value)} radius="md" />
                <Group grow gap="sm">
                  <Select label="Color" data={["blue","green","violet","orange","teal","red","cyan","pink"]} value={form.color} onChange={f("color")} radius="md" />
                  <Select label="Icon" data={["📋","✅","⚡","🔄","📧","⏰","🗂️","🚀"]} radius="md" />
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {/* Step 1 – Trigger */}
      {step === 1 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Trigger Configuration</Text>
          <Text c="dimmed" size="sm" mb="lg">Choose what event starts this workflow.</Text>
          <SimpleGrid cols={{ base:1, sm:2, md:3 }} spacing="sm">
            {TRIGGERS.map(t => (
              <Paper key={t} withBorder p="md" radius="md"
                onClick={() => f("trigger")(t)}
                style={{ cursor:"pointer", border: form.trigger===t?"1.5px solid var(--mantine-color-blue-5)":undefined, background: form.trigger===t?"var(--mantine-color-blue-0)":undefined }}>
                <Group gap="xs">
                  <ThemeIcon size={26} radius={6} variant="light" color={form.trigger===t?"blue":"gray"}>
                    <IconBolt size={13} />
                  </ThemeIcon>
                  <Text size="sm" fw={form.trigger===t?600:400}>{t}</Text>
                  {form.trigger===t && <IconCheck size={12} color="var(--mantine-color-blue-5)" style={{ marginLeft:"auto" }} />}
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Step 2 – Visual Designer */}
      {step === 2 && (
        <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
          <Group p="sm" style={{ borderBottom:"1px solid var(--mantine-color-default-border)", background:"var(--mantine-color-gray-0)" }} justify="space-between">
            <Group gap="xs">
              <Text size="sm" fw={600}>Workflow Designer</Text>
              <Badge size="xs" variant="light" color="blue">{canvasNodes.length} nodes</Badge>
            </Group>
            <Group gap="xs">
              <Tooltip label="Zoom In"><ActionIcon size="sm" variant="subtle"><IconZoomIn size={14} /></ActionIcon></Tooltip>
              <Tooltip label="Zoom Out"><ActionIcon size="sm" variant="subtle"><IconZoomOut size={14} /></ActionIcon></Tooltip>
              <Tooltip label="Fit Canvas"><ActionIcon size="sm" variant="subtle"><IconMaximize size={14} /></ActionIcon></Tooltip>
              <Tooltip label="Toggle Grid"><ActionIcon size="sm" variant="subtle"><IconGridDots size={14} /></ActionIcon></Tooltip>
            </Group>
          </Group>
          <Group align="flex-start" gap={0} style={{ minHeight:380 }}>
            {/* Left Panel – Node Palette */}
            <Box style={{ width:160, borderRight:"1px solid var(--mantine-color-default-border)", padding:12, background:"var(--mantine-color-gray-0)" }}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" style={{ letterSpacing:"0.06em" }}>Components</Text>
              <Stack gap={4}>
                {NODE_TYPES.map(n => {
                  const Icon = n.icon;
                  return (
                    <Paper key={n.type} withBorder p={6} radius="sm" style={{ cursor:"grab" }} onClick={() => addNode(n.type)}>
                      <Group gap={6}>
                        <ThemeIcon size={20} radius={4} variant="light" color={n.color}><Icon size={10} /></ThemeIcon>
                        <Text size="xs">{n.label}</Text>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Canvas */}
            <Box style={{ flex:1, position:"relative", overflow:"hidden", background:"var(--mantine-color-gray-1)", backgroundImage:"radial-gradient(var(--mantine-color-gray-3) 1px,transparent 1px)", backgroundSize:"20px 20px", minHeight:380 }}>
              {/* Connection lines (SVG) */}
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
                {canvasNodes.slice(0,-1).map((n, i) => {
                  const next = canvasNodes[i+1];
                  if (!next) return null;
                  return (
                    <g key={n.id}>
                      <line x1={n.x+60} y1={n.y+18} x2={next.x} y2={next.y+18}
                        stroke="var(--mantine-color-blue-4)" strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arrow)" />
                    </g>
                  );
                })}
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="var(--mantine-color-blue-4)" />
                  </marker>
                </defs>
              </svg>

              {/* Nodes */}
              {canvasNodes.map(n => {
                const meta = NODE_TYPES.find(t => t.type === n.type);
                const Icon = meta?.icon || IconCircleDot;
                const color = NODE_COLOR_MAP[n.type] || "blue";
                const sel = selectedNode === n.id;
                return (
                  <Paper key={n.id} withBorder p="xs" radius="md"
                    onClick={() => setSelectedNode(sel ? null : n.id)}
                    style={{
                      position:"absolute", left:n.x, top:n.y, cursor:"pointer", userSelect:"none", width:120,
                      border: sel ? `2px solid var(--mantine-color-blue-5)` : undefined,
                      background: sel ? "var(--mantine-color-blue-0)" : "var(--mantine-color-default)",
                      zIndex: sel ? 10 : 1,
                    }}>
                    <Group gap={5} wrap="nowrap">
                      <ThemeIcon size={22} radius={5} variant="light" color={color}><Icon size={11} /></ThemeIcon>
                      <Text size="xs" fw={500} lineClamp={2} style={{ flex:1 }}>{n.label}</Text>
                    </Group>
                  </Paper>
                );
              })}

              <Text size="xs" c="dimmed" style={{ position:"absolute", bottom:8, right:12 }}>
                Click nodes to configure · Drag to reorder
              </Text>
            </Box>

            {/* Right Panel – Node Config */}
            <Box style={{ width:200, borderLeft:"1px solid var(--mantine-color-default-border)", padding:12, background:"var(--mantine-color-default)" }}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" style={{ letterSpacing:"0.06em" }}>
                {selectedNode ? "Configure Node" : "Properties"}
              </Text>
              {selectedNode ? (() => {
                const n = canvasNodes.find(x => x.id === selectedNode);
                return n ? (
                  <Stack gap="xs">
                    <TextInput size="xs" label="Label" defaultValue={n.label} radius="sm" />
                    <Select size="xs" label="On Approve" data={["Next Node","Email","End"]} radius="sm" />
                    <Select size="xs" label="On Reject" data={["End","Notify","Escalate"]} radius="sm" />
                    <Switch size="xs" label="Required" defaultChecked />
                    <Switch size="xs" label="Parallel" />
                  </Stack>
                ) : null;
              })() : (
                <Text size="xs" c="dimmed">Click a node on the canvas to configure its properties.</Text>
              )}
            </Box>
          </Group>
        </Paper>
      )}

      {/* Step 3 – Conditions */}
      {step === 3 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Conditions</Text>
          <Text c="dimmed" size="sm" mb="lg">Define rules that route the workflow differently based on employee data.</Text>
          <Stack gap="md">
            {[
              { field: "Department",       op: "equals",        value: "" },
              { field: "Designation",      op: "is not empty",  value: "" },
              { field: "Employment Type",  op: "equals",        value: "Full-time" },
            ].map((c, i) => (
              <Group key={i} gap="sm" wrap="nowrap">
                <Text size="xs" c="dimmed" w={24}>{i===0?"IF":"AND"}</Text>
                <Select size="xs" data={["Department","Designation","Branch","Location","Salary","Employment Type","Experience","Custom Field"]} defaultValue={c.field} radius="md" style={{ flex:1 }} />
                <Select size="xs" data={["equals","not equals","contains","is empty","is not empty","greater than","less than"]} defaultValue={c.op} radius="md" style={{ flex:1 }} />
                <TextInput size="xs" placeholder="Value…" defaultValue={c.value} radius="md" style={{ flex:1 }} />
                <ActionIcon size="sm" variant="subtle" color="red"><IconTrash size={12} /></ActionIcon>
              </Group>
            ))}
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} w="fit-content">Add Condition</Button>
          </Stack>
        </Paper>
      )}

      {/* Step 4 – Approval Levels */}
      {step === 4 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Approval Levels</Text>
          <Text c="dimmed" size="sm" mb="lg">Configure multi-level approvals. Drag to reorder.</Text>
          <Stack gap="sm">
            {[
              { level: 1, approver: "Reporting Manager", type: "Sequential" },
              { level: 2, approver: "Department Head",   type: "Sequential" },
              { level: 3, approver: "HR Admin",          type: "Parallel"   },
            ].map(row => (
              <Paper key={row.level} withBorder p="md" radius="md">
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <Group gap="xs">
                    <ThemeIcon size={28} radius={6} variant="light" color="blue"><Text size="xs" fw={700}>{row.level}</Text></ThemeIcon>
                    <Text size="sm" fw={500}>Level {row.level}</Text>
                  </Group>
                  <Group gap="sm" wrap="wrap">
                    <Select size="xs" data={APPROVER_LEVELS} defaultValue={row.approver} radius="md" w={180} />
                    <SegmentedControl size="xs" data={["Sequential","Parallel"]} defaultValue={row.type} />
                    <Switch size="xs" label="Mandatory" defaultChecked />
                    <ActionIcon size="sm" variant="subtle" color="red"><IconTrash size={12} /></ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} w="fit-content">Add Level</Button>
          </Stack>
        </Paper>
      )}

      {/* Step 5 – Notifications */}
      {step === 5 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Notification Configuration</Text>
          <Text c="dimmed" size="sm" mb="lg">Choose channels and configure message templates for each workflow event.</Text>
          <Stack gap="md">
            {[
              { event: "Workflow Started",    channels: ["Email","In-App Notification"] },
              { event: "Approval Requested",  channels: ["Email","Push Notification","Slack"] },
              { event: "Workflow Approved",   channels: ["Email","In-App Notification"] },
              { event: "Workflow Rejected",   channels: ["Email","SMS"] },
              { event: "Escalation Triggered",channels: ["Email","Microsoft Teams","Push Notification"] },
            ].map(ev => (
              <Paper key={ev.event} withBorder p="md" radius="md">
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <Text size="sm" fw={500}>{ev.event}</Text>
                  <MultiSelect
                    size="xs"
                    data={NOTIF_CHANNELS}
                    defaultValue={ev.channels}
                    radius="md"
                    style={{ minWidth: 300 }}
                    placeholder="Select channels…"
                  />
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Step 6 – Escalation */}
      {step === 6 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Escalation Rules</Text>
          <Text c="dimmed" size="sm" mb="lg">Define when and to whom this workflow should escalate if no action is taken.</Text>
          <Stack gap="sm">
            {[
              { level: 1, after: "2 Days",  to: "Reporting Manager" },
              { level: 2, after: "3 Days",  to: "HR Admin"          },
              { level: 3, after: "1 Week",  to: "Super Admin"       },
            ].map(r => (
              <Paper key={r.level} withBorder p="md" radius="md">
                <Group gap="sm" wrap="nowrap" align="center">
                  <Badge size="sm" variant="light" color="orange">Level {r.level}</Badge>
                  <Text size="sm" c="dimmed" style={{ whiteSpace:"nowrap" }}>Escalate after</Text>
                  <Select size="xs" data={ESCALATE_AFTER} defaultValue={r.after} radius="md" w={110} />
                  <Text size="sm" c="dimmed">to</Text>
                  <Select size="xs" data={ESCALATE_TO} defaultValue={r.to} radius="md" w={160} />
                  <Switch size="xs" label="Send Email" defaultChecked />
                  <ActionIcon size="sm" variant="subtle" color="red"><IconTrash size={12} /></ActionIcon>
                </Group>
              </Paper>
            ))}
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} w="fit-content">Add Rule</Button>
          </Stack>
        </Paper>
      )}

      {/* Step 7 – Preview & Publish */}
      {step === 7 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Preview & Publish</Text>
          <Grid>
            <Grid.Col span={{ base:12, md:7 }}>
              <Paper withBorder p="md" radius="md" mb="md">
                <Text fw={600} mb="sm">Workflow Summary</Text>
                <Stack gap="xs">
                  {[
                    ["Name",        form.name    || "—"],
                    ["Module",      form.module  || "—"],
                    ["Trigger",     form.trigger || "—"],
                    ["Category",    form.category|| "—"],
                    ["Version",     form.version ],
                    ["Nodes",       canvasNodes.length],
                    ["Approval Levels", 3],
                    ["Notifications",   5],
                    ["Escalation Rules",3],
                  ].map(([k,v]) => (
                    <Group key={k} justify="space-between" py={3} style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                      <Text size="sm" c="dimmed">{k}</Text>
                      <Text size="sm" fw={500}>{v}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
              <Paper withBorder p="md" radius="md" style={{ background:"var(--mantine-color-gray-0)" }}>
                <Text fw={600} size="sm" mb="sm">Simulation Preview</Text>
                <Group gap={4} align="center">
                  {canvasNodes.map((n, i) => {
                    const meta = NODE_TYPES.find(t => t.type === n.type);
                    const Icon = meta?.icon || IconCircleDot;
                    const color = NODE_COLOR_MAP[n.type] || "blue";
                    return (
                      <Group key={n.id} gap={4} wrap="nowrap">
                        <ThemeIcon size={28} radius={6} variant="light" color={color}><Icon size={13} /></ThemeIcon>
                        {i < canvasNodes.length - 1 && <IconArrowRight size={12} color="var(--mantine-color-dimmed)" />}
                      </Group>
                    );
                  })}
                </Group>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base:12, md:5 }}>
              <Stack gap="sm">
                <Paper withBorder p="md" radius="md" style={{ background:"var(--mantine-color-green-0)", border:"1.5px solid var(--mantine-color-green-3)" }}>
                  <Group gap="xs" mb={4}><IconCheck size={15} color="var(--mantine-color-green-6)" /><Text size="sm" fw={600} c="green">Ready to Publish</Text></Group>
                  <Text size="xs" c="dimmed">All required steps are complete. This workflow will be activated immediately after publishing.</Text>
                </Paper>
                <Button fullWidth size="md" leftSection={<IconRocket size={16} />} color="green" onClick={handlePublish}>Publish Workflow</Button>
                <Button fullWidth variant="outline" onClick={() => show("Draft saved","info")}>Save as Draft</Button>
                <Button fullWidth variant="default" onClick={() => show("Duplicated","success")}>Duplicate</Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      <Group justify="space-between" mt="md">
        <Button variant="default" disabled={step===0} onClick={() => setStep(s => s-1)}>Back</Button>
        {step < 7 && <Button disabled={step===0 && !form.name.trim()} onClick={() => setStep(s => s+1)}>Next</Button>}
      </Group>
    </Stack>
  );
}

// ── 4. Templates ──────────────────────────────────────────────────────────────
function TemplatesTab({ onCreate }) {
  const { show } = useToast();
  const [viewTpl, setViewTpl] = useState(null);

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">Start from a pre-built workflow template. All templates are fully customisable.</Text>
      <SimpleGrid cols={{ base:1, sm:2, md:3 }} spacing="md">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <Paper key={t.id} withBorder p="lg" radius="lg">
              <ThemeIcon size={44} radius={12} variant="light" color={t.color} mb="md"><Icon size={22} /></ThemeIcon>
              <Text fw={700} mb={4}>{t.name}</Text>
              <Text size="xs" c="dimmed" mb="xs">{t.desc}</Text>
              <Badge size="xs" variant="outline" mb="md">{t.nodes} nodes</Badge>
              <Group gap="xs">
                <Button size="xs" variant="light" leftSection={<IconEye size={11} />} onClick={() => setViewTpl(t)}>Preview</Button>
                <Button size="xs" color={t.color} leftSection={<IconPlus size={11} />} onClick={() => { onCreate(); show(`"${t.name}" template loaded`,"success"); }}>Use</Button>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Modal opened={!!viewTpl} onClose={() => setViewTpl(null)} title={`Template: ${viewTpl?.name || ""}`} size="md" radius="lg">
        {viewTpl && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">{viewTpl.desc}</Text>
            <Divider />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Included Nodes</Text>
            {["Start","Trigger Check","Approval Level 1","Condition: Approved?","Email: Notify","End"].slice(0, viewTpl.nodes > 6 ? 6 : viewTpl.nodes).map((n,i) => (
              <Group key={i} gap="xs"><IconCheck size={13} color="var(--mantine-color-green-6)" /><Text size="sm">{n}</Text></Group>
            ))}
            <Button fullWidth mt="sm" onClick={() => { setViewTpl(null); show(`"${viewTpl.name}" loaded`,"success"); onCreate(); }}>Use This Template</Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 5. Active / Draft Workflows ───────────────────────────────────────────────
function FilteredWorkflowsTab({ filterStatus, emptyMsg }) {
  const { show } = useToast();
  const { data: rawList = [] } = useWorkflows({ status: filterStatus });
  const list = rawList.length ? rawList : MOCK_WORKFLOWS.filter(w => w.status === filterStatus);
  const publishMut   = usePublishWF();
  const deleteMut    = useDeleteWF();
  const duplicateMut = useDuplicateWF();
  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Workflow Name</Table.Th>
              <Table.Th>Module</Table.Th>
              <Table.Th>Trigger</Table.Th>
              <Table.Th>Version</Table.Th>
              {filterStatus === "Active" && <Table.Th>Executions</Table.Th>}
              <Table.Th>Created By</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {list.map(w => (
              <Table.Tr key={w.id}>
                <Table.Td><Text size="sm" fw={500}>{w.name}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="blue">{w.module}</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{w.trigger}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="outline">{w.version}</Badge></Table.Td>
                {filterStatus === "Active" && <Table.Td><Text size="xs">{w.executions.toLocaleString()}</Text></Table.Td>}
                <Table.Td><Text size="xs" c="dimmed">{w.createdBy}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{w.updatedAt}</Text></Table.Td>
                <Table.Td>
                  <Group gap={3}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" onClick={() => show(`Duplicated`,"success")}><IconCopy size={13} /></ActionIcon></Tooltip>
                    {filterStatus === "Active"
                      ? <Tooltip label="Deactivate"><ActionIcon size="sm" variant="subtle" color="orange" onClick={() => show("Deactivated","info")}><IconPlayerStop size={13} /></ActionIcon></Tooltip>
                      : <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => show("Published","success")}><IconRocket size={13} /></ActionIcon></Tooltip>}
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => show("Deleted","error")}><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {list.length === 0 && <AppEmptyState icon={<IconSitemap size={22} />} message={emptyMsg} py={40} />}
      </Paper>
    </Stack>
  );
}

// ── 6. Workflow History ───────────────────────────────────────────────────────
function WorkflowHistoryTab() {
  const { show } = useToast();
  const [viewHist, setViewHist] = useState(null);
  const { data: rawHistory = [] } = useWFHistory();
  const historyData = rawHistory.length ? rawHistory : MOCK_HISTORY;

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search by ID, workflow, employee…" leftSection={<IconSearch size={14} />} w={280} radius="md" />
        <Select placeholder="Status" data={["Completed","Running","Escalated","Failed"]} clearable w={140} radius="md" />
        <Select placeholder="Module" data={MODULES} clearable w={150} radius="md" />
      </Group>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Request ID</Table.Th>
                <Table.Th>Workflow</Table.Th>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Started</Table.Th>
                <Table.Th>Completed</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {historyData.map(h => (
                <Table.Tr key={h.id}>
                  <Table.Td><Text size="xs" ff="monospace" fw={600}>{h.id}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{h.workflow}</Text></Table.Td>
                  <Table.Td><Text size="sm">{h.employee}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{h.started}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{h.completed}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="outline">{h.duration}</Badge></Table.Td>
                  <Table.Td><Badge size="xs" color={HIST_COLOR[h.status]} variant="light">{h.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={3}>
                      <Tooltip label="View Timeline"><ActionIcon size="sm" variant="subtle" onClick={() => setViewHist(h)}><IconEye size={13} /></ActionIcon></Tooltip>
                      {h.status === "Failed" && <Tooltip label="Restart"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => show("Restarted","info")}><IconRefresh size={13} /></ActionIcon></Tooltip>}
                      <Tooltip label="Export"><ActionIcon size="sm" variant="subtle"><IconDownload size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={!!viewHist} onClose={() => setViewHist(null)} title="Workflow Timeline" size="md" radius="lg">
        {viewHist && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={700}>{viewHist.id}</Text>
              <Badge color={HIST_COLOR[viewHist.status]} variant="light">{viewHist.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{viewHist.workflow} — {viewHist.employee}</Text>
            <Divider />
            {[
              { step:"Submitted",        time:viewHist.started,        done:true  },
              { step:"Manager Notified", time:"+ 5 min",               done:true  },
              { step:"Manager Approved", time:"+ 1h 10m",              done:viewHist.status==="Completed" },
              { step:"HR Review",        time:viewHist.status==="Completed"?"+ 1h 20m":"Pending", done:viewHist.status==="Completed" },
              { step:"Completed",        time:viewHist.completed!=="—"?viewHist.completed:"—", done:viewHist.status==="Completed" },
            ].map((s, i) => (
              <Group key={i} gap="sm">
                <ThemeIcon size={22} radius="xl" variant="light" color={s.done?"green":"gray"}>
                  {s.done ? <IconCheck size={11} /> : <IconClock size={11} />}
                </ThemeIcon>
                <Box style={{ flex:1 }}>
                  <Text size="sm" fw={500}>{s.step}</Text>
                  <Text size="xs" c="dimmed">{s.time}</Text>
                </Box>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 7. Approval Matrix ────────────────────────────────────────────────────────
function ApprovalMatrixTab() {
  const { show } = useToast();
  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Workflow</Table.Th>
              <Table.Th>Level</Table.Th>
              <Table.Th>Approver</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Escalation</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {APPROVAL_MATRIX.map((r, i) => (
              <Table.Tr key={i}>
                <Table.Td><Text size="sm" fw={500}>{r.workflow}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="blue">Level {r.level}</Badge></Table.Td>
                <Table.Td><Text size="sm">{r.approver}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="outline">Sequential</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{r.escalation}</Text></Table.Td>
                <Table.Td><Badge size="xs" color="green" variant="light">{r.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={3}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => show("Removed","error")}><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Button variant="light" leftSection={<IconPlus size={14} />} w="fit-content">Add Approval Rule</Button>
    </Stack>
  );
}

// ── 8. Escalation Rules ───────────────────────────────────────────────────────
function EscalationRulesTab() {
  const { show } = useToast();
  const [rules, setRules] = useState([
    { id:1, workflow:"Leave Approval",  after:"2 Days", to:"HR Admin",    channel:"Email",  enabled:true  },
    { id:2, workflow:"Expense Claim",   after:"1 Day",  to:"Finance Head",channel:"Email+Slack",enabled:true },
    { id:3, workflow:"Asset Request",   after:"3 Days", to:"Super Admin", channel:"Email",  enabled:false },
    { id:4, workflow:"Recruitment",     after:"1 Week", to:"HR Manager",  channel:"Teams",  enabled:true  },
  ]);

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Workflow</Table.Th>
              <Table.Th>Escalate After</Table.Th>
              <Table.Th>Escalate To</Table.Th>
              <Table.Th>Channel</Table.Th>
              <Table.Th>Enabled</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rules.map(r => (
              <Table.Tr key={r.id}>
                <Table.Td><Text size="sm" fw={500}>{r.workflow}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="orange">{r.after}</Badge></Table.Td>
                <Table.Td><Text size="sm">{r.to}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{r.channel}</Text></Table.Td>
                <Table.Td>
                  <Switch checked={r.enabled} size="xs"
                    onChange={e => setRules(prev => prev.map(x => x.id===r.id ? { ...x, enabled:e.currentTarget.checked } : x))} />
                </Table.Td>
                <Table.Td>
                  <Group gap={3}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => show("Deleted","error")}><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Button variant="light" leftSection={<IconPlus size={14} />} w="fit-content">Add Escalation Rule</Button>
    </Stack>
  );
}

// ── 9. Settings ───────────────────────────────────────────────────────────────
function WorkflowSettingsTab() {
  const { show } = useToast();
  const [settings, setSettings] = useState({
    defaultWorkflow: "Leave Approval — 2 Level",
    businessHours: "9:00 AM – 6:00 PM",
    timezone: "Asia/Kolkata",
    retryPolicy: "3 Retries",
    execTimeout: "72",
    autoArchive: "90 Days",
    versioning: true,
    auditLog: true,
    notifOnFail: true,
  });
  const s = k => v => setSettings(p => ({ ...p, [k]:v }));

  return (
    <Stack gap="md" maw={640}>
      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">General Settings</Text>
        <Stack gap="sm">
          <Select label="Default Workflow" data={MOCK_WORKFLOWS.map(w => w.name)} value={settings.defaultWorkflow} onChange={s("defaultWorkflow")} radius="md" />
          <Group grow gap="sm">
            <TextInput label="Business Hours" value={settings.businessHours} onChange={e => s("businessHours")(e.target.value)} radius="md" />
            <Select label="Timezone" data={["Asia/Kolkata","UTC","America/New_York","Europe/London"]} value={settings.timezone} onChange={s("timezone")} radius="md" />
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Execution Settings</Text>
        <Stack gap="sm">
          <Select label="Retry Policy" data={["No Retry","1 Retry","2 Retries","3 Retries","5 Retries"]} value={settings.retryPolicy} onChange={s("retryPolicy")} radius="md" />
          <Group grow gap="sm">
            <NumberInput label="Execution Timeout (hours)" value={Number(settings.execTimeout)} onChange={v => s("execTimeout")(String(v))} min={1} max={720} radius="md" />
            <Select label="Auto Archive After" data={["30 Days","60 Days","90 Days","180 Days","1 Year","Never"]} value={settings.autoArchive} onChange={s("autoArchive")} radius="md" />
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Advanced</Text>
        <Stack gap="sm">
          <Group justify="space-between"><Text size="sm">Workflow Versioning</Text><Switch checked={settings.versioning} onChange={e => s("versioning")(e.currentTarget.checked)} /></Group>
          <Group justify="space-between"><Text size="sm">Full Audit Log</Text><Switch checked={settings.auditLog} onChange={e => s("auditLog")(e.currentTarget.checked)} /></Group>
          <Group justify="space-between"><Text size="sm">Notify Admin on Failure</Text><Switch checked={settings.notifOnFail} onChange={e => s("notifOnFail")(e.currentTarget.checked)} /></Group>
          <Group justify="space-between"><Text size="sm">Holiday Calendar Integration</Text><Switch defaultChecked /></Group>
          <Group justify="space-between"><Text size="sm">Parallel Execution Support</Text><Switch defaultChecked /></Group>
        </Stack>
      </Paper>

      <Button w={160} onClick={() => show("Settings saved","success")}>Save Settings</Button>
    </Stack>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function WorkflowBuilder({ darkMode }) {
  const [tab, setTab] = useState("dashboard");
  const goCreate = () => setTab("create");

  return (
    <Box>
      <AppPageHeader
        title="Workflow Builder"
        sub="Design, configure, and publish multi-level approval workflows across all HRPLUSE modules"
        action={<Button leftSection={<IconPlus size={14} />} onClick={goCreate}>New Workflow</Button>}
      />

      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard"   leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="library"     leftSection={<IconList size={14} />}>Library</Tabs.Tab>
          <Tabs.Tab value="create"      leftSection={<IconPlus size={14} />}>Create Workflow</Tabs.Tab>
          <Tabs.Tab value="templates"   leftSection={<IconTemplate size={14} />}>Templates</Tabs.Tab>
          <Tabs.Tab value="active"      leftSection={<IconPlayerPlay size={14} />}>Active</Tabs.Tab>
          <Tabs.Tab value="draft"       leftSection={<IconPencil size={14} />}>Drafts</Tabs.Tab>
          <Tabs.Tab value="history"     leftSection={<IconHistory size={14} />}>History</Tabs.Tab>
          <Tabs.Tab value="matrix"      leftSection={<IconShieldCheck size={14} />}>Approval Matrix</Tabs.Tab>
          <Tabs.Tab value="escalation"  leftSection={<IconAlertCircle size={14} />}>Escalation Rules</Tabs.Tab>
          <Tabs.Tab value="settings"    leftSection={<IconSettings size={14} />}>Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard">  <DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="library">    <WorkflowLibraryTab onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="create">     <CreateWorkflowTab /></Tabs.Panel>
        <Tabs.Panel value="templates">  <TemplatesTab onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="active">     <FilteredWorkflowsTab filterStatus="Active"  emptyMsg="No active workflows" /></Tabs.Panel>
        <Tabs.Panel value="draft">      <FilteredWorkflowsTab filterStatus="Draft"   emptyMsg="No draft workflows"  /></Tabs.Panel>
        <Tabs.Panel value="history">    <WorkflowHistoryTab /></Tabs.Panel>
        <Tabs.Panel value="matrix">     <ApprovalMatrixTab /></Tabs.Panel>
        <Tabs.Panel value="escalation"> <EscalationRulesTab /></Tabs.Panel>
        <Tabs.Panel value="settings">   <WorkflowSettingsTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
