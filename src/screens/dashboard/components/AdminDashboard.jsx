import { SimpleGrid, Box, Group, Text, Progress, Avatar, ActionIcon, Badge, Loader, Center, Table } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { IconUsers, IconUserCheck, IconUserMinus, IconClock, IconWallet } from "@tabler/icons-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { AppTable } from "../../../components/ui/AppTable";
import { getInitials } from "../../../utils/helpers";
import {
  getDashboardSummary,
  getRecentActivity,
  getAnnouncements,
  getUpcomingEvents,
  getAttendanceSummary,
  getPayrollSummary,
} from "../../../api/dashboardApi";

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
const ANNOUNCE_COLORS = { info: "blue", hr: "green", finance: "violet" };

export const AdminDashboard = ({ employees }) => {
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: activityData }  = useQuery({ queryKey: ["dashboard-activity"],  queryFn: getRecentActivity,    select: (r) => r?.data ?? r });
  const { data: announceData }  = useQuery({ queryKey: ["dashboard-announce"],  queryFn: getAnnouncements,     select: (r) => r?.data ?? r });
  const { data: eventsData }    = useQuery({ queryKey: ["dashboard-events"],    queryFn: getUpcomingEvents,    select: (r) => r?.data ?? r });
  const { data: attendData }    = useQuery({ queryKey: ["dashboard-attend"],    queryFn: getAttendanceSummary, select: (r) => r?.data ?? r });
  const { data: payrollData }   = useQuery({ queryKey: ["dashboard-payroll"],   queryFn: getPayrollSummary,    select: (r) => r?.data ?? r });

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const summary       = summaryData || {};
  const total         = summary.totalEmployees  || employees.length || 0;
  const pendingLeaves = summary.pendingLeaves   || 0;
  const totalSalary   = summary.totalSalary     || employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const avgSalary     = summary.avgSalary       || (total > 0 ? Math.round(totalSalary / total) : 0);
  const depts         = summary.departments     || [];
  const deptCount     = depts.length || new Set(employees.map((e) => e.department).filter(Boolean)).size;

  const attendDays    = attendData?.days || [];
  const todayAttend   = attendDays[attendDays.length - 1] || {};
  const present       = todayAttend.present || 0;
  const absent        = todayAttend.absent  || 0;
  const attendPct     = total > 0 ? Math.round((present / total) * 100) : 0;

  const attendancePie = [
    { name: "Present", value: present, color: "var(--mantine-color-green-5)" },
    { name: "Absent",  value: absent,  color: "var(--mantine-color-red-5)"   },
  ].filter((d) => d.value > 0);

  const payrollMonths = (payrollData?.months || []).map((m) => ({ month: m.label, payroll: m.net }));
  const activity      = activityData?.activity || [];
  const announcements = announceData?.announcements || [];
  const events        = eventsData?.events || [];

  const deptDist = depts.map((d, i) => ({
    name: d.name,
    value: d.count,
    color: ["blue", "violet", "green", "yellow", "cyan", "orange"][i % 6],
  }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md" mb="md">
        <AppStatCard icon={<IconUsers size={18}/>}     label="Total Employees"   value={total}                                                    sub={`${deptCount} departments`}                color="blue"   trend="+3"  up />
        <AppStatCard icon={<IconUserCheck size={18}/>} label="Present Today"     value={present}                                                  sub={`${attendPct}% attendance`}               color="green"  trend="+2%" up />
        <AppStatCard icon={<IconUserMinus size={18}/>} label="Absent Today"      value={absent}                                                   sub="Not checked in"                            color="yellow" trend="-1"  up={false} />
        <AppStatCard icon={<IconClock size={18}/>}     label="Pending Approvals" value={pendingLeaves}                                            sub="Awaiting HR review"                       color="red"    trend="+2"  up={false} />
        <AppStatCard icon={<IconWallet size={18}/>}    label="Monthly Payroll"   value={`₹${(totalSalary / 1000).toFixed(0)}k`}                   sub={`Avg ₹${avgSalary.toLocaleString("en-IN")}`} color="violet" trend="+4%" up />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Department Breakdown" sub="Employees per dept">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptDist} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Employees" fill="var(--mantine-color-blue-5)" radius={[3,3,0,0]} />
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
                <Group gap={4} wrap="nowrap"><Box w={8} h={8} style={{ borderRadius: "50%", background: d.color }} /><Text fz="xs" c="dimmed">{d.name}</Text></Group>
                <Text fz="sm" fw={700}>{d.value}</Text>
              </Box>
            ))}
          </Group>
        </AppSection>

        <AppSection title="Today's Numbers" noPadding>
          <Box p="md" pb="xs">
            {[
              { label: "Present",        value: present,      color: "green",  pct: attendPct },
              { label: "Absent",         value: absent,       color: "red",    pct: total > 0 ? Math.round(absent / total * 100) : 0 },
              { label: "Pending Leaves", value: pendingLeaves, color: "violet", pct: null },
              { label: "Departments",    value: deptCount,    color: "cyan",   pct: null },
            ].map(({ label, value, color, pct }, i, arr) => (
              <Box key={label} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" mb={pct !== null ? 4 : 0}>
                  <Text fz="sm" c="dimmed">{label}</Text>
                  <Text fz="sm" fw={700} c={color}>{value}{pct !== null ? ` (${pct}%)` : ""}</Text>
                </Group>
                {pct !== null && <Progress value={pct} color={color} size="sm" radius="xl" />}
              </Box>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
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

        <AppSection title="Dept Distribution" sub={`${total} employees · ${deptCount} depts`}>
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {deptDist.map((d) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <Box key={d.name}>
                  <Group justify="space-between" mb={4}>
                    <Text fz="sm" fw={500}>{d.name}</Text>
                    <Text fz="xs" c="dimmed">{d.value} ({pct}%)</Text>
                  </Group>
                  <Progress value={pct} color={d.color} size="sm" radius="xl" />
                </Box>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>

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

        <AppSection title="Recent Activity" sub="Latest HR events">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activity.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No recent activity</Text>
            ) : activity.slice(0, 5).map((a) => (
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Avatar radius="xl" color="blue" size="sm">{a.action.slice(0, 2).toUpperCase()}</Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={500} truncate>{a.action}</Text>
                  <Text fz="xs" c="dimmed">{new Date(a.time).toLocaleDateString("en-IN")}</Text>
                </Box>
                <Badge size="xs" color={a.status === "Approved" ? "green" : a.status === "Pending" ? "yellow" : "blue"} variant="light">{a.status}</Badge>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Announcements" sub="Company-wide notices">
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
