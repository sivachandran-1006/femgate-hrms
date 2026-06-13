import { SimpleGrid, Box, Group, Text, Progress, Badge, Avatar, Divider, RingProgress, Stack } from "@mantine/core";
import { UserCheck, Calendar, Clock, Target, Briefcase, MapPin, Phone, Mail } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { UPCOMING_EVENTS, ANNOUNCEMENTS } from "../data";

const MOCK_ATTENDANCE = [
  { date: "2026-06-02", checkIn: "09:05 AM", checkOut: "06:10 PM", hours: "9h 05m", status: "Present" },
  { date: "2026-06-01", checkIn: "09:22 AM", checkOut: "06:00 PM", hours: "8h 38m", status: "Late"    },
  { date: "2026-05-31", checkIn: "08:58 AM", checkOut: "06:05 PM", hours: "9h 07m", status: "Present" },
  { date: "2026-05-30", checkIn: "09:10 AM", checkOut: "06:00 PM", hours: "8h 50m", status: "Present" },
  { date: "2026-05-29", checkIn: "—",        checkOut: "—",        hours: "—",      status: "Absent"  },
];

const MOCK_PAYSLIP = {
  month: "May 2026",
  gross: 72000,
  deductions: 8640,
  net: 63360,
  components: [
    { label: "Basic Salary",       amount: 36000 },
    { label: "HRA",                amount: 14400 },
    { label: "Transport",          amount: 1500  },
    { label: "Special Allowance",  amount: 20100 },
  ],
};

const MOCK_PERFORMANCE = {
  score: 80,
  period: "Q2 2026",
  goals: [
    { label: "Project Delivery",   pct: 90, color: "green"  },
    { label: "Code Quality",       pct: 85, color: "blue"   },
    { label: "Team Collaboration", pct: 75, color: "violet" },
    { label: "Documentation",      pct: 70, color: "yellow" },
  ],
  rating: "Good",
  ratingColor: "green",
};

const MOCK_PROFILE = {
  department: "IT",
  designation: "Senior Developer",
  employeeId: "MGT001",
  location: "Coimbatore",
  phone: "+91 99999 00001",
  email: "john.employee@mgatetech.com",
  joinDate: "Jan 2023",
};

const statusColor = (s) =>
  s === "Present" ? "green" : s === "Late" ? "yellow" : s === "Absent" ? "red" : "gray";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const EmployeeDashboard = ({ leaves, user }) => {
  const myLeaves       = leaves.filter((l) => l.employee === user?.name);
  const approvedLeaves = myLeaves.filter((l) => l.status === "Approved").length;
  const pendingLeaves  = myLeaves.filter((l) => l.status === "Pending").length;
  const usedDays       = myLeaves.filter((l) => l.status === "Approved").reduce((s, l) => s + (Number(l.days) || 0), 0);

  const leaveBal = [
    { label: "Annual Leave", total: 18, used: usedDays > 5 ? 5 : usedDays, color: "blue"   },
    { label: "Sick Leave",   total: 12, used: 2,                            color: "red"    },
    { label: "Casual Leave", total: 10, used: 1,                            color: "yellow" },
  ];

  const attendPct = 92;

  return (
    <>
      {/* ── Stat Cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<UserCheck />}  label="Attendance This Month" value={`${attendPct}%`}   sub="23 of 25 days present"   color="green"  />
        <AppStatCard icon={<Calendar />}   label="Approved Leaves"       value={approvedLeaves}    sub="This year"               color="blue"   />
        <AppStatCard icon={<Clock />}      label="Pending Requests"      value={pendingLeaves}     sub="Awaiting approval"       color="yellow" />
        <AppStatCard icon={<Target />}     label="Performance Score"     value={`${MOCK_PERFORMANCE.score}/100`} sub={MOCK_PERFORMANCE.period} color="violet" />
      </SimpleGrid>

      {/* ── Row 2: Profile summary + Attendance ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">

        {/* Profile Card */}
        <AppSection title="My Profile" sub={`${MOCK_PROFILE.designation} · ${MOCK_PROFILE.department}`}>
          <Group gap="md" mb="md">
            <Avatar size={56} radius="xl" color="blue">
              {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || "JE"}
            </Avatar>
            <Box>
              <Text fw={700} fz="md">{user?.name || "John Employee"}</Text>
              <Text fz="xs" c="dimmed">{MOCK_PROFILE.employeeId} · Joined {MOCK_PROFILE.joinDate}</Text>
              <Badge size="sm" color="blue" variant="light" mt={4}>{MOCK_PROFILE.designation}</Badge>
            </Box>
          </Group>
          <Divider mb="md" />
          <Stack gap={8}>
            {[
              { icon: <Briefcase size={14} />, label: MOCK_PROFILE.department },
              { icon: <MapPin     size={14} />, label: MOCK_PROFILE.location },
              { icon: <Phone      size={14} />, label: MOCK_PROFILE.phone },
              { icon: <Mail       size={14} />, label: MOCK_PROFILE.email },
            ].map((r, i) => (
              <Group key={i} gap="xs">
                <Box c="dimmed">{r.icon}</Box>
                <Text fz="sm" c="dimmed">{r.label}</Text>
              </Group>
            ))}
          </Stack>
        </AppSection>

        {/* Recent Attendance */}
        <AppSection title="Recent Attendance" sub="Last 5 working days" noPadding>
          <Box p="md" pb="xs">
            {MOCK_ATTENDANCE.map((r, i, arr) => (
              <Group
                key={r.date}
                justify="space-between"
                wrap="nowrap"
                py="xs"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}
              >
                <Box>
                  <Text fz="sm" fw={500}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</Text>
                  <Text fz="xs" c="dimmed">
                    {r.checkIn !== "—" ? `${r.checkIn} → ${r.checkOut}` : "No record"} {r.hours !== "—" ? `· ${r.hours}` : ""}
                  </Text>
                </Box>
                <Badge color={statusColor(r.status)} variant="light" size="sm">{r.status}</Badge>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 3: Leave Balance + Leave History ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="My Leave Balance" sub="Current year allocation">
          <Box style={{ display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
            {leaveBal.map((b) => {
              const remaining = b.total - b.used;
              const pct = Math.round((b.used / b.total) * 100);
              return (
                <Box key={b.label}>
                  <Group justify="space-between" mb={4}>
                    <Text fz="sm" fw={600}>{b.label}</Text>
                    <Text fz="xs" c="dimmed">{remaining}/{b.total} days left</Text>
                  </Group>
                  <Progress value={pct} color={b.color} size="md" radius="xl" />
                  <Text fz="xs" c={b.color} fw={600} mt={4}>{b.used} days used</Text>
                </Box>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="My Leave History" noPadding>
          <Box p="md" pb="xs">
            {myLeaves.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No leave requests yet</Text>
            ) : myLeaves.slice(0, 5).map((l, i, arr) => {
              const sc = l.status === "Approved" ? "green" : l.status === "Pending" ? "yellow" : "red";
              return (
                <Group key={l._id} justify="space-between" wrap="nowrap" py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Box>
                    <Text fz="sm" fw={500}>{l.leaveType}</Text>
                    <Text fz="xs" c="dimmed">{l.fromDate} · {l.days}d</Text>
                  </Box>
                  <Badge color={sc} variant="light" size="sm">{l.status}</Badge>
                </Group>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 4: Payslip Summary + Performance ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">

        {/* Latest Payslip */}
        <AppSection title="Latest Payslip" sub={MOCK_PAYSLIP.month}>
          <Group gap="xl" mb="md">
            <Box>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Gross</Text>
              <Text fz="lg" fw={700} c="blue">{fmt(MOCK_PAYSLIP.gross)}</Text>
            </Box>
            <Box>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Deductions</Text>
              <Text fz="lg" fw={700} c="red">-{fmt(MOCK_PAYSLIP.deductions)}</Text>
            </Box>
            <Box>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Net Pay</Text>
              <Text fz="lg" fw={700} c="green">{fmt(MOCK_PAYSLIP.net)}</Text>
            </Box>
          </Group>
          <Divider mb="md" />
          <Stack gap={6}>
            {MOCK_PAYSLIP.components.map((c) => (
              <Group key={c.label} justify="space-between">
                <Text fz="sm" c="dimmed">{c.label}</Text>
                <Text fz="sm" fw={500}>{fmt(c.amount)}</Text>
              </Group>
            ))}
          </Stack>
        </AppSection>

        {/* Performance */}
        <AppSection title="My Performance" sub={MOCK_PERFORMANCE.period}>
          <Group gap="xl" mb="md" align="center">
            <RingProgress
              size={90}
              thickness={8}
              roundCaps
              sections={[{ value: MOCK_PERFORMANCE.score, color: "violet" }]}
              label={
                <Text ta="center" fz="sm" fw={700}>{MOCK_PERFORMANCE.score}</Text>
              }
            />
            <Box>
              <Text fz="xs" c="dimmed" mb={4}>Overall Rating</Text>
              <Badge color={MOCK_PERFORMANCE.ratingColor} size="lg" variant="light">{MOCK_PERFORMANCE.rating}</Badge>
            </Box>
          </Group>
          <Stack gap={8}>
            {MOCK_PERFORMANCE.goals.map((g) => (
              <Box key={g.label}>
                <Group justify="space-between" mb={3}>
                  <Text fz="xs" fw={500}>{g.label}</Text>
                  <Text fz="xs" c="dimmed">{g.pct}%</Text>
                </Group>
                <Progress value={g.pct} color={g.color} size="sm" radius="xl" />
              </Box>
            ))}
          </Stack>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 5: Upcoming Events + Announcements ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
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

        <AppSection title="Company Announcements">
          <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ANNOUNCEMENTS.map((a, i, arr) => (
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", alignItems: "flex-start" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${a.color}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                <Box>
                  <Text fz="sm" fw={500}>{a.title}</Text>
                  <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>
                </Box>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>
    </>
  );
};
