import { useState } from "react";
import {
  Sun, Sunset, Moon, Calendar, Users, RefreshCw,
  ChevronLeft, ChevronRight, Plus, X, Clock, Check, XCircle,
} from "lucide-react";

import { COLORS }                        from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT }         from "../../theme/fonts";
import { SPACING, GAP, PADDING }          from "../../theme/spacing";
import { RADIUS, SHADOW }                 from "../../theme/sizes";

// ── Constants ────────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATES = ["Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7", "Jun 8"];

const SHIFT_TYPES = {
  Morning: { label: "Morning", bg: "#dbeafe", color: "#1d4ed8", darkBg: "#1e3a8a", darkColor: "#93c5fd" },
  Evening: { label: "Evening", bg: "#ffedd5", color: "#c2410c", darkBg: "#7c2d12", darkColor: "#fdba74" },
  Night:   { label: "Night",   bg: "#ede9fe", color: "#6d28d9", darkBg: "#3b0764", darkColor: "#c4b5fd" },
  Off:     { label: "Off",     bg: "#f1f5f9", color: "#475569", darkBg: "#1e293b", darkColor: "#94a3b8" },
  Leave:   { label: "Leave",   bg: "#fef9c3", color: "#a16207", darkBg: "#713f12", darkColor: "#fde047" },
};

const EMPLOYEES = [
  "Mani", "P Santhosh", "C Santhosh", "Suriya", "Siva",
  "Aravinth", "Safeer", "Sabari", "Vignesh",
];

// Mon–Sun roster for the week (index 0 = Mon Jun 2)
const INITIAL_ROSTER = {
  Mani:       ["Morning", "Morning", "Morning", "Morning", "Morning", "Off",   "Off"  ],
  "P Santhosh": ["Morning", "Morning", "Evening", "Morning", "Morning", "Morning","Off"],
  "C Santhosh": ["Evening", "Evening", "Evening", "Evening", "Evening", "Evening","Off"],
  Suriya:     ["Morning", "Off",     "Morning", "Morning", "Morning", "Off",   "Off"  ],
  Siva:       ["Morning", "Morning", "Morning", "Morning", "Morning", "Off",   "Off"  ],
  Aravinth:   ["Evening", "Evening", "Morning", "Evening", "Evening", "Off",   "Off"  ],
  Safeer:     ["Leave",   "Leave",   "Leave",   "Leave",   "Leave",   "Off",   "Off"  ],
  Sabari:     ["Night",   "Night",   "Night",   "Night",   "Night",   "Night", "Off"  ],
  Vignesh:    ["Night",   "Night",   "Night",   "Night",   "Night",   "Night", "Off"  ],
};

const SHIFT_DEFINITIONS = [
  {
    id: "morning",
    name: "Morning Shift",
    time: "09:00 AM – 06:00 PM",
    days: "Mon – Fri",
    grace: "15 min",
    count: 5,
    icon: Sun,
    accent: "#2563eb",
    accentMuted: "#dbeafe",
    accentMutedDark: "#1e3a8a",
  },
  {
    id: "evening",
    name: "Evening Shift",
    time: "02:00 PM – 11:00 PM",
    days: "Mon – Sat",
    grace: "10 min",
    count: 3,
    icon: Sunset,
    accent: "#ea580c",
    accentMuted: "#ffedd5",
    accentMutedDark: "#7c2d12",
  },
  {
    id: "night",
    name: "Night Shift",
    time: "10:00 PM – 07:00 AM",
    days: "Mon – Sun",
    grace: "20 min",
    count: 2,
    icon: Moon,
    accent: "#7c3aed",
    accentMuted: "#ede9fe",
    accentMutedDark: "#3b0764",
  },
];

const SWAP_REQUESTS_INITIAL = [
  {
    id: "sw1",
    requestedBy: "Aravinth",
    withEmployee: "P Santhosh",
    originalShift: "Evening",
    swapShift: "Morning",
    date: "Jun 4, 2026",
    reason: "Family function",
    status: "Pending",
  },
  {
    id: "sw2",
    requestedBy: "Vignesh",
    withEmployee: "Sabari",
    originalShift: "Night",
    swapShift: "Night",
    date: "Jun 5, 2026",
    reason: "Medical appointment",
    status: "Approved",
  },
  {
    id: "sw3",
    requestedBy: "Suriya",
    withEmployee: "Mani",
    originalShift: "Morning",
    swapShift: "Morning",
    date: "Jun 7, 2026",
    reason: "Personal errand",
    status: "Rejected",
  },
];

const STAT_CARDS = [
  { label: "Total Shifts",          value: 3,  icon: Calendar, accent: "#2563eb", muted: "#dbeafe", mutedDark: "#1e3a8a" },
  { label: "Employees on Morning",  value: 5,  icon: Sun,      accent: "#d97706", muted: "#fef3c7", mutedDark: "#713f12" },
  { label: "Employees on Evening",  value: 3,  icon: Sunset,   accent: "#ea580c", muted: "#ffedd5", mutedDark: "#7c2d12" },
  { label: "Night Shift",           value: 2,  icon: Moon,     accent: "#7c3aed", muted: "#ede9fe", mutedDark: "#3b0764" },
  { label: "On Leave Today",        value: 1,  icon: Users,    accent: "#16a34a", muted: "#dcfce7", mutedDark: "#14532d" },
];

const STATUS_COLORS = {
  Pending:  { bg: "#e0e7ff", color: "#4338ca", darkBg: "#312e81", darkColor: "#a5b4fc" },
  Approved: { bg: "#dcfce7", color: "#15803d", darkBg: "#14532d", darkColor: "#86efac" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c", darkBg: "#7f1d1d", darkColor: "#fca5a5" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ── Sub-components ───────────────────────────────────────────────────────────

function ShiftBadge({ type, darkMode }) {
  const def = SHIFT_TYPES[type] || SHIFT_TYPES.Off;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: RADIUS.full,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
        background: darkMode ? def.darkBg : def.bg,
        color: darkMode ? def.darkColor : def.color,
        whiteSpace: "nowrap",
      }}
    >
      {def.label}
    </span>
  );
}

function StatCard({ card, darkMode }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const Icon = card.icon;
  return (
    <div
      style={{
        flex: "1 1 160px",
        minWidth: 140,
        background: surface.cardBg,
        borderRadius: RADIUS.xl,
        border: `1px solid ${surface.border}`,
        boxShadow: SHADOW.sm,
        padding: `${SPACING.md} ${SPACING.lg}`,
        display: "flex",
        flexDirection: "column",
        gap: GAP.sm,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.lg,
          background: darkMode ? card.mutedDark : card.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color={card.accent} strokeWidth={2} />
      </div>
      <div
        style={{
          fontSize: FONT_SIZE["2xl"],
          fontWeight: FONT_WEIGHT.bold,
          color: surface.text,
          lineHeight: 1,
        }}
      >
        {card.value}
      </div>
      <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>
        {card.label}
      </div>
    </div>
  );
}

// ── Assign Shift Modal ────────────────────────────────────────────────────────
function AssignShiftModal({ darkMode, onClose, onSave }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [dayIndex, setDayIndex] = useState(0);
  const [shift, setShift] = useState("Morning");

  const inputStyle = {
    width: "100%",
    padding: PADDING.input,
    borderRadius: RADIUS.md,
    border: `1px solid ${surface.inputBorder}`,
    background: surface.inputBg,
    color: surface.text,
    fontSize: FONT_SIZE.sm,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: surface.cardBg,
          borderRadius: RADIUS.xl,
          padding: PADDING.modal,
          width: 420,
          maxWidth: "92vw",
          boxShadow: SHADOW.modal,
          border: `1px solid ${surface.border}`,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg }}>
          <div>
            <h3 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>
              Assign Shift
            </h3>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 2 }}>
              Week of Jun 2 – 8, 2026
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: surface.subtext,
              padding: 4,
              borderRadius: RADIUS.md,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
          <div>
            <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 6 }}>
              Employee
            </label>
            <select value={employee} onChange={(e) => setEmployee(e.target.value)} style={inputStyle}>
              {EMPLOYEES.map((emp) => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 6 }}>
              Date
            </label>
            <select value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))} style={inputStyle}>
              {WEEK_DAYS.map((day, i) => (
                <option key={day} value={i}>{day}, {WEEK_DATES[i]}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 6 }}>
              Shift
            </label>
            <select value={shift} onChange={(e) => setShift(e.target.value)} style={inputStyle}>
              {Object.keys(SHIFT_TYPES).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: GAP.sm, marginTop: SPACING.lg, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: RADIUS.md,
              border: `1px solid ${surface.border}`,
              background: "transparent",
              color: surface.subtext,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(employee, dayIndex, shift); onClose(); }}
            style={{
              padding: "9px 20px",
              borderRadius: RADIUS.md,
              border: "none",
              background: COLORS.primary,
              color: COLORS.white,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.semibold,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shift Roster Tab ──────────────────────────────────────────────────────────
function ShiftRosterTab({ darkMode, roster, onAssign }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [showModal, setShowModal] = useState(false);

  const cellStyle = {
    padding: "10px 8px",
    textAlign: "center",
    borderBottom: `1px solid ${surface.border}`,
    borderRight: `1px solid ${surface.border}`,
    whiteSpace: "nowrap",
  };

  const thStyle = {
    ...cellStyle,
    background: surface.theadBg,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: surface.subtext,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div>
      {/* Week Navigator + Assign Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.md, flexWrap: "wrap", gap: GAP.sm }}>
        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
          <button
            style={{
              width: 32, height: 32, borderRadius: RADIUS.md,
              border: `1px solid ${surface.border}`,
              background: surface.cardBg, color: surface.subtext,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>
            Week: Jun 2 – 8, 2026
          </span>
          <button
            style={{
              width: 32, height: 32, borderRadius: RADIUS.md,
              border: `1px solid ${surface.border}`,
              background: surface.cardBg, color: surface.subtext,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: GAP.xs,
            padding: "8px 16px", borderRadius: RADIUS.md,
            border: "none", background: COLORS.primary,
            color: COLORS.white, fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.semibold, cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Assign Shift
        </button>
      </div>

      {/* Roster Grid */}
      <div
        style={{
          background: surface.cardBg,
          borderRadius: RADIUS.xl,
          border: `1px solid ${surface.border}`,
          boxShadow: SHADOW.sm,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: "left", paddingLeft: SPACING.md, minWidth: 140 }}>Employee</th>
              {WEEK_DAYS.map((day, i) => (
                <th key={day} style={{ ...thStyle, minWidth: 96 }}>
                  <div style={{ fontWeight: FONT_WEIGHT.bold }}>{day}</div>
                  <div style={{ fontWeight: FONT_WEIGHT.normal, fontSize: "0.65rem", marginTop: 2, opacity: 0.8 }}>{WEEK_DATES[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((emp) => (
              <tr key={emp}>
                {/* Employee name + avatar */}
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "left",
                    paddingLeft: SPACING.md,
                    background: surface.cardBg,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: RADIUS.full,
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
                        flexShrink: 0,
                      }}
                    >
                      {initials(emp)}
                    </div>
                    <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{emp}</span>
                  </div>
                </td>
                {roster[emp].map((shift, di) => (
                  <td key={di} style={{ ...cellStyle, background: surface.cardBg }}>
                    <ShiftBadge type={shift} darkMode={darkMode} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: GAP.md, marginTop: SPACING.md }}>
        {Object.entries(SHIFT_TYPES).map(([key, def]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
            <span
              style={{
                width: 10, height: 10, borderRadius: RADIUS.full,
                background: darkMode ? def.darkColor : def.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{key}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <AssignShiftModal
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
          onSave={(emp, dayIndex, shift) => onAssign(emp, dayIndex, shift)}
        />
      )}
    </div>
  );
}

// ── Shift Definitions Tab ─────────────────────────────────────────────────────
function ShiftDefinitionsTab({ darkMode }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: GAP.lg }}>
      {SHIFT_DEFINITIONS.map((def) => {
        const Icon = def.icon;
        return (
          <div
            key={def.id}
            style={{
              flex: "1 1 280px",
              minWidth: 260,
              background: surface.cardBg,
              borderRadius: RADIUS.xl,
              border: `1px solid ${surface.border}`,
              boxShadow: SHADOW.sm,
              overflow: "hidden",
            }}
          >
            {/* Accent bar */}
            <div style={{ height: 4, background: def.accent }} />

            <div style={{ padding: PADDING.card }}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: GAP.md, marginBottom: SPACING.md }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: RADIUS.lg,
                    background: darkMode ? def.accentMutedDark : def.accentMuted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={def.accent} strokeWidth={2} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{def.name}</h4>
                  <div style={{ fontSize: FONT_SIZE.sm, color: def.accent, fontWeight: FONT_WEIGHT.semibold, marginTop: 2 }}>{def.time}</div>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
                <InfoRow icon={Calendar} label="Working Days" value={def.days} surface={surface} accent={def.accent} />
                <InfoRow icon={Clock}    label="Grace Period"  value={def.grace} surface={surface} accent={def.accent} />
                <InfoRow icon={Users}    label="Employees"     value={`${def.count} assigned`} surface={surface} accent={def.accent} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, surface, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
        <Icon size={14} color={surface.subtext} strokeWidth={2} />
        <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{label}</span>
      </div>
      <span style={{ fontSize: FONT_SIZE.xs, color: surface.text, fontWeight: FONT_WEIGHT.semibold }}>{value}</span>
    </div>
  );
}

// ── Swap Requests Tab ─────────────────────────────────────────────────────────
function SwapRequestsTab({ darkMode, swapRequests, onUpdateStatus }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const thStyle = {
    padding: PADDING.tableHeader,
    textAlign: "left",
    background: surface.theadBg,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: surface.subtext,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${surface.border}`,
  };

  const tdStyle = {
    padding: PADDING.tableCell,
    fontSize: FONT_SIZE.sm,
    color: surface.text,
    borderBottom: `1px solid ${surface.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        background: surface.cardBg,
        borderRadius: RADIUS.xl,
        border: `1px solid ${surface.border}`,
        boxShadow: SHADOW.sm,
        overflowX: "auto",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
        <thead>
          <tr>
            {["Requested By", "With Employee", "Original Shift", "Swap Shift", "Date", "Reason", "Status", "Actions"].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {swapRequests.map((req) => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.Pending;
            return (
              <tr key={req.id}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: RADIUS.full,
                        background: COLORS.primaryLight, color: COLORS.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0,
                      }}
                    >
                      {initials(req.requestedBy)}
                    </div>
                    {req.requestedBy}
                  </div>
                </td>
                <td style={tdStyle}>{req.withEmployee}</td>
                <td style={tdStyle}><ShiftBadge type={req.originalShift} darkMode={darkMode} /></td>
                <td style={tdStyle}><ShiftBadge type={req.swapShift} darkMode={darkMode} /></td>
                <td style={{ ...tdStyle, color: surface.subtext }}>{req.date}</td>
                <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{req.reason}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: RADIUS.full,
                      fontSize: FONT_SIZE.xs,
                      fontWeight: FONT_WEIGHT.semibold,
                      background: darkMode ? sc.darkBg : sc.bg,
                      color: darkMode ? sc.darkColor : sc.color,
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {req.status === "Pending" ? (
                    <div style={{ display: "flex", gap: GAP.xs }}>
                      <button
                        onClick={() => onUpdateStatus(req.id, "Approved")}
                        title="Approve"
                        style={{
                          width: 28, height: 28, borderRadius: RADIUS.md,
                          border: "none", background: darkMode ? "#14532d" : COLORS.successLight,
                          color: COLORS.success, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(req.id, "Rejected")}
                        title="Reject"
                        style={{
                          width: 28, height: 28, borderRadius: RADIUS.md,
                          border: "none", background: darkMode ? "#7f1d1d" : "#fee2e2",
                          color: COLORS.error, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <XCircle size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const ShiftManagement = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab] = useState("roster");
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [swapRequests, setSwapRequests] = useState(SWAP_REQUESTS_INITIAL);

  const handleAssignShift = (employee, dayIndex, shift) => {
    setRoster((prev) => {
      const updated = { ...prev };
      const row = [...updated[employee]];
      row[dayIndex] = shift;
      updated[employee] = row;
      return updated;
    });
  };

  const handleUpdateSwapStatus = (id, status) => {
    setSwapRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const TABS = [
    { id: "roster",      label: "Shift Roster",      icon: Calendar  },
    { id: "definitions", label: "Shift Definitions",  icon: Clock     },
    { id: "swaps",       label: "Swap Requests",      icon: RefreshCw },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: surface.pageBg,
        padding: PADDING.container,
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: SPACING.lg }}>
        <h1
          style={{
            margin: 0,
            fontSize: FONT_SIZE.xl,
            fontWeight: FONT_WEIGHT.bold,
            color: surface.text,
          }}
        >
          Shift Management
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>
          Manage employee shifts, rosters, and swap requests
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: GAP.md,
          marginBottom: SPACING.lg,
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} card={card} darkMode={darkMode} />
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: `2px solid ${surface.border}`,
          marginBottom: SPACING.lg,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: GAP.xs,
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                marginBottom: -2,
                color: active ? COLORS.primary : surface.subtext,
                fontSize: FONT_SIZE.sm,
                fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "roster" && (
        <ShiftRosterTab darkMode={darkMode} roster={roster} onAssign={handleAssignShift} />
      )}
      {activeTab === "definitions" && (
        <ShiftDefinitionsTab darkMode={darkMode} />
      )}
      {activeTab === "swaps" && (
        <SwapRequestsTab
          darkMode={darkMode}
          swapRequests={swapRequests}
          onUpdateStatus={handleUpdateSwapStatus}
        />
      )}
    </div>
  );
};

export default ShiftManagement;
