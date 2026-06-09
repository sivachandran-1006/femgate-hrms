import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, SimpleGrid, Modal,
  TextInput, Select, Textarea, ActionIcon, Alert, Notification, Center,
} from "@mantine/core";
import {
  IconSearch, IconPlus, IconRefresh, IconSettings, IconPlugConnectedX,
  IconPlugConnected, IconAlertTriangle,
} from "@tabler/icons-react";

const INTEGRATIONS = [
  { id: 1,  name: "Microsoft 365",      category: "Productivity",  status: "Connected", lastSync: "5m ago",  color: "#0078d4", desc: "Email, calendar and Teams integration" },
  { id: 2,  name: "Google Workspace",   category: "Productivity",  status: "Connected", lastSync: "10m ago", color: "#4285f4", desc: "Gmail, Drive and Meet integration" },
  { id: 3,  name: "Slack",              category: "Communication", status: "Connected", lastSync: "2m ago",  color: "#4a154b", desc: "Notifications and bot commands" },
  { id: 4,  name: "Microsoft Teams",    category: "Communication", status: "Available", lastSync: null,      color: "#6264a7", desc: "Video calls and team channels" },
  { id: 5,  name: "Zoom",               category: "Communication", status: "Available", lastSync: null,      color: "#2d8cff", desc: "Video conferencing for interviews" },
  { id: 6,  name: "Freshservice",       category: "HR",            status: "Connected", lastSync: "1h ago",  color: "#22c55e", desc: "IT service desk sync" },
  { id: 7,  name: "Workday",            category: "HR",            status: "Available", lastSync: null,      color: "#f59e0b", desc: "HRIS data sync" },
  { id: 8,  name: "SAP SuccessFactors", category: "HR",            status: "Error",     lastSync: "Failed",  color: "#e87722", desc: "Enterprise HR platform" },
  { id: 9,  name: "Okta",               category: "Security",      status: "Available", lastSync: null,      color: "#007dc1", desc: "SSO and identity management" },
  { id: 10, name: "Azure AD",           category: "Security",      status: "Available", lastSync: null,      color: "#0078d4", desc: "Directory and SSO integration" },
  { id: 11, name: "Jira",               category: "Productivity",  status: "Available", lastSync: null,      color: "#0052cc", desc: "Project and issue tracking" },
  { id: 12, name: "Notion",             category: "Productivity",  status: "Available", lastSync: null,      color: "#1f2937", desc: "Wiki and knowledge base" },
];

const CATEGORIES = ["All", "Communication", "HR", "Productivity", "Security"];
const CATEGORY_COLORS = { Productivity: "blue", Communication: "violet", HR: "green", Security: "orange" };
const STATUS_COLORS = { Connected: "green", Available: "gray", Error: "red" };

export default function Integrations({ userRole = "SUPER_ADMIN" }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState(null);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [showAddModal, setShowAddModal] = useState(false);

  const isReadOnly = userRole !== "SUPER_ADMIN";

  const showToast = (msg, color = "green") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = (id) => {
    const name = integrations.find((i) => i.id === id)?.name;
    setIntegrations(integrations.map((i) => i.id !== id ? i : { ...i, status: "Connected", lastSync: "Just now" }));
    showToast(`${name} connected successfully`);
  };

  const handleDisconnect = (id) => {
    const name = integrations.find((i) => i.id === id)?.name;
    setIntegrations(integrations.map((i) => i.id !== id ? i : { ...i, status: "Available", lastSync: null }));
    showToast(`${name} disconnected`, "red");
  };

  const filtered = integrations.filter((i) => {
    const q = search.toLowerCase();
    return (i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
      && (category === "All" || i.category === category);
  });

  const STATS = [
    { label: "Active",           value: integrations.filter((i) => i.status === "Connected").length, sub: "connected integrations" },
    { label: "Available",        value: integrations.filter((i) => i.status === "Available").length, sub: "ready to connect" },
    { label: "Failed",           value: integrations.filter((i) => i.status === "Error").length,     sub: "needs attention" },
    { label: "API Calls Today",  value: "2,847",                                                     sub: "across all integrations" },
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

      {isReadOnly && (
        <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
          View Only - Connecting, disconnecting and configuring integrations is restricted to Super Admin.
        </Alert>
      )}

      <Group justify="space-between">
        <div>
          <Title order={3}>Integrations</Title>
          <Text size="sm" c="dimmed">Connect third-party tools to this platform</Text>
        </div>
        {!isReadOnly && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowAddModal(true)}>
            Add Integration
          </Button>
        )}
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
          placeholder="Search integrations..."
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Group gap="xs">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "filled" : "default"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </Group>
      </Group>

      <SimpleGrid cols={3} spacing="md">
        {filtered.map((intg) => (
          <Paper
            key={intg.id} withBorder p="lg" radius="lg"
            style={{
              display: "flex", flexDirection: "column", gap: 14,
              borderColor: intg.status === "Error" ? "var(--mantine-color-red-3)" : undefined,
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Group gap="md">
                <Paper
                  w={44} h={44} radius="md"
                  style={{ background: intg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <Text c="white" size="sm" fw={700}>{intg.name.slice(0, 2).toUpperCase()}</Text>
                </Paper>
                <div>
                  <Text fw={600}>{intg.name}</Text>
                  <Badge size="xs" color={CATEGORY_COLORS[intg.category]} variant="light">{intg.category}</Badge>
                </div>
              </Group>
              <Badge color={STATUS_COLORS[intg.status]} variant="light">{intg.status}</Badge>
            </Group>

            <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>{intg.desc}</Text>

            {intg.lastSync && (
              <Text size="xs" c={intg.status === "Error" ? "red" : "dimmed"}>
                {intg.status === "Error" ? "Last sync: " : "Last synced: "}{intg.lastSync}
              </Text>
            )}

            {!isReadOnly && (
              <Group gap="xs" style={{ marginTop: "auto" }}>
                {intg.status === "Connected" && (
                  <>
                    <ActionIcon variant="default" size="lg" title="Sync" onClick={() => showToast(`Syncing ${intg.name}...`)}>
                      <IconRefresh size={14} />
                    </ActionIcon>
                    <ActionIcon variant="default" size="lg" title="Configure" onClick={() => showToast(`Opening configuration for ${intg.name}...`)}>
                      <IconSettings size={14} />
                    </ActionIcon>
                    <Button size="xs" color="red" variant="light" leftSection={<IconPlugConnectedX size={12} />} onClick={() => handleDisconnect(intg.id)}>
                      Disconnect
                    </Button>
                  </>
                )}
                {intg.status === "Available" && (
                  <Button fullWidth size="sm" variant="light" leftSection={<IconPlugConnected size={14} />} onClick={() => handleConnect(intg.id)}>
                    Connect
                  </Button>
                )}
                {intg.status === "Error" && (
                  <Group gap="xs" grow style={{ width: "100%" }}>
                    <Button size="xs" color="orange" variant="light" onClick={() => handleConnect(intg.id)}>Reconnect</Button>
                    <Button size="xs" variant="default" onClick={() => showToast(`Opening configuration for ${intg.name}...`)}>Configure</Button>
                  </Group>
                )}
              </Group>
            )}
          </Paper>
        ))}
      </SimpleGrid>

      {filtered.length === 0 && (
        <Center py={60}>
          <Text size="sm" c="dimmed">No integrations found matching your search.</Text>
        </Center>
      )}

      <Modal opened={showAddModal} onClose={() => setShowAddModal(false)} title="Request New Integration" size="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Submit a request for an integration not listed here. Our team will evaluate and add it to the catalogue.
          </Text>
          <TextInput label="Integration Name *" placeholder="e.g. Salesforce CRM" />
          <Select
            label="Category"
            data={CATEGORIES.filter((c) => c !== "All")}
            defaultValue="Productivity"
          />
          <Textarea
            label="Reason / Use Case"
            placeholder="Describe why this integration is needed..."
            minRows={3}
            autosize
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowAddModal(false); showToast("Integration request submitted"); }}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
