import { useState, useMemo } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Tabs, SimpleGrid,
  Table, ActionIcon, Modal, TextInput, Select, Textarea, NumberInput,
  Progress, Grid, Box, ThemeIcon, Tooltip, Switch, Divider, Timeline,
  ScrollArea, Card, RingProgress, Stepper,
} from "@mantine/core";
import {
  IconCreditCard, IconUsers, IconRefresh, IconPlus, IconDownload,
  IconUpload, IconSearch, IconEye, IconPencil, IconTrash, IconCheck,
  IconX, IconTrendingUp, IconTrendingDown, IconFileInvoice, IconReceipt,
  IconCalendar, IconClock, IconAlertTriangle, IconCircleCheck,
  IconCurrencyRupee, IconChartBar, IconSettings, IconPlugConnected,
  IconGift, IconMail, IconBell, IconBuilding, IconArrowUpRight,
  IconArrowDownRight, IconRotate, IconBan, IconSend, IconPrinter,
  IconShieldCheck, IconDatabaseImport, IconChevronRight,
} from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useToast } from "../../components/ui/Toast";
import { KpiCard, ChartTooltip, fmtMoney, SPARK_HEX } from "../dashboard/components/DashboardKit";

// Icon aliases (must be declared before use in component JSX)
const IconLayoutDashboard2 = IconChartBar;
const IconSettings2 = IconSettings;

// ── Mock data ─────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const REVENUE_TREND = MONTHS.map((m, i) => ({
  month: m,
  revenue: 180000 + i * 22000 + (i % 3) * 8000,
  mrr: 180000 + i * 22000,
  arr: (180000 + i * 22000) * 12,
  subs: 8 + i,
}));

const PLAN_DIST = [
  { name: "Starter",      value: 12, color: "#94a3b8" },
  { name: "Professional", value: 23, color: "#3b82f6" },
  { name: "Business",     value: 18, color: "#7c3aed" },
  { name: "Enterprise",   value: 9,  color: "#f59e0b" },
  { name: "Custom",       value: 4,  color: "#10b981" },
];

const PAYMENT_STATUS = [
  { month: "Feb", success: 52, failed: 3 },
  { month: "Mar", success: 58, failed: 2 },
  { month: "Apr", success: 61, failed: 5 },
  { month: "May", success: 55, failed: 4 },
  { month: "Jun", success: 66, failed: 2 },
];

const SUBSCRIPTIONS = [
  { id: "SUB-001", company: "Mgate Technologies",  plan: "Enterprise",   users: 250, cycle: "Annual",   start: "2025-01-15", renewal: "2026-01-15", status: "Active",    amount: 480000 },
  { id: "SUB-002", company: "Nexgen Solutions",    plan: "Business",     users: 80,  cycle: "Monthly",  start: "2025-03-01", renewal: "2026-06-01", status: "Active",    amount: 12000 },
  { id: "SUB-003", company: "Infospark Pvt Ltd",   plan: "Professional", users: 45,  cycle: "Annual",   start: "2025-06-10", renewal: "2026-06-10", status: "Trial",     amount: 75000 },
  { id: "SUB-004", company: "Brightwave Corp",     plan: "Starter",      users: 15,  cycle: "Monthly",  start: "2024-11-01", renewal: "2026-07-01", status: "Active",    amount: 2500 },
  { id: "SUB-005", company: "Zenith Retail",       plan: "Enterprise",   users: 320, cycle: "Annual",   start: "2025-02-20", renewal: "2026-02-20", status: "Suspended", amount: 580000 },
  { id: "SUB-006", company: "CloudBase Inc",       plan: "Business",     users: 95,  cycle: "Quarterly",start: "2025-05-01", renewal: "2026-08-01", status: "Active",    amount: 36000 },
  { id: "SUB-007", company: "Petrox Services",     plan: "Starter",      users: 22,  cycle: "Monthly",  start: "2026-01-01", renewal: "2026-07-10", status: "Trial",     amount: 0 },
  { id: "SUB-008", company: "Arrowhead Logistics", plan: "Professional", users: 60,  cycle: "Annual",   start: "2024-09-01", renewal: "2026-09-01", status: "Active",    amount: 90000 },
];

const PLANS = [
  { id: "starter",      name: "Starter",      price: 2500,  cycle: "Monthly",  users: 25,   storage: 10,  ai: 500,   api: 10000,  support: "Email",    status: "Active",   modules: ["Core HR","Attendance","Leave"] },
  { id: "professional", name: "Professional", price: 7500,  cycle: "Monthly",  users: 100,  storage: 50,  ai: 2000,  api: 50000,  support: "Email+Chat", status: "Active", modules: ["Core HR","Attendance","Leave","Payroll","Recruitment","Documents"] },
  { id: "business",     name: "Business",     price: 15000, cycle: "Monthly",  users: 250,  storage: 200, ai: 10000, api: 200000, support: "Priority", status: "Active",   modules: ["All Professional","LMS","Analytics","Compliance","Benefits"] },
  { id: "enterprise",   name: "Enterprise",   price: 40000, cycle: "Monthly",  users: 1000, storage: 1000,ai: 50000, api: 1000000,support: "Dedicated", status: "Active",  modules: ["All Business","Custom Integrations","Branding","Multi-Company","API Access"] },
  { id: "custom",       name: "Custom",       price: null,  cycle: "Custom",   users: null, storage: null,ai: null,  api: null,   support: "Dedicated", status: "Active",  modules: ["Fully Customizable"] },
];

const CUSTOMERS = [
  { id: "CUST-001", company: "Mgate Technologies",  tenant: "mgate",    plan: "Enterprise",   admin: "Siva",     status: "Active",    renewal: "2026-01-15", mrr: 40000 },
  { id: "CUST-002", company: "Nexgen Solutions",    tenant: "nexgen",   plan: "Business",     admin: "Arjun",    status: "Active",    renewal: "2026-06-01", mrr: 12000 },
  { id: "CUST-003", company: "Infospark Pvt Ltd",   tenant: "infospark",plan: "Professional", admin: "Priya",    status: "Trial",     renewal: "2026-06-10", mrr: 0 },
  { id: "CUST-004", company: "Brightwave Corp",     tenant: "bwave",    plan: "Starter",      admin: "Rakesh",   status: "Active",    renewal: "2026-07-01", mrr: 2500 },
  { id: "CUST-005", company: "Zenith Retail",       tenant: "zenith",   plan: "Enterprise",   admin: "Divya",    status: "Suspended", renewal: "2026-02-20", mrr: 0 },
  { id: "CUST-006", company: "CloudBase Inc",       tenant: "cloudbase",plan: "Business",     admin: "Karthik",  status: "Active",    renewal: "2026-08-01", mrr: 12000 },
];

const INVOICES = [
  { id: "INV-2026-001", customer: "Mgate Technologies",  plan: "Enterprise",   period: "Jan 2026",  amount: 40000, tax: 7200,  total: 47200, status: "Paid",    due: "2026-01-15" },
  { id: "INV-2026-002", customer: "Nexgen Solutions",    plan: "Business",     period: "Jun 2026",  amount: 12000, tax: 2160,  total: 14160, status: "Paid",    due: "2026-06-01" },
  { id: "INV-2026-003", customer: "Brightwave Corp",     plan: "Starter",      period: "Jul 2026",  amount: 2500,  tax: 450,   total: 2950,  status: "Pending", due: "2026-07-01" },
  { id: "INV-2026-004", customer: "CloudBase Inc",       plan: "Business",     period: "Aug 2026",  amount: 12000, tax: 2160,  total: 14160, status: "Pending", due: "2026-08-01" },
  { id: "INV-2026-005", customer: "Arrowhead Logistics", plan: "Professional", period: "Sep 2026",  amount: 7500,  tax: 1350,  total: 8850,  status: "Overdue", due: "2026-05-30" },
  { id: "INV-2026-006", customer: "Zenith Retail",       plan: "Enterprise",   period: "Feb 2026",  amount: 40000, tax: 7200,  total: 47200, status: "Void",    due: "2026-02-20" },
];

const PAYMENTS = [
  { id: "TXN-001", invoice: "INV-2026-001", customer: "Mgate Technologies",  gateway: "Razorpay", amount: 47200, status: "Success", date: "2026-01-15" },
  { id: "TXN-002", invoice: "INV-2026-002", customer: "Nexgen Solutions",    gateway: "Stripe",   amount: 14160, status: "Success", date: "2026-06-01" },
  { id: "TXN-003", invoice: "INV-2026-005", customer: "Arrowhead Logistics", gateway: "Stripe",   amount: 8850,  status: "Failed",  date: "2026-05-30" },
  { id: "TXN-004", invoice: "INV-2026-003", customer: "Brightwave Corp",     gateway: "Razorpay", amount: 2950,  status: "Pending", date: "2026-07-01" },
  { id: "TXN-005", invoice: "INV-2026-004", customer: "CloudBase Inc",       gateway: "PayPal",   amount: 14160, status: "Success", date: "2026-06-20" },
];

const TRIALS = [
  { id: "TRIAL-001", customer: "Infospark Pvt Ltd", start: "2026-06-01", end: "2026-06-30", remaining: 1,  plan: "Professional", status: "Active" },
  { id: "TRIAL-002", customer: "Petrox Services",   start: "2026-06-10", end: "2026-07-10", remaining: 11, plan: "Starter",      status: "Active" },
  { id: "TRIAL-003", customer: "DesignHub Co",      start: "2026-05-01", end: "2026-05-30", remaining: 0,  plan: "Business",     status: "Converted" },
  { id: "TRIAL-004", customer: "AgriTech Farms",    start: "2026-04-01", end: "2026-04-30", remaining: 0,  plan: "Starter",      status: "Expired" },
];

const DISCOUNTS = [
  { code: "LAUNCH50",   desc: "Launch offer",          pct: 50, validity: "2026-12-31", used: 4,  max: 20, status: "Active" },
  { code: "ANNUAL20",   desc: "Annual plan discount",  pct: 20, validity: "2027-03-31", used: 18, max: 100,status: "Active" },
  { code: "STARTUP15",  desc: "Startup special",       pct: 15, validity: "2026-09-30", used: 7,  max: 50, status: "Active" },
  { code: "EARLYBIRD",  desc: "Early bird — Q1 2026",  pct: 30, validity: "2026-03-31", used: 10, max: 10, status: "Expired" },
];

const GATEWAYS = [
  { id: "razorpay", name: "Razorpay", logo: "₹", env: "Production", status: "Connected", txns: 142, color: "#3b82f6" },
  { id: "stripe",   name: "Stripe",   logo: "S",  env: "Production", status: "Connected", txns: 78,  color: "#7c3aed" },
  { id: "paypal",   name: "PayPal",   logo: "P",  env: "Sandbox",    status: "Sandbox",   txns: 23,  color: "#f59e0b" },
  { id: "offline",  name: "Offline",  logo: "B",  env: "—",          status: "Enabled",   txns: 12,  color: "#10b981" },
];

const STATUS_COLOR = {
  Active: "green", Trial: "blue", Suspended: "orange", Cancelled: "red", Expired: "gray",
  Paid: "green", Pending: "orange", Overdue: "red", Void: "gray",
  Success: "green", Failed: "red", Refunded: "gray",
  Connected: "green", Sandbox: "yellow", Enabled: "teal",
  Converted: "teal",
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtINR  = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

// ── Shared mini StatCard ──────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "blue", icon: Icon }) {
  return (
    <Paper withBorder p="md" radius="lg">
      <Group gap="md" align="flex-start">
        {Icon && <ThemeIcon size={40} radius={12} variant="light" color={color}><Icon size={20} /></ThemeIcon>}
        <div>
          <Text size="xs" c="dimmed" fw={500} tt="uppercase">{label}</Text>
          <Text fw={800} size="xl">{value}</Text>
          {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
        </div>
      </Group>
    </Paper>
  );
}

// ── 1. Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardTab({ onAction }) {
  const mrr = REVENUE_TREND.at(-1).mrr;
  const arr = mrr * 12;
  const activeSubs = SUBSCRIPTIONS.filter(s => s.status === "Active").length;
  const trialSubs  = SUBSCRIPTIONS.filter(s => s.status === "Trial").length;
  const renewalsDue = SUBSCRIPTIONS.filter(s => {
    const d = new Date(s.renewal);
    const now = new Date();
    return (d - now) / 86400000 <= 30 && s.status === "Active";
  }).length;
  const failedPay = PAYMENTS.filter(p => p.status === "Failed").length;
  const outstanding = INVOICES.filter(i => ["Pending","Overdue"].includes(i.status)).reduce((s, i) => s + i.total, 0);

  const KPIS = [
    { icon: IconUsers,       label: "Total Customers",    value: CUSTOMERS.length,       sub: `${activeSubs} active`,       color: "blue",   trend: "+2 this month" },
    { icon: IconCircleCheck, label: "Active Subscriptions",value: activeSubs,            sub: `${trialSubs} on trial`,      color: "green",  trend: "+3 this month" },
    { icon: IconClock,       label: "Trial Customers",    value: trialSubs,              sub: "Free trial period",          color: "cyan",   trend: null },
    { icon: IconTrendingUp,  label: "MRR",                value: fmtINR(mrr),            sub: "Monthly recurring revenue",  color: "violet", trend: "+12.4%" },
    { icon: IconChartBar,    label: "ARR",                value: fmtINR(arr),            sub: "Annual recurring revenue",   color: "grape",  trend: "+12.4%" },
    { icon: IconCalendar,    label: "Renewals Due",       value: renewalsDue,            sub: "Next 30 days",               color: "orange", trend: null },
    { icon: IconAlertTriangle,label:"Failed Payments",    value: failedPay,              sub: "Needs attention",            color: "red",    trend: null },
    { icon: IconFileInvoice, label: "Outstanding",        value: fmtINR(outstanding),    sub: "Unpaid invoices",            color: "pink",   trend: null },
  ];

  const QUICK_ACTIONS = [
    { label: "Create Subscription", icon: IconPlus,         color: "blue"   },
    { label: "Generate Invoice",    icon: IconFileInvoice,  color: "violet" },
    { label: "Record Payment",      icon: IconReceipt,      color: "green"  },
    { label: "Create Plan",         icon: IconSettings,     color: "orange" },
    { label: "Add Customer",        icon: IconBuilding,     color: "cyan"   },
    { label: "Extend Trial",        icon: IconClock,        color: "pink"   },
  ];

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {KPIS.map(k => (
          <Paper key={k.label} withBorder p="md" radius="lg" style={{ cursor: "pointer" }}
            onClick={() => onAction(k.label)}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <ThemeIcon size={40} radius={12} variant="light" color={k.color}><k.icon size={20} /></ThemeIcon>
              {k.trend && (
                <Badge size="xs" color={k.trend.startsWith("+") ? "green" : "red"} variant="light">
                  {k.trend}
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" fw={500}>{k.label}</Text>
            <Text fw={800} size="xl">{k.value}</Text>
            <Text size="xs" c="dimmed">{k.sub}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Monthly Revenue Trend</Text>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="bilGradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SPARK_HEX.violet} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SPARK_HEX.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <RTooltip content={<ChartTooltip />} formatter={v => fmtINR(v)} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={SPARK_HEX.violet} strokeWidth={2.5} fill="url(#bilGradRev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="lg" h="100%">
            <Text fw={600} mb="md">Plan Distribution</Text>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={PLAN_DIST} cx="50%" cy="50%" innerRadius={52} outerRadius={74} dataKey="value" paddingAngle={3}>
                  {PLAN_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <RTooltip formatter={(v, n) => [v + " subs", n]} />
              </PieChart>
            </ResponsiveContainer>
            <Stack gap={4} mt="xs">
              {PLAN_DIST.map(d => (
                <Group key={d.name} justify="space-between" gap="xs">
                  <Group gap={6}><Box w={10} h={10} style={{ borderRadius: 2, background: d.color, flexShrink: 0 }} /><Text size="xs">{d.name}</Text></Group>
                  <Text size="xs" fw={600}>{d.value}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Payment Success vs Failed</Text>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PAYMENT_STATUS} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="success" name="Success" fill={SPARK_HEX.green} radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed"  name="Failed"  fill={SPARK_HEX.red}   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="sm">Quick Actions</Text>
            <SimpleGrid cols={3} spacing="sm">
              {QUICK_ACTIONS.map(a => (
                <Paper key={a.label} withBorder p="sm" radius="md" style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => onAction(a.label)}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--mantine-color-default-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <ThemeIcon size={36} radius={10} variant="light" color={a.color} mx="auto" mb={4}><a.icon size={18} /></ThemeIcon>
                  <Text size="xs" fw={500} lh={1.3}>{a.label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Recent Subscriptions</Text>
            <Stack gap="xs">
              {SUBSCRIPTIONS.slice(0, 4).map(s => (
                <Group key={s.id} justify="space-between">
                  <div><Text size="sm" fw={500}>{s.company}</Text><Text size="xs" c="dimmed">{s.plan} · {s.cycle}</Text></div>
                  <Group gap="xs">
                    <Text size="sm" fw={600}>{fmtINR(s.amount)}</Text>
                    <Badge size="xs" color={STATUS_COLOR[s.status]} variant="light">{s.status}</Badge>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Upcoming Renewals</Text>
            <Stack gap="xs">
              {SUBSCRIPTIONS.filter(s => s.status === "Active").slice(0, 4).map(s => (
                <Group key={s.id} justify="space-between">
                  <div><Text size="sm" fw={500}>{s.company}</Text><Text size="xs" c="dimmed">{s.plan}</Text></div>
                  <Text size="xs" c="dimmed">{fmtDate(s.renewal)}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ── 2. Subscriptions Tab ──────────────────────────────────────────────────────
function SubscriptionsTab({ toast }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [viewSub, setViewSub] = useState(null);

  const filtered = SUBSCRIPTIONS.filter(s => {
    const q = search.toLowerCase();
    return (s.company.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      && (filterStatus === "All" || s.status === filterStatus)
      && (filterPlan === "All" || s.plan === filterPlan);
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <TextInput placeholder="Search company or ID…" leftSection={<IconSearch size={14} />}
            value={search} onChange={e => setSearch(e.currentTarget.value)} style={{ minWidth: 220 }} radius="md" />
          <Select data={["All","Active","Trial","Suspended","Cancelled"]} value={filterStatus}
            onChange={v => setFilterStatus(v)} w={140} radius="md" />
          <Select data={["All","Starter","Professional","Business","Enterprise","Custom"]} value={filterPlan}
            onChange={v => setFilterPlan(v)} w={160} radius="md" />
        </Group>
        <Group gap="sm">
          <Button variant="default" leftSection={<IconUpload size={14} />}>Import</Button>
          <Button variant="default" leftSection={<IconDownload size={14} />}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>Create Subscription</Button>
        </Group>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Subscription ID</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Users</Table.Th>
                <Table.Th>Cycle</Table.Th>
                <Table.Th>Start Date</Table.Th>
                <Table.Th>Renewal</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(s => (
                <Table.Tr key={s.id}>
                  <Table.Td><Text size="xs" c="dimmed" ff="monospace">{s.id}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{s.company}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="violet">{s.plan}</Badge></Table.Td>
                  <Table.Td>{s.users}</Table.Td>
                  <Table.Td><Text size="xs">{s.cycle}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(s.start)}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(s.renewal)}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{s.amount ? fmtINR(s.amount) : "Free"}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[s.status]} variant="light">{s.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewSub(s)}><IconEye size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Renew"><ActionIcon size="sm" variant="subtle" color="green"><IconRotate size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Invoice"><ActionIcon size="sm" variant="subtle" color="violet"><IconFileInvoice size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Suspend"><ActionIcon size="sm" variant="subtle" color="orange"><IconBan size={14} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {filtered.length === 0 && <AppEmptyState icon={<IconFileInvoice size={22} />} message="No subscriptions found" sub="Try adjusting your filters." py={40} />}
      </Paper>

      {/* Create Subscription Wizard */}
      <Modal opened={showCreate} onClose={() => { setShowCreate(false); setStep(0); }} title="Create Subscription" size="xl" radius="lg">
        <Stepper active={step} onStepClick={setStep} size="sm" mb="xl">
          <Stepper.Step label="Customer" />
          <Stepper.Step label="Plan" />
          <Stepper.Step label="Limits" />
          <Stepper.Step label="Billing" />
          <Stepper.Step label="Review" />
        </Stepper>

        {step === 0 && (
          <Stack gap="md">
            <Select label="Customer" placeholder="Select company" data={CUSTOMERS.map(c => c.company)} radius="md" />
            <TextInput label="Contact Email" placeholder="admin@company.com" radius="md" />
          </Stack>
        )}
        {step === 1 && (
          <SimpleGrid cols={2} spacing="md">
            {PLANS.filter(p => p.price).map(p => (
              <Paper key={p.id} withBorder p="md" radius="md" style={{ cursor: "pointer" }}
                onClick={() => setStep(2)}>
                <Text fw={700}>{p.name}</Text>
                <Text size="xl" fw={800} c="violet">{fmtINR(p.price)}<Text span size="sm" c="dimmed" fw={400}>/mo</Text></Text>
                <Text size="xs" c="dimmed">{p.users} users · {p.storage} GB</Text>
              </Paper>
            ))}
          </SimpleGrid>
        )}
        {step === 2 && (
          <Stack gap="md">
            <NumberInput label="User Limit Override" placeholder="Leave blank for plan default" radius="md" />
            <NumberInput label="Storage Override (GB)" placeholder="Leave blank for plan default" radius="md" />
          </Stack>
        )}
        {step === 3 && (
          <Stack gap="md">
            <Select label="Billing Cycle" data={["Monthly","Quarterly","Annual"]} radius="md" />
            <TextInput label="Discount Code" placeholder="Optional coupon code" radius="md" />
            <Select label="Payment Gateway" data={GATEWAYS.map(g => g.name)} radius="md" />
          </Stack>
        )}
        {step === 4 && (
          <Stack gap="md">
            <Paper withBorder p="md" radius="md" bg="var(--mantine-color-default-hover)">
              <Text fw={600} mb="xs">Review & Activate</Text>
              <Text size="sm" c="dimmed">Please review all details before activating this subscription.</Text>
            </Paper>
          </Stack>
        )}

        <Group justify="flex-end" mt="xl" gap="sm">
          {step > 0 && <Button variant="default" onClick={() => setStep(s => s - 1)}>Back</Button>}
          {step < 4
            ? <Button onClick={() => setStep(s => s + 1)}>Next</Button>
            : <Button color="green" leftSection={<IconCircleCheck size={14} />} onClick={() => { setShowCreate(false); setStep(0); toast?.show("Subscription activated", "success"); }}>Activate</Button>
          }
        </Group>
      </Modal>

      <Modal opened={!!viewSub} onClose={() => setViewSub(null)} title="Subscription Details" size="md" radius="lg">
        {viewSub && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Company</Text><Text fw={600}>{viewSub.company}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Plan</Text><Badge variant="light" color="violet">{viewSub.plan}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Users</Text><Text>{viewSub.users}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Billing Cycle</Text><Text>{viewSub.cycle}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Start Date</Text><Text>{fmtDate(viewSub.start)}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Renewal Date</Text><Text>{fmtDate(viewSub.renewal)}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Amount</Text><Text fw={700} size="lg">{viewSub.amount ? fmtINR(viewSub.amount) : "Free"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color={STATUS_COLOR[viewSub.status]} variant="light">{viewSub.status}</Badge></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 3. Plans Tab ─────────────────────────────────────────────────────────────
function PlansTab({ toast }) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>Create Plan</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {PLANS.map(p => (
          <Paper key={p.id} withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="lg">{p.name}</Text>
              <Badge size="xs" color="green" variant="light">{p.status}</Badge>
            </Group>
            <Group align="baseline" gap={4} mb="sm">
              {p.price
                ? <><Text fw={800} size="28px" c="violet">₹{p.price.toLocaleString("en-IN")}</Text><Text size="sm" c="dimmed">/{p.cycle}</Text></>
                : <Text fw={700} size="xl" c="dimmed">Custom Pricing</Text>
              }
            </Group>
            <Divider mb="sm" />
            <Stack gap={4} mb="md">
              {[
                ["Users",   p.users   ? `${p.users} seats`         : "Unlimited"],
                ["Storage", p.storage ? `${p.storage} GB`          : "Unlimited"],
                ["AI Credits", p.ai   ? `${p.ai.toLocaleString()} credits` : "Unlimited"],
                ["API Calls",  p.api  ? `${p.api.toLocaleString()}/mo`     : "Unlimited"],
                ["Support", p.support],
              ].map(([k, v]) => (
                <Group key={k} justify="space-between">
                  <Text size="xs" c="dimmed">{k}</Text>
                  <Text size="xs" fw={500}>{v}</Text>
                </Group>
              ))}
            </Stack>
            <Stack gap={3} mb="lg">
              {p.modules.map(m => (
                <Group key={m} gap={6}><IconCheck size={12} color="var(--mantine-color-green-6)" /><Text size="xs">{m}</Text></Group>
              ))}
            </Stack>
            <Group gap="xs">
              <Button size="xs" variant="light" leftSection={<IconEye size={12} />} onClick={() => setViewPlan(p)}>View</Button>
              <Button size="xs" variant="default" leftSection={<IconPencil size={12} />}>Edit</Button>
              <Button size="xs" variant="default" onClick={() => toast?.show(`${p.name} duplicated`, "success")}>Duplicate</Button>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create Plan" size="md" radius="lg">
        <Stack gap="md">
          <TextInput label="Plan Name" placeholder="e.g. Enterprise Plus" radius="md" />
          <Textarea label="Description" placeholder="What's included in this plan…" radius="md" />
          <Group grow gap="sm">
            <NumberInput label="Price (₹)" placeholder="Monthly price" radius="md" />
            <Select label="Billing Cycle" data={["Monthly","Annual","Custom"]} radius="md" />
          </Group>
          <Group grow gap="sm">
            <NumberInput label="User Limit" placeholder="Max users" radius="md" />
            <NumberInput label="Storage (GB)" placeholder="Storage limit" radius="md" />
          </Group>
          <Group grow gap="sm">
            <NumberInput label="AI Credits" placeholder="Credits/month" radius="md" />
            <NumberInput label="API Calls/mo" placeholder="API limit" radius="md" />
          </Group>
          <Select label="Support Level" data={["Email","Email+Chat","Priority","Dedicated"]} radius="md" />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="outline">Save Draft</Button>
            <Button leftSection={<IconCircleCheck size={14} />} onClick={() => { setShowCreate(false); toast?.show("Plan published", "success"); }}>Publish</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!viewPlan} onClose={() => setViewPlan(null)} title="Plan Details" size="md" radius="lg">
        {viewPlan && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Name</Text><Text fw={700}>{viewPlan.name}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color="green" variant="light">{viewPlan.status}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Price</Text><Text fw={700} size="lg">{viewPlan.price ? `₹${viewPlan.price.toLocaleString("en-IN")}/${viewPlan.cycle}` : "Custom"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Users</Text><Text>{viewPlan.users ?? "Unlimited"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Storage</Text><Text>{viewPlan.storage ? `${viewPlan.storage} GB` : "Unlimited"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">AI Credits</Text><Text>{viewPlan.ai ? viewPlan.ai.toLocaleString() : "Unlimited"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Support</Text><Text>{viewPlan.support}</Text></Group>
            {viewPlan.modules?.length > 0 && <><Text size="sm" c="dimmed" mt="xs">Modules</Text><Text size="sm">{viewPlan.modules.join(", ")}</Text></>}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 4. Customers Tab ─────────────────────────────────────────────────────────
function CustomersTab() {
  const [search, setSearch] = useState("");
  const [viewCust, setViewCust] = useState(null);
  const filtered = CUSTOMERS.filter(c => c.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <Stack gap="md">
      <TextInput placeholder="Search customers…" leftSection={<IconSearch size={14} />}
        value={search} onChange={e => setSearch(e.currentTarget.value)} maw={340} radius="md" />

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Company</Table.Th>
                <Table.Th>Tenant ID</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Admin</Table.Th>
                <Table.Th>MRR</Table.Th>
                <Table.Th>Renewal</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(c => (
                <Table.Tr key={c.id}>
                  <Table.Td><Text size="sm" fw={500}>{c.company}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed" ff="monospace">{c.tenant}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="blue">{c.plan}</Badge></Table.Td>
                  <Table.Td>{c.admin}</Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{c.mrr ? fmtINR(c.mrr) : "—"}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(c.renewal)}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[c.status]} variant="light">{c.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View Profile"><ActionIcon size="sm" variant="subtle" onClick={() => setViewCust(c)}><IconEye size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Subscriptions"><ActionIcon size="sm" variant="subtle"><IconFileInvoice size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Usage"><ActionIcon size="sm" variant="subtle" color="blue"><IconChartBar size={14} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={!!viewCust} onClose={() => setViewCust(null)} title="Customer Profile" size="md" radius="lg">
        {viewCust && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Company</Text><Text fw={700}>{viewCust.company}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Tenant ID</Text><Text ff="monospace" size="sm">{viewCust.tenant}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Plan</Text><Badge variant="light" color="blue">{viewCust.plan}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Admin</Text><Text>{viewCust.admin}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">MRR</Text><Text fw={700} size="lg">{viewCust.mrr ? fmtINR(viewCust.mrr) : "—"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Renewal</Text><Text>{fmtDate(viewCust.renewal)}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color={STATUS_COLOR[viewCust.status]} variant="light">{viewCust.status}</Badge></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 5. Invoices Tab ───────────────────────────────────────────────────────────
function InvoicesTab({ toast }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showGen, setShowGen] = useState(false);

  const filtered = INVOICES.filter(i => {
    const q = search.toLowerCase();
    return (i.id.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q))
      && (filterStatus === "All" || i.status === filterStatus);
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          <TextInput placeholder="Search invoice or customer…" leftSection={<IconSearch size={14} />}
            value={search} onChange={e => setSearch(e.currentTarget.value)} style={{ minWidth: 220 }} radius="md" />
          <Select data={["All","Paid","Pending","Overdue","Void"]} value={filterStatus}
            onChange={v => setFilterStatus(v)} w={140} radius="md" />
        </Group>
        <Group gap="sm">
          <Button variant="default" leftSection={<IconDownload size={14} />}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} onClick={() => setShowGen(true)}>Generate Invoice</Button>
        </Group>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Invoice #</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Period</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Tax (18%)</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Due Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(inv => (
                <Table.Tr key={inv.id}>
                  <Table.Td><Text size="xs" ff="monospace">{inv.id}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{inv.customer}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="violet">{inv.plan}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{inv.period}</Text></Table.Td>
                  <Table.Td>{fmtINR(inv.amount)}</Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtINR(inv.tax)}</Text></Table.Td>
                  <Table.Td><Text fw={600}>{fmtINR(inv.total)}</Text></Table.Td>
                  <Table.Td><Text size="xs" c={inv.status === "Overdue" ? "red" : "dimmed"}>{fmtDate(inv.due)}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[inv.status]} variant="light">{inv.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Download PDF"><ActionIcon size="sm" variant="subtle"><IconDownload size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Email"><ActionIcon size="sm" variant="subtle" color="blue"><IconSend size={14} /></ActionIcon></Tooltip>
                      {inv.status === "Pending" && <Tooltip label="Record Payment"><ActionIcon size="sm" variant="subtle" color="green"><IconCheck size={14} /></ActionIcon></Tooltip>}
                      <Tooltip label="Void"><ActionIcon size="sm" variant="subtle" color="red"><IconBan size={14} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {filtered.length === 0 && <AppEmptyState icon={<IconFileInvoice size={22} />} message="No invoices found" sub="Try adjusting your filters." py={40} />}
      </Paper>

      <Modal opened={showGen} onClose={() => setShowGen(false)} title="Generate Invoice" size="md" radius="lg">
        <Stack gap="md">
          <Select label="Customer" placeholder="Select customer" data={CUSTOMERS.map(c => c.company)} radius="md" />
          <Select label="Subscription" placeholder="Select subscription" data={SUBSCRIPTIONS.map(s => s.id)} radius="md" />
          <Group grow gap="sm">
            <TextInput label="Billing Period From" type="date" radius="md" />
            <TextInput label="Billing Period To" type="date" radius="md" />
          </Group>
          <TextInput label="Due Date" type="date" radius="md" />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setShowGen(false)}>Cancel</Button>
            <Button onClick={() => { setShowGen(false); toast?.show("Invoice generated", "success"); }}>Generate</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── 6. Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab({ toast }) {
  const today = PAYMENTS.filter(p => p.status === "Success").reduce((s, p) => s + p.amount, 0);
  const pending = PAYMENTS.filter(p => p.status === "Pending").length;
  const failed  = PAYMENTS.filter(p => p.status === "Failed").length;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatCard label="Collected Today" value={fmtINR(today)} color="green" icon={IconCheck} />
        <StatCard label="Pending"         value={pending}       color="orange" icon={IconClock} />
        <StatCard label="Failed"          value={failed}        color="red" icon={IconAlertTriangle} />
        <StatCard label="Refunds"         value={0}             color="gray" icon={IconRotate} />
      </SimpleGrid>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Transaction ID</Table.Th>
                <Table.Th>Invoice</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Gateway</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {PAYMENTS.map(p => (
                <Table.Tr key={p.id}>
                  <Table.Td><Text size="xs" ff="monospace">{p.id}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{p.invoice}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{p.customer}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="outline">{p.gateway}</Badge></Table.Td>
                  <Table.Td><Text fw={600}>{fmtINR(p.amount)}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(p.date)}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[p.status]} variant="light">{p.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View Receipt"><ActionIcon size="sm" variant="subtle"><IconPrinter size={14} /></ActionIcon></Tooltip>
                      {p.status === "Failed" && <Tooltip label="Retry"><ActionIcon size="sm" variant="subtle" color="orange"><IconRotate size={14} /></ActionIcon></Tooltip>}
                      {p.status === "Success" && <Tooltip label="Refund"><ActionIcon size="sm" variant="subtle" color="red"><IconArrowDownRight size={14} /></ActionIcon></Tooltip>}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}

// ── 7. Renewals Tab ───────────────────────────────────────────────────────────
function RenewalsTab() {
  const now = new Date();
  const inDays = (d, n) => { const diff = (new Date(d) - now) / 86400000; return diff >= 0 && diff <= n; };

  const today    = SUBSCRIPTIONS.filter(s => inDays(s.renewal, 1));
  const thisWeek = SUBSCRIPTIONS.filter(s => inDays(s.renewal, 7) && !inDays(s.renewal, 1));
  const thisMonth= SUBSCRIPTIONS.filter(s => inDays(s.renewal, 30) && !inDays(s.renewal, 7));

  const RenewalGroup = ({ title, items, color }) => (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600}>{title}</Text>
        <Badge color={color} variant="light">{items.length}</Badge>
      </Group>
      {items.length === 0
        ? <Text size="sm" c="dimmed" ta="center" py="sm">None</Text>
        : <Stack gap="sm">
            {items.map(s => (
              <Group key={s.id} justify="space-between">
                <div>
                  <Text size="sm" fw={500}>{s.company}</Text>
                  <Text size="xs" c="dimmed">{s.plan} · {fmtINR(s.amount)}</Text>
                </div>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">{fmtDate(s.renewal)}</Text>
                  <Button size="xs" variant="light" color="green">Renew</Button>
                </Group>
              </Group>
            ))}
          </Stack>
      }
    </Paper>
  );

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <RenewalGroup title="Due Today"      items={today}     color="red"    />
        <RenewalGroup title="This Week"      items={thisWeek}  color="orange" />
        <RenewalGroup title="This Month"     items={thisMonth} color="blue"   />
      </SimpleGrid>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">All Upcoming Renewals</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Company</Table.Th><Table.Th>Plan</Table.Th><Table.Th>Amount</Table.Th>
              <Table.Th>Renewal Date</Table.Th><Table.Th>Status</Table.Th><Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {SUBSCRIPTIONS.filter(s => s.status === "Active").map(s => (
              <Table.Tr key={s.id}>
                <Table.Td>{s.company}</Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="violet">{s.plan}</Badge></Table.Td>
                <Table.Td>{fmtINR(s.amount)}</Table.Td>
                <Table.Td>{fmtDate(s.renewal)}</Table.Td>
                <Table.Td><Badge size="xs" color="green" variant="light">Active</Badge></Table.Td>
                <Table.Td><Button size="xs" variant="light">Renew</Button></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

// ── 8. Free Trials Tab ────────────────────────────────────────────────────────
function TrialsTab({ toast }) {
  const active    = TRIALS.filter(t => t.status === "Active").length;
  const expiring  = TRIALS.filter(t => t.status === "Active" && t.remaining <= 3).length;
  const converted = TRIALS.filter(t => t.status === "Converted").length;
  const expired   = TRIALS.filter(t => t.status === "Expired").length;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatCard label="Active Trials"     value={active}    color="blue"   icon={IconClock} />
        <StatCard label="Expiring Soon"     value={expiring}  color="orange" icon={IconAlertTriangle} />
        <StatCard label="Converted"         value={converted} color="green"  icon={IconCircleCheck} />
        <StatCard label="Expired"           value={expired}   color="gray"   icon={IconX} />
      </SimpleGrid>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th><Table.Th>Plan</Table.Th>
              <Table.Th>Start</Table.Th><Table.Th>End</Table.Th>
              <Table.Th>Days Left</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {TRIALS.map(t => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.customer}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="blue">{t.plan}</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{fmtDate(t.start)}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{fmtDate(t.end)}</Text></Table.Td>
                <Table.Td>
                  <Badge size="xs" color={t.remaining <= 3 ? "red" : t.remaining <= 7 ? "orange" : "green"} variant="light">
                    {t.remaining > 0 ? `${t.remaining}d` : "—"}
                  </Badge>
                </Table.Td>
                <Table.Td><Badge size="xs" color={STATUS_COLOR[t.status]} variant="light">{t.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    {t.status === "Active" && <>
                      <Button size="xs" variant="light" onClick={() => toast?.show("Trial extended by 7 days", "success")}>Extend</Button>
                      <Button size="xs" variant="filled" color="green" onClick={() => toast?.show("Trial converted to subscription", "success")}>Convert</Button>
                    </>}
                    {t.status !== "Active" && <Text size="xs" c="dimmed">—</Text>}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

// ── 9. Discounts Tab ─────────────────────────────────────────────────────────
function DiscountsTab({ toast }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>Create Coupon</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Coupon Code</Table.Th><Table.Th>Description</Table.Th>
              <Table.Th>Discount</Table.Th><Table.Th>Valid Until</Table.Th>
              <Table.Th>Usage</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {DISCOUNTS.map(d => (
              <Table.Tr key={d.code}>
                <Table.Td><Text size="sm" fw={700} ff="monospace">{d.code}</Text></Table.Td>
                <Table.Td><Text size="sm">{d.desc}</Text></Table.Td>
                <Table.Td><Badge color="violet" variant="light">{d.pct}% off</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{fmtDate(d.validity)}</Text></Table.Td>
                <Table.Td><Text size="xs">{d.used} / {d.max}</Text></Table.Td>
                <Table.Td><Badge size="xs" color={d.status === "Active" ? "green" : "gray"} variant="light">{d.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle"><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Deactivate"><ActionIcon size="sm" variant="subtle" color="orange"><IconBan size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red"><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create Coupon" size="sm" radius="lg">
        <Stack gap="md">
          <TextInput label="Coupon Code" placeholder="e.g. SAVE20" radius="md" />
          <TextInput label="Description" placeholder="Short description" radius="md" />
          <NumberInput label="Discount (%)" min={1} max={100} radius="md" />
          <TextInput label="Valid Until" type="date" radius="md" />
          <NumberInput label="Max Usage" radius="md" />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { setShowCreate(false); toast?.show("Coupon created", "success"); }}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── 10. Payment Gateways Tab ──────────────────────────────────────────────────
function GatewaysTab({ toast }) {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {GATEWAYS.map(g => (
          <Paper key={g.id} withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Group gap="md">
                <Paper w={48} h={48} radius="md"
                  style={{ background: g.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Text c="white" fw={800} size="lg">{g.logo}</Text>
                </Paper>
                <div>
                  <Text fw={700}>{g.name}</Text>
                  <Text size="xs" c="dimmed">{g.txns} transactions</Text>
                </div>
              </Group>
              <Badge color={STATUS_COLOR[g.status]} variant="light">{g.status}</Badge>
            </Group>
            <Stack gap={6} mb="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Environment</Text>
                <Badge size="xs" variant="outline" color={g.env === "Production" ? "green" : "orange"}>{g.env}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">API Key</Text>
                <Text size="xs" ff="monospace">••••••••••••{g.id.slice(-4)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Webhook</Text>
                <Text size="xs" c="dimmed">Configured</Text>
              </Group>
            </Stack>
            <Group gap="xs">
              <Button size="xs" variant="light" leftSection={<IconSettings size={12} />}
                onClick={() => toast?.show(`Opening ${g.name} config…`, "info")}>Configure</Button>
              <Button size="xs" variant="default"
                onClick={() => toast?.show(`Testing ${g.name} connection…`, "info")}>Test</Button>
              <Switch size="xs" checked={g.status !== "Disabled"} label={g.status !== "Disabled" ? "Enabled" : "Disabled"} />
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// ── 11. Revenue Reports Tab ───────────────────────────────────────────────────
function RevenueTab() {
  const totalRevenue = REVENUE_TREND.reduce((s, r) => s + r.revenue, 0);
  const mrr = REVENUE_TREND.at(-1).mrr;
  const arr = mrr * 12;

  const TOP_CUSTOMERS = CUSTOMERS.slice(0, 5).map((c, i) => ({
    company: c.company,
    mrr: c.mrr,
    pct: Math.round((c.mrr / mrr) * 100),
  }));

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatCard label="Total Revenue (YTD)" value={fmtINR(totalRevenue)} color="violet" icon={IconTrendingUp} />
        <StatCard label="MRR"                 value={fmtINR(mrr)}          color="blue"   icon={IconCurrencyRupee} />
        <StatCard label="ARR"                 value={fmtINR(arr)}          color="green"  icon={IconChartBar} />
        <StatCard label="Avg Revenue/Customer" value={fmtINR(Math.round(mrr / CUSTOMERS.length))} color="orange" icon={IconUsers} />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Revenue Trend (12 months)</Text>
              <Group gap="xs">
                <Button size="xs" variant="default" leftSection={<IconDownload size={12} />}>Excel</Button>
                <Button size="xs" variant="default" leftSection={<IconDownload size={12} />}>CSV</Button>
                <Button size="xs" variant="default" leftSection={<IconPrinter size={12} />}>PDF</Button>
              </Group>
            </Group>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <RTooltip content={<ChartTooltip />} formatter={v => fmtINR(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={SPARK_HEX.violet} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="mrr"     name="MRR"     stroke={SPARK_HEX.blue}   strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="lg" h="100%">
            <Text fw={600} mb="md">Revenue by Plan</Text>
            <Stack gap="sm">
              {PLAN_DIST.map(p => {
                const planSubs = SUBSCRIPTIONS.filter(s => s.plan === p.name);
                const planRev = planSubs.reduce((s, sub) => s + (sub.amount || 0), 0);
                const pct = Math.round((planRev / (SUBSCRIPTIONS.reduce((s, sub) => s + sub.amount, 0) || 1)) * 100);
                return (
                  <div key={p.name}>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs">{p.name}</Text>
                      <Text size="xs" fw={600}>{fmtINR(planRev)}</Text>
                    </Group>
                    <Progress value={pct} color={p.color.replace("#","")} size="sm" radius="xl" />
                  </div>
                );
              })}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Top Customers by MRR</Text>
        <Table striped>
          <Table.Thead>
            <Table.Tr><Table.Th>Company</Table.Th><Table.Th>Plan</Table.Th><Table.Th>MRR</Table.Th><Table.Th>Share</Table.Th></Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {CUSTOMERS.filter(c => c.mrr > 0).sort((a, b) => b.mrr - a.mrr).map(c => (
              <Table.Tr key={c.id}>
                <Table.Td>{c.company}</Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="violet">{c.plan}</Badge></Table.Td>
                <Table.Td><Text fw={600}>{fmtINR(c.mrr)}</Text></Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Progress value={Math.round((c.mrr / mrr) * 100)} size="xs" style={{ flex: 1, minWidth: 80 }} />
                    <Text size="xs" c="dimmed">{Math.round((c.mrr / mrr) * 100)}%</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

// ── 12. Billing Settings Tab ──────────────────────────────────────────────────
function BillingSettingsTab({ toast }) {
  const [settings, setSettings] = useState({
    prefix: "INV",
    format: "INV-YYYY-NNN",
    currency: "INR",
    timezone: "Asia/Kolkata",
    gst: "18",
    gracePeriod: "7",
    lateFee: "2",
    reminder1: "7",
    reminder2: "3",
    reminder3: "1",
  });

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <Stack gap="lg" maw={640}>
      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Invoice Settings</Text>
        <Stack gap="md">
          <Group grow gap="sm">
            <TextInput label="Invoice Prefix" value={settings.prefix} onChange={e => set("prefix", e.currentTarget.value)} radius="md" />
            <TextInput label="Number Format" value={settings.format} onChange={e => set("format", e.currentTarget.value)} radius="md" />
          </Group>
          <Group grow gap="sm">
            <Select label="Currency" value={settings.currency} onChange={v => set("currency", v)}
              data={["INR","USD","EUR","GBP","SGD"]} radius="md" />
            <Select label="Timezone" value={settings.timezone} onChange={v => set("timezone", v)}
              data={["Asia/Kolkata","UTC","America/New_York","Europe/London"]} radius="md" />
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Tax Rules</Text>
        <Stack gap="md">
          <Group grow gap="sm">
            <NumberInput label="GST (%)" value={Number(settings.gst)} onChange={v => set("gst", String(v))} min={0} max={28} radius="md" />
            <Switch label="Apply GST on all invoices" defaultChecked mt="xl" />
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Payment Reminders</Text>
        <Stack gap="md">
          <Group grow gap="sm">
            <NumberInput label="Reminder 1 (days before)" value={Number(settings.reminder1)} onChange={v => set("reminder1", String(v))} min={1} radius="md" />
            <NumberInput label="Reminder 2 (days before)" value={Number(settings.reminder2)} onChange={v => set("reminder2", String(v))} min={1} radius="md" />
            <NumberInput label="Reminder 3 (days before)" value={Number(settings.reminder3)} onChange={v => set("reminder3", String(v))} min={0} radius="md" />
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Grace Period & Late Fees</Text>
        <Stack gap="md">
          <Group grow gap="sm">
            <NumberInput label="Grace Period (days)" value={Number(settings.gracePeriod)} onChange={v => set("gracePeriod", String(v))} min={0} radius="md" />
            <NumberInput label="Late Fee (%)" value={Number(settings.lateFee)} onChange={v => set("lateFee", String(v))} min={0} max={100} radius="md" />
          </Group>
        </Stack>
      </Paper>

      <Group gap="sm">
        <Button leftSection={<IconCheck size={14} />} onClick={() => toast?.show("Settings saved", "success")}>Save Settings</Button>
        <Button variant="default" onClick={() => toast?.show("Settings reset to default", "info")}>Reset to Default</Button>
      </Group>
    </Stack>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BillingManagement() {
  const [tab, setTab] = useState("dashboard");
  const toast = useToast();

  const handleAction = (label) => {
    const tabMap = {
      "Total Customers": "customers",
      "Active Subscriptions": "subscriptions",
      "Trial Customers": "trials",
      "Renewals Due": "renewals",
      "Failed Payments": "payments",
      "Outstanding": "invoices",
      "MRR": "revenue",
      "ARR": "revenue",
      "Create Subscription": "subscriptions",
      "Generate Invoice": "invoices",
      "Record Payment": "payments",
      "Create Plan": "plans",
      "Add Customer": "customers",
      "Extend Trial": "trials",
    };
    if (tabMap[label]) setTab(tabMap[label]);
  };

  const TABS = [
    { id: "dashboard",     label: "Dashboard",       icon: IconLayoutDashboard2 },
    { id: "subscriptions", label: "Subscriptions",   icon: IconFileInvoice },
    { id: "plans",         label: "Plans",           icon: IconSettings },
    { id: "customers",     label: "Customers",       icon: IconBuilding },
    { id: "invoices",      label: "Invoices",        icon: IconReceipt },
    { id: "payments",      label: "Payments",        icon: IconCreditCard },
    { id: "renewals",      label: "Renewals",        icon: IconRotate },
    { id: "trials",        label: "Free Trials",     icon: IconClock },
    { id: "discounts",     label: "Discounts",       icon: IconGift },
    { id: "gateways",      label: "Gateways",        icon: IconPlugConnected },
    { id: "revenue",       label: "Revenue Reports", icon: IconChartBar },
    { id: "billing-settings", label: "Settings",    icon: IconSettings2 },
  ];

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      <AppPageHeader
        title="Subscription & Billing"
        sub="Manage customer subscriptions, revenue and billing operations"
        action={
          <Group gap="sm">
            <Button variant="default" leftSection={<IconDownload size={14} />}>Export Report</Button>
            <Button variant="default" leftSection={<IconFileInvoice size={14} />} onClick={() => setTab("invoices")}>Generate Invoice</Button>
            <Button leftSection={<IconPlus size={14} />} onClick={() => setTab("subscriptions")}>Create Subscription</Button>
          </Group>
        }
        onRefresh={() => {}}
      />

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs value={tab} onChange={setTab}>
          <ScrollArea>
            <Tabs.List px="sm" style={{ flexWrap: "nowrap" }}>
              {TABS.map(t => (
                <Tabs.Tab key={t.id} value={t.id} leftSection={<t.icon size={14} />}
                  style={{ whiteSpace: "nowrap" }}>
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>

          <Box p="lg">
            <Tabs.Panel value="dashboard"><DashboardTab onAction={handleAction} /></Tabs.Panel>
            <Tabs.Panel value="subscriptions"><SubscriptionsTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="plans"><PlansTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="customers"><CustomersTab /></Tabs.Panel>
            <Tabs.Panel value="invoices"><InvoicesTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="payments"><PaymentsTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="renewals"><RenewalsTab /></Tabs.Panel>
            <Tabs.Panel value="trials"><TrialsTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="discounts"><DiscountsTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="gateways"><GatewaysTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="revenue"><RevenueTab /></Tabs.Panel>
            <Tabs.Panel value="billing-settings"><BillingSettingsTab toast={toast} /></Tabs.Panel>
          </Box>
        </Tabs>
      </Paper>
    </Stack>
  );
}

