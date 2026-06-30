import { useState } from "react";
import {
  Shield, Users, Key, Plus, Edit2, Trash2, Copy,
  Check, X, ChevronDown, ChevronRight, Search,
} from "lucide-react";
import {
  Box, Stack, Group, Paper, Text, Button, ActionIcon,
  Table, TextInput, Textarea, Select,
} from "@mantine/core";
import { PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { MOCK_USERS } from "../../constants/mockUsers";
import { COLORS } from "../../theme/colors";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

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
  <Box
    component="span"
    style={{
      display: "inline-block",
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      padding: small ? "1px 6px" : "2px 9px",
      borderRadius: 999,
      background: bg,
      color: text,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </Box>
);

const Chip = ({ checked, disabled, onChange }) => (
  <Box
    component="button"
    onClick={disabled ? undefined : onChange}
    title={disabled ? "Only Super Admin can change permissions" : undefined}
    style={{
      width: 22,
      height: 22,
      borderRadius: 6,
      border: checked ? "none" : `1.5px solid ${COLORS.gray300}`,
      background: checked ? COLORS.primary : "transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.12s",
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {checked && <Check size={12} color={COLORS.white} strokeWidth={3} />}
  </Box>
);

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
    <Paper
      withBorder
      radius="xl"
      style={{
        background: surface.cardBg,
        border: `1px solid ${surface.border}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "visible",
      }}
    >
      <Stack gap={12} p={20}>
        <Group align="flex-start" justify="space-between" gap={10}>
          <Group align="center" gap={10}>
            <Box
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: ROLE_ICON_BG[roleKey] || COLORS.gray100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={18} color={color.text} strokeWidth={1.8} />
            </Box>
            <Box>
              <Text fw={700} size="sm" c={surface.text}>{label}</Text>
              <Badge bg={color.bg} text={color.text} small>{roleKey}</Badge>
            </Box>
          </Group>
          <Group gap={6} style={{ flexShrink: 0 }}>
            <ActionIcon
              variant="outline"
              size="sm"
              onClick={() => onClone(roleKey)}
              title="Clone role"
              style={{ border: `1px solid ${surface.border}`, color: surface.subtext }}
            >
              <Copy size={13} strokeWidth={2} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              size="sm"
              onClick={() => onEdit(roleKey)}
              title="Edit role"
              style={{ border: `1px solid ${COLORS.primaryLight}`, color: COLORS.primary }}
            >
              <Edit2 size={13} strokeWidth={2} color={COLORS.primary} />
            </ActionIcon>
            {!isSA && (
              <ActionIcon
                variant="outline"
                size="sm"
                onClick={() => onDelete(roleKey)}
                title="Delete role"
                style={{ border: `1px solid ${COLORS.dangerLight}`, color: COLORS.danger }}
              >
                <Trash2 size={13} strokeWidth={2} color={COLORS.danger} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        <Text size="sm" c={surface.subtext} style={{ lineHeight: 1.5 }}>{desc}</Text>

        <Group
          justify="space-between"
          align="center"
          pt={8}
          style={{ borderTop: `1px solid ${surface.border}` }}
        >
          <Box
            component="button"
            onClick={() => setExpanded(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: surface.subtext,
            }}
          >
            <Users size={13} strokeWidth={1.8} />
            <Text size="sm">{count} user{count !== 1 ? "s" : ""}</Text>
            <ChevronDown size={12} strokeWidth={2} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }} />
          </Box>
          {isSA && <Text size="xs" c={surface.subtext} fs="italic">Protected</Text>}
        </Group>
      </Stack>

      {expanded && (
        <Box
          style={{
            borderTop: `1px solid ${surface.border}`,
            background: dark ? COLORS.dark.pageBg + "40" : COLORS.gray50,
            borderRadius: `0 0 16px 16px`,
            padding: count === 0 ? "12px 20px" : "8px 0",
          }}
        >
          {count === 0 ? (
            <Text size="sm" c={surface.subtext} fs="italic">No users assigned to this role</Text>
          ) : (
            cardUsers.map((u, i) => {
              const isOpen = openDropdown === u.email;
              return (
                <Group
                  key={u.email}
                  justify="space-between"
                  align="center"
                  px={20}
                  py={8}
                  gap={10}
                  style={{
                    borderBottom: i < cardUsers.length - 1 ? `1px solid ${surface.border}` : "none",
                  }}
                >
                  <Group align="center" gap={9} style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: COLORS.primaryMuted,
                        color: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {u.avatar || u.name.slice(0, 2).toUpperCase()}
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Text
                        size="sm"
                        fw={600}
                        c={surface.text}
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {u.name}
                      </Text>
                      <Text
                        size="xs"
                        c={surface.subtext}
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {u.email}
                      </Text>
                    </Box>
                  </Group>

                  <Box style={{ position: "relative", flexShrink: 0 }}>
                    <Box
                      component="button"
                      onClick={() => setOpenDropdown(isOpen ? null : u.email)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: `1px solid ${surface.border}`,
                        background: surface.cardBg,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        color: surface.subtext,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {roleLabels[u.role] || ROLE_LABELS[u.role] || u.role}
                      <ChevronDown size={11} strokeWidth={2} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                    </Box>

                    {isOpen && (
                      <>
                        <Box onClick={() => setOpenDropdown(null)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
                        <Box
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            background: surface.cardBg,
                            border: `1px solid ${surface.border}`,
                            borderRadius: 12,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            zIndex: 9999,
                            minWidth: 170,
                            overflow: "hidden",
                          }}
                        >
                          {roles.map(r => {
                            const rc = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
                            const rl = roleLabels[r] || ROLE_LABELS[r] || r;
                            const isActive = u.role === r;
                            return (
                              <Box
                                key={r}
                                component="button"
                                onClick={() => { onUserRoleChange(u.email, r); setOpenDropdown(null); }}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  border: "none",
                                  background: isActive ? (dark ? COLORS.dark.rowHover : COLORS.gray100) : "transparent",
                                  cursor: "pointer",
                                  gap: 8,
                                }}
                              >
                                <Group gap={8} align="center">
                                  <Box
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: rc.text,
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Text size="xs" fw={isActive ? 600 : 500} c={surface.text}>{rl}</Text>
                                </Group>
                                {isActive && <Check size={11} color={COLORS.primary} strokeWidth={3} />}
                              </Box>
                            );
                          })}
                        </Box>
                      </>
                    )}
                  </Box>
                </Group>
              );
            })
          )}
        </Box>
      )}
    </Paper>
  );
};

// ── Modal shell ───────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, surface, children }) => (
  <Box
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.55)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <Paper
      onClick={e => e.stopPropagation()}
      radius="xl"
      style={{
        background: surface.cardBg,
        border: `1px solid ${surface.border}`,
        width: "100%",
        maxWidth: 480,
        boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
        overflow: "hidden",
      }}
    >
      <Group
        justify="space-between"
        align="center"
        px={20}
        py={16}
        style={{ borderBottom: `1px solid ${surface.border}` }}
      >
        <Text fw={700} size="sm" c={surface.text}>{title}</Text>
        <ActionIcon
          variant="transparent"
          onClick={onClose}
          style={{ color: surface.subtext }}
        >
          <X size={16} strokeWidth={2} />
        </ActionIcon>
      </Group>
      <Box p={20}>{children}</Box>
    </Paper>
  </Box>
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

  // ── Roles tab ──

  const RolesTab = () => (
    <Stack gap={0}>
      <Group justify="space-between" align="flex-start" mb={20}>
        <Stack gap={4}>
          <Text fw={700} size="lg" c={surface.text}>System Roles</Text>
          <Text size="sm" c={surface.subtext}>{roles.length} roles configured</Text>
        </Stack>
        <Button
          leftSection={<Plus size={14} strokeWidth={2.5} />}
          onClick={() => setCreateModal(true)}
        >
          Create Role
        </Button>
      </Group>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {roles.map(r => (
          <RoleCard key={r} roleKey={r} dark={darkMode} surface={surface} users={users} roles={roles} roleLabels={roleLabels}
            onEdit={(rk) => setEditModal({ roleKey: rk, label: roleLabels[rk] || rk, desc: roleDescriptions[rk] || "" })}
            onDelete={(rk) => setDeleteModal(rk)}
            onClone={handleClone}
            onUserRoleChange={handleUserRoleChange}
          />
        ))}
      </Box>
    </Stack>
  );

  // ── Permissions tab ──

  const PermissionsTab = () => {
    const visibleRoles = roles.filter(r => ROLES_ORDER.includes(r) || r.endsWith("_COPY"));
    return (
      <Stack gap={0}>
        <Group justify="space-between" align="flex-start" mb={16} style={{ flexWrap: "wrap", gap: 10 }}>
          <Stack gap={4}>
            <Text fw={700} size="lg" c={surface.text}>Permission Matrix</Text>
            <Text size="sm" c={surface.subtext}>Click checkboxes to grant or revoke permissions per role</Text>
          </Stack>
          <Box style={{ position: "relative", width: 240 }}>
            <Search size={13} color={surface.subtext} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <TextInput
              value={permSearch}
              onChange={e => setPermSearch(e.target.value)}
              placeholder="Filter permissions…"
              styles={{ input: { paddingLeft: 30 } }}
            />
          </Box>
        </Group>

        <Group gap={16} mb={16} style={{ flexWrap: "wrap" }}>
          {visibleRoles.map(r => {
            const c = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
            return (
              <Group key={r} align="center" gap={6}>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: c.text,
                    display: "inline-block",
                  }}
                />
                <Text size="xs" c={surface.subtext} fw={500}>{roleLabels[r] || r}</Text>
              </Group>
            );
          })}
        </Group>

        <Paper
          withBorder
          radius="xl"
          style={{
            background: surface.cardBg,
            border: `1px solid ${surface.border}`,
            overflowX: "auto",
          }}
        >
          <Table style={{ minWidth: 700 }}>
            <Table.Thead style={{ background: surface.theadBg }}>
              <Table.Tr>
                <Table.Th
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: surface.subtext,
                    borderBottom: `1px solid ${surface.border}`,
                    width: 220,
                    position: "sticky",
                    left: 0,
                    background: surface.theadBg,
                    zIndex: 2,
                  }}
                >
                  PERMISSION
                </Table.Th>
                {visibleRoles.map(r => {
                  const c = ROLE_COLORS[r] || { bg: COLORS.gray100, text: COLORS.gray600 };
                  return (
                    <Table.Th
                      key={r}
                      style={{
                        padding: "8px 10px",
                        borderBottom: `1px solid ${surface.border}`,
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      <Badge bg={c.bg} text={c.text} small>{roleLabels[r] || r}</Badge>
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>
            {filteredGroups.map(group => (
              <Table.Tbody key={group.module}>
                <Table.Tr
                  onClick={() => toggleModule(group.module)}
                  style={{
                    background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
                    cursor: "pointer",
                  }}
                >
                  <Table.Td
                    colSpan={visibleRoles.length + 1}
                    style={{
                      padding: "7px 16px",
                      borderBottom: `1px solid ${surface.border}`,
                      borderTop: `1px solid ${surface.border}`,
                      position: "sticky",
                      left: 0,
                      background: darkMode ? COLORS.dark.pageBg : COLORS.gray50,
                    }}
                  >
                    <Group gap={8} align="center">
                      {expandedModules.has(group.module)
                        ? <ChevronDown size={13} color={surface.subtext} strokeWidth={2} />
                        : <ChevronRight size={13} color={surface.subtext} strokeWidth={2} />}
                      <Text
                        size="xs"
                        fw={700}
                        c={surface.subtext}
                        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {group.module}
                      </Text>
                      <Text size="xs" c={surface.subtext} style={{ opacity: 0.7 }}>({group.keys.length})</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                {expandedModules.has(group.module) && group.keys.map((key, rowIdx) => (
                  <Table.Tr
                    key={key}
                    style={{
                      background: rowIdx % 2 === 0 ? "transparent" : (darkMode ? COLORS.dark.rowHover + "08" : COLORS.gray50 + "50"),
                    }}
                  >
                    <Table.Td
                      style={{
                        padding: "7px 16px 7px 32px",
                        borderBottom: `1px solid ${surface.border}`,
                        fontSize: 13,
                        color: surface.subtext,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 220,
                        position: "sticky",
                        left: 0,
                        background: rowIdx % 2 === 0 ? surface.cardBg : (darkMode ? COLORS.dark.rowHover : COLORS.gray50),
                        zIndex: 1,
                      }}
                    >
                      {PERM_LABEL(key)}
                    </Table.Td>
                    {visibleRoles.map(roleKey => (
                      <Table.Td
                        key={roleKey}
                        style={{
                          padding: "7px 10px",
                          borderBottom: `1px solid ${surface.border}`,
                          textAlign: "center",
                        }}
                      >
                        <Group justify="center">
                          <Chip checked={(perms[key] || []).includes(roleKey)} disabled={false} onChange={() => togglePerm(key, roleKey)} />
                        </Group>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            ))}
          </Table>
        </Paper>
        <Text size="xs" c={surface.subtext} fs="italic" mt={12}>
          Changes are applied immediately in this session. In production these would persist to the database.
        </Text>
      </Stack>
    );
  };

  // ── Users tab ──

  const UsersTab = () => (
    <Stack gap={0}>
      <Stack gap={4} mb={20}>
        <Text fw={700} size="lg" c={surface.text}>User Role Assignment</Text>
        <Text size="sm" c={surface.subtext}>Assign or reassign roles to system users</Text>
      </Stack>
      <Paper
        withBorder
        radius="xl"
        style={{
          background: surface.cardBg,
          border: `1px solid ${surface.border}`,
          overflow: "hidden",
        }}
      >
        <Table>
          <Table.Thead style={{ background: surface.theadBg }}>
            <Table.Tr>
              {["User", "Email", "Current Role", "Change Role"].map(h => (
                <Table.Th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: surface.subtext,
                    borderBottom: `1px solid ${surface.border}`,
                  }}
                >
                  {h}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u, i) => {
              const c = ROLE_COLORS[u.role] || { bg: COLORS.gray100, text: COLORS.gray600 };
              const lbl = roleLabels[u.role] || u.role;
              return (
                <Table.Tr
                  key={u.email}
                  style={{
                    background: i % 2 === 0 ? "transparent" : (darkMode ? COLORS.dark.rowHover + "20" : COLORS.gray50),
                  }}
                >
                  <Table.Td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <Group align="center" gap={10}>
                      <Box
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: COLORS.primaryMuted,
                          color: COLORS.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {u.avatar || u.name.slice(0, 2).toUpperCase()}
                      </Box>
                      <Text size="sm" fw={600} c={surface.text}>{u.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <Text size="sm" c={surface.subtext}>{u.email}</Text>
                  </Table.Td>
                  <Table.Td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <Badge bg={c.bg} text={c.text}>{lbl}</Badge>
                  </Table.Td>
                  <Table.Td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                    <Select
                      value={u.role}
                      onChange={val => handleUserRoleChange(u.email, val)}
                      data={roles.map(r => ({ value: r, label: roleLabels[r] || r }))}
                      size="xs"
                      styles={{ input: { minWidth: 160 } }}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );

  const TABS = [
    { id: "roles",       label: "Roles",           icon: <Shield size={14} strokeWidth={2} /> },
    { id: "permissions", label: "Permissions",      icon: <Key    size={14} strokeWidth={2} /> },
    { id: "users",       label: "User Assignment",  icon: <Users  size={14} strokeWidth={2} /> },
  ];

  return (
    <Box style={{ color: surface.text, maxWidth: "100%" }}>
      <AppPageHeader title="Roles & Permissions" sub="Manage system roles, permission matrix, and user assignments" />

      <Group
        gap={4}
        mb={24}
        style={{ borderBottom: `1px solid ${surface.border}` }}
      >
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <Box
              key={t.id}
              component="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                border: "none",
                background: "transparent",
                borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                color: active ? COLORS.primary : surface.subtext,
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "color 0.12s",
                marginBottom: -1,
              }}
            >
              {t.icon} {t.label}
            </Box>
          );
        })}
      </Group>

      {tab === "roles"       && <RolesTab />}
      {tab === "permissions" && <PermissionsTab />}
      {tab === "users"       && <UsersTab />}

      {editModal && (
        <Modal title={`Edit Role — ${editModal.label}`} onClose={() => setEditModal(null)} surface={surface}>
          <Stack gap={14}>
            <TextInput
              label="Role Display Name"
              value={editModal.label}
              onChange={e => setEditModal(p => ({ ...p, label: e.target.value }))}
              placeholder="e.g. HR Manager"
            />
            <Textarea
              label="Description"
              value={editModal.desc}
              onChange={e => setEditModal(p => ({ ...p, desc: e.target.value }))}
              rows={3}
              placeholder="What does this role do?"
            />
            <Group justify="flex-end" gap={10} mt={4}>
              <Button variant="default" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {deleteModal && (
        <Modal title="Delete Role" onClose={() => setDeleteModal(null)} surface={surface}>
          <Stack align="center" gap={0}>
            <Box
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: COLORS.dangerMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Trash2 size={22} color={COLORS.danger} strokeWidth={1.8} />
            </Box>
            <Text fw={700} size="sm" c={surface.text} mb={8}>Delete "{roleLabels[deleteModal] || deleteModal}"?</Text>
            <Text size="sm" c={surface.subtext} ta="center" mb={22} style={{ lineHeight: 1.5 }}>
              All users with this role will be reassigned to <strong>Employee</strong>. This cannot be undone.
            </Text>
            <Group gap={10} style={{ width: "100%" }}>
              <Button variant="default" onClick={() => setDeleteModal(null)} style={{ flex: 1 }}>Cancel</Button>
              <Button
                onClick={handleDelete}
                style={{ flex: 1, background: COLORS.danger, color: COLORS.white }}
              >
                Delete Role
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {createModal && (
        <Modal title="Create New Role" onClose={() => setCreateModal(false)} surface={surface}>
          <Stack gap={14}>
            <Box>
              <TextInput
                label={<Text size="sm" fw={500} c={surface.subtext}>Role Key <Text component="span" c="red">*</Text></Text>}
                value={newRole.key}
                onChange={e => setNewRole(p => ({ ...p, key: e.target.value }))}
                placeholder="e.g. PROCUREMENT (auto-uppercased)"
              />
              <Text size="xs" c={surface.subtext} mt={4}>Used internally. Letters and underscores only.</Text>
            </Box>
            <TextInput
              label={<Text size="sm" fw={500} c={surface.subtext}>Display Name <Text component="span" c="red">*</Text></Text>}
              value={newRole.label}
              onChange={e => setNewRole(p => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Procurement Manager"
            />
            <Textarea
              label="Description"
              value={newRole.desc}
              onChange={e => setNewRole(p => ({ ...p, desc: e.target.value }))}
              rows={2}
              placeholder="What does this role do?"
            />
            <Text size="xs" c={surface.subtext} fs="italic">After creating, go to the Permissions tab to assign permission keys to this role.</Text>
            <Group justify="flex-end" gap={10}>
              <Button variant="default" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button
                onClick={handleCreateRole}
                disabled={!newRole.key || !newRole.label}
              >
                Create Role
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {toast && (
        <Box
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: toast.type === "error" ? COLORS.danger : toast.type === "warning" ? COLORS.warning : COLORS.success,
            color: COLORS.white,
            borderRadius: 12,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Check size={14} strokeWidth={3} />
          {toast.msg}
        </Box>
      )}
    </Box>
  );
}
