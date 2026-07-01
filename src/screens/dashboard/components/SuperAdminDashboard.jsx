import { useNavigate } from "react-router-dom";
import { SimpleGrid, Box, Group, Text, Avatar, Stack, ThemeIcon, Loader, Center, Progress } from "@mantine/core";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  IconBuilding, IconUsers, IconUserCheck, IconClock, IconWallet,
  IconBriefcase, IconTicket, IconChevronRight, IconCake,
  IconUserPlus, IconCalendarOff, IconFileText, IconSpeakerphone, IconShieldCheck,
} from "@tabler/icons-react";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney, initials, SPARK_HEX } from "./DashboardKit";
import {
  getDashboardSummary, getRecentActivity, getAnnouncements,
  getUpcomingEvents, getAttendanceSummary, getPayrollSummary, getSystemHealth,
} from "../../../api/dashboardApi";
import { getOnboarding } from "../../../services/onboardingService";
import { useFetchAllEmployees } from "../../../queries/useEmployees";

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;
const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };

const MOCK_SUMMARY = {
  totalEmployees: 134,
  activeEmployees: 121,
  pendingLeaves: 8,
  totalSalary: 9820000,
  avgSalary: 73284,
  departments: [
    { name: "Engineering",  count: 42 },
    { name: "Sales",        count: 28 },
    { name: "HR",           count: 14 },
    { name: "Finance",      count: 18 },
    { name: "Operations",   count: 32 },
  ],
};

const MOCK_ATTEND = {
  days: [
    { day: "Mon", present: 118, absent: 10, onLeave: 6 },
    { day: "Tue", present: 122, absent: 7,  onLeave: 5 },
    { day: "Wed", present: 115, absent: 12, onLeave: 7 },
    { day: "Thu", present: 120, absent: 8,  onLeave: 6 },
    { day: "Fri", present: 119, absent: 9,  onLeave: 6 },
  ],
};

const MOCK_ANNOUNCE = {
  announcements: [
    { id: 1, title: "Q3 All-Hands Meeting — 15 Jul 2026",          type: "info",    date: "10 Jul 2026" },
    { id: 2, title: "Updated Leave Policy effective August 2026",   type: "hr",      date: "8 Jul 2026"  },
    { id: 3, title: "Payroll processed for June 2026",              type: "finance", date: "5 Jul 2026"  },
    { id: 4, title: "Office closed on 17 Jul — National Holiday",   type: "info",    date: "3 Jul 2026"  },
    { id: 5, title: "New security awareness training mandatory",    type: "high",    date: "1 Jul 2026"  },
  ],
};

const MOCK_PAYROLL = {
  months: [
    { label: "Feb", net: 9200000, gross: 10120000 },
    { label: "Mar", net: 9380000, gross: 10300000 },
    { label: "Apr", net: 9510000, gross: 10450000 },
    { label: "May", net: 9640000, gross: 10580000 },
    { label: "Jun", net: 9820000, gross: 10790000 },
  ],
};

const MOCK_HEALTH = {
  apiUptime:  { value: 99 },
  dbHealth:   { value: 98 },
  storage:    { value: 47 },
  license:    { value: 63 },
};
const PIE_COLORS = ["#228be6", "#40c057", "#fab005", "#7950f2", "#fa5252"];
const ramp = (v) => [v * 0.9, v * 0.93, v * 0.96, v].map(Math.round);

const QUICK_ACTIONS = [
  { label: "Add Employee",        icon: IconUserPlus,     color: "blue",   route: "/employees" },
  { label: "Manage Roles",        icon: IconShieldCheck,  color: "violet", route: "/roles" },
  { label: "Apply Leave",         icon: IconCalendarOff,  color: "green",  route: "/leave" },
  { label: "System Audit",        icon: IconFileText,     color: "orange", route: "/audit-logs" },
  { label: "Create Announcement", icon: IconSpeakerphone, color: "pink",   route: "/announcements" },
];

export const SuperAdminDashboard = ({ employees: empProp = [] }) => {
  const navigate = useNavigate();
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"],  queryFn: getDashboardSummary,  select: (r) => r?.data ?? r });
  const { data: attendData }   = useQuery({ queryKey: ["dashboard-attend"],   queryFn: getAttendanceSummary, select: (r) => r?.data ?? r });
  const { data: announceData } = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements,     select: (r) => r?.data ?? r });
  const { data: payrollData }  = useQuery({ queryKey: ["dashboard-payroll"],  queryFn: getPayrollSummary,    select: (r) => r?.data ?? r });
  const { data: healthData }   = useQuery({ queryKey: ["dashboard-health"],   queryFn: getSystemHealth,      select: (r) => r?.data ?? r, refetchInterval: 30000 });
  const { data: onboardResp = {} } = useQuery({ queryKey: ["onboarding"], queryFn: getOnboarding });
  const { data: allEmployees = [] } = useFetchAllEmployees();

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const employees = allEmployees.length ? allEmployees : empProp;
  const summary       = summaryData ?? MOCK_SUMMARY;
  const total         = summary.totalEmployees  || employees.length || 0;
  const active        = summary.activeEmployees || employees.filter((e) => e.status === "Active").length || 0;
  const pendingLeaves = summary.pendingLeaves   || 0;
  const totalSalary   = summary.totalSalary     || employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const depts         = summary.departments     || [];
  const deptCount     = depts.length || new Set(employees.map((e) => e.department).filter(Boolean)).size;

  const rawAttend   = attendData ?? MOCK_ATTEND;
  const attendDays  = rawAttend?.days || [];
  const todayAttend = attendDays[attendDays.length - 1] || {};
  const present     = todayAttend.present || 0;
  const attendPct   = total > 0 ? Math.round((present / total) * 100) : 0;

  const onboardData        = Array.isArray(onboardResp) ? onboardResp : (onboardResp.onboardings || []);
  const activeOnboardings  = onboardData.filter((o) => o.status === "Pending" || o.status === "In Progress").length;
  const rawPayroll         = payrollData ?? MOCK_PAYROLL;
  const payrollMonths      = (rawPayroll?.months || []).map((m) => ({ month: m.label, payroll: m.net }));
  const payrollSpark       = payrollMonths.length > 1 ? payrollMonths.slice(-5).map((m) => m.payroll) : ramp(totalSalary);
  const presentSpark       = attendDays.length > 1 ? attendDays.slice(-5).map((d) => d.present || 0) : ramp(present);
  const rawAnnounce        = announceData ?? MOCK_ANNOUNCE;
  const announcements      = rawAnnounce?.announcements || [];

  // Attendance area series
  const attendSeries = attendDays.map((d) => ({
    day: d.day, Present: d.present || 0, Absent: d.absent || 0, "On Leave": d.onLeave || d.leave || 0,
  }));

  // Leave donut — from summary pending data fallback
  const leaveByType = {}; // SA doesn't have leaves prop, use summary
  const leaveDonutData = depts.slice(0, 5).map((d, i) => ({ name: d.name, value: d.count, color: PIE_COLORS[i % PIE_COLORS.length] }));
  const totalDonut = leaveDonutData.reduce((s, d) => s + d.value, 0);

  // Department headcount bar
  const deptMap = {};
  employees.forEach((e) => { const d = e.department || "Other"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const deptBar = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Recent joiners
  const recentJoiners = [...employees]
    .filter((e) => e.joinDate)
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 6);

  // Upcoming birthdays (next 30 days, year-wrap safe)
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in30 = new Date(todayMidnight); in30.setDate(in30.getDate() + 30);
  const birthdays = employees
    .filter((e) => e.dob)
    .map((e) => {
      const d = new Date(e.dob);
      let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
      if (next < todayMidnight) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
      return { ...e, next };
    })
    .filter((e) => e.next >= todayMidnight && e.next <= in30)
    .sort((a, b) => a.next - b.next)
    .slice(0, 6);

  // System health
  const rawHealth    = healthData ?? MOCK_HEALTH;
  const systemHealth = rawHealth ? [
    { label: "API Uptime",    value: rawHealth.apiUptime?.value ?? 99, color: "green"  },
    { label: "DB Health",     value: rawHealth.dbHealth?.value  ?? 98, color: "blue"   },
    { label: "Storage Used",  value: rawHealth.storage?.value   ?? 45, color: "yellow" },
    { label: "License Usage", value: rawHealth.license?.value   ?? 60, color: "violet" },
  ] : [];

  return (
    <Box>
      {/* ── KPI row ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" mb="md">
        <KpiCard icon={IconUsers}     label="Total Employees"   value={total}                sub={`${deptCount} departments`}     trend="8.2%"  up color="blue"   spark={ramp(total)} />
        <KpiCard icon={IconUserCheck} label="Present Today"     value={present}              sub={`${attendPct}% attendance`}     trend="5.1%"  up color="green"  spark={presentSpark} />
        <KpiCard icon={IconClock}     label="Pending Leaves"    value={pendingLeaves}        sub="Awaiting action"                trend="2.3%"  up={false} color="red"    spark={ramp(pendingLeaves)} />
        <KpiCard icon={IconWallet}    label="Payroll Cost"      value={fmtMoney(totalSalary)} sub="Monthly"                      trend="3.1%"  up color="violet" spark={payrollSpark} />
        <KpiCard icon={IconBriefcase} label="Active Onboardings" value={activeOnboardings}  sub={`${active} active staff`}       trend="1.2%"  up color="teal"   spark={ramp(activeOnboardings)} />
      </SimpleGrid>

      {/* ── Row 2: Attendance | Dept Breakdown donut | Quick Actions ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Attendance Overview" sub="This week">
          {attendSeries.length === 0
            ? <Center h={240}><Text c="dimmed" fz="sm">No attendance data</Text></Center>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={attendSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="saGradPresent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="saGradAbsent"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fa5252" stopOpacity={0.25} /><stop offset="95%" stopColor="#fa5252" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="saGradLeave"   x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fab005" stopOpacity={0.25} /><stop offset="95%" stopColor="#fab005" stopOpacity={0.02} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  <Area type="monotone" dataKey="Present"  stroke="#4f46e5" strokeWidth={2.5} fill="url(#saGradPresent)" />
                  <Area type="monotone" dataKey="Absent"   stroke="#fa5252" strokeWidth={2}   fill="url(#saGradAbsent)" />
                  <Area type="monotone" dataKey="On Leave" stroke="#fab005" strokeWidth={2}   fill="url(#saGradLeave)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </PanelCard>

        <PanelCard title="Department Distribution" sub="Headcount by dept">
          {totalDonut === 0
            ? <Center h={220}><Text c="dimmed" fz="sm">No department data</Text></Center>
            : (
              <Group align="center" gap="lg" wrap="nowrap">
                <Box style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leaveDonutData} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                        {leaveDonutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <Text fw={800} size="lg" lh={1}>{total}</Text>
                    <Text size="9px" c="dimmed">Employees</Text>
                  </Box>
                </Box>
                <Stack gap={8} style={{ flex: 1 }}>
                  {leaveDonutData.map((d) => (
                    <Group key={d.name} justify="space-between" wrap="nowrap">
                      <Group gap={6}><Box w={9} h={9} style={{ borderRadius: "50%", background: d.color }} /><Text fz="xs">{d.name}</Text></Group>
                      <Text fz="xs" fw={700}>{d.value} ({totalDonut > 0 ? Math.round((d.value / totalDonut) * 100) : 0}%)</Text>
                    </Group>
                  ))}
                </Stack>
              </Group>
            )}
        </PanelCard>

        <PanelCard title="Quick Actions">
          <Stack gap={8}>
            {QUICK_ACTIONS.map((a) => (
              <Group key={a.label} justify="space-between" wrap="nowrap" onClick={() => navigate(a.route)}
                style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--mantine-color-default-border)" }}>
                <Group gap="sm"><ThemeIcon size={32} radius="md" variant="light" color={a.color}><a.icon size={16} /></ThemeIcon><Text fz="sm" fw={500}>{a.label}</Text></Group>
                <IconChevronRight size={15} color="var(--mantine-color-dimmed)" />
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── Row 3: Dept headcount | Recent Joiners | Upcoming Birthdays ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Department Wise Headcount" sub={`${total} employees`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptBar} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#228be6" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Recent Joiners" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/employees")}>View All</Text>}>
          <Stack gap="sm">
            {recentJoiners.length === 0 && <Text c="dimmed" fz="sm">No recent joiners</Text>}
            {recentJoiners.map((e) => (
              <Group key={e.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar size={34} radius="xl" color="violet">{initials(e.name)}</Avatar>
                  <Box><Text fz="sm" fw={600} lh={1.2}>{e.name}</Text><Text fz="xs" c="dimmed">{e.designation || e.department || "—"}</Text></Box>
                </Group>
                <Text fz="xs" c="dimmed">{e.joinDate ? new Date(e.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="Upcoming Birthdays" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/employees")}>View All</Text>}>
          <Stack gap="sm">
            {birthdays.length === 0 && <Text c="dimmed" fz="sm">No birthdays in the next 30 days</Text>}
            {birthdays.map((e) => (
              <Group key={e.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar size={34} radius="xl" color="pink">{initials(e.name)}</Avatar>
                  <Box><Text fz="sm" fw={600} lh={1.2}>{e.name}</Text><Text fz="xs" c="dimmed">{e.designation || e.department || "—"}</Text></Box>
                </Group>
                <Text fz="xs" c="dimmed">{e.next.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── Row 4: System Health + Announcements ── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <PanelCard title="System Health" sub="Live infrastructure metrics">
          {systemHealth.length === 0
            ? <Text c="dimmed" fz="sm" py="md" ta="center">Loading metrics...</Text>
            : systemHealth.map(({ label, value, color }, i, arr) => (
              <Box key={label} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" mb={4}>
                  <Text fz="sm" c="dimmed">{label}</Text>
                  <Text fz="sm" fw={700} c={color}>{value}%</Text>
                </Group>
                <Progress value={value} color={color} size="sm" radius="xl" />
              </Box>
            ))}
        </PanelCard>

        <PanelCard title="Announcements" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/announcements")}>View All</Text>}>
          <Stack gap="sm">
            {announcements.length === 0 && <Text c="dimmed" fz="sm">No announcements</Text>}
            {announcements.slice(0, 5).map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${ANNOUNCE_COLORS[a.type] || "blue"}-5)`, alignSelf: "stretch", borderRadius: 4, flexShrink: 0 }} />
                <Box style={{ flex: 1 }}><Text fz="sm" fw={600}>{a.title}</Text>{a.date && <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>}</Box>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>
    </Box>
  );
};
