import { useState } from "react";
import { Bell, Lock, Building2, Shield, Save, Palette, AlertTriangle } from "lucide-react";
import { COLORS }                                                        from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                           from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                                 from "../../theme/spacing";
import { RADIUS, SHADOW, TRANSITION, ICON_SIZE, ICON_STROKE }            from "../../theme/sizes";

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44,
      height: 26,
      borderRadius: RADIUS.full,
      background: checked ? COLORS.primary : COLORS.gray300,
      border: "none",
      cursor: "pointer",
      padding: GAP.xs,
      display: "flex",
      alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      transition: TRANSITION,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: LAYOUT.avatar - 16,
        height: LAYOUT.avatar - 16,
        borderRadius: RADIUS.full,
        background: COLORS.white,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

const ToggleRow = ({ label, sub, checked, onChange, surface, isLast }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${SPACING[3]}px 0`,
      borderBottom: isLast ? "none" : `1px solid ${surface.border}`,
    }}
  >
    <div>
      <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
          {sub}
        </p>
      )}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const Settings = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const card = {
    background: surface.cardBg,
    borderRadius: RADIUS["2xl"],
    border: `1px solid ${surface.border}`,
    boxShadow: SHADOW.card,
    padding: PADDING.card,
    marginBottom: GAP.lg,
  };

  const sectionTitle = {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: surface.text,
    margin: `0 0 ${SPACING[4] + 2}px`,
    display: "flex",
    alignItems: "center",
    gap: GAP.md - 2,
  };

  const labelStyle = {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: surface.subtext,
    marginBottom: GAP.sm - 2,
    display: "block",
  };

  const inputStyle = {
    border: `1px solid ${surface.border}`,
    borderRadius: RADIUS.lg,
    padding: PADDING.input,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.normal,
    background: surface.inputBg,
    color: surface.text,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    height: LAYOUT.inputHeight,
  };

  const twoColRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: GAP.lg,
    marginBottom: SPACING[3] + 1,
  };

  // Company Information state
  const [companyName, setCompanyName] = useState("MGate Technologies");
  const [hrEmail, setHrEmail] = useState("hr@mgatetech.com");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true);
  const [leaveAlerts, setLeaveAlerts] = useState(true);
  const [payrollAlerts, setPayrollAlerts] = useState(false);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordExpiry, setPasswordExpiry] = useState("90");

  // Save state
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY.base,
        maxWidth: 820,
        color: surface.text,
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: SPACING[6],
        }}
      >
        <div>
          <h1 style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0 }}>
            Settings
          </h1>
          <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs}px 0 0` }}>
            Configure your HRMS preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: GAP.sm,
            background: saved ? COLORS.success : COLORS.primary,
            color: COLORS.white,
            border: "none",
            borderRadius: RADIUS.lg,
            padding: PADDING.btn,
            fontSize: FONT_SIZE.base,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: FONT_FAMILY.base,
            cursor: "pointer",
            transition: TRANSITION,
          }}
        >
          <Save size={FONT_SIZE.lg} strokeWidth={2} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Company Information */}
      <div style={card}>
        <p style={sectionTitle}>
          <Building2 size={ICON_SIZE.sm} color={COLORS.primary} strokeWidth={ICON_STROKE.normal} />
          Company Information
        </p>
        <div style={twoColRow}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input
              style={inputStyle}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label style={labelStyle}>HR Email</label>
            <input
              style={inputStyle}
              type="email"
              value={hrEmail}
              onChange={(e) => setHrEmail(e.target.value)}
              placeholder="hr@company.com"
            />
          </div>
        </div>
        <div style={twoColRow}>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
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
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
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
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
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
          <Bell size={ICON_SIZE.sm} color={COLORS.warning} strokeWidth={ICON_STROKE.normal} />
          Notifications
        </p>
        <ToggleRow
          label="Email Notifications"
          sub="Receive system emails for key events"
          checked={emailNotif}
          onChange={setEmailNotif}
          surface={surface}
        />
        <ToggleRow
          label="Leave Alerts"
          sub="Notify when a leave is applied or approved"
          checked={leaveAlerts}
          onChange={setLeaveAlerts}
          surface={surface}
        />
        <ToggleRow
          label="Payroll Alerts"
          sub="Notify on payroll run completion"
          checked={payrollAlerts}
          onChange={setPayrollAlerts}
          surface={surface}
        />
        <ToggleRow
          label="Attendance Alerts"
          sub="Daily attendance summary emails"
          checked={attendanceAlerts}
          onChange={setAttendanceAlerts}
          surface={surface}
          isLast
        />
      </div>

      {/* Security */}
      <div style={card}>
        <p style={sectionTitle}>
          <Shield size={ICON_SIZE.sm} color={COLORS.danger} strokeWidth={ICON_STROKE.normal} />
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
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            >
              {["15", "30", "60", "120"].map((v) => (
                <option key={v} value={v}>
                  {v} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Password Expiry (days)</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={passwordExpiry}
              onChange={(e) => setPasswordExpiry(e.target.value)}
            >
              {["30", "60", "90", "180", "Never"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={card}>
        <p style={sectionTitle}>
          <Palette size={ICON_SIZE.sm} color={COLORS.purple} strokeWidth={ICON_STROKE.normal} />
          Appearance
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${SPACING[3]}px 0`,
            borderBottom: `1px solid ${surface.border}`,
          }}
        >
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>
              Dark Mode
            </p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Controlled by the parent application
            </p>
          </div>
          <div
            style={{
              width: 44,
              height: 26,
              borderRadius: RADIUS.full,
              background: darkMode ? COLORS.primary : COLORS.gray300,
              display: "flex",
              alignItems: "center",
              justifyContent: darkMode ? "flex-end" : "flex-start",
              padding: GAP.xs,
              opacity: 0.6,
              cursor: "not-allowed",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: LAYOUT.avatar - 16,
                height: LAYOUT.avatar - 16,
                borderRadius: RADIUS.full,
                background: COLORS.white,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${SPACING[3]}px 0`,
          }}
        >
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>
              Primary Color
            </p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Current accent color used across the app
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: GAP.md - 2 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: RADIUS.full,
                background: COLORS.primary,
                border: `2px solid ${surface.border}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: FONT_SIZE.base,
                fontWeight: FONT_WEIGHT.medium,
                color: surface.subtext,
                fontFamily: "monospace",
              }}
            >
              #2563eb
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          ...card,
          border: `1px solid ${COLORS.dangerMuted}`,
          marginBottom: 0,
        }}
      >
        <p
          style={{
            ...sectionTitle,
            color: COLORS.danger,
          }}
        >
          <AlertTriangle size={ICON_SIZE.sm} color={COLORS.danger} strokeWidth={ICON_STROKE.normal} />
          Danger Zone
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, color: surface.text, margin: 0 }}>
              Reset All Settings
            </p>
            <p style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext, margin: `${GAP.xs - 1}px 0 0` }}>
              Restore all settings to factory defaults. This action cannot be undone.
            </p>
          </div>
          <button
            style={{
              background: COLORS.dangerMuted,
              color: COLORS.danger,
              border: `1px solid ${COLORS.dangerMuted}`,
              borderRadius: RADIUS.lg,
              padding: PADDING.btn,
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.semibold,
              fontFamily: FONT_FAMILY.base,
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: SPACING[6],
            }}
            onClick={() => {
              if (window.confirm("Reset all settings to factory defaults?")) {
                setCompanyName("MGate Technologies");
                setHrEmail("hr@mgatetech.com");
                setTimezone("Asia/Kolkata");
                setCurrency("INR");
                setLanguage("English");
                setEmailNotif(true);
                setLeaveAlerts(true);
                setPayrollAlerts(false);
                setAttendanceAlerts(true);
                setTwoFactor(false);
                setSessionTimeout("30");
                setPasswordExpiry("90");
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
