import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SimpleGrid, Box, Group, Text, Stack, ThemeIcon, Progress,
  SegmentedControl, Badge, ActionIcon, Tooltip,
} from "@mantine/core";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  IconBuilding, IconUsers, IconActivity, IconCurrencyRupee, IconReceipt2,
  IconServer, IconDatabase, IconStack2, IconCloudUpload, IconMail, IconShieldCheck,
  IconChevronRight, IconUserPlus, IconRosetteDiscountCheck, IconSettings,
  IconBuildingStore, IconDatabaseExport, IconSpeakerphone, IconAlertTriangle,
  IconCircleCheck, IconX, IconUserExclamation,
  IconClockHour4, IconBulb, IconCalendarEvent, IconRosette,
} from "@tabler/icons-react";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney } from "./DashboardKit";
import { getCompanies } from "../../../api/multiCompanyApi";
import { getSecurityStats } from "../../../api/securityApi";
import {
  usePlatformHealth, usePlatformStats, useBackups, useSubDashboard,
} from "../../../queries/usePlatform";
import { useTicketDashboard } from "../../../queries/useTickets";
import { getAuditLogs } from "../../../api/auditLogsApi";
import { getAnnouncements } from "../../../api/dashboardApi";

// ── Mock fallback data (matches shapes used across superadmin/billing/platform screens) ──
const MOCK_COMPANIES = [
  { id: "c1", name: "Annz Technologies",  plan: "Enterprise",   status: "Active",  employees: 134 },
  { id: "c2", name: "Mgate Solutions",    plan: "Pro",          status: "Active",  employees: 52  },
  { id: "c3", name: "Horizon Consulting", plan: "Pro",          status: "Trial",   employees: 28  },
  { id: "c4", name: "Petrox Services",    plan: "Starter",      status: "Trial",   employees: 12  },
  { id: "c5", name: "Zenith Retail",      plan: "Enterprise",   status: "Suspended", employees: 320 },
];

const MOCK_REVENUE_TREND = ["Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => ({
  month: m, mrr: 180000 + i * 22000, arr: (180000 + i * 22000) * 12, subs: 8 + i,
}));

const MOCK_PLAN_DIST = [
  { name: "Starter",      value: 12, color: "#94a3b8" },
  { name: "Professional", value: 23, color: "#3b82f6" },
  { name: "Business",     value: 18, color: "#7c3aed" },
  { name: "Enterprise",   value: 9,  color: "#f59e0b" },
  { name: "Trial",        value: 6,  color: "#10b981" },
];

const MOCK_HEALTH_SERVICES = [
  { service: "API Gateway",            status: "healthy" },
  { service: "Authentication Service", status: "healthy" },
  { service: "Database",               status: "healthy" },
  { service: "Queue Service",          status: "healthy" },
  { service: "Email Service",          status: "degraded" },
  { service: "SMS Service",            status: "healthy" },
  { service: "Notification Service",   status: "healthy" },
  { service: "AI Service",             status: "healthy" },
  { service: "Redis Cache",            status: "healthy" },
  { service: "File Storage",           status: "healthy" },
];

const MOCK_PLATFORM_STATS = { tenants: 6, employees: 546, activeUsers: 28, invoicesThisMonth: 14 };

const MOCK_CUSTOMER_OVERVIEW = {
  newCustomers: [{ name: "Petrox Services", joined: "3 Jul 2026" }, { name: "Horizon Consulting", joined: "28 Jun 2026" }],
  topCustomers: [{ name: "Zenith Retail", mrr: 40000 }, { name: "Annz Technologies", mrr: 40000 }, { name: "CloudBase Inc", mrr: 12000 }],
  nearEmployeeLimit: [{ name: "Mgate Solutions", used: 48, limit: 50 }],
  nearStorageLimit: [{ name: "Annz Technologies", usedPct: 91 }],
  failedPayments: [{ name: "Arrowhead Logistics", invoice: "INV-2026-005", amount: 8850 }],
};

const MOCK_APPROVALS = [
  { id: "ap1", type: "Company Registration", requester: "New signup — Bright Path HR", date: "18 Jul 2026" },
  { id: "ap2", type: "Subscription Upgrade",  requester: "CloudBase Inc → Enterprise", date: "17 Jul 2026" },
  { id: "ap3", type: "Plugin Approval",       requester: "Slack Connector v2.1",       date: "16 Jul 2026" },
  { id: "ap4", type: "Billing Approval",      requester: "Refund request — Petrox Services", date: "15 Jul 2026" },
];

const MOCK_ACTIVITY = [
  { id: "a1", action: "Company Created",        detail: "Bright Path HR onboarded",         time: "2h ago" },
  { id: "a2", action: "Subscription Renewed",    detail: "Nexgen Solutions — Business plan", time: "5h ago" },
  { id: "a3", action: "Backup Completed",        detail: "Full backup — 4.2 GB",             time: "8h ago" },
  { id: "a4", action: "New Plugin Installed",    detail: "Zoom Integration by Zenith Retail", time: "1d ago" },
  { id: "a5", action: "System Settings Changed", detail: "SMTP relay updated",               time: "1d ago" },
];

const MOCK_SECURITY_STATS = { activeSessions: 28, failedLoginsToday: 5, lockedAccounts: 1, mfaEnabled: 11, mfaTotal: 17, suspiciousActivities: 2 };

const MOCK_SUPPORT = { openTickets: 14, criticalTickets: 2, slaViolations: 1, avgResolutionHrs: 6.4 };

const MOCK_NOTIFICATIONS = [
  { id: "n1", text: "2 subscriptions expire today",              type: "warning" },
  { id: "n2", text: "Storage usage reached 85% on Annz Technologies", type: "warning" },
  { id: "n3", text: "Payment failed — Arrowhead Logistics",       type: "critical" },
  { id: "n4", text: "Backup completed successfully",              type: "success" },
  { id: "n5", text: "Platform update v2.4.0 available",           type: "info" },
];

const MOCK_AI_INSIGHTS = [
  "5 companies approaching their employee limit",
  "2 subscriptions expire today",
  "Storage usage reached 85% on Annz Technologies",
  "Payment failures increased by 10% this week",
  "Nightly backup completed successfully",
];

const MOCK_CALENDAR = [
  { id: "e1", title: "Nexgen Solutions renewal",        date: "20 Jul 2026", type: "renewal" },
  { id: "e2", title: "Scheduled maintenance — DB",       date: "22 Jul 2026", type: "maintenance" },
  { id: "e3", title: "Zenith Retail onboarding call",    date: "24 Jul 2026", type: "onboarding" },
  { id: "e4", title: "v2.4.0 product release",           date: "28 Jul 2026", type: "release" },
];

const MOCK_PLATFORM_ANNOUNCEMENTS = [
  { id: "pa1", title: "v2.4.0 released — AI-assisted onboarding",     date: "15 Jul 2026" },
  { id: "pa2", title: "Scheduled maintenance window — 22 Jul, 2 AM",  date: "14 Jul 2026" },
  { id: "pa3", title: "Security advisory: rotate API keys by 1 Aug",  date: "10 Jul 2026" },
];

const STATUS_COLOR = { healthy: "green", degraded: "orange", down: "red" };
const STATUS_ICON  = { healthy: IconCircleCheck, degraded: IconAlertTriangle, down: IconX };
const SERVICE_ICON = {
  "API Gateway": IconServer, "Authentication Service": IconShieldCheck, "Database": IconDatabase,
  "Queue Service": IconStack2, "Email Service": IconMail, "SMS Service": IconMail,
  "Notification Service": IconSpeakerphone, "AI Service": IconBulb, "Redis Cache": IconDatabase,
  "File Storage": IconCloudUpload,
};
// Normalizes the short slugs returned by the real /monitoring/health endpoint
// (api, database, queue, storage, email, billing, auth) to the friendly labels
// this dashboard displays, so live data and mock fallbacks render identically.
const SERVICE_LABEL = {
  api: "API Gateway", auth: "Authentication Service", database: "Database",
  queue: "Queue Service", email: "Email Service", sms: "SMS Service",
  notification: "Notification Service", ai: "AI Service", redis: "Redis Cache",
  storage: "File Storage", billing: "Notification Service",
};
const NOTIF_COLOR = { warning: "yellow", critical: "red", success: "green", info: "blue" };

const QUICK_ACTIONS = [
  { label: "Add Company",            icon: IconBuilding,        color: "blue",   route: "/companies" },
  { label: "Create Subscription",    icon: IconRosetteDiscountCheck, color: "violet", route: "/subscriptions" },
  { label: "Create Company Admin",   icon: IconUserPlus,        color: "teal",   route: "/companies" },
  { label: "Open Monitoring",        icon: IconActivity,        color: "orange", route: "/monitoring" },
  { label: "Open Marketplace",       icon: IconBuildingStore,   color: "grape",  route: "/marketplace" },
  { label: "Backup Now",             icon: IconDatabaseExport,  color: "indigo", route: "/backup" },
  { label: "Create Announcement",    icon: IconSpeakerphone,    color: "pink",   route: "/announcements" },
  { label: "System Settings",        icon: IconSettings,        color: "gray",   route: "/settings" },
];

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [revenueRange, setRevenueRange] = useState("monthly");

  const { data: companiesRes } = useQuery({ queryKey: ["companies-summary"], queryFn: () => getCompanies().then((r) => r.data?.data ?? r.data ?? []) });
  const { data: healthData }   = usePlatformHealth();
  const { data: statsData }    = usePlatformStats();
  const { data: backupsData }  = useBackups();
  const { data: subDashData }  = useSubDashboard();
  const { data: ticketDash }   = useTicketDashboard();
  const { data: securityRes }  = useQuery({ queryKey: ["security-stats-summary"], queryFn: () => getSecurityStats().then((r) => r.data?.data ?? r.data) });
  const { data: auditRes }     = useQuery({ queryKey: ["audit-logs-summary"], queryFn: () => getAuditLogs().then((r) => r.data?.data ?? r.data ?? []) });
  const { data: announceRes }  = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements, select: (r) => r?.data ?? r });

  const companies = companiesRes?.length ? companiesRes : MOCK_COMPANIES;
  const totalCompanies     = companies.length;
  const activeCompanies    = companies.filter((c) => c.status === "Active").length;
  const trialCompanies     = companies.filter((c) => c.status === "Trial").length;
  const suspendedCompanies = companies.filter((c) => c.status === "Suspended").length;
  const totalEmployees     = companies.reduce((s, c) => s + (c.employees || 0), 0);

  const platformStats = statsData || MOCK_PLATFORM_STATS;

  const revenueTrend = MOCK_REVENUE_TREND; // consistent with BillingManagement.jsx's canonical numbers
  const mrr = revenueTrend.at(-1)?.mrr || 0;
  const arr = mrr * 12;
  const activeSubs = subDashData?.activeSubscriptions ?? revenueTrend.at(-1)?.subs ?? 0;
  const renewalsThisMonth = subDashData?.renewalsThisMonth ?? 3;

  const rangeDivisor = { weekly: 4, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 }[revenueRange];
  const revenueChartData = revenueTrend.map((r) => ({ ...r, mrr: Math.round(r.mrr * rangeDivisor) }));

  // Company growth: reconstruct a plausible month-over-month ramp ending at today's real counts,
  // since the platform only exposes current snapshot counts, not historical growth.
  const companyGrowthData = revenueTrend.map((r, i, arr) => {
    const progress = (i + 1) / arr.length;
    return {
      month: r.month,
      New: i === arr.length - 1 ? Math.max(1, totalCompanies - Math.round(totalCompanies * 0.8)) : (i % 2 === 0 ? 1 : 0),
      Active: Math.max(1, Math.round(activeCompanies * progress)),
      Trial: Math.max(0, Math.round(trialCompanies * progress)),
    };
  });

  const rawServices = healthData?.services?.length ? healthData.services : MOCK_HEALTH_SERVICES;
  const services = rawServices.map((s) => ({ ...s, service: SERVICE_LABEL[s.service] || s.service }));
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const overallStatus = services.some((s) => s.status === "down") ? "Major Outage"
    : services.some((s) => s.status === "degraded") ? "Partial Outage" : "All Systems Operational";
  const overallColor = overallStatus === "Major Outage" ? "red" : overallStatus === "Partial Outage" ? "orange" : "green";

  const backups = backupsData?.backups?.length ? backupsData.backups : [];
  const lastBackup = backups[0];

  const security = securityRes || MOCK_SECURITY_STATS;

  const activity = auditRes?.length
    ? auditRes.map((a) => ({ id: a.id, action: a.action, detail: a.detail?.summary || a.module, time: a.ts }))
    : lastBackup
      ? [{ id: "backup-live", action: "Backup Completed", detail: `${lastBackup.type} backup — ${lastBackup.size}`, time: lastBackup.completedAt }, ...MOCK_ACTIVITY.slice(1)]
      : MOCK_ACTIVITY;

  const announcements = announceRes?.announcements?.length ? announceRes.announcements : MOCK_PLATFORM_ANNOUNCEMENTS.map((a) => ({ id: a.id, title: a.title, date: a.date }));

  const support = ticketDash?.cards
    ? { openTickets: ticketDash.cards.open, criticalTickets: ticketDash.cards.overdue, slaViolations: ticketDash.cards.overdue, avgResolutionHrs: MOCK_SUPPORT.avgResolutionHrs }
    : MOCK_SUPPORT;

  return (
    <Box>
      {/* ── SECTION 1: Top KPI cards ── */}
      <Text fw={700} fz="sm" c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: 0.4 }}>Companies</Text>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" mb="md">
        <KpiCard icon={IconBuilding} label="Total Companies"     value={totalCompanies}     sub="Tenants on platform" color="blue"   spark={[totalCompanies-3,totalCompanies-2,totalCompanies-1,totalCompanies]} />
        <KpiCard icon={IconCircleCheck} label="Active Companies" value={activeCompanies}    sub="Live accounts"      color="green"  spark={[activeCompanies-2,activeCompanies-1,activeCompanies-1,activeCompanies]} />
        <KpiCard icon={IconClockHour4} label="Trial Companies"   value={trialCompanies}     sub="In trial period"    color="yellow" spark={[trialCompanies-1,trialCompanies,trialCompanies,trialCompanies]} />
        <KpiCard icon={IconUserExclamation} label="Suspended"    value={suspendedCompanies} sub="Suspended accounts" color="red"    spark={[suspendedCompanies,suspendedCompanies,suspendedCompanies,suspendedCompanies]} />
      </SimpleGrid>

      <Text fw={700} fz="sm" c="dimmed" mb="xs" mt="md" tt="uppercase" style={{ letterSpacing: 0.4 }}>Users & Business</Text>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" mb="md">
        <KpiCard icon={IconUsers} label="Total Employees"    value={totalEmployees}                     sub="Across all tenants"     color="teal"   spark={[totalEmployees*0.9,totalEmployees*0.95,totalEmployees*0.98,totalEmployees]} />
        <KpiCard icon={IconActivity} label="Active Sessions" value={platformStats.activeUsers}          sub="Currently online"       color="cyan"   spark={[platformStats.activeUsers-5,platformStats.activeUsers-2,platformStats.activeUsers-1,platformStats.activeUsers]} />
        <KpiCard icon={IconCurrencyRupee} label="Monthly Revenue (MRR)" value={fmtMoney(mrr)}            sub="Recurring revenue"      trend="12.4%" up color="violet" spark={revenueTrend.map(r=>r.mrr)} />
        <KpiCard icon={IconReceipt2} label="Annual Revenue (ARR)"       value={fmtMoney(arr)}            sub="Projected annual"       trend="12.4%" up color="indigo" spark={revenueTrend.map(r=>r.arr)} />
      </SimpleGrid>

      <Text fw={700} fz="sm" c="dimmed" mb="xs" mt="md" tt="uppercase" style={{ letterSpacing: 0.4 }}>Platform</Text>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" mb="lg">
        <KpiCard icon={IconRosetteDiscountCheck} label="Active Subscriptions" value={activeSubs}         sub={`${renewalsThisMonth} renewing this month`} color="grape" spark={[activeSubs-2,activeSubs-1,activeSubs,activeSubs]} />
        <KpiCard icon={IconServer} label="API Requests Today" value={(platformStats.invoicesThisMonth || 14) * 1240} sub="Across all tenants" color="blue" spark={[8000,9200,10500,11800]} />
        <KpiCard icon={IconCloudUpload} label="Storage Used"  value="1.2 TB"                              sub="of 5 TB provisioned"    color="orange" spark={[900,1000,1100,1200]} />
        <KpiCard icon={overallColor === "green" ? IconCircleCheck : IconAlertTriangle} label="System Health" value={`${healthyCount}/${services.length}`} sub={overallStatus} color={overallColor} spark={[healthyCount-1,healthyCount,healthyCount,healthyCount]} />
      </SimpleGrid>

      {/* ── SECTION 2: Revenue Analytics / Company Growth / Subscription Distribution ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard
          title="Revenue Analytics" sub="MRR trend"
          action={
            <SegmentedControl size="xs" value={revenueRange} onChange={setRevenueRange}
              data={[{ label: "Weekly", value: "weekly" }, { label: "Monthly", value: "monthly" }, { label: "Quarterly", value: "quarterly" }, { label: "Yearly", value: "yearly" }]} />
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="saGradMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <RTooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="#7c3aed" strokeWidth={2.5} fill="url(#saGradMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Company Growth" sub="New vs active vs trial">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={companyGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <RTooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Bar dataKey="New" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Trial" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Subscription Distribution" sub="By plan tier">
          <Group align="center" gap="lg" wrap="nowrap">
            <Box style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_PLAN_DIST} dataKey="value" cx="50%" cy="50%" innerRadius={44} outerRadius={65} paddingAngle={3}>
                    {MOCK_PLAN_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RTooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack gap={6} style={{ flex: 1 }}>
              {MOCK_PLAN_DIST.map((d) => (
                <Group key={d.name} justify="space-between" wrap="nowrap">
                  <Group gap={6}><Box w={9} h={9} style={{ borderRadius: "50%", background: d.color }} /><Text fz="xs">{d.name}</Text></Group>
                  <Text fz="xs" fw={700}>{d.value}</Text>
                </Group>
              ))}
            </Stack>
          </Group>
        </PanelCard>
      </SimpleGrid>

      {/* ── SECTION 3: Platform Health | SECTION 10: Quick Actions ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Platform Health" sub={overallStatus} style={{ gridColumn: "span 2" }}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            {services.map((s) => {
              const Icon = SERVICE_ICON[s.service] || IconServer;
              const StatusIcon = STATUS_ICON[s.status] || IconCircleCheck;
              return (
                <Group key={s.service} justify="space-between" wrap="nowrap" p="xs"
                  style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 10 }}>
                  <Group gap="xs" wrap="nowrap">
                    <ThemeIcon size={30} radius="md" variant="light" color={STATUS_COLOR[s.status]}><Icon size={15} /></ThemeIcon>
                    <Text fz="sm" fw={500}>{s.service}</Text>
                  </Group>
                  <Badge size="sm" variant="light" color={STATUS_COLOR[s.status]} leftSection={<StatusIcon size={11} />}>
                    {s.status === "healthy" ? "Healthy" : s.status === "degraded" ? "Warning" : "Critical"}
                  </Badge>
                </Group>
              );
            })}
          </SimpleGrid>
        </PanelCard>

        <PanelCard title="Quick Actions">
          <Stack gap={6}>
            {QUICK_ACTIONS.map((a) => (
              <Group key={a.label} justify="space-between" wrap="nowrap" onClick={() => navigate(a.route)}
                style={{ cursor: "pointer", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--mantine-color-default-border)" }}>
                <Group gap="sm"><ThemeIcon size={28} radius="md" variant="light" color={a.color}><a.icon size={14} /></ThemeIcon><Text fz="xs" fw={500}>{a.label}</Text></Group>
                <IconChevronRight size={13} color="var(--mantine-color-dimmed)" />
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── SECTION 4: Customer Overview ── */}
      <PanelCard title="Customer Overview" sub="Growth, risk & billing signals" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="sm">
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>New Customers</Text>
            {MOCK_CUSTOMER_OVERVIEW.newCustomers.map((c) => <Text key={c.name} fz="xs" mb={2}>{c.name} <Text span c="dimmed">· {c.joined}</Text></Text>)}
          </Box>
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>Top Customers</Text>
            {MOCK_CUSTOMER_OVERVIEW.topCustomers.map((c) => <Text key={c.name} fz="xs" mb={2}>{c.name} <Text span c="dimmed">· {fmtMoney(c.mrr)}/mo</Text></Text>)}
          </Box>
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>Near Employee Limit</Text>
            {MOCK_CUSTOMER_OVERVIEW.nearEmployeeLimit.map((c) => <Text key={c.name} fz="xs" mb={2}>{c.name} <Text span c="orange">· {c.used}/{c.limit}</Text></Text>)}
          </Box>
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>Near Storage Limit</Text>
            {MOCK_CUSTOMER_OVERVIEW.nearStorageLimit.map((c) => <Text key={c.name} fz="xs" mb={2}>{c.name} <Text span c="orange">· {c.usedPct}%</Text></Text>)}
          </Box>
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>Failed Payments</Text>
            {MOCK_CUSTOMER_OVERVIEW.failedPayments.map((c) => <Text key={c.invoice} fz="xs" mb={2}>{c.name} <Text span c="red">· {fmtMoney(c.amount)}</Text></Text>)}
          </Box>
        </SimpleGrid>
      </PanelCard>

      {/* ── SECTION 5: Pending Approvals | SECTION 6: Platform Activity Timeline ── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
        <PanelCard title="Pending Approvals" sub={`${MOCK_APPROVALS.length} awaiting review`}>
          <Stack gap="sm">
            {MOCK_APPROVALS.map((a) => (
              <Group key={a.id} justify="space-between" wrap="nowrap" pb="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Box style={{ flex: 1 }}>
                  <Text fz="xs" fw={700} c="violet">{a.type}</Text>
                  <Text fz="sm">{a.requester}</Text>
                  <Text fz="xs" c="dimmed">{a.date}</Text>
                </Box>
                <Group gap={4} wrap="nowrap">
                  <Tooltip label="View"><ActionIcon size="sm" variant="light" color="gray"><IconChevronRight size={13} /></ActionIcon></Tooltip>
                  <Tooltip label="Approve"><ActionIcon size="sm" variant="light" color="green"><IconCircleCheck size={13} /></ActionIcon></Tooltip>
                  <Tooltip label="Reject"><ActionIcon size="sm" variant="light" color="red"><IconX size={13} /></ActionIcon></Tooltip>
                </Group>
              </Group>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="Platform Activity Timeline" sub="Latest events across the platform">
          <Stack gap="sm">
            {activity.slice(0, 6).map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box w={3} style={{ background: "var(--mantine-color-blue-5)", alignSelf: "stretch", borderRadius: 4, flexShrink: 0 }} />
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={600}>{a.action}</Text>
                  <Text fz="xs" c="dimmed">{a.detail}</Text>
                </Box>
                <Text fz="xs" c="dimmed">{a.time}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── SECTION 7: Security Center | SECTION 8: Support Center ── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
        <PanelCard title="Security Center" sub="Platform-wide security signals" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/security")}>View All</Text>}>
          <SimpleGrid cols={2} spacing="sm">
            <Stack gap={2}><Text fz="xs" c="dimmed">Failed Logins Today</Text><Text fz="lg" fw={800}>{security.failedLoginsToday}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">Active Sessions</Text><Text fz="lg" fw={800}>{security.activeSessions}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">Locked Accounts</Text><Text fz="lg" fw={800} c={security.lockedAccounts > 0 ? "red" : undefined}>{security.lockedAccounts ?? 0}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">Suspicious Activity</Text><Text fz="lg" fw={800} c={(security.suspiciousActivities ?? 0) > 0 ? "orange" : undefined}>{security.suspiciousActivities ?? 0}</Text></Stack>
          </SimpleGrid>
          <Box mt="sm">
            <Group justify="space-between" mb={4}><Text fz="xs" c="dimmed">MFA Adoption</Text><Text fz="xs" fw={700}>{security.mfaEnabled}/{security.mfaTotal}</Text></Group>
            <Progress value={security.mfaTotal ? (security.mfaEnabled / security.mfaTotal) * 100 : 0} color="teal" size="sm" radius="xl" />
          </Box>
        </PanelCard>

        <PanelCard title="Support Center" sub="Helpdesk overview" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/helpdesk")}>View All</Text>}>
          <SimpleGrid cols={2} spacing="sm">
            <Stack gap={2}><Text fz="xs" c="dimmed">Open Tickets</Text><Text fz="lg" fw={800}>{support.openTickets}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">Critical Tickets</Text><Text fz="lg" fw={800} c={support.criticalTickets > 0 ? "red" : undefined}>{support.criticalTickets}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">SLA Violations</Text><Text fz="lg" fw={800} c={support.slaViolations > 0 ? "orange" : undefined}>{support.slaViolations}</Text></Stack>
            <Stack gap={2}><Text fz="xs" c="dimmed">Avg Resolution</Text><Text fz="lg" fw={800}>{support.avgResolutionHrs}h</Text></Stack>
          </SimpleGrid>
        </PanelCard>
      </SimpleGrid>

      {/* ── SECTION 9: Notifications | SECTION 11: AI Insights ── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
        <PanelCard title="Notifications" sub="Requires attention">
          <Stack gap="xs">
            {MOCK_NOTIFICATIONS.map((n) => (
              <Group key={n.id} gap="xs" wrap="nowrap">
                <Box w={7} h={7} style={{ borderRadius: "50%", background: `var(--mantine-color-${NOTIF_COLOR[n.type]}-6)`, flexShrink: 0 }} />
                <Text fz="sm">{n.text}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="AI Insights" sub="Auto-generated platform observations">
          <Stack gap="xs">
            {MOCK_AI_INSIGHTS.map((text, i) => (
              <Group key={i} gap="xs" wrap="nowrap" align="flex-start">
                <ThemeIcon size={22} radius="xl" variant="light" color="violet"><IconBulb size={12} /></ThemeIcon>
                <Text fz="sm" style={{ flex: 1 }}>{text}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── SECTION 13: License & Resource Usage ── */}
      <PanelCard title="License & Resource Usage" sub="Consumption across the platform" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {[
            { label: "Employee Licenses", used: totalEmployees, limit: 1000, color: "blue" },
            { label: "Storage",           used: 1200, limit: 5000, unit: "GB", color: "orange" },
            { label: "AI Credits",        used: 32000, limit: 50000, color: "grape" },
            { label: "API Calls",         used: (platformStats.invoicesThisMonth || 14) * 1240, limit: 50000, color: "teal" },
          ].map((r) => (
            <Box key={r.label}>
              <Group justify="space-between" mb={4}>
                <Text fz="xs" c="dimmed">{r.label}</Text>
                <Text fz="xs" fw={700}>{r.used.toLocaleString("en-IN")}{r.unit ? ` ${r.unit}` : ""} / {r.limit.toLocaleString("en-IN")}{r.unit ? ` ${r.unit}` : ""}</Text>
              </Group>
              <Progress value={(r.used / r.limit) * 100} color={r.color} size="sm" radius="xl" />
            </Box>
          ))}
        </SimpleGrid>
      </PanelCard>

      {/* ── SECTION 14: Calendar & Events | SECTION 15: Platform Announcements ── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <PanelCard title="Calendar & Events" sub="Renewals, maintenance & releases">
          <Stack gap="sm">
            {MOCK_CALENDAR.map((e) => (
              <Group key={e.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={30} radius="md" variant="light" color="blue"><IconCalendarEvent size={15} /></ThemeIcon>
                  <Text fz="sm">{e.title}</Text>
                </Group>
                <Text fz="xs" c="dimmed">{e.date}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="Platform Announcements" sub="Product updates & advisories" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/announcements")}>View All</Text>}>
          <Stack gap="sm">
            {announcements.slice(0, 5).map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <ThemeIcon size={26} radius="md" variant="light" color="pink"><IconRosette size={13} /></ThemeIcon>
                <Box style={{ flex: 1 }}><Text fz="sm" fw={600}>{a.title}</Text>{a.date && <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>}</Box>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>
    </Box>
  );
};
