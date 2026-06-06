import { useState } from "react";
import { Search, Plus, Pencil, Key, UserX, UserCheck, Trash2, X, User } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const ROLE_COLORS = {
  SUPER_ADMIN: { bg: "#fef3c7", text: "#d97706" },
  ADMIN: { bg: "#dbeafe", text: "#2563eb" },
  HR: { bg: "#f3e8ff", text: "#7c3aed" },
  MANAGER: { bg: "#dcfce7", text: "#16a34a" },
  FINANCE: { bg: "#fce7f3", text: "#be185d" },
  IT_ADMIN: { bg: "#e0f2fe", text: "#0284c7" },
  EMPLOYEE: { bg: "#f1f5f9", text: "#475569" },
};
const STATUS_COLORS = {
  Active: { bg: "#dcfce7", text: "#16a34a" },
  Suspended: { bg: "#fee2e2", text: "#dc2626" },
  Pending: { bg: "#fef3c7", text: "#d97706" },
};

const INIT_USERS = [
  { id: 1, name: "Super Admin", email: "superadmin@mgatesystems.com", role: "SUPER_ADMIN", status: "Active", lastLogin: "Just now", avatar: "SA" },
  { id: 2, name: "Admin User", email: "admin@mgatesystems.com", role: "ADMIN", status: "Active", lastLogin: "2h ago", avatar: "AD" },
  { id: 3, name: "HR Manager", email: "hr@mgatesystems.com", role: "HR", status: "Active", lastLogin: "1h ago", avatar: "HR" },
  { id: 4, name: "Team Manager", email: "manager@mgatesystems.com", role: "MANAGER", status: "Active", lastLogin: "3h ago", avatar: "TM" },
  { id: 5, name: "Finance Admin", email: "finance@mgatesystems.com", role: "FINANCE", status: "Active", lastLogin: "5h ago", avatar: "FA" },
  { id: 6, name: "IT Admin", email: "itadmin@mgatesystems.com", role: "IT_ADMIN", status: "Active", lastLogin: "30m ago", avatar: "IT" },
  { id: 7, name: "John Employee", email: "employee@mgatesystems.com", role: "EMPLOYEE", status: "Active", lastLogin: "1d ago", avatar: "JE" },
  { id: 8, name: "Priya Sharma", email: "priya@mgatesystems.com", role: "EMPLOYEE", status: "Active", lastLogin: "2d ago", avatar: "PS" },
  { id: 9, name: "Arjun Kumar", email: "arjun@mgatesystems.com", role: "EMPLOYEE", status: "Pending", lastLogin: "Never", avatar: "AK" },
  { id: 10, name: "Safeer Ahmed", email: "safeer@mgatesystems.com", role: "EMPLOYEE", status: "Active", lastLogin: "4h ago", avatar: "SA2" },
  { id: 11, name: "Mani Raj", email: "mani@mgatesystems.com", role: "EMPLOYEE", status: "Suspended", lastLogin: "10d ago", avatar: "MR" },
  { id: 12, name: "Kavitha R", email: "kavitha@mgatesystems.com", role: "HR", status: "Active", lastLogin: "6h ago", avatar: "KR" },
];

const ROLES = ["All", "SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "FINANCE", "IT_ADMIN", "EMPLOYEE"];
const STATUSES = ["All", "Active", "Suspended", "Pending"];

export default function UserManagement({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [users, setUsers] = useState(INIT_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "EMPLOYEE", password: "", confirmPassword: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    const id = users.length + 1;
    setUsers([...users, { id, name: newUser.name, email: newUser.email, role: newUser.role, status: "Active", lastLogin: "Never", avatar: newUser.name.slice(0, 2).toUpperCase() }]);
    setNewUser({ name: "", email: "", role: "EMPLOYEE", password: "", confirmPassword: "" });
    setShowAddModal(false);
    showToast(`User "${newUser.name}" created successfully`);
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map((u) => {
      if (u.id !== id) return u;
      const next = u.status === "Active" ? "Suspended" : "Active";
      showToast(`User ${next === "Suspended" ? "suspended" : "activated"} successfully`);
      return { ...u, status: next };
    }));
  };

  const handleDelete = () => {
    setUsers(users.filter((u) => u.id !== deleteTarget.id));
    showToast(`User "${deleteTarget.name}" deleted`, "error");
    setDeleteTarget(null);
  };

  const handleResetPassword = (user) => {
    showToast(`Password reset email sent to ${user.email}`);
  };

  const inputStyle = {
    border: `1px solid ${surface.border}`,
    borderRadius: RADIUS.lg,
    padding: "8px 12px",
    fontSize: FONT_SIZE.sm,
    background: surface.inputBg,
    color: surface.text,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
  };

  const btnPrimary = {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: RADIUS.lg,
    padding: "8px 16px",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const stats = [
    { label: "Total Users", value: users.length, sub: "registered accounts" },
    { label: "Active", value: users.filter((u) => u.status === "Active").length, sub: "currently active" },
    { label: "Admins", value: users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").length, sub: "with admin access" },
    { label: "Suspended", value: users.filter((u) => u.status === "Suspended").length, sub: "accounts suspended" },
  ];

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "error" ? COLORS.danger : COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>User Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Manage system users, roles and permissions</p>
        </div>
        <button style={btnPrimary} onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{s.label.toUpperCase()}</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], boxShadow: SHADOW.xs, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${surface.border}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: surface.subtext }} />
            <input style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select style={{ ...inputStyle, minWidth: 140 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r.replace("_", " ")}</option>)}
          </select>
          <select style={{ ...inputStyle, minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: surface.theadBg }}>
                {["User", "Email", "Role", "Status", "Last Login", "Actions"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}`, whiteSpace: "nowrap" }}>{col.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} style={{ background: i % 2 === 0 ? "transparent" : (darkMode ? "#1e293b20" : "#f8fafc") }}>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: RADIUS.full, background: ROLE_COLORS[user.role]?.bg || "#f1f5f9", color: ROLE_COLORS[user.role]?.text || "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                        {user.avatar.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{user.email}</td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: ROLE_COLORS[user.role]?.bg, color: ROLE_COLORS[user.role]?.text }}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: STATUS_COLORS[user.status]?.bg, color: STATUS_COLORS[user.status]?.text }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{user.lastLogin}</td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="Edit" onClick={() => showToast("Edit user (coming soon)")} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 7px", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center" }}>
                        <Pencil size={13} />
                      </button>
                      <button title="Reset Password" onClick={() => handleResetPassword(user)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 7px", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center" }}>
                        <Key size={13} />
                      </button>
                      <button title={user.status === "Active" ? "Suspend" : "Activate"} onClick={() => handleToggleStatus(user.id)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 7px", cursor: "pointer", color: user.status === "Active" ? COLORS.warning : COLORS.success, display: "flex", alignItems: "center" }}>
                        {user.status === "Active" ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                      <button title="Delete" onClick={() => setDeleteTarget(user)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 7px", cursor: "pointer", color: COLORS.danger, display: "flex", alignItems: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: surface.subtext, fontSize: FONT_SIZE.sm }}>No users found matching your filters.</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: 28, width: 460, boxShadow: SHADOW.modal }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ label: "Full Name *", key: "name", type: "text", placeholder: "Enter full name" }, { label: "Email Address *", key: "email", type: "email", placeholder: "Enter email" }, { label: "Password *", key: "password", type: "password", placeholder: "Min 8 characters" }, { label: "Confirm Password *", key: "confirmPassword", type: "password", placeholder: "Repeat password" }].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={newUser[f.key]} onChange={(e) => setNewUser({ ...newUser, [f.key]: e.target.value })} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, marginBottom: 5 }}>Role *</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}>
                  {ROLES.filter((r) => r !== "All").map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, cursor: "pointer", color: surface.text }}>Cancel</button>
              <button onClick={handleAddUser} style={btnPrimary}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: 28, width: 400, boxShadow: SHADOW.modal }}>
            <h2 style={{ margin: "0 0 10px", fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Delete User</h2>
            <p style={{ margin: "0 0 20px", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm, cursor: "pointer", color: surface.text }}>Cancel</button>
              <button onClick={handleDelete} style={{ ...btnPrimary, background: COLORS.danger }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
