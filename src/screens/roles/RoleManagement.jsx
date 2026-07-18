import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon, ScrollArea, Table, TextInput, Select,
  Stack, Loader, Alert, Box, Button, Menu, Modal,
} from "@mantine/core";
import {
  IconShieldLock, IconPlus, IconPencil, IconTrash, IconSearch, IconCopy,
  IconEye, IconBan, IconFileExport, IconDownload, IconAlertCircle, IconAlertTriangle,
  IconArrowsExchange, IconLock,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { exportRoles }   from "../../api/roleApi";
import {
  useRoles, useRole, useRoleMeta, useCreateRole, useCloneRole, useUpdateRole, useDeleteRole,
} from "../../queries/useRoles";

const STATUS_COLOR = { Active: "green", Inactive: "gray" };
const TYPE_COLOR   = { System: "blue", Custom: "violet" };

// ── Mock fallback data (main_v1: UI-only demo) ───────────────────────────────
const MOCK_ROLES = [
  { id: "r1", name: "Super Admin", code: "SUPER_ADMIN", description: "Full platform access across all companies", usersAssigned: 2, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r2", name: "Administrator", code: "ADMIN", description: "Full company-level administrative access", usersAssigned: 3, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r3", name: "HR Manager", code: "HR", description: "Manages employees, leave, recruitment, onboarding", usersAssigned: 5, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r4", name: "Team Manager", code: "MANAGER", description: "Manages direct reports and team approvals", usersAssigned: 12, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r5", name: "Finance Admin", code: "FINANCE", description: "Manages payroll, expenses, compensation", usersAssigned: 3, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r6", name: "IT Admin", code: "IT_ADMIN", description: "Manages assets, helpdesk, integrations", usersAssigned: 2, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r7", name: "Employee", code: "EMPLOYEE", description: "Standard self-service employee access", usersAssigned: 107, roleType: "System", isSystem: true, status: "Active", createdAt: "2025-01-10T00:00:00Z" },
  { id: "r8", name: "Recruiter", code: "RECRUITER", description: "Custom role scoped to recruitment pipeline only", usersAssigned: 1, roleType: "Custom", isSystem: false, status: "Inactive", createdAt: "2025-06-02T00:00:00Z" },
];

export default function RoleManagement() {
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const [search, setSearch]   = useState("");
  const [typeF, setTypeF]     = useState("All");
  const [statusF, setStatusF] = useState("All");

  const { data: rawRoles, isLoading, isError: rawIsError } = useRoles();
  const roles = rawRoles?.length ? rawRoles : MOCK_ROLES;
  const isError = rawIsError && !roles.length;
  const { data: meta } = useRoleMeta();

  const createMut = useCreateRole();
  const cloneMut  = useCloneRole();
  const deleteMut = useDeleteRole();

  const [createOpen, setCreateOpen] = useState(false);
  const [cloneFrom, setCloneFrom]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [cmpA, setCmpA] = useState(null);
  const [cmpB, setCmpB] = useState(null);

  const [form, setForm] = useState({ name: "", code: "", description: "", status: "Active" });
  const [cloneForm, setCloneForm] = useState({ name: "", code: "" });

  const filtered = useMemo(() => roles.filter((r) => {
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || (r.code || "").toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
      && (typeF === "All" || r.roleType === typeF)
      && (statusF === "All" || r.status === statusF);
  }), [roles, search, typeF, statusF]);

  const systemCount = roles.filter((r) => r.isSystem).length;
  const customCount = roles.filter((r) => !r.isSystem).length;
  const totalUsers  = roles.reduce((s, r) => s + (r.usersAssigned || 0), 0);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) { toast("Role Name and Code are required", "error"); return; }
    try { await createMut.mutateAsync(form); toast("Role created successfully", "success"); setCreateOpen(false); setForm({ name: "", code: "", description: "", status: "Active" }); }
    catch (e) { toast(e?.response?.data?.message || "Failed to create role", "error"); }
  };

  const handleClone = async () => {
    if (!cloneForm.name.trim() || !cloneForm.code.trim()) { toast("Name and Code required", "error"); return; }
    try { await cloneMut.mutateAsync({ id: cloneFrom.id, ...cloneForm }); toast(`Cloned from "${cloneFrom.name}"`, "success"); setCloneFrom(null); setCloneForm({ name: "", code: "" }); }
    catch (e) { toast(e?.response?.data?.message || "Clone failed", "error"); }
  };

  const handleDelete = async () => {
    try { await deleteMut.mutateAsync(deleteTarget.id); toast(`"${deleteTarget.name}" deleted`, "success"); setDeleteTarget(null); }
    catch (e) { toast(e?.response?.data?.message || "Failed to delete role", "error"); }
  };

  const handleExport = async (fmt) => {
    try {
      const blob = await exportRoles(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `roles.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const COLS = ["Role Name", "Code", "Description", "Users", "Type", "Status", "Created", "Actions"];

  const rows = filtered.length === 0 ? (
    <Table.Tr><Table.Td colSpan={COLS.length}>
      <AppEmptyState message="No roles configured."
        action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>Create Role</AppButton>} />
    </Table.Td></Table.Tr>
  ) : filtered.map((r) => (
    <Table.Tr key={r.id} style={{ cursor: "pointer" }}>
      <Table.Td onClick={() => navigate(`/roles-permissions/${r.id}`)}>
        <Group gap="sm" wrap="nowrap">
          <ActionIcon size={30} radius="md" variant="light" color={r.isSystem ? "blue" : "violet"}>
            {r.isSystem ? <IconLock size={15} /> : <IconShieldLock size={15} />}
          </ActionIcon>
          <Text size="sm" fw={600}>{r.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{r.code}</Text></Table.Td>
      <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{r.description || "—"}</Text></Table.Td>
      <Table.Td><Badge variant="light" radius="sm">{r.usersAssigned || 0}</Badge></Table.Td>
      <Table.Td><Badge variant="light" color={TYPE_COLOR[r.roleType] || "gray"} radius="sm">{r.roleType}</Badge></Table.Td>
      <Table.Td><Badge variant="light" color={STATUS_COLOR[r.status] || "gray"} radius="xl">{r.status}</Badge></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{fmtDate(r.createdAt)}</Text></Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon variant="light" color="gray" size="sm" title="View" onClick={() => navigate(`/roles-permissions/${r.id}`)}><IconEye size={13} /></ActionIcon>
          <ActionIcon variant="light" color="blue" size="sm" title="Edit permissions" onClick={() => navigate(`/roles-permissions/${r.id}`)}><IconPencil size={13} /></ActionIcon>
          <ActionIcon variant="light" color="teal" size="sm" title="Clone" onClick={() => { setCloneFrom(r); setCloneForm({ name: `${r.name} (Copy)`, code: `${r.code}_COPY` }); }}><IconCopy size={13} /></ActionIcon>
          {!r.isSystem && (
            <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => setDeleteTarget(r)}><IconTrash size={13} /></ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <AppPageHeader
        title="Role & Permission Management"
        sub="Control access across all modules"
        action={
          <Group gap="sm">
            <AppButton variant="default" leftSection={<IconArrowsExchange size={16} />} onClick={() => setCompareOpen(true)}>Compare</AppButton>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("excel")}>Excel (CSV)</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("csv")}>CSV</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("pdf")}>PDF</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <AppButton leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>Create Role</AppButton>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<IconShieldLock size={22} />} label="Total Roles" value={roles.length} color="blue" />
        <AppStatCard icon={<IconLock size={22} />} label="System Roles" value={systemCount} color="violet" />
        <AppStatCard icon={<IconShieldLock size={22} />} label="Custom Roles" value={customCount} color="teal" />
        <AppStatCard icon={<IconEye size={22} />} label="Users Assigned" value={totalUsers} color="green" />
      </SimpleGrid>

      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput label="Search" placeholder="Search by name, code, description…" leftSection={<IconSearch size={16} />}
            value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 200 }} />
          <Select label="Role Type" w={150} size="sm" data={["All", "System", "Custom"]} value={typeF} onChange={setTypeF} />
          <Select label="Status" w={130} size="sm" data={["All", "Active", "Inactive"]} value={statusF} onChange={setStatusF} />
        </Group>
      </AppSection>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
      {isError && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">Failed to load roles. Make sure the backend is running and you are logged in.</Alert>}

      {!isLoading && !isError && (
        <AppSection noPadding title="All Roles" sub={`${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead><Table.Tr>{COLS.map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </AppSection>
      )}

      {/* Create */}
      <AppModal opened={createOpen} onClose={() => setCreateOpen(false)} title="Create Role" icon={<IconShieldLock size={16} color="#3b82f6" />} iconColor="#3b82f6">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <AppInput label="Role Name *" placeholder="e.g. HR Manager" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <AppInput label="Role Code *" placeholder="e.g. HR_MGR" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </SimpleGrid>
          <AppInput type="textarea" label="Description" placeholder="What this role can do…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <AppInput type="select" label="Status" data={["Active", "Inactive"]} value={form.status} onChange={(v) => setForm({ ...form, status: v })} w={200} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setCreateOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending} onClick={handleCreate}>Save</AppButton>
          </Group>
          <Text size="xs" c="dimmed">After creating, open the role to configure its permission matrix.</Text>
        </Stack>
      </AppModal>

      {/* Clone */}
      <AppModal opened={!!cloneFrom} onClose={() => setCloneFrom(null)} title={`Clone "${cloneFrom?.name || ""}"`} icon={<IconCopy size={16} color="#14b8a6" />} iconColor="#14b8a6">
        <Stack gap="md">
          <Text size="xs" c="dimmed">The new role copies all permissions from {cloneFrom?.name}. You can modify them afterwards.</Text>
          <AppInput label="New Role Name *" value={cloneForm.name} onChange={(e) => setCloneForm({ ...cloneForm, name: e.target.value })} />
          <AppInput label="New Role Code *" value={cloneForm.code} onChange={(e) => setCloneForm({ ...cloneForm, code: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setCloneFrom(null)}>Cancel</AppButton>
            <AppButton color="teal" loading={cloneMut.isPending} onClick={handleClone}>Clone Role</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Delete */}
      <AppModal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Role" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{deleteTarget?.name}</Text>? This can only be done if no users are assigned.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" loading={deleteMut.isPending} onClick={handleDelete}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>

      {/* Compare */}
      <RoleCompareModal open={compareOpen} onClose={() => setCompareOpen(false)} roles={roles} meta={meta}
        a={cmpA} b={cmpB} setA={setCmpA} setB={setCmpB} />
    </>
  );
}

// ─── Role comparison modal ────────────────────────────────────────────────────
function RoleCompareModal({ open, onClose, roles, meta, a, b, setA, setB }) {
  const { data: roleA } = useRole(a);
  const { data: roleB } = useRole(b);
  const modules = meta?.modules || [];

  const actionsOf = (role, mod) => {
    const p = role?.permissions?.[mod];
    return p?.actions ? p.actions.join(", ") : "—";
  };

  return (
    <Modal opened={open} onClose={onClose} title="Compare Roles" size="xl" centered radius="lg">
      <Group grow mb="md">
        <Select label="Role A" placeholder="Select role" data={roles.map((r) => ({ value: String(r.id), label: r.name }))} value={a ? String(a) : null} onChange={(v) => setA(v ? Number(v) : null)} />
        <Select label="Role B" placeholder="Select role" data={roles.map((r) => ({ value: String(r.id), label: r.name }))} value={b ? String(b) : null} onChange={(v) => setB(v ? Number(v) : null)} />
      </Group>
      {a && b ? (
        <ScrollArea h={400}>
          <Table withTableBorder striped>
            <Table.Thead><Table.Tr><Table.Th>Module</Table.Th><Table.Th>{roleA?.name || "A"}</Table.Th><Table.Th>{roleB?.name || "B"}</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {modules.map((m) => {
                const av = actionsOf(roleA, m), bv = actionsOf(roleB, m);
                const diff = av !== bv;
                return (
                  <Table.Tr key={m} style={diff ? { background: "var(--mantine-color-yellow-light)" } : undefined}>
                    <Table.Td><Text size="sm" fw={600}>{m}</Text></Table.Td>
                    <Table.Td><Text size="xs" c={av === "—" ? "dimmed" : undefined}>{av}</Text></Table.Td>
                    <Table.Td><Text size="xs" c={bv === "—" ? "dimmed" : undefined}>{bv}</Text></Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="xl">Select two roles to see permission differences (highlighted rows differ).</Text>
      )}
    </Modal>
  );
}
