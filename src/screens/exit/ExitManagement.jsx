import { useMemo, useState } from "react";
import {
  UserMinus, Clock, CheckCircle, AlertCircle, ChevronRight,
  Check, X, FileText, Download, Printer, User, Briefcase,
  Calendar, ClipboardList, DollarSign, Shield, Laptop,
  BookOpen, CreditCard, MessageSquare, RefreshCw,
} from "lucide-react";

import { COLORS }                              from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT }              from "../../theme/fonts";
import { SPACING, GAP, PADDING }               from "../../theme/spacing";
import { RADIUS, SHADOW }                      from "../../theme/sizes";
import { useExits, useUpdateExit }             from "../../queries/useHr";
import { useToast }                            from "../../components/ui/Toast";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatLWD = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// ── Display templates ─────────────────────────────────────────────────────────

const CLEARANCE_ITEMS = [
  { id: 1, label: "IT Assets Return",    icon: Laptop,       owner: "IT Department",    dueDate: "25 Jun 2026", status: "Completed",   checklistKey: "itAssets"  },
  { id: 2, label: "Access Revocation",   icon: Shield,       owner: "IT / Security",    dueDate: "25 Jun 2026", status: "Completed"                              },
  { id: 3, label: "Library Books",       icon: BookOpen,     owner: "Admin",            dueDate: "28 Jun 2026", status: "Pending",     checklistKey: "knowledge" },
  { id: 4, label: "Finance Clearance",   icon: CreditCard,   owner: "Finance Dept",     dueDate: "28 Jun 2026", status: "Pending",     checklistKey: "finance"   },
  { id: 5, label: "HR Documentation",    icon: FileText,     owner: "HR Department",    dueDate: "29 Jun 2026", status: "In Progress", checklistKey: "hrDocs"    },
  { id: 6, label: "Exit Interview",      icon: MessageSquare,owner: "HR Department",    dueDate: "30 Jun 2026", status: "Pending"                                },
];

const FNF_DETAILS = {
  name: "Ramesh Kumar",
  dept: "IT",
  lwdDisplay: "30 Jun 2026",
  items: [
    { label: "Basic Salary",              amount: 65000,  sign:  1, note: "Pro-rated for 30 days"         },
    { label: "Notice Period Recovery",    amount: 0,      sign: -1, note: "Fully served"                   },
    { label: "Earned Leave Encashment",   amount: 8125,   sign:  1, note: "6.5 days @ ₹1,250/day"         },
    { label: "Gratuity",                  amount: 15000,  sign:  1, note: "5 years of service"             },
    { label: "Other Deductions",          amount: 1200,   sign: -1, note: "Miscellaneous dues"             },
  ],
  net: 86925,
};

const DEPT_COLORS = {
  IT:        { bg: COLORS.primaryMuted,  text: COLORS.primary  },
  HR:        { bg: COLORS.purpleMuted,   text: COLORS.purple   },
  Finance:   { bg: COLORS.successLight,  text: COLORS.success  },
  Marketing: { bg: COLORS.infoLight,     text: COLORS.info     },
  Operations:{ bg: COLORS.orangeLight,   text: COLORS.orange   },
};

const STAGE_COLORS = {
  "Clearance In Progress": { bg: COLORS.infoLight,    text: COLORS.info    },
  "Notice Period":          { bg: COLORS.warningLight, text: COLORS.warning },
  "Document Collection":    { bg: COLORS.purpleMuted,  text: COLORS.purple  },
  "Full & Final Pending":   { bg: COLORS.dangerMuted,  text: COLORS.danger  },
};

const STATUS_COLORS = {
  Completed:    { bg: COLORS.successLight, text: COLORS.success  },
  "In Progress":{ bg: COLORS.infoLight,    text: COLORS.info     },
  Pending:      { bg: COLORS.warningLight, text: COLORS.warning  },
};

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ── Sub-components ────────────────────────────────────────────────────────────

const Badge = ({ label, bg, text }) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: RADIUS.full,
    background: bg,
    color: text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const Avatar = ({ name, size = 34 }) => {
  const colors = [COLORS.primary, COLORS.purple, COLORS.info, COLORS.warning, COLORS.orange];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: RADIUS.full,
      background: colors[idx], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
      flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
};

const ActionBtn = ({ label, color, bg, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "5px 12px",
      borderRadius: RADIUS.md,
      border: `1px solid ${color}`,
      background: bg,
      color: color,
      fontSize: FONT_SIZE.xs,
      fontWeight: FONT_WEIGHT.semibold,
      cursor: "pointer",
      transition: "opacity 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
  >
    {label}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ExitManagement = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab] = useState("active");
  const [remarks, setRemarks]     = useState({});

  const { data: exits = [] } = useExits();
  const updateExit           = useUpdateExit();
  const { show }             = useToast();

  const ACTIVE_EXITS = useMemo(
    () =>
      exits
        .filter((e) => e.status === "Active")
        .map((e) => ({
          id: e.id,
          name: e.name,
          dept: e.dept,
          lwdDisplay: formatLWD(e.lastWorkingDay),
          notice: `${e.noticeDays} days`,
          type: e.type,
          stage: e.stage,
          checklist: e.checklist,
        })),
    [exits],
  );

  const EXIT_REQUESTS = useMemo(
    () =>
      exits
        .filter((e) => e.status === "Request")
        .map((e) => ({
          id: e.id,
          name: e.name,
          dept: e.dept,
          submitDate: "—",
          requestedLWD: formatLWD(e.lastWorkingDay),
          reason: e.reason,
          status: "Pending",
        })),
    [exits],
  );

  const completedCount = exits.filter((e) => e.status === "Completed").length;
  const clearancePendingCount = ACTIVE_EXITS.filter(
    (e) => e.checklist && Object.values(e.checklist).some((v) => !v),
  ).length;

  // Employee shown on Clearance / F&F tabs — first active exit in clearance, else first active
  const clearanceExit =
    ACTIVE_EXITS.find((e) => e.stage === "Clearance In Progress") || ACTIVE_EXITS[0];

  const clearanceItems = CLEARANCE_ITEMS.map((item) =>
    item.checklistKey && clearanceExit?.checklist
      ? { ...item, status: clearanceExit.checklist[item.checklistKey] ? "Completed" : "Pending" }
      : item,
  );

  const handleApprove = async (req) => {
    try {
      await updateExit.mutateAsync({ id: req.id, status: "Active", stage: "Notice Period" });
      show(`Exit request for ${req.name} approved`, "success");
    } catch {
      show("Failed to approve exit request", "error");
    }
  };

  const handleReject = async (req) => {
    try {
      await updateExit.mutateAsync({ id: req.id, status: "Completed", stage: "Rejected" });
      show(`Exit request for ${req.name} rejected`, "success");
    } catch {
      show("Failed to reject exit request", "error");
    }
  };

  const TABS = [
    { key: "active",    label: "Active Exits"        },
    { key: "requests",  label: "Exit Requests"        },
    { key: "clearance", label: "Clearance Checklist"  },
    { key: "fnf",       label: "Full & Final"          },
  ];

  const STAT_CARDS = [
    { label: "Total Exits This Year", value: exits.length,          icon: UserMinus,    color: COLORS.primary,  bg: COLORS.primaryMuted  },
    { label: "In Progress",           value: ACTIVE_EXITS.length,   icon: RefreshCw,    color: COLORS.warning,  bg: COLORS.warningLight  },
    { label: "Clearance Pending",     value: clearancePendingCount, icon: AlertCircle,  color: COLORS.orange,   bg: COLORS.orangeLight   },
    { label: "Completed",             value: completedCount,        icon: CheckCircle,  color: COLORS.success,  bg: COLORS.successLight  },
  ];

  // Shared table column header style
  const thStyle = {
    padding: PADDING.tableHeader,
    textAlign: "left",
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: surface.subtext,
    background: surface.theadBg,
    borderBottom: `1px solid ${surface.border}`,
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: PADDING.tableCell,
    fontSize: FONT_SIZE.sm,
    color: surface.text,
    borderBottom: `1px solid ${surface.border}`,
    verticalAlign: "middle",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: surface.pageBg,
      padding: SPACING.lg,
      fontFamily: "'Inter', sans-serif",
      boxSizing: "border-box",
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: SPACING.lg }}>
        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: RADIUS.lg,
            background: COLORS.dangerMuted,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <UserMinus size={18} color={COLORS.danger} />
          </div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>
            Exit Management
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext, paddingLeft: 44 }}>
          Manage employee offboarding, clearances, and full &amp; final settlements
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: GAP.md,
        marginBottom: SPACING.lg,
      }}>
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: surface.cardBg,
              borderRadius: RADIUS.xl,
              border: `1px solid ${surface.border}`,
              boxShadow: SHADOW.sm,
              padding: SPACING.md,
              display: "flex",
              alignItems: "center",
              gap: GAP.md,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: RADIUS.lg,
                background: card.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1.1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 2 }}>
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: `2px solid ${surface.border}`,
        marginBottom: SPACING.lg,
        overflowX: "auto",
      }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                background: "transparent",
                color: active ? COLORS.primary : surface.subtext,
                fontSize: FONT_SIZE.sm,
                fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -2,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Active Exits ── */}
      {activeTab === "active" && (
        <div style={{
          background: surface.cardBg,
          borderRadius: RADIUS.xl,
          border: `1px solid ${surface.border}`,
          boxShadow: SHADOW.sm,
          overflow: "hidden",
        }}>
          <div style={{ padding: `${SPACING.md} ${SPACING.md} 0`, marginBottom: SPACING.sm }}>
            <h2 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>
              Active Exits
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>
              Employees currently in the offboarding process
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Employee", "Department", "Last Working Day", "Notice Period", "Exit Type", "Stage", "Actions"].map((col) => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVE_EXITS.map((emp, i) => {
                  const deptC = DEPT_COLORS[emp.dept] || { bg: COLORS.gray100, text: COLORS.gray600 };
                  const stageC = STAGE_COLORS[emp.stage] || { bg: COLORS.gray100, text: COLORS.gray600 };
                  return (
                    <tr
                      key={emp.id}
                      style={{ background: i % 2 === 1 && !darkMode ? COLORS.gray50 : "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 1 && !darkMode ? COLORS.gray50 : "transparent")}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                          <Avatar name={emp.name} />
                          <span style={{ fontWeight: FONT_WEIGHT.medium }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <Badge label={emp.dept} bg={deptC.bg} text={deptC.text} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: FONT_WEIGHT.medium }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={14} color={surface.subtext} />
                          {emp.lwdDisplay}
                        </div>
                      </td>
                      <td style={tdStyle}>{emp.notice}</td>
                      <td style={tdStyle}>
                        <Badge
                          label={emp.type}
                          bg={emp.type === "Contract End" ? COLORS.purpleMuted : COLORS.infoLight}
                          text={emp.type === "Contract End" ? COLORS.purple : COLORS.info}
                        />
                      </td>
                      <td style={tdStyle}>
                        <Badge label={emp.stage} bg={stageC.bg} text={stageC.text} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: GAP.xs }}>
                          <ActionBtn
                            label="View"
                            color={COLORS.primary}
                            bg={COLORS.primaryMuted}
                            onClick={() => {}}
                          />
                          <ActionBtn
                            label="Track"
                            color={COLORS.info}
                            bg={COLORS.infoLight}
                            onClick={() => {}}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Exit Requests ── */}
      {activeTab === "requests" && (
        <div style={{
          background: surface.cardBg,
          borderRadius: RADIUS.xl,
          border: `1px solid ${surface.border}`,
          boxShadow: SHADOW.sm,
          overflow: "hidden",
        }}>
          <div style={{ padding: `${SPACING.md} ${SPACING.md} 0`, marginBottom: SPACING.sm }}>
            <h2 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>
              Pending Exit Requests
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>
              Resignation requests awaiting HR approval
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Employee", "Submit Date", "Requested LWD", "Reason", "Status", "Actions"].map((col) => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXIT_REQUESTS.map((req, i) => {
                  const deptC = DEPT_COLORS[req.dept] || { bg: COLORS.gray100, text: COLORS.gray600 };
                  return (
                    <tr
                      key={req.id}
                      style={{ background: i % 2 === 1 && !darkMode ? COLORS.gray50 : "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 1 && !darkMode ? COLORS.gray50 : "transparent")}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                          <Avatar name={req.name} />
                          <div>
                            <div style={{ fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{req.name}</div>
                            <Badge label={req.dept} bg={deptC.bg} text={deptC.text} />
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: surface.subtext }}>{req.submitDate}</td>
                      <td style={{ ...tdStyle, fontWeight: FONT_WEIGHT.medium }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={14} color={surface.subtext} />
                          {req.requestedLWD}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 260 }}>
                        <span
                          title={req.reason}
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 240,
                            color: surface.subtext,
                            fontSize: FONT_SIZE.xs,
                          }}
                        >
                          {req.reason}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <Badge label={req.status} bg={COLORS.warningLight} text={COLORS.warning} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: GAP.xs }}>
                          <ActionBtn
                            label="Approve"
                            color={COLORS.success}
                            bg={COLORS.successLight}
                            onClick={() => handleApprove(req)}
                          />
                          <ActionBtn
                            label="Reject"
                            color={COLORS.danger}
                            bg={COLORS.dangerMuted}
                            onClick={() => handleReject(req)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Clearance Checklist ── */}
      {activeTab === "clearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
          {/* Employee info banner */}
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS.xl,
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.sm,
            padding: SPACING.md,
            display: "flex",
            alignItems: "center",
            gap: GAP.md,
          }}>
            <Avatar name={clearanceExit?.name || "—"} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: surface.text }}>
                {clearanceExit?.name || "No active exit"}
              </div>
              <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 2 }}>
                {clearanceExit?.dept || "—"} Department &nbsp;·&nbsp; Last Working Day: {clearanceExit?.lwdDisplay || "—"}
              </div>
            </div>
            <div style={{ display: "flex", gap: GAP.xs }}>
              <Badge label={clearanceExit?.stage || "—"} bg={COLORS.infoLight} text={COLORS.info} />
            </div>
          </div>

          {/* Checklist items */}
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS.xl,
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.sm,
            overflow: "hidden",
          }}>
            <div style={{ padding: `${SPACING.md} ${SPACING.md} 0`, marginBottom: SPACING.sm }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>
                Clearance Checklist
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                {clearanceItems.filter(i => i.status === "Completed").length} of {clearanceItems.length} items completed
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ padding: `0 ${SPACING.md}`, marginBottom: SPACING.md }}>
              <div style={{
                width: "100%", height: 6,
                background: surface.border,
                borderRadius: RADIUS.full,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.round((clearanceItems.filter(i => i.status === "Completed").length / clearanceItems.length) * 100)}%`,
                  background: COLORS.success,
                  borderRadius: RADIUS.full,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {clearanceItems.map((item, idx) => {
                const Icon = item.icon;
                const sc = STATUS_COLORS[item.status] || { bg: COLORS.gray100, text: COLORS.gray600 };
                const isCompleted = item.status === "Completed";
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: GAP.md,
                      padding: `${SPACING.sm} ${SPACING.md}`,
                      borderTop: idx > 0 ? `1px solid ${surface.border}` : "none",
                    }}
                  >
                    {/* Status indicator */}
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: RADIUS.full,
                      border: `2px solid ${isCompleted ? COLORS.success : item.status === "In Progress" ? COLORS.info : surface.border}`,
                      background: isCompleted ? COLORS.successLight : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {isCompleted
                        ? <Check size={14} color={COLORS.success} strokeWidth={2.5} />
                        : item.status === "In Progress"
                          ? <RefreshCw size={13} color={COLORS.info} />
                          : <div style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: surface.border }} />
                      }
                    </div>

                    {/* Icon + Info */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: RADIUS.lg,
                      background: darkMode ? COLORS.dark.inputBg : COLORS.gray100,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={16} color={surface.subtext} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, flexWrap: "wrap" }}>
                        <span style={{
                          fontWeight: FONT_WEIGHT.medium,
                          fontSize: FONT_SIZE.sm,
                          color: isCompleted ? surface.subtext : surface.text,
                          textDecoration: isCompleted ? "line-through" : "none",
                        }}>
                          {item.label}
                        </span>
                        <Badge label={item.status} bg={sc.bg} text={sc.text} />
                      </div>
                      <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 3, display: "flex", gap: 16 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={11} /> {item.owner}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} /> Due: {item.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Remarks input */}
                    <div style={{ flexShrink: 0, minWidth: 200 }}>
                      <input
                        type="text"
                        placeholder="Add remark..."
                        value={remarks[item.id] || ""}
                        onChange={(e) => setRemarks((r) => ({ ...r, [item.id]: e.target.value }))}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "6px 10px",
                          fontSize: FONT_SIZE.xs,
                          border: `1px solid ${surface.inputBorder}`,
                          borderRadius: RADIUS.md,
                          background: surface.inputBg,
                          color: surface.text,
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Full & Final ── */}
      {activeTab === "fnf" && (
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.md, maxWidth: 640 }}>
          {/* Employee header */}
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS.xl,
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.sm,
            padding: SPACING.md,
            display: "flex",
            alignItems: "center",
            gap: GAP.md,
          }}>
            <Avatar name={FNF_DETAILS.name} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: surface.text }}>
                {FNF_DETAILS.name}
              </div>
              <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 2 }}>
                {FNF_DETAILS.dept} Department &nbsp;·&nbsp; LWD: {FNF_DETAILS.lwdDisplay}
              </div>
            </div>
            <Badge label="Settlement Pending" bg={COLORS.warningLight} text={COLORS.warning} />
          </div>

          {/* Settlement card */}
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS.xl,
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.sm,
            overflow: "hidden",
          }}>
            <div style={{
              padding: SPACING.md,
              borderBottom: `1px solid ${surface.border}`,
              display: "flex",
              alignItems: "center",
              gap: GAP.sm,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: RADIUS.lg,
                background: COLORS.successLight,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <DollarSign size={16} color={COLORS.success} />
              </div>
              <div>
                <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: surface.text }}>
                  Full &amp; Final Settlement
                </div>
                <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                  Calculated settlement breakdown
                </div>
              </div>
            </div>

            <div style={{ padding: 0 }}>
              {FNF_DETAILS.items.map((item, idx) => {
                const isDeduction = item.sign === -1 && item.amount > 0;
                const amtColor = isDeduction ? COLORS.danger : COLORS.success;
                const amtPrefix = isDeduction ? "-₹" : item.sign === 1 && idx > 0 ? "+₹" : "₹";
                return (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: `${SPACING.sm} ${SPACING.md}`,
                      borderBottom: `1px solid ${surface.border}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, marginTop: 2 }}>
                        {item.note}
                      </div>
                    </div>
                    <div style={{
                      fontSize: FONT_SIZE.md,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: idx === 0 ? surface.text : amtColor,
                    }}>
                      {idx === 0
                        ? `₹${item.amount.toLocaleString("en-IN")}`
                        : `${amtPrefix}${item.amount.toLocaleString("en-IN")}`
                      }
                    </div>
                  </div>
                );
              })}

              {/* Net Settlement */}
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: `${SPACING.md} ${SPACING.md}`,
                background: COLORS.successLight,
                borderTop: `2px solid ${COLORS.success}`,
              }}>
                <div style={{ flex: 1, fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, color: COLORS.success }}>
                  Net Settlement Amount
                </div>
                <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.success }}>
                  ₹{FNF_DETAILS.net.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: SPACING.md,
              borderTop: `1px solid ${surface.border}`,
              display: "flex",
              gap: GAP.sm,
              flexWrap: "wrap",
            }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: GAP.xs,
                  padding: "10px 20px",
                  borderRadius: RADIUS.lg,
                  border: "none",
                  background: COLORS.primary,
                  color: "#fff",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.semibold,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
              >
                <FileText size={15} />
                Generate Settlement Letter
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: GAP.xs,
                  padding: "10px 18px",
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${surface.border}`,
                  background: surface.inputBg,
                  color: surface.text,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  cursor: "pointer",
                }}
              >
                <Download size={15} />
                Download PDF
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: GAP.xs,
                  padding: "10px 18px",
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${surface.border}`,
                  background: surface.inputBg,
                  color: surface.text,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  cursor: "pointer",
                }}
              >
                <Printer size={15} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExitManagement;
