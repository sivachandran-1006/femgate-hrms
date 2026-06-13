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
const KpiCard = ({ icon, iconColor, iconBg, label, value, theme }) => (
  <div
    style={{
      background: theme.cardBg,
      borderRadius: 14,
      border: "1px solid " + theme.border,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
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
          fontSize: 28,
          fontWeight: 700,
          color: theme.text,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: theme.subtext,
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

/* ─── Status Badge ─────────────────────────────────────────────── */
const StatusBadge = ({ status, darkMode }) => {
  const styles = darkMode
    ? { background: "#14532d33", color: "#4ade80" }
    : { background: "#dcfce7", color: "#15803d" };
  return (
    <span
      style={{
        ...styles,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
};

/* ─── Modal ────────────────────────────────────────────────────── */
const Modal = ({ open, onClose, onSave, theme, darkMode, editData }) => {
  const [form, setForm] = useState(
    editData || { name: "", head: "", description: "" }
  );

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputStyle = {
    width: "100%",
    border: "1px solid " + theme.inputBorder,
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 400,
    background: theme.inputBg,
    color: theme.text,
    outline: "none",
    height: 38,
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: theme.subtext,
    marginBottom: 6,
    letterSpacing: "0.02em",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.cardBg,
          borderRadius: 14,
          border: "1px solid " + theme.border,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "28px 28px 24px",
          width: 420,
          maxWidth: "90vw",
          fontFamily: "'Inter', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <span
            style={{ fontSize: 15, fontWeight: 700, color: theme.text }}
          >
            {editData ? "Edit Department" : "Add Department"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.subtext,
              display: "flex",
              alignItems: "center",
              padding: 2,
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                paddingTop: 9,
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
            gap: 10,
            marginTop: 24,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: theme.cardBg,
              color: theme.text,
              border: "1px solid " + theme.border,
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
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
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
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
  const theme = getTheme(darkMode);
  const [departments, setDepartments] = useState(DEPARTMENTS_INITIAL);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = departments.filter((d) =>
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
        created: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, "-"),
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
        fontFamily: "'Inter', sans-serif",
        background: theme.pageBg,
        minHeight: "100vh",
        padding: "28px 28px 40px",
        boxSizing: "border-box",
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
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: theme.text,
              lineHeight: 1.2,
            }}
          >
            Departments
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: theme.subtext,
              fontWeight: 400,
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
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "'Inter', sans-serif",
            flexShrink: 0,
          }}
        >
          <Plus size={15} strokeWidth={2} />
          Add Department
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KpiCard
          theme={theme}
          iconBg={darkMode ? "#1e3a5f" : "#dbeafe"}
          icon={<Building2 size={20} color="#2563eb" strokeWidth={1.8} />}
          value={departments.length}
          label="Total Departments"
        />
        <KpiCard
          theme={theme}
          iconBg={darkMode ? "#14532d33" : "#dcfce7"}
          icon={<Users size={20} color="#16a34a" strokeWidth={1.8} />}
          value={totalEmployees}
          label="Total Employees"
        />
        <KpiCard
          theme={theme}
          iconBg={darkMode ? "#3b0764aa" : "#ede9fe"}
          icon={<UserCheck size={20} color="#7c3aed" strokeWidth={1.8} />}
          value={uniqueHeads}
          label="Department Heads"
        />
        <KpiCard
          theme={theme}
          iconBg={darkMode ? "#0c4a6e55" : "#e0f2fe"}
          icon={<Layers size={20} color="#0891b2" strokeWidth={1.8} />}
          value={activeTeams}
          label="Active Teams"
        />
      </div>

      {/* Search */}
      <div
        style={{
          background: theme.cardBg,
          borderRadius: 14,
          border: "1px solid " + theme.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: "16px 20px",
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative", maxWidth: 340 }}>
          <Search
            size={15}
            strokeWidth={1.8}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.muted,
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
              border: "1px solid " + theme.inputBorder,
              borderRadius: 10,
              padding: "9px 14px 9px 36px",
              fontSize: 13,
              fontWeight: 400,
              background: theme.inputBg,
              color: theme.text,
              outline: "none",
              height: 38,
              boxSizing: "border-box",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: theme.cardBg,
          borderRadius: 14,
          border: "1px solid " + theme.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid " + theme.border,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>
            All Departments
          </span>
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              fontWeight: 500,
              color: theme.subtext,
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
              <tr style={{ background: theme.tableHeaderBg }}>
                {["Department", "Head", "Employees", "Created", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: theme.subtext,
                        letterSpacing: "0.02em",
                        background: theme.tableHeaderBg,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "32px 14px",
                      textAlign: "center",
                      fontSize: 13,
                      color: theme.subtext,
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
                    ? theme.tableRowHover
                    : isAlt
                    ? darkMode
                      ? "#172033"
                      : "#fafbfc"
                    : theme.cardBg;

                  return (
                    <tr
                      key={dept.id}
                      onMouseEnter={() => setHoveredRow(dept.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        background: rowBg,
                        transition: "background 0.12s",
                        cursor: "default",
                      }}
                    >
                      {/* Department */}
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: theme.text,
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: darkMode ? "#1e3a5f" : "#dbeafe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Building2
                              size={15}
                              color="#2563eb"
                              strokeWidth={1.8}
                            />
                          </div>
                          <span>{dept.name}</span>
                        </div>
                      </td>

                      {/* Head */}
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 400,
                          color: theme.subtext,
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        {dept.head}
                      </td>

                      {/* Employees */}
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: theme.text,
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Users
                            size={13}
                            color={theme.muted}
                            strokeWidth={1.8}
                          />
                          {dept.employees}
                        </div>
                      </td>

                      {/* Created */}
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 400,
                          color: theme.subtext,
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        {dept.created}
                      </td>

                      {/* Status */}
                      <td
                        style={{
                          padding: "13px 14px",
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        <StatusBadge status={dept.status} darkMode={darkMode} />
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "13px 14px",
                          borderBottom: "1px solid " + theme.border,
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditTarget(dept);
                            setModalOpen(true);
                          }}
                          style={{
                            background: theme.cardBg,
                            color: theme.text,
                            border: "1px solid " + theme.border,
                            borderRadius: 10,
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          <Edit2 size={13} strokeWidth={2} />
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
        theme={theme}
        darkMode={darkMode}
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
        theme={theme}
        darkMode={darkMode}
        editData={editTarget}
      />
    </div>
  );
};

export default Departments;
