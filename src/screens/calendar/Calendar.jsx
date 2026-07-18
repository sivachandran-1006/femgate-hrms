import { useState } from "react";
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCalendar as CalendarIcon,
  IconStar as Star,
  IconBriefcase as Briefcase,
  IconClock as Clock,
} from "@tabler/icons-react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  ActionIcon,
  Badge,
  Table,
} from "@mantine/core";
import { COLORS } from "../../theme/colors";

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_HOLIDAYS = [
  { date: "2026-01-01", name: "New Year's Day",       type: "National", optional: false },
  { date: "2026-01-14", name: "Pongal",               type: "Regional", optional: false },
  { date: "2026-01-26", name: "Republic Day",         type: "National", optional: false },
  { date: "2026-03-25", name: "Holi",                 type: "National", optional: false },
  { date: "2026-04-14", name: "Tamil New Year",       type: "Regional", optional: true  },
  { date: "2026-04-18", name: "Good Friday",          type: "National", optional: false },
  { date: "2026-05-01", name: "Labour Day",           type: "National", optional: false },
  { date: "2026-08-15", name: "Independence Day",     type: "National", optional: false },
  { date: "2026-09-02", name: "Ganesh Chaturthi",     type: "National", optional: false },
  { date: "2026-10-02", name: "Gandhi Jayanti",       type: "National", optional: false },
  { date: "2026-10-20", name: "Diwali",               type: "National", optional: false },
  { date: "2026-11-14", name: "Diwali Holiday",       type: "National", optional: true  },
  { date: "2026-12-25", name: "Christmas",            type: "National", optional: false },
  { date: "2026-06-17", name: "Eid Al-Adha",          type: "National", optional: false },
  { date: "2026-07-10", name: "Muharram",             type: "National", optional: true  },
];

const MOCK_ONBOARDING = [
  { joiningDate: "2026-07-01", name: "Ananya Pillai"   },
  { joiningDate: "2026-07-15", name: "Kiran Subramani" },
  { joiningDate: "2026-08-01", name: "Nithya Suresh"   },
];

const MOCK_LEAVES = [
  { status: "Approved", fromDate: "2026-07-03", employee: "Kavitha Rajan", leaveType: "Casual Leave"  },
  { status: "Approved", fromDate: "2026-07-14", employee: "Arjun Mehta",   leaveType: "Sick Leave"    },
  { status: "Pending",  fromDate: "2026-07-20", employee: "Priya Sharma",  leaveType: "Annual Leave"  },
];

// ── Event color map ────────────────────────────────────────────────────────────
const EVENT_COLORS = {
  join:    { dot: "#16a34a", bg: "#dcfce7", text: "#15803d", darkBg: "#14532d", darkText: "#86efac" },
  payroll: { dot: "#8b5cf6", bg: "#f3e8ff", text: "#6d28d9", darkBg: "#3b0764", darkText: "#c4b5fd" },
  review:  { dot: "#2563eb", bg: "#dbeafe", text: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#93c5fd" },
  holiday: { dot: "#ef4444", bg: "#fee2e2", text: "#dc2626", darkBg: "#7f1d1d", darkText: "#fca5a5" },
  hr:      { dot: "#f59e0b", bg: "#fef3c7", text: "#d97706", darkBg: "#78350f", darkText: "#fcd34d" },
  team:    { dot: "#0d9488", bg: "#ccfbf1", text: "#0f766e", darkBg: "#042f2e", darkText: "#5eead4" },
};

const KIND_BADGE = {
  National: { bg: "#fee2e2", text: "#dc2626", darkBg: "#7f1d1d", darkText: "#fca5a5" },
  Company:  { bg: "#dbeafe", text: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#93c5fd" },
  Optional: { bg: "#fef3c7", text: "#d97706", darkBg: "#78350f", darkText: "#fcd34d" },
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getEventsForDate(events, dateKey) {
  return events.filter((e) => e.date === dateKey);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function countWorkingDays(year, month) {
  const total = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function upcomingEventsThisMonth(events, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return events.filter((e) => e.date.startsWith(prefix)).length;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value, color, darkMode }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  return (
    <Paper
      withBorder
      radius="xl"
      p="sm"
      style={{
        flex: "1 1 160px",
        minWidth: 150,
        background: th.cardBg,
        borderColor: th.border,
      }}
    >
      <Group gap="sm" align="center" wrap="nowrap">
        <Box
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={color} strokeWidth={2} />
        </Box>
        <Stack gap={2}>
          <Text size="xl" fw={700} c={th.text} lh={1.2}>{value}</Text>
          <Text size="xs" c={th.subtext}>{label}</Text>
        </Stack>
      </Group>
    </Paper>
  );
}

function EventPill({ event, darkMode }) {
  const ec = EVENT_COLORS[event.type] || EVENT_COLORS.team;
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: darkMode ? ec.darkBg : ec.bg,
        borderRadius: 9999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 500,
        color: darkMode ? ec.darkText : ec.text,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 9999,
          background: ec.dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {event.title}
    </Box>
  );
}

function SidePanelEvent({ event, darkMode }) {
  const ec = EVENT_COLORS[event.type] || EVENT_COLORS.team;
  const th = darkMode ? COLORS.dark : COLORS.light;
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      mb="sm"
      style={{
        background: darkMode ? COLORS.dark.pageBg : COLORS.light.pageBg,
        borderColor: th.border,
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Box
          mt={4}
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: ec.dot,
            flexShrink: 0,
          }}
        />
        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={600} c={th.text}>{event.title}</Text>
          <Badge
            mt={4}
            radius="xl"
            size="xs"
            style={{
              background: darkMode ? ec.darkBg : ec.bg,
              color: darkMode ? ec.darkText : ec.text,
              fontWeight: 500,
              border: "none",
            }}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
          <Text size="xs" c={th.subtext} mt={3}>{event.date}</Text>
        </Box>
      </Group>
    </Paper>
  );
}

// ── Main Calendar component ────────────────────────────────────────────────────
export default function Calendar({ darkMode = false }) {
  const { data: holidaysRawData = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: onboardRawData = [] }  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: leavesRawData = [] }   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const holidaysRaw = holidaysRawData.length ? holidaysRawData : MOCK_HOLIDAYS;
  const onboardRaw  = onboardRawData.length  ? onboardRawData  : MOCK_ONBOARDING;
  const leavesRaw   = leavesRawData.length   ? leavesRawData   : MOCK_LEAVES;

  const leaves = Array.isArray(leavesRaw) ? leavesRaw : [];

  const EVENTS = [
    ...holidaysRaw.map((h) => ({ date: (h.date || "").split("T")[0], title: h.name, type: "holiday" })),
    ...onboardRaw.map((o) => ({ date: (o.joiningDate || "").split("T")[0], title: `${o.name} Joining`, type: "join" })),
    ...leaves.filter((l) => l.status === "Approved").map((l) => ({
      date: l.fromDate, title: `${l.employee || "My"} leave — ${l.leaveType}`, type: "hr",
    })),
  ];

  const HOLIDAY_TABLE = holidaysRaw.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", day: "2-digit" }),
    name: h.name,
    kind: h.optional ? "Optional" : h.type === "Regional" ? "Company" : "National",
  }));
  const today = new Date();
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(5); // June = 5 (0-indexed)
  const [selectedDate, setSelectedDate] = useState(null);

  const th = darkMode ? COLORS.dark : COLORS.light;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const panelEvents = selectedDate
    ? getEventsForDate(EVENTS, selectedDate)
    : (() => {
        const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;
        return EVENTS.filter((e) => e.date.startsWith(prefix)).slice(0, 8);
      })();

  const panelTitle = selectedDate
    ? `Events on ${selectedDate}`
    : `Upcoming in ${MONTH_NAMES[viewMonth]}`;

  const totalHolidays = HOLIDAY_TABLE.length;
  const upcomingCount = upcomingEventsThisMonth(EVENTS, viewYear, viewMonth);
  const workingDays = countWorkingDays(viewYear, viewMonth);

  // Build calendar grid cells: null = empty, number = day
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

  return (
    <Box
      p="xl"
      style={{
        minHeight: "100vh",
        background: th.pageBg,
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ── Page header ─────────────────────────────────────────────── */}
      <Stack gap={4} mb="xl">
        <Group gap="sm" align="center">
          <CalendarIcon size={22} color={COLORS.primary} strokeWidth={2} />
          <Text size="xl" fw={700} c={th.text}>
            Calendar &amp; Holiday Planner
          </Text>
        </Group>
        <Text size="sm" c={th.subtext}>
          View company events, holidays, and team schedules
        </Text>
      </Stack>

      {/* ── Stat chips ──────────────────────────────────────────────── */}
      <Group gap="md" mb="xl" wrap="wrap">
        <StatChip icon={Star}      label="Total Holidays This Year"   value={totalHolidays} color={COLORS.error}   darkMode={darkMode} />
        <StatChip icon={Clock}     label="Upcoming Events This Month" value={upcomingCount} color={COLORS.primary} darkMode={darkMode} />
        <StatChip icon={Briefcase} label="Working Days This Month"    value={workingDays}   color={COLORS.success} darkMode={darkMode} />
      </Group>

      {/* ── Main layout: calendar + side panel ──────────────────────── */}
      <Group gap="lg" align="flex-start" wrap="wrap" mb="xl">
        {/* Calendar card */}
        <Paper
          withBorder
          radius="xl"
          style={{
            flex: "1 1 520px",
            background: th.cardBg,
            borderColor: th.border,
            overflow: "hidden",
          }}
        >
          {/* Month navigation header */}
          <Group
            justify="space-between"
            align="center"
            px="lg"
            py="md"
            style={{ borderBottom: `1px solid ${th.border}` }}
          >
            <ActionIcon
              onClick={prevMonth}
              variant="default"
              radius="md"
              size={34}
              style={{
                background: darkMode ? COLORS.dark.pageBg : COLORS.gray100,
                borderColor: th.border,
                color: th.text,
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </ActionIcon>

            <Text size="lg" fw={700} c={th.text} ta="center">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <ActionIcon
              onClick={nextMonth}
              variant="default"
              radius="md"
              size={34}
              style={{
                background: darkMode ? COLORS.dark.pageBg : COLORS.gray100,
                borderColor: th.border,
                color: th.text,
              }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </ActionIcon>
          </Group>

          {/* Day-of-week header */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
              borderBottom: `1px solid ${th.border}`,
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <Text
                key={d}
                ta="center"
                py="xs"
                size="xs"
                fw={600}
                c={d === "Sun" || d === "Sat" ? COLORS.error : th.subtext}
                style={{ letterSpacing: "0.05em" }}
              >
                {d}
              </Text>
            ))}
          </Box>

          {/* Day cells grid */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0,
            }}
          >
            {gridCells.map((day, idx) => {
              if (day === null) {
                return (
                  <Box
                    key={`empty-${idx}`}
                    style={{
                      minHeight: 80,
                      background: darkMode
                        ? "rgba(15,23,42,0.4)"
                        : "rgba(241,245,249,0.5)",
                      borderRight: `1px solid ${th.border}`,
                      borderBottom: `1px solid ${th.border}`,
                    }}
                  />
                );
              }

              const dow = (firstDay + day - 1) % 7;
              const isWeekend = dow === 0 || dow === 6;
              const dateKey = toDateKey(viewYear, viewMonth, day);
              const dayEvents = getEventsForDate(EVENTS, dateKey);
              const isTodayCell = isToday(day);
              const isSelected = selectedDate === dateKey;

              return (
                <Box
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  style={{
                    minHeight: 80,
                    padding: "6px 6px 4px 6px",
                    borderRight: `1px solid ${th.border}`,
                    borderBottom: `1px solid ${th.border}`,
                    cursor: "pointer",
                    background: isSelected
                      ? darkMode ? "#1e3a8a" : COLORS.primaryLight
                      : isWeekend
                      ? darkMode ? "rgba(15,23,42,0.5)" : "rgba(248,250,252,0.8)"
                      : th.cardBg,
                    transition: "background 0.15s ease",
                    position: "relative",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Date number */}
                  <Box
                    mb={4}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 9999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: isTodayCell ? 700 : 500,
                      color: isTodayCell
                        ? COLORS.white
                        : isWeekend
                        ? darkMode ? "#fca5a5" : COLORS.error
                        : th.text,
                      background: isTodayCell ? COLORS.primary : "transparent",
                    }}
                  >
                    {day}
                  </Box>

                  {/* Event pills */}
                  <Stack gap={2}>
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <EventPill key={i} event={ev} darkMode={darkMode} />
                    ))}
                    {dayEvents.length > 2 && (
                      <Text size="xs" c={th.subtext} fw={500} pl={4}>
                        +{dayEvents.length - 2} more
                      </Text>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          <Group
            px="lg"
            py="sm"
            gap="md"
            wrap="wrap"
            style={{ borderTop: `1px solid ${th.border}` }}
          >
            {Object.entries(EVENT_COLORS).map(([key, ec]) => (
              <Group key={key} gap={5} align="center" wrap="nowrap">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 9999,
                    background: ec.dot,
                    display: "inline-block",
                  }}
                />
                <Text size="xs" c={th.subtext} tt="capitalize">{key}</Text>
              </Group>
            ))}
          </Group>
        </Paper>

        {/* Side panel */}
        <Paper
          withBorder
          radius="xl"
          style={{
            flex: "0 0 280px",
            background: th.cardBg,
            borderColor: th.border,
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <Box
            px="lg"
            py="md"
            style={{
              borderBottom: `1px solid ${th.border}`,
              background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
            }}
          >
            <Text size="sm" fw={700} c={th.text}>{panelTitle}</Text>
            {selectedDate && (
              <Text
                size="xs"
                c={COLORS.primary}
                fw={500}
                mt={4}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedDate(null)}
              >
                ← Show all upcoming
              </Text>
            )}
          </Box>

          {/* Event list */}
          <Box p="md" style={{ overflowY: "auto", maxHeight: 480 }}>
            {panelEvents.length === 0 ? (
              <Text ta="center" py="xl" c={th.subtext} size="sm">
                No events on this day
              </Text>
            ) : (
              panelEvents.map((ev, i) => (
                <SidePanelEvent key={i} event={ev} darkMode={darkMode} />
              ))
            )}
          </Box>
        </Paper>
      </Group>

      {/* ── Holiday table ────────────────────────────────────────────── */}
      <Paper
        withBorder
        radius="xl"
        style={{
          background: th.cardBg,
          borderColor: th.border,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <Group
          px="lg"
          py="md"
          gap="sm"
          align="center"
          style={{
            borderBottom: `1px solid ${th.border}`,
            background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
          }}
        >
          <CalendarIcon size={16} color={COLORS.primary} strokeWidth={2} />
          <Text size="md" fw={700} c={th.text}>
            Public &amp; Company Holidays — 2026
          </Text>
          <Badge
            ml="auto"
            radius="xl"
            size="sm"
            style={{
              background: darkMode ? COLORS.dark.border : COLORS.gray200,
              color: th.subtext,
              border: "none",
              fontWeight: 600,
            }}
          >
            {HOLIDAY_TABLE.length} holidays
          </Badge>
        </Group>

        {/* Table */}
        <Table highlightOnHover>
          <Table.Thead
            style={{ background: darkMode ? COLORS.dark.theadBg : COLORS.gray50 }}
          >
            <Table.Tr>
              {["Date", "Holiday Name", "Type"].map((h) => (
                <Table.Th
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: th.subtext,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${th.border}`,
                  }}
                >
                  {h}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {HOLIDAY_TABLE.map((row, i) => {
              const badge = KIND_BADGE[row.kind] || KIND_BADGE.Optional;
              return (
                <Table.Tr
                  key={i}
                  style={{
                    background: i % 2 === 0
                      ? th.cardBg
                      : darkMode ? "rgba(15,23,42,0.3)" : "rgba(248,250,252,0.6)",
                    transition: "background 0.15s ease",
                  }}
                >
                  <Table.Td>
                    <Text size="sm" fw={500} c={COLORS.primary}>{row.date}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} c={th.text}>{row.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      radius="xl"
                      size="sm"
                      style={{
                        background: darkMode ? badge.darkBg : badge.bg,
                        color: darkMode ? badge.darkText : badge.text,
                        border: "none",
                        fontWeight: 600,
                      }}
                    >
                      {row.kind}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}
