import { useState } from "react";
import {
  Shield, Users, Key, Plus, Edit2, Trash2, Copy,
  Check, X, ChevronDown, ChevronRight, Search,
} from "lucide-react";
import { PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { MOCK_USERS } from "../../constants/mockUsers";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const ROLES_ORDER = ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "FINANCE", "IT_ADMIN", "EMPLOYEE"];

const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: "Full system owner — all modules, all companies, billing & security",
  ADMIN:       "Operational administrator — all HR modules, no system config",
  HR:          "People ops — employees, attendance, leave, recruitment, performance",
  MANAGER:     "Team lead — team attendance, leave approvals, performance reviews",
  FINANCE:     "Payroll & compensation — payroll generation, finance analytics",
  IT_ADMIN:    "IT & infra — assets, helpdesk, IT org view",
  EMPLOYEE:    "Self-service — personal profile, attendance, leave, payslips",
};

const ROLE_ICON_BG = {
  SUPER_ADMIN: COLORS.warningLight,
  ADMIN:       COLORS.primaryLight,
  HR:          COLORS.purpleMuted,
  MANAGER:     COLORS.successLight,
  FINANCE:     "#fce7f3",
  IT_ADMIN:    COLORS.infoLight,
  EMPLOYEE:    COLORS.gray100,
};

const MODULE_GROUPS = [
  { module: "Dashboard",        keys: ["dashboard.view"] },
  { module: "Employees",        keys: ["employees.view","employees.view_team","employees.add","employees.edit","employees.delete","employees.view_profile_self","employees.edit_profile_self"] },
  { module: "Departments",      keys: ["departments.view","departments.create","departments.edit","departments.delete"] },
  { module: "Attendance",       keys: ["attendance.view_own","attendance.view_team","attendance.view_all","attendance.approve_correction","attendance.approve_wfh","attendance.regularize_own"] },
  { module: "Leave",            keys: ["leave.apply","leave.cancel_own","leave.view_own","leave.view_team","leave.view_all","leave.approve","leave.reject","leave.configure_policy"] },
  { module: "Payroll",          keys: ["payroll.view_own","payroll.download_own","payroll.view_all","payroll.generate","payroll.process","payroll.approve","payroll.publish","payroll.manage_components","payroll.manage_tax"] },
  { module: "Recruitment",      keys: ["recruitment.view","recruitment.create_opening","recruitment.manage_candidates","recruitment.submit_hiring_request","recruitment.participate_interview"] },
  { module: "Onboarding",       keys: ["onboarding.view","onboarding.create_tasks","onboarding.track"] },
  { module: "Performance",      keys: ["performance.view_own","performance.view_team","performance.set_goals","performance.review_goals","performance.submit_rating","performance.manage_cycles","performance.configure_kpis"] },
  { module: "Documents",        keys: ["documents.view_own","documents.upload_own","documents.download_own","documents.view_all","documents.verify"] },
  { module: "Assets",           keys: ["assets.view_own","assets.view_all","assets.add","assets.assign","assets.return","assets.maintenance","assets.report_issue","assets.request_return"] },
  { module: "Helpdesk",         keys: ["helpdesk.create_ticket","helpdesk.view_own_tickets","helpdesk.reply_ticket","helpdesk.view_all_tickets","helpdesk.manage_tickets","helpdesk.resolve_tickets","helpdesk.view_analytics","helpdesk.view_sla"] },
  { module: "Analytics",        keys: ["analytics.view_team","analytics.view_full","analytics.view_billing","analytics.view_tenant","analytics.view_license"] },
  { module: "Calendar",         keys: ["calendar.view"] },
  { module: "System & Settings", keys: ["settings.view","settings.company_config","users.manage","users.create_admin","users.delete","users.force_logout","users.create_employee","users.edit_employee","users.reset_password"] },
  { module: "Roles & Audit",    keys: ["roles.manage","roles.create","roles.delete","roles.assign_permissions","roles.assign_existing","audit.view_all","audit.view_security","audit.view_operational"] },
  { module: "Billing & Infra",  keys: ["billing.view","billing.manage","security.configure","integrations.manage","company.manage","company.create","system.health","system.license","system.storage"] },
];

const PERM_LABEL = (key) => key.split(".").slice(1).join(".").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

// ── Reusable atoms ────────────────────────────────────────────────────────────

const Badge = ({ bg, text, children, small }) => (
  <span style={{ display: "inline-block", fontSize: small ? 10 : 11, fontWeight: FONT_WEIGHT.semibold, padding: small ? "1px 6px" : "2px 9px", borderRadius: RADIUS.full, background: bg, color: text, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Chip = ({ checked, disabled, onChange }) => (
  <button
    onClick={disabled ? undefined : onChange}
    title={disabled ? "Only Super Admin can change permissions" : undefined}
    style={{ width: 22, height: 22, borderRadius: 6, border: checked ? "none" : `1.5px solid ${COLORS.gray300}`, background: checked ? COLORS.primary : "transparent", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s", flexShrink: 0, opacity: disabled ? 0.5 : 1 }}
  >
    {checked && <Check size={12} color={COLORS.white} strokeWidth={3} />}
  </button>
);

const btnStyle = (border, color) => ({
  width: 28, height: 28, borderRadius: RADIUS.md, border: `1px solid ${border}`,
  background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color, transition: "background 0.12s",
});

// ── Role Card ─────────────────────────────────────────────────────────────────

const RoleCard = ({ roleKey, onEdit, onDelete, onClone, dark, surface, users, roles, roleLabels, onUserRoleChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const label = roleLabels[roleKey] || ROLE_LABELS[roleKey] || roleKey;
  const color = ROLE_COLORS[roleKey] || { bg: COLORS.gray100, text: COLORS.gray600 };
  const desc  = ROLE_DESCRIPTIONS[roleKey] || "";
  const cardUsers = users.filter(u => u.role === roleKey);
  const count = cardUsers.length;
  const isSA  = roleKey === "SUPER_ADMIN";

  return (
    <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "visible" }}>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: RADIUS.full, background: ROLE_ICON_BG[roleKey] || COLORS.gray100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={18} color={color.text} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{label}</p>
              <Badge bg={color.bg} text={color.text} small>{roleKey}</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onClone(roleKey)} title="Clone role" style={btnStyle(surface.border, surface.subtext)}><Copy size={13} strokeWidth={2} /></button>
            <button onClick={() => onEdit(roleKey)} title="Edit role" style={btnStyle(COLORS.primaryLight, COLORS.primary)}><Edit2 size={13} strokeWidth={2} color={COLORS.primary} /></button>
            {!isSA && (
              <button onClick={() => onDelete(roleKey)} title="Delete role" style={btnStyle(COLORS.dangerLight, COLORS.danger)}><Trash2 size={13} strokeWidth={2} color={COLORS.danger} /></button>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext, lineHeight: 1.5 }}>{desc}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${surface.border}` }}>
          <button onClick={() => setExpanded(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0, color: surface.subtext }}>
            <Users size={13} strokeWidth={1.8} />
            <span style={{ fontSize: FONT_SIZE.sm }}>{count} user{count !== 1 ? "s" : ""}</span>
            <ChevronDown size={12} strokeWidth={2} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }} />
          </button>
          {isSA && <span style={{ fontSize: 10, color: surface.subtext, fontStyle: "italic" }}>Protected</span>}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${surface.border}`, background: dark ? COLORS.dark.pageBg + "40" : COLORS.gray50, borderRadius: `0 0 ${RADIUS["2xl"]}px ${RADIUS["2xl"]}px`, padding: count === 0 ? "12px 20px" : "8px 0" }}>
          {count === 0 ? (
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext, fontStyle: "italic" }}>No users assigned to this role</p>
          ) : (
            cardUsers.map((u, i) => {
              const isOpen = openDropdown === u.email;
              return (
                <div key={u.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px", borderBottom: i < cardUsers.length - 1 ? `1px solid ${surface.border}` : "none", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: RADIUS.full, background: COLORS.primaryMuted, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                      {u.avatar || u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: surface.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                    </div>
                  </div>

                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button onClick={() => setOpenDropdown(isOpen ? null : u.email)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: RADIUS.lg, border: `1px solid ${surface.border}`, background: surface.cardBg, cursor: "pointer", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, fontFamily: FONT_FAMILY.base, whiteSpace: "nowrap" }}>
                      {roleLabels[u.role] || ROLE_LABELS[u.role] || u.role}
                      <ChevronDown size={11} strokeWidth={2} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                    </button>

                    {isOpen && (
                      <>
                      <div onClick={() => setOpenDropdown(null)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
                      <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.xl, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 9999, minWidth: 170, overflow: "hidden" }}>
                        {roles.map(r => {
                          const rc = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
                          const rl = roleLabels[r] || ROLE_LABELS[r] || r;
                          const isActive = u.role === r;
                          return (
                            <button key={r} onClick={() => { onUserRoleChange(u.email, r); setOpenDropdown(null); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "none", background: isActive ? (dark ? COLORS.dark.rowHover : COLORS.gray100) : "transparent", cursor: "pointer", gap: 8, fontFamily: FONT_FAMILY.base }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: rc.text, display: "inline-block", flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: isActive ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium, color: surface.text }}>{rl}</span>
                              </div>
                              {isActive && <Check size={11} color={COLORS.primary} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ── Modal shell ───────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, surface, children }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, width: "100%", maxWidth: 480, boxShadow: "0 24px 48px rgba(0,0,0,0.22)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${surface.border}` }}>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{title}</p>
        <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: surface.subtext, padding: 4, borderRadius: RADIUS.md, display: "flex" }}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

export default function RolesPermissions({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [perms, setPerms] = useState(() => {
    const copy = {};
    Object.entries(PERMISSIONS).forEach(([k, v]) => { copy[k] = [...v]; });
    return copy;
  });

  const [roles, setRoles] = useState([...ROLES_ORDER]);
  const [roleDescriptions, setRoleDescriptions] = useState({ ...ROLE_DESCRIPTIONS });
  const [roleLabels, setRoleLabels] = useState({ ...ROLE_LABELS });
  const [users, setUsers] = useState(MOCK_USERS.map(u => ({ ...u })));

  const [tab, setTab] = useState("roles");
  const [expandedModules, setExpandedModules] = useState(new Set(["Employees", "Leave", "Payroll"]));
  const [permSearch, setPermSearch] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ key: "", label: "", desc: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const togglePerm = (permKey, roleKey) => {
    setPerms(prev => {
      const cur = prev[permKey] || [];
      const next = cur.includes(roleKey) ? cur.filter(r => r !== roleKey) : [...cur, roleKey];
      return { ...prev, [permKey]: next };
    });
  };

  const toggleModule = (mod) => {
    setExpandedModules(prev => {
      const s = new Set(prev);
      s.has(mod) ? s.delete(mod) : s.add(mod);
      return s;
    });
  };

  const handleEditSave = () => {
    if (!editModal) return;
    setRoleLabels(p => ({ ...p, [editModal.roleKey]: editModal.label }));
    setRoleDescriptions(p => ({ ...p, [editModal.roleKey]: editModal.desc }));
    setEditModal(null);
    showToast(`Role "${editModal.label}" updated`);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setRoles(p => p.filter(r => r !== deleteModal));
    setUsers(p => p.map(u => u.role === deleteModal ? { ...u, role: "EMPLOYEE" } : u));
    setDeleteModal(null);
    showToast(`Role deleted — affected users moved to Employee`, "warning");
  };

  const handleClone = (roleKey) => {
    const newKey = `${roleKey}_COPY`;
    if (roles.includes(newKey)) { showToast("Clone already exists", "warning"); return; }
    setRoles(p => [...p, newKey]);
    setRoleLabels(p => ({ ...p, [newKey]: `${roleLabels[roleKey] || roleKey} (Copy)` }));
    setRoleDescriptions(p => ({ ...p, [newKey]: roleDescriptions[roleKey] || "" }));
    const clonedPerms = {};
    Object.entries(perms).forEach(([k, v]) => { clonedPerms[k] = v.includes(roleKey) ? [...v, newKey] : [...v]; });
    setPerms(clonedPerms);
    showToast(`Cloned as ${newKey}`);
  };

  const handleCreateRole = () => {
    const key = newRole.key.toUpperCase().replace(/\s+/g, "_");
    if (!key || roles.includes(key)) { showToast("Invalid or duplicate key", "error"); return; }
    setRoles(p => [...p, key]);
    setRoleLabels(p => ({ ...p, [key]: newRole.label || key }));
    setRoleDescriptions(p => ({ ...p, [key]: newRole.desc }));
    setCreateModal(false);
    setNewRole({ key: "", label: "", desc: "" });
    showToast(`Role "${newRole.label || key}" created`);
  };

  const handleUserRoleChange = (email, newRoleKey) => {
    setUsers(p => p.map(u => u.email === email ? { ...u, role: newRoleKey } : u));
    showToast(`Role updated for ${email.split("@")[0]}`);
  };

  const filteredGroups = MODULE_GROUPS.map(g => ({
    ...g,
    keys: g.keys.filter(k => k.toLowerCase().includes(permSearch.toLowerCase())),
  })).filter(g => g.keys.length > 0 || g.module.toLowerCase().includes(permSearch.toLowerCase()));

  const cardStyle = { background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], overflow: "hidden" };

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none", width: "100%", boxSizing: "border-box",
  };

  const labelStyle = { display: "block", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, marginBottom: 6 };

  const btnPrimary = { padding: "9px 18px", borderRadius: RADIUS.lg, border: "none", background: COLORS.primary, color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer" };
  const btnCancel  = { padding: "9px 18px", borderRadius: RADIUS.lg, border: `1px solid ${surface.border}`, background: "transparent", color: surface.subtext, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, cursor: "pointer" };

  // ── Roles tab ──

  const RolesTab = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>System Roles</p>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>{roles.length} roles configured</p>
        </div>
        <button onClick={() => setCreateModal(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 7, padding: "9px 16px" }}>
          <Plus size={14} strokeWidth={2.5} /> Create Role
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {roles.map(r => (
          <RoleCard key={r} roleKey={r} dark={darkMode} surface={surface} users={users} roles={roles} roleLabels={roleLabels}
            onEdit={(rk) => setEditModal({ roleKey: rk, label: roleLabels[rk] || rk, desc: roleDescriptions[rk] || "" })}
            onDelete={(rk) => setDeleteModal(rk)}
            onClone={handleClone}
            onUserRoleChange={handleUserRoleChange}
          />
        ))}
      </div>
    </div>
  );

  // ── Permissions tab ──

  const PermissionsTab = () => {
    const visibleRoles = roles.filter(r => ROLES_ORDER.includes(r) || r.endsWith("_COPY"));
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Permission Matrix</p>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Click checkboxes to grant or revoke permissions per role</p>
          </div>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={13} color={surface.subtext} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input value={permSearch} onChange={e => setPermSearch(e.target.value)} placeholder="Filter permissions…" style={{ ...inputStyle, paddingLeft: 30 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          {visibleRoles.map(r => {
            const c = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c.text, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{roleLabels[r] || r}</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...cardStyle, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: surface.theadBg }}>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}`, width: 220, position: "sticky", left: 0, background: surface.theadBg, zIndex: 2 }}>PERMISSION</th>
                {visibleRoles.map(r => {
                  const c = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
                  return (
                    <th key={r} style={{ padding: "8px 10px", borderBottom: `1px solid ${surface.border}`, minWidth: 80, textAlign: "center" }}>
                      <Badge bg={c.bg} text={c.text} small>{roleLabels[r] || r}</Badge>
                    </th>
                  );
                })}
              </tr>
            </thead>
            {filteredGroups.map(group => (
              <tbody key={group.module}>
                <tr onClick={() => toggleModule(group.module)} style={{ background: darkMode ? COLORS.dark.pageBg : COLORS.gray50, cursor: "pointer" }}>
                  <td colSpan={visibleRoles.length + 1} style={{ padding: "7px 16px", borderBottom: `1px solid ${surface.border}`, borderTop: `1px solid ${surface.border}`, position: "sticky", left: 0, background: darkMode ? COLORS.dark.pageBg : COLORS.gray50 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {expandedModules.has(group.module) ? <ChevronDown size={13} color={surface.subtext} strokeWidth={2} /> : <ChevronRight size={13} color={surface.subtext} strokeWidth={2} />}
                      <span style={{ fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>{group.module}</span>
                      <span style={{ fontSize: 10, color: surface.subtext, opacity: 0.7 }}>({group.keys.length})</span>
                    </div>
                  </td>
                </tr>
                {expandedModules.has(group.module) && group.keys.map((key, rowIdx) => (
                  <tr key={key} style={{ background: rowIdx % 2 === 0 ? "transparent" : (darkMode ? COLORS.dark.rowHover + "08" : COLORS.gray50 + "50") }}>
                    <td style={{ padding: "7px 16px 7px 32px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.subtext, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220, position: "sticky", left: 0, background: rowIdx % 2 === 0 ? surface.cardBg : (darkMode ? COLORS.dark.rowHover : COLORS.gray50), zIndex: 1 }}>
                      {PERM_LABEL(key)}
                    </td>
                    {visibleRoles.map(roleKey => (
                      <td key={roleKey} style={{ padding: "7px 10px", borderBottom: `1px solid ${surface.border}`, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Chip checked={(perms[key] || []).includes(roleKey)} disabled={false} onChange={() => togglePerm(key, roleKey)} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11, color: surface.subtext, fontStyle: "italic" }}>Changes are applied immediately in this session. In production these would persist to the database.</p>
      </div>
    );
  };

  // ── Users tab ──

  const UsersTab = () => (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>User Role Assignment</p>
        <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Assign or reassign roles to system users</p>
      </div>
      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: surface.theadBg }}>
              {["User", "Email", "Current Role", "Change Role"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const c = ROLE_COLORS[u.role] || { bg: COLORS.gray100, text: COLORS.gray600 };
              const lbl = roleLabels[u.role] || u.role;
              return (
                <tr key={u.email} style={{ background: i % 2 === 0 ? "transparent" : (darkMode ? COLORS.dark.rowHover + "20" : COLORS.gray50) }}>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: RADIUS.full, background: COLORS.primaryMuted, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                        {u.avatar || u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <Badge bg={c.bg} text={c.text}>{lbl}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <select value={u.role} onChange={e => handleUserRoleChange(u.email, e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160, padding: "6px 10px", cursor: "pointer" }}>
                      {roles.map(r => <option key={r} value={r}>{roleLabels[r] || r}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TABS = [
    { id: "roles",       label: "Roles",           icon: <Shield size={14} strokeWidth={2} /> },
    { id: "permissions", label: "Permissions",      icon: <Key    size={14} strokeWidth={2} /> },
    { id: "users",       label: "User Assignment",  icon: <Users  size={14} strokeWidth={2} /> },
  ];

  return (
    <div style={{ fontFamily: FONT_FAMILY.base, color: surface.text, maxWidth: "100%" }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: RADIUS.xl, background: COLORS.purpleMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={20} color={COLORS.purple} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Roles & Permissions</h1>
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>Manage system roles, permission matrix, and user assignments</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${surface.border}`, marginBottom: 24 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "none", background: "transparent", borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent", color: active ? COLORS.primary : surface.subtext, fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer", transition: "color 0.12s", marginBottom: -1 }}>
              {t.icon} {t.label}
            </button>
          );
        })}
      </div>

      {tab === "roles"       && <RolesTab />}
      {tab === "permissions" && <PermissionsTab />}
      {tab === "users"       && <UsersTab />}

      {editModal && (
        <Modal title={`Edit Role — ${editModal.label}`} onClose={() => setEditModal(null)} surface={surface}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Role Display Name</label>
              <input value={editModal.label} onChange={e => setEditModal(p => ({ ...p, label: e.target.value }))} style={inputStyle} placeholder="e.g. HR Manager" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={editModal.desc} onChange={e => setEditModal(p => ({ ...p, desc: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical", height: "auto", paddingTop: 8, paddingBottom: 8 }} placeholder="What does this role do?" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setEditModal(null)} style={btnCancel}>Cancel</button>
              <button onClick={handleEditSave} style={btnPrimary}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && (
        <Modal title="Delete Role" onClose={() => setDeleteModal(null)} surface={surface}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: RADIUS.full, background: COLORS.dangerMuted, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Trash2 size={22} color={COLORS.danger} strokeWidth={1.8} />
            </div>
            <p style={{ margin: "0 0 8px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Delete "{roleLabels[deleteModal] || deleteModal}"?</p>
            <p style={{ margin: "0 0 22px", fontSize: FONT_SIZE.sm, color: surface.subtext, lineHeight: 1.5 }}>All users with this role will be reassigned to <strong>Employee</strong>. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ ...btnCancel, flex: 1, padding: "10px 0" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "10px 0", borderRadius: RADIUS.lg, border: "none", background: COLORS.danger, color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}>Delete Role</button>
            </div>
          </div>
        </Modal>
      )}

      {createModal && (
        <Modal title="Create New Role" onClose={() => setCreateModal(false)} surface={surface}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Role Key <span style={{ color: COLORS.danger }}>*</span></label>
              <input value={newRole.key} onChange={e => setNewRole(p => ({ ...p, key: e.target.value }))} style={inputStyle} placeholder="e.g. PROCUREMENT (auto-uppercased)" />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: surface.subtext }}>Used internally. Letters and underscores only.</p>
            </div>
            <div>
              <label style={labelStyle}>Display Name <span style={{ color: COLORS.danger }}>*</span></label>
              <input value={newRole.label} onChange={e => setNewRole(p => ({ ...p, label: e.target.value }))} style={inputStyle} placeholder="e.g. Procurement Manager" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={newRole.desc} onChange={e => setNewRole(p => ({ ...p, desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical", height: "auto", paddingTop: 8, paddingBottom: 8 }} placeholder="What does this role do?" />
            </div>
            <p style={{ margin: 0, fontSize: 11, color: surface.subtext, fontStyle: "italic" }}>After creating, go to the Permissions tab to assign permission keys to this role.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setCreateModal(false)} style={btnCancel}>Cancel</button>
              <button onClick={handleCreateRole} disabled={!newRole.key || !newRole.label} style={{ ...btnPrimary, background: !newRole.key || !newRole.label ? COLORS.gray300 : COLORS.primary, cursor: !newRole.key || !newRole.label ? "not-allowed" : "pointer" }}>Create Role</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, background: toast.type === "error" ? COLORS.danger : toast.type === "warning" ? COLORS.warning : COLORS.success, color: COLORS.white, borderRadius: RADIUS.xl, padding: "10px 18px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={14} strokeWidth={3} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
