import React, { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  ChevronDown,
} from "lucide-react";

const mockTickets = [
  {
    id: "TKT001",
    subject: "Laptop not booting",
    category: "Hardware",
    raisedBy: "Mani",
    priority: "High",
    status: "Open",
    createdDate: "2026-05-30",
    description:
      "The laptop does not boot at all. Pressing the power button shows no response. Needs immediate hardware inspection.",
  },
  {
    id: "TKT002",
    subject: "VPN access required",
    category: "Access Request",
    raisedBy: "Hari",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2026-05-29",
    description:
      "Need VPN access to connect to the office network while working remotely. Please provide credentials and setup guide.",
  },
  {
    id: "TKT003",
    subject: "Software installation - VS Code",
    category: "Software",
    raisedBy: "Santhosh",
    priority: "Low",
    status: "Resolved",
    createdDate: "2026-05-28",
    description:
      "Request to install Visual Studio Code on my work laptop for development purposes.",
  },
  {
    id: "TKT004",
    subject: "Monitor display issue",
    category: "Hardware",
    raisedBy: "Suriya",
    priority: "Medium",
    status: "Pending",
    createdDate: "2026-05-28",
    description:
      "External monitor shows flickering and distorted colors. The issue started after the recent OS update.",
  },
  {
    id: "TKT005",
    subject: "New employee setup for Arjun Kumar",
    category: "New Employee Setup",
    raisedBy: "Big Kundi",
    priority: "High",
    status: "In Progress",
    createdDate: "2026-05-27",
    description:
      "New employee Arjun Kumar joining on 2026-06-02. Requires laptop provisioning, email account, software licenses, and access cards.",
  },
  {
    id: "TKT006",
    subject: "Internet slow in Finance floor",
    category: "Network",
    raisedBy: "Safeer",
    priority: "High",
    status: "Open",
    createdDate: "2026-05-27",
    description:
      "The entire Finance department floor is experiencing very slow internet speeds since yesterday morning. Affecting daily operations.",
  },
  {
    id: "TKT007",
    subject: "Printer not working",
    category: "Hardware",
    raisedBy: "Small Kundi",
    priority: "Low",
    status: "Resolved",
    createdDate: "2026-05-25",
    description:
      "The shared printer on 3rd floor is not responding to print jobs. Paper jam was reported last week but the issue persists.",
  },
  {
    id: "TKT008",
    subject: "Email password reset",
    category: "Access Request",
    raisedBy: "Suganthan",
    priority: "Medium",
    status: "Closed",
    createdDate: "2026-05-24",
    description:
      "Unable to log in to corporate email. Password reset required urgently as it is affecting client communication.",
  },
];

const priorityColors = {
  High: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  Medium: { bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
  Low: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
};

const statusColors = {
  Open: { bg: "#fee2e2", text: "#ef4444" },
  "In Progress": { bg: "#fef3c7", text: "#d97706" },
  Pending: { bg: "#f5f3ff", text: "#7c3aed" },
  Resolved: { bg: "#f0fdf4", text: "#15803d" },
  Closed: { bg: "#f1f5f9", text: "#64748b" },
};

const categories = ["All", "Hardware", "Software", "Network", "Access Request", "New Employee Setup"];
const statuses = ["All", "Open", "In Progress", "Pending", "Resolved", "Closed"];
const priorities = ["High", "Medium", "Low"];
const modalCategories = ["Hardware", "Software", "Network", "Access Request", "New Employee Setup"];

export default function Helpdesk({ darkMode = false }) {
  const [activeTab, setActiveTab] = useState("All Tickets");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [tickets, setTickets] = useState(mockTickets);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Hardware",
    priority: "Medium",
    description: "",
  });

  const colors = {
    pageBg: darkMode ? "#0f172a" : "#f1f5f9",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    subText: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e2e8f0",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    tableRowHover: darkMode ? "#243044" : "#f8fafc",
    tableHeaderBg: darkMode ? "#162032" : "#f1f5f9",
    modalOverlay: "rgba(0,0,0,0.6)",
    activeTabBg: "#3b82f6",
    activeTabText: "#ffffff",
    inactiveTabText: darkMode ? "#94a3b8" : "#64748b",
    accent: "#3b82f6",
  };

  const kpiData = [
    {
      label: "Total Tickets",
      value: tickets.length,
      icon: <Ticket size={22} color="#3b82f6" />,
      iconBg: "#eff6ff",
      iconBgDark: "#1e3a5f",
    },
    {
      label: "Open",
      value: tickets.filter((t) => t.status === "Open").length,
      icon: <AlertCircle size={22} color="#ef4444" />,
      iconBg: "#fee2e2",
      iconBgDark: "#3b1212",
    },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "In Progress").length,
      icon: <Clock size={22} color="#d97706" />,
      iconBg: "#fef3c7",
      iconBgDark: "#3b2a0a",
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "Resolved").length,
      icon: <CheckCircle2 size={22} color="#15803d" />,
      iconBg: "#f0fdf4",
      iconBgDark: "#0d2e1a",
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.raisedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchTab =
      activeTab === "All Tickets" ||
      (activeTab === "My Tickets" && t.raisedBy === "Mani");
    return matchSearch && matchCategory && matchStatus && matchTab;
  });

  const slaData = [
    { category: "Hardware", total: 4, resolved: 2, breached: 1 },
    { category: "Software", total: 1, resolved: 1, breached: 0 },
    { category: "Network", total: 1, resolved: 0, breached: 1 },
    { category: "Access Request", total: 2, resolved: 1, breached: 0 },
    { category: "New Employee Setup", total: 1, resolved: 0, breached: 0 },
  ];

  const handleRaiseTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
    const id = `TKT${String(tickets.length + 1).padStart(3, "0")}`;
    setTickets([
      {
        id,
        subject: newTicket.subject,
        category: newTicket.category,
        raisedBy: "Mani",
        priority: newTicket.priority,
        status: "Open",
        createdDate: new Date().toISOString().split("T")[0],
        description: newTicket.description,
      },
      ...tickets,
    ]);
    setNewTicket({ subject: "", category: "Hardware", priority: "Medium", description: "" });
    setShowRaiseModal(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: colors.subText,
    marginBottom: 5,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        padding: "28px 32px",
        fontFamily: "'Inter', sans-serif",
        color: colors.text,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: colors.text }}>
            IT Helpdesk
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: colors.subText }}>
            Manage and track IT support tickets
          </p>
        </div>
        <button
          onClick={() => setShowRaiseModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
          }}
        >
          <Plus size={17} />
          Raise Ticket
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        {kpiData.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: darkMode ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: darkMode ? kpi.iconBgDark : kpi.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: colors.text, lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 13, color: colors.subText, marginTop: 4 }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          boxShadow: darkMode ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "16px 20px 0",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {["All Tickets", "My Tickets", "SLA Report"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                background: activeTab === tab ? colors.accent : "transparent",
                color: activeTab === tab ? "#fff" : colors.inactiveTabText,
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "SLA Report" && <BarChart2 size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />}
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== "SLA Report" ? (
          <>
            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "16px 20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", flex: "1 1 200px", minWidth: 200 }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.subText,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <Filter
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.subText,
                  }}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: 30,
                    width: "auto",
                    minWidth: 160,
                    appearance: "none",
                    paddingRight: 32,
                    cursor: "pointer",
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.subText,
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: "auto",
                    minWidth: 140,
                    appearance: "none",
                    paddingRight: 32,
                    cursor: "pointer",
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.subText,
                    pointerEvents: "none",
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: colors.subText, marginLeft: "auto" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr
                    style={{
                      background: colors.tableHeaderBg,
                      borderTop: `1px solid ${colors.border}`,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {["Ticket ID", "Subject", "Category", "Raised By", "Priority", "Status", "Created Date", "Action"].map(
                      (col) => (
                        <th
                          key={col}
                          style={{
                            padding: "11px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            fontSize: 12,
                            color: colors.subText,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: 40,
                          color: colors.subText,
                          fontSize: 14,
                        }}
                      >
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket, idx) => {
                      const pc = priorityColors[ticket.priority];
                      const sc = statusColors[ticket.status] || statusColors["Closed"];
                      return (
                        <tr
                          key={ticket.id}
                          style={{
                            borderBottom: `1px solid ${colors.border}`,
                            background: idx % 2 === 0 ? "transparent" : darkMode ? "#182030" : "#fafafa",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = colors.tableRowHover)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "transparent" : darkMode ? "#182030" : "#fafafa")
                          }
                        >
                          <td style={{ padding: "12px 16px", fontWeight: 600, color: colors.accent, whiteSpace: "nowrap" }}>
                            {ticket.id}
                          </td>
                          <td style={{ padding: "12px 16px", color: colors.text, maxWidth: 220 }}>
                            {ticket.subject}
                          </td>
                          <td style={{ padding: "12px 16px", color: colors.subText, whiteSpace: "nowrap" }}>
                            {ticket.category}
                          </td>
                          <td style={{ padding: "12px 16px", color: colors.text, whiteSpace: "nowrap" }}>
                            {ticket.raisedBy}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 10px",
                                borderRadius: 20,
                                background: pc.bg,
                                color: pc.text,
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: pc.dot,
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              {ticket.priority}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 12px",
                                borderRadius: 20,
                                background: sc.bg,
                                color: sc.text,
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: colors.subText, whiteSpace: "nowrap" }}>
                            {ticket.createdDate}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              onClick={() => setViewTicket(ticket)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 12px",
                                background: darkMode ? "#1e3a5f" : "#eff6ff",
                                color: colors.accent,
                                border: `1px solid ${darkMode ? "#2d4f7c" : "#bfdbfe"}`,
                                borderRadius: 7,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* SLA Report Tab */
          <div style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.text }}>
              SLA Performance Report
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr
                  style={{
                    background: colors.tableHeaderBg,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {["Category", "Total Tickets", "Resolved", "Breached", "SLA %"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: 12,
                        color: colors.subText,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slaData.map((row, idx) => {
                  const slaPercent =
                    row.total > 0
                      ? Math.round(((row.total - row.breached) / row.total) * 100)
                      : 100;
                  const barColor = slaPercent >= 80 ? "#15803d" : slaPercent >= 50 ? "#d97706" : "#ef4444";
                  return (
                    <tr
                      key={row.category}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: idx % 2 === 0 ? "transparent" : darkMode ? "#182030" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: colors.text }}>
                        {row.category}
                      </td>
                      <td style={{ padding: "12px 16px", color: colors.subText, textAlign: "center" }}>
                        {row.total}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#15803d", textAlign: "center", fontWeight: 600 }}>
                        {row.resolved}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#ef4444", textAlign: "center", fontWeight: 600 }}>
                        {row.breached}
                      </td>
                      <td style={{ padding: "12px 16px", minWidth: 140 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              background: darkMode ? "#334155" : "#e2e8f0",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${slaPercent}%`,
                                background: barColor,
                                borderRadius: 4,
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: barColor, minWidth: 36 }}>
                            {slaPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: colors.modalOverlay,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setShowRaiseModal(false)}
        >
          <div
            style={{
              background: colors.cardBg,
              borderRadius: 16,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: darkMode ? "#1e3a5f" : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color={colors.accent} />
                </div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.text }}>
                  Raise New Ticket
                </h2>
              </div>
              <button
                onClick={() => setShowRaiseModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.subText,
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input
                    type="text"
                    placeholder="Briefly describe the issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        style={{ ...inputStyle, appearance: "none", paddingRight: 32, cursor: "pointer" }}
                      >
                        {modalCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: colors.subText,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Priority *</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        style={{ ...inputStyle, appearance: "none", paddingRight: 32, cursor: "pointer" }}
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: colors.subText,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    placeholder="Provide detailed information about the issue..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "16px 24px",
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <button
                onClick={() => setShowRaiseModal(false)}
                style={{
                  padding: "9px 20px",
                  background: "transparent",
                  border: `1px solid ${colors.border}`,
                  color: colors.subText,
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseTicket}
                disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
                style={{
                  padding: "9px 22px",
                  background:
                    !newTicket.subject.trim() || !newTicket.description.trim()
                      ? "#93c5fd"
                      : "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    !newTicket.subject.trim() || !newTicket.description.trim()
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {viewTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: colors.modalOverlay,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setViewTicket(null)}
        >
          <div
            style={{
              background: colors.cardBg,
              borderRadius: 16,
              width: "100%",
              maxWidth: 560,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: darkMode ? "#1e3a5f" : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ticket size={18} color={colors.accent} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.text }}>
                    {viewTicket.id}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: colors.subText }}>
                    Ticket Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewTicket(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.subText,
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {/* Subject */}
              <div
                style={{
                  padding: "14px 16px",
                  background: darkMode ? "#162032" : "#f8fafc",
                  borderRadius: 10,
                  marginBottom: 18,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ fontSize: 12, color: colors.subText, display: "block", marginBottom: 4, fontWeight: 600 }}>
                  SUBJECT
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                  {viewTicket.subject}
                </span>
              </div>

              {/* Meta Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                {[
                  { label: "TICKET ID", value: viewTicket.id },
                  { label: "RAISED BY", value: viewTicket.raisedBy },
                  { label: "CATEGORY", value: viewTicket.category },
                  { label: "CREATED DATE", value: viewTicket.createdDate },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "12px 14px",
                      background: darkMode ? "#162032" : "#f8fafc",
                      borderRadius: 9,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: colors.subText,
                        display: "block",
                        marginBottom: 5,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Priority */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: darkMode ? "#162032" : "#f8fafc",
                    borderRadius: 9,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.subText,
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    PRIORITY
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: priorityColors[viewTicket.priority]?.bg,
                      color: priorityColors[viewTicket.priority]?.text,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: priorityColors[viewTicket.priority]?.dot,
                        display: "inline-block",
                      }}
                    />
                    {viewTicket.priority}
                  </span>
                </div>

                {/* Status */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: darkMode ? "#162032" : "#f8fafc",
                    borderRadius: 9,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.subText,
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    STATUS
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: 20,
                      background: (statusColors[viewTicket.status] || statusColors["Closed"]).bg,
                      color: (statusColors[viewTicket.status] || statusColors["Closed"]).text,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {viewTicket.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  padding: "14px 16px",
                  background: darkMode ? "#162032" : "#f8fafc",
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: colors.subText,
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  DESCRIPTION
                </span>
                <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.7 }}>
                  {viewTicket.description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "16px 24px",
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <button
                onClick={() => setViewTicket(null)}
                style={{
                  padding: "9px 22px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
