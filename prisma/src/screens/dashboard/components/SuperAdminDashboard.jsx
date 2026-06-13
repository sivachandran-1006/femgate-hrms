import { SimpleGrid, Box, Group, Text, Progress, Avatar, Badge, ThemeIcon } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Building, UserCheck, Clock, Wallet, Briefcase, Ticket } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { getInitials } from "../../../utils/helpers";
import { MONTHLY_HEADCOUNT, ATTENDANCE_WEEK, PAYROLL_MONTHS, ANNOUNCEMENTS, UPCOMING_EVENTS, RECENT_ACTIVITY, ACTIVITY_ICON } from "../data";

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

const SYSTEM_HEALTH = [
  { label: "API Uptime",    value: 99.8, color: "green"  },
  { label: "DB Health",     value: 97.2, color: "blue"   },
  { label: "Storage Used",  value: 61,   color: "yellow" },
  { label: "License Usage", value: 43,   color: "violet" },
];

const MULTI_COMPANY = [
  { name: "MGate Systems",     employees: 13, plan: "Enterprise", status: "Active"   },
  { name: "Vertex Solutions",   employees: 42, plan: "Pro",        status: "Active"   },
  { name: "SynEx Systems",  employees: 8,  plan: "Starter",    status: "Trial"    },
  { name: "Vela Partners",  employees: 19, plan: "Pro",        status: "Active"   },
];

const AUDIT_ALERTS = [
  { msg: "Failed login attempt — finance@mgatesystems.com", time: "5m ago",  color: "red"    },
  { msg: "Role permissions updated by Admin",         time: "1h ago",  color: "orange" },
  { msg: "Payroll approved & published",              time: "3h ago",  color: "green"  },
  { msg: "New integration added: Slack",              time: "1d ago",  color: "blue"   },
];

const PENDING_APPROVALS = [
  { item: "May 2026 Payroll",          type: "Payroll",   status: "Pending Approval" },
  { item: "Leave — Arjun Kumar",       type: "Leave",     status: "Pending"          },
  { item: "IT Asset Request — Mani",   type: "Asset",     status: "Pending"          },
  { item: "New hire — Kavitha R.",     type: "Hiring",    status: "Offer Pending"    },
];

export const SuperAdminDashboard = ({ employees, leaves }) => {
  const total         = employees.length;
  const present       = employees.filter((e) => e.status === "Present").length;
  const onLeave       = employees.filter((e) => e.status === "Leave").length;
  const attendPct     = total > 0 ? Math.round((present / total) * 100) : 0;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const totalPayroll  = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const deptCount     = new Set(employees.map((e) => e.department).filter(Boolean)).size;
  const totalCompanies = MULTI_COMPANY.length;
  const totalBranches  = 7;

  const attendancePie = [
    { name: "Present", value: present,           color: "var(--mantine-color-green-5)"  },
    { name: "Absent",  value: Math.max(0, total - present - onLeave), color: "var(--mantine-color-red-5)"    },
    { name: "Leave",   value: onLeave,            color: "var(--mantine-color-yellow-5)" },
  ].filter((d) => d.value > 0);

  return (
    <>
      {/* ── Row 1: System-scope stat cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 8 }} spacing="md" mb="md">
        <AppStatCard icon={<Building/>}    label="Companies"        value={totalCompanies} sub="All tenants"               color="cyan"   trend="+1"  up />
        <AppStatCard icon={<Building/>}    label="Branches"         value={totalBranches}  sub="Across all companies"      color="teal"   trend="+2"  up />
        <AppStatCard icon={<Users/>}       label="Total Employees"  value={total}          sub={`${deptCount} departments`} color="blue"  trend="+3"  up />
        <AppStatCard icon={<UserCheck/>}   label="Present Today"    value={present}        sub={`${attendPct}% rate`}       color="green" trend="+2%" up />
        <AppStatCard icon={<Clock/>}       label="Pending Apprvls"  value={PENDING_APPROVALS.length} sub="Awaiting action" color="red"   trend="+1"  up={false} />
        <AppStatCard icon={<Wallet/>}      label="Payroll Cost"     value={`₹${(totalPayroll/1000).toFixed(0)}k`} sub="Monthly" color="violet" trend="+4%" up />
        <AppStatCard icon={<Briefcase/>}   label="Open Positions"   value={4}              sub="Active JDs"                color="indigo" trend="+2"  up />
        <AppStatCard icon={<Ticket/>}      label="Open Tickets"     value={7}              sub="Helpdesk queue"            color="orange" trend="-3"  up />
      </SimpleGrid>

      {/* ── Row 2: Growth + Attendance + System Health ── */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Employee Growth" sub="Headcount trend — 2026">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_HEADCOUNT}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="employees" name="Employees" stroke="var(--mantine-color-blue-6)"  fill="var(--mantine-color-blue-1)"  strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="joiners"   name="Joiners"   stroke="var(--mantine-color-green-6)" fill="none" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </AreaChart>
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

        <AppSection title="System Health" sub="Live infrastructure metrics" noPadding>
          <Box p="md" pb="xs">
            {SYSTEM_HEALTH.map(({ label, value, color }, i, arr) => (
              <Box key={label} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" mb={4}>
                  <Text fz="sm" c="dimmed">{label}</Text>
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
        <AppSection title="Payroll Trend" sub="Monthly spend across all companies — 2026">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke="var(--mantine-color-violet-6)" strokeWidth={2.5} dot={{ fill: "var(--mantine-color-violet-6)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Weekly Attendance" sub="Present / Absent / Leave — this week">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={ATTENDANCE_WEEK} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="var(--mantine-color-green-5)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill="var(--mantine-color-red-5)"   radius={[3, 3, 0, 0]} />
              <Bar dataKey="leave"   name="Leave"   fill="var(--mantine-color-yellow-5)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 4: Multi-Company + Audit Alerts + Pending Approvals ── */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Multi-Company Overview" sub="All registered tenants" noPadding>
          <Box p="md" pb="xs">
            {MULTI_COMPANY.map(({ name, employees: emp, plan, status }, i, arr) => (
              <Group key={name} wrap="nowrap" py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Avatar radius="xl" color="cyan" size="sm">{name.slice(0, 2).toUpperCase()}</Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={600} truncate>{name}</Text>
                  <Text fz="xs" c="dimmed">{emp} employees · {plan}</Text>
                </Box>
                <Badge size="xs" color={status === "Active" ? "green" : "orange"} variant="light">{status}</Badge>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Audit Alerts" sub="Recent security & system events" noPadding>
          <Box p="md" pb="xs">
            {AUDIT_ALERTS.map(({ msg, time, color }, i, arr) => (
              <Box key={i} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group gap={8} wrap="nowrap" align="flex-start">
                  <Box w={8} h={8} mt={4} style={{ borderRadius: "50%", background: `var(--mantine-color-${color}-5)`, flexShrink: 0 }} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="xs" fw={500} style={{ lineHeight: 1.4 }}>{msg}</Text>
                    <Text fz={10} c="dimmed" mt={2}>{time}</Text>
                  </Box>
                </Group>
              </Box>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Pending Approvals" sub="Actions required by you" noPadding>
          <Box p="md" pb="xs">
            {PENDING_APPROVALS.map(({ item, type, status }, i, arr) => (
              <Box key={i} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" wrap="nowrap">
                  <Box style={{ minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate>{item}</Text>
                    <Text fz="xs" c="dimmed">{type}</Text>
                  </Box>
                  <Badge size="xs" color="orange" variant="light">{status}</Badge>
                </Group>
              </Box>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 5: Activity + Announcements + Upcoming ── */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <AppSection title="Recent Activity" sub="Latest events across all orgs">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RECENT_ACTIVITY.map((a) => {
              const type = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.attend;
              return (
                <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Avatar radius="xl" color="blue" size="sm">{getInitials(a.name)}</Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate>{a.name}</Text>
                    <Text fz="xs" c="dimmed">{a.action}</Text>
                  </Box>
                  <Box ta="right">
                    <ThemeIcon variant="light" color={type.color} size="sm" radius="xl">{type.icon}</ThemeIcon>
                    <Text fz={10} c="dimmed" mt={2}>{a.time}</Text>
                  </Box>
                </Group>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="Announcements" sub="System & company-wide notices">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ANNOUNCEMENTS.map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", alignItems: "flex-start" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${a.color}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text fz="sm" fw={600}>{a.title}</Text>
                    <Badge color={a.color} variant="light" size="xs">{a.tag}</Badge>
                  </Group>
                  <Text fz="xs" c="dimmed" mt={4}>{a.date}</Text>
                </Box>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Upcoming Events" sub="Next 30 days">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {UPCOMING_EVENTS.map((e, i, arr) => (
              <Group key={i} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box w={40} h={40} style={{ background: `var(--mantine-color-${e.color}-0)`, borderRadius: "var(--mantine-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Text fz={9} fw={700} c={e.color} tt="uppercase">{e.date.split(" ")[0]}</Text>
                  <Text fz="sm" fw={700} c={e.color} lh={1}>{e.date.split(" ")[1]}</Text>
                </Box>
                <Text fz="sm" fw={500}>{e.label}</Text>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>
    </>
  );
};
