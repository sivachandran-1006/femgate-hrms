import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, SimpleGrid, Modal,
  TextInput, Select, ActionIcon, Avatar, Notification, Center,
} from "@mantine/core";
import { IconSearch, IconPlus, IconEye, IconPencil, IconUserOff, IconBuilding } from "@tabler/icons-react";
import { COLORS } from "../../theme/colors";

const BRAND_COLORS = [COLORS.primary, COLORS.purple, COLORS.info, "#be185d", COLORS.success, COLORS.warning];

const INIT_COMPANIES = [
  { id: 1, name: "MGate Systems",    industry: "Technology", plan: "Enterprise", employees: 13, status: "Active",    city: "Chennai",   country: "India", admin: "Super Admin", created: "Jan 2024", cost: "45000",  color: BRAND_COLORS[0] },
  { id: 2, name: "Vertex Solutions", industry: "Software",  plan: "Pro",        employees: 42, status: "Active",    city: "Bangalore", country: "India", admin: "Nithya S",   created: "Mar 2024", cost: "28000",  color: BRAND_COLORS[1] },
  { id: 3, name: "SynEx Systems",    industry: "Consulting", plan: "Starter",    employees: 8,  status: "Trial",     city: "Hyderabad", country: "India", admin: "Rajan M",    created: "May 2026", cost: "8000",   color: BRAND_COLORS[2] },
  { id: 4, name: "Vela Partners",    industry: "Finance",   plan: "Pro",        employees: 19, status: "Active",    city: "Mumbai",    country: "India", admin: "Preethi V",  created: "Sep 2024", cost: "28000",  color: BRAND_COLORS[3] },
];

const PLAN_COLORS = { Enterprise: "yellow", Pro: "blue", Starter: "violet" };
const STATUS_COLORS = { Active: "green", Trial: "orange", Suspended: "red" };

const INDUSTRIES = ["Technology", "Software", "Consulting", "Finance", "Healthcare", "Retail", "Manufacturing", "Education"];
const PLANS = ["Starter", "Pro", "Enterprise"];
const COST_MAP = { Starter: "8000", Pro: "28000", Enterprise: "45000" };
const COST_LABEL = { "8000": "8,000", "28000": "28,000", "45000": "45,000" };

export default function MultiCompany() {
  const [companies, setCompanies] = useState(INIT_COMPANIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newCo, setNewCo] = useState({ name: "", industry: "Technology", adminEmail: "", plan: "Pro", city: "", country: "India" });

  const showToast = (msg, color = "green") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.admin.toLowerCase().includes(q))
      && (statusFilter === "All" || c.status === statusFilter);
  });

  const handleAddCompany = () => {
    if (!newCo.name || !newCo.adminEmail || !newCo.city) { showToast("Please fill all required fields", "red"); return; }
    const id = companies.length + 1;
    setCompanies([...companies, {
      id, name: newCo.name, industry: newCo.industry, plan: newCo.plan, employees: 0,
      status: "Trial", city: newCo.city, country: newCo.country,
      admin: newCo.adminEmail.split("@")[0], created: "Jun 2026",
      cost: COST_MAP[newCo.plan], color: BRAND_COLORS[id % BRAND_COLORS.length],
    }]);
    setNewCo({ name: "", industry: "Technology", adminEmail: "", plan: "Pro", city: "", country: "India" });
    setShowAddModal(false);
    showToast(`Company "${newCo.name}" created successfully`);
  };

  const handleSuspend = (id) => {
    const co = companies.find((c) => c.id === id);
    if (!co) return;
    const next = co.status === "Suspended" ? "Active" : "Suspended";
    setCompanies(companies.map((c) => c.id === id ? { ...c, status: next } : c));
    showToast(`${co.name} ${next === "Suspended" ? "suspended" : "reactivated"}`, next === "Suspended" ? "red" : "green");
  };

  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);
  const totalRevenue = companies.reduce((s, c) => s + parseInt(c.cost, 10), 0);

  const STATS = [
    { label: "Total Companies", value: companies.length,                                      sub: "tenants registered" },
    { label: "Active",          value: companies.filter((c) => c.status === "Active").length, sub: "live accounts" },
    { label: "Total Employees", value: totalEmployees,                                        sub: "across all tenants" },
    { label: "Total Revenue",   value: `INR ${totalRevenue.toLocaleString("en-IN")}/mo`,      sub: "combined monthly" },
  ];

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      {toast && (
        <Notification
          color={toast.color}
          onClose={() => setToast(null)}
          style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, minWidth: 260 }}
        >
          {toast.msg}
        </Notification>
      )}

      <Group justify="space-between">
        <div>
          <Title order={3}>Multi-Company Management</Title>
          <Text size="sm" c="dimmed">Manage all tenant companies on this platform</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setShowAddModal(true)}>
          Add Company
        </Button>
      </Group>

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

      <SimpleGrid cols={2} spacing="lg">
        {filtered.map((co) => (
          <Paper
            key={co.id} withBorder p="lg" radius="lg"
            style={{ borderColor: co.status === "Suspended" ? "var(--mantine-color-red-3)" : undefined }}
          >
            <Group justify="space-between" align="flex-start" mb="md">
              <Group gap="md">
                <Avatar radius="md" size={48} style={{ background: co.color }}>
                  <Text c="white" fw={700} size="sm">{co.name.slice(0, 2).toUpperCase()}</Text>
                </Avatar>
                <div>
                  <Text fw={700}>{co.name}</Text>
                  <Text size="xs" c="dimmed">{co.industry} - {co.city}, {co.country}</Text>
                </div>
              </Group>
              <Stack gap={4} align="flex-end">
                <Badge color={STATUS_COLORS[co.status]} variant="light">{co.status}</Badge>
                <Badge color={PLAN_COLORS[co.plan]} variant="light">{co.plan}</Badge>
              </Stack>
            </Group>

            <Group
              grow py="sm"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)", borderBottom: "1px solid var(--mantine-color-gray-2)" }}
              mb="md"
            >
              <Stack gap={2} align="center">
                <Text fw={700} size="lg">{co.employees}</Text>
                <Text size="xs" c="dimmed">Employees</Text>
              </Stack>
              <Stack gap={2} align="center" style={{ borderLeft: "1px solid var(--mantine-color-gray-2)", borderRight: "1px solid var(--mantine-color-gray-2)" }}>
                <Text fw={700} size="lg">INR {COST_LABEL[co.cost] || co.cost}</Text>
                <Text size="xs" c="dimmed">Monthly</Text>
              </Stack>
              <Stack gap={2} align="center">
                <Text fw={600}>{co.created}</Text>
                <Text size="xs" c="dimmed">Since</Text>
              </Stack>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <Avatar size={26} radius="xl" style={{ background: co.color + "33" }}>
                  <Text size="xs" fw={700} c={co.color}>{co.admin.slice(0, 2).toUpperCase()}</Text>
                </Avatar>
                <Text size="xs" c="dimmed">Admin: <Text span size="xs" fw={500}>{co.admin}</Text></Text>
              </Group>
              <Group gap={6}>
                <ActionIcon variant="default" size="sm" title="View" onClick={() => showToast(`Viewing ${co.name} dashboard...`)}>
                  <IconEye size={13} />
                </ActionIcon>
                <ActionIcon variant="default" size="sm" title="Edit" onClick={() => showToast(`Editing ${co.name}...`)}>
                  <IconPencil size={13} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color={co.status === "Suspended" ? "green" : "red"}
                  size="sm"
                  title={co.status === "Suspended" ? "Reactivate" : "Suspend"}
                  onClick={() => handleSuspend(co.id)}
                >
                  <IconUserOff size={13} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {filtered.length === 0 && (
        <Center py={60}>
          <Stack align="center" gap="xs">
            <IconBuilding size={32} color="gray" />
            <Text size="sm" c="dimmed">No companies found matching your search.</Text>
          </Stack>
        </Center>
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
            type="email"
            label="Admin Email *"
            placeholder="admin@company.com"
            value={newCo.adminEmail}
            onChange={(e) => setNewCo({ ...newCo, adminEmail: e.currentTarget.value })}
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
            <Button onClick={handleAddCompany}>Create Company</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
