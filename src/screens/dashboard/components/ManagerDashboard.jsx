import { useNavigate } from "react-router-dom";
import { SimpleGrid, Box, Group, Text, Avatar, Loader, Center, Stack } from "@mantine/core";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  IconUsers, IconUserCheck, IconCalendarOff, IconClipboardCheck,
  IconUserPlus, IconCalendarOff as IconLeaveAction, IconCake, IconSpeakerphone, IconChevronRight,
} from "@tabler/icons-react";
import { KpiCard, PanelCard, ChartTooltip, initials } from "./DashboardKit";
import { getAnnouncements, getUpcomingEvents, getDashboardSummary, getAttendanceSummary } from "../../../api/dashboardApi";

const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };
const PIE = ["#6d28d9", "#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

const MOCK_SUMMARY = { pendingLeaves: 4 };

const MOCK_ATTEND = {
  days: [
    { day: "Mon", present: 11, absent: 2, onLeave: 1 },
    { day: "Tue", present: 12, absent: 1, onLeave: 1 },
    { day: "Wed", present: 10, absent: 2, onLeave: 2 },
    { day: "Thu", present: 12, absent: 1, onLeave: 1 },
    { day: "Fri", present: 11, absent: 2, onLeave: 1 },
  ],
};

const MOCK_ANNOUNCE = {
  announcements: [
    { id: 1, title: "Q3 All-Hands Meeting — 15 Jul 2026",        type: "info",    date: "10 Jul 2026" },
    { id: 2, title: "Updated Leave Policy effective August 2026", type: "hr",      date: "8 Jul 2026"  },
    { id: 3, title: "Payroll processed for June 2026",            type: "finance", date: "5 Jul 2026"  },
    { id: 4, title: "Office closed on 17 Jul — National Holiday", type: "info",    date: "3 Jul 2026"  },
    { id: 5, title: "New security awareness training mandatory",  type: "high",    date: "1 Jul 2026"  },
  ],
};

const MOCK_EMPLOYEES = [
  { id: "E001", name: "Arjun Mehta",    department: "Engineering", designation: "Sr. Engineer",    salary: 95000, status: "Active",   joinDate: "2024-03-10" },
  { id: "E002", name: "Priya Sharma",   department: "Engineering", designation: "Frontend Dev",    salary: 82000, status: "Active",   joinDate: "2024-04-01" },
  { id: "E003", name: "Rahul Nair",     department: "Engineering", designation: "Backend Dev",     salary: 78000, status: "Present",  joinDate: "2024-05-15" },
  { id: "E004", name: "Sneha Iyer",     department: "Engineering", designation: "QA Engineer",     salary: 70000, status: "Present",  joinDate: "2024-06-01" },
  { id: "E005", name: "Kiran Patel",    department: "Engineering", designation: "DevOps Engineer", salary: 88000, status: "On Leave", joinDate: "2024-06-20" },
  { id: "E006", name: "Divya Krishnan", department: "Engineering", designation: "Tech Lead",       salary: 105000, status: "Active",  joinDate: "2024-07-01" },
];

const MOCK_LEAVES = [
  { id: "L001", employeeId: "E001", leaveType: "Casual",  status: "Pending",  startDate: "2026-07-08", endDate: "2026-07-09" },
  { id: "L002", employeeId: "E003", leaveType: "Medical", status: "Approved", startDate: "2026-07-10", endDate: "2026-07-11" },
  { id: "L003", employeeId: "E005", leaveType: "Earned",  status: "Approved", startDate: "2026-07-14", endDate: "2026-07-16" },
  { id: "L004", employeeId: "E002", leaveType: "Casual",  status: "Pending",  startDate: "2026-07-17", endDate: "2026-07-17" },
  { id: "L005", employeeId: "E006", leaveType: "Medical", status: "Pending",  startDate: "2026-07-21", endDate: "2026-07-22" },
];

const QUICK = [
  { label: "Approve Leave", icon: IconClipboardCheck, color: "violet", route: "/approvals" },
  { label: "Team Attendance", icon: IconUserCheck, color: "green", route: "/attendance" },
  { label: "Apply Leave", icon: IconLeaveAction, color: "orange", route: "/leave" },
  { label: "View My Team", icon: IconUsers, color: "blue", route: "/my-team" },
];

export const ManagerDashboard = ({ employees: empProp = [], leaves: leavesProp = [] }) => {
  const navigate = useNavigate();
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: attendData }   = useQuery({ queryKey: ["dashboard-attend"],   queryFn: getAttendanceSummary, select: (r) => r?.data ?? r });
  const { data: announceData } = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements, select: (r) => r?.data ?? r });

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const employees = empProp.length ? empProp : MOCK_EMPLOYEES;
  const leaves    = leavesProp.length ? leavesProp : MOCK_LEAVES;
  const teamTotal   = employees.length;
  const teamPresent = employees.filter((e) => e.status === "Present" || e.status === "Active").length;
  const teamOnLeave = employees.filter((e) => e.status === "Leave" || e.status === "On Leave").length;
  const rawSummary    = summaryData ?? MOCK_SUMMARY;
  const pendingLeaves = rawSummary?.pendingLeaves || leaves.filter((l) => l.status === "Pending").length;
  const attendPct = teamTotal > 0 ? Math.round((teamPresent / teamTotal) * 100) : 0;

  const rawAnnounce   = announceData ?? MOCK_ANNOUNCE;
  const announcements = rawAnnounce?.announcements || [];

  // Attendance area series
  const rawAttend    = attendData ?? MOCK_ATTEND;
  const attendDays   = rawAttend?.days || [];
  const attendSeries = attendDays.map((d) => ({ day: d.day, Present: d.present || 0, Absent: d.absent || 0, "On Leave": d.onLeave || d.leave || 0 }));
  const presentSpark = attendSeries.length ? attendSeries.map((d) => d.Present) : [teamTotal * 0.7, teamTotal * 0.85, teamTotal * 0.8, teamTotal * 0.9, teamPresent];
  const teamSpark = [teamTotal * 0.9, teamTotal * 0.93, teamTotal * 0.96, teamTotal];
  const leaveSpark = attendSeries.length ? attendSeries.map((d) => d["On Leave"]) : [2, 4, 3, 5, teamOnLeave];

  // Leave donut
  const leaveByType = leaves.reduce((acc, l) => { const t = l.leaveType || "Other"; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const leaveData = Object.entries(leaveByType).map(([name, value], i) => ({ name, value, color: PIE[i % PIE.length] }));
  const totalLeaves = leaveData.reduce((s, d) => s + d.value, 0);

  // Department bars
  const deptMap = {};
  employees.forEach((e) => { const d = e.department || "Other"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const deptBar = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Recent joiners
  const recentJoiners = [...employees].filter((e) => e.joinDate).sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 6);

  return (
    <Box>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <KpiCard icon={IconUsers}     label="Team Size"         value={teamTotal}    sub="all employees"             trend="5%" up color="blue"   spark={teamSpark} />
        <KpiCard icon={IconUserCheck} label="Present Today"     value={teamPresent}  sub={`${attendPct}% attendance`} trend={`${attendPct}%`} up color="green" spark={presentSpark} />
        <KpiCard icon={IconCalendarOff} label="On Leave"        value={teamOnLeave}  sub="members away"              trend="1%" up={false} color="orange" spark={leaveSpark} />
        <KpiCard icon={IconClipboardCheck} label="Pending Approvals" value={pendingLeaves} sub="to review"          trend="3%" up={false} color="red"    spark={leaveSpark} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Attendance Overview" sub="This week">
          {attendSeries.length === 0 ? <Center h={220}><Text c="dimmed" fz="sm">No attendance data</Text></Center> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="mPresent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} /></linearGradient>
                  <linearGradient id="mAbsent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} /></linearGradient>
                  <linearGradient id="mLeave" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Area type="monotone" dataKey="Present" stroke="#4f46e5" strokeWidth={2.5} fill="url(#mPresent)" />
                <Area type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} fill="url(#mAbsent)" />
                <Area type="monotone" dataKey="On Leave" stroke="#f59e0b" strokeWidth={2} fill="url(#mLeave)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
            {QUICK.map((a) => (
              <Group key={a.label} justify="space-between" wrap="nowrap" onClick={() => navigate(a.route)}
                style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--mantine-color-default-border)" }}>
                <Group gap="sm"><Box style={{ background: `var(--mantine-color-${a.color}-1)`, borderRadius: 8, padding: 6 }}><a.icon size={16} color={`var(--mantine-color-${a.color}-6)`} /></Box><Text fz="sm" fw={500}>{a.label}</Text></Group>
                <IconChevronRight size={15} color="var(--mantine-color-dimmed)" />
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="md">
        <PanelCard title="Department Wise Headcount" sub={`${teamTotal} employees`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptBar} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#6d28d9" radius={[0, 4, 4, 0]} barSize={14} />
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

        <PanelCard title="Announcements" action={<Text fz="xs" c="violet" fw={600} style={{ cursor: "pointer" }} onClick={() => navigate("/announcements")}>View All</Text>}>
          <Stack gap="sm">
            {announcements.length === 0 && <Text c="dimmed" fz="sm">No announcements</Text>}
            {announcements.slice(0, 5).map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${ANNOUNCE_COLORS[a.type] || "blue"}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                <Box style={{ flex: 1 }}><Text fz="sm" fw={600}>{a.title}</Text>{a.date && <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>}</Box>
              </Group>
            ))}
          </Stack>
        </PanelCard>
      </SimpleGrid>
    </Box>
  );
};
