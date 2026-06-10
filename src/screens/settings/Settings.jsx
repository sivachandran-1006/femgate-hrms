import { useState, useEffect } from "react";
import {
  IconBell, IconBuilding, IconShield, IconDeviceFloppy,
  IconPalette, IconAlertTriangle, IconLoader2,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { COLORS }                                              from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                 from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                       from "../../theme/spacing";
import { RADIUS, SHADOW, TRANSITION, ICON_SIZE, ICON_STROKE }  from "../../theme/sizes";
import { useToast }                                            from "../../components/ui/Toast";
import {
  getCompanySettings, updateCompanySettings,
  getNotificationSettings, updateNotificationSettings,
} from "../../api/companyApi";
import { getSecuritySettings, updateSecuritySettings } from "../../api/securityApi";

// The 4 page toggles map to notification-setting rows in the DB
const NOTIF_DEFS = [
  { id: "email_global",       label: "Email Notifications", sub: "Receive system emails for key events",     channel: "Email",          trigger: "Global email switch" },
  { id: "leave_apply",        label: "Leave Alerts",        sub: "Notify when a leave is applied or approved", channel: "In-App + Email", trigger: "When employee applies leave" },
  { id: "payroll_run",        label: "Payroll Alerts",      sub: "Notify on payroll run completion",          channel: "In-App",         trigger: "When payroll is generated" },
  { id: "attendance_summary", label: "Attendance Alerts",   sub: "Daily attendance summary emails",           channel: "Email",          trigger: "Daily attendance digest" },
];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 26, borderRadius: RADIUS.full,
      background: checked ? COLORS.primary : COLORS.gray300,
      border: "none", cursor: "pointer", padding: GAP.xs,
      display: "flex", alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      transition: TRANSITION, flexShrink: 0,
    }}
  >
    <div style={{ width: LAYOUT.avatar - 16, height: LAYOUT.avatar - 16, borderRadius: RADIUS.full, background: COLORS.white, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
  </button>
);

const ToggleRow = ({ label, sub, checked, onChange, surface, isLast }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px 0`, borderBottom: isLast ? "none" : `1px solid ${surface.border}` }}>
    <div>
      <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>{label}</p>
      {sub && <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>{sub}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const Settings = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const { show } = useToast();
  const queryClient = useQueryClient();

  // ── Server data ──
  const { data: companyData }  = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings,      select: (r) => r?.data ?? r });
  const { data: notifData }    = useQuery({ queryKey: ["notif-settings"],   queryFn: getNotificationSettings, select: (r) => r?.data ?? r });
  const { data: securityData } = useQuery({ queryKey: ["security-settings"],queryFn: getSecuritySettings,     select: (r) => r?.data ?? r });

  // ── Local form state ──
  const [companyName, setCompanyName] = useState("");
  const [hrEmail, setHrEmail]         = useState("");
  const [timezone, setTimezone]       = useState("Asia/Kolkata");
  const [currency, setCurrency]       = useState("INR");
  const [language, setLanguage]       = useState(localStorage.getItem("hrms-language") || "English");

  const [toggles, setToggles] = useState({ email_global: true, leave_apply: true, payroll_run: true, attendance_summary: true });

  const [twoFactor, setTwoFactor]           = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordExpiry, setPasswordExpiry] = useState(localStorage.getItem("hrms-password-expiry") || "90");

  // Sync from server once loaded
  useEffect(() => {
    const p = companyData?.profile;
    if (p) {
      setCompanyName(p.name || "");
      setHrEmail(p.email || "");
      setTimezone(p.timezone || "Asia/Kolkata");
      setCurrency(p.currency || "INR");
    }
  }, [companyData]);

  useEffect(() => {
    const rows = notifData?.notifications;
    if (rows) {
      setToggles((prev) => {
        const next = { ...prev };
        for (const def of NOTIF_DEFS) {
          const row = rows.find((r) => r.id === def.id);
          if (row) next[def.id] = row.active;
        }
        return next;
      });
    }
  }, [notifData]);

  useEffect(() => {
    if (securityData) {
      setTwoFactor(!!securityData.mfaEnabled);
      setSessionTimeout(String(securityData.sessionTimeout || "30"));
    }
  }, [securityData]);

  // ── Save ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateCompanySettings({
        profile: { name: companyName, email: hrEmail, timezone, currency },
      });
      await updateNotificationSettings({
        notifications: NOTIF_DEFS.map((d) => ({ ...d, active: toggles[d.id] })),
      });
      await updateSecuritySettings({
        mfaEnabled:         twoFactor,
        sessionTimeout,
        // echo back unrelated security flags so they are not clobbered
        ipWhitelistEnabled: securityData?.ipWhitelistEnabled ?? false,
        auditLogging:       securityData?.auditLogging ?? false,
      });
      localStorage.setItem("hrms-language", language);
      localStorage.setItem("hrms-password-expiry", passwordExpiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      queryClient.invalidateQueries({ queryKey: ["notif-settings"] });
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      show("Settings saved", "success");
    },
    onError: () => show("Failed to save settings", "error"),
  });

  const [saved, setSaved] = useState(false);
  const handleSave = () => saveMutation.mutate();

  const setToggle = (id) => (v) => setToggles((t) => ({ ...t, [id]: v }));

  const card = {
    background: surface.cardBg, borderRadius: RADIUS["2xl"],
    border: `1px solid ${surface.border}`, boxShadow: SHADOW.card,
    padding: PADDING.card, marginBottom: GAP.lg,
  };
  const sectionTitle = {
    fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text,
    margin: `0 0 ${SPACING[4] + 2}px`, display: "flex", alignItems: "center", gap: GAP.md - 2,
  };
  const labelStyle = {
    fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.subtext,
    marginBottom: GAP.sm - 2, display: "block",
  };
  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: PADDING.input,
    fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.normal, background: surface.inputBg,
    color: surface.text, fontFamily: FONT_FAMILY.base, outline: "none",
    width: "100%", boxSizing: "border-box", height: LAYOUT.inputHeight,
  };
  const twoColRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg, marginBottom: SPACING[3] + 1 };

  return (
    <div style={{ fontFamily: FONT_FAMILY.base, maxWidth: 820, color: surface.text }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[6] }}>
        <div>
          <h1 style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs}px 0 0` }}>
            Configure your HRMS preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          style={{
            display: "flex", alignItems: "center", gap: GAP.sm,
            background: saved ? COLORS.success : COLORS.primary, color: COLORS.white,
            border: "none", borderRadius: RADIUS.lg, padding: PADDING.btn,
            fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base,
            cursor: saveMutation.isPending ? "wait" : "pointer", transition: TRANSITION,
            opacity: saveMutation.isPending ? 0.7 : 1,
          }}
        >
          {saveMutation.isPending
            ? <IconLoader2 size={FONT_SIZE.lg} style={{ animation: "spin 1s linear infinite" }} />
            : <IconDeviceFloppy size={FONT_SIZE.lg} stroke={2} />}
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Company Information */}
      <div style={card}>
        <p style={sectionTitle}>
          <IconBuilding size={ICON_SIZE.sm} color={COLORS.primary} stroke={ICON_STROKE.normal} />
          Company Information
        </p>
        <div style={twoColRow}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" />
          </div>
          <div>
            <label style={labelStyle}>HR Email</label>
            <input style={inputStyle} type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="hr@company.com" />
          </div>
        </div>
        <div style={twoColRow}>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="SGD">SGD — Singapore Dollar (S$)</option>
              <option value="AUD">AUD — Australian Dollar (A$)</option>
            </select>
          </div>
        </div>
        <div style={{ maxWidth: "calc(50% - 8px)" }}>
          <label style={labelStyle}>Language</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Kannada">Kannada</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div style={card}>
        <p style={sectionTitle}>
          <IconBell size={ICON_SIZE.sm} color={COLORS.warning} stroke={ICON_STROKE.normal} />
          Notifications
        </p>
        {NOTIF_DEFS.map((d, i) => (
          <ToggleRow
            key={d.id}
            label={d.label}
            sub={d.sub}
            checked={toggles[d.id]}
            onChange={setToggle(d.id)}
            surface={surface}
            isLast={i === NOTIF_DEFS.length - 1}
          />
        ))}
      </div>

      {/* Security */}
      <div style={card}>
        <p style={sectionTitle}>
          <IconShield size={ICON_SIZE.sm} color={COLORS.danger} stroke={ICON_STROKE.normal} />
          Security
        </p>
        <ToggleRow
          label="Two-Factor Authentication"
          sub="Require OTP on every login"
          checked={twoFactor}
          onChange={setTwoFactor}
          surface={surface}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg, marginTop: GAP.lg }}>
          <div>
            <label style={labelStyle}>Session Timeout (minutes)</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
              {["15", "30", "60", "120"].map((v) => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Password Expiry (days)</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={passwordExpiry} onChange={(e) => setPasswordExpiry(e.target.value)}>
              {["30", "60", "90", "180", "Never"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={card}>
        <p style={sectionTitle}>
          <IconPalette size={ICON_SIZE.sm} color={COLORS.purple} stroke={ICON_STROKE.normal} />
          Appearance
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px 0`, borderBottom: `1px solid ${surface.border}` }}>
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>Dark Mode</p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Controlled by the sidebar toggle
            </p>
          </div>
          <div style={{ width: 44, height: 26, borderRadius: RADIUS.full, background: darkMode ? COLORS.primary : COLORS.gray300, display: "flex", alignItems: "center", justifyContent: darkMode ? "flex-end" : "flex-start", padding: GAP.xs, opacity: 0.6, cursor: "not-allowed", flexShrink: 0 }}>
            <div style={{ width: LAYOUT.avatar - 16, height: LAYOUT.avatar - 16, borderRadius: RADIUS.full, background: COLORS.white, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px 0` }}>
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>Primary Color</p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Set in Company Settings → Branding
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: GAP.md - 2 }}>
            <div style={{ width: 26, height: 26, borderRadius: RADIUS.full, background: companyData?.branding?.primaryColor || COLORS.primary, border: `2px solid ${surface.border}`, flexShrink: 0 }} />
            <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, fontFamily: "monospace" }}>
              {companyData?.branding?.primaryColor || "#2563eb"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...card, border: `1px solid ${COLORS.dangerMuted}`, marginBottom: 0 }}>
        <p style={{ ...sectionTitle, color: COLORS.danger }}>
          <IconAlertTriangle size={ICON_SIZE.sm} color={COLORS.danger} stroke={ICON_STROKE.normal} />
          Danger Zone
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>Reset All Settings</p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Restore all settings to factory defaults and save. This action cannot be undone.
            </p>
          </div>
          <button
            style={{
              background: COLORS.dangerMuted, color: COLORS.danger, border: `1px solid ${COLORS.dangerMuted}`,
              borderRadius: RADIUS.lg, padding: PADDING.btn, fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer",
              flexShrink: 0, marginLeft: SPACING[6],
            }}
            onClick={() => {
              if (window.confirm("Reset all settings to factory defaults?")) {
                setTimezone("Asia/Kolkata");
                setCurrency("INR");
                setLanguage("English");
                setToggles({ email_global: true, leave_apply: true, payroll_run: true, attendance_summary: true });
                setTwoFactor(false);
                setSessionTimeout("30");
                setPasswordExpiry("90");
                show("Defaults restored — click Save Changes to apply", "info");
              }
            }}
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
