import React, { useState } from "react";
import {
  Briefcase,
  Users,
  CalendarCheck,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Plus,
  ChevronDown,
} from "lucide-react";

const jobOpenings = [
  {
    id: 1,
    title: "Software Engineer",
    department: "IT",
    postedDate: "2026-05-01",
    applications: 12,
    status: "Open",
  },
  {
    id: 2,
    title: "HR Manager",
    department: "HR",
    postedDate: "2026-04-20",
    applications: 8,
    status: "Open",
  },
  {
    id: 3,
    title: "Finance Analyst",
    department: "Finance",
    postedDate: "2026-04-15",
    applications: 5,
    status: "Closed",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    department: "IT",
    postedDate: "2026-05-10",
    applications: 9,
    status: "Open",
  },
  {
    id: 5,
    title: "UI/UX Designer",
    department: "IT",
    postedDate: "2026-05-12",
    applications: 7,
    status: "Open",
  },
  {
    id: 6,
    title: "Recruiter",
    department: "HR",
    postedDate: "2026-04-28",
    applications: 4,
    status: "Closed",
  },
];

const candidates = [
  {
    id: 1,
    name: "Aisha Patel",
    avatar: "AP",
    position: "Software Engineer",
    appliedDate: "2026-05-03",
    status: "Applied",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "MJ",
    position: "HR Manager",
    appliedDate: "2026-04-22",
    status: "Screening",
  },
  {
    id: 3,
    name: "Priya Nair",
    avatar: "PN",
    position: "Finance Analyst",
    appliedDate: "2026-04-18",
    status: "Interview",
  },
  {
    id: 4,
    name: "Liam O'Brien",
    avatar: "LO",
    position: "DevOps Engineer",
    appliedDate: "2026-05-12",
    status: "Selected",
  },
  {
    id: 5,
    name: "Fatima Al-Hassan",
    avatar: "FA",
    position: "UI/UX Designer",
    appliedDate: "2026-05-14",
    status: "Applied",
  },
  {
    id: 6,
    name: "Carlos Rivera",
    avatar: "CR",
    position: "Software Engineer",
    appliedDate: "2026-05-05",
    status: "Rejected",
  },
  {
    id: 7,
    name: "Yuki Tanaka",
    avatar: "YT",
    position: "Recruiter",
    appliedDate: "2026-04-30",
    status: "On Hold",
  },
  {
    id: 8,
    name: "Daniela Ferreira",
    avatar: "DF",
    position: "HR Manager",
    appliedDate: "2026-04-25",
    status: "Screening",
  },
];

const statusBadgeStyle = {
  Applied: { background: "#eff6ff", color: "#2563eb" },
  Screening: { background: "#f5f3ff", color: "#7c3aed" },
  Interview: { background: "#fff7ed", color: "#c2410c" },
  Selected: { background: "#f0fdf4", color: "#15803d" },
  Rejected: { background: "#fef2f2", color: "#b91c1c" },
  "On Hold": { background: "#fafafa", color: "#64748b" },
};

const avatarColors = [
  "#2563eb", "#7c3aed", "#c2410c", "#15803d", "#b45309", "#0e7490", "#be185d", "#4338ca",
];

const kpiData = [
  {
    label: "Open Positions",
    value: 4,
    icon: Briefcase,
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  {
    label: "Applications",
    value: 45,
    icon: Users,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
  },
  {
    label: "Interviews Scheduled",
    value: 7,
    icon: CalendarCheck,
    color: "#c2410c",
    bgColor: "#fff7ed",
  },
  {
    label: "Offers Made",
    value: 3,
    icon: CheckCircle,
    color: "#15803d",
    bgColor: "#f0fdf4",
  },
];

const ALL_STATUSES = ["All", "Applied", "Screening", "Interview", "Selected", "Rejected", "On Hold"];

export default function Recruitment({ darkMode = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const colors = {
    pageBg: darkMode ? "#0f172a" : "#f1f5f9",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    rowBg: darkMode ? "#334155" : "#f8fafc",
    textPrimary: darkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    textMuted: darkMode ? "#64748b" : "#94a3b8",
    border: darkMode ? "#334155" : "#e2e8f0",
    inputBg: darkMode ? "#1e293b" : "#ffffff",
    inputBorder: darkMode ? "#334155" : "#e2e8f0",
    inputColor: darkMode ? "#f1f5f9" : "#0f172a",
    tableHeaderBg: darkMode ? "#0f172a" : "#f1f5f9",
    hoverRowBg: darkMode ? "#2d3d50" : "#f1f5f9",
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: colors.pageBg,
      padding: "24px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
    },
    headerRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "28px",
    },
    headerTitle: {
      fontSize: "clamp(20px, 3vw, 26px)",
      fontWeight: 700,
      color: colors.textPrimary,
      margin: 0,
    },
    headerSubtitle: {
      fontSize: "14px",
      color: colors.textSecondary,
      marginTop: "4px",
    },
    postJobBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 18px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "background 0.2s",
    },
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "28px",
    },
    kpiCard: {
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    kpiIconWrap: (bgColor) => ({
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    kpiValue: {
      fontSize: "28px",
      fontWeight: 700,
      color: colors.textPrimary,
      lineHeight: 1.1,
    },
    kpiLabel: {
      fontSize: "13px",
      color: colors.textSecondary,
      marginTop: "2px",
    },
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      marginBottom: "24px",
      overflow: "hidden",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      padding: "20px 24px",
      borderBottom: `1px solid ${colors.border}`,
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: 700,
      color: colors.textPrimary,
      margin: 0,
    },
    cardSubtitle: {
      fontSize: "13px",
      color: colors.textSecondary,
      marginTop: "2px",
    },
    tableWrap: {
      overflowX: "auto",
      width: "100%",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "560px",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: 600,
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      backgroundColor: colors.tableHeaderBg,
      borderBottom: `1px solid ${colors.border}`,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "14px 16px",
      fontSize: "14px",
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.border}`,
      verticalAlign: "middle",
    },
    tdSecondary: {
      padding: "14px 16px",
      fontSize: "14px",
      color: colors.textSecondary,
      borderBottom: `1px solid ${colors.border}`,
      verticalAlign: "middle",
    },
    statusBadge: (status) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: statusBadgeStyle[status]?.background || "#f1f5f9",
      color: statusBadgeStyle[status]?.color || "#64748b",
    }),
    jobStatusBadge: (status) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: status === "Open" ? "#f0fdf4" : "#fef2f2",
      color: status === "Open" ? "#15803d" : "#b91c1c",
    }),
    viewBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "6px 12px",
      borderRadius: "6px",
      border: `1px solid ${colors.border}`,
      backgroundColor: "transparent",
      color: colors.textSecondary,
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.15s",
    },
    searchWrap: {
      position: "relative",
      flex: "1",
      minWidth: "180px",
      maxWidth: "300px",
    },
    searchIcon: {
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      color: colors.textMuted,
      pointerEvents: "none",
    },
    searchInput: {
      width: "100%",
      padding: "8px 12px 8px 34px",
      borderRadius: "8px",
      border: `1px solid ${colors.inputBorder}`,
      backgroundColor: colors.inputBg,
      color: colors.inputColor,
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    filterWrap: {
      position: "relative",
      minWidth: "150px",
    },
    filterSelect: {
      appearance: "none",
      width: "100%",
      padding: "8px 32px 8px 12px",
      borderRadius: "8px",
      border: `1px solid ${colors.inputBorder}`,
      backgroundColor: colors.inputBg,
      color: colors.inputColor,
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
    },
    filterChevron: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      color: colors.textMuted,
      pointerEvents: "none",
    },
    candidateAvatar: (idx) => ({
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      backgroundColor: avatarColors[idx % avatarColors.length],
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: 700,
      flexShrink: 0,
    }),
    candidateCell: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    candidateName: {
      fontSize: "14px",
      fontWeight: 600,
      color: colors.textPrimary,
    },
    emptyRow: {
      padding: "32px 16px",
      textAlign: "center",
      color: colors.textMuted,
      fontSize: "14px",
    },
    controlsRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.headerTitle}>Recruitment &amp; ATS</h1>
            <p style={styles.headerSubtitle}>
              Manage job openings, track applicants, and streamline your hiring pipeline.
            </p>
          </div>
          <button style={styles.postJobBtn}>
            <Plus size={16} />
            Post Job
          </button>
        </div>

        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          {kpiData.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} style={styles.kpiCard}>
                <div style={styles.kpiIconWrap(kpi.bgColor)}>
                  <Icon size={22} color={kpi.color} strokeWidth={2} />
                </div>
                <div>
                  <div style={styles.kpiValue}>{kpi.value}</div>
                  <div style={styles.kpiLabel}>{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Job Openings Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Job Openings</h2>
              <p style={styles.cardSubtitle}>{jobOpenings.length} positions listed</p>
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Job Title</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Posted Date</th>
                  <th style={styles.th}>Applications</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobOpenings.map((job, idx) => (
                  <tr
                    key={job.id}
                    style={{
                      backgroundColor:
                        idx % 2 === 1
                          ? darkMode
                            ? "rgba(51,65,85,0.35)"
                            : "rgba(241,245,249,0.6)"
                          : "transparent",
                    }}
                  >
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600 }}>{job.title}</span>
                    </td>
                    <td style={styles.tdSecondary}>{job.department}</td>
                    <td style={styles.tdSecondary}>{job.postedDate}</td>
                    <td style={styles.tdSecondary}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: 600,
                          color: colors.textPrimary,
                        }}
                      >
                        <Users size={13} color={colors.textMuted} />
                        {job.applications}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.jobStatusBadge(job.status)}>{job.status}</span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.viewBtn}>
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidates Pipeline */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Candidates Pipeline</h2>
              <p style={styles.cardSubtitle}>
                {filteredCandidates.length} candidate
                {filteredCandidates.length !== 1 ? "s" : ""} shown
              </p>
            </div>
            <div style={styles.controlsRow}>
              {/* Search */}
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              {/* Status Filter */}
              <div style={styles.filterWrap}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>
                <span style={styles.filterChevron}>
                  <ChevronDown size={14} />
                </span>
              </div>
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Candidate</th>
                  <th style={styles.th}>Position</th>
                  <th style={styles.th}>Applied Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyRow}>
                      No candidates match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate, idx) => (
                    <tr
                      key={candidate.id}
                      style={{
                        backgroundColor:
                          idx % 2 === 1
                            ? darkMode
                              ? "rgba(51,65,85,0.35)"
                              : "rgba(241,245,249,0.6)"
                            : "transparent",
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.candidateCell}>
                          <div style={styles.candidateAvatar(idx)}>
                            {candidate.avatar}
                          </div>
                          <span style={styles.candidateName}>{candidate.name}</span>
                        </div>
                      </td>
                      <td style={styles.tdSecondary}>{candidate.position}</td>
                      <td style={styles.tdSecondary}>{candidate.appliedDate}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(candidate.status)}>
                          {candidate.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.viewBtn}>
                          <Eye size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
