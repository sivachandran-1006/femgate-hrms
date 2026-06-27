import { SimpleGrid, Box, Group, Text, Progress, Avatar, Badge, Loader, Center } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { IconUsers, IconUserCheck, IconUserMinus, IconClock, IconWallet } from "@tabler/icons-react";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney, SPARK_HEX } from "./DashboardKit";
import {
  getDashboardSummary,
  getRecentActivity,
  getAnnouncements,
  getUpcomingEvents,
  getAttendanceSummary,
  getPayrollSummary,
} from "../../../api/dashboardApi";

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;
const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };
const ramp = (v) => [v * 0.9, v * 0.93, v * 0.96, v].map(Math.round);

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
    { name: "Present", value: present, color: SPARK_HEX.green },
    { name: "Absent",  value: absent,  color: SPARK_HEX.red   },
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

  // sparks: use real series where available, else gentle synthetic ramps
  const presentSpark = attendDays.map((d) => d.present).filter((v) => v != null);
  const absentSpark  = attendDays.map((d) => d.absent).filter((v) => v != null);
  const payrollSpark = payrollMonths.map((m) => m.payroll).filter((v) => v != null);

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md" mb="md">
        <KpiCard icon={IconUsers}     label="Total Employees"   value={total}                  sub={`${deptCount} departments`}                  trend="+3"  up        color="blue"   spark={ramp(total)} />
        <KpiCard icon={IconUserCheck} label="Present Today"     value={present}                sub={`${attendPct}% attendance`}                 trend="+2%" up        color="green"  spark={presentSpark.length > 1 ? presentSpark : ramp(present)} />
        <KpiCard icon={IconUserMinus} label="Absent Today"      value={absent}                 sub="Not checked in"                              trend="-1"  up={false} color="orange" spark={absentSpark.length > 1 ? absentSpark : ramp(absent)} />
        <KpiCard icon={IconClock}     label="Pending Approvals" value={pendingLeaves}          sub="Awaiting HR review"                          trend="+2"  up={false} color="red"    spark={ramp(pendingLeaves)} />
        <KpiCard icon={IconWallet}    label="Monthly Payroll"   value={fmtMoney(totalSalary)}  sub={`Avg ${fmtMoney(avgSalary)}`}                trend="+4%" up        color="violet" spark={payrollSpark.length > 1 ? payrollSpark : ramp(totalSalary)} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <PanelCard title="Department Breakdown" sub="Employees per dept">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptDist} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--mantine-color-default-hover)" }} />
              <Bar dataKey="value" name="Employees" fill={SPARK_HEX.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Today's Attendance" sub={`${present} present of ${total}`}>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={36} paddingAngle={2}>
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
        </PanelCard>

        <PanelCard title="Today's Numbers" sub="Live snapshot">
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
        </PanelCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <PanelCard title="Weekly Attendance" sub="Present / Absent — this week">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={attendDays} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--mantine-color-default-hover)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill={SPARK_HEX.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill={SPARK_HEX.red}   radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Dept Distribution" sub={`${total} employees · ${deptCount} depts`}>
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
        </PanelCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <PanelCard title="Payroll Trend" sub="Monthly net payroll">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={payrollMonths}>
              <defs>
                <linearGradient id="adminPayrollFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SPARK_HEX.violet} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={SPARK_HEX.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tickFormatter={fmtINR} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="payroll" name="Payroll" stroke={SPARK_HEX.violet} strokeWidth={2.5} fill="url(#adminPayrollFill)" dot={{ fill: SPARK_HEX.violet, r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Recent Activity" sub="Latest HR events">
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
        </PanelCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <PanelCard title="Announcements" sub="Company-wide notices">
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
        </PanelCard>

        <PanelCard title="Upcoming Events" sub="Next 30 days">
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
        </PanelCard>
      </SimpleGrid>
    </>
  );
};
