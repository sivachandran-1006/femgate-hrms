import { useState } from "react";
import { Search, Plus, RefreshCw, Settings, Unplug, Plug } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const INTEGRATIONS = [
  { id: 1, name: "Microsoft 365", category: "Productivity", status: "Connected", lastSync: "5m ago", color: "#0078d4", desc: "Email, calendar and Teams integration" },
  { id: 2, name: "Google Workspace", category: "Productivity", status: "Connected", lastSync: "10m ago", color: "#4285f4", desc: "Gmail, Drive and Meet integration" },
  { id: 3, name: "Slack", category: "Communication", status: "Connected", lastSync: "2m ago", color: "#4a154b", desc: "Notifications and bot commands" },
  { id: 4, name: "Microsoft Teams", category: "Communication", status: "Available", lastSync: null, color: "#6264a7", desc: "Video calls and team channels" },
  { id: 5, name: "Zoom", category: "Communication", status: "Available", lastSync: null, color: "#2d8cff", desc: "Video conferencing for interviews" },
  { id: 6, name: "Freshservice", category: "HR", status: "Connected", lastSync: "1h ago", color: COLORS.success, desc: "IT service desk sync" },
  { id: 7, name: "Workday", category: "HR", status: "Available", lastSync: null, color: COLORS.warning, desc: "HRIS data sync" },
  { id: 8, name: "SAP SuccessFactors", category: "HR", status: "Error", lastSync: "Failed", color: "#e87722", desc: "Enterprise HR platform" },
  { id: 9, name: "Okta", category: "Security", status: "Available", lastSync: null, color: "#007dc1", desc: "SSO and identity management" },
  { id: 10, name: "Azure AD", category: "Security", status: "Available", lastSync: null, color: "#0078d4", desc: "Directory and SSO integration" },
  { id: 11, name: "Jira", category: "Productivity", status: "Available", lastSync: null, color: "#0052cc", desc: "Project and issue tracking" },
  { id: 12, name: "Notion", category: "Productivity", status: "Available", lastSync: null, color: COLORS.gray900, desc: "Wiki and knowledge base" },
];

const CATEGORIES = ["All", "Communication", "HR", "Productivity", "Security"];

const STATUS_STYLES = {
  Connected: { bg: COLORS.successLight, text: COLORS.success },
  Available: { bg: COLORS.gray100,      text: COLORS.gray600 },
  Error:     { bg: COLORS.dangerMuted,  text: COLORS.danger },
};

const CATEGORY_STYLES = {
  Productivity:  { bg: COLORS.primaryLight, text: COLORS.primary },
  Communication: { bg: COLORS.purpleMuted,  text: COLORS.purple },
  HR:            { bg: COLORS.successLight, text: COLORS.success },
  Security:      { bg: COLORS.warningLight, text: COLORS.warning },
};

const Badge = ({ styles, children }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: styles?.bg, color: styles?.text, flexShrink: 0 }}>
    {children}
  </span>
);

const StatCard = ({ label, value, sub, surface }) => (
  <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{label.toUpperCase()}</p>
    <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{value}</p>
    <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>
  </div>
);

export default function Integrations({ darkMode = false, userRole = "SUPER_ADMIN" }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState(null);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [showAddModal, setShowAddModal] = useState(false);

  const isReadOnly = userRole !== "SUPER_ADMIN";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = (id) => {
    const name = integrations.find((i) => i.id === id)?.name;
    setIntegrations(integrations.map((i) => i.id !== id ? i : { ...i, status: "Connected", lastSync: "Just now" }));
    showToast(`${name} connected successfully`);
  };

  const handleDisconnect = (id) => {
    const name = integrations.find((i) => i.id === id)?.name;
    setIntegrations(integrations.map((i) => i.id !== id ? i : { ...i, status: "Available", lastSync: null }));
    showToast(`${name} disconnected`, "error");
  };

  const handleConfigure = (name) => showToast(`Opening configuration for ${name}...`);
  const handleSync = (name) => showToast(`Syncing ${name}...`);

  const filtered = integrations.filter((i) => {
    const q = search.toLowerCase();
    return (i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
      && (category === "All" || i.category === category);
  });

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none",
  };

  const stats = [
    { label: "Active",         value: integrations.filter((i) => i.status === "Connected").length, sub: "connected integrations" },
    { label: "Available",      value: integrations.filter((i) => i.status === "Available").length, sub: "ready to connect" },
    { label: "Failed",         value: integrations.filter((i) => i.status === "Error").length,     sub: "needs attention" },
    { label: "API Calls Today", value: "2,847", sub: "across all integrations" },
  ];

  const iconBtn = (icon, label, onClick, style) => (
    <button key={label} onClick={onClick} style={{ flex: 1, padding: "7px 0", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, borderRadius: RADIUS.md, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, ...style }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "error" ? COLORS.danger : COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast.msg}
        </div>
      )}

      {isReadOnly && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 16px", background: COLORS.warningLight, border: `1px solid ${COLORS.warning}40`, borderRadius: RADIUS.lg }}>
          <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: FONT_WEIGHT.medium }}>View Only — Connecting, disconnecting and configuring integrations is restricted to Super Admin.</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Integrations</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Connect third-party tools to this platform</p>
        </div>
{!isReadOnly && (
          <button onClick={() => setShowAddModal(true)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Integration
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} surface={surface} />)}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: surface.subtext }} />
          <input style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "8px 14px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, borderRadius: RADIUS.lg, border: `1px solid ${category === cat ? COLORS.primary : surface.border}`, background: category === cat ? COLORS.primaryMuted : surface.inputBg, color: category === cat ? COLORS.primary : surface.subtext, cursor: "pointer" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((intg) => (
          <div key={intg.id} style={{ background: surface.cardBg, border: `1px solid ${intg.status === "Error" ? COLORS.dangerLight : surface.border}`, borderRadius: RADIUS["2xl"], padding: 20, boxShadow: SHADOW.xs, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: RADIUS.lg, background: intg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold }}>{intg.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{intg.name}</p>
                  <Badge styles={CATEGORY_STYLES[intg.category]}>{intg.category}</Badge>
                </div>
              </div>
              <Badge styles={STATUS_STYLES[intg.status]}>{intg.status}</Badge>
            </div>

            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext, lineHeight: 1.5 }}>{intg.desc}</p>

            {intg.lastSync && (
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: intg.status === "Error" ? COLORS.danger : surface.subtext }}>
                {intg.status === "Error" ? "Last sync: " : "Last synced: "}{intg.lastSync}
              </p>
            )}

            {!isReadOnly && <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
              {intg.status === "Connected" && (
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  {iconBtn(<RefreshCw size={12} />, "Sync", () => handleSync(intg.name), { border: `1px solid ${surface.border}`, background: "transparent", color: surface.subtext })}
                  {iconBtn(<Settings size={12} />, "Configure", () => handleConfigure(intg.name), { border: `1px solid ${surface.border}`, background: "transparent", color: surface.subtext })}
                  {iconBtn(<Unplug size={12} />, "Disconnect", () => handleDisconnect(intg.id), { border: `1px solid ${COLORS.dangerLight}`, background: COLORS.dangerMuted, color: COLORS.danger })}
                </div>
              )}
              {intg.status === "Available" && (
                <button onClick={() => handleConnect(intg.id)} style={{ width: "100%", padding: "8px 0", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, border: `1px solid ${COLORS.primary}`, borderRadius: RADIUS.md, background: COLORS.primaryMuted, color: COLORS.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plug size={14} /> Connect
                </button>
              )}
              {intg.status === "Error" && (
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  {iconBtn(null, "Reconnect", () => handleConnect(intg.id), { border: `1px solid ${COLORS.warning}`, background: COLORS.warningLight, color: COLORS.warning, fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.sm })}
                  {iconBtn(null, "Configure", () => handleConfigure(intg.name), { border: `1px solid ${surface.border}`, background: "transparent", color: surface.subtext, fontSize: FONT_SIZE.sm })}
                </div>
              )}
            </div>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: surface.subtext, fontSize: FONT_SIZE.sm }}>No integrations found matching your search.</div>
      )}

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: 28, width: 440, boxShadow: SHADOW.modal }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Request New Integration</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center" }}><Plus size={16} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Submit a request for an integration not listed here. Our team will evaluate and add it to the catalogue.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Integration Name *", "text", "e.g. Salesforce CRM"], ["Category", "select", null], ["Reason / Use Case", "textarea", "Describe why this integration is needed..."]].map(([label, type, placeholder]) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 5 }}>{label}</label>
                  {type === "select" ? (
                    <select style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}>
                      {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : type === "textarea" ? (
                    <textarea style={{ ...inputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 72 }} placeholder={placeholder} />
                  ) : (
                    <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder={placeholder} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, cursor: "pointer", color: surface.text }}>Cancel</button>
              <button onClick={() => { setShowAddModal(false); showToast("Integration request submitted"); }} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer" }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
