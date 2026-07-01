import { useNavigate } from "react-router-dom";
import { SimpleGrid, Box, Group, Text, Loader, Center, Avatar, Stack, ThemeIcon } from "@mantine/core";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  IconUsers, IconUserCheck, IconCalendarOff, IconWallet, IconFileText,
  IconUserPlus, IconClipboardCheck, IconSpeakerphone,
  IconChevronRight, IconCake,
} from "@tabler/icons-react";
import { getDashboardSummary, getAttendanceSummary, getAnnouncements } from "../../../api/dashboardApi";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney, initials } from "./DashboardKit";

const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };

const MOCK_SUMMARY = {
  totalEmployees: 134,
  pendingLeaves: 8,
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
    { id: 1, title: "Q3 All-Hands Meeting — 15 Jul 2026",          type: "info",    date: "10 Jul 2026", body: "Join us for the company-wide town hall." },
    { id: 2, title: "Updated Leave Policy effective August 2026",   type: "hr",      date: "8 Jul 2026",  body: "New casual leave limits apply from Aug 1." },
    { id: 3, title: "Payroll processed for June 2026",              type: "finance", date: "5 Jul 2026",  body: "Salaries credited by 5 Jul EOD." },
    { id: 4, title: "Office closed on 17 Jul — National Holiday",   type: "info",    date: "3 Jul 2026",  body: "Work from home optional on adjacent days." },
  ],
};

const MOCK_EMPLOYEES = [
  { id: "E001", name: "Arjun Mehta",      department: "Engineering",  designation: "Sr. Engineer",     salary: 95000, status: "Active", joinDate: "2024-03-10", dob: "1991-07-15" },
  { id: "E002", name: "Priya Sharma",     department: "HR",           designation: "HR Manager",       salary: 72000, status: "Active", joinDate: "2024-04-01", dob: "1988-07-22" },
  { id: "E003", name: "Rahul Nair",       department: "Sales",        designation: "Sales Lead",       salary: 68000, status: "Active", joinDate: "2024-05-15", dob: "1993-08-05" },
  { id: "E004", name: "Sneha Iyer",       department: "Finance",      designation: "Finance Analyst",  salary: 74000, status: "Active", joinDate: "2024-06-01", dob: "1990-07-30" },
  { id: "E005", name: "Kiran Patel",      department: "Operations",   designation: "Ops Coordinator",  salary: 58000, status: "Active", joinDate: "2024-06-20", dob: "1995-09-11" },
  { id: "E006", name: "Divya Krishnan",   department: "Engineering",  designation: "Frontend Dev",     salary: 82000, status: "Active", joinDate: "2024-07-01", dob: "1992-08-18" },
];

const MOCK_LEAVES = [
  { id: "L001", employeeId: "E001", leaveType: "Casual",  status: "Approved",  startDate: "2026-07-03", endDate: "2026-07-04" },
  { id: "L002", employeeId: "E003", leaveType: "Medical", status: "Pending",   startDate: "2026-07-08", endDate: "2026-07-09" },
  { id: "L003", employeeId: "E005", leaveType: "Earned",  status: "Approved",  startDate: "2026-07-10", endDate: "2026-07-12" },
  { id: "L004", employeeId: "E002", leaveType: "Casual",  status: "Pending",   startDate: "2026-07-14", endDate: "2026-07-14" },
  { id: "L005", employeeId: "E006", leaveType: "Medical", status: "Approved",  startDate: "2026-07-17", endDate: "2026-07-18" },
  { id: "L006", employeeId: "E004", leaveType: "Earned",  status: "Rejected",  startDate: "2026-07-21", endDate: "2026-07-22" },
];

const QUICK_ACTIONS = [
  { label: "Add Employee", icon: IconUserPlus, color: "blue", route: "/employees" },
  { label: "Apply Leave", icon: IconCalendarOff, color: "green", route: "/leave" },
  { label: "Mark Attendance", icon: IconUserCheck, color: "violet", route: "/my-attendance" },
  { label: "Request Document", icon: IconFileText, color: "orange", route: "/documents" },
  { label: "Create Announcement", icon: IconSpeakerphone, color: "pink", route: "/announcements" },
];

export const HRDashboard = ({ employees: empProp = [], leaves: leavesProp = [] }) => {
  const navigate = useNavigate();
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: attendData }   = useQuery({ queryKey: ["dashboard-attend"],  queryFn: getAttendanceSummary, select: (r) => r?.data ?? r });
  const { data: announceData } = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements, select: (r) => r?.data ?? r });

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const employees = empProp.length ? empProp : MOCK_EMPLOYEES;
  const leaves    = leavesProp.length ? leavesProp : MOCK_LEAVES;
  const summary = summaryData ?? MOCK_SUMMARY;
  const total = summary.totalEmployees || employees.length || 0;
  const pendingLeaves = summary.pendingLeaves || 0;
  const depts = summary.departments || [];
  const deptCount = depts.length || new Set(employees.map((e) => e.department).filter(Boolean)).size;

  const rawAttend   = attendData ?? MOCK_ATTEND;
  const attendDays  = rawAttend?.days || [];
  const todayAttend = attendDays[attendDays.length - 1] || {};
  const present = todayAttend.present || 0;
  const attendPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const onLeave = leaves.filter((l) => l.status === "Approved").length;
  const totalPayroll = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);

  const rawAnnounce   = announceData ?? MOCK_ANNOUNCE;
  const announcements = rawAnnounce?.announcements || [];

  // Attendance line series (present/absent/onleave per day)
  const attendSeries = attendDays.map((d) => ({ day: d.day, Present: d.present || 0, Absent: d.absent || 0, "On Leave": d.onLeave || d.leave || 0 }));

  // Sparkline series (fall back to a gentle synthetic trend when no daily data)
  const presentSpark = attendSeries.length ? attendSeries.map((d) => d.Present) : [total * 0.7, total * 0.8, total * 0.75, total * 0.85, present || total * 0.9];
  const headcountSpark = [total * 0.9, total * 0.93, total * 0.95, total * 0.97, total];
  const leaveSpark = attendSeries.length ? attendSeries.map((d) => d["On Leave"]) : [3, 5, 4, 6, onLeave];

  // Leave donut
  const leaveByType = leaves.reduce((acc, l) => { const t = l.leaveType || "Other"; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const PIE = ["#228be6", "#40c057", "#fab005", "#7950f2", "#fa5252"];
  const leaveData = Object.entries(leaveByType).map(([name, value], i) => ({ name, value, color: PIE[i % PIE.length] }));
  const totalLeaves = leaveData.reduce((s, d) => s + d.value, 0);

  // Department headcount bar
  const deptMap = {};
  employees.forEach((e) => { const d = e.department || "Other"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const deptBar = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Recent joiners (sort by joinDate desc)
  const recentJoiners = [...employees]
    .filter((e) => e.joinDate)
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 6);

  // Upcoming birthdays (next 30 days)
  const now = new Date(); const in30 = new Date(); in30.setDate(in30.getDate() + 30);
  const birthdays = employees
    .filter((e) => e.dob)
    .map((e) => { const d = new Date(e.dob); d.setFullYear(now.getFullYear()); return { ...e, next: d }; })
    .filter((e) => e.next >= new Date(now.toDateString()) && e.next <= in30)
    .sort((a, b) => a.next - b.next)
    .slice(0, 6);

  return (
    <Box>
      {/* ── KPI cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" mb="md">
        <KpiCard icon={IconUsers}     label="Total Employees" value={total.toLocaleString("en-IN")} sub="vs last month" trend="12.5%" up color="blue" spark={headcountSpark} />
        <KpiCard icon={IconUserCheck} label="Present Today"    value={present}                       sub={`${attendPct}% attendance`} trend="8.2%" up color="green" spark={presentSpark} />
        <KpiCard icon={IconCalendarOff} label="On Leave"       value={onLeave}                       sub="approved" trend="4.7%" up color="orange" spark={leaveSpark} />
        <KpiCard icon={IconWallet}    label="Total Payroll"    value={fmtMoney(totalPayroll)}        sub="monthly" trend="10.3%" up color="violet" spark={headcountSpark} />
        <KpiCard icon={IconClipboardCheck} label="Pending Approvals" value={pendingLeaves}          sub="awaiting" trend="3.3%" up={false} color="red" spark={leaveSpark} />
      </SimpleGrid>

      {/* ── Charts row: attendance line | leave donut | quick actions ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Attendance Overview" sub="This week" style={{ gridColumn: "span 1" }}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={attendSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fa5252" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#fa5252" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradLeave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fab005" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#fab005" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Area type="monotone" dataKey="Present" stroke="#4f46e5" strokeWidth={2.5} fill="url(#gradPresent)" />
              <Area type="monotone" dataKey="Absent" stroke="#fa5252" strokeWidth={2} fill="url(#gradAbsent)" />
              <Area type="monotone" dataKey="On Leave" stroke="#fab005" strokeWidth={2} fill="url(#gradLeave)" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Leave Summary" sub="This month">
          {totalLeaves === 0 ? <Center h={220}><Text c="dimmed" fz="sm">No leave data</Text></Center> : (
            <Group align="center" gap="lg" wrap="nowrap">
              <Box style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveData} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                      {leaveData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <Text fw={800} size="lg" lh={1}>{totalLeaves}</Text>
                  <Text size="9px" c="dimmed">Total Leaves</Text>
                </Box>
              </Box>
              <Stack gap={8} style={{ flex: 1 }}>
                {leaveData.map((d) => (
                  <Group key={d.name} justify="space-between" wrap="nowrap">
                    <Group gap={6}><Box w={9} h={9} style={{ borderRadius: "50%", background: d.color }} /><Text fz="xs">{d.name}</Text></Group>
                    <Text fz="xs" fw={700}>{d.value} ({Math.round((d.value / totalLeaves) * 100)}%)</Text>
                  </Group>
                ))}
              </Stack>
            </Group>
          )}
        </PanelCard>

        <PanelCard title="Quick Actions">
          <Stack gap={8}>
            {QUICK_ACTIONS.map((a) => (
              <Group key={a.label} justify="space-between" wrap="nowrap"
                onClick={() => navigate(a.route)}
                style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--mantine-color-default-border)" }}
                className="qa-row">
                <Group gap="sm"><ThemeIcon size={32} radius="md" variant="light" color={a.color}><a.icon size={16} /></ThemeIcon><Text fz="sm" fw={500}>{a.label}</Text></Group>
                <IconChevronRight size={15} color="var(--mantine-color-dimmed)" />
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      {/* ── Bottom row: dept headcount | recent joiners | birthdays ── */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Department Wise Headcount" sub={`${total} employees`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptBar} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#228be6" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Recent Joiners" action={<Text fz="xs" c="blue" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/employees")}>View All</Text>}>
          <Stack gap="sm">
            {recentJoiners.length === 0 && <Text c="dimmed" fz="sm">No recent joiners</Text>}
            {recentJoiners.map((e) => (
              <Group key={e.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar size={34} radius="xl" color="blue">{initials(e.name)}</Avatar>
                  <Box><Text fz="sm" fw={600} lh={1.2}>{e.name}</Text><Text fz="xs" c="dimmed">{e.designation || e.department || "—"}</Text></Box>
                </Group>
                <Text fz="xs" c="dimmed">{e.joinDate ? new Date(e.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</Text>
              </Group>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="Upcoming Birthdays" action={<Group gap={4}><IconCake size={14} color="var(--mantine-color-pink-5)" /></Group>}>
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

      {/* ── Announcements ── */}
      <PanelCard title="Announcements" action={<Text fz="xs" c="blue" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/announcements")}>View All</Text>}>
        <Stack gap="sm">
          {announcements.length === 0 && <Text c="dimmed" fz="sm">No announcements</Text>}
          {announcements.slice(0, 4).map((a, i, arr) => (
            <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
              <ThemeIcon size={30} radius="md" variant="light" color={ANNOUNCE_COLORS[a.type] || "blue"}><IconSpeakerphone size={15} /></ThemeIcon>
              <Box style={{ flex: 1 }}><Text fz="sm" fw={600}>{a.title}</Text><Text fz="xs" c="dimmed" mt={2}>{a.body || ""}</Text></Box>
              <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{a.date}</Text>
            </Group>
          ))}
        </Stack>
      </PanelCard>
    </Box>
  );
};
