import { useState, useEffect, useRef } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Textarea, Modal, Table, Loader, Center, ColorInput, Select,
  Avatar, ActionIcon, Tooltip, Paper, Grid, ThemeIcon, ScrollArea,
  Switch, FileInput, Divider, NumberInput, Progress, Image,
} from "@mantine/core";
import {
  IconPalette, IconChartBar, IconMail, IconWorld, IconBrush, IconPhoto,
  IconDeviceFloppy, IconRocket, IconRotate, IconCheck, IconTrash,
  IconLogin2, IconBuildingStore, IconPlus, IconEye, IconPencil,
  IconCopy, IconArchive, IconRefresh, IconMessage, IconFileText,
  IconCertificate, IconUpload, IconDownload, IconDeviceDesktop,
  IconDeviceTablet, IconDeviceMobile, IconSettings, IconBan,
  IconSearch, IconUsers, IconShieldCheck, IconColorSwatch,
  IconLetterCase, IconLink, IconFolderOpen, IconHistory, IconBell,
  IconChevronRight, IconAlertTriangle,
} from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { ChartTooltip, SPARK_HEX } from "../dashboard/components/DashboardKit";

// ── API response unwrapper ────────────────────────────────────────────────────
const r = res => res.data?.data ?? res.data ?? res;

// ── Mock fallback data ────────────────────────────────────────────────────────

const MOCK_BRAND_SETTINGS = {
  companyName:    "Mgate Technologies",
  shortName:      "Mgate",
  tagline:        "Empowering Your Workforce",
  website:        "https://mgate.com",
  logoUrl:        "",
  darkLogoUrl:    "",
  lightLogoUrl:   "",
  faviconUrl:     "",
  primaryColor:   "#1d4ed8",
  secondaryColor: "#3b82f6",
  accentColor:    "#f59e0b",
  sidebarColor:   "#1e3a8a",
  successColor:   "#10b981",
  warningColor:   "#f59e0b",
  primaryFont:    "Inter",
  theme:          "Corporate Blue",
  borderRadius:   8,
  supportEmail:   "support@mgate.com",
  supportPhone:   "+91 98765 43210",
  loginTitle:     "HRPLUSE — Mgate",
  loginWelcome:   "Welcome Back",
  loginSlogan:    "Sign in to continue to your HR portal",
  loginBgUrl:     "",
  loginFooter:    "© 2026 Mgate Technologies. All rights reserved.",
};

const MOCK_BRAND_DASHBOARD = {
  customEmailTemplates: 7,
};

// ── Constants ─────────────────────────────────────────────────────────────────
const THEMES_LIST = ["Light", "Dark", "System", "Corporate Blue", "Modern Green", "Purple", "Custom"];
const FONTS       = ["Inter", "Roboto", "Poppins", "Open Sans", "Lato", "Montserrat"];

const MOCK_BRAND_PROFILES = [
  { id: 1, company: "Mgate Technologies",  tenant: "mgate",    theme: "Corporate Blue", color: "#1d4ed8", domain: "hr.mgate.com",     status: "Published" },
  { id: 2, company: "Nexgen Solutions",    tenant: "nexgen",   theme: "Modern Green",   color: "#059669", domain: "nexgen.hrpluse.com",status: "Published" },
  { id: 3, company: "Infospark Pvt Ltd",   tenant: "infospark",theme: "Purple",         color: "#7c3aed", domain: "—",                 status: "Draft"     },
  { id: 4, company: "Brightwave Corp",     tenant: "bwave",    theme: "Light",          color: "#f59e0b", domain: "bwave.hrpluse.com", status: "Published" },
  { id: 5, company: "Zenith Retail",       tenant: "zenith",   theme: "Dark",           color: "#1e293b", domain: "hr.zenith.in",      status: "Pending"   },
  { id: 6, company: "CloudBase Inc",       tenant: "cloudbase",theme: "Custom",         color: "#06b6d4", domain: "—",                 status: "Draft"     },
];

const PRESET_THEMES = [
  { id: "corporate-blue", name: "Corporate Blue",  primary: "#1d4ed8", secondary: "#3b82f6", accent: "#f59e0b", sidebar: "#1e3a8a", font: "Inter" },
  { id: "modern-green",   name: "Modern Green",    primary: "#059669", secondary: "#10b981", accent: "#3b82f6", sidebar: "#064e3b", font: "Roboto" },
  { id: "purple",         name: "Purple",          primary: "#7c3aed", secondary: "#8b5cf6", accent: "#f59e0b", sidebar: "#4c1d95", font: "Poppins" },
  { id: "dark",           name: "Dark",            primary: "#6366f1", secondary: "#8b5cf6", accent: "#f59e0b", sidebar: "#0f172a", font: "Inter" },
  { id: "light",          name: "Light",           primary: "#2563eb", secondary: "#64748b", accent: "#f97316", sidebar: "#f1f5f9", font: "Inter" },
  { id: "custom",         name: "Custom Theme",    primary: "#e11d48", secondary: "#f43f5e", accent: "#0ea5e9", sidebar: "#1c1917", font: "Montserrat" },
];

const PORTAL_TYPES = [
  { id: "employee",   label: "Employee Portal",    color: "blue"   },
  { id: "manager",    label: "Manager Portal",     color: "green"  },
  { id: "admin",      label: "Admin Portal",       color: "violet" },
  { id: "superadmin", label: "Super Admin Portal", color: "red"    },
];

const MOCK_SMS_TEMPLATES = [
  { id: 1, type: "OTP",        body: "Your HRPLUSE OTP is {{otp}}. Valid for 5 minutes.", status: "Active" },
  { id: 2, type: "Attendance", body: "Hi {{name}}, your attendance for {{date}} has been marked.", status: "Active" },
  { id: 3, type: "Leave",      body: "Hi {{name}}, your leave request has been {{status}}.", status: "Active" },
  { id: 4, type: "Payroll",    body: "Hi {{name}}, your payslip for {{month}} is ready.", status: "Active" },
  { id: 5, type: "Approval",   body: "Hi {{name}}, your {{type}} request needs your attention.", status: "Disabled" },
  { id: 6, type: "Notification",body: "HRPLUSE: {{message}}", status: "Active" },
];

const MOCK_DOC_TEMPLATES = [
  { id: 1, category: "Offer Letter",        lastUpdated: "2026-06-10", status: "Published" },
  { id: 2, category: "Appointment Letter",  lastUpdated: "2026-05-22", status: "Published" },
  { id: 3, category: "Salary Slip",         lastUpdated: "2026-06-01", status: "Published" },
  { id: 4, category: "Experience Letter",   lastUpdated: "2026-04-15", status: "Draft"     },
  { id: 5, category: "Relieving Letter",    lastUpdated: "2026-03-30", status: "Published" },
  { id: 6, category: "HR Policy",           lastUpdated: "2026-06-20", status: "Published" },
  { id: 7, category: "Certificate",         lastUpdated: "2026-02-10", status: "Draft"     },
];

const MOCK_DOMAINS = [
  { id: 1, domain: "hr.mgate.com",      tenant: "mgate",    ssl: "Active",  status: "Verified",  expiry: "2027-06-01" },
  { id: 2, domain: "nexgen.hrpluse.com",tenant: "nexgen",   ssl: "Active",  status: "Verified",  expiry: "2027-03-15" },
  { id: 3, domain: "hr.zenith.in",      tenant: "zenith",   ssl: "Pending", status: "Pending",   expiry: "—"          },
  { id: 4, domain: "bwave.hrpluse.com", tenant: "bwave",    ssl: "Active",  status: "Verified",  expiry: "2026-09-30" },
];

const MOCK_BRAND_ASSETS = [
  { id: 1, name: "mgate-logo.png",       folder: "Logos",         size: "42 KB", type: "image/png" },
  { id: 2, name: "nexgen-logo.svg",      folder: "Logos",         size: "12 KB", type: "image/svg" },
  { id: 3, name: "hero-bg.jpg",          folder: "Backgrounds",   size: "820 KB",type: "image/jpeg"},
  { id: 4, name: "avatar-default.png",   folder: "Icons",         size: "8 KB",  type: "image/png" },
  { id: 5, name: "offer-letter.docx",    folder: "Documents",     size: "118 KB",type: "doc"       },
  { id: 6, name: "Inter-Regular.woff2",  folder: "Fonts",         size: "64 KB", type: "font"      },
];

const MOCK_ADOPTION_TREND = ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({
  month: m, branded: 4 + i, total: 8 + i,
}));

const STATUS_COLOR = {
  Published: "green", Draft: "orange", Pending: "yellow", Archived: "gray",
  Verified: "green", Active: "green", Disabled: "gray", Failed: "red",
};

const fmtDate = (d) => d && d !== "—" ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Shared KPI card ───────────────────────────────────────────────────────────
function Kpi({ label, value, icon: Icon, color, sub, onClick }) {
  return (
    <Card withBorder radius="lg" p="md" style={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase">{label}</Text>
        <ThemeIcon size={34} radius={10} variant="light" color={color}><Icon size={17} /></ThemeIcon>
      </Group>
      <Text fw={800} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ── Live preview panel ────────────────────────────────────────────────────────
function LivePreview({ form, viewport = "desktop" }) {
  const w = viewport === "mobile" ? 200 : viewport === "tablet" ? 280 : 320;
  return (
    <Card withBorder radius="lg" p={0} style={{ overflow: "hidden", width: w, flexShrink: 0 }}>
      <Box p="xs" style={{ background: form.primaryColor || "#1d4ed8", color: "#fff" }}>
        <Group gap="xs">
          <Avatar size={26} radius="md" style={{ background: "rgba(255,255,255,0.25)" }}>
            {(form.shortName || form.companyName || "MG").slice(0, 2).toUpperCase()}
          </Avatar>
          <Text fw={700} size="sm" c="white">{form.companyName || "Your Company"}</Text>
        </Group>
      </Box>
      <Group align="stretch" gap={0}>
        <Box style={{ width: 72, background: form.sidebarColor || "#1e3a8a", borderRight: "1px solid #e2e8f0", padding: 6 }}>
          {["Dashboard", "Employees", "Leave", "Payroll"].map((m, i) => (
            <Box key={m} mb={5} p={4} style={{ borderRadius: (form.borderRadius || 8) / 2, background: i === 0 ? (form.primaryColor || "#1d4ed8") + "33" : "transparent" }}>
              <Text size="9px" fw={i === 0 ? 700 : 500} c={i === 0 ? (form.primaryColor || "#1d4ed8") : "#94a3b8"}>{m}</Text>
            </Box>
          ))}
        </Box>
        <Box style={{ flex: 1, padding: 8, background: "#f8fafc" }}>
          <Text size="xs" fw={700} mb={5}>{form.tagline || "Welcome back 👋"}</Text>
          <SimpleGrid cols={2} spacing={5} mb={6}>
            {[form.primaryColor, form.secondaryColor, form.accentColor, "#10b981"].map((c, i) => (
              <Box key={i} style={{ height: 18, borderRadius: (form.borderRadius || 8) / 3, background: c || "#ccc" }} />
            ))}
          </SimpleGrid>
          <Group gap={4}>
            <Box style={{ height: 20, padding: "0 8px", borderRadius: (form.borderRadius || 8) / 2, background: form.primaryColor || "#1d4ed8", display: "flex", alignItems: "center" }}>
              <Text size="9px" c="white" fw={600}>Primary</Text>
            </Box>
            <Box style={{ height: 20, padding: "0 8px", borderRadius: (form.borderRadius || 8) / 2, border: `1px solid ${form.secondaryColor || "#64748b"}`, display: "flex", alignItems: "center" }}>
              <Text size="9px" c={form.secondaryColor || "#64748b"} fw={600}>Secondary</Text>
            </Box>
          </Group>
        </Box>
      </Group>
      <Box p={5} style={{ borderTop: "1px solid #e2e8f0" }}>
        <Text size="9px" c="dimmed" ta="center">Live · {form.theme || "Light"} · {form.primaryFont || "Inter"}</Text>
      </Box>
    </Card>
  );
}

// ═══ 1. Dashboard ═══
function DashboardTab({ onNav }) {
  const { data: dashRaw, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const dash = dashRaw ?? MOCK_BRAND_DASHBOARD;
  const brandedCount = MOCK_BRAND_PROFILES.filter(b => b.status === "Published").length;
  const domainCount  = MOCK_DOMAINS.filter(x => x.status === "Verified").length;

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Kpi label="Total Tenants"    value={MOCK_BRAND_PROFILES.length}  icon={IconBuildingStore} color="blue"   sub="All companies"         onClick={() => onNav("profiles")} />
        <Kpi label="Branded Tenants"  value={brandedCount}           icon={IconPalette}       color="violet" sub="Published brand"       onClick={() => onNav("profiles")} />
        <Kpi label="Custom Domains"   value={domainCount}            icon={IconWorld}         color="teal"   sub="Verified + active"     onClick={() => onNav("domains")}  />
        <Kpi label="Published Themes" value={PRESET_THEMES.length}   icon={IconColorSwatch}   color="pink"   sub="Active theme configs"  onClick={() => onNav("themes")}   />
        <Kpi label="Email Templates"  value={dash.customEmailTemplates ?? 7} icon={IconMail}  color="orange" sub="Configured templates"  onClick={() => onNav("email")}    />
        <Kpi label="Login Pages"      value={brandedCount}           icon={IconLogin2}        color="cyan"   sub="Custom login screens"  onClick={() => onNav("login")}    />
        <Kpi label="Brand Assets"     value={MOCK_BRAND_ASSETS.length}    icon={IconPhoto}         color="indigo" sub="Logos, icons, fonts"   onClick={() => onNav("assets")}   />
        <Kpi label="Pending Changes"  value={MOCK_BRAND_PROFILES.filter(b => b.status === "Draft").length} icon={IconAlertTriangle} color="red" sub="Unpublished drafts" onClick={() => onNav("profiles")} />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Brand Adoption Trend</Text>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MOCK_ADOPTION_TREND}>
                <defs>
                  <linearGradient id="brdGradBranded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SPARK_HEX.violet} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SPARK_HEX.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="branded" name="Branded" stroke={SPARK_HEX.violet} strokeWidth={2.5} fill="url(#brdGradBranded)" dot={false} />
                <Area type="monotone" dataKey="total"   name="Total"   stroke={SPARK_HEX.blue}   strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Theme Usage</Text>
            <Stack gap="sm">
              {PRESET_THEMES.slice(0, 5).map((t, i) => (
                <Box key={t.id}>
                  <Group justify="space-between" mb={3}>
                    <Group gap="xs">
                      <Box w={12} h={12} style={{ borderRadius: 3, background: t.primary, flexShrink: 0 }} />
                      <Text size="xs">{t.name}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{[3,2,4,1,2][i]} tenants</Text>
                  </Group>
                  <Progress value={[60,40,80,20,40][i]} color="violet" size="xs" radius="xl" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Quick Actions</Text>
            <SimpleGrid cols={3} spacing="sm">
              {[
                { label: "Create Brand",    icon: IconPlus,          color: "blue",   tab: "profiles"  },
                { label: "Upload Logo",     icon: IconUpload,        color: "violet", tab: "assets"    },
                { label: "Create Theme",    icon: IconColorSwatch,   color: "pink",   tab: "themes"    },
                { label: "Preview",         icon: IconEye,           color: "teal",   tab: "preview"   },
                { label: "Publish Brand",   icon: IconRocket,        color: "orange", tab: "preview"   },
                { label: "Edit Login Page", icon: IconLogin2,        color: "cyan",   tab: "login"     },
              ].map(a => (
                <Paper key={a.label} withBorder p="sm" radius="md" style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => onNav(a.tab)}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--mantine-color-default-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <ThemeIcon size={34} radius={10} variant="light" color={a.color} mx="auto" mb={4}><a.icon size={17} /></ThemeIcon>
                  <Text size="xs" fw={500} lh={1.3}>{a.label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Recent Activity</Text>
            <Stack gap="xs">
              {[
                { icon: IconRocket,    color: "green",  text: "Mgate brand published",          time: "2h ago" },
                { icon: IconPhoto,     color: "blue",   text: "Nexgen logo updated",             time: "5h ago" },
                { icon: IconColorSwatch,color:"violet", text: "Infospark theme changed to Purple",time: "1d ago"},
                { icon: IconWorld,     color: "teal",   text: "hr.zenith.in domain verified",   time: "2d ago" },
                { icon: IconMail,      color: "orange", text: "Welcome email template published",time: "3d ago" },
              ].map((a, i) => (
                <Group key={i} gap="sm">
                  <ThemeIcon size={28} radius={8} variant="light" color={a.color}><a.icon size={14} /></ThemeIcon>
                  <Text size="sm" style={{ flex: 1 }}>{a.text}</Text>
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

// ═══ 2. Brand Profiles ═══
function BrandProfilesTab({ toast }) {
  const { show } = useToast();
  const queryClient = { invalidateQueries: () => {}, setQueryData: () => {} };
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewBrand, setViewBrand] = useState(null);
  const [editProfile, setEditProfile] = useState(null);

  const { data: companiesResult, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const duplicateMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const publishMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const archiveMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  // API returns { data: [...] } or { companies: [...] } or bare array
  const rawCompanies = companiesResult?.data ?? companiesResult?.companies ?? (Array.isArray(companiesResult) ? companiesResult : []);

  // Merge real company list with branding status (mock until branding API returns per-tenant data)
  const BRAND_STATUS_MAP = { Published: ["#1d4ed8","Corporate Blue"], Draft: ["#7c3aed","Purple"], Pending: ["#f59e0b","Light"] };
  const statusCycle = ["Published","Published","Draft","Published","Pending","Draft"];
  const companies = rawCompanies.length > 0
    ? rawCompanies.map((c, i) => {
        const st = statusCycle[i % statusCycle.length];
        const [color, theme] = BRAND_STATUS_MAP[st];
        return {
          id: c._id ?? c.id ?? i,
          company: c.name ?? c.companyName ?? `Company ${i + 1}`,
          tenant: c.subdomain ?? c.tenantId ?? c.slug ?? (c.name ?? "").toLowerCase().replace(/\s+/g, "-"),
          theme,
          color,
          domain: c.customDomain ?? c.domain ?? "—",
          status: c.brandStatus ?? st,
          plan: c.plan ?? c.subscriptionPlan ?? "—",
          employees: c.employeeCount ?? c.totalEmployees ?? "—",
        };
      })
    : MOCK_BRAND_PROFILES;

  const filtered = companies.filter(b =>
    b.company.toLowerCase().includes(search.toLowerCase()) ||
    b.tenant.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <TextInput placeholder="Search company or tenant…" leftSection={<IconSearch size={14} />}
          value={search} onChange={e => setSearch(e.currentTarget.value)} maw={300} radius="md" />
        <Button leftSection={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>Create Brand Profile</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Company</Table.Th>
                <Table.Th>Tenant</Table.Th>
                <Table.Th>Theme</Table.Th>
                <Table.Th>Primary Color</Table.Th>
                <Table.Th>Domain</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(b => (
                <Table.Tr key={b.id}>
                  <Table.Td><Text size="sm" fw={500}>{b.company}</Text></Table.Td>
                  <Table.Td><Text size="xs" ff="monospace" c="dimmed">{b.tenant}</Text></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="violet">{b.theme}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Box w={16} h={16} style={{ borderRadius: 4, background: b.color, flexShrink: 0 }} />
                      <Text size="xs" ff="monospace">{b.color}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text size="xs" c={b.domain === "—" ? "dimmed" : "inherit"}>{b.domain}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[b.status]} variant="light">{b.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewBrand(b)}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => setEditProfile(b)}><IconPencil size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" onClick={() => duplicateMutation.mutate(b.id)}><IconCopy size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Preview"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => show("Opening preview...", "info")}><IconDeviceDesktop size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => publishMutation.mutate(b.id)}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" onClick={() => archiveMutation.mutate(b.id)}><IconArchive size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create Brand Profile" size="md" radius="lg">
        <Stack gap="md">
          <Select label="Company / Tenant" data={MOCK_BRAND_PROFILES.map(b => b.company)} placeholder="Select tenant" radius="md" />
          <Select label="Base Theme" data={THEMES_LIST} placeholder="Choose starting theme" radius="md" />
          <ColorInput label="Primary Color" defaultValue="#1d4ed8" radius="md" />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { setShowCreate(false); toast?.show("Brand profile created", "success"); }}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!viewBrand} onClose={() => setViewBrand(null)} title="Brand Profile" size="md" radius="lg">
        {viewBrand && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Company</Text><Text fw={700}>{viewBrand.company}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Tenant</Text><Text ff="monospace" size="sm">{viewBrand.tenant}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Theme</Text><Badge variant="light" color="violet">{viewBrand.theme}</Badge></Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Primary Color</Text>
              <Group gap="xs"><Box w={16} h={16} style={{ borderRadius: 4, background: viewBrand.color }} /><Text size="sm" ff="monospace">{viewBrand.color}</Text></Group>
            </Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Domain</Text><Text size="sm">{viewBrand.domain || "—"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color={STATUS_COLOR[viewBrand.status]} variant="light">{viewBrand.status}</Badge></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ═══ 3. Company Branding ═══
function CompanyBrandingTab() {
  const { show } = useToast();
  const { data: settingsRaw, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const settings = settingsRaw ?? MOCK_BRAND_SETTINGS;
  const save = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const publish = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const reset = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [form, setForm] = useState(null);
  const [viewport, setViewport] = useState("desktop");

  useEffect(() => { if (settings && !form) setForm(settings); }, [settings]);
  if (isLoading || !form) return <Center h={200}><Loader /></Center>;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Group align="flex-start" gap="lg" wrap="nowrap">
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        {/* Company Info */}
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Company Information</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <TextInput label="Company Name" value={form.companyName || ""} onChange={e => set("companyName", e.target.value)} radius="md" />
            <TextInput label="Short Name"   value={form.shortName   || ""} onChange={e => set("shortName",   e.target.value)} radius="md" />
            <TextInput label="Tagline"      value={form.tagline     || ""} onChange={e => set("tagline",     e.target.value)} radius="md" />
            <TextInput label="Website"      value={form.website     || ""} onChange={e => set("website",     e.target.value)} radius="md" />
          </SimpleGrid>
        </Paper>

        {/* Brand Identity */}
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Brand Identity</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <TextInput label="Logo URL"       value={form.logoUrl      || ""} onChange={e => set("logoUrl",      e.target.value)} radius="md" />
            <TextInput label="Dark Logo URL"  value={form.darkLogoUrl  || ""} onChange={e => set("darkLogoUrl",  e.target.value)} radius="md" />
            <TextInput label="Light Logo URL" value={form.lightLogoUrl || ""} onChange={e => set("lightLogoUrl", e.target.value)} radius="md" />
            <TextInput label="Favicon URL"    value={form.faviconUrl   || ""} onChange={e => set("faviconUrl",   e.target.value)} radius="md" />
          </SimpleGrid>
        </Paper>

        {/* Colors */}
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Colors</Text>
          <SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm">
            <ColorInput label="Primary"   value={form.primaryColor   || "#1d4ed8"} onChange={v => set("primaryColor",   v)} radius="md" />
            <ColorInput label="Secondary" value={form.secondaryColor || "#64748b"} onChange={v => set("secondaryColor", v)} radius="md" />
            <ColorInput label="Accent"    value={form.accentColor    || "#f59e0b"} onChange={v => set("accentColor",    v)} radius="md" />
            <ColorInput label="Sidebar"   value={form.sidebarColor   || "#1e3a8a"} onChange={v => set("sidebarColor",   v)} radius="md" />
            <ColorInput label="Success"   value={form.successColor   || "#10b981"} onChange={v => set("successColor",   v)} radius="md" />
            <ColorInput label="Warning"   value={form.warningColor   || "#f59e0b"} onChange={v => set("warningColor",   v)} radius="md" />
          </SimpleGrid>
        </Paper>

        {/* Typography */}
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Typography & Style</Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
            <Select label="Primary Font"   data={FONTS}         value={form.primaryFont   || "Inter"} onChange={v => set("primaryFont",   v)} radius="md" />
            <Select label="Theme"          data={THEMES_LIST}   value={form.theme         || "Light"} onChange={v => set("theme",         v)} radius="md" />
            <Select label="Border Radius"  data={["4","8","12","16","20"]} value={String(form.borderRadius || 8)} onChange={v => set("borderRadius", Number(v))} radius="md" />
          </SimpleGrid>
        </Paper>

        {/* Contact */}
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Support Information</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <TextInput label="Support Email" value={form.supportEmail || ""} onChange={e => set("supportEmail", e.target.value)} radius="md" />
            <TextInput label="Support Phone" value={form.supportPhone || ""} onChange={e => set("supportPhone", e.target.value)} radius="md" />
          </SimpleGrid>
        </Paper>

        <Group justify="flex-end" gap="sm">
          <Button variant="default" leftSection={<IconRotate size={14} />} onClick={async () => { const f = await reset.mutateAsync(); setForm(f); show("Reset to defaults", "info"); }} loading={reset.isPending}>Reset</Button>
          <Button variant="light"   leftSection={<IconDeviceFloppy size={14} />} onClick={async () => { await save.mutateAsync(form); show("Saved as draft", "success"); }} loading={save.isPending}>Save Draft</Button>
          <Button leftSection={<IconRocket size={14} />} onClick={async () => { await save.mutateAsync(form); await publish.mutateAsync(); show("Brand published 🎉", "success"); }} loading={publish.isPending}>Publish</Button>
        </Group>
      </Stack>

      {/* Live preview */}
      <Box visibleFrom="md" style={{ flexShrink: 0 }}>
        <Group gap="xs" mb="sm">
          {[
            { id: "desktop", icon: IconDeviceDesktop },
            { id: "tablet",  icon: IconDeviceTablet  },
            { id: "mobile",  icon: IconDeviceMobile  },
          ].map(v => (
            <Tooltip key={v.id} label={v.id} withArrow>
              <ActionIcon variant={viewport === v.id ? "filled" : "default"} size="sm" onClick={() => setViewport(v.id)}><v.icon size={14} /></ActionIcon>
            </Tooltip>
          ))}
        </Group>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>Live Preview</Text>
        <LivePreview form={form} viewport={viewport} />
      </Box>
    </Group>
  );
}

// ═══ 4. Themes ═══
function ThemesTab({ toast }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState(null);
  const [customTheme, setCustomTheme] = useState(PRESET_THEMES[5]);
  const setT = (k, v) => setCustomTheme(t => ({ ...t, [k]: v }));

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconColorSwatch size={14} />} onClick={() => { setEditing(null); setShowBuilder(true); }}>Create Custom Theme</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {PRESET_THEMES.map(t => (
          <Paper key={t.id} withBorder p="lg" radius="lg">
            {/* Color swatches */}
            <Group gap="xs" mb="md">
              {[t.primary, t.secondary, t.accent, t.sidebar].map((c, i) => (
                <Box key={i} w={28} h={28} style={{ borderRadius: 6, background: c }} />
              ))}
            </Group>
            <Text fw={700} mb={2}>{t.name}</Text>
            <Text size="xs" c="dimmed" mb="sm">Font: {t.font}</Text>
            <Divider mb="sm" />
            <Group gap="xs">
              <Button size="xs" variant="filled" onClick={() => toast?.show(`Theme "${t.name}" applied`, "success")}>Apply</Button>
              <Button size="xs" variant="default" onClick={() => { setEditing(t); setCustomTheme({ ...t }); setShowBuilder(true); }}>Edit</Button>
              <Button size="xs" variant="default" onClick={() => toast?.show(`Theme "${t.name}" duplicated`, "info")}>Duplicate</Button>
              {t.id === "custom" && <Button size="xs" variant="light" color="red" onClick={() => toast?.show("Theme deleted", "error")}>Delete</Button>}
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Theme builder modal */}
      <Modal opened={showBuilder} onClose={() => setShowBuilder(false)}
        title={editing ? `Edit: ${editing.name}` : "Custom Theme Builder"} size="xl" radius="lg">
        <Group align="flex-start" gap="lg">
          <Stack gap="md" style={{ flex: 1 }}>
            <Text size="sm" fw={600} c="dimmed">Theme Colors</Text>
            <SimpleGrid cols={2} spacing="sm">
              <ColorInput label="Primary"    value={customTheme.primary}   onChange={v => setT("primary",   v)} radius="md" />
              <ColorInput label="Secondary"  value={customTheme.secondary} onChange={v => setT("secondary", v)} radius="md" />
              <ColorInput label="Accent"     value={customTheme.accent}    onChange={v => setT("accent",    v)} radius="md" />
              <ColorInput label="Sidebar"    value={customTheme.sidebar}   onChange={v => setT("sidebar",   v)} radius="md" />
            </SimpleGrid>
            <Select label="Font Family" data={FONTS} value={customTheme.font} onChange={v => setT("font", v)} radius="md" />
            <Select label="Border Radius" data={["4","8","12","16","20"]} defaultValue="8" radius="md" />
          </Stack>
          <Box style={{ flexShrink: 0 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>Instant Preview</Text>
            <LivePreview form={{ ...customTheme, primaryColor: customTheme.primary, secondaryColor: customTheme.secondary, accentColor: customTheme.accent, sidebarColor: customTheme.sidebar, primaryFont: customTheme.font, borderRadius: 8 }} />
          </Box>
        </Group>
        <Group justify="flex-end" mt="lg" gap="sm">
          <Button variant="default" onClick={() => setShowBuilder(false)}>Cancel</Button>
          <Button onClick={() => { setShowBuilder(false); toast?.show("Theme saved", "success"); }}>Save Theme</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ═══ 5. Login Page ═══
function LoginPageTab() {
  const { show } = useToast();
  const { data: settingsRaw, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const settings = settingsRaw ?? MOCK_BRAND_SETTINGS;
  const save = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [form, setForm] = useState(null);
  const [viewport, setViewport] = useState("desktop");
  useEffect(() => { if (settings && !form) setForm(settings); }, [settings]);
  if (isLoading || !form) return <Center h={200}><Loader /></Center>;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const previewW = viewport === "mobile" ? 280 : viewport === "tablet" ? 400 : "100%";

  return (
    <Group align="flex-start" gap="lg" wrap="nowrap">
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Login Page Content</Text>
          <Stack gap="sm">
            <TextInput label="Page Title"       value={form.loginTitle   || ""} onChange={e => set("loginTitle",   e.target.value)} radius="md" />
            <TextInput label="Welcome Message"  value={form.loginWelcome || ""} onChange={e => set("loginWelcome", e.target.value)} placeholder="Welcome back" radius="md" />
            <Textarea  label="Description"      value={form.loginSlogan  || ""} onChange={e => set("loginSlogan",  e.target.value)} minRows={2} radius="md" />
            <TextInput label="Background Image URL" value={form.loginBgUrl || ""} onChange={e => set("loginBgUrl", e.target.value)} radius="md" />
            <TextInput label="Background Video URL" placeholder="Optional video background" radius="md" />
          </Stack>
        </Paper>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Footer</Text>
          <Stack gap="sm">
            <Textarea label="Footer Text" value={form.loginFooter || ""} onChange={e => set("loginFooter", e.target.value)} minRows={2} radius="md" />
            <TextInput label="Privacy Policy URL" placeholder="https://…" radius="md" />
            <TextInput label="Terms of Service URL" placeholder="https://…" radius="md" />
          </Stack>
        </Paper>
        <Group justify="flex-end" gap="sm">
          <Button variant="default">Restore Default</Button>
          <Button variant="light" leftSection={<IconDeviceFloppy size={14} />}
            onClick={async () => { await save.mutateAsync(form); show("Login page saved", "success"); }}
            loading={save.isPending}>Save Draft</Button>
          <Button leftSection={<IconRocket size={14} />}
            onClick={async () => { await save.mutateAsync(form); show("Login page published", "success"); }}>Publish</Button>
        </Group>
      </Stack>

      <Box visibleFrom="md" style={{ flexShrink: 0 }}>
        <Group gap="xs" mb="sm">
          {[{ id: "desktop", icon: IconDeviceDesktop }, { id: "tablet", icon: IconDeviceTablet }, { id: "mobile", icon: IconDeviceMobile }].map(v => (
            <Tooltip key={v.id} label={v.id} withArrow>
              <ActionIcon variant={viewport === v.id ? "filled" : "default"} size="sm" onClick={() => setViewport(v.id)}><v.icon size={14} /></ActionIcon>
            </Tooltip>
          ))}
        </Group>
        <Paper withBorder radius="lg" style={{ width: 320, overflow: "hidden" }}>
          <Box style={{ height: 180, background: form.loginBgUrl ? `url(${form.loginBgUrl}) center/cover` : `linear-gradient(135deg, ${form.primaryColor || "#1d4ed8"} 0%, ${form.sidebarColor || "#1e3a8a"} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Text fw={800} size="xl" c="white" ta="center">{form.loginWelcome || "Welcome Back"}</Text>
            <Text size="xs" c="white" opacity={0.85} ta="center" mt={4}>{form.loginSlogan || "Sign in to continue"}</Text>
          </Box>
          <Box p="md">
            <Box style={{ background: "#f1f5f9", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
              <Text size="xs" c="dimmed">Email</Text>
            </Box>
            <Box style={{ background: "#f1f5f9", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
              <Text size="xs" c="dimmed">Password</Text>
            </Box>
            <Box style={{ background: form.primaryColor || "#1d4ed8", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
              <Text size="xs" c="white" fw={600}>Sign In</Text>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Group>
  );
}

// ═══ 6. Portal Branding ═══
function PortalBrandingTab({ toast }) {
  const [activePortal, setActivePortal] = useState("employee");
  const portal = PORTAL_TYPES.find(p => p.id === activePortal);

  return (
    <Stack gap="md">
      <Group gap="sm">
        {PORTAL_TYPES.map(p => (
          <Button key={p.id} variant={activePortal === p.id ? "filled" : "default"} size="sm"
            color={activePortal === p.id ? p.color : undefined}
            onClick={() => setActivePortal(p.id)}>
            {p.label}
          </Button>
        ))}
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">{portal.label} Configuration</Text>
            <Stack gap="sm">
              <TextInput label="Portal Title" placeholder={`${portal.label} — HRPLUSE`} radius="md" />
              <Textarea  label="Welcome Message" placeholder="Welcome to your portal" minRows={2} radius="md" />
              <ColorInput label="Portal Accent Color" defaultValue="#1d4ed8" radius="md" />
              <TextInput label="Banner Image URL" placeholder="https://…" radius="md" />
              <Textarea  label="Quick Links (one per line)" placeholder="/dashboard\n/leave\n/payroll" minRows={3} radius="md" />
            </Stack>
            <Group justify="flex-end" mt="md" gap="sm">
              <Button variant="default">Reset</Button>
              <Button onClick={() => toast?.show(`${portal.label} branding saved`, "success")}>Save</Button>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Portal Preview</Text>
            <Box style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 12, overflow: "hidden" }}>
              <Box style={{ height: 60, background: `var(--mantine-color-${portal.color}-6)`, display: "flex", alignItems: "center", padding: "0 16px" }}>
                <Text fw={700} c="white">{portal.label}</Text>
              </Box>
              <Box p="md">
                <Text size="sm" fw={600} mb="xs">Welcome, John</Text>
                {["Dashboard", "Leave", "Payroll", "Documents"].map(m => (
                  <Group key={m} justify="space-between" py={6} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                    <Text size="xs">{m}</Text>
                    <IconChevronRight size={12} color="var(--mantine-color-dimmed)" />
                  </Group>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ═══ 7. Email Templates ═══
function EmailTemplatesTab() {
  const { show } = useToast();
  const { data: templates = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const update = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [edit, setEdit] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");

  const allTemplates = templates.length > 0 ? templates : [
    { id: 1, type: "Welcome Email",      subject: "Welcome to HRPLUSE",                status: "Active", updatedAt: "2026-06-15" },
    { id: 2, type: "Invitation",         subject: "You're invited to join HRPLUSE",     status: "Active", updatedAt: "2026-06-10" },
    { id: 3, type: "Password Reset",     subject: "Reset your HRPLUSE password",        status: "Active", updatedAt: "2026-05-20" },
    { id: 4, type: "Leave Approval",     subject: "Your leave request has been {{status}}", status: "Active", updatedAt: "2026-06-01" },
    { id: 5, type: "Payroll",            subject: "Your payslip for {{month}} is ready", status: "Active", updatedAt: "2026-06-01" },
    { id: 6, type: "Offer Letter",       subject: "Offer Letter from {{company}}",      status: "Draft",  updatedAt: "2026-05-10" },
    { id: 7, type: "Exit Notification",  subject: "Exit process initiated",             status: "Active", updatedAt: "2026-04-20" },
  ];

  const filtered = allTemplates.filter(t => t.type.toLowerCase().includes(search.toLowerCase()));
  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <TextInput placeholder="Search templates…" leftSection={<IconSearch size={14} />}
          value={search} onChange={e => setSearch(e.currentTarget.value)} maw={300} radius="md" />
        <Button leftSection={<IconPlus size={14} />} onClick={() => setEdit({ id: null, type: "", subject: "", body: "" })}>New Template</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Template Name</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Last Updated</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map(t => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.type}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{t.subject}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{fmtDate(t.updatedAt)}</Text></Table.Td>
                <Table.Td><Badge size="xs" color={STATUS_COLOR[t.status]} variant="light">{t.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => setEdit({ ...t, body: t.body || "Hi {{name}},\n\n" })}><IconPencil size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Preview"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => setPreview(t)}><IconEye size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle"><IconCopy size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Disable"><ActionIcon size="sm" variant="subtle" color="orange"><IconBan size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={!!edit} onClose={() => setEdit(null)} title={edit?.type || "New Template"} size="xl" radius="lg">
        {edit && (
          <Group align="flex-start" gap="lg">
            <Stack gap="sm" style={{ flex: 1 }}>
              {!edit.id && <TextInput label="Template Name" value={edit.type || ""} onChange={e => setEdit({ ...edit, type: e.target.value })} radius="md" />}
              <TextInput label="Subject" value={edit.subject || ""} onChange={e => setEdit({ ...edit, subject: e.target.value })} radius="md" />
              <Textarea label="Body" minRows={10} value={edit.body || ""} onChange={e => setEdit({ ...edit, body: e.target.value })}
                description="Variables: {{name}} {{company}} {{date}} {{status}} {{link}}" radius="md" />
            </Stack>
            <Paper withBorder p="md" radius="lg" style={{ width: 280, flexShrink: 0 }}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">Live Preview</Text>
              <Paper withBorder p="sm" radius="md" style={{ background: "#f8fafc" }}>
                <Text size="xs" fw={600} mb={4}>{edit.subject || "(no subject)"}</Text>
                <Text size="xs" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{edit.body || "(empty)"}</Text>
              </Paper>
              <Divider my="sm" />
              <Text size="xs" c="dimmed">Available variables:</Text>
              {["name","company","date","status","link"].map(v => (
                <Badge key={v} size="xs" variant="outline" mr={4} mt={4} style={{ cursor: "pointer" }}
                  onClick={() => setEdit(e => ({ ...e, body: (e.body || "") + `{{${v}}}` }))}>
                  {`{{${v}}}`}
                </Badge>
              ))}
            </Paper>
          </Group>
        )}
        <Group justify="flex-end" mt="lg" gap="sm">
          <Button variant="default" onClick={() => setEdit(null)}>Cancel</Button>
          <Button variant="outline">Save Draft</Button>
          <Button onClick={async () => {
            if (edit.id) await update.mutateAsync({ id: edit.id, subject: edit.subject, body: edit.body });
            show("Template published", "success"); setEdit(null);
          }} loading={update.isPending}>Publish</Button>
        </Group>
      </Modal>

      <Modal opened={!!preview} onClose={() => setPreview(null)} title={`Preview: ${preview?.type || ""}`} size="md" radius="lg">
        {preview && (
          <Stack gap="sm">
            <Paper withBorder p="md" radius="md" style={{ background: "#f8fafc" }}>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>Subject</Text>
              <Text size="sm" fw={600} mb="md">{preview.subject}</Text>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>Body</Text>
              <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{preview.body || "(no body — click Edit to add content)"}</Text>
            </Paper>
            <Badge size="xs" color={STATUS_COLOR[preview.status]} variant="light" style={{ alignSelf: "flex-start" }}>{preview.status}</Badge>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ═══ 8. SMS Templates ═══
function SmsTemplatesTab({ toast }) {
  const [edit, setEdit] = useState(null);
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {MOCK_SMS_TEMPLATES.map(t => (
          <Paper key={t.id} withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="sm">
              <Badge size="sm" variant="light" color={t.status === "Active" ? "green" : "gray"}>{t.type}</Badge>
              <Badge size="xs" color={t.status === "Active" ? "green" : "gray"} variant="dot">{t.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>{t.body}</Text>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => setEdit({ ...t })}>Edit</Button>
              <Button size="xs" variant="default">Preview</Button>
              <Switch size="xs" checked={t.status === "Active"} onChange={() => toast?.show(`SMS ${t.type} ${t.status === "Active" ? "disabled" : "enabled"}`, "info")} />
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Modal opened={!!edit} onClose={() => setEdit(null)} title={`Edit SMS: ${edit?.type}`} size="sm" radius="lg">
        {edit && (
          <Stack gap="md">
            <Textarea label="Template Body" value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })}
              description="Variables: {{name}} {{otp}} {{date}} {{status}} {{message}}" minRows={4} radius="md" />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={() => { setEdit(null); toast?.show("SMS template saved", "success"); }}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ═══ 9. Document Templates ═══
function DocumentTemplatesTab({ toast }) {
  const [selected, setSelected] = useState(MOCK_DOC_TEMPLATES[0]);

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper withBorder p="md" radius="lg">
          <Text fw={600} mb="md">Template Categories</Text>
          <Stack gap="xs">
            {MOCK_DOC_TEMPLATES.map(t => (
              <Paper key={t.id} withBorder p="sm" radius="md"
                style={{ cursor: "pointer", background: selected?.id === t.id ? "var(--mantine-color-blue-0)" : "" }}
                onClick={() => setSelected(t)}>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size={28} radius={8} variant="light" color="blue"><IconFileText size={14} /></ThemeIcon>
                    <Text size="sm" fw={500}>{t.category}</Text>
                  </Group>
                  <Badge size="xs" color={STATUS_COLOR[t.status]} variant="light">{t.status}</Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        {selected ? (
          <Paper withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="lg">
              <Stack gap={2}>
                <Text fw={700} size="lg">{selected.category}</Text>
                <Text size="xs" c="dimmed">Last updated: {fmtDate(selected.lastUpdated)}</Text>
              </Stack>
              <Group gap="sm">
                <Button size="sm" variant="default" leftSection={<IconEye size={14} />}>Preview PDF</Button>
                <Button size="sm" leftSection={<IconRocket size={14} />} onClick={() => toast?.show("Template published", "success")}>Publish</Button>
              </Group>
            </Group>

            {/* Document preview mockup */}
            <Paper withBorder p="lg" radius="md" style={{ minHeight: 320, background: "white" }}>
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: "2px solid #1d4ed8" }}>
                <Box>
                  <Text fw={800} size="lg" c="blue.7">HRPLUSE</Text>
                  <Text size="xs" c="dimmed">Enterprise HR Management</Text>
                </Box>
                <Text size="xs" c="dimmed" ta="right">{selected.category}<br />Document</Text>
              </Group>
              <Text fw={700} size="md" mb="sm" ta="center">{selected.category.toUpperCase()}</Text>
              <Text size="xs" c="dimmed" mb="sm">Date: {"{{date}}"}</Text>
              <Text size="sm" style={{ lineHeight: 1.8 }}>
                Dear {"{{employee_name}}"},<br /><br />
                This is to {"{{action}}"} that you {"{{details}}"}. Your employment with {"{{company_name}}"} {"{{employment_details}}"}.<br /><br />
                {"{{body_content}}"}
              </Text>
              <Group justify="flex-end" mt="xl">
                <Box ta="center">
                  <Box style={{ width: 120, borderTop: "1px solid #334155", paddingTop: 4 }}>
                    <Text size="xs">Authorized Signature</Text>
                  </Box>
                </Box>
              </Group>
            </Paper>

            <Group justify="space-between" mt="md">
              <Group gap="xs">
                {["Logo", "Header", "Footer", "Signature", "Watermark", "QR Code"].map(feature => (
                  <Badge key={feature} size="xs" variant="outline" style={{ cursor: "pointer" }}
                    onClick={() => toast?.show(`${feature} configuration`, "info")}>
                    {feature}
                  </Badge>
                ))}
              </Group>
              <Button size="xs" variant="default" onClick={() => toast?.show("Reset to default template", "info")}>Restore Default</Button>
            </Group>
          </Paper>
        ) : (
          <AppEmptyState icon={<IconFileText size={22} />} message="Select a template" sub="Choose a document template from the left panel." py={80} />
        )}
      </Grid.Col>
    </Grid>
  );
}

// ═══ 10. Custom Domains ═══
function CustomDomainsTab() {
  const { show } = useToast();
  const verify = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [newDomain, setNewDomain] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const { data: settings } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const verified   = MOCK_DOMAINS.filter(d => d.status === "Verified").length;
  const pending    = MOCK_DOMAINS.filter(d => d.status === "Pending").length;
  const sslActive  = MOCK_DOMAINS.filter(d => d.ssl === "Active").length;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" fw={500}>Verified Domains</Text>
          <Text fw={800} size="xl" c="green">{verified}</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" fw={500}>Pending Verification</Text>
          <Text fw={800} size="xl" c="orange">{pending}</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" fw={500}>SSL Active</Text>
          <Text fw={800} size="xl" c="green">{sslActive}</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" fw={500}>Expiring Soon</Text>
          <Text fw={800} size="xl" c="red">1</Text>
        </Paper>
      </SimpleGrid>

      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={14} />} onClick={() => setShowAdd(true)}>Add Domain</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Domain</Table.Th>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>SSL Status</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Expiry</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {MOCK_DOMAINS.map(d => (
              <Table.Tr key={d.id}>
                <Table.Td><Text size="sm" fw={500} ff="monospace">{d.domain}</Text></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{d.tenant}</Text></Table.Td>
                <Table.Td>
                  <Badge size="xs" color={d.ssl === "Active" ? "green" : "orange"} variant="light"
                    leftSection={d.ssl === "Active" ? <IconShieldCheck size={10} /> : <IconAlertTriangle size={10} />}>
                    {d.ssl}
                  </Badge>
                </Table.Td>
                <Table.Td><Badge size="xs" color={STATUS_COLOR[d.status]} variant="light">{d.status}</Badge></Table.Td>
                <Table.Td><Text size="xs" c={d.expiry === "—" ? "dimmed" : "inherit"}>{fmtDate(d.expiry)}</Text></Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Verify"><ActionIcon size="sm" variant="subtle" color="blue"><IconCheck size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Renew SSL"><ActionIcon size="sm" variant="subtle" color="green"><IconRefresh size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Disable"><ActionIcon size="sm" variant="subtle" color="orange"><IconBan size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red"><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={showAdd} onClose={() => setShowAdd(false)} title="Add Custom Domain" size="sm" radius="lg">
        <Stack gap="md">
          <Select label="Tenant" data={MOCK_BRAND_PROFILES.map(b => b.company)} placeholder="Select company" radius="md" />
          <TextInput label="Domain" placeholder="hr.company.com" value={newDomain} onChange={e => setNewDomain(e.currentTarget.value)} radius="md" />
          <Paper withBorder p="sm" radius="md" bg="blue.0">
            <Text size="xs" c="blue.7" fw={500}>After adding, point your DNS CNAME record to:<br /><Text span ff="monospace">cname.hrpluse.com</Text></Text>
          </Paper>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button loading={verify.isPending} onClick={async () => {
              try { await verify.mutateAsync(newDomain); show("Domain added", "success"); setShowAdd(false); }
              catch { show("Failed to add domain", "error"); }
            }}>Add & Verify</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ 11. Brand Assets ═══
function BrandAssetsTab({ toast }) {
  const [folder, setFolder] = useState("All");
  const FOLDERS = ["All", "Logos", "Icons", "Illustrations", "Backgrounds", "Documents", "Fonts"];
  const filtered = folder === "All" ? MOCK_BRAND_ASSETS : MOCK_BRAND_ASSETS.filter(a => a.folder === folder);
  const [dragging, setDragging] = useState(false);

  const iconFor = (type) => {
    if (type.includes("image")) return IconPhoto;
    if (type === "font") return IconLetterCase;
    if (type === "doc") return IconFileText;
    return IconFolderOpen;
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          {FOLDERS.map(f => (
            <Button key={f} size="xs" variant={folder === f ? "filled" : "default"} onClick={() => setFolder(f)}>{f}</Button>
          ))}
        </Group>
        <Group gap="sm">
          <Button variant="default" leftSection={<IconDownload size={14} />}>Download All</Button>
          <Button leftSection={<IconUpload size={14} />} onClick={() => toast?.show("Upload dialog opened", "info")}>Upload</Button>
        </Group>
      </Group>

      {/* Drag & drop zone */}
      <Paper withBorder radius="lg" p="xl" ta="center"
        style={{
          borderStyle: "dashed",
          borderColor: dragging ? "var(--mantine-color-blue-5)" : "var(--mantine-color-default-border)",
          background: dragging ? "var(--mantine-color-blue-0)" : "",
          transition: "all 0.15s",
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); toast?.show("Files uploaded", "success"); }}>
        <ThemeIcon size={48} radius={14} variant="light" color="blue" mx="auto" mb="sm"><IconUpload size={24} /></ThemeIcon>
        <Text fw={600}>Drag & drop files here</Text>
        <Text size="sm" c="dimmed">or click Upload to browse</Text>
      </Paper>

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
        {filtered.map(a => {
          const Icon = iconFor(a.type);
          return (
            <Paper key={a.id} withBorder p="md" radius="lg">
              <ThemeIcon size={40} radius={10} variant="light" color="blue" mb="sm"><Icon size={20} /></ThemeIcon>
              <Text size="sm" fw={500} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</Text>
              <Text size="xs" c="dimmed">{a.folder} · {a.size}</Text>
              <Group gap="xs" mt="sm">
                <ActionIcon size="sm" variant="subtle" color="blue"><IconDownload size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => toast?.show("Asset deleted", "error")}><IconTrash size={13} /></ActionIcon>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

// ═══ 12. Preview & Publish ═══
function PreviewPublishTab() {
  const { show } = useToast();
  const { data: settingsRaw, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const settings = settingsRaw ?? MOCK_BRAND_SETTINGS;
  const publish = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [viewport, setViewport] = useState("desktop");
  const [mode, setMode] = useState("light");
  const [form, setForm] = useState(null);
  useEffect(() => { if (settings && !form) setForm(settings); }, [settings]);
  if (isLoading || !form) return <Center h={200}><Loader /></Center>;

  const HISTORY = [
    { version: "v3", date: "2026-06-20", by: "Siva",    label: "Published brand + new logo" },
    { version: "v2", date: "2026-05-10", by: "Annz",    label: "Theme changed to Corporate Blue" },
    { version: "v1", date: "2026-03-01", by: "System",  label: "Initial brand setup" },
  ];

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper withBorder p="lg" radius="lg">
          <Group justify="space-between" mb="md">
            <Text fw={600}>Live Preview</Text>
            <Group gap="xs">
              {[{ id: "desktop", icon: IconDeviceDesktop }, { id: "tablet", icon: IconDeviceTablet }, { id: "mobile", icon: IconDeviceMobile }].map(v => (
                <Tooltip key={v.id} label={v.id} withArrow>
                  <ActionIcon variant={viewport === v.id ? "filled" : "default"} size="sm" onClick={() => setViewport(v.id)}><v.icon size={14} /></ActionIcon>
                </Tooltip>
              ))}
              <Divider orientation="vertical" />
              <Button size="xs" variant={mode === "light" ? "filled" : "default"} onClick={() => setMode("light")}>Light</Button>
              <Button size="xs" variant={mode === "dark"  ? "filled" : "default"} onClick={() => setMode("dark")}>Dark</Button>
            </Group>
          </Group>

          <Center>
            <LivePreview form={mode === "dark" ? { ...form, sidebarColor: "#0f172a", primaryColor: form.primaryColor } : form} viewport={viewport} />
          </Center>

          <Group justify="center" gap="sm" mt="xl">
            <Button variant="default" leftSection={<IconHistory size={14} />}>Rollback</Button>
            <Button leftSection={<IconRocket size={14} />}
              onClick={async () => { await publish.mutateAsync(); show("Brand published successfully 🎉", "success"); }}
              loading={publish.isPending}>
              Publish Now
            </Button>
          </Group>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Publish History</Text>
          <Stack gap="sm">
            {HISTORY.map(h => (
              <Paper key={h.version} withBorder p="sm" radius="md">
                <Group justify="space-between" mb={2}>
                  <Badge size="xs" variant="light" color="blue">{h.version}</Badge>
                  <Text size="xs" c="dimmed">{fmtDate(h.date)}</Text>
                </Group>
                <Text size="xs">{h.label}</Text>
                <Text size="xs" c="dimmed">by {h.by}</Text>
                <Button size="xs" variant="subtle" mt={4}
                  onClick={() => show(`Restored to ${h.version}`, "info")}>Restore this version</Button>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

// ═══ Main ════════════════════════════════════════════════════════════════════
export default function BrandingManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  if (!canManage) {
    return <AppEmptyState icon={<IconPalette size={24} />} message="Restricted"
      sub="White Label & Branding is available to Platform Owner / Admin only." />;
  }

  const TABS = [
    { id: "dashboard",  label: "Dashboard",           icon: IconChartBar         },
    { id: "profiles",   label: "Brand Profiles",      icon: IconBuildingStore    },
    { id: "branding",   label: "Company Branding",    icon: IconPalette          },
    { id: "themes",     label: "Themes",              icon: IconColorSwatch      },
    { id: "login",      label: "Login Page",          icon: IconLogin2           },
    { id: "portal",     label: "Portal Branding",     icon: IconUsers            },
    { id: "email",      label: "Email Templates",     icon: IconMail             },
    { id: "sms",        label: "SMS Templates",       icon: IconMessage          },
    { id: "docs",       label: "Document Templates",  icon: IconFileText         },
    { id: "domains",    label: "Custom Domains",      icon: IconWorld            },
    { id: "assets",     label: "Brand Assets",        icon: IconPhoto            },
    { id: "preview",    label: "Preview & Publish",   icon: IconRocket           },
  ];

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      <AppPageHeader
        title="White Label & Branding"
        sub="Customize branding for every customer tenant"
        action={
          <Group gap="sm">
            <Button variant="default" leftSection={<IconDownload size={14} />}>Export</Button>
            <Button variant="default" leftSection={<IconEye size={14} />} onClick={() => setTab("preview")}>Preview</Button>
            <Button leftSection={<IconRocket size={14} />} onClick={() => setTab("preview")}>Publish</Button>
          </Group>
        }
        onRefresh={() => {}}
      />

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs value={tab} onChange={setTab}>
          <ScrollArea>
            <Tabs.List px="sm" style={{ flexWrap: "nowrap" }}>
              {TABS.map(t => (
                <Tabs.Tab key={t.id} value={t.id} leftSection={<t.icon size={14} />} style={{ whiteSpace: "nowrap" }}>
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>

          <Box p="lg">
            <Tabs.Panel value="dashboard" ><DashboardTab onNav={setTab} /></Tabs.Panel>
            <Tabs.Panel value="profiles"  ><BrandProfilesTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="branding"  ><CompanyBrandingTab /></Tabs.Panel>
            <Tabs.Panel value="themes"    ><ThemesTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="login"     ><LoginPageTab /></Tabs.Panel>
            <Tabs.Panel value="portal"    ><PortalBrandingTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="email"     ><EmailTemplatesTab /></Tabs.Panel>
            <Tabs.Panel value="sms"       ><SmsTemplatesTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="docs"      ><DocumentTemplatesTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="domains"   ><CustomDomainsTab /></Tabs.Panel>
            <Tabs.Panel value="assets"    ><BrandAssetsTab toast={toast} /></Tabs.Panel>
            <Tabs.Panel value="preview"   ><PreviewPublishTab /></Tabs.Panel>
          </Box>
        </Tabs>
      </Paper>
    </Stack>
  );
}
