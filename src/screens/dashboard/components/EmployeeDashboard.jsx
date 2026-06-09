import { SimpleGrid, Box, Group, Text, Progress, Badge, Avatar, Divider, Stack, Loader, Center } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconUserCheck, IconCalendar, IconClock, IconBriefcase, IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { getMyAttendance, getMyPayslip, getLeaveBalance, getAnnouncements, getUpcomingEvents } from "../../../api/dashboardApi";
import { fetchLeaves } from "../../../api/leaveApi";

const statusColor = (s) =>
  s === "Present" ? "green" : s === "Late" ? "yellow" : s === "Absent" ? "red" : "gray";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const EmployeeDashboard = ({ user }) => {
  const { data: attendData, isLoading: loadAtt } = useQuery({ queryKey: ["my-attendance"], queryFn: getMyAttendance, select: (r) => r?.data ?? r });
  const { data: payslipData }  = useQuery({ queryKey: ["my-payslip"],    queryFn: getMyPayslip,    select: (r) => r?.data ?? r });
  const { data: balanceData }  = useQuery({ queryKey: ["leave-balance"], queryFn: getLeaveBalance,  select: (r) => r?.data ?? r });
  const { data: leavesData }   = useQuery({ queryKey: ["leaves"],        queryFn: () => fetchLeaves(), select: (r) => r?.data ?? r ?? [] });
  const { data: announceData } = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements, select: (r) => r?.data ?? r });
  const { data: eventsData }   = useQuery({ queryKey: ["dashboard-events"],   queryFn: getUpcomingEvents, select: (r) => r?.data ?? r });

  if (loadAtt) return <Center py="xl"><Loader /></Center>;

  const records      = attendData?.records || [];
  const payslip      = payslipData;
  const balance      = balanceData?.balance || [];
  const leaves       = Array.isArray(leavesData) ? leavesData : [];
  const announcements = announceData?.announcements || [];
  const events       = eventsData?.events || [];

  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;
  const pendingLeaves  = leaves.filter((l) => l.status === "Pending").length;

  const presentDays = records.filter((r) => r.status === "Present" || r.status === "Late").length;
  const attendPct   = records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0;

  const ANNOUNCE_COLORS = { info: "blue", hr: "green", finance: "violet" };

  return (
    <>
      {/* ── Stat Cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconUserCheck size={18}/>} label="Attendance This Week" value={`${attendPct}%`}     sub={`${presentDays} of ${records.length} days`} color="green"  />
        <AppStatCard icon={<IconCalendar size={18}/>}  label="Approved Leaves"      value={approvedLeaves}      sub="This year"                                   color="blue"   />
        <AppStatCard icon={<IconClock size={18}/>}     label="Pending Requests"     value={pendingLeaves}       sub="Awaiting approval"                           color="yellow" />
        <AppStatCard icon={<IconBriefcase size={18}/>} label="Net Salary"           value={payslip ? fmt(payslip.net) : "—"} sub={payslip?.month || "Latest payslip"} color="violet" />
      </SimpleGrid>

      {/* ── Row 2: Profile + Attendance ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="My Profile" sub={`${user?.role || "Employee"}`}>
          <Group gap="md" mb="md">
            <Avatar size={56} radius="xl" color="blue">
              {user?.name?.slice(0, 2).toUpperCase() || "ME"}
            </Avatar>
            <Box>
              <Text fw={700} fz="md">{user?.name || "Employee"}</Text>
              <Text fz="xs" c="dimmed">{user?.email}</Text>
              <Badge size="sm" color="blue" variant="light" mt={4}>{user?.role || "Employee"}</Badge>
            </Box>
          </Group>
          <Divider mb="md" />
          <Stack gap={8}>
            {[
              { icon: <IconBriefcase size={14} />, label: user?.department || "—" },
              { icon: <IconMapPin    size={14} />, label: "Chennai" },
              { icon: <IconPhone     size={14} />, label: user?.phone || "—" },
              { icon: <IconMail      size={14} />, label: user?.email || "—" },
            ].map((r, i) => (
              <Group key={i} gap="xs">
                <Box c="dimmed">{r.icon}</Box>
                <Text fz="sm" c="dimmed">{r.label}</Text>
              </Group>
            ))}
          </Stack>
        </AppSection>

        <AppSection title="Recent Attendance" sub="Last 7 working days" noPadding>
          <Box p="md" pb="xs">
            {records.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No attendance records</Text>
            ) : records.map((r, i, arr) => (
              <Group key={i} justify="space-between" wrap="nowrap" py="xs"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box>
                  <Text fz="sm" fw={500}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</Text>
                  <Text fz="xs" c="dimmed">
                    {r.checkIn ? `${new Date(r.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} → ${r.checkOut ? new Date(r.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}` : "No record"}
                    {r.hours ? ` · ${r.hours}h` : ""}
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
            {balance.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No leave balance data</Text>
            ) : balance.map((b) => {
              const remaining = b.remaining ?? (b.quota - b.used);
              const pct = b.quota > 0 ? Math.round((b.used / b.quota) * 100) : 0;
              const colorMap = { Annual: "blue", Sick: "red", Casual: "yellow", Earned: "green" };
              const color = colorMap[b.leaveType] || "blue";
              return (
                <Box key={b.leaveType}>
                  <Group justify="space-between" mb={4}>
                    <Text fz="sm" fw={600}>{b.leaveType}</Text>
                    <Text fz="xs" c="dimmed">{remaining}/{b.quota} days left</Text>
                  </Group>
                  <Progress value={pct} color={color} size="md" radius="xl" />
                  <Text fz="xs" c={color} fw={600} mt={4}>{b.used} days used</Text>
                </Box>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="My Leave History" noPadding>
          <Box p="md" pb="xs">
            {leaves.length === 0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No leave requests yet</Text>
            ) : leaves.slice(0, 5).map((l, i, arr) => {
              const sc = l.status === "Approved" ? "green" : l.status === "Pending" ? "yellow" : "red";
              return (
                <Group key={l.id || i} justify="space-between" wrap="nowrap" py="xs"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Box>
                    <Text fz="sm" fw={500}>{l.leaveType}</Text>
                    <Text fz="xs" c="dimmed">{l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-IN") : "—"} · {l.days}d</Text>
                  </Box>
                  <Badge color={sc} variant="light" size="sm">{l.status}</Badge>
                </Group>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>

      {/* ── Row 4: Payslip + Upcoming + Announcements ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {payslip ? (
          <AppSection title="Latest Payslip" sub={payslip.month}>
            <Group gap="xl" mb="md">
              <Box>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Gross</Text>
                <Text fz="lg" fw={700} c="blue">{fmt(payslip.gross)}</Text>
              </Box>
              <Box>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Deductions</Text>
                <Text fz="lg" fw={700} c="red">-{fmt(payslip.deductions)}</Text>
              </Box>
              <Box>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Net Pay</Text>
                <Text fz="lg" fw={700} c="green">{fmt(payslip.net)}</Text>
              </Box>
            </Group>
            <Badge color={payslip.status === "Paid" ? "green" : "yellow"} variant="light">{payslip.status}</Badge>
          </AppSection>
        ) : (
          <AppSection title="Latest Payslip" sub="No payslip data">
            <Text ta="center" c="dimmed" fz="sm" py="md">No payslip available</Text>
          </AppSection>
        )}

        <Box style={{ display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
          <AppSection title="Announcements" sub="Company-wide notices">
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map((a, i, arr) => (
                <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", alignItems: "flex-start" }}>
                  <Box w={3} style={{ background: `var(--mantine-color-${ANNOUNCE_COLORS[a.type] || "blue"}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                  <Box>
                    <Text fz="sm" fw={500}>{a.title}</Text>
                    <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>
                  </Box>
                </Group>
              ))}
            </Box>
          </AppSection>

          <AppSection title="Upcoming Events" sub="Next 30 days">
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {events.length === 0 ? (
                <Text ta="center" c="dimmed" fz="sm">No upcoming events</Text>
              ) : events.slice(0, 3).map((e, i, arr) => {
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
        </Box>
      </SimpleGrid>
    </>
  );
};
