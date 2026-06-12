import { SimpleGrid, Box, Group, Text, Progress, Avatar, Badge, Loader, Center } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { IconBuilding, IconUsers, IconUserCheck, IconClock, IconWallet, IconBriefcase, IconTicket } from "@tabler/icons-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import {
  getDashboardSummary,
  getRecentActivity,
  getAnnouncements,
  getUpcomingEvents,
  getAttendanceSummary,
  getPayrollSummary,
  getSystemHealth,
} from "../../../api/dashboardApi";
import { getOnboarding } from "../../../services/onboardingService";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box p="sm" style={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
      <Text fw={600} fz="sm" mb={4}>{label}</Text>
      {payload.map((p) => (
        <Text key={p.dataKey} fz="sm" c={p.color}>{p.name}: <Text span fw={700}>{p.value}</Text></Text>
      ))}
    </Box>
  );
};

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;

const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };

export const SuperAdminDashboard = () => {
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: activityData }  = useQuery({ queryKey: ["dashboard-activity"],  queryFn: getRecentActivity,    select: (r) => r?.data ?? r });
  const { data: announceData }  = useQuery({ queryKey: ["dashboard-announce"],  queryFn: getAnnouncements,     select: (r) => r?.data ?? r });
  const { data: eventsData }    = useQuery({ queryKey: ["dashboard-events"],    queryFn: getUpcomingEvents,    select: (r) => r?.data ?? r });
  const { data: attendData }    = useQuery({ queryKey: ["dashboard-attend"],    queryFn: getAttendanceSummary, select: (r) => r?.data ?? r });
  const { data: payrollData }   = useQuery({ queryKey: ["dashboard-payroll"],   queryFn: getPayrollSummary,    select: (r) => r?.data ?? r });
  const { data: healthData }    = useQuery({ queryKey: ["dashboard-health"],    queryFn: getSystemHealth,      select: (r) => r?.data ?? r, refetchInterval: 30000 });
  const { data: onboardData = [] } = useQuery({ queryKey: ["onboarding"],       queryFn: getOnboarding });

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const summary        = summaryData || {};
  const total          = summary.totalEmployees   || 0;
  const active         = summary.activeEmployees  || 0;
  const pendingLeaves  = summary.pendingLeaves    || 0;
  const totalCompanies = summary.totalCompanies   || 1;
  const totalSalary    = summary.totalSalary      || 0;
  const depts          = summary.departments      || [];
  const deptCount      = depts.length;

  const attendDays     = attendData?.days || [];
  const todayAttend    = attendDays[attendDays.length - 1] || {};
  const present        = todayAttend.present || 0;
  const absent         = todayAttend.absent  || 0;

  const attendancePie  = [
    { name: "Present", value: present, color: "var(--mantine-color-green-5)" },
    { name: "Absent",  value: absent,  color: "var(--mantine-color-red-5)"   },
  ].filter((d) => d.value > 0);

  const payrollMonths  = (payrollData?.months || []).map((m) => ({ month: m.label, payroll: m.net }));
  const activity       = activityData?.activity      || [];
  const announcements  = announceData?.announcements || [];
  const events         = eventsData?.events          || [];

  const activeOnboardings = onboardData.filter((o) => o.status === "Active").length;
  const upcomingJoiners   = onboardData.filter((o) => o.status === "Upcoming").length;

  const systemHealth = healthData ? [
    { label: "API Uptime",    sub: healthData.apiUptime?.label, value: healthData.apiUptime?.value ?? 0, color: "green"  },
    { label: "DB Health",     sub: healthData.dbHealth?.label,  value: healthData.dbHealth?.value  ?? 0, color: "blue"   },
    { label: "Storage Used",  sub: healthData.storage?.label,   value: healthData.storage?.value   ?? 0, color: "yellow" },
    { label: "License Usage", sub: healthData.license?.label,   value: healthData.license?.value   ?? 0, color: "violet" },
  ] : [];

  return (
    <>
      {/* ── Row 1: System-scope stat cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 8 }} spacing="md" mb="md">
        <AppStatCard icon={<IconBuilding size={18}/>}  label="Companies"       value={totalCompanies}                       sub="All tenants"                  color="cyan"   />
        <AppStatCard icon={<IconBuilding size={18}/>}  label="Onboardings"     value={activeOnboardings}                    sub={`${upcomingJoiners} upcoming`} color="teal"  />
        <AppStatCard icon={<IconUsers size={18}/>}     label="Total Employees" value={total}                                sub={`${deptCount} departments`}    color="blue"  />
        <AppStatCard icon={<IconUserCheck size={18}/>} label="Present Today"   value={present}                              sub={`of ${total} active`}          color="green" />
        <AppStatCard icon={<IconClock size={18}/>}     label="Pending Leaves"  value={pendingLeaves}                        sub="Awaiting action"               color="red"   />
        <AppStatCard icon={<IconWallet size={18}/>}    label="Payroll Cost"    value={`₹${(totalSalary/1000).toFixed(0)}k`} sub="Monthly"                       color="violet"/>
        <AppStatCard icon={<IconBriefcase size={18}/>} label="Departments"     value={deptCount}                            sub="Active units"                  color="indigo"/>
        <AppStatCard icon={<IconTicket size={18}/>}    label="Active Staff"    value={active}                               sub="On duty"                       color="orange"/>
      </SimpleGrid>

      {/* ── Row 2: Growth + Attendance + System Health ── */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Department Breakdown" sub="Headcount by department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={depts} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Employees" fill="var(--mantine-color-blue-5)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Today's Attendance" sub={`${present} present of ${total}`}>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={2}>
                {attendancePie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <Group grow mt="sm" gap={4}>
            {attendancePie.map((d) => (
              <Box key={d.name}>
                <Group gap={4} wrap="nowrap">
                  <Box w={8} h={8} style={{ borderRadius: "50%", background: d.color }} />
                  <Text fz="xs" c="dimmed">{d.name}</Text>
                </Group>
                <Text fz="sm" fw={700}>{d.value}</Text>
              </Box>
            ))}
          </Group>
        </AppSection>

        <AppSection title="System Health" sub="Live infrastructure metrics — refreshes every 30s" noPadding>
          <Box p="md" pb="xs">
            {systemHealth.length === 0 && (
              <Text ta="center" c="dimmed" fz="sm" py="md">Loading metrics...</Text>
            )}
            {systemHealth.map(({ label, sub, value, color }, i, arr) => (
              <Box key={label} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" mb={4}>
                  <Box>
                    <Text fz="sm" c="dimmed">{label}</Text>
                    {sub && <Text fz="xs" c="dimmed" style={{ opacity: 0.7 }}>{sub}</Text>}
                  </Box>
                  <Text fz="sm" fw={700} c={color}>{value}%</Text>
                </Group>
                <Progress value={value} color={color} size="sm" radius="xl" />
              </Box>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 3: Payroll Trend + Weekly Attendance ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="Payroll Trend" sub="Monthly net payroll">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={payrollMonths}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke="var(--mantine-color-violet-6)" strokeWidth={2.5} dot={{ fill: "var(--mantine-color-violet-6)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Weekly Attendance" sub="Present / Absent — this week">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={attendDays} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="var(--mantine-color-green-5)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill="var(--mantine-color-red-5)"   radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 4: Activity + Announcements + Upcoming ── */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <AppSection title="Recent Activity" sub="Latest events across the org">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activity.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No recent activity</Text>
            ) : activity.map((a) => (
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Avatar radius="xl" color="blue" size="sm">{a.action.slice(0,2).toUpperCase()}</Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={500} truncate>{a.action}</Text>
                  <Text fz="xs" c="dimmed">{new Date(a.time).toLocaleDateString("en-IN")}</Text>
                </Box>
                <Badge size="xs" color={a.status === "Approved" ? "green" : a.status === "Pending" ? "yellow" : "blue"} variant="light">{a.status}</Badge>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Announcements" sub="System & company-wide notices">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", alignItems: "flex-start" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${ANNOUNCE_COLORS[a.type] || "blue"}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text fz="sm" fw={600}>{a.title}</Text>
                    <Badge color={ANNOUNCE_COLORS[a.type] || "blue"} variant="light" size="xs">{a.type}</Badge>
                  </Group>
                  <Text fz="xs" c="dimmed" mt={4}>{a.date}</Text>
                </Box>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Upcoming Events" sub="Next 30 days">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No upcoming events</Text>
            ) : events.map((e, i, arr) => {
              const d = new Date(e.date);
              const mon = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
              const day = d.getDate();
              return (
                <Group key={e.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Box w={40} h={40} style={{ background: "var(--mantine-color-blue-0)", borderRadius: "var(--mantine-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Text fz={9} fw={700} c="blue" tt="uppercase">{mon}</Text>
                    <Text fz="sm" fw={700} c="blue" lh={1}>{day}</Text>
                  </Box>
                  <Text fz="sm" fw={500}>{e.title}</Text>
                </Group>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>
    </>
  );
};
