import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, SimpleGrid, Modal,
  TextInput, Select, ActionIcon, Avatar, Center, Loader,
} from "@mantine/core";
import { IconSearch, IconPlus, IconEye, IconPencil, IconUserOff, IconBuilding, IconTrash } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanies, createCompany, updateCompany, deleteCompany, updateCompanyStatus } from "../../api/multiCompanyApi";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const PLAN_COLORS  = { Enterprise: "yellow", Pro: "blue", Starter: "violet" };
const STATUS_COLORS = { Active: "green", Trial: "orange", Suspended: "red" };

const INDUSTRIES = ["Technology", "Software", "Consulting", "Finance", "Healthcare", "Retail", "Manufacturing", "Education"];
const PLANS      = ["Starter", "Pro", "Enterprise"];
const COST_MAP   = { Starter: 8000, Pro: 28000, Enterprise: 45000 };
const COST_LABEL = { 8000: "8,000", 28000: "28,000", 45000: "45,000" };

const EMPTY_FORM = { name: "", industry: "Technology", adminEmail: "", adminPassword: "", adminName: "", plan: "Pro", city: "", country: "India" };

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_COMPANIES = [
  {
    id: "c1", name: "Annz Technologies",   industry: "Technology",  plan: "Enterprise",
    status: "Active",    adminName: "Arjun Sharma",  adminEmail: "arjun@annztech.com",
    city: "Bengaluru",  country: "India",  employees: 134, createdAt: "2022-06-01T00:00:00",
  },
  {
    id: "c2", name: "Mgate Solutions",     industry: "Software",    plan: "Pro",
    status: "Active",    adminName: "Priya Nair",    adminEmail: "priya@mgate.io",
    city: "Chennai",    country: "India",  employees: 52,  createdAt: "2023-01-15T00:00:00",
  },
  {
    id: "c3", name: "Horizon Consulting",  industry: "Consulting",  plan: "Pro",
    status: "Trial",     adminName: "Vikash Patel",  adminEmail: "vikash@horizonconsulting.in",
    city: "Mumbai",     country: "India",  employees: 28,  createdAt: "2026-05-20T00:00:00",
  },
  {
    id: "c4", name: "FinEdge Capital",     industry: "Finance",     plan: "Starter",
    status: "Active",    adminName: "Ritu Agarwal",  adminEmail: "ritu@finedge.in",
    city: "Delhi",      country: "India",  employees: 19,  createdAt: "2024-03-10T00:00:00",
  },
  {
    id: "c5", name: "MedCare Health",      industry: "Healthcare",  plan: "Enterprise",
    status: "Suspended", adminName: "Sunil Menon",   adminEmail: "sunil@medcarehealth.in",
    city: "Hyderabad",  country: "India",  employees: 87,  createdAt: "2023-09-01T00:00:00",
  },
];

export default function MultiCompany() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCo, setNewCo]             = useState(EMPTY_FORM);
  const [editTarget, setEditTarget]   = useState(null);   // company being edited
  const [editForm, setEditForm]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // company pending delete

  const toast       = useToast();
  const queryClient = useQueryClient();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["companies", search, statusFilter],
    queryFn: () => getCompanies({
      search: search || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    }),
  });

  const rawCompanies = data?.data?.companies || [];
  const companies = rawCompanies.length ? rawCompanies : MOCK_COMPANIES;

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalEmployees = companies.reduce((s, c) => s + (c._count?.employees ?? c.employees ?? 0), 0);
  const totalRevenue   = companies.reduce((s, c) => s + (COST_MAP[c.plan] || 0), 0);

  const STATS = [
    { label: "Total Companies", value: companies.length,                                       sub: "tenants registered" },
    { label: "Active",          value: companies.filter((c) => c.status === "Active").length,  sub: "live accounts" },
    { label: "Total Employees", value: totalEmployees,                                         sub: "across all tenants" },
    { label: "Total Revenue",   value: `INR ${totalRevenue.toLocaleString("en-IN")}/mo`,       sub: "combined monthly" },
  ];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setNewCo(EMPTY_FORM);
      setShowAddModal(false);
      toast.show(`Company "${vars.name}" created successfully`, "success");
    },
    onError: () => toast.show("Failed to create company. Please try again.", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateCompanyStatus(id, status),
    onSuccess: (_, { status, name }) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.show(`${name} ${status === "Suspended" ? "suspended" : "reactivated"}`, status === "Suspended" ? "error" : "success");
    },
    onError: () => toast.show("Failed to update company status.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCompany(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setEditTarget(null);
      setEditForm(null);
      toast.show(`"${data.name}" updated successfully`, "success");
    },
    onError: () => toast.show("Failed to update company. Please try again.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      const name = deleteTarget?.name ?? "Company";
      setDeleteTarget(null);
      toast.show(`"${name}" deleted`, "error");
    },
    onError: () => toast.show("Failed to delete company.", "error"),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddCompany = () => {
    if (!newCo.name || !newCo.adminEmail || !newCo.adminPassword || !newCo.city) {
      toast.show("Please fill all required fields", "error");
      return;
    }
    createMutation.mutate({
      name:          newCo.name,
      industry:      newCo.industry,
      adminEmail:    newCo.adminEmail,
      adminPassword: newCo.adminPassword,
      adminName:     newCo.adminName,
      plan:          newCo.plan,
      city:          newCo.city,
      country:       newCo.country,
    });
  };

  const handleSuspend = (co) => {
    const next = co.status === "Suspended" ? "Active" : "Suspended";
    statusMutation.mutate({ id: co.id, status: next, name: co.name });
  };

  const openEdit = (co) => {
    setEditTarget(co);
    setEditForm({
      name:     co.name || "",
      industry: co.industry || "Technology",
      plan:     co.plan || "Pro",
      city:     co.city || "",
      country:  co.country || "India",
    });
  };

  const handleUpdateCompany = () => {
    if (!editForm.name || !editForm.city) {
      toast.show("Please fill all required fields", "error");
      return;
    }
    updateMutation.mutate({ id: editTarget.id, data: editForm });
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      <AppPageHeader title="Multi-Company Management" sub="Manage all tenant companies on this platform"
        action={<Button leftSection={<IconPlus size={16} />} onClick={() => setShowAddModal(true)}>Add Company</Button>}
      />

      <SimpleGrid cols={4}>
        {STATS.map((s) => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>{s.label}</Text>
            <Text size="xl" fw={700}>{s.value}</Text>
            <Text size="xs" c="dimmed" mt={4}>{s.sub}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search companies, admins, industries..."
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          data={["All", "Active", "Trial", "Suspended"].map((s) => ({ value: s, label: s === "All" ? "All Status" : s }))}
          w={160}
        />
      </Group>

      {isLoading ? (
        <Center py={80}>
          <Loader size="md" />
        </Center>
      ) : (
        <>
          <SimpleGrid cols={2} spacing="lg">
            {companies.map((co) => {
              const adminLabel = co.adminName || co.admin || co.adminEmail?.split("@")[0] || "—";
              const monthlyCost = COST_MAP[co.plan] || 0;
              const createdLabel = co.createdAt
                ? new Date(co.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                : co.created || "—";
              const employeeCount = co._count?.employees ?? co.employees ?? 0;

              return (
                <Paper
                  key={co.id} withBorder p="lg" radius="lg"
                  style={{ borderColor: co.status === "Suspended" ? "var(--mantine-color-red-3)" : undefined }}
                >
                  <Group justify="space-between" align="flex-start" mb="md">
                    <Group gap="md">
                      <Avatar radius="md" size={48} color="blue">
                        <Text c="white" fw={700} size="sm">{co.name.slice(0, 2).toUpperCase()}</Text>
                      </Avatar>
                      <div>
                        <Text fw={700}>{co.name}</Text>
                        <Text size="xs" c="dimmed">{co.industry} - {co.city}, {co.country}</Text>
                      </div>
                    </Group>
                    <Stack gap={4} align="flex-end">
                      <Badge color={STATUS_COLORS[co.status] || "gray"} variant="light">{co.status}</Badge>
                      <Badge color={PLAN_COLORS[co.plan]   || "gray"} variant="light">{co.plan}</Badge>
                    </Stack>
                  </Group>

                  <Group
                    grow py="sm"
                    style={{ borderTop: "1px solid var(--mantine-color-gray-2)", borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                    mb="md"
                  >
                    <Stack gap={2} align="center">
                      <Text fw={700} size="lg">{employeeCount}</Text>
                      <Text size="xs" c="dimmed">Employees</Text>
                    </Stack>
                    <Stack gap={2} align="center" style={{ borderLeft: "1px solid var(--mantine-color-gray-2)", borderRight: "1px solid var(--mantine-color-gray-2)" }}>
                      <Text fw={700} size="lg">INR {COST_LABEL[monthlyCost] ?? monthlyCost.toLocaleString("en-IN")}</Text>
                      <Text size="xs" c="dimmed">Monthly</Text>
                    </Stack>
                    <Stack gap={2} align="center">
                      <Text fw={600}>{createdLabel}</Text>
                      <Text size="xs" c="dimmed">Since</Text>
                    </Stack>
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <Avatar size={26} radius="xl" color="blue">
                        <Text size="xs" fw={700}>{adminLabel.slice(0, 2).toUpperCase()}</Text>
                      </Avatar>
                      <Text size="xs" c="dimmed">Admin: <Text span size="xs" fw={500}>{adminLabel}</Text></Text>
                    </Group>
                    <Group gap={6}>
                      <ActionIcon variant="default" size="sm" title="View" onClick={() => toast.show(`Viewing ${co.name} dashboard...`, "info")}>
                        <IconEye size={13} />
                      </ActionIcon>
                      <ActionIcon variant="default" size="sm" title="Edit" onClick={() => openEdit(co)}>
                        <IconPencil size={13} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color={co.status === "Suspended" ? "green" : "red"}
                        size="sm"
                        title={co.status === "Suspended" ? "Reactivate" : "Suspend"}
                        loading={statusMutation.isPending && statusMutation.variables?.id === co.id}
                        onClick={() => handleSuspend(co)}
                      >
                        <IconUserOff size={13} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        title="Delete"
                        onClick={() => setDeleteTarget(co)}
                      >
                        <IconTrash size={13} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>

          {companies.length === 0 && (
            <AppEmptyState
              icon={<IconBuilding size={24} />}
              message="No companies found"
              sub="No companies match your search."
              py={60}
            />
          )}
        </>
      )}

      <Modal opened={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Company" size="md">
        <Stack gap="md">
          <TextInput
            label="Company Name *"
            placeholder="Enter company name"
            value={newCo.name}
            onChange={(e) => setNewCo({ ...newCo, name: e.currentTarget.value })}
          />
          <Select
            label="Industry *"
            value={newCo.industry}
            onChange={(v) => setNewCo({ ...newCo, industry: v })}
            data={INDUSTRIES}
          />
          <TextInput
            label="Admin Name"
            placeholder="Full name of admin"
            value={newCo.adminName}
            onChange={(e) => setNewCo({ ...newCo, adminName: e.currentTarget.value })}
          />
          <TextInput
            type="email"
            label="Admin Email *"
            placeholder="admin@company.com"
            value={newCo.adminEmail}
            onChange={(e) => setNewCo({ ...newCo, adminEmail: e.currentTarget.value })}
          />
          <TextInput
            type="password"
            label="Admin Password *"
            placeholder="Set initial password"
            value={newCo.adminPassword}
            onChange={(e) => setNewCo({ ...newCo, adminPassword: e.currentTarget.value })}
          />
          <Select
            label="Plan *"
            value={newCo.plan}
            onChange={(v) => setNewCo({ ...newCo, plan: v })}
            data={PLANS}
          />
          <Group grow>
            <TextInput
              label="City *"
              placeholder="City"
              value={newCo.city}
              onChange={(e) => setNewCo({ ...newCo, city: e.currentTarget.value })}
            />
            <TextInput
              label="Country"
              placeholder="Country"
              value={newCo.country}
              onChange={(e) => setNewCo({ ...newCo, country: e.currentTarget.value })}
            />
          </Group>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddCompany} loading={createMutation.isPending}>Create Company</Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Edit Company Modal ── */}
      <Modal opened={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit ${editTarget?.name || "Company"}`} size="md">
        {editForm && (
          <Stack gap="md">
            <TextInput
              label="Company Name *"
              placeholder="Enter company name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.currentTarget.value })}
            />
            <Select
              label="Industry"
              value={editForm.industry}
              onChange={(v) => setEditForm({ ...editForm, industry: v })}
              data={INDUSTRIES}
            />
            <Select
              label="Plan"
              value={editForm.plan}
              onChange={(v) => setEditForm({ ...editForm, plan: v })}
              data={PLANS}
            />
            <Group grow>
              <TextInput
                label="City *"
                placeholder="City"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.currentTarget.value })}
              />
              <TextInput
                label="Country"
                placeholder="Country"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.currentTarget.value })}
              />
            </Group>
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button onClick={handleUpdateCompany} loading={updateMutation.isPending}>Save Changes</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Company" size="sm">
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete <Text span fw={700}>{deleteTarget?.name}</Text>? This will remove the
            tenant and all associated data. This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={() => deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending}>
              Delete Company
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
