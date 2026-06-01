import { useState } from "react";
import {
  Search,
  Plus,
  Users,
  Building2,
  Edit2,
  X,
  Layers,
  UserCheck,
} from "lucide-react";

// ── Theme token imports (NO hardcoded values) ─────────────────────────────
import { COLORS }                                                    from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                       from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                             from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE } from "../../theme/sizes";
import { getStatusBadge }                                            from "../../utils/helpers";

const DEPARTMENTS_INITIAL = [
  {
    id: 1,
    name: "IT",
    head: "Siva",
    employees: 7,
    created: "01-Jan-2026",
    status: "Active",
  },
  {
    id: 2,
    name: "HR",
    head: "Mani",
    employees: 1,
    created: "01-Jan-2026",
    status: "Active",
  },
  {
    id: 3,
    name: "Finance",
    head: "Safeer",
    employees: 1,
    created: "01-Jan-2026",
    status: "Active",
  },
  {
    id: 4,
    name: "Management",
    head: "Siva",
    employees: 1,
    created: "01-Jan-2026",
    status: "Active",
  },
];

/* ─── KPI Card ─────────────────────────────────────────────────── */
const KpiCard = ({ icon, iconBg, label, value, surface }) => (
  <div
    style={{
      background: surface.cardBg,
      borderRadius: RADIUS["2xl"],
      border: "1px solid " + surface.border,
      boxShadow: SHADOW.card,
      padding: PADDING.card,
      display: "flex",
      alignItems: "center",
      gap: GAP.lg,
    }}
  >
    <div
      style={{
        width: LAYOUT.iconBoxLg,
        height: LAYOUT.iconBoxLg,
        borderRadius: RADIUS.xl,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: FONT_SIZE["3xl"],
          fontWeight: FONT_WEIGHT.bold,
          color: surface.text,
          lineHeight: 1.1,
          fontFamily: FONT_FAMILY.base,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.medium,
          color: surface.subtext,
          marginTop: GAP.xs,
          fontFamily: FONT_FAMILY.base,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

/* ─── Status Badge ─────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const badge = getStatusBadge(status);
  return (
    <span
      style={{
        background: badge.bg,
        color: badge.color,
        borderRadius: RADIUS.full,
        padding: PADDING.badge,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
        display: "inline-block",
        fontFamily: FONT_FAMILY.base,
      }}
    >
      {status}
    </span>
  );
};

/* ─── Modal ────────────────────────────────────────────────────── */
const Modal = ({ open, onClose, onSave, surface, editData }) => {
  const [form, setForm] = useState(
    editData || { name: "", head: "", description: "" }
  );

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputStyle = {
    width: "100%",
    border: "1px solid " + surface.border,
    borderRadius: RADIUS.lg,
    padding: PADDING.input,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.normal,
    background: surface.inputBg,
    color: surface.text,
    outline: "none",
    height: LAYOUT.inputHeight,
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY.base,
  };

  const labelStyle = {
    display: "block",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: surface.subtext,
    marginBottom: GAP.sm,
    letterSpacing: "0.02em",
    fontFamily: FONT_FAMILY.base,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: Z_INDEX.modal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: surface.cardBg,
          borderRadius: RADIUS["2xl"],
          border: "1px solid " + surface.border,
          boxShadow: SHADOW.modal,
          padding: PADDING.modal,
          width: 420,
          maxWidth: "90vw",
          fontFamily: FONT_FAMILY.base,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: SPACING[5] ?? GAP.xl,
          }}
        >
          <span
            style={{
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.bold,
              color: surface.text,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            {editData ? "Edit Department" : "Add Department"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: surface.subtext,
              display: "flex",
              alignItems: "center",
              padding: GAP.xs,
            }}
          >
            <X size={ICON_SIZE.md} strokeWidth={ICON_STROKE.normal} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
          <div>
            <label style={labelStyle}>Department Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={handleChange("name")}
            />
          </div>
          <div>
            <label style={labelStyle}>Department Head</label>
            <input
              style={inputStyle}
              placeholder="e.g. John Smith"
              value={form.head}
              onChange={handleChange("head")}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{
                ...inputStyle,
                height: 80,
                resize: "vertical",
                paddingTop: GAP.sm + 1,
              }}
              placeholder="Brief description of this department..."
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: GAP.md,
            marginTop: SPACING[6],
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: surface.cardBg,
              color: surface.text,
              border: "1px solid " + surface.border,
              borderRadius: RADIUS.lg,
              padding: PADDING.btn,
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.semibold,
              cursor: "pointer",
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (form.name.trim() && form.head.trim()) {
                onSave(form);
                onClose();
              }
            }}
            style={{
              background: COLORS.primary,
              color: COLORS.white,
              border: "none",
              borderRadius: RADIUS.lg,
              padding: PADDING.btn,
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.semibold,
              cursor: "pointer",
              fontFamily: FONT_FAMILY.base,
            }}
          >
            {editData ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────────────── */
const Departments = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [departments, setDepartments] = useState(DEPARTMENTS_INITIAL);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = departments.reduce((s, d) => s + d.employees, 0);
  const uniqueHeads = new Set(departments.map((d) => d.head)).size;
  const activeTeams = departments.filter((d) => d.status === "Active").length;

  const handleAddSave = (form) => {
    setDepartments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        head: form.head,
        employees: 0,
        created: new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-"),
        status: "Active",
      },
    ]);
  };

  const handleEditSave = (form) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === editTarget.id ? { ...d, name: form.name, head: form.head } : d
      )
    );
    setEditTarget(null);
  };

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY.base,
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
          <h1
            style={{
              margin: 0,
              fontSize: FONT_SIZE["2xl"],
              fontWeight: FONT_WEIGHT.bold,
              color: surface.text,
              lineHeight: 1.2,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Departments
          </h1>
          <p
            style={{
              margin: `${GAP.xs}px 0 0`,
              fontSize: FONT_SIZE.base,
              color: surface.subtext,
              fontWeight: FONT_WEIGHT.normal,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Manage company departments and teams
          </p>
        </div>

        <button
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            border: "none",
            borderRadius: RADIUS.lg,
            padding: PADDING.btn,
            fontSize: FONT_SIZE.base,
            fontWeight: FONT_WEIGHT.semibold,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: GAP.xs + 3,
            fontFamily: FONT_FAMILY.base,
            flexShrink: 0,
          }}
        >
          <Plus size={FONT_SIZE.lg} strokeWidth={ICON_STROKE.normal} />
          Add Department
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: GAP.lg,
          marginBottom: SPACING[6],
        }}
      >
        <KpiCard
          surface={surface}
          iconBg={darkMode ? COLORS.surfaceDark : COLORS.primaryMuted}
          icon={
            <Building2
              size={ICON_SIZE.lg}
              color={COLORS.primary}
              strokeWidth={ICON_STROKE.normal}
            />
          }
          value={departments.length}
          label="Total Departments"
        />
        <KpiCard
          surface={surface}
          iconBg={darkMode ? COLORS.surfaceDark : COLORS.successLight}
          icon={
            <Users
              size={ICON_SIZE.lg}
              color={COLORS.success}
              strokeWidth={ICON_STROKE.normal}
            />
          }
          value={totalEmployees}
          label="Total Employees"
        />
        <KpiCard
          surface={surface}
          iconBg={darkMode ? COLORS.surfaceDark : COLORS.purpleLight}
          icon={
            <UserCheck
              size={ICON_SIZE.lg}
              color={COLORS.purple}
              strokeWidth={ICON_STROKE.normal}
            />
          }
          value={uniqueHeads}
          label="Department Heads"
        />
        <KpiCard
          surface={surface}
          iconBg={darkMode ? COLORS.surfaceDark : COLORS.primaryLight}
          icon={
            <Layers
              size={ICON_SIZE.lg}
              color={COLORS.primary}
              strokeWidth={ICON_STROKE.normal}
            />
          }
          value={activeTeams}
          label="Active Teams"
        />
      </div>

      {/* Search */}
      <div
        style={{
          background: surface.cardBg,
          borderRadius: RADIUS["2xl"],
          border: "1px solid " + surface.border,
          boxShadow: SHADOW.card,
          padding: `${GAP.lg}px ${GAP.xl}px`,
          marginBottom: SPACING[5] ?? GAP.xl,
        }}
      >
        <div style={{ position: "relative", maxWidth: 340 }}>
          <Search
            size={FONT_SIZE.lg}
            strokeWidth={ICON_STROKE.normal}
            style={{
              position: "absolute",
              left: GAP.md,
              top: "50%",
              transform: "translateY(-50%)",
              color: surface.subtext,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid " + surface.border,
              borderRadius: RADIUS.lg,
              padding: `${GAP.sm + 1}px ${GAP.md}px ${GAP.sm + 1}px 36px`,
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.normal,
              background: surface.inputBg,
              color: surface.text,
              outline: "none",
              height: LAYOUT.inputHeight,
              boxSizing: "border-box",
              fontFamily: FONT_FAMILY.base,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: surface.cardBg,
          borderRadius: RADIUS["2xl"],
          border: "1px solid " + surface.border,
          boxShadow: SHADOW.card,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: `${GAP.lg}px ${GAP.xl}px ${GAP.md}px`,
            borderBottom: "1px solid " + surface.border,
          }}
        >
          <span
            style={{
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.bold,
              color: surface.text,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            All Departments
          </span>
          <span
            style={{
              marginLeft: GAP.md,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              color: surface.subtext,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: surface.theadBg }}>
                {[
                  "Department",
                  "Head",
                  "Employees",
                  "Created",
                  "Status",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: PADDING.tableHeader,
                      fontSize: FONT_SIZE.sm,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      letterSpacing: "0.02em",
                      background: surface.theadBg,
                      whiteSpace: "nowrap",
                      fontFamily: FONT_FAMILY.base,
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
                    colSpan={6}
                    style={{
                      padding: `${SPACING[8]}px ${GAP.md}px`,
                      textAlign: "center",
                      fontSize: FONT_SIZE.base,
                      color: surface.subtext,
                      fontFamily: FONT_FAMILY.base,
                    }}
                  >
                    No departments found.
                  </td>
                </tr>
              ) : (
                filtered.map((dept, idx) => {
                  const isHovered = hoveredRow === dept.id;
                  const isAlt = idx % 2 === 1;
                  const rowBg = isHovered
                    ? surface.rowHover
                    : isAlt
                    ? darkMode
                      ? COLORS.surfaceDark
                      : COLORS.gray50
                    : surface.cardBg;

                  return (
                    <tr
                      key={dept.id}
                      onMouseEnter={() => setHoveredRow(dept.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        background: rowBg,
                        transition: TRANSITION,
                        cursor: "default",
                      }}
                    >
                      {/* Department */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          fontSize: FONT_SIZE.base,
                          fontWeight: FONT_WEIGHT.medium,
                          color: surface.text,
                          borderBottom: "1px solid " + surface.divider,
                          fontFamily: FONT_FAMILY.base,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: GAP.md,
                          }}
                        >
                          <div
                            style={{
                              width: LAYOUT.avatar - 4,
                              height: LAYOUT.avatar - 4,
                              borderRadius: RADIUS.md,
                              background: darkMode
                                ? COLORS.surfaceDark
                                : COLORS.primaryMuted,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Building2
                              size={FONT_SIZE.lg}
                              color={COLORS.primary}
                              strokeWidth={ICON_STROKE.normal}
                            />
                          </div>
                          <span>{dept.name}</span>
                        </div>
                      </td>

                      {/* Head */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          fontSize: FONT_SIZE.base,
                          fontWeight: FONT_WEIGHT.normal,
                          color: surface.subtext,
                          borderBottom: "1px solid " + surface.divider,
                          fontFamily: FONT_FAMILY.base,
                        }}
                      >
                        {dept.head}
                      </td>

                      {/* Employees */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          fontSize: FONT_SIZE.base,
                          fontWeight: FONT_WEIGHT.medium,
                          color: surface.text,
                          borderBottom: "1px solid " + surface.divider,
                          fontFamily: FONT_FAMILY.base,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: GAP.sm,
                          }}
                        >
                          <Users
                            size={FONT_SIZE.base}
                            color={surface.subtext}
                            strokeWidth={ICON_STROKE.normal}
                          />
                          {dept.employees}
                        </div>
                      </td>

                      {/* Created */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          fontSize: FONT_SIZE.base,
                          fontWeight: FONT_WEIGHT.normal,
                          color: surface.subtext,
                          borderBottom: "1px solid " + surface.divider,
                          fontFamily: FONT_FAMILY.base,
                        }}
                      >
                        {dept.created}
                      </td>

                      {/* Status */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          borderBottom: "1px solid " + surface.divider,
                        }}
                      >
                        <StatusBadge status={dept.status} />
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: PADDING.tableCell,
                          borderBottom: "1px solid " + surface.divider,
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditTarget(dept);
                            setModalOpen(true);
                          }}
                          style={{
                            background: surface.cardBg,
                            color: surface.text,
                            border: "1px solid " + surface.border,
                            borderRadius: RADIUS.lg,
                            padding: `${GAP.sm - 2}px ${GAP.md + 2}px`,
                            fontSize: FONT_SIZE.base,
                            fontWeight: FONT_WEIGHT.semibold,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: GAP.sm,
                            fontFamily: FONT_FAMILY.base,
                          }}
                        >
                          <Edit2 size={FONT_SIZE.base} strokeWidth={ICON_STROKE.normal} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        open={modalOpen && !editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleAddSave}
        surface={surface}
        editData={null}
      />

      {/* Edit Modal */}
      <Modal
        open={modalOpen && !!editTarget}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={handleEditSave}
        surface={surface}
        editData={editTarget}
      />
    </div>
  );
};

export default Departments;
