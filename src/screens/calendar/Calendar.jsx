import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, Briefcase, Clock } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, GAP } from "../../theme/spacing";
import { RADIUS, SHADOW } from "../../theme/sizes";

// ── Event color map ────────────────────────────────────────────────────────────
const EVENT_COLORS = {
  join:    { dot: "#16a34a", bg: "#dcfce7", text: "#15803d", darkBg: "#14532d", darkText: "#86efac" },
  payroll: { dot: "#8b5cf6", bg: "#f3e8ff", text: "#6d28d9", darkBg: "#3b0764", darkText: "#c4b5fd" },
  review:  { dot: "#2563eb", bg: "#dbeafe", text: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#93c5fd" },
  holiday: { dot: "#ef4444", bg: "#fee2e2", text: "#dc2626", darkBg: "#7f1d1d", darkText: "#fca5a5" },
  hr:      { dot: "#f59e0b", bg: "#fef3c7", text: "#d97706", darkBg: "#78350f", darkText: "#fcd34d" },
  team:    { dot: "#0d9488", bg: "#ccfbf1", text: "#0f766e", darkBg: "#042f2e", darkText: "#5eead4" },
};

// ── Mock data ──────────────────────────────────────────────────────────────────
const EVENTS = [
  // June 2026
  { date: "2026-06-02", title: "Team Standup",            type: "team" },
  { date: "2026-06-03", title: "Arjun Kumar Joining",     type: "join" },
  { date: "2026-06-05", title: "Q2 Appraisal Starts",     type: "review" },
  { date: "2026-06-05", title: "Priya Joining",           type: "join" },
  { date: "2026-06-10", title: "Payroll Processing",      type: "payroll" },
  { date: "2026-06-10", title: "Eid Al-Adha",             type: "holiday" },
  { date: "2026-06-15", title: "New Payroll Policy",      type: "hr" },
  { date: "2026-06-20", title: "Team Building Event",     type: "team" },
  { date: "2026-06-25", title: "Monthly Review",          type: "review" },
  { date: "2026-06-30", title: "Month End Close",         type: "payroll" },
  // National / company holidays
  { date: "2026-01-26", title: "Republic Day",            type: "holiday" },
  { date: "2026-03-25", title: "Holi",                    type: "holiday" },
  { date: "2026-04-14", title: "Ambedkar Jayanti",        type: "holiday" },
  { date: "2026-08-15", title: "Independence Day",        type: "holiday" },
  { date: "2026-10-02", title: "Gandhi Jayanti",          type: "holiday" },
  { date: "2026-11-01", title: "Diwali",                  type: "holiday" },
  { date: "2026-12-25", title: "Christmas",               type: "holiday" },
];

const HOLIDAY_TABLE = [
  { date: "Jan 26", name: "Republic Day",        kind: "National" },
  { date: "Mar 25", name: "Holi",                kind: "National" },
  { date: "Apr 14", name: "Ambedkar Jayanti",    kind: "National" },
  { date: "Jun 10", name: "Eid Al-Adha",         kind: "National" },
  { date: "Aug 15", name: "Independence Day",    kind: "National" },
  { date: "Oct 02", name: "Gandhi Jayanti",      kind: "National" },
  { date: "Nov 01", name: "Diwali",              kind: "National" },
  { date: "Dec 25", name: "Christmas",           kind: "National" },
  { date: "Jun 05", name: "Q2 Appraisal Start",  kind: "Company" },
  { date: "Jun 15", name: "New Payroll Policy",  kind: "Company" },
  { date: "Jun 20", name: "Team Building Event", kind: "Company" },
  { date: "Mar 08", name: "Women's Day Off",     kind: "Optional" },
  { date: "Sep 05", name: "Teachers' Day",       kind: "Optional" },
];

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

function getEventsForDate(dateKey) {
  return EVENTS.filter((e) => e.date === dateKey);
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

function upcomingEventsThisMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return EVENTS.filter((e) => e.date.startsWith(prefix)).length;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value, color, darkMode }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: GAP.sm,
        background: darkMode ? COLORS.dark.cardBg : COLORS.light.cardBg,
        border: `1px solid ${th.border}`,
        borderRadius: RADIUS.xl,
        padding: `${SPACING[3]}px ${SPACING[5]}px`,
        boxShadow: SHADOW.sm,
        flex: "1 1 160px",
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: RADIUS.lg,
          background: color + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: th.text, lineHeight: 1.2 }}>
          {value}
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: th.subtext, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function EventPill({ event, darkMode }) {
  const ec = EVENT_COLORS[event.type] || EVENT_COLORS.team;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: GAP.xs,
        background: darkMode ? ec.darkBg : ec.bg,
        borderRadius: RADIUS.full,
        padding: "3px 10px",
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
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
          borderRadius: RADIUS.full,
          background: ec.dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {event.title}
    </div>
  );
}

function SidePanelEvent({ event, darkMode }) {
  const ec = EVENT_COLORS[event.type] || EVENT_COLORS.team;
  const th = darkMode ? COLORS.dark : COLORS.light;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: GAP.sm,
        padding: `${SPACING[3]}px ${SPACING[4]}px`,
        borderRadius: RADIUS.lg,
        background: darkMode ? COLORS.dark.pageBg : COLORS.light.pageBg,
        border: `1px solid ${th.border}`,
        marginBottom: GAP.sm,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: RADIUS.full,
          background: ec.dot,
          marginTop: 4,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: th.text }}>
          {event.title}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 4,
            fontSize: FONT_SIZE.xs,
            fontWeight: FONT_WEIGHT.medium,
            background: darkMode ? ec.darkBg : ec.bg,
            color: darkMode ? ec.darkText : ec.text,
            borderRadius: RADIUS.full,
            padding: "2px 8px",
          }}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: th.subtext, marginTop: 3 }}>
          {event.date}
        </div>
      </div>
    </div>
  );
}

// ── Main Calendar component ────────────────────────────────────────────────────
export default function Calendar({ darkMode = false }) {
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
    ? getEventsForDate(selectedDate)
    : (() => {
        const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;
        return EVENTS.filter((e) => e.date.startsWith(prefix)).slice(0, 8);
      })();

  const panelTitle = selectedDate
    ? `Events on ${selectedDate}`
    : `Upcoming in ${MONTH_NAMES[viewMonth]}`;

  const totalHolidays = HOLIDAY_TABLE.length;
  const upcomingCount = upcomingEventsThisMonth(viewYear, viewMonth);
  const workingDays = countWorkingDays(viewYear, viewMonth);

  // Build calendar grid cells: null = empty, number = day
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: th.pageBg,
        padding: SPACING[6],
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: SPACING[6] }}>
        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, marginBottom: 4 }}>
          <CalendarIcon size={22} color={COLORS.primary} strokeWidth={2} />
          <h1
            style={{
              margin: 0,
              fontSize: FONT_SIZE.xl,
              fontWeight: FONT_WEIGHT.bold,
              color: th.text,
            }}
          >
            Calendar &amp; Holiday Planner
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: th.subtext }}>
          View company events, holidays, and team schedules
        </p>
      </div>

      {/* ── Stat chips ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: GAP.md,
          marginBottom: SPACING[6],
        }}
      >
        <StatChip icon={Star}        label="Total Holidays This Year"    value={totalHolidays} color={COLORS.error}   darkMode={darkMode} />
        <StatChip icon={Clock}       label="Upcoming Events This Month"  value={upcomingCount} color={COLORS.primary} darkMode={darkMode} />
        <StatChip icon={Briefcase}   label="Working Days This Month"     value={workingDays}   color={COLORS.success} darkMode={darkMode} />
      </div>

      {/* ── Main layout: calendar + side panel ──────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: GAP.lg,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: SPACING[6],
        }}
      >
        {/* Calendar card */}
        <div
          style={{
            flex: "1 1 520px",
            background: th.cardBg,
            borderRadius: RADIUS["2xl"],
            border: `1px solid ${th.border}`,
            boxShadow: SHADOW.md,
            overflow: "hidden",
          }}
        >
          {/* Month navigation header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${SPACING[4]}px ${SPACING[5]}px`,
              borderBottom: `1px solid ${th.border}`,
            }}
          >
            <button
              onClick={prevMonth}
              style={{
                background: darkMode ? COLORS.dark.pageBg : COLORS.gray100,
                border: `1px solid ${th.border}`,
                borderRadius: RADIUS.lg,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: th.text,
                transition: "all 0.15s ease",
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: th.text }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>
            </div>

            <button
              onClick={nextMonth}
              style={{
                background: darkMode ? COLORS.dark.pageBg : COLORS.gray100,
                border: `1px solid ${th.border}`,
                borderRadius: RADIUS.lg,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: th.text,
                transition: "all 0.15s ease",
              }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Day-of-week header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
              borderBottom: `1px solid ${th.border}`,
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  padding: `${SPACING[2]}px 0`,
                  fontSize: FONT_SIZE.xs,
                  fontWeight: FONT_WEIGHT.semibold,
                  color: d === "Sun" || d === "Sat" ? COLORS.error : th.subtext,
                  letterSpacing: "0.05em",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0,
            }}
          >
            {gridCells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
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
              const dayEvents = getEventsForDate(dateKey);
              const isTodayCell = isToday(day);
              const isSelected = selectedDate === dateKey;

              return (
                <div
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
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: RADIUS.full,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: FONT_SIZE.sm,
                      fontWeight: isTodayCell ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                      color: isTodayCell
                        ? COLORS.white
                        : isWeekend
                        ? darkMode ? "#fca5a5" : COLORS.error
                        : th.text,
                      background: isTodayCell ? COLORS.primary : "transparent",
                      marginBottom: 4,
                    }}
                  >
                    {day}
                  </div>

                  {/* Event dots */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <EventPill key={i} event={ev} darkMode={darkMode} />
                    ))}
                    {dayEvents.length > 2 && (
                      <div
                        style={{
                          fontSize: FONT_SIZE.xs,
                          color: th.subtext,
                          paddingLeft: 4,
                          fontWeight: FONT_WEIGHT.medium,
                        }}
                      >
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              padding: `${SPACING[3]}px ${SPACING[5]}px`,
              borderTop: `1px solid ${th.border}`,
              display: "flex",
              flexWrap: "wrap",
              gap: GAP.md,
            }}
          >
            {Object.entries(EVENT_COLORS).map(([key, ec]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: RADIUS.full,
                    background: ec.dot,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: FONT_SIZE.xs, color: th.subtext, textTransform: "capitalize" }}>
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div
          style={{
            flex: "0 0 280px",
            background: th.cardBg,
            borderRadius: RADIUS["2xl"],
            border: `1px solid ${th.border}`,
            boxShadow: SHADOW.md,
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: `${SPACING[4]}px ${SPACING[5]}px`,
              borderBottom: `1px solid ${th.border}`,
              background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
            }}
          >
            <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: th.text }}>
              {panelTitle}
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  marginTop: 4,
                  fontSize: FONT_SIZE.xs,
                  color: COLORS.primary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: FONT_WEIGHT.medium,
                }}
              >
                ← Show all upcoming
              </button>
            )}
          </div>

          {/* Event list */}
          <div style={{ padding: SPACING[4], overflowY: "auto", maxHeight: 480 }}>
            {panelEvents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: `${SPACING[8]}px 0`,
                  color: th.subtext,
                  fontSize: FONT_SIZE.sm,
                }}
              >
                No events on this day
              </div>
            ) : (
              panelEvents.map((ev, i) => (
                <SidePanelEvent key={i} event={ev} darkMode={darkMode} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Holiday table ────────────────────────────────────────────── */}
      <div
        style={{
          background: th.cardBg,
          borderRadius: RADIUS["2xl"],
          border: `1px solid ${th.border}`,
          boxShadow: SHADOW.md,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            padding: `${SPACING[4]}px ${SPACING[5]}px`,
            borderBottom: `1px solid ${th.border}`,
            display: "flex",
            alignItems: "center",
            gap: GAP.sm,
            background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
          }}
        >
          <CalendarIcon size={16} color={COLORS.primary} strokeWidth={2} />
          <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: th.text }}>
            Public &amp; Company Holidays — 2026
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: FONT_SIZE.xs,
              fontWeight: FONT_WEIGHT.semibold,
              background: darkMode ? COLORS.dark.border : COLORS.gray200,
              color: th.subtext,
              borderRadius: RADIUS.full,
              padding: "2px 10px",
            }}
          >
            {HOLIDAY_TABLE.length} holidays
          </span>
        </div>

        {/* Column headings */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 130px",
            padding: `${SPACING[3]}px ${SPACING[5]}px`,
            borderBottom: `1px solid ${th.border}`,
            background: darkMode ? COLORS.dark.theadBg : COLORS.gray50,
          }}
        >
          {["Date", "Holiday Name", "Type"].map((h) => (
            <div
              key={h}
              style={{
                fontSize: FONT_SIZE.xs,
                fontWeight: FONT_WEIGHT.semibold,
                color: th.subtext,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {HOLIDAY_TABLE.map((row, i) => {
          const badge = KIND_BADGE[row.kind] || KIND_BADGE.Optional;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 130px",
                padding: `${SPACING[3]}px ${SPACING[5]}px`,
                borderBottom: i < HOLIDAY_TABLE.length - 1 ? `1px solid ${th.border}` : "none",
                alignItems: "center",
                background: i % 2 === 0
                  ? th.cardBg
                  : darkMode ? "rgba(15,23,42,0.3)" : "rgba(248,250,252,0.6)",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: COLORS.primary }}>
                {row.date}
              </div>
              <div style={{ fontSize: FONT_SIZE.sm, color: th.text, fontWeight: FONT_WEIGHT.medium }}>
                {row.name}
              </div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: FONT_SIZE.xs,
                    fontWeight: FONT_WEIGHT.semibold,
                    background: darkMode ? badge.darkBg : badge.bg,
                    color: darkMode ? badge.darkText : badge.text,
                    borderRadius: RADIUS.full,
                    padding: "3px 12px",
                  }}
                >
                  {row.kind}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
