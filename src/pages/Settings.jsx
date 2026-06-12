import { useState } from "react";
import { Bell, Lock, Building2, Shield, Save, Palette, AlertTriangle } from "lucide-react";

const getTheme = (darkMode) =>
  darkMode
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

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44,
      height: 26,
      borderRadius: 999,
      background: checked ? "#2563eb" : "#cbd5e1",
      border: "none",
      cursor: "pointer",
      padding: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      transition: "background 0.2s",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

const ToggleRow = ({ label, sub, checked, onChange, theme, isLast }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "13px 0",
      borderBottom: isLast ? "none" : "1px solid " + theme.border,
    }}
  >
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0 }}>{label}</p>
      {sub && (
        <p style={{ fontSize: 12, fontWeight: 400, color: theme.subtext, margin: "3px 0 0" }}>
          {sub}
        </p>
      )}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const Settings = ({ darkMode = false }) => {
  const theme = getTheme(darkMode);

  const card = {
    background: theme.cardBg,
    borderRadius: 14,
    border: "1px solid " + theme.border,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: "20px 24px",
    marginBottom: 16,
  };

  const sectionTitle = {
    fontSize: 15,
    fontWeight: 700,
    color: theme.text,
    margin: "0 0 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: theme.subtext,
    marginBottom: 6,
    display: "block",
  };

  const inputStyle = {
    border: "1px solid " + theme.inputBorder,
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 400,
    background: theme.inputBg,
    color: theme.text,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    height: 38,
  };

  const twoColRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 14,
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
        fontFamily: "'Inter', sans-serif",
        maxWidth: 820,
        color: theme.text,
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: 0 }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, fontWeight: 400, color: theme.subtext, margin: "4px 0 0" }}>
            Configure your HRMS preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: saved ? "#16a34a" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <Save size={15} strokeWidth={2} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Company Information */}
      <div style={card}>
        <p style={sectionTitle}>
          <Building2 size={16} color="#2563eb" strokeWidth={1.8} />
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
          <Bell size={16} color="#d97706" strokeWidth={1.8} />
          Notifications
        </p>
        <ToggleRow
          label="Email Notifications"
          sub="Receive system emails for key events"
          checked={emailNotif}
          onChange={setEmailNotif}
          theme={theme}
        />
        <ToggleRow
          label="Leave Alerts"
          sub="Notify when a leave is applied or approved"
          checked={leaveAlerts}
          onChange={setLeaveAlerts}
          theme={theme}
        />
        <ToggleRow
          label="Payroll Alerts"
          sub="Notify on payroll run completion"
          checked={payrollAlerts}
          onChange={setPayrollAlerts}
          theme={theme}
        />
        <ToggleRow
          label="Attendance Alerts"
          sub="Daily attendance summary emails"
          checked={attendanceAlerts}
          onChange={setAttendanceAlerts}
          theme={theme}
          isLast
        />
      </div>

      {/* Security */}
      <div style={card}>
        <p style={sectionTitle}>
          <Shield size={16} color="#ef4444" strokeWidth={1.8} />
          Security
        </p>
        <ToggleRow
          label="Two-Factor Authentication"
          sub="Require OTP on every login"
          checked={twoFactor}
          onChange={setTwoFactor}
          theme={theme}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
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
          <Palette size={16} color="#7c3aed" strokeWidth={1.8} />
          Appearance
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 0",
            borderBottom: "1px solid " + theme.border,
          }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0 }}>
              Dark Mode
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: theme.subtext, margin: "3px 0 0" }}>
              Controlled by the parent application
            </p>
          </div>
          <div
            style={{
              width: 44,
              height: 26,
              borderRadius: 999,
              background: darkMode ? "#2563eb" : "#cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: darkMode ? "flex-end" : "flex-start",
              padding: 3,
              opacity: 0.6,
              cursor: "not-allowed",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#fff",
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
            padding: "13px 0",
          }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0 }}>
              Primary Color
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: theme.subtext, margin: "3px 0 0" }}>
              Current accent color used across the app
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#2563eb",
                border: "2px solid " + theme.border,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: theme.subtext,
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
          border: "1px solid #fecaca",
          marginBottom: 0,
        }}
      >
        <p
          style={{
            ...sectionTitle,
            color: "#ef4444",
          }}
        >
          <AlertTriangle size={16} color="#ef4444" strokeWidth={1.8} />
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
            <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0 }}>
              Reset All Settings
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: theme.subtext, margin: "3px 0 0" }}>
              Restore all settings to factory defaults. This action cannot be undone.
            </p>
          </div>
          <button
            style={{
              background: "#fef2f2",
              color: "#ef4444",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 24,
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
