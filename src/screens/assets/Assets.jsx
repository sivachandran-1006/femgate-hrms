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
} from "lucide-react";

// ── Theme token imports (NO hardcoded values) ─────────────────────────────
import { COLORS }                                                        from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                           from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                                 from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE }  from "../../theme/sizes";
import { getStatusBadge }                                                from "../../utils/helpers";

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
    bg = COLORS.dangerMuted;
    color = COLORS.danger;
    icon = true;
  } else if (days < 30) {
    bg = COLORS.dangerMuted;
    color = COLORS.danger;
    icon = true;
  } else if (days < 90) {
    bg = COLORS.warningLight;
    color = COLORS.warning;
    icon = true;
  } else {
    bg = darkMode ? COLORS.dark.rowHover : COLORS.successLight;
    color = COLORS.success;
    icon = false;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: GAP.xs,
        padding: PADDING.badge,
        borderRadius: RADIUS.full,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        fontFamily: FONT_FAMILY.base,
        background: bg,
        color: color,
      }}
    >
      {icon && <AlertTriangle size={ICON_SIZE.sm - 5} />}
      {dateStr}
    </span>
  );
}

function StatusBadge({ status }) {
  const badge = getStatusBadge(status);
  return (
    <span
      style={{
        padding: PADDING.badge,
        borderRadius: RADIUS.full,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        fontFamily: FONT_FAMILY.base,
        background: badge.bg,
        color: badge.color,
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

  const surface = darkMode ? COLORS.dark : COLORS.light;

  // KPI card accent colors
  const kpiColors = [COLORS.primary, COLORS.purple, COLORS.success, COLORS.warning];

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
    { label: "Total Assets", value: totalAssets, color: COLORS.primary, icon: Package },
    { label: "Assigned", value: assignedCount, color: COLORS.purple, icon: Laptop },
    { label: "Available", value: availableCount, color: COLORS.success, icon: Server },
    { label: "Expiring Warranty", value: expiringCount, color: COLORS.warning, icon: AlertTriangle },
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
    padding: PADDING.input,
    borderRadius: RADIUS.md,
    border: `1px solid ${surface.border}`,
    background: surface.inputBg,
    color: surface.text,
    fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY.base,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SPACING[6],
          flexWrap: "wrap",
          gap: GAP.md,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: FONT_SIZE["2xl"],
              fontWeight: FONT_WEIGHT.bold,
              color: surface.text,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Asset Management
          </h1>
          <p
            style={{
              margin: `${GAP.xs}px 0 0`,
              fontSize: FONT_SIZE.md,
              color: surface.subtext,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Track and manage company assets
          </p>
        </div>
        <button
          onClick={openModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: GAP.sm,
            padding: PADDING.btn,
            background: COLORS.primary,
            color: COLORS.white,
            border: "none",
            borderRadius: RADIUS.lg,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: FONT_FAMILY.base,
            cursor: "pointer",
          }}
        >
          <Plus size={ICON_SIZE.sm} />
          Add Asset
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: GAP.lg,
          marginBottom: SPACING[6],
        }}
      >
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                background: surface.cardBg,
                border: `1px solid ${surface.border}`,
                borderRadius: RADIUS.xl,
                padding: SPACING[5],
                display: "flex",
                alignItems: "center",
                gap: GAP.lg,
                boxShadow: SHADOW.card,
              }}
            >
              <div
                style={{
                  width: LAYOUT.iconBoxLg - 4,
                  height: LAYOUT.iconBoxLg - 4,
                  borderRadius: RADIUS.lg,
                  background: k.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={ICON_SIZE.lg + 2} color={k.color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: FONT_SIZE["3xl"] - 2,
                    fontWeight: FONT_WEIGHT.bold,
                    color: surface.text,
                    fontFamily: FONT_FAMILY.base,
                    lineHeight: 1,
                  }}
                >
                  {k.value}
                </div>
                <div
                  style={{
                    fontSize: FONT_SIZE.base,
                    color: surface.subtext,
                    fontFamily: FONT_FAMILY.base,
                    marginTop: GAP.xs,
                  }}
                >
                  {k.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Card */}
      <div
        style={{
          background: surface.cardBg,
          border: `1px solid ${surface.border}`,
          borderRadius: RADIUS["2xl"],
          overflow: "hidden",
          boxShadow: SHADOW.card,
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${surface.border}`,
            padding: `0 ${SPACING[5]}px`,
            gap: GAP.xs,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: `${SPACING[3] + 2}px ${SPACING[4] + 2}px`,
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                color: activeTab === tab ? COLORS.primary : surface.subtext,
                fontSize: FONT_SIZE.md,
                fontWeight: activeTab === tab ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            padding: `${GAP.lg}px ${SPACING[5]}px`,
            display: "flex",
            gap: GAP.md,
            flexWrap: "wrap",
            borderBottom: `1px solid ${surface.border}`,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <Search
              size={ICON_SIZE.sm - 1}
              style={{
                position: "absolute",
                left: SPACING[2] + 2,
                top: "50%",
                transform: "translateY(-50%)",
                color: surface.subtext,
              }}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: SPACING[8] }}
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FONT_SIZE.md, fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr style={{ background: surface.theadBg }}>
                {["Asset ID", "Asset Name", "Type", "Assigned To", "Department", "Status", "Warranty Expiry", "Action"].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: PADDING.tableHeader,
                      textAlign: "left",
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontSize: FONT_SIZE.sm,
                      fontFamily: FONT_FAMILY.base,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${surface.border}`,
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
                  <td
                    colSpan={8}
                    style={{
                      padding: SPACING[10],
                      textAlign: "center",
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                    }}
                  >
                    No assets found.
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => {
                  const Icon = TYPE_ICONS[asset.type] || Package;
                  const days = getDaysUntilExpiry(asset.warrantyExpiry);
                  const rowBg =
                    days < 0
                      ? darkMode ? COLORS.surfaceDark : COLORS.dangerMuted
                      : days < 30
                      ? darkMode ? COLORS.gray700 : COLORS.warningMuted
                      : surface.cardBg;

                  return (
                    <tr
                      key={asset.id}
                      style={{
                        background: rowBg,
                        borderBottom: `1px solid ${surface.border}`,
                        transition: TRANSITION,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                    >
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          color: COLORS.primary,
                          fontWeight: FONT_WEIGHT.semibold,
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {asset.id}
                      </td>
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          color: surface.text,
                          fontWeight: FONT_WEIGHT.medium,
                          fontFamily: FONT_FAMILY.base,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {asset.name}
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: GAP.sm - 2,
                            color: surface.subtext,
                            fontFamily: FONT_FAMILY.base,
                          }}
                        >
                          <Icon size={ICON_SIZE.sm - 2} />
                          {asset.type}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          color: surface.text,
                          fontFamily: FONT_FAMILY.base,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {asset.assignedTo}
                      </td>
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          color: surface.subtext,
                          fontFamily: FONT_FAMILY.base,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {asset.department}
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <WarrantyBadge dateStr={asset.warrantyExpiry} darkMode={darkMode} />
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <button
                          style={{
                            padding: `${GAP.xs + 1}px ${GAP.md}px`,
                            borderRadius: RADIUS.sm + 1,
                            border: `1px solid ${surface.border}`,
                            background: "transparent",
                            color: surface.subtext,
                            fontSize: FONT_SIZE.sm,
                            fontFamily: FONT_FAMILY.base,
                            fontWeight: FONT_WEIGHT.medium,
                            cursor: "pointer",
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
        <div
          style={{
            padding: `${GAP.md}px ${SPACING[5]}px`,
            borderTop: `1px solid ${surface.border}`,
            color: surface.subtext,
            fontSize: FONT_SIZE.base,
            fontFamily: FONT_FAMILY.base,
          }}
        >
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
            zIndex: Z_INDEX.modal,
            padding: GAP.lg,
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: surface.cardBg,
              border: `1px solid ${surface.border}`,
              borderRadius: RADIUS["3xl"],
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: SHADOW.modal,
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: PADDING.card,
                borderBottom: `1px solid ${surface.border}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.xl,
                  fontWeight: FONT_WEIGHT.bold,
                  color: surface.text,
                  fontFamily: FONT_FAMILY.base,
                }}
              >
                Add New Asset
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: surface.subtext,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={ICON_SIZE.lg} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleAddAsset}
              style={{
                padding: SPACING[6],
                display: "flex",
                flexDirection: "column",
                gap: GAP.lg,
              }}
            >
              {formError && (
                <div
                  style={{
                    padding: `${SPACING[2] + 2}px ${SPACING[3] + 2}px`,
                    background: COLORS.dangerMuted,
                    color: COLORS.danger,
                    borderRadius: RADIUS.md,
                    fontSize: FONT_SIZE.base,
                    fontFamily: FONT_FAMILY.base,
                    display: "flex",
                    alignItems: "center",
                    gap: GAP.sm,
                  }}
                >
                  <AlertTriangle size={ICON_SIZE.md - 4} />
                  {formError}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.md + 2 }}>
                {/* Asset ID (read-only) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Asset ID
                  </label>
                  <input
                    name="id"
                    value={form.id}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>

                {/* Type */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Type *
                  </label>
                  <select name="type" value={form.type} onChange={handleFormChange} style={selectStyle}>
                    {["Laptop", "Desktop", "Mobile", "Monitor", "License", "Server"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asset Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: FONT_SIZE.base,
                    fontWeight: FONT_WEIGHT.semibold,
                    color: surface.subtext,
                    fontFamily: FONT_FAMILY.base,
                    marginBottom: GAP.sm - 2,
                  }}
                >
                  Asset Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Dell Laptop XPS 15"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.md + 2 }}>
                {/* Assigned To */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Assigned To
                  </label>
                  <input
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleFormChange}
                    placeholder="Leave blank if available"
                    style={inputStyle}
                  />
                </div>

                {/* Department */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Department *
                  </label>
                  <select name="department" value={form.department} onChange={handleFormChange} style={selectStyle}>
                    <option value="">Select Department</option>
                    {["IT", "HR", "Finance", "Management", "Operations", "Sales"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.md + 2 }}>
                {/* Status */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Status
                  </label>
                  <select name="status" value={form.status} onChange={handleFormChange} style={selectStyle}>
                    {["Available", "Assigned", "Maintenance", "Retired"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Warranty Expiry */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                      marginBottom: GAP.sm - 2,
                    }}
                  >
                    Warranty Expiry *
                  </label>
                  <input
                    name="warrantyExpiry"
                    type="date"
                    value={form.warrantyExpiry}
                    onChange={handleFormChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: GAP.md,
                  justifyContent: "flex-end",
                  marginTop: GAP.xs,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: PADDING.btn,
                    borderRadius: RADIUS.lg,
                    border: `1px solid ${surface.border}`,
                    background: "transparent",
                    color: surface.subtext,
                    fontSize: FONT_SIZE.md,
                    fontFamily: FONT_FAMILY.base,
                    fontWeight: FONT_WEIGHT.medium,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: PADDING.btn,
                    borderRadius: RADIUS.lg,
                    border: "none",
                    background: COLORS.primary,
                    color: COLORS.white,
                    fontSize: FONT_SIZE.md,
                    fontFamily: FONT_FAMILY.base,
                    fontWeight: FONT_WEIGHT.semibold,
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
