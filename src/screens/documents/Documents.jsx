import { useState, useMemo } from "react";
import {
  IconFileText,
  IconShieldCheck,
  IconClock,
  IconAlertTriangle,
  IconSearch,
  IconPlus,
  IconEye,
  IconDownload,
  IconTrash,
  IconX,
  IconUpload,
  IconChevronDown,
  IconFile,
} from "@tabler/icons-react";

import { COLORS } from "../../theme/colors";
import { useAllDocuments } from "../../queries/useHr";
import { useDeleteDocument } from "../../queries/useSelfService";
import { useToast } from "../../components/ui/Toast";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW } from "../../theme/sizes";

// ─── Mock Data ───────────────────────────────────────────────────────────────


const EMPLOYEES = ["Aravinth", "Mani", "Safeer", "Siva"];
const CATEGORIES = ["Identity", "Employment", "Financial", "Other"];

// ─── Style Helpers ───────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Verified: { bg: COLORS.successLight,  color: COLORS.success  },
  Pending:  { bg: COLORS.warningLight,  color: COLORS.warning  },
  Expired:  { bg: COLORS.dangerMuted,   color: COLORS.danger   },
};

const CATEGORY_STYLE = {
  Identity:   { bg: COLORS.primaryLight,  color: COLORS.primary  },
  Employment: { bg: COLORS.purpleLight,   color: COLORS.purple   },
  Financial:  { bg: COLORS.successLight,  color: COLORS.success  },
  Other:      { bg: COLORS.gray200,       color: COLORS.gray600  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, iconColor, iconBg, dark }) => (
  <div style={{
    flex:         "1 1 160px",
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    borderRadius: RADIUS["2xl"],
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    boxShadow:    SHADOW.sm,
    padding:      `${SPACING[5]}px`,
    display:      "flex",
    alignItems:   "center",
    gap:          GAP.md,
    minWidth:     0,
  }}>
    <div style={{
      width:          48,
      height:         48,
      borderRadius:   RADIUS.xl,
      background:     iconBg,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
    }}>
      <Icon size={22} color={iconColor} stroke={1.8} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight }}>{label}</p>
      <p style={{ margin: `${GAP.xs / 2}px 0 0`, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: dark ? COLORS.dark.text : COLORS.textLight, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const Badge = ({ label, styleMap, dark }) => {
  const s = styleMap[label] || { bg: COLORS.gray200, color: COLORS.gray600 };
  return (
    <span style={{
      display:      "inline-block",
      padding:      "3px 10px",
      borderRadius: RADIUS.full,
      background:   s.bg,
      color:        s.color,
      fontSize:     FONT_SIZE.xs,
      fontWeight:   FONT_WEIGHT.semibold,
      whiteSpace:   "nowrap",
    }}>
      {label}
    </span>
  );
};

const ActionBtn = ({ icon: Icon, color, onClick, title, hoverBg }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:          30,
        height:         30,
        borderRadius:   RADIUS.md,
        border:         "none",
        background:     hovered ? hoverBg : "transparent",
        cursor:         "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        transition:     "background 0.15s ease",
        padding:        0,
      }}
    >
      <Icon size={16} color={color} stroke={2} />
    </button>
  );
};

const SelectInput = ({ value, onChange, options, dark }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding:      "8px 12px",
      borderRadius: RADIUS.lg,
      border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
      background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
      color:        dark ? COLORS.dark.text : COLORS.textLight,
      fontSize:     FONT_SIZE.sm,
      fontWeight:   FONT_WEIGHT.medium,
      minWidth:     120,
    }}
  >
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

// ─── Upload Modal ─────────────────────────────────────────────────────────────

const UploadModal = ({ onClose, dark }) => {
  const [form, setForm] = useState({ employee: EMPLOYEES[0], name: "", category: CATEGORIES[0], file: null });
  const [fileName, setFileName] = useState("No file chosen");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  const overlayStyle = {
    position:        "fixed",
    inset:           0,
    background:      "rgba(15,23,42,0.55)",
    zIndex:          200,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    padding:         SPACING.md,
  };

  const modalStyle = {
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    borderRadius: RADIUS["2xl"],
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    boxShadow:    SHADOW.modal,
    width:        "100%",
    maxWidth:     480,
    padding:      PADDING.modal,
  };

  const labelStyle = {
    display:      "block",
    fontSize:     FONT_SIZE.xs,
    fontWeight:   FONT_WEIGHT.semibold,
    color:        dark ? COLORS.dark.subtext : COLORS.textMutedLight,
    marginBottom: 6,
    textTransform:"uppercase",
    letterSpacing:"0.05em",
  };

  const inputStyle = {
    width:        "100%",
    padding:      "9px 12px",
    borderRadius: RADIUS.lg,
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    background:   dark ? COLORS.dark.inputBg : COLORS.gray50,
    color:        dark ? COLORS.dark.text : COLORS.textLight,
    fontSize:     FONT_SIZE.sm,
    outline:      "none",
    boxSizing:    "border-box",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING[5] }}>
          <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
            <div style={{ width: 36, height: 36, borderRadius: RADIUS.lg, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconUpload size={18} color={COLORS.primary} stroke={2} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: dark ? COLORS.dark.text : COLORS.textLight }}>Upload Document</h3>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight }}>Add a new document record</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: "none", background: dark ? COLORS.dark.border : COLORS.gray100, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconX size={16} color={dark ? COLORS.dark.subtext : COLORS.textMutedLight} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
          {/* Employee */}
          <div>
            <label style={labelStyle}>Employee</label>
            <select value={form.employee} onChange={(e) => set("employee", e.target.value)} style={inputStyle}>
              {EMPLOYEES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Document Name */}
          <div>
            <label style={labelStyle}>Document Name</label>
            <input
              type="text"
              placeholder="e.g. Aadhaar Card"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* File */}
          <div>
            <label style={labelStyle}>File</label>
            <label style={{
              display:      "flex",
              alignItems:   "center",
              gap:          GAP.sm,
              padding:      "9px 12px",
              borderRadius: RADIUS.lg,
              border:       `1.5px dashed ${dark ? COLORS.dark.border : COLORS.borderLight}`,
              background:   dark ? COLORS.dark.inputBg : COLORS.gray50,
              cursor:       "pointer",
            }}>
              <div style={{ width: 30, height: 30, borderRadius: RADIUS.md, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconFile size={16} color={COLORS.primary} stroke={2} />
              </div>
              <span style={{ fontSize: FONT_SIZE.sm, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight, flex: 1 }}>{fileName}</span>
              <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.primary, background: COLORS.primaryMuted, padding: "4px 10px", borderRadius: RADIUS.full }}>Browse</span>
              <input type="file" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: GAP.sm, marginTop: SPACING[6] }}>
          <button onClick={onClose} style={{
            padding:      "9px 20px",
            borderRadius: RADIUS.lg,
            border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
            background:   "transparent",
            color:        dark ? COLORS.dark.text : COLORS.textLight,
            fontSize:     FONT_SIZE.sm,
            fontWeight:   FONT_WEIGHT.medium,
            cursor:       "pointer",
          }}>
            Cancel
          </button>
          <button onClick={onClose} style={{
            padding:      "9px 20px",
            borderRadius: RADIUS.lg,
            border:       "none",
            background:   COLORS.primary,
            color:        COLORS.white,
            fontSize:     FONT_SIZE.sm,
            fontWeight:   FONT_WEIGHT.semibold,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
          }}>
            <IconUpload size={15} stroke={2} />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Documents = ({ darkMode: dark = false }) => {
  const [search,        setSearch]        = useState("");
  const [categoryFilter,setCategoryFilter]= useState("All");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [showModal,     setShowModal]     = useState(false);

  const { show } = useToast();
  const { data: docsRaw = [] } = useAllDocuments();
  const deleteMut = useDeleteDocument();

  const docs = docsRaw.map((d) => ({
    id:         d.id,
    employee:   d.employee?.name || "Company",
    name:       d.name,
    category:   d.category || "Other",
    uploadDate: (d.createdAt || "").split("T")[0],
    expiryDate: d.expiryDate ? d.expiryDate.split("T")[0] : "N/A",
    status:     d.expiryDate && new Date(d.expiryDate) < new Date() ? "Expired" : "Verified",
  }));

  // Derived stats
  const stats = useMemo(() => ({
    total:    docs.length,
    pending:  docs.filter((d) => d.status === "Pending").length,
    expiring: docs.filter((d) => {
      if (d.expiryDate === "N/A") return false;
      const diff = (new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 90;
    }).length,
    verified: docs.filter((d) => d.status === "Verified").length,
  }), [docs]);

  // Filtered list
  const filtered = useMemo(() => docs.filter((d) => {
    const term = search.toLowerCase();
    const matchSearch = !term || d.name.toLowerCase().includes(term) || d.employee.toLowerCase().includes(term);
    const matchCat    = categoryFilter === "All" || d.category === categoryFilter;
    const matchStatus = statusFilter   === "All" || d.status   === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [docs, search, categoryFilter, statusFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteMut.mutateAsync(id);
      show("Document archived", "success");
    } catch {
      show("Failed to delete document", "error");
    }
  };

  // Styles
  const pageBg    = dark ? COLORS.dark.pageBg   : COLORS.backgroundLight;
  const cardBg    = dark ? COLORS.dark.cardBg   : COLORS.surfaceLight;
  const border    = dark ? COLORS.dark.border   : COLORS.borderLight;
  const textMain  = dark ? COLORS.dark.text     : COLORS.textLight;
  const textMuted = dark ? COLORS.dark.subtext  : COLORS.textMutedLight;
  const theadBg   = dark ? COLORS.dark.theadBg  : COLORS.gray50;
  const rowHover  = dark ? COLORS.dark.rowHover : COLORS.gray100;

  return (
    <div style={{ minHeight: "100vh", background: pageBg, padding: PADDING.container, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: GAP.md, marginBottom: SPACING[6] }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: textMain }}>Documents</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: textMuted }}>Manage and verify employee documents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          GAP.sm,
            padding:      "10px 18px",
            borderRadius: RADIUS.lg,
            border:       "none",
            background:   COLORS.primary,
            color:        COLORS.white,
            fontSize:     FONT_SIZE.sm,
            fontWeight:   FONT_WEIGHT.semibold,
            cursor:       "pointer",
            boxShadow:    SHADOW.sm,
          }}
        >
          <IconPlus size={17} stroke={2.5} />
          Upload Document
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: GAP.md, marginBottom: SPACING[6] }}>
        <StatCard dark={dark} icon={IconFileText}     label="Total Documents"      value={stats.total}    iconColor={COLORS.primary}  iconBg={COLORS.primaryMuted}  />
        <StatCard dark={dark} icon={IconClock}        label="Pending Verification" value={stats.pending}  iconColor={COLORS.warning}  iconBg={COLORS.warningLight}  />
        <StatCard dark={dark} icon={IconAlertTriangle}label="Expiring Soon"        value={stats.expiring} iconColor={COLORS.danger}   iconBg={COLORS.dangerMuted}   />
        <StatCard dark={dark} icon={IconShieldCheck}  label="Verified"             value={stats.verified} iconColor={COLORS.success}  iconBg={COLORS.successLight}  />
      </div>

      {/* ── Card: Filter + Table ── */}
      <div style={{
        background:   cardBg,
        borderRadius: RADIUS["2xl"],
        border:       `1px solid ${border}`,
        boxShadow:    SHADOW.sm,
        overflow:     "hidden",
      }}>

        {/* Filter Bar */}
        <div style={{
          display:    "flex",
          flexWrap:   "wrap",
          alignItems: "center",
          gap:        GAP.sm,
          padding:    `${SPACING[4]}px ${SPACING[5]}px`,
          borderBottom: `1px solid ${border}`,
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
            <IconSearch size={16} color={textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by name or employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width:        "100%",
                padding:      "8px 12px 8px 36px",
                borderRadius: RADIUS.lg,
                border:       `1px solid ${border}`,
                background:   dark ? COLORS.dark.inputBg : COLORS.gray50,
                color:        textMain,
                fontSize:     FONT_SIZE.sm,
                outline:      "none",
                boxSizing:    "border-box",
              }}
            />
          </div>

          {/* Category filter */}
          <SelectInput
            dark={dark}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={["All", "Identity", "Employment", "Financial", "Other"]}
          />

          {/* Status filter */}
          <SelectInput
            dark={dark}
            value={statusFilter}
            onChange={setStatusFilter}
            options={["All", "Verified", "Pending", "Expired"]}
          />

          <span style={{ fontSize: FONT_SIZE.xs, color: textMuted, marginLeft: "auto" }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: theadBg }}>
                {["Document Name", "Employee", "Category", "Upload Date", "Expiry Date", "Status", "Actions"].map((col) => (
                  <th key={col} style={{
                    padding:    PADDING.tableHeader,
                    textAlign:  col === "Actions" ? "center" : "left",
                    fontSize:   FONT_SIZE.xs,
                    fontWeight: FONT_WEIGHT.semibold,
                    color:      textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    borderBottom: `1px solid ${border}`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: `${SPACING[8]}px`, textAlign: "center", color: textMuted, fontSize: FONT_SIZE.sm }}>
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc, idx) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    dark={dark}
                    border={border}
                    textMain={textMain}
                    textMuted={textMuted}
                    rowHover={rowHover}
                    isLast={idx === filtered.length - 1}
                    onDelete={() => handleDelete(doc.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && <UploadModal dark={dark} onClose={() => setShowModal(false)} />}
    </div>
  );
};

// ─── Document Row ─────────────────────────────────────────────────────────────

const DocumentRow = ({ doc, dark, border, textMain, textMuted, rowHover, isLast, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  hovered ? rowHover : "transparent",
        transition:  "background 0.15s ease",
        borderBottom: isLast ? "none" : `1px solid ${border}`,
      }}
    >
      {/* Document Name */}
      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
          <div style={{
            width:          32,
            height:         32,
            borderRadius:   RADIUS.md,
            background:     COLORS.primaryMuted,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}>
            <IconFileText size={16} color={COLORS.primary} stroke={1.8} />
          </div>
          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: textMain }}>{doc.name}</span>
        </div>
      </td>

      {/* Employee */}
      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: textMain, fontWeight: FONT_WEIGHT.medium, whiteSpace: "nowrap" }}>
        {doc.employee}
      </td>

      {/* Category */}
      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
        <Badge label={doc.category} styleMap={CATEGORY_STYLE} dark={dark} />
      </td>

      {/* Upload Date */}
      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: textMuted, whiteSpace: "nowrap" }}>
        {formatDate(doc.uploadDate)}
      </td>

      {/* Expiry Date */}
      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: doc.expiryDate === "N/A" ? textMuted : (doc.status === "Expired" ? COLORS.danger : textMuted), whiteSpace: "nowrap" }}>
        {doc.expiryDate === "N/A" ? "—" : formatDate(doc.expiryDate)}
      </td>

      {/* Status */}
      <td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
        <Badge label={doc.status} styleMap={STATUS_STYLE} dark={dark} />
      </td>

      {/* Actions */}
      <td style={{ padding: PADDING.tableCell }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: GAP.xs }}>
          <ActionBtn icon={IconEye}      title="View"     color={COLORS.primary} hoverBg={COLORS.primaryMuted} onClick={() => {}} />
          <ActionBtn icon={IconDownload} title="Download" color={COLORS.success} hoverBg={COLORS.successLight} onClick={() => {}} />
          <ActionBtn icon={IconTrash}    title="Delete"   color={COLORS.danger}  hoverBg={COLORS.dangerMuted}  onClick={onDelete} />
        </div>
      </td>
    </tr>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "N/A") return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default Documents;
