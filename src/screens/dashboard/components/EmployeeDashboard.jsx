import { SimpleGrid, Box, Group, Text, Progress, Badge, Avatar, Loader, Center, Paper, RingProgress, Stack, UnstyledButton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  IconUserCheck, IconClock,
  IconCalendarOff, IconDownload, IconLifebuoy,
  IconArrowRight, IconWallet, IconAlertCircle,
  IconChevronRight, IconCircleCheck,
} from "@tabler/icons-react";
import { getMyAttendance, getMyPayslip, getLeaveBalance, getAnnouncements, getUpcomingEvents } from "../../../api/dashboardApi";
import { fetchLeaves } from "../../../api/leaveApi";
import { useFetchAllEmployees } from "../../../queries/useEmployees";
import { KpiCard, PanelCard } from "./DashboardKit";

const statusColor  = (s) => s === "Present" ? "#22c55e" : s === "Late" ? "#f59e0b" : s === "Absent" ? "#ef4444" : "#94a3b8";
const statusBg     = (s) => s === "Present" ? "#f0fdf4" : s === "Late" ? "#fffbeb" : s === "Absent" ? "#fef2f2" : "#f8fafc";
const statusText   = (s) => s === "Present" ? "#16a34a" : s === "Late" ? "#d97706" : s === "Absent" ? "#dc2626" : "#64748b";
const fmt          = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const ramp         = (v) => [v * 0.9, v * 0.93, v * 0.96, v].map(Math.round);

// ── Quick Action Pill ─────────────────────────────────────────────────────────
const QA = ({ icon: Icon, label, to, navigate }) => (
  <UnstyledButton
    onClick={() => navigate(to)}
    style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "14px 18px", borderRadius: 16,
      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
      cursor: "pointer", transition: "all 0.15s", backdropFilter: "blur(4px)",
      minWidth: 80,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
  >
    <Icon size={22} color="#fff" stroke={1.8} />
    <Text fz="xs" fw={600} c="white" ta="center" style={{ lineHeight: 1.2, whiteSpace: "nowrap" }}>{label}</Text>
  </UnstyledButton>
);

// ── Section "View all" action ──────────────────────────────────────────────────
const ViewAll = ({ navigate, to }) => (
  <UnstyledButton onClick={() => navigate(to)}>
    <Group gap={4}>
      <Text fz="xs" c="blue" fw={600}>View all</Text>
      <IconChevronRight size={13} color="#3b82f6" stroke={2.5} />
    </Group>
  </UnstyledButton>
);

export const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();

  const { data: attendData, isLoading } = useQuery({ queryKey: ["my-attendance"],      queryFn: getMyAttendance,   select: (r) => r?.data ?? r });
  const { data: payslipData }           = useQuery({ queryKey: ["my-payslip"],          queryFn: getMyPayslip,      select: (r) => r?.data ?? r });
  const { data: balanceData }           = useQuery({ queryKey: ["leave-balance"],       queryFn: getLeaveBalance,   select: (r) => r?.data ?? r });
  const { data: leavesData }            = useQuery({ queryKey: ["leaves"],              queryFn: () => fetchLeaves(), select: (r) => r?.data ?? r ?? [] });
  const { data: announceData }          = useQuery({ queryKey: ["dashboard-announce"],  queryFn: getAnnouncements,  select: (r) => r?.data ?? r });
  const { data: eventsData }            = useQuery({ queryKey: ["dashboard-events"],    queryFn: getUpcomingEvents, select: (r) => r?.data ?? r });
  const { data: allEmployees = [] }     = useFetchAllEmployees();

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  const records       = attendData?.records || [];
  const payslip       = payslipData;
  const balance       = Array.isArray(balanceData) ? balanceData : balanceData?.balance || [];
  const leaves        = Array.isArray(leavesData) ? leavesData : [];
  const announcements = announceData?.announcements || [];
  const events        = eventsData?.events || [];

  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;
  const pendingLeaves  = leaves.filter((l) => l.status === "Pending").length;
  const presentDays    = records.filter((r) => r.status === "Present" || r.status === "Late").length;
  const attendPct      = records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0;

  const today       = new Date().toDateString();
  const todayRec    = records.find((r) => new Date(r.date).toDateString() === today);
  const todayStatus = todayRec?.status || "Not Marked";
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const thisMonth    = new Date().getMonth();
  const birthdays    = allEmployees.filter((e) => e.dob    && new Date(e.dob).getMonth()     === thisMonth);
  const anniversaries= allEmployees.filter((e) => {
    if (!e.joinDate) return false;
    const j = new Date(e.joinDate);
    return j.getMonth() === thisMonth && (new Date().getFullYear() - j.getFullYear()) > 0;
  });

  const PRIORITY_GRAD = {
    High:   "linear-gradient(135deg,#ef4444,#f97316)",
    Medium: "linear-gradient(135deg,#f59e0b,#eab308)",
    Low:    "linear-gradient(135deg,#3b82f6,#6366f1)",
  };

  return (
    <Box>
      {/* ════════════════════════════════════════════════════════════
          WELCOME BANNER
      ════════════════════════════════════════════════════════════ */}
      <Paper radius="2xl" mb="xl" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 75%, #2563eb 100%)",
        border: "none", overflow: "hidden", position: "relative",
      }}>
        {/* decorative circles — no Mantine prop equivalent for absolute positioned decoratives */}
        <Box style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <Box style={{ position: "absolute", bottom: -60, right: 80, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <Box p="xl">
          <Group justify="space-between" wrap="wrap" gap="xl" align="flex-start">
            {/* LEFT: avatar + info */}
            <Group gap="lg" wrap="nowrap" align="flex-start">
              <Box style={{ position: "relative" }}>
                <Avatar size={72} radius="xl" color="blue"
                  style={{ border: "3px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", fontSize: 26, fontWeight: 800, color: "#fff" }}>
                  {user?.name?.slice(0, 2).toUpperCase() || "ME"}
                </Avatar>
                {/* online indicator dot — absolute positioned, no Mantine prop equivalent */}
                <Box style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 14, height: 14, borderRadius: "50%",
                  background: todayStatus === "Present" || todayStatus === "Late" ? "#4ade80" : "#fbbf24",
                  border: "2px solid rgba(15,23,42,0.8)",
                }} />
              </Box>

              <Stack gap={0}>
                <Text fz="xs" fw={600} c="rgba(255,255,255,0.55)" tt="uppercase" mb={4} style={{ letterSpacing: "0.08em" }}>{greeting}</Text>
                <Text fz="1.5rem" fw={800} c="white" lh={1.15} mb={8}>
                  {user?.name?.split(" ")[0] || "Employee"} 👋
                </Text>
                <Group gap={8} wrap="wrap" mb={10}>
                  <Badge size="sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", fontWeight: 700 }}>
                    {user?.employeeId || "—"}
                  </Badge>
                  {user?.department && (
                    <Badge size="sm" variant="dot" color="cyan"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {user.department}
                    </Badge>
                  )}
                  {(user?.designation || user?.role) && (
                    <Badge size="sm" variant="dot" color="violet"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {user?.designation || user?.role}
                    </Badge>
                  )}
                </Group>

                {/* Today status pill — inline-flex pill with rgba bg, no Mantine prop equivalent */}
                <Box style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 14px", borderRadius: 20,
                  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                }}>
                  <Box style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(todayStatus), flexShrink: 0 }} />
                  <Text fz="xs" c="rgba(255,255,255,0.9)" fw={600}>
                    Today: {todayStatus}
                    {todayRec?.checkIn ? ` · In ${new Date(todayRec.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    {todayRec?.checkOut ? ` → Out ${new Date(todayRec.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                  </Text>
                </Box>
              </Stack>
            </Group>

            {/* RIGHT: quick actions */}
            <Stack gap={0}>
              <Text fz="xs" fw={600} c="rgba(255,255,255,0.5)" tt="uppercase" mb={10} style={{ letterSpacing: "0.08em" }}>Quick Actions</Text>
              <Group gap={8} wrap="wrap">
                <QA icon={IconCalendarOff} label="Apply Leave"   to="/leave"        navigate={navigate} />
                <QA icon={IconUserCheck}   label="Attendance"    to="/attendance"   navigate={navigate} />
                <QA icon={IconDownload}    label="My Payslips"   to="/my-payslips"  navigate={navigate} />
                <QA icon={IconLifebuoy}    label="Create Ticket" to="/helpdesk"     navigate={navigate} />
              </Group>
            </Stack>
          </Group>
        </Box>
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          KPI CARDS
      ════════════════════════════════════════════════════════════ */}
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" mb="xl">
        <KpiCard
          icon={IconUserCheck} color="green" label="Attendance"
          value={`${attendPct}%`} sub={`${presentDays} / ${records.length} days`}
          trend={`${attendPct}%`} up={attendPct >= 75}
          spark={ramp(attendPct)}
        />
        <KpiCard
          icon={IconCalendarOff} color="blue" label="Leave Approved"
          value={approvedLeaves} sub="This year"
          spark={ramp(Math.max(approvedLeaves, 1))}
        />
        <KpiCard
          icon={IconClock} color="orange" label="Pending"
          value={pendingLeaves} sub="Awaiting approval"
          spark={ramp(Math.max(pendingLeaves, 1))}
        />
        <KpiCard
          icon={IconWallet} color="violet" label="Net Salary"
          value={payslip?.net ? fmt(payslip.net) : "—"} sub={payslip?.month || "Latest payslip"}
          spark={ramp(payslip?.net ? payslip.net : 1)}
        />
      </SimpleGrid>

      {/* ════════════════════════════════════════════════════════════
          ROW 2 — Attendance ring + Leave balance
      ════════════════════════════════════════════════════════════ */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">

        {/* Attendance card */}
        <PanelCard title="My Attendance" sub="This month's summary" action={<ViewAll navigate={navigate} to="/attendance" />}>
          <Group gap="lg" wrap="nowrap" mb="md">
            <RingProgress
              size={110} thickness={10}
              sections={[{ value: attendPct, color: attendPct >= 90 ? "green" : attendPct >= 75 ? "yellow" : "red" }]}
              label={<Text ta="center" fw={800} fz="lg">{attendPct}%</Text>}
            />
            <Box style={{ flex: 1 }}>
              {[
                { label: "Present",  value: presentDays,                                        color: "#22c55e" },
                { label: "Late",     value: records.filter((r) => r.status === "Late").length,   color: "#f59e0b" },
                { label: "Absent",   value: records.filter((r) => r.status === "Absent").length, color: "#ef4444" },
                { label: "Total",    value: records.length,                                      color: "#3b82f6" },
              ].map((s) => (
                <Group key={s.label} justify="space-between" py={4}
                  style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group gap={8}>
                    <Box style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                    <Text fz="sm" c="dimmed">{s.label}</Text>
                  </Group>
                  <Text fz="sm" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</Text>
                </Group>
              ))}
            </Box>
          </Group>

          {/* Recent rows */}
          <Text fz="xs" fw={700} c="dimmed" tt="uppercase" mb={8} style={{ letterSpacing: "0.06em" }}>Recent</Text>
          {records.length === 0 ? (
            <Text ta="center" c="dimmed" fz="sm" py="md">No records yet</Text>
          ) : records.slice(0, 8).map((r, i, arr) => (
            <Group key={i} justify="space-between" wrap="nowrap" py="xs"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
              <Box>
                <Text fz="sm" fw={500}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</Text>
                <Text fz="xs" c="dimmed">
                  {r.checkIn ? new Date(r.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  {r.checkOut ? ` → ${new Date(r.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                  {r.hoursWorked ? ` · ${r.hoursWorked}h` : ""}
                </Text>
              </Box>
              {/* status pill: rgba bg from statusBg fn, no Mantine prop equivalent */}
              <Box style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: statusBg(r.status) }}>
                <Box style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(r.status) }} />
                <Text fz="xs" fw={600} style={{ color: statusText(r.status) }}>{r.status}</Text>
              </Box>
            </Group>
          ))}
        </PanelCard>

        {/* Leave balance card */}
        <PanelCard title="My Leave Balance" sub="Current year allocation" action={<ViewAll navigate={navigate} to="/leave" />}>
          {balance.length === 0 ? (
            <Text ta="center" c="dimmed" fz="sm" py="xl">No leave balance data</Text>
          ) : balance.map((b) => {
            const quota     = b.total ?? b.quota ?? 0;
            const used      = b.used  || 0;
            const remaining = quota - used;
            const pct       = quota > 0 ? Math.round((used / quota) * 100) : 0;
            const label     = b.label || b.leaveType;
            const clr       = b.color || "blue";
            return (
              <Box key={label} mb="md">
                <Group justify="space-between" mb={6}>
                  <Text fz="sm" fw={600}>{label}</Text>
                  <Group gap={6}>
                    <Text fz="xs" c="dimmed">{remaining} left</Text>
                    <Box style={{ width: 1, height: 12, background: "var(--mantine-color-default-border)" }} />
                    <Text fz="xs" c="dimmed">{quota} total</Text>
                  </Group>
                </Group>
                <Progress value={pct} color={clr} size={8} radius="xl" mb={4} />
                <Text fz="xs" c={clr} fw={600}>{used} days used · {pct}%</Text>
              </Box>
            );
          })}

          {/* Leave history mini list */}
          {leaves.length > 0 && (
            <>
              <Text fz="xs" fw={700} c="dimmed" tt="uppercase" mb={8} mt="md" style={{ letterSpacing: "0.06em" }}>Recent Requests</Text>
              {leaves.slice(0, 3).map((l, i, arr) => {
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
            </>
          )}
        </PanelCard>
      </SimpleGrid>

      {/* ════════════════════════════════════════════════════════════
          ROW 3 — Payslip + Announcements
      ════════════════════════════════════════════════════════════ */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">

        {/* Payslip */}
        <PanelCard title="Latest Payslip" sub={payslip?.month || "—"} action={<ViewAll navigate={navigate} to="/my-payslips" />}>
          {payslip ? (
            <>
              <SimpleGrid cols={3} spacing="sm" mb="md">
                {[
                  { label: "Gross",      value: fmt(payslip.gross),           color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Deductions", value: `-${fmt(payslip.deductions)}`, color: "#ef4444", bg: "#fef2f2" },
                  { label: "Net Pay",    value: fmt(payslip.net),              color: "#22c55e", bg: "#f0fdf4" },
                ].map((s) => (
                  <Box key={s.label} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 14, background: s.bg }}>
                    <Text fz="xs" c="dimmed" fw={600} tt="uppercase" mb={4} style={{ letterSpacing: "0.04em" }}>{s.label}</Text>
                    <Text fz="md" fw={800} style={{ color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</Text>
                  </Box>
                ))}
              </SimpleGrid>
              <Group>
                <Badge color={payslip.status === "Paid" ? "green" : "yellow"} variant="light" leftSection={<IconCircleCheck size={11} />}>
                  {payslip.status}
                </Badge>
                <UnstyledButton onClick={() => navigate("/my-payslips")} ml="auto">
                  <Group gap={4}>
                    <Text fz="xs" c="blue" fw={600}>Download PDF</Text>
                    <IconArrowRight size={13} color="#3b82f6" stroke={2.5} />
                  </Group>
                </UnstyledButton>
              </Group>
            </>
          ) : (
            <Stack align="center" py="xl" gap="sm">
              <IconWallet size={40} color="#cbd5e1" stroke={1.2} />
              <Text c="dimmed" fz="sm">No payslip available yet</Text>
            </Stack>
          )}
        </PanelCard>

        {/* Announcements */}
        <PanelCard title="Announcements" sub="Latest company notices" action={<ViewAll navigate={navigate} to="/announcements" />}>
          {announcements.length === 0 ? (
            <Stack align="center" py="xl" gap="sm">
              <IconAlertCircle size={40} color="#cbd5e1" stroke={1.2} />
              <Text c="dimmed" fz="sm">No announcements</Text>
            </Stack>
          ) : announcements.slice(0, 4).map((a, i, arr) => {
            const grad = PRIORITY_GRAD[a.priority] || "linear-gradient(135deg,#3b82f6,#6366f1)";
            return (
              <Group key={a.id} wrap="nowrap" pb="sm" align="flex-start"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                {/* gradient accent bar — no Mantine prop equivalent */}
                <Box style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: grad, flexShrink: 0 }} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={600} truncate>{a.title}</Text>
                  <Group gap={6} mt={2}>
                    <Text fz="xs" c="dimmed">{a.author}</Text>
                    <Text fz="xs" c="dimmed">·</Text>
                    <Text fz="xs" c="dimmed">{new Date(a.createdAt || a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Text>
                  </Group>
                </Box>
                <Badge size="xs" style={{ background: a.priority === "High" ? "#fef2f2" : "#f0fdf4", color: a.priority === "High" ? "#dc2626" : "#16a34a", flexShrink: 0 }}>
                  {a.priority}
                </Badge>
              </Group>
            );
          })}
        </PanelCard>
      </SimpleGrid>

      {/* ════════════════════════════════════════════════════════════
          ROW 4 — Birthdays + Anniversaries + Events
      ════════════════════════════════════════════════════════════ */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">

        {/* Birthdays */}
        <PanelCard title="🎂 Birthdays" sub={`${birthdays.length} this month`}>
          {birthdays.length === 0 ? (
            <Text ta="center" c="dimmed" fz="sm" py="lg">No birthdays this month</Text>
          ) : birthdays.slice(0, 4).map((e) => (
            <Group key={e.id} gap="sm" py={8} wrap="nowrap"
              style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
              <Avatar size={34} radius="xl" color="pink" style={{ fontSize: 13, fontWeight: 700 }}>
                {e.name?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box style={{ minWidth: 0 }}>
                <Text fz="sm" fw={600} truncate>{e.name}</Text>
                <Text fz="xs" c="dimmed">{new Date(e.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long" })}</Text>
              </Box>
            </Group>
          ))}
        </PanelCard>

        {/* Anniversaries */}
        <PanelCard title="⭐ Anniversaries" sub={`${anniversaries.length} this month`}>
          {anniversaries.length === 0 ? (
            <Text ta="center" c="dimmed" fz="sm" py="lg">No anniversaries this month</Text>
          ) : anniversaries.slice(0, 4).map((e) => {
            const years = new Date().getFullYear() - new Date(e.joinDate).getFullYear();
            return (
              <Group key={e.id} gap="sm" py={8} wrap="nowrap"
                style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Avatar size={34} radius="xl" color="yellow" style={{ fontSize: 13, fontWeight: 700 }}>
                  {e.name?.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box style={{ minWidth: 0 }}>
                  <Text fz="sm" fw={600} truncate>{e.name}</Text>
                  <Text fz="xs" c="dimmed">{years} year{years !== 1 ? "s" : ""} · {new Date(e.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Text>
                </Box>
              </Group>
            );
          })}
        </PanelCard>

        {/* Upcoming Events */}
        <PanelCard title="📅 Upcoming" sub="Events & holidays">
          {events.length === 0 ? (
            <Text ta="center" c="dimmed" fz="sm" py="lg">No upcoming events</Text>
          ) : events.slice(0, 4).map((e, i, arr) => {
            const d = new Date(e.date);
            return (
              <Group key={e.id} gap="sm" py={8} wrap="nowrap"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                {/* mini calendar chip — flexDirection column, no Mantine Stack equivalent at this size */}
                <Box style={{ width: 40, height: 40, borderRadius: 10, background: "var(--mantine-color-blue-0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--mantine-color-blue-2)" }}>
                  <Text fz={8} fw={800} c="blue" tt="uppercase" lh={1}>{d.toLocaleDateString("en-IN", { month: "short" })}</Text>
                  <Text fz="md" fw={800} c="blue" lh={1.1}>{d.getDate()}</Text>
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text fz="sm" fw={600} truncate>{e.title}</Text>
                  <Text fz="xs" c="dimmed">{e.type || "Event"}</Text>
                </Box>
              </Group>
            );
          })}
        </PanelCard>
      </SimpleGrid>
    </Box>
  );
};
