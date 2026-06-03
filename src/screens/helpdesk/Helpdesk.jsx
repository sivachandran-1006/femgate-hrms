import { useState } from "react";
import {
  Ticket, Plus, Search, Eye, X, CheckCircle2, Clock,
  AlertCircle, BarChart2, ChevronDown, Filter,
  TrendingUp, ArrowUpRight, MessageSquare, RefreshCw,
  CheckCheck, Activity, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

import { COLORS }                              from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }       from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE, TRANSITION } from "../../theme/sizes";
import { getAvatarColor }                      from "../../utils/helpers";
import { useToast }                            from "../../components/ui/Toast";
import { Stack, Group, SimpleGrid }            from "@mantine/core";
import { AppModal }  from "../../components/ui/AppModal";
import { AppInput }  from "../../components/ui/AppInput";
import { AppButton } from "../../components/ui/AppButton";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TICKETS = [
  { id: "TKT001", subject: "Laptop not booting",               category: "Hardware",           raisedBy: "Mani",        priority: "High",   status: "Open",        createdDate: "2026-05-30", description: "The laptop does not boot. Power button shows no response. Needs immediate hardware inspection."           },
  { id: "TKT002", subject: "VPN access required",              category: "Access Request",     raisedBy: "Hari",        priority: "Medium", status: "In Progress", createdDate: "2026-05-29", description: "Need VPN access to connect to the office network while working remotely."                                  },
  { id: "TKT003", subject: "Software installation - VS Code",  category: "Software",           raisedBy: "Santhosh",    priority: "Low",    status: "Resolved",    createdDate: "2026-05-28", description: "Request to install Visual Studio Code on my work laptop for development purposes."                        },
  { id: "TKT004", subject: "Monitor display issue",            category: "Hardware",           raisedBy: "Suriya",      priority: "Medium", status: "Pending",     createdDate: "2026-05-28", description: "External monitor shows flickering and distorted colors after the recent OS update."                        },
  { id: "TKT005", subject: "New employee setup for Arjun",     category: "New Employee Setup", raisedBy: "Big Kundi",   priority: "High",   status: "In Progress", createdDate: "2026-05-27", description: "New employee Arjun Kumar joining on 2026-06-02. Requires laptop, email, software licenses."              },
  { id: "TKT006", subject: "Internet slow in Finance floor",   category: "Network",            raisedBy: "Safeer",      priority: "High",   status: "Open",        createdDate: "2026-05-27", description: "Finance department floor experiencing very slow internet speeds since yesterday morning."                 },
  { id: "TKT007", subject: "Printer not working",              category: "Hardware",           raisedBy: "Small Kundi", priority: "Low",    status: "Resolved",    createdDate: "2026-05-25", description: "The shared printer on 3rd floor is not responding to print jobs. Paper jam reported."                   },
  { id: "TKT008", subject: "Email password reset",             category: "Access Request",     raisedBy: "Suganthan",   priority: "Medium", status: "Closed",      createdDate: "2026-05-24", description: "Unable to log in to corporate email. Password reset required urgently."                                   },
  { id: "TKT009", subject: "Antivirus license renewal",        category: "Software",           raisedBy: "Aravinth",    priority: "Medium", status: "Pending",     createdDate: "2026-05-23", description: "Antivirus license expiring in 3 days. Needs renewal before expiry."                                      },
  { id: "TKT010", subject: "Zoom not connecting to audio",     category: "Software",           raisedBy: "Vignesh",     priority: "Low",    status: "Resolved",    createdDate: "2026-05-22", description: "Audio device not detected during Zoom calls. Tried reinstalling drivers, issue persists."               },
  { id: "TKT011", subject: "USB ports not working",            category: "Hardware",           raisedBy: "Sabari",      priority: "High",   status: "Open",        createdDate: "2026-05-21", description: "All USB ports on the desktop suddenly stopped working. Cannot connect mouse or external drives."         },
  { id: "TKT012", subject: "Office 365 license missing",       category: "Software",           raisedBy: "P Santhosh",  priority: "High",   status: "In Progress", createdDate: "2026-05-20", description: "Office 365 subscription expired. Unable to use Word, Excel, and Outlook for work tasks."               },
];

const PRIORITY_STYLE = {
  High:   { bg: COLORS.dangerMuted,  text: COLORS.danger,  dot: COLORS.danger  },
  Medium: { bg: COLORS.warningLight, text: COLORS.warning, dot: COLORS.warning },
  Low:    { bg: COLORS.primaryMuted, text: COLORS.primary, dot: COLORS.primary },
};

const STATUS_STYLE = {
  Open:        { bg: COLORS.dangerMuted,  text: COLORS.danger,  dot: COLORS.danger  },
  "In Progress":{ bg: COLORS.warningLight,text: COLORS.warning, dot: COLORS.warning },
  Pending:     { bg: COLORS.infoLight,    text: COLORS.info,    dot: COLORS.info    },
  Resolved:    { bg: COLORS.successLight, text: COLORS.success, dot: COLORS.success },
  Closed:      { bg: COLORS.gray50,       text: COLORS.gray700, dot: COLORS.gray700 },
};

const CATEGORY_COLORS = {
  Hardware:           { bg: COLORS.dangerMuted,  text: COLORS.danger  },
  Software:           { bg: COLORS.primaryMuted, text: COLORS.primary },
  Network:            { bg: COLORS.purpleMuted,  text: COLORS.purple  },
  "Access Request":   { bg: COLORS.infoLight,    text: COLORS.info    },
  "New Employee Setup":{ bg: COLORS.successLight,text: COLORS.success },
};

const CATEGORIES  = ["All", "Hardware", "Software", "Network", "Access Request", "New Employee Setup"];
const STATUSES    = ["All", "Open", "In Progress", "Pending", "Resolved", "Closed"];
const PRIORITIES  = ["High", "Medium", "Low"];
const MODAL_CATS  = ["Hardware", "Software", "Network", "Access Request", "New Employee Setup"];

const TREND_DATA = [
  { day: "Mon", opened: 3, resolved: 2 },
  { day: "Tue", opened: 5, resolved: 4 },
  { day: "Wed", opened: 2, resolved: 3 },
  { day: "Thu", opened: 4, resolved: 2 },
  { day: "Fri", opened: 6, resolved: 5 },
  { day: "Sat", opened: 1, resolved: 2 },
];

const SLA_DATA = [
  { category: "Hardware",            total: 5, resolved: 3, breached: 1 },
  { category: "Software",            total: 4, resolved: 3, breached: 0 },
  { category: "Network",             total: 1, resolved: 0, breached: 1 },
  { category: "Access Request",      total: 2, resolved: 1, breached: 0 },
  { category: "New Employee Setup",  total: 1, resolved: 0, breached: 0 },
];

const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// ── Component ─────────────────────────────────────────────────────────────────

export default function Helpdesk({ darkMode = false }) {
  const { show } = useToast();
  const surface  = darkMode ? COLORS.dark : COLORS.light;

  const [tickets, setTickets]           = useState(MOCK_TICKETS);
  const [activeTab, setActiveTab]       = useState("All Tickets");
  const [searchQuery, setSearchQuery]   = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewTicket, setViewTicket]     = useState(null);
  const [currentPage, setCurrentPage]  = useState(1);
  const ROWS = 6;

  const [newTicket, setNewTicket] = useState({ subject: "", category: "Hardware", priority: "Medium", description: "" });

  // ── Stats ──
  const total      = tickets.length;
  const openCount  = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const resolved   = tickets.filter((t) => t.status === "Resolved").length;
  const pending    = tickets.filter((t) => t.status === "Pending").length;
  const highPrio   = tickets.filter((t) => t.priority === "High").length;

  const kpis = [
    { label: "Total Tickets",   value: total,      icon: Ticket,      color: COLORS.primary, bg: COLORS.primaryMuted, sub: "All time"          },
    { label: "Open",            value: openCount,  icon: AlertCircle, color: COLORS.danger,  bg: COLORS.dangerMuted,  sub: "Needs attention"   },
    { label: "In Progress",     value: inProgress, icon: RefreshCw,   color: COLORS.warning, bg: COLORS.warningLight, sub: "Being worked on"   },
    { label: "Resolved",        value: resolved,   icon: CheckCheck,  color: COLORS.success, bg: COLORS.successLight, sub: "Closed successfully"},
    { label: "High Priority",   value: highPrio,   icon: Zap,         color: COLORS.orange,  bg: COLORS.orangeLight,  sub: "Urgent tickets"    },
  ];

  // ── Category pie ──
  const catPie = MODAL_CATS.map((c) => ({
    name: c, value: tickets.filter((t) => t.category === c).length,
    color: CATEGORY_COLORS[c]?.text || COLORS.primary,
  })).filter((d) => d.value > 0);

  // ── Filter ──
  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch   = !q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.raisedBy.toLowerCase().includes(q);
    const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchStatus   = statusFilter   === "All" || t.status   === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchTab      = activeTab === "All Tickets" || (activeTab === "My Tickets" && t.raisedBy === "Mani");
    return matchSearch && matchCategory && matchStatus && matchPriority && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const paginated  = filtered.slice((currentPage - 1) * ROWS, currentPage * ROWS);

  const handleRaise = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
    const id = `TKT${String(tickets.length + 1).padStart(3, "0")}`;
    setTickets([{ id, ...newTicket, raisedBy: "Mani", status: "Open", createdDate: new Date().toISOString().split("T")[0] }, ...tickets]);
    show(`Ticket ${id} raised — IT team will respond shortly`, "success");
    setNewTicket({ subject: "", category: "Hardware", priority: "Medium", description: "" });
    setShowRaiseModal(false);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg,
    padding: PADDING.input, fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base, background: surface.inputBg,
    color: surface.text, outline: "none",
  };

  const thStyle = {
    padding: PADDING.tableHeader,
    textAlign: "left",
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
    background: surface.theadBg,
    borderBottom: `2px solid ${surface.border}`,
  };

  const TABS = ["All Tickets", "My Tickets", "Analytics", "SLA Report"];

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[5], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>IT Helpdesk</h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: surface.subtext }}>Manage and track IT support tickets</p>
        </div>
        <button
          onClick={() => setShowRaiseModal(true)}
          style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: PADDING.btn, background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}
        >
          <Plus size={ICON_SIZE.sm} /> Raise Ticket
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[4]}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[3] }}>
              <div style={{ width: 40, height: 40, borderRadius: RADIUS.lg, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon size={ICON_SIZE.md} color={k.color} />
              </div>
              <span style={{ padding: "2px 8px", borderRadius: RADIUS.full, fontSize: 10, fontWeight: FONT_WEIGHT.bold, background: k.bg, color: k.color }}>LIVE</span>
            </div>
            <p style={{ margin: "0 0 2px", fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: "0 0 1px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: GAP.xs, marginBottom: SPACING[5], background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: GAP.xs, width: "fit-content" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => { setActiveTab(t); setCurrentPage(1); }} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: `${GAP.sm}px ${SPACING[4]}px`,
            borderRadius: RADIUS.md, border: "none", cursor: "pointer",
            fontSize: FONT_SIZE.base, fontWeight: activeTab === t ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
            fontFamily: FONT_FAMILY.base,
            background: activeTab === t ? COLORS.primary : "transparent",
            color: activeTab === t ? COLORS.white : surface.subtext,
            transition: TRANSITION.fast,
          }}>
            {t === "Analytics" && <BarChart2 size={13} />}
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TICKET TABLE (All Tickets / My Tickets)
      ══════════════════════════════════════════ */}
      {(activeTab === "All Tickets" || activeTab === "My Tickets") && (
        <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}`, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={15} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search tickets, ID, employee…" value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: SPACING[8] }} />
            </div>
            {[
              { label: "Category", value: categoryFilter, set: setCategoryFilter, options: CATEGORIES },
              { label: "Status",   value: statusFilter,   set: setStatusFilter,   options: STATUSES   },
              { label: "Priority", value: priorityFilter, set: setPriorityFilter, options: ["All", ...PRIORITIES] },
            ].map(({ label, value, set, options }) => (
              <div key={label} style={{ position: "relative" }}>
                <select value={value} onChange={(e) => { set(e.target.value); setCurrentPage(1); }}
                  style={{ ...inputStyle, width: "auto", minWidth: 140, paddingRight: SPACING[8], cursor: "pointer" }}>
                  {options.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label}` : o}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: SPACING[2], top: "50%", transform: "translateY(-50%)", color: surface.subtext, pointerEvents: "none" }} />
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: GAP.sm }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
              {(categoryFilter !== "All" || statusFilter !== "All" || priorityFilter !== "All" || searchQuery) && (
                <button onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); setPriorityFilter("All"); setSearchQuery(""); setCurrentPage(1); }}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: "transparent", color: COLORS.danger, fontSize: FONT_SIZE.xs, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}>
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
              <thead>
                <tr>
                  {["Ticket ID", "Subject", "Category", "Raised By", "Priority", "Status", "Created", "Action"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: `${SPACING[10]}px`, color: COLORS.gray400, fontSize: FONT_SIZE.md }}>No tickets found</td></tr>
                ) : paginated.map((t) => {
                  const av    = getAvatarColor(t.raisedBy);
                  const prio  = PRIORITY_STYLE[t.priority]  || PRIORITY_STYLE.Medium;
                  const stat  = STATUS_STYLE[t.status]      || STATUS_STYLE.Open;
                  const cat   = CATEGORY_COLORS[t.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
                  return (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${surface.border}`, transition: TRANSITION.fast }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

                      {/* Ticket ID */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, fontFamily: "monospace" }}>{t.id}</span>
                      </td>

                      {/* Subject */}
                      <td style={{ padding: PADDING.tableCell, maxWidth: 220 }}>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                      </td>

                      {/* Category */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text, whiteSpace: "nowrap" }}>{t.category}</span>
                      </td>

                      {/* Raised By */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                          <div style={{ width: 28, height: 28, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>{initials(t.raisedBy)}</div>
                          <span style={{ fontSize: FONT_SIZE.base, color: surface.text, whiteSpace: "nowrap" }}>{t.raisedBy}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: prio.bg, color: prio.text, whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: prio.dot }} />
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: stat.bg, color: stat.text, whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: stat.dot }} />
                          {t.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, whiteSpace: "nowrap" }}>{fmtDate(t.createdDate)}</td>

                      {/* Action */}
                      <td style={{ padding: PADDING.tableCell }}>
                        <button onClick={() => setViewTicket(t)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: RADIUS.md, border: `1px solid ${COLORS.primaryMuted}`, background: COLORS.primaryMuted, color: COLORS.primary, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer", fontWeight: FONT_WEIGHT.medium }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>
                Showing {(currentPage - 1) * ROWS + 1}–{Math.min(currentPage * ROWS, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: GAP.xs }}>
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  style={{ padding: `${GAP.xs}px ${GAP.md}px`, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.cardBg, color: currentPage === 1 ? COLORS.gray400 : surface.text, fontSize: FONT_SIZE.sm, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY.base }}>
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: p === currentPage ? "none" : `1px solid ${surface.border}`, background: p === currentPage ? COLORS.primary : surface.cardBg, color: p === currentPage ? COLORS.white : surface.text, fontWeight: p === currentPage ? FONT_WEIGHT.bold : FONT_WEIGHT.normal, fontSize: FONT_SIZE.sm, cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  style={{ padding: `${GAP.xs}px ${GAP.md}px`, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.cardBg, color: currentPage === totalPages ? COLORS.gray400 : surface.text, fontSize: FONT_SIZE.sm, cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY.base }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          ANALYTICS TAB
      ══════════════════════════════════════════ */}
      {activeTab === "Analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: GAP.lg }}>

            {/* Ticket trend */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Ticket Trend — This Week</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.success} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                  <XAxis dataKey="day" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                  <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, background: surface.cardBg, border: `1px solid ${surface.border}` }} />
                  <Area type="monotone" dataKey="opened"   name="Opened"   stroke={COLORS.danger}  fill="url(#openGrad)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke={COLORS.success} fill="url(#resolGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category pie */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Tickets by Category</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={catPie} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={2}>
                    {catPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: GAP.sm }}>
                {catPie.map((d) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority + Status bars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg }}>
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>By Priority</p>
              {PRIORITIES.map((p) => {
                const count = tickets.filter((t) => t.priority === p).length;
                const pct   = Math.round((count / total) * 100);
                const st    = PRIORITY_STYLE[p];
                return (
                  <div key={p} style={{ marginBottom: SPACING[3] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{p}</span>
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{count} <span style={{ color: COLORS.gray400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: st.dot, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>By Status</p>
              {["Open", "In Progress", "Pending", "Resolved", "Closed"].map((s) => {
                const count = tickets.filter((t) => t.status === s).length;
                const pct   = Math.round((count / total) * 100);
                const st    = STATUS_STYLE[s];
                return (
                  <div key={s} style={{ marginBottom: SPACING[3] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{s}</span>
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{count} <span style={{ color: COLORS.gray400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: st.dot, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SLA REPORT TAB
      ══════════════════════════════════════════ */}
      {activeTab === "SLA Report" && (
        <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
          <div style={{ padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>SLA Performance Report</p>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Service Level Agreement compliance by category</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr>
                {["Category", "Total", "Resolved", "Breached", "SLA %", "Health"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLA_DATA.map((row, i, arr) => {
                const pct      = row.total > 0 ? Math.round(((row.total - row.breached) / row.total) * 100) : 100;
                const barColor = pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger;
                const cat      = CATEGORY_COLORS[row.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
                return (
                  <tr key={row.category} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none", transition: TRANSITION.fast }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text }}>{row.category}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.text, fontWeight: FONT_WEIGHT.semibold, textAlign: "center" }}>{row.total}</td>
                    <td style={{ padding: PADDING.tableCell, textAlign: "center" }}>
                      <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: COLORS.success }}>{row.resolved}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell, textAlign: "center" }}>
                      <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: row.breached > 0 ? COLORS.danger : COLORS.success }}>{row.breached}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell, minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ flex: 1, height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: barColor, minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: pct >= 80 ? COLORS.successLight : pct >= 50 ? COLORS.warningLight : COLORS.dangerMuted, color: barColor }}>
                        {pct >= 80 ? "Good" : pct >= 50 ? "At Risk" : "Breached"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Raise Ticket Modal (Mantine) ── */}
      <AppModal
        opened={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Raise New Ticket"
        subtitle="Describe the issue and we'll assign it to the right team"
        icon={<Plus size={18} color={COLORS.primary} />}
        iconColor={COLORS.primary}
        size="md"
      >
        <Stack gap="md">
          <AppInput
            label="Subject *"
            placeholder="Briefly describe the issue"
            value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
          />
          <SimpleGrid cols={2} spacing="md">
            <AppInput
              type="select"
              label="Category *"
              value={newTicket.category}
              onChange={(v) => setNewTicket({ ...newTicket, category: v })}
              data={MODAL_CATS}
            />
            <AppInput
              type="select"
              label="Priority *"
              value={newTicket.priority}
              onChange={(v) => setNewTicket({ ...newTicket, priority: v })}
              data={PRIORITIES}
            />
          </SimpleGrid>
          <AppInput
            type="textarea"
            label="Description *"
            placeholder="Provide detailed information about the issue…"
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            minRows={4}
          />
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowRaiseModal(false)}>Cancel</AppButton>
            <AppButton
              onClick={handleRaise}
              disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
            >
              Submit Ticket
            </AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* ── View Ticket Modal ── */}
      {viewTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: Z_INDEX.modal, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACING[5] }}
          onClick={(e) => e.target === e.currentTarget && setViewTicket(null)}>
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["3xl"], width: "100%", maxWidth: 560, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: PADDING.card, borderBottom: `1px solid ${surface.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                <div style={{ width: 36, height: 36, borderRadius: RADIUS.lg, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ticket size={ICON_SIZE.md} color={COLORS.primary} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text, fontFamily: "monospace" }}>{viewTicket.id}</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>Ticket Details</p>
                </div>
              </div>
              <button onClick={() => setViewTicket(null)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, display: "flex" }}><X size={ICON_SIZE.md} /></button>
            </div>

            {/* Subject */}
            <div style={{ margin: SPACING[5], padding: `${GAP.md}px ${GAP.lg}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
              <p style={{ margin: "0 0 3px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</p>
              <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{viewTicket.subject}</p>
            </div>

            {/* Meta grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.md, padding: `0 ${SPACING[5]}px ${SPACING[5]}px` }}>
              {[
                ["Raised By",    viewTicket.raisedBy],
                ["Category",     viewTicket.category],
                ["Created Date", fmtDate(viewTicket.createdDate)],
                ["Ticket ID",    viewTicket.id],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: `${GAP.md}px ${GAP.md}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                  <p style={{ margin: "0 0 3px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{value}</p>
                </div>
              ))}

              {/* Priority */}
              <div style={{ padding: `${GAP.md}px ${GAP.md}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                <p style={{ margin: "0 0 5px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</p>
                {(() => { const s = PRIORITY_STYLE[viewTicket.priority] || PRIORITY_STYLE.Medium; return (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: s.bg, color: s.text }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{viewTicket.priority}
                  </span>
                ); })()}
              </div>

              {/* Status */}
              <div style={{ padding: `${GAP.md}px ${GAP.md}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                <p style={{ margin: "0 0 5px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
                {(() => { const s = STATUS_STYLE[viewTicket.status] || STATUS_STYLE.Open; return (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: s.bg, color: s.text }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{viewTicket.status}
                  </span>
                ); })()}
              </div>
            </div>

            {/* Description */}
            <div style={{ margin: `0 ${SPACING[5]}px ${SPACING[5]}px`, padding: `${GAP.md}px ${GAP.lg}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
              <p style={{ margin: "0 0 6px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</p>
              <p style={{ margin: 0, fontSize: FONT_SIZE.base, color: surface.text, lineHeight: 1.7 }}>{viewTicket.description}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", padding: `${GAP.lg}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <button onClick={() => setViewTicket(null)} style={{ padding: PADDING.btn, background: COLORS.primary, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.white, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
