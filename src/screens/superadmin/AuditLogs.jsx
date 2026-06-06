import { useState } from "react";
import { Search, Download, ChevronDown, ChevronRight, Shield, Settings, User } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const SEVERITY_STYLES = {
  Critical: { bg: COLORS.dangerMuted,  text: COLORS.danger },
  Warning:  { bg: COLORS.warningLight, text: COLORS.warning },
  Info:     { bg: COLORS.primaryLight, text: COLORS.primary },
};

const TAB_MAP = { "All Logs": "all", Security: "Security", System: "System", "User Actions": "User Actions" };

const LOGS = [
  { id: 1,  timestamp: "2026-06-05 09:14", actor: "superadmin@mgatesystems.com", action: "Login failed — 3 attempts",                     module: "Security",     ip: "203.0.113.12", severity: "Critical", detail: { event: "brute_force_attempt", attempts: 3, account: "superadmin@mgatesystems.com", blocked: true } },
  { id: 2,  timestamp: "2026-06-05 08:30", actor: "finance@mgatesystems.com",    action: "Payroll approved for May 2026",                  module: "System",       ip: "10.0.1.22",    severity: "Info",     detail: { payroll_id: "PAY-2026-05", total_amount: 485000, employees: 12 } },
  { id: 3,  timestamp: "2026-06-05 07:45", actor: "admin@mgatesystems.com",      action: "Role permissions updated: HR",                   module: "System",       ip: "10.0.1.15",    severity: "Warning",  detail: { role: "HR", before: ["view_employees"], after: ["view_employees", "edit_employees", "export_reports"] } },
  { id: 4,  timestamp: "2026-06-04 16:20", actor: "admin@mgatesystems.com",      action: "Employee record deleted: EMP-009",               module: "User Actions", ip: "10.0.1.15",    severity: "Warning",  detail: { employee_id: "EMP-009", name: "Deleted User", reason: "Resigned" } },
  { id: 5,  timestamp: "2026-06-04 15:10", actor: "admin@mgatesystems.com",      action: "New user created: kavitha@mgatesystems.com",            module: "User Actions", ip: "10.0.1.15",    severity: "Info",     detail: { user_id: 12, email: "kavitha@mgatesystems.com", role: "HR" } },
  { id: 6,  timestamp: "2026-06-04 14:00", actor: "superadmin@mgatesystems.com", action: "Security policy changed: MFA enabled globally",  module: "Security",     ip: "203.0.113.12", severity: "Critical", detail: { policy: "mfa_enforcement", before: "optional", after: "required", affected_users: 12 } },
  { id: 7,  timestamp: "2026-06-04 12:30", actor: "hr@mgatesystems.com",         action: "Leave request approved: Priya Sharma",           module: "User Actions", ip: "10.0.1.18",    severity: "Info",     detail: { leave_id: "LV-045", employee: "Priya Sharma", days: 3, type: "Annual" } },
  { id: 8,  timestamp: "2026-06-04 11:15", actor: "itadmin@mgatesystems.com",    action: "System backup initiated",                        module: "System",       ip: "10.0.1.30",    severity: "Info",     detail: { backup_id: "BKP-20260604", size: "2.3 GB", destination: "cloud_storage" } },
  { id: 9,  timestamp: "2026-06-04 10:05", actor: "superadmin@mgatesystems.com", action: "Integration disconnected: SAP SuccessFactors",   module: "System",       ip: "203.0.113.12", severity: "Warning",  detail: { integration: "SAP SuccessFactors", reason: "API key expired", status: "error" } },
  { id: 10, timestamp: "2026-06-04 09:00", actor: "finance@mgatesystems.com",    action: "Invoice downloaded: INV-2026-005",               module: "User Actions", ip: "10.0.1.22",    severity: "Info",     detail: { invoice_id: "INV-2026-005", amount: 45000 } },
  { id: 11, timestamp: "2026-06-03 17:40", actor: "admin@mgatesystems.com",      action: "Password reset sent: mani@mgatesystems.com",            module: "User Actions", ip: "10.0.1.15",    severity: "Info",     detail: { user: "mani@mgatesystems.com", method: "email_link" } },
  { id: 12, timestamp: "2026-06-03 16:20", actor: "superadmin@mgatesystems.com", action: "Suspicious login from new country: US",          module: "Security",     ip: "198.51.100.5", severity: "Critical", detail: { user: "superadmin@mgatesystems.com", country: "US", previous_country: "IN", blocked: false } },
  { id: 13, timestamp: "2026-06-03 14:00", actor: "hr@mgatesystems.com",         action: "Bulk employee import: 3 records",                module: "System",       ip: "10.0.1.18",    severity: "Info",     detail: { records_imported: 3, source: "CSV upload" } },
  { id: 14, timestamp: "2026-06-03 12:30", actor: "manager@mgatesystems.com",    action: "Performance review submitted: Arjun Kumar",      module: "User Actions", ip: "10.0.1.20",    severity: "Info",     detail: { review_id: "REV-034", employee: "Arjun Kumar", rating: 4.2 } },
  { id: 15, timestamp: "2026-06-03 11:00", actor: "itadmin@mgatesystems.com",    action: "API rate limit exceeded: /api/employees",        module: "Security",     ip: "10.0.1.30",    severity: "Warning",  detail: { endpoint: "/api/employees", limit: 1000, actual: 1243, window: "1h" } },
  { id: 16, timestamp: "2026-06-03 09:45", actor: "admin@mgatesystems.com",      action: "User account suspended: mani@mgatesystems.com",         module: "User Actions", ip: "10.0.1.15",    severity: "Warning",  detail: { user: "mani@mgatesystems.com", reason: "Policy violation", suspended_by: "admin@mgatesystems.com" } },
  { id: 17, timestamp: "2026-06-02 16:10", actor: "finance@mgatesystems.com",    action: "Tax report exported: FY 2025-26",                module: "User Actions", ip: "10.0.1.22",    severity: "Info",     detail: { report: "tax_summary_fy2526", format: "PDF", size: "1.2 MB" } },
  { id: 18, timestamp: "2026-06-02 14:00", actor: "superadmin@mgatesystems.com", action: "New company tenant created: SynEx Systems",      module: "System",       ip: "203.0.113.12", severity: "Warning",  detail: { company: "SynEx Systems", plan: "Starter", admin: "rajan@synex.com" } },
  { id: 19, timestamp: "2026-06-02 11:30", actor: "admin@mgatesystems.com",      action: "Email notification template updated",            module: "System",       ip: "10.0.1.15",    severity: "Info",     detail: { template: "leave_approval", modified_fields: ["subject", "body"] } },
  { id: 20, timestamp: "2026-06-01 09:00", actor: "superadmin@mgatesystems.com", action: "Session policy updated: timeout 30 min",        module: "Security",     ip: "203.0.113.12", severity: "Warning",  detail: { policy: "session_timeout", before: "60", after: "30", unit: "minutes" } },
];

const DATE_FILTERS = ["Today", "This Week", "This Month"];
const SEVERITY_FILTERS = ["All", "Critical", "Warning", "Info"];
const ALL_TABS = ["All Logs", "Security", "System", "User Actions"];
const TABS = ALL_TABS;

const StatCard = ({ label, value, sub, surface }) => (
  <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{label.toUpperCase()}</p>
    <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{value}</p>
    <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>
  </div>
);

const SeverityBadge = ({ severity }) => {
  const s = SEVERITY_STYLES[severity] || {};
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: s.bg, color: s.text }}>
      {severity}
    </span>
  );
};

const moduleIcon = (module) => {
  if (module === "Security") return <Shield size={13} />;
  if (module === "System") return <Settings size={13} />;
  return <User size={13} />;
};

export default function AuditLogs({ darkMode = false, userRole = "SUPER_ADMIN" }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("All Logs");
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const visibleLogs = userRole === "SUPER_ADMIN" ? LOGS : LOGS.filter(l => l.module !== "Security");
  const filtered = visibleLogs.filter((l) => {
    const tabMatch = activeTab === "All Logs" || l.module === TAB_MAP[activeTab];
    const q = search.toLowerCase();
    const searchMatch = l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q);
    return tabMatch && searchMatch && (severityFilter === "All" || l.severity === severityFilter);
  });

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none",
  };

  const stats = [
    { label: "Total Events",   value: 248, sub: "all time" },
    { label: "Security Events", value: 12, sub: "this month" },
    { label: "System Changes",  value: 34, sub: "this month" },
    { label: "User Actions",   value: 202, sub: "this month" },
  ];

  const tdBase = (extra = {}) => ({ padding: "11px 16px", fontSize: FONT_SIZE.sm, color: surface.text, ...extra });

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast}
        </div>
      )}

      {userRole !== "SUPER_ADMIN" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 16px", background: COLORS.warningLight, border: `1px solid ${COLORS.warning}40`, borderRadius: RADIUS.lg }}>
          <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: FONT_WEIGHT.medium }}>View Only — You can see operational logs. Security logs are restricted to Super Admin.</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Audit Logs</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Track all system events and user actions</p>
        </div>
{userRole === "SUPER_ADMIN" && (
          <button onClick={() => showToast("Exporting logs as CSV...")} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={16} /> Export
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} surface={surface} />)}
      </div>

      <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], boxShadow: SHADOW.xs, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${surface.border}` }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 20px", fontSize: FONT_SIZE.sm, fontWeight: activeTab === tab ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal, color: activeTab === tab ? COLORS.primary : surface.subtext, background: "transparent", border: "none", borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${surface.border}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: surface.subtext }} />
            <input style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} placeholder="Search actions or actors..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select style={{ ...inputStyle, minWidth: 130 }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            {DATE_FILTERS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={{ ...inputStyle, minWidth: 120 }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            {SEVERITY_FILTERS.map((s) => <option key={s} value={s}>{s === "All" ? "All Severity" : s}</option>)}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: surface.theadBg }}>
                {["", "Timestamp", "Actor", "Action", "Module", "IP Address", "Severity"].map((col, ci) => (
                  <th key={ci} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}`, whiteSpace: "nowrap" }}>{col.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <div key={log.id} style={{ display: "contents" }}>
                  <tr style={{ background: i % 2 === 0 ? "transparent" : (darkMode ? COLORS.dark.rowHover + "20" : COLORS.gray50), cursor: "pointer" }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <td style={{ ...tdBase({ color: surface.subtext }), borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>
                      {expanded === log.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td style={{ ...tdBase({ fontSize: FONT_SIZE.xs, color: surface.subtext, whiteSpace: "nowrap" }), borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>{log.timestamp}</td>
                    <td style={{ ...tdBase(), borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>{log.actor}</td>
                    <td style={{ ...tdBase({ maxWidth: 280 }), borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>{log.action}</td>
                    <td style={{ padding: "11px 16px", borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                        {moduleIcon(log.module)} {log.module}
                      </div>
                    </td>
                    <td style={{ ...tdBase({ fontSize: FONT_SIZE.xs, color: surface.subtext, fontFamily: "monospace" }), borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>{log.ip}</td>
                    <td style={{ padding: "11px 16px", borderBottom: expanded === log.id ? "none" : `1px solid ${surface.border}` }}>
                      <SeverityBadge severity={log.severity} />
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-detail`}>
                      <td colSpan={7} style={{ padding: "0 16px 14px", borderBottom: `1px solid ${surface.border}`, background: darkMode ? COLORS.dark.rowHover + "30" : COLORS.gray50 }}>
                        <div style={{ background: surface.inputBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "12px 14px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext }}>EVENT DETAILS</p>
                          <pre style={{ margin: 0, fontSize: 12, color: surface.text, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(log.detail, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: surface.subtext, fontSize: FONT_SIZE.sm }}>No log entries found matching your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
