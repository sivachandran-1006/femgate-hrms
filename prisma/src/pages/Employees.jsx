import { useState } from "react";
import {
  Search,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#fef9c3", color: "#a16207" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#cffafe", color: "#0e7490" },
  { bg: "#ffedd5", color: "#c2410c" },
  { bg: "#f1f5f9", color: "#475569" },
];

function getAvatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatusBadgeStyle(status, darkMode) {
  if (status === "Present" || status === "Active") {
    return darkMode
      ? { background: "#14532d33", color: "#4ade80" }
      : { background: "#dcfce7", color: "#15803d" };
  }
  if (status === "Leave") {
    return darkMode
      ? { background: "#1e3a5f", color: "#60a5fa" }
      : { background: "#dbeafe", color: "#1d4ed8" };
  }
  if (status === "Absent" || status === "Rejected") {
    return darkMode
      ? { background: "#450a0a55", color: "#f87171" }
      : { background: "#fee2e2", color: "#b91c1c" };
  }
  // Pending / default
  return darkMode
    ? { background: "#71350044", color: "#fbbf24" }
    : { background: "#fef9c3", color: "#a16207" };
}

const ROWS_PER_PAGE = 10;

const Employees = ({
  employees = [],
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  filteredEmployees = [],
  setSelectedEmployee,
  editEmployee,
  deleteEmployee,
  onAddEmployee,
  onExportExcel,
  darkMode = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // --- theme tokens ---
  const theme = darkMode
    ? {
        pageBg: "#0f172a",
        cardBg: "#1e293b",
        text: "#f1f5f9",
        subtext: "#94a3b8",
        muted: "#64748b",
        border: "#334155",
        inputBg: "#0f172a",
        inputBorder: "#334155",
        tableRowHover: "#1e293b",
        tableHeaderBg: "#172033",
      }
    : {
        pageBg: "#f1f5f9",
        cardBg: "#ffffff",
        text: "#0f172a",
        subtext: "#64748b",
        muted: "#94a3b8",
        border: "#e2e8f0",
        inputBg: "#ffffff",
        inputBorder: "#e2e8f0",
        tableRowHover: "#f8fafc",
        tableHeaderBg: "#f8fafc",
      };

  // --- KPI counts ---
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalCount = employees.length;
  const presentCount = employees.filter((e) => e.status === "Present").length;
  const leaveCount = employees.filter((e) => e.status === "Leave").length;
  const newJoinersCount = employees.filter((e) => {
    if (!e.joinDate) return false;
    const parts = e.joinDate.split(/[-/]/);
    // Support both DD/MM/YYYY and YYYY-MM-DD
    let d;
    if (parts[0].length === 4) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const kpis = [
    {
      label: "Total Employees",
      value: totalCount,
      icon: <Users size={20} strokeWidth={1.8} color="#2563eb" />,
      iconBg: "#dbeafe",
      valueColor: "#2563eb",
    },
    {
      label: "Present Today",
      value: presentCount,
      icon: <UserCheck size={20} strokeWidth={1.8} color="#16a34a" />,
      iconBg: "#dcfce7",
      valueColor: "#16a34a",
    },
    {
      label: "On Leave",
      value: leaveCount,
      icon: <UserMinus size={20} strokeWidth={1.8} color="#d97706" />,
      iconBg: "#fef9c3",
      valueColor: "#d97706",
    },
    {
      label: "New Joiners",
      value: newJoinersCount,
      icon: <UserPlus size={20} strokeWidth={1.8} color="#7c3aed" />,
      iconBg: "#ede9fe",
      valueColor: "#7c3aed",
    },
  ];

  // --- sorted + paginated ---
  const sorted = [...filteredEmployees].sort((a, b) =>
    sortOrder === "asc"
      ? (a?.name || "").localeCompare(b?.name || "")
      : (b?.name || "").localeCompare(a?.name || "")
  );
  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilter(e) {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }

  const showFrom = sorted.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const showTo = Math.min(currentPage * ROWS_PER_PAGE, sorted.length);

  // Page buttons: show at most 5 around current
  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages || 1 }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);
    return pages;
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        width: "100%",
        maxWidth: 1320,
        margin: "0 auto",
        color: theme.text,
      }}
    >
      {/* ── PAGE HEADER ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: theme.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Employees
          </h1>
          <p style={{ fontSize: 13, color: theme.subtext, margin: "4px 0 0" }}>
            Manage your team
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={onExportExcel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={15} strokeWidth={2} />
            Export Excel
          </button>

          <button
            onClick={onAddEmployee}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={15} strokeWidth={2} />
            Add Employee
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: theme.cardBg,
              borderRadius: 14,
              border: "1px solid " + theme.border,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: kpi.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: kpi.valueColor,
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.subtext,
                  marginTop: 4,
                }}
              >
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={15}
            color={theme.muted}
            style={{
              position: "absolute",
              top: "50%",
              left: 12,
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              border: "1px solid " + theme.inputBorder,
              borderRadius: 10,
              padding: "0 14px 0 36px",
              fontSize: 13,
              fontWeight: 400,
              color: theme.text,
              width: 260,
              height: 38,
              outline: "none",
              background: theme.inputBg,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid " + theme.border,
            borderRadius: 10,
            padding: "0 14px",
            height: 38,
            fontSize: 13,
            fontWeight: 600,
            background: theme.cardBg,
            color: theme.text,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Sort {sortOrder === "asc" ? "Z–A" : "A–Z"}
          <ChevronsUpDown size={14} color={theme.subtext} strokeWidth={1.8} />
        </button>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          style={{
            border: "1px solid " + theme.inputBorder,
            borderRadius: 10,
            padding: "0 14px",
            height: 38,
            fontSize: 13,
            fontWeight: 400,
            color: theme.text,
            background: theme.inputBg,
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            minWidth: 130,
          }}
        >
          <option value="All">All Status</option>
          <option value="Present">Present</option>
          <option value="Leave">Leave</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      {/* ── TABLE CARD ── */}
      <div
        style={{
          background: theme.cardBg,
          borderRadius: 14,
          border: "1px solid " + theme.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Employee ID",
                "Employee Name",
                "Department",
                "Designation",
                "Status",
                "Join Date",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 14px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: theme.subtext,
                    letterSpacing: "0.02em",
                    background: theme.tableHeaderBg,
                    borderBottom: "1px solid " + theme.border,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "40px 14px",
                    color: theme.muted,
                    fontSize: 13,
                  }}
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              paginated.map((employee) => {
                const globalIdx = employees.findIndex((e) => e._id === employee._id);
                const empId =
                  "EMP" + String(globalIdx >= 0 ? globalIdx + 1 : 0).padStart(3, "0");
                const avatarStyle = getAvatarColor(employee.name);
                const initials = getInitials(employee.name);
                const badgeStyle = getStatusBadgeStyle(employee.status, darkMode);

                return (
                  <tr
                    key={employee._id}
                    style={{ borderBottom: "1px solid " + theme.border }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.tableRowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Employee ID */}
                    <td style={{ padding: "13px 14px", fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "#2563eb" }}>{empId}</span>
                    </td>

                    {/* Employee Name */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: avatarStyle.bg,
                            color: avatarStyle.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: theme.text,
                              lineHeight: 1.3,
                            }}
                          >
                            {employee.name || "Unknown"}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 400,
                              color: theme.subtext,
                              lineHeight: 1.3,
                            }}
                          >
                            {employee.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td
                      style={{
                        padding: "13px 14px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: theme.text,
                        borderBottom: "1px solid " + theme.border,
                      }}
                    >
                      {employee.department || "—"}
                    </td>

                    {/* Designation */}
                    <td
                      style={{
                        padding: "13px 14px",
                        fontSize: 13,
                        fontWeight: 400,
                        color: theme.subtext,
                        borderBottom: "1px solid " + theme.border,
                      }}
                    >
                      {employee.designation || "—"}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 14px" }}>
                      <span
                        style={{
                          ...badgeStyle,
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          display: "inline-block",
                        }}
                      >
                        {employee.status || "—"}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td
                      style={{
                        padding: "13px 14px",
                        fontSize: 13,
                        fontWeight: 400,
                        color: theme.subtext,
                      }}
                    >
                      {employee.joinDate || "—"}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => editEmployee(employee)}
                          title="Edit"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: "none",
                            background: theme.tableRowHover,
                            color: theme.subtext,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={14} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => deleteEmployee(employee._id)}
                          title="Delete"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── PAGINATION ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderTop: "1px solid " + theme.border,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 400, color: theme.subtext }}>
            Showing {showFrom} to {showTo} of {sorted.length}
          </span>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid " + theme.border,
                background: theme.cardBg,
                color: currentPage === 1 ? theme.muted : theme.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={15} strokeWidth={1.8} />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={"ellipsis-" + idx}
                  style={{
                    width: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: theme.muted,
                  }}
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: page === currentPage ? "none" : "1px solid " + theme.border,
                    background: page === currentPage ? "#2563eb" : theme.cardBg,
                    color: page === currentPage ? "#fff" : theme.text,
                    fontWeight: page === currentPage ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid " + theme.border,
                background: theme.cardBg,
                color:
                  currentPage === totalPages || totalPages === 0
                    ? theme.muted
                    : theme.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  currentPage === totalPages || totalPages === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <ChevronRight size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
