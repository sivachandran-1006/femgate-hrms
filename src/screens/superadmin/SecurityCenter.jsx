import { useState } from "react";
import { Shield, Plus, X, Save } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const TABS = ["Authentication", "Session Policy", "IP Restrictions", "Audit Settings"];

const Toggle = ({ checked, onChange, surface }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{ width: 44, height: 26, borderRadius: RADIUS.full, background: checked ? COLORS.primary : surface.border, border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", justifyContent: checked ? "flex-end" : "flex-start", flexShrink: 0 }}
  >
    <div style={{ width: 20, height: 20, borderRadius: RADIUS.full, background: COLORS.white, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
  </button>
);

const ToggleRow = ({ label, sub, checked, onChange, surface, last, disabled }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: last ? "none" : `1px solid ${surface.border}` }}>
    <div>
      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{label}</p>
      {sub && <p style={{ margin: "3px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>}
    </div>
    <Toggle checked={checked} onChange={disabled ? () => {} : onChange} surface={surface} />
  </div>
);

const StatCard = ({ label, value, sub, surface }) => (
  <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{label.toUpperCase()}</p>
    <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{value}</p>
    <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>
  </div>
);

export default function SecurityCenter({ darkMode = false, userRole = "SUPER_ADMIN" }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [activeTab, setActiveTab] = useState("Authentication");
  const [toast, setToast] = useState(null);

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState("10");
  const [complexityUppercase, setComplexityUppercase] = useState(true);
  const [complexityLowercase, setComplexityLowercase] = useState(true);
  const [complexityNumbers, setComplexityNumbers] = useState(true);
  const [complexitySymbols, setComplexitySymbols] = useState(false);
  const [loginAttemptLimit, setLoginAttemptLimit] = useState("5");

  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [singleSession, setSingleSession] = useState(false);
  const [rememberDevice, setRememberDevice] = useState("14");

  const [whitelistEnabled, setWhitelistEnabled] = useState(true);
  const [ipInput, setIpInput] = useState("");
  const [ipList, setIpList] = useState(["10.0.1.0/24", "203.0.113.12", "198.51.100.5"]);

  const [logRetention, setLogRetention] = useState("90");
  const [autoExport, setAutoExport] = useState(false);
  const [siemIntegration, setSiemIntegration] = useState(false);

  const isReadOnly = userRole !== "SUPER_ADMIN";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) return;
    if (ipList.includes(trimmed)) { showToast("IP already in list", "error"); return; }
    setIpList([...ipList, trimmed]);
    setIpInput("");
    showToast(`IP ${trimmed} added to whitelist`);
  };

  const handleRemoveIp = (ip) => {
    setIpList(ipList.filter((i) => i !== ip));
    showToast(`IP ${ip} removed from whitelist`, "error");
  };

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none",
  };

  const labelStyle = { display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 6 };

  const sectionHead = (text) => (
    <p style={{ margin: "0 0 14px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{text}</p>
  );

  const stats = [
    { label: "Active Sessions",    value: "8",     sub: "users online now" },
    { label: "Failed Logins Today", value: "3",    sub: "suspicious attempts" },
    { label: "MFA Enabled",        value: "5/12",  sub: "users protected" },
    { label: "Security Score",     value: "74/100", sub: "good standing" },
  ];

  const complexityOptions = [
    { label: "Uppercase letters (A–Z)", key: "upper", val: complexityUppercase, set: setComplexityUppercase },
    { label: "Lowercase letters (a–z)", key: "lower", val: complexityLowercase, set: setComplexityLowercase },
    { label: "Numbers (0–9)",           key: "nums",  val: complexityNumbers,   set: setComplexityNumbers },
    { label: "Special symbols (!@#$)",  key: "sym",   val: complexitySymbols,   set: setComplexitySymbols },
  ];

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "error" ? COLORS.danger : COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast.msg}
        </div>
      )}

      {isReadOnly && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 16px", background: COLORS.warningLight, border: `1px solid ${COLORS.warning}40`, borderRadius: RADIUS.lg }}>
          <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: FONT_WEIGHT.medium }}>View Only — Security policy configuration is restricted to Super Admin.</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Security Center</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Configure authentication, sessions and access policies</p>
        </div>
{!isReadOnly && (
          <button onClick={() => showToast("Security settings saved successfully")} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={16} /> Save Changes
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

        <div style={{ padding: 24 }}>
          {activeTab === "Authentication" && (
            <div style={{ maxWidth: 560 }}>
              {sectionHead("Multi-Factor Authentication")}
              <ToggleRow label="Require MFA for all users" sub="Users must set up MFA on next login" checked={mfaEnabled} onChange={setMfaEnabled} surface={surface}  disabled={isReadOnly}/>

              <div style={{ marginTop: 24, marginBottom: 14 }}>{sectionHead("Password Policy")}</div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Minimum Password Length</label>
                <select value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} style={{ ...inputStyle, minWidth: 120 }}>
                  {["8", "10", "12"].map((v) => <option key={v} value={v}>{v} characters</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Complexity Requirements</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {complexityOptions.map((c) => (
                    <label key={c.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={c.val} onChange={(e) => c.set(e.target.checked)} style={{ width: 15, height: 15, accentColor: COLORS.primary, cursor: "pointer" }} />
                      <span style={{ fontSize: FONT_SIZE.sm, color: surface.text }}>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Login Attempt Limit (before lockout)</label>
                <select value={loginAttemptLimit} onChange={(e) => setLoginAttemptLimit(e.target.value)} style={{ ...inputStyle, minWidth: 120 }}>
                  {["3", "5", "10"].map((v) => <option key={v} value={v}>{v} attempts</option>)}
                </select>
              </div>
            </div>
          )}

          {activeTab === "Session Policy" && (
            <div style={{ maxWidth: 560 }}>
              {sectionHead("Session Settings")}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Session Timeout</label>
                <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  {[["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 hour"], ["120", "2 hours"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <p style={{ margin: "6px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Users will be logged out after this period of inactivity.</p>
              </div>
              <ToggleRow label="Single Session Enforcement" sub="Users can only be logged in from one device at a time" checked={singleSession} onChange={setSingleSession} surface={surface}  disabled={isReadOnly}/>
              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Remember Device Duration</label>
                <select value={rememberDevice} onChange={(e) => setRememberDevice(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  {[["7", "7 days"], ["14", "14 days"], ["30", "30 days"], ["0", "Never"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {activeTab === "IP Restrictions" && (
            <div style={{ maxWidth: 560 }}>
              {sectionHead("IP Whitelist")}
              <ToggleRow label="Enable IP Whitelist" sub="Only allow logins from whitelisted IP addresses" checked={whitelistEnabled} onChange={setWhitelistEnabled} surface={surface}  disabled={isReadOnly}/>
              <div style={{ marginTop: 20, marginBottom: 16 }}>
                <label style={labelStyle}>Add IP Address or CIDR Range</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. 192.168.1.0/24 or 203.0.113.5" value={ipInput} onChange={(e) => setIpInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddIp()} />
                  <button onClick={handleAddIp} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium }}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ipList.map((ip) => (
                  <div key={ip} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: surface.inputBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.md }}>
                    <span style={{ fontSize: FONT_SIZE.sm, color: surface.text, fontFamily: "monospace" }}>{ip}</span>
                    <button onClick={() => handleRemoveIp(ip)} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.danger, display: "flex", alignItems: "center", padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {ipList.length === 0 && (
                  <div style={{ padding: 20, textAlign: "center", color: surface.subtext, fontSize: FONT_SIZE.sm }}>No IPs whitelisted. All IPs are allowed.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Audit Settings" && (
            <div style={{ maxWidth: 560 }}>
              {sectionHead("Log Retention")}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Retain Audit Logs For</label>
                <select value={logRetention} onChange={(e) => setLogRetention(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  {[["30", "30 days"], ["60", "60 days"], ["90", "90 days"], ["180", "180 days"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <p style={{ margin: "6px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Logs older than this period will be permanently deleted.</p>
              </div>
              <div style={{ marginTop: 8 }}>{sectionHead("Integrations")}</div>
              <ToggleRow label="Auto-Export Logs" sub="Automatically export logs to storage at end of each week" checked={autoExport} onChange={setAutoExport} surface={surface}  disabled={isReadOnly}/>
              <ToggleRow label="SIEM Integration" sub="Stream events to your security information and event management tool" checked={siemIntegration} onChange={setSiemIntegration} surface={surface} last  disabled={isReadOnly}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
