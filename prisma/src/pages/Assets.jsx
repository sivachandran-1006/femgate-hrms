import { useState } from "react";
import {
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Package,
  AlertTriangle,
  Search,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";

const mockAssets = [
  {
    id: "AST001",
    name: "Dell Laptop XPS 15",
    type: "Laptop",
    assignedTo: "Mani",
    department: "IT",
    status: "Assigned",
    warrantyExpiry: "2026-12-31",
  },
  {
    id: "AST002",
    name: "HP Desktop",
    type: "Desktop",
    assignedTo: "Siva",
    department: "Management",
    status: "Assigned",
    warrantyExpiry: "2025-08-15",
  },
  {
    id: "AST003",
    name: "iPhone 14",
    type: "Mobile",
    assignedTo: "Big Kundi",
    department: "HR",
    status: "Assigned",
    warrantyExpiry: "2027-01-20",
  },
  {
    id: "AST004",
    name: 'LG Monitor 27"',
    type: "Monitor",
    assignedTo: "Santhosh",
    department: "IT",
    status: "Assigned",
    warrantyExpiry: "2028-06-30",
  },
  {
    id: "AST005",
    name: "MacBook Pro M3",
    type: "Laptop",
    assignedTo: "Hari",
    department: "IT",
    status: "Assigned",
    warrantyExpiry: "2027-09-10",
  },
  {
    id: "AST006",
    name: "Dell Laptop G15",
    type: "Laptop",
    assignedTo: "—",
    department: "IT",
    status: "Available",
    warrantyExpiry: "2027-03-15",
  },
  {
    id: "AST007",
    name: "Adobe Creative Cloud",
    type: "License",
    assignedTo: "Suriya",
    department: "IT",
    status: "Assigned",
    warrantyExpiry: "2026-07-01",
  },
  {
    id: "AST008",
    name: "Samsung Monitor",
    type: "Monitor",
    assignedTo: "—",
    department: "HR",
    status: "Available",
    warrantyExpiry: "2028-01-01",
  },
  {
    id: "AST009",
    name: "Lenovo ThinkPad",
    type: "Laptop",
    assignedTo: "Safeer",
    department: "Finance",
    status: "Assigned",
    warrantyExpiry: "2026-08-20",
  },
  {
    id: "AST010",
    name: "Microsoft Office 365",
    type: "License",
    assignedTo: "Suganthan",
    department: "Management",
    status: "Assigned",
    warrantyExpiry: "2026-06-30",
  },
];

const TYPE_ICONS = {
  Laptop: Laptop,
  Desktop: Monitor,
  Mobile: Smartphone,
  Monitor: Monitor,
  License: Package,
  Server: Server,
};

function getDaysUntilExpiry(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function WarrantyBadge({ dateStr, darkMode }) {
  const days = getDaysUntilExpiry(dateStr);
  let bg, color, icon;

  if (days < 0) {
    bg = "#fee2e2";
    color = "#dc2626";
    icon = true;
  } else if (days < 30) {
    bg = "#fee2e2";
    color = "#dc2626";
    icon = true;
  } else if (days < 90) {
    bg = "#fef9c3";
    color = "#ca8a04";
    icon = true;
  } else {
    bg = darkMode ? "#1e3a2f" : "#dcfce7";
    color = "#16a34a";
    icon = false;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        background: bg,
        color: color,
      }}
    >
      {icon && <AlertTriangle size={11} />}
      {dateStr}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Assigned: { bg: "#dbeafe", color: "#1d4ed8" },
    Available: { bg: "#dcfce7", color: "#16a34a" },
    Maintenance: { bg: "#fef9c3", color: "#ca8a04" },
    Retired: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = styles[status] || styles["Retired"];
  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  id: "",
  name: "",
  type: "Laptop",
  assignedTo: "",
  department: "",
  status: "Available",
  warrantyExpiry: "",
};

export default function Assets({ darkMode = false }) {
  const [assets, setAssets] = useState(mockAssets);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Colours
  const pageBg = darkMode ? "#0f172a" : "#f1f5f9";
  const cardBg = darkMode ? "#1e293b" : "#ffffff";
  const textPrimary = darkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const inputBg = darkMode ? "#1e293b" : "#ffffff";
  const tableHeaderBg = darkMode ? "#0f172a" : "#f8fafc";
  const hoverBg = darkMode ? "#263248" : "#f8fafc";
  const accentBlue = "#3b82f6";

  // KPIs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalAssets = assets.length;
  const assignedCount = assets.filter((a) => a.status === "Assigned").length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const expiringCount = assets.filter((a) => {
    const d = getDaysUntilExpiry(a.warrantyExpiry);
    return d >= 0 && d <= 90;
  }).length;

  const kpiCards = [
    { label: "Total Assets", value: totalAssets, color: "#3b82f6", icon: Package },
    { label: "Assigned", value: assignedCount, color: "#8b5cf6", icon: Laptop },
    { label: "Available", value: availableCount, color: "#10b981", icon: Server },
    { label: "Expiring Warranty", value: expiringCount, color: "#f59e0b", icon: AlertTriangle },
  ];

  // Tabs
  const tabs = ["All", "Assigned", "Available", "Warranty"];

  // Filtering
  const filtered = assets.filter((a) => {
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Assigned" && a.status === "Assigned") ||
      (activeTab === "Available" && a.status === "Available") ||
      (activeTab === "Warranty" && getDaysUntilExpiry(a.warrantyExpiry) < 90);

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.assignedTo.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q);

    const matchType = typeFilter === "All" || a.type === typeFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;

    return matchTab && matchSearch && matchType && matchStatus;
  });

  // Modal
  function openModal() {
    setForm({ ...EMPTY_FORM, id: `AST${String(assets.length + 1).padStart(3, "0")}` });
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAddAsset(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.warrantyExpiry || !form.department.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setAssets((prev) => [
      ...prev,
      {
        ...form,
        assignedTo: form.assignedTo.trim() || "—",
      },
    ]);
    closeModal();
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${border}`,
    background: inputBg,
    color: textPrimary,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: pageBg, padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: textPrimary }}>Asset Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: textSecondary }}>Track and manage company assets</p>
        </div>
        <button
          onClick={openModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: accentBlue,
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Add Asset
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: k.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: textPrimary, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: "13px", color: textSecondary, marginTop: "4px" }}>{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Card */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${border}`, padding: "0 20px", gap: "4px", overflowX: "auto" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${accentBlue}` : "2px solid transparent",
                color: activeTab === tab ? accentBlue : textSecondary,
                fontSize: "14px",
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: "-1px",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: "16px 20px", display: "flex", gap: "12px", flexWrap: "wrap", borderBottom: `1px solid ${border}` }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: textSecondary }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "32px" }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ position: "relative", flex: "0 1 160px" }}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Types</option>
              {["Laptop", "Desktop", "Mobile", "Monitor", "License", "Server"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: "0 1 160px" }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Status</option>
              {["Assigned", "Available", "Maintenance", "Retired"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: tableHeaderBg }}>
                {["Asset ID", "Asset Name", "Type", "Assigned To", "Department", "Status", "Warranty Expiry", "Action"].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: textSecondary,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: textSecondary }}>
                    No assets found.
                  </td>
                </tr>
              ) : (
                filtered.map((asset, idx) => {
                  const Icon = TYPE_ICONS[asset.type] || Package;
                  const days = getDaysUntilExpiry(asset.warrantyExpiry);
                  const rowBg =
                    days < 0
                      ? darkMode ? "#2d1b1b" : "#fff5f5"
                      : days < 30
                      ? darkMode ? "#2d2010" : "#fffbeb"
                      : cardBg;

                  return (
                    <tr
                      key={asset.id}
                      style={{
                        background: rowBg,
                        borderBottom: `1px solid ${border}`,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                    >
                      <td style={{ padding: "12px 16px", color: accentBlue, fontWeight: 600, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {asset.id}
                      </td>
                      <td style={{ padding: "12px 16px", color: textPrimary, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {asset.name}
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textSecondary }}>
                          <Icon size={14} />
                          {asset.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: textPrimary, whiteSpace: "nowrap" }}>{asset.assignedTo}</td>
                      <td style={{ padding: "12px 16px", color: textSecondary, whiteSpace: "nowrap" }}>{asset.department}</td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <WarrantyBadge dateStr={asset.warrantyExpiry} darkMode={darkMode} />
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <button
                          style={{
                            padding: "5px 12px",
                            borderRadius: "7px",
                            border: `1px solid ${border}`,
                            background: "transparent",
                            color: textSecondary,
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${border}`, color: textSecondary, fontSize: "13px" }}>
          Showing {filtered.length} of {assets.length} assets
        </div>
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: `1px solid ${border}`,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: textPrimary }}>Add New Asset</h2>
              <button
                onClick={closeModal}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: textSecondary, display: "flex", alignItems: "center" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddAsset} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: "8px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={14} />
                  {formError}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Asset ID (read-only) */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Asset ID</label>
                  <input name="id" value={form.id} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Type *</label>
                  <select name="type" value={form.type} onChange={handleFormChange} style={selectStyle}>
                    {["Laptop", "Desktop", "Mobile", "Monitor", "License", "Server"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asset Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Asset Name *</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Dell Laptop XPS 15" style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Assigned To */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Assigned To</label>
                  <input name="assignedTo" value={form.assignedTo} onChange={handleFormChange} placeholder="Leave blank if available" style={inputStyle} />
                </div>

                {/* Department */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Department *</label>
                  <select name="department" value={form.department} onChange={handleFormChange} style={selectStyle}>
                    <option value="">Select Department</option>
                    {["IT", "HR", "Finance", "Management", "Operations", "Sales"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Status */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Status</label>
                  <select name="status" value={form.status} onChange={handleFormChange} style={selectStyle}>
                    {["Available", "Assigned", "Maintenance", "Retired"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Warranty Expiry */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: textSecondary, marginBottom: "6px" }}>Warranty Expiry *</label>
                  <input name="warrantyExpiry" type="date" value={form.warrantyExpiry} onChange={handleFormChange} style={inputStyle} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "9px",
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textSecondary,
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "9px",
                    border: "none",
                    background: accentBlue,
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
