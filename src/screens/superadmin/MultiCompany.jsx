import { useState } from "react";
import { Search, Plus, Eye, Pencil, UserX, X, Building2 } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const BRAND_COLORS = [COLORS.primary, COLORS.purple, COLORS.info, "#be185d", COLORS.success, COLORS.warning];

const INIT_COMPANIES = [
  { id: 1, name: "MGate Systems", industry: "Technology", plan: "Enterprise", employees: 13, status: "Active", city: "Chennai", country: "India", admin: "Super Admin", created: "Jan 2024", cost: "₹45,000", color: BRAND_COLORS[0] },
  { id: 2, name: "Vertex Solutions", industry: "Software", plan: "Pro", employees: 42, status: "Active", city: "Bangalore", country: "India", admin: "Nithya S", created: "Mar 2024", cost: "₹28,000", color: BRAND_COLORS[1] },
  { id: 3, name: "SynEx Systems", industry: "Consulting", plan: "Starter", employees: 8, status: "Trial", city: "Hyderabad", country: "India", admin: "Rajan M", created: "May 2026", cost: "₹8,000", color: BRAND_COLORS[2] },
  { id: 4, name: "Vela Partners", industry: "Finance", plan: "Pro", employees: 19, status: "Active", city: "Mumbai", country: "India", admin: "Preethi V", created: "Sep 2024", cost: "₹28,000", color: BRAND_COLORS[3] },
];

const PLAN_STYLES = {
  Enterprise: { bg: COLORS.warningLight, text: COLORS.warning },
  Pro:        { bg: COLORS.primaryLight, text: COLORS.primary },
  Starter:    { bg: COLORS.purpleMuted,  text: COLORS.purple },
};

const STATUS_STYLES = {
  Active:    { bg: COLORS.successLight, text: COLORS.success },
  Trial:     { bg: COLORS.warningLight, text: COLORS.warning },
  Suspended: { bg: COLORS.dangerMuted,  text: COLORS.danger },
};

const INDUSTRIES = ["Technology", "Software", "Consulting", "Finance", "Healthcare", "Retail", "Manufacturing", "Education"];
const PLANS = ["Starter", "Pro", "Enterprise"];

const Badge = ({ styles, children }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: styles?.bg, color: styles?.text }}>
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

const Field = ({ label, labelStyle, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

export default function MultiCompany({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [companies, setCompanies] = useState(INIT_COMPANIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newCo, setNewCo] = useState({ name: "", industry: "Technology", adminEmail: "", plan: "Pro", city: "", country: "India" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.admin.toLowerCase().includes(q))
      && (statusFilter === "All" || c.status === statusFilter);
  });

  const handleAddCompany = () => {
    if (!newCo.name || !newCo.adminEmail || !newCo.city) { showToast("Please fill all required fields", "error"); return; }
    const costMap = { Starter: "₹8,000", Pro: "₹28,000", Enterprise: "₹45,000" };
    const id = companies.length + 1;
    setCompanies([...companies, { id, name: newCo.name, industry: newCo.industry, plan: newCo.plan, employees: 0, status: "Trial", city: newCo.city, country: newCo.country, admin: newCo.adminEmail.split("@")[0], created: "Jun 2026", cost: costMap[newCo.plan], color: BRAND_COLORS[id % BRAND_COLORS.length] }]);
    setNewCo({ name: "", industry: "Technology", adminEmail: "", plan: "Pro", city: "", country: "India" });
    setShowAddModal(false);
    showToast(`Company "${newCo.name}" created successfully`);
  };

  const handleSuspend = (id) => {
    const co = companies.find((c) => c.id === id);
    if (!co) return;
    const next = co.status === "Suspended" ? "Active" : "Suspended";
    setCompanies(companies.map((c) => c.id === id ? { ...c, status: next } : c));
    showToast(`${co.name} ${next === "Suspended" ? "suspended" : "reactivated"}`, next === "Suspended" ? "error" : "success");
  };

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none",
  };

  const labelStyle = { display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 5 };

  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);
  const totalRevenue = companies.reduce((sum, c) => sum + parseInt(c.cost.replace(/[^\d]/g, ""), 10), 0);

  const stats = [
    { label: "Total Companies", value: companies.length, sub: "tenants registered" },
    { label: "Active", value: companies.filter((c) => c.status === "Active").length, sub: "live accounts" },
    { label: "Total Employees", value: totalEmployees, sub: "across all tenants" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}/mo`, sub: "combined monthly" },
  ];

  const iconBtn = (icon, title, onClick, border, color) => (
    <button key={title} onClick={onClick} title={title} style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: RADIUS.md, padding: "5px 8px", cursor: "pointer", color, display: "flex", alignItems: "center" }}>
      {icon}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "error" ? COLORS.danger : COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Multi-Company Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Manage all tenant companies on this platform</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} surface={surface} />)}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: surface.subtext }} />
          <input style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} placeholder="Search companies, admins, industries..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, minWidth: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Active", "Trial", "Suspended"].map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {filtered.map((co) => (
          <div key={co.id} style={{ background: surface.cardBg, border: `1px solid ${co.status === "Suspended" ? COLORS.dangerLight : surface.border}`, borderRadius: RADIUS["2xl"], padding: 20, boxShadow: SHADOW.xs }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: RADIUS.lg, background: co.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold }}>{co.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{co.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{co.industry} • {co.city}, {co.country}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <Badge styles={STATUS_STYLES[co.status]}>{co.status}</Badge>
                <Badge styles={PLAN_STYLES[co.plan]}>{co.plan}</Badge>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16, padding: "12px 0", borderTop: `1px solid ${surface.border}`, borderBottom: `1px solid ${surface.border}` }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{co.employees}</p>
                <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Employees</p>
              </div>
              <div style={{ textAlign: "center", borderLeft: `1px solid ${surface.border}`, borderRight: `1px solid ${surface.border}` }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{co.cost}</p>
                <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Monthly</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{co.created}</p>
                <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Since</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: RADIUS.full, background: co.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: FONT_WEIGHT.bold, color: co.color }}>{co.admin.slice(0, 2).toUpperCase()}</span>
                </div>
                <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>Admin: <span style={{ color: surface.text, fontWeight: FONT_WEIGHT.medium }}>{co.admin}</span></span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {iconBtn(<Eye size={13} />, "View", () => showToast(`Viewing ${co.name} dashboard...`), surface.border, surface.subtext)}
                {iconBtn(<Pencil size={13} />, "Edit", () => showToast(`Editing ${co.name}...`), surface.border, surface.subtext)}
                {iconBtn(<UserX size={13} />, co.status === "Suspended" ? "Reactivate" : "Suspend", () => handleSuspend(co.id), co.status === "Suspended" ? COLORS.dangerLight : surface.border, co.status === "Suspended" ? COLORS.success : COLORS.danger)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: surface.subtext, fontSize: FONT_SIZE.sm }}>
          <Building2 size={32} color={surface.subtext} style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No companies found matching your search.</p>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: 28, width: 480, boxShadow: SHADOW.modal, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Add New Company</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Company Name *" labelStyle={labelStyle}>
                <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="Enter company name" value={newCo.name} onChange={(e) => setNewCo({ ...newCo, name: e.target.value })} />
              </Field>
              <Field label="Industry *" labelStyle={labelStyle}>
                <select style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={newCo.industry} onChange={(e) => setNewCo({ ...newCo, industry: e.target.value })}>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </Field>
              <Field label="Admin Email *" labelStyle={labelStyle}>
                <input type="email" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="admin@company.com" value={newCo.adminEmail} onChange={(e) => setNewCo({ ...newCo, adminEmail: e.target.value })} />
              </Field>
              <Field label="Plan *" labelStyle={labelStyle}>
                <select style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={newCo.plan} onChange={(e) => setNewCo({ ...newCo, plan: e.target.value })}>
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="City *" labelStyle={labelStyle}>
                  <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="City" value={newCo.city} onChange={(e) => setNewCo({ ...newCo, city: e.target.value })} />
                </Field>
                <Field label="Country" labelStyle={labelStyle}>
                  <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="Country" value={newCo.country} onChange={(e) => setNewCo({ ...newCo, country: e.target.value })} />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, cursor: "pointer", color: surface.text }}>Cancel</button>
              <button onClick={handleAddCompany} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer" }}>Create Company</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
