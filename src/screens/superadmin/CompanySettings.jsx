import { useState } from "react";
import { Building2, Palette, Mail, Bell, Upload, Save, Check, Globe, Phone, MapPin, FileText, ChevronRight } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const TABS = [
  { id: "profile",    label: "Company Profile",    icon: Building2 },
  { id: "branding",   label: "Branding",           icon: Palette   },
  { id: "email",      label: "Email Templates",    icon: Mail      },
  { id: "notif",      label: "Notification Templates", icon: Bell  },
];

const INIT_COMPANY = {
  name: "MGate Systems",
  legalName: "MGate Systems Pvt. Ltd.",
  gstin: "29ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  cin: "U72900KA2020PTC123456",
  email: "contact@mgatesystems.com",
  phone: "+91 98765 43210",
  website: "www.mgatesystems.com",
  address: "123, Tech Park, Whitefield",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560066",
  country: "India",
  industry: "Information Technology",
  employees: "50-200",
  founded: "2020",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  fiscalYear: "April - March",
};

const INIT_BRANDING = {
  primaryColor: "#2563eb",
  accentColor:  "#7c3aed",
  logoUrl: "",
  faviconUrl: "",
  companyTagline: "Empowering People. Enabling Growth.",
  emailHeader: "MGate HRMS",
  footerText: "© 2026 MGate Systems Pvt. Ltd. All rights reserved.",
};

const EMAIL_TEMPLATES = [
  { id: "welcome",        label: "Welcome Email",          subject: "Welcome to MGate HRMS!", preview: "Dear {{employee_name}}, Welcome aboard! Your account has been created..." },
  { id: "leave_approval", label: "Leave Approval",         subject: "Leave Request Approved",  preview: "Dear {{employee_name}}, Your {{leave_type}} leave from {{from_date}} to {{to_date}} has been approved..." },
  { id: "leave_reject",   label: "Leave Rejection",        subject: "Leave Request Rejected",  preview: "Dear {{employee_name}}, Unfortunately your leave request has been rejected..." },
  { id: "payslip",        label: "Payslip Notification",   subject: "Your Payslip for {{month}} is Ready", preview: "Dear {{employee_name}}, Your payslip for {{month}} {{year}} is now available..." },
  { id: "reset_pass",     label: "Password Reset",         subject: "Reset Your Password",     preview: "Hi {{name}}, A password reset was requested for your account..." },
  { id: "birthday",       label: "Birthday Greetings",     subject: "Happy Birthday {{name}}!", preview: "Dear {{name}}, Wishing you a very Happy Birthday from the entire MGate family!..." },
];

const NOTIF_TEMPLATES = [
  { id: "leave_apply",    label: "Leave Applied",          channel: "In-App + Email", trigger: "When employee applies leave",          active: true  },
  { id: "leave_approved", label: "Leave Approved/Rejected",channel: "In-App + Email", trigger: "When manager acts on leave request",   active: true  },
  { id: "payroll_run",    label: "Payroll Processed",       channel: "In-App",         trigger: "When payroll is generated",            active: true  },
  { id: "asset_assign",   label: "Asset Assigned",          channel: "In-App + Email", trigger: "When asset is assigned to employee",  active: true  },
  { id: "birthday",       label: "Birthday Reminder",       channel: "In-App",         trigger: "Day of employee birthday",             active: false },
  { id: "doc_expiry",     label: "Document Expiry Alert",   channel: "Email",          trigger: "30 days before document expiry",       active: true  },
  { id: "task_due",       label: "Task Due Reminder",       channel: "In-App",         trigger: "1 day before task due date",           active: false },
];

export default function CompanySettings({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [tab, setTab] = useState("profile");
  const [company, setCompany] = useState(INIT_COMPANY);
  const [branding, setBranding] = useState(INIT_BRANDING);
  const [editTemplate, setEditTemplate] = useState(null);
  const [notifTemplates, setNotifTemplates] = useState(NOTIF_TEMPLATES);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none", width: "100%", boxSizing: "border-box",
  };
  const labelStyle = { display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };
  const cardStyle = { background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: 24, boxShadow: SHADOW.xs };
  const btnPrimary = { background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "9px 20px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 };

  const Field = ({ label, value, onChange, type = "text", half }) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, sub }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: RADIUS.xl, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={COLORS.primary} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{title}</p>
        {sub && <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>}
      </div>
    </div>
  );

  // ── Profile tab ──────────────────────────────────────────────────────────────
  const ProfileTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <SectionTitle icon={Building2} title="Basic Information" sub="Legal and contact details" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Company Name" value={company.name} onChange={v => setCompany(p => ({ ...p, name: v }))} half />
          <Field label="Legal Name" value={company.legalName} onChange={v => setCompany(p => ({ ...p, legalName: v }))} half />
          <Field label="GSTIN" value={company.gstin} onChange={v => setCompany(p => ({ ...p, gstin: v }))} half />
          <Field label="PAN" value={company.pan} onChange={v => setCompany(p => ({ ...p, pan: v }))} half />
          <Field label="CIN" value={company.cin} onChange={v => setCompany(p => ({ ...p, cin: v }))} half />
          <Field label="Industry" value={company.industry} onChange={v => setCompany(p => ({ ...p, industry: v }))} half />
          <Field label="Founded Year" value={company.founded} onChange={v => setCompany(p => ({ ...p, founded: v }))} half />
          <SelectField label="Company Size" value={company.employees} onChange={v => setCompany(p => ({ ...p, employees: v }))} options={["1-10","11-50","50-200","200-500","500-1000","1000+"]} />
        </div>
      </div>

      <div style={cardStyle}>
        <SectionTitle icon={Globe} title="Contact & Location" sub="Registered address and contact info" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Email" value={company.email} onChange={v => setCompany(p => ({ ...p, email: v }))} half />
          <Field label="Phone" value={company.phone} onChange={v => setCompany(p => ({ ...p, phone: v }))} half />
          <Field label="Website" value={company.website} onChange={v => setCompany(p => ({ ...p, website: v }))} half />
          <div />
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Address</label>
            <input value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))} style={inputStyle} />
          </div>
          <Field label="City" value={company.city} onChange={v => setCompany(p => ({ ...p, city: v }))} half />
          <Field label="State" value={company.state} onChange={v => setCompany(p => ({ ...p, state: v }))} half />
          <Field label="Pincode" value={company.pincode} onChange={v => setCompany(p => ({ ...p, pincode: v }))} half />
          <Field label="Country" value={company.country} onChange={v => setCompany(p => ({ ...p, country: v }))} half />
        </div>
      </div>

      <div style={cardStyle}>
        <SectionTitle icon={Globe} title="Regional Settings" sub="Timezone, currency and formats" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <SelectField label="Timezone" value={company.timezone} onChange={v => setCompany(p => ({ ...p, timezone: v }))} options={["Asia/Kolkata","Asia/Dubai","America/New_York","Europe/London","Asia/Singapore"]} />
          <SelectField label="Currency" value={company.currency} onChange={v => setCompany(p => ({ ...p, currency: v }))} options={["INR","USD","EUR","GBP","AED","SGD"]} />
          <SelectField label="Date Format" value={company.dateFormat} onChange={v => setCompany(p => ({ ...p, dateFormat: v }))} options={["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]} />
          <SelectField label="Fiscal Year" value={company.fiscalYear} onChange={v => setCompany(p => ({ ...p, fiscalYear: v }))} options={["April - March","January - December","October - September"]} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btnPrimary} onClick={() => showToast("Company profile saved successfully")}><Save size={14} /> Save Changes</button>
      </div>
    </div>
  );

  // ── Branding tab ─────────────────────────────────────────────────────────────
  const BrandingTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <SectionTitle icon={Upload} title="Logo & Favicon" sub="Upload your company logo and favicon" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[{ key: "logoUrl", label: "Company Logo", hint: "Recommended: 200×60px PNG/SVG" }, { key: "faviconUrl", label: "Favicon", hint: "Recommended: 32×32px PNG/ICO" }].map(({ key, label, hint }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <div style={{ border: `2px dashed ${surface.border}`, borderRadius: RADIUS.xl, padding: 24, textAlign: "center", background: surface.inputBg, cursor: "pointer" }}
                onClick={() => showToast("File upload coming in production build")}>
                <Upload size={24} color={surface.subtext} strokeWidth={1.5} style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>Click to upload</p>
                <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <SectionTitle icon={Palette} title="Brand Colors" sub="Primary and accent colors used in the app" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[{ key: "primaryColor", label: "Primary Color" }, { key: "accentColor", label: "Accent Color" }].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={branding[key]} onChange={e => setBranding(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: 40, height: 38, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, cursor: "pointer", background: "none", padding: 2 }} />
                <input value={branding[key]} onChange={e => setBranding(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }} />
                <div style={{ width: 32, height: 32, borderRadius: RADIUS.lg, background: branding[key], border: `1px solid ${surface.border}`, flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <SectionTitle icon={FileText} title="Brand Text" sub="Tagline and footer used in emails and app" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "emailHeader", label: "Email Header Text" },
            { key: "companyTagline", label: "Company Tagline" },
            { key: "footerText", label: "Email Footer Text" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input value={branding[key]} onChange={e => setBranding(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btnPrimary} onClick={() => showToast("Branding saved successfully")}><Save size={14} /> Save Branding</button>
      </div>
    </div>
  );

  // ── Email Templates tab ──────────────────────────────────────────────────────
  const EmailTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Email Templates</p>
        <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Customize automated emails sent to employees. Use {"{{"} {"}}"}variable{"{{"} {"}"} placeholders.</p>
      </div>
      {EMAIL_TEMPLATES.map(tpl => (
        <div key={tpl.id} style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{tpl.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Subject: {tpl.subject}</p>
              <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>{tpl.preview}</p>
            </div>
            <button onClick={() => setEditTemplate(tpl)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: RADIUS.lg, border: `1px solid ${surface.border}`, background: "transparent", cursor: "pointer", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, fontFamily: FONT_FAMILY.base, whiteSpace: "nowrap", flexShrink: 0, marginLeft: 16 }}>
              Edit <ChevronRight size={12} />
            </button>
          </div>
        </div>
      ))}

      {editTemplate && (
        <div onClick={() => setEditTemplate(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], width: "100%", maxWidth: 560, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${surface.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Edit: {editTemplate.label}</p>
              <button onClick={() => setEditTemplate(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: surface.subtext, fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <input defaultValue={editTemplate.subject} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Body</label>
                <textarea defaultValue={editTemplate.preview + "\n\nRegards,\n{{company_name}} HR Team"} rows={8} style={{ ...inputStyle, resize: "vertical", height: "auto", paddingTop: 8, paddingBottom: 8, fontFamily: "monospace", fontSize: 12 }} />
              </div>
              <div style={{ background: COLORS.primaryMuted, borderRadius: RADIUS.lg, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.primary, marginBottom: 4 }}>AVAILABLE VARIABLES</p>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.primary, fontFamily: "monospace" }}>{"{{employee_name}}  {{company_name}}  {{leave_type}}  {{from_date}}  {{to_date}}  {{month}}  {{year}}"}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setEditTemplate(null)} style={{ padding: "8px 16px", borderRadius: RADIUS.lg, border: `1px solid ${surface.border}`, background: "transparent", color: surface.subtext, fontSize: FONT_SIZE.sm, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>Cancel</button>
                <button onClick={() => { setEditTemplate(null); showToast(`"${editTemplate.label}" template saved`); }} style={btnPrimary}><Save size={13} /> Save Template</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Notification Templates tab ───────────────────────────────────────────────
  const NotifTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Notification Templates</p>
        <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Control when and how notifications are sent to users.</p>
      </div>
      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: surface.theadBg }}>
              {["Notification", "Channel", "Trigger", "Active"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}` }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifTemplates.map((n, i) => (
              <tr key={n.id} style={{ background: i % 2 === 0 ? "transparent" : (darkMode ? "#1e293b20" : "#f8fafc") }}>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{n.label}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                  <span style={{ fontSize: 11, background: COLORS.primaryMuted, color: COLORS.primary, padding: "2px 8px", borderRadius: RADIUS.full, fontWeight: FONT_WEIGHT.semibold }}>{n.channel}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{n.trigger}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                  <button onClick={() => setNotifTemplates(p => p.map(x => x.id === n.id ? { ...x, active: !x.active } : x))}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: n.active ? COLORS.primary : COLORS.gray300, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 3, left: n.active ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: COLORS.white, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btnPrimary} onClick={() => showToast("Notification settings saved")}><Save size={14} /> Save Settings</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md, display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={14} strokeWidth={3} /> {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: RADIUS.xl, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} color={COLORS.primary} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Company Settings</h1>
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>Manage company profile, branding, and communication templates</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${surface.border}`, marginBottom: 24 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "none", background: "transparent", borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent", color: active ? COLORS.primary : surface.subtext, fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer", transition: "color 0.12s", marginBottom: -1 }}>
              <Icon size={14} strokeWidth={2} /> {label}
            </button>
          );
        })}
      </div>

      {tab === "profile"  && <ProfileTab />}
      {tab === "branding" && <BrandingTab />}
      {tab === "email"    && <EmailTab />}
      {tab === "notif"    && <NotifTab />}
    </div>
  );
}
