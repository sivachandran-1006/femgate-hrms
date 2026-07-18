import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Tabs,
  Table, ActionIcon, TextInput, Select, Modal, SimpleGrid,
  Loader, Center, Avatar, PasswordInput,
} from "@mantine/core";
import {
  IconUsers, IconUserCheck, IconShield, IconUserOff,
  IconSearch, IconPlus, IconPencil, IconKey, IconUserX,
  IconTrash, IconActivity, IconShieldCheck, IconRefresh,
} from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useToast } from "../../components/ui/Toast";
import { isValidEmail } from "../../utils/validators";

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  SUPER_ADMIN: "yellow",
  ADMIN:       "blue",
  HR:          "violet",
  MANAGER:     "green",
  FINANCE:     "pink",
  EMPLOYEE:    "gray",
};

const STATUS_COLOR = {
  Active:    "green",
  Suspended: "red",
  Pending:   "orange",
};

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN",       label: "Admin" },
  { value: "HR",          label: "HR" },
  { value: "MANAGER",     label: "Manager" },
  { value: "FINANCE",     label: "Finance" },
  { value: "EMPLOYEE",    label: "Employee" },
];

const ROLE_FILTER_OPTIONS = [
  { value: "",            label: "All Roles" },
  ...ROLE_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  { value: "",          label: "All Status" },
  { value: "Active",    label: "Active" },
  { value: "Suspended", label: "Suspended" },
  { value: "Pending",   label: "Pending" },
];

const EMPTY_NEW_USER = { name: "", email: "", password: "", confirmPassword: "", role: "EMPLOYEE" };

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: "u1",  name: "Arjun Sharma",  email: "arjun.sharma@mgate.in",  role: "SUPER_ADMIN", status: "Active",    lastLogin: "2026-07-01T09:15:00", joined: "2023-01-10", dept: "Engineering", phone: "+91 9876543210" },
  { id: "u2",  name: "Priya Nair",    email: "priya.nair@mgate.in",    role: "ADMIN",       status: "Active",    lastLogin: "2026-06-30T18:42:00", joined: "2023-03-22", dept: "Operations",  phone: "+91 9845678901" },
  { id: "u3",  name: "Rohit Verma",   email: "rohit.verma@mgate.in",   role: "HR",          status: "Active",    lastLogin: "2026-07-01T08:55:00", joined: "2023-06-15", dept: "HR",          phone: "+91 9812345678" },
  { id: "u4",  name: "Sneha Pillai",  email: "sneha.pillai@mgate.in",  role: "MANAGER",     status: "Active",    lastLogin: "2026-06-29T14:30:00", joined: "2023-09-01", dept: "Engineering", phone: "+91 9801234567" },
  { id: "u5",  name: "Kiran Reddy",   email: "kiran.reddy@mgate.in",   role: "FINANCE",     status: "Active",    lastLogin: "2026-06-28T11:00:00", joined: "2024-01-05", dept: "Finance",     phone: "+91 9876012345" },
  { id: "u6",  name: "Ananya Iyer",   email: "ananya.iyer@mgate.in",   role: "EMPLOYEE",    status: "Active",    lastLogin: "2026-06-27T16:20:00", joined: "2024-04-20", dept: "Design",      phone: "+91 9823456789" },
  { id: "u7",  name: "Vikram Singh",  email: "vikram.singh@mgate.in",  role: "EMPLOYEE",    status: "Suspended", lastLogin: "2026-05-10T09:00:00", joined: "2023-11-12", dept: "Sales",       phone: "+91 9867890123" },
  { id: "u8",  name: "Divya Menon",   email: "divya.menon@mgate.in",   role: "MANAGER",     status: "Active",    lastLogin: "2026-07-01T07:45:00", joined: "2024-02-14", dept: "Product",     phone: "+91 9856789012" },
  { id: "u9",  name: "Suresh Kumar",  email: "suresh.kumar@mgate.in",  role: "EMPLOYEE",    status: "Pending",   lastLogin: null,                  joined: "2026-06-25", dept: "Support",     phone: "+91 9834567890" },
  { id: "u10", name: "Meera Joshi",   email: "meera.joshi@mgate.in",   role: "HR",          status: "Active",    lastLogin: "2026-06-30T10:30:00", joined: "2023-08-08", dept: "HR",          phone: "+91 9890123456" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name = "") {
  return name.slice(0, 2).toUpperCase();
}

function roleLabel(role = "") {
  return role.replace(/_/g, " ");
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UserManagement() {
  const toast         = useToast();
  const queryClient   = { invalidateQueries: () => {}, setQueryData: () => {} };

  // Filters
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal state
  const [showAdd, setShowAdd]           = useState(false);
  const [profileUser, setProfileUser]   = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newUser, setNewUser]           = useState(EMPTY_NEW_USER);

  const invalidate = () => {}

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: rawUsers = [], isLoading, isError } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const users = rawUsers.length ? rawUsers : MOCK_USERS;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const updateMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const deleteMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const toggleStatusMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const updateRoleMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const resetPasswordMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalUsers    = users.length;
  const activeCount   = users.filter((u) => u.status === "Active").length;
  const adminCount    = users.filter((u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role)).length;
  const suspendedCount = users.filter((u) => u.status === "Suspended").length;

  // ── Add user handler ───────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.show("Fill all required fields", "error");
      return;
    }
    if (!isValidEmail(newUser.email)) {
      toast.show("Enter a valid email address", "error");
      return;
    }
    if (newUser.password.length < 6) {
      toast.show("Password must be at least 6 characters", "error");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast.show("Passwords do not match", "error");
      return;
    }
    const { confirmPassword, ...payload } = newUser;
    createMutation.mutate(payload);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Stack align="center" gap="sm">
          <Text c="red" fw={600}>Failed to load users</Text>
          <Button
            variant="default"
            leftSection={<IconRefresh size={14} />}
            onClick={() => {}}
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <AppPageHeader
        title="User Management"
        sub="Manage system users, roles and access"
        action={
          <Button leftSection={<IconPlus size={14} />} onClick={() => setShowAdd(true)}>
            Add User
          </Button>
        }
      />

      {/* Stats */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <AppStatCard
          icon={<IconUsers size={22} />}
          label="Total Users"
          value={totalUsers}
          sub="registered accounts"
          color="blue"
        />
        <AppStatCard
          icon={<IconUserCheck size={22} />}
          label="Active"
          value={activeCount}
          sub="currently active"
          color="green"
        />
        <AppStatCard
          icon={<IconShield size={22} />}
          label="Admins"
          value={adminCount}
          sub="with admin access"
          color="violet"
        />
        <AppStatCard
          icon={<IconUserOff size={22} />}
          label="Suspended"
          value={suspendedCount}
          sub="accounts suspended"
          color="red"
        />
      </SimpleGrid>

      {/* Tabs */}
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users"    leftSection={<IconUsers size={14} />}>Users</Tabs.Tab>
            <Tabs.Tab value="activity" leftSection={<IconActivity size={14} />}>User Activity</Tabs.Tab>
            <Tabs.Tab value="roles"    leftSection={<IconShieldCheck size={14} />}>Assign Roles</Tabs.Tab>
          </Tabs.List>

          {/* ── Users Tab ────────────────────────────────────────────────────── */}
          <Tabs.Panel value="users" p="md">
            <Stack gap="md">
              {/* Filters */}
              <Group gap="sm" wrap="wrap">
                <TextInput
                  placeholder="Search users..."
                  leftSection={<IconSearch size={14} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <Select
                  placeholder="All Roles"
                  data={ROLE_FILTER_OPTIONS}
                  value={roleFilter}
                  onChange={(v) => setRoleFilter(v ?? "")}
                  clearable
                  style={{ minWidth: 140 }}
                />
                <Select
                  placeholder="All Status"
                  data={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v ?? "")}
                  clearable
                  style={{ minWidth: 130 }}
                />
              </Group>

              {/* Table */}
              {users.length === 0 ? (
                <AppEmptyState icon={<IconUsers size={24} />} message="No users found" sub="Try adjusting your search or filters." />
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Login</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.map((u) => (
                      <Table.Tr key={u.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar color={ROLE_COLORS[u.role] ?? "gray"} radius="xl" size={34}>
                              {initials(u.name)}
                            </Avatar>
                            <Text
                              size="sm"
                              fw={500}
                              c="blue"
                              style={{ cursor: "pointer" }}
                              onClick={() => { setProfileUser(u); setEditForm({ name: u.name, dept: u.dept || "", phone: u.phone || "" }); }}
                            >
                              {u.name}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{u.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={ROLE_COLORS[u.role] ?? "gray"} variant="light">
                            {roleLabel(u.role)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={STATUS_COLOR[u.status] ?? "gray"} variant="light">
                            {u.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{u.lastLogin ?? "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={6} wrap="nowrap">
                            <ActionIcon
                              variant="default"
                              size="sm"
                              title="Edit"
                              onClick={() => { setProfileUser(u); setEditForm({ name: u.name, dept: u.dept || "", phone: u.phone || "" }); }}
                            >
                              <IconPencil size={13} />
                            </ActionIcon>
                            <ActionIcon
                              variant="default"
                              size="sm"
                              title="Reset Password"
                              loading={resetPasswordMutation.isPending}
                              onClick={() => resetPasswordMutation.mutate(u.id)}
                            >
                              <IconKey size={13} />
                            </ActionIcon>
                            <ActionIcon
                              variant="default"
                              size="sm"
                              title={u.status === "Active" ? "Suspend" : "Activate"}
                              color={u.status === "Active" ? "orange" : "green"}
                              loading={toggleStatusMutation.isPending}
                              onClick={() => toggleStatusMutation.mutate(u.id)}
                            >
                              {u.status === "Active"
                                ? <IconUserX size={13} />
                                : <IconUserCheck size={13} />
                              }
                            </ActionIcon>
                            <ActionIcon
                              variant="default"
                              size="sm"
                              title="Delete"
                              color="red"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <IconTrash size={13} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ── Activity Tab ─────────────────────────────────────────────────── */}
          <Tabs.Panel value="activity" p="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Recent Activity</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((u) => {
                  const acts = u.activity?.length
                    ? u.activity
                    : [{ action: "Last session", time: u.lastLogin ?? "—" }];
                  return (
                    <Table.Tr key={u.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar color={ROLE_COLORS[u.role] ?? "gray"} radius="xl" size={32}>
                            {initials(u.name)}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={600}>{u.name}</Text>
                            <Text size="xs" c="dimmed">{roleLabel(u.role)}</Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={3}>
                          {acts.map((a, i) => (
                            <Text key={i} size="xs" c="dimmed">
                              <Text span size="xs" fw={500} c="dark">{a.action}</Text>
                              {" · "}
                              {a.time}
                            </Text>
                          ))}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLOR[u.status] ?? "gray"} variant="light">
                          {u.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>

          {/* ── Assign Roles Tab ──────────────────────────────────────────────── */}
          <Tabs.Panel value="roles" p="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Current Role</Table.Th>
                  <Table.Th>Assign Role</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar color={ROLE_COLORS[u.role] ?? "gray"} radius="xl" size={32}>
                          {initials(u.name)}
                        </Avatar>
                        <Text size="sm" fw={600}>{u.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{u.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={ROLE_COLORS[u.role] ?? "gray"} variant="light">
                        {roleLabel(u.role)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        size="xs"
                        data={ROLE_OPTIONS}
                        value={u.role}
                        onChange={(v) => v && updateRoleMutation.mutate({ id: u.id, role: v })}
                        style={{ minWidth: 160 }}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* ── Add User Modal ──────────────────────────────────────────────────── */}
      <Modal
        opened={showAdd}
        onClose={() => { setShowAdd(false); setNewUser(EMPTY_NEW_USER); }}
        title="Add New User"
        size="sm"
        radius="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Full Name"
            required
            placeholder="Jane Doe"
            value={newUser.name}
            onChange={(e) => setNewUser((p) => ({ ...p, name: e.currentTarget.value }))}
          />
          <TextInput
            label="Email"
            required
            type="email"
            placeholder="jane@example.com"
            value={newUser.email}
            onChange={(e) => setNewUser((p) => ({ ...p, email: e.currentTarget.value }))}
          />
          <PasswordInput
            label="Password"
            required
            placeholder="••••••••"
            value={newUser.password}
            onChange={(e) => setNewUser((p) => ({ ...p, password: e.currentTarget.value }))}
          />
          <PasswordInput
            label="Confirm Password"
            required
            placeholder="••••••••"
            value={newUser.confirmPassword}
            onChange={(e) => setNewUser((p) => ({ ...p, confirmPassword: e.currentTarget.value }))}
          />
          <Select
            label="Role"
            required
            data={ROLE_OPTIONS}
            value={newUser.role}
            onChange={(v) => v && setNewUser((p) => ({ ...p, role: v }))}
          />
          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              onClick={() => { setShowAdd(false); setNewUser(EMPTY_NEW_USER); }}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconPlus size={14} />}
              loading={createMutation.isPending}
              onClick={handleAdd}
            >
              Create User
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Profile / Edit Modal ────────────────────────────────────────────── */}
      <Modal
        opened={!!profileUser}
        onClose={() => setProfileUser(null)}
        title={profileUser ? `User Profile — ${profileUser.name}` : ""}
        size="md"
        radius="lg"
      >
        {profileUser && (
          <Stack gap="md">
            {/* Avatar + summary */}
            <Group gap="md" pb="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <Avatar
                color={ROLE_COLORS[profileUser.role] ?? "gray"}
                radius="xl"
                size={56}
              >
                {initials(profileUser.name)}
              </Avatar>
              <div>
                <Text fw={700} size="md">{profileUser.name}</Text>
                <Text size="sm" c="dimmed">{profileUser.email}</Text>
                <Group gap="xs" mt={4}>
                  <Badge color={ROLE_COLORS[profileUser.role] ?? "gray"} variant="light">
                    {roleLabel(profileUser.role)}
                  </Badge>
                  <Badge color={STATUS_COLOR[profileUser.status] ?? "gray"} variant="light">
                    {profileUser.status}
                  </Badge>
                </Group>
              </div>
            </Group>

            {/* Editable fields */}
            <TextInput
              label="Full Name"
              value={editForm.name || ""}
              onChange={(e) => setEditForm(p => ({ ...p, name: e.currentTarget.value }))}
            />
            <SimpleGrid cols={2} spacing="sm">
              <TextInput
                label="Department"
                placeholder="e.g. Engineering"
                value={editForm.dept || ""}
                onChange={(e) => setEditForm(p => ({ ...p, dept: e.currentTarget.value }))}
              />
              <TextInput
                label="Phone"
                placeholder="+91 9876543210"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm(p => ({ ...p, phone: e.currentTarget.value }))}
              />
            </SimpleGrid>
            <SimpleGrid cols={2} spacing="sm">
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">Joined</Text>
                <Text size="sm" fw={600} mt={2}>{profileUser.joined ? new Date(profileUser.joined).toLocaleDateString("en-IN") : "—"}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">Last Login</Text>
                <Text size="sm" fw={600} mt={2}>{profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleString("en-IN") : "Never"}</Text>
              </div>
            </SimpleGrid>

            {/* Actions */}
            <Group
              justify="space-between"
              pt="sm"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            >
              <Button
                variant="light"
                color="orange"
                size="xs"
                leftSection={<IconKey size={13} />}
                loading={resetPasswordMutation.isPending}
                onClick={() => { resetPasswordMutation.mutate(profileUser.id); setProfileUser(null); }}
              >
                Reset Password
              </Button>
              <Group gap="xs">
                <Button variant="default" onClick={() => setProfileUser(null)}>Cancel</Button>
                <Button
                  loading={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ id: profileUser.id, data: editForm })}
                >
                  Save Changes
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
        radius="lg"
      >
        {deleteTarget && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Delete <Text span fw={600} c="dark">{deleteTarget.name}</Text>? This cannot be undone.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
