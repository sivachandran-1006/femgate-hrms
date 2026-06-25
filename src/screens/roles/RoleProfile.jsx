import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Avatar,
  Loader, Box, Alert, ActionIcon, Divider, Checkbox, Select, Button, TextInput, Collapse,
} from "@mantine/core";
import {
  IconArrowLeft, IconShieldLock, IconUsers, IconClipboardList, IconAlertCircle,
  IconLock, IconChevronDown, IconChevronRight, IconSearch, IconDeviceFloppy, IconLayoutGrid,
} from "@tabler/icons-react";

import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useToast }      from "../../components/ui/Toast";
import { getInitials }   from "../../utils/helpers";
import { useRole, useRoleMeta, useRoleUsers, useRoleAudit, useUpdateRole } from "../../queries/useRoles";

const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const Field = ({ label, value }) => (
  <Box>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text>
    <Text size="sm" fw={500}>{value || "—"}</Text>
  </Box>
);

export default function RoleProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const { data: role, isLoading, isError } = useRole(id);
  const { data: meta } = useRoleMeta();
  const { data: users = [] } = useRoleUsers(id);
  const { data: audit = [] } = useRoleAudit(id);
  const updateMut = useUpdateRole();

  const modules = meta?.modules || [];
  const actions = meta?.actions || [];
  const scopes  = meta?.scopes  || [];

  const [matrix, setMatrix] = useState({});
  const [expanded, setExpanded] = useState(new Set());
  const [permSearch, setPermSearch] = useState("");

  useEffect(() => { if (role) setMatrix(role.permissions || {}); }, [role]);

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !role) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Role not found. <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/roles-permissions")}>Back to list</Text>
    </Alert>
  );

  const locked = role.code === "SUPER_ADMIN";   // super admin matrix not editable
  const toggleModule = (m) => setExpanded((p) => { const s = new Set(p); s.has(m) ? s.delete(m) : s.add(m); return s; });

  const hasAction = (m, a) => matrix[m]?.actions?.includes(a);
  const toggleAction = (m, a) => {
    if (locked) return;
    setMatrix((prev) => {
      const cur = prev[m] || { actions: [], scope: "Organization" };
      const acts = cur.actions.includes(a) ? cur.actions.filter((x) => x !== a) : [...cur.actions, a];
      return { ...prev, [m]: { ...cur, actions: acts } };
    });
  };
  const setScope = (m, scope) => {
    if (locked) return;
    setMatrix((prev) => ({ ...prev, [m]: { ...(prev[m] || { actions: [] }), scope } }));
  };

  const savePermissions = async () => {
    try { await updateMut.mutateAsync({ id: role.id, permissions: matrix }); toast("Permissions updated", "success"); }
    catch (e) { toast(e?.response?.data?.message || "Failed to save", "error"); }
  };

  const visibleModules = modules.filter((m) => !permSearch || m.toLowerCase().includes(permSearch.toLowerCase()));

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/roles-permissions")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <Avatar size={48} radius="md" color={role.isSystem ? "blue" : "violet"} variant="light">{role.isSystem ? <IconLock size={22} /> : <IconShieldLock size={22} />}</Avatar>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{role.name}</Text>
              <Badge color={role.status === "Active" ? "green" : "gray"} variant="light" radius="xl">{role.status}</Badge>
              <Badge color={role.isSystem ? "blue" : "violet"} variant="light" radius="sm">{role.roleType}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{role.code} · {role.usersAssigned || 0} users assigned</Text>
          </div>
        </Group>
        <AppButton variant="default" onClick={() => navigate("/roles-permissions")}>All Roles</AppButton>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"    leftSection={<IconShieldLock size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="permissions" leftSection={<IconLayoutGrid size={15} />}>Permissions</Tabs.Tab>
          <Tabs.Tab value="users"       leftSection={<IconUsers size={15} />}>Assigned Users</Tabs.Tab>
          <Tabs.Tab value="audit"       leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        {/* OVERVIEW */}
        <Tabs.Panel value="overview">
          <AppSection title="Role Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Role Name" value={role.name} />
              <Field label="Role Code" value={role.code} />
              <Field label="Role Type" value={role.roleType} />
              <Field label="Status" value={role.status} />
              <Field label="Users Assigned" value={String(role.usersAssigned || 0)} />
              <Field label="Created Date" value={role.createdAt ? new Date(role.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
            </SimpleGrid>
            <Divider my="md" />
            <Field label="Description" value={role.description} />
          </AppSection>
        </Tabs.Panel>

        {/* PERMISSIONS MATRIX */}
        <Tabs.Panel value="permissions">
          <AppSection
            title="Permission Matrix"
            sub={locked ? "Super Admin has full access (locked)" : "Toggle actions per module and set scope"}
            action={!locked && <AppButton leftSection={<IconDeviceFloppy size={16} />} loading={updateMut.isPending} onClick={savePermissions}>Save Changes</AppButton>}
          >
            <TextInput placeholder="Search modules…" leftSection={<IconSearch size={15} />} value={permSearch} onChange={(e) => setPermSearch(e.target.value)} size="sm" mb="md" style={{ maxWidth: 300 }} />
            <Stack gap="xs">
              {visibleModules.map((m) => {
                const isOpen = expanded.has(m);
                const count = matrix[m]?.actions?.length || 0;
                return (
                  <Box key={m} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 10, overflow: "hidden" }}>
                    <Group justify="space-between" px="md" py="sm" style={{ cursor: "pointer", background: "var(--mantine-color-gray-0)" }} onClick={() => toggleModule(m)}>
                      <Group gap="sm">
                        {isOpen ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
                        <Text size="sm" fw={600}>{m}</Text>
                      </Group>
                      <Group gap="sm">
                        <Badge variant="light" radius="sm">{count}/{actions.length}</Badge>
                        {matrix[m]?.scope && <Badge variant="light" color="grape" radius="sm">{matrix[m].scope}</Badge>}
                      </Group>
                    </Group>
                    <Collapse in={isOpen}>
                      <Box px="md" py="sm">
                        <Group gap="lg" wrap="wrap" mb="sm">
                          {actions.map((a) => (
                            <Checkbox key={a} label={a} size="sm" checked={!!hasAction(m, a)} disabled={locked} onChange={() => toggleAction(m, a)} />
                          ))}
                        </Group>
                        <Select label="Scope" size="xs" w={200} data={scopes} value={matrix[m]?.scope || "Organization"} disabled={locked} onChange={(v) => setScope(m, v)} />
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Stack>
          </AppSection>
        </Tabs.Panel>

        {/* ASSIGNED USERS */}
        <Tabs.Panel value="users">
          <AppSection noPadding title="Assigned Users" sub={`${users.length} users`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Name", "Email", "Department", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {users.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No users assigned to this role" /></Table.Td></Table.Tr>
                  ) : users.map((u) => (
                    <Table.Tr key={u.id}>
                      <Table.Td><Group gap="sm" wrap="nowrap"><Avatar size={28} radius="xl">{getInitials(u.name)}</Avatar><Text size="sm" fw={600}>{u.name}</Text></Group></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{u.email}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{u.dept || "—"}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={u.status === "Active" ? "green" : "gray"} radius="xl">{u.status}</Badge></Table.Td>
                      <Table.Td><AppButton size="xs" variant="light" onClick={() => navigate(u.employeeId ? `/employees/${u.employeeId}` : "/employees")}>View User</AppButton></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* AUDIT */}
        <Tabs.Panel value="audit">
          <AppSection noPadding title="Audit Logs" sub={`${audit.length} events`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Action", "Details", "By", "When"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {audit.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No audit history yet" /></Table.Td></Table.Tr>
                  ) : audit.map((l) => (
                    <Table.Tr key={l.id}>
                      <Table.Td><Badge variant="light" radius="xl">{l.action}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{l.details || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{l.actorName || "System"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{fmtDateTime(l.createdAt)}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
