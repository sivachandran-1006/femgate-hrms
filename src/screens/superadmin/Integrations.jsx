import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, SimpleGrid, Modal,
  TextInput, Select, Textarea, ActionIcon, Alert, Center, Loader,
} from "@mantine/core";
import {
  IconSearch, IconPlus, IconRefresh, IconSettings, IconPlugConnectedX,
  IconPlugConnected, IconAlertTriangle,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
  requestIntegration,
} from "../../api/integrationsApi";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const EMPTY_REQUEST = { name: "", category: "Productivity", reason: "" };

const ICON_COLORS = {
  microsoft365: "#0078d4", google_workspace: "#4285f4", slack: "#4a154b",
  msteams: "#6264a7", zoom: "#2d8cff", freshservice: "#22c55e",
  workday: "#f59e0b", sap_sf: "#e87722", okta: "#007dc1",
  azure_ad: "#0078d4", jira: "#0052cc", notion: "#1f2937",
};

const CATEGORIES = ["All", "Communication", "HR", "Productivity", "Security"];
const CATEGORY_COLORS = { Productivity: "blue", Communication: "violet", HR: "green", Security: "orange" };
const STATUS_COLORS = { Connected: "green", Available: "gray", Error: "red" };

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_INTEGRATIONS = [
  { id: "microsoft365",    name: "Microsoft 365",    category: "Productivity",  connected: true,  error: null,  lastSync: "2026-07-01T08:00:00", description: "Email, calendar and Office apps for all users." },
  { id: "slack",           name: "Slack",            category: "Communication", connected: true,  error: null,  lastSync: "2026-07-01T09:00:00", description: "Team messaging and notifications." },
  { id: "google_workspace",name: "Google Workspace", category: "Productivity",  connected: false, error: null,  lastSync: null,                  description: "Gmail, Drive and Meet for collaboration." },
  { id: "zoom",            name: "Zoom",             category: "Communication", connected: false, error: null,  lastSync: null,                  description: "Video conferencing for remote teams." },
  { id: "okta",            name: "Okta",             category: "Security",      connected: true,  error: null,  lastSync: "2026-06-30T22:00:00", description: "Single Sign-On and identity management." },
  { id: "azure_ad",        name: "Azure AD",         category: "Security",      connected: false, error: "Token expired — reconnection required.", lastSync: "2026-06-20T10:00:00", description: "Active Directory sync for user provisioning." },
  { id: "freshservice",    name: "Freshservice",     category: "HR",            connected: false, error: null,  lastSync: null,                  description: "ITSM and asset management platform." },
  { id: "workday",         name: "Workday",          category: "HR",            connected: true,  error: null,  lastSync: "2026-06-30T18:00:00", description: "HR data sync and workforce management." },
  { id: "jira",            name: "Jira",             category: "Productivity",  connected: false, error: null,  lastSync: null,                  description: "Issue tracking and project management." },
];

export default function Integrations({ userRole = "SUPER_ADMIN" }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [reqForm, setReqForm] = useState(EMPTY_REQUEST);

  const toast = useToast();
  const queryClient = useQueryClient();
  const isReadOnly = userRole !== "SUPER_ADMIN";

  // ── Fetch integrations ──────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: getIntegrations,
  });

  const rawIntegrations = data?.data?.integrations?.length ? data.data.integrations : MOCK_INTEGRATIONS;
  const integrations = rawIntegrations.map(i => ({
    ...i,
    status:   i.error ? "Error" : i.connected ? "Connected" : "Available",
    lastSync: i.lastSync ? new Date(i.lastSync).toLocaleString() : (i.error || null),
    color:    ICON_COLORS[i.id] || "#6b7280",
    desc:     i.description || "",
  }));

  // ── Connect mutation ────────────────────────────────────────────────────────
  const connectMutation = useMutation({
    mutationFn: (intg) => connectIntegration(intg.id || intg.name, {}),
    onSuccess: (_, intg) => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast?.show(`${intg.name} connected successfully`, "success");
    },
    onError: (_, intg) => {
      toast?.show(`Failed to connect ${intg.name}`, "error");
    },
  });

  // ── Disconnect mutation ─────────────────────────────────────────────────────
  const disconnectMutation = useMutation({
    mutationFn: (intg) => disconnectIntegration(intg.id || intg.name),
    onSuccess: (_, intg) => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast?.show(`${intg.name} disconnected`, "error");
    },
    onError: (_, intg) => {
      toast?.show(`Failed to disconnect ${intg.name}`, "error");
    },
  });

  // ── Request new integration mutation ────────────────────────────────────────
  const requestMutation = useMutation({
    mutationFn: (data) => requestIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowAddModal(false);
      setReqForm(EMPTY_REQUEST);
      toast?.show("Integration request submitted", "success");
    },
    onError: () => toast?.show("Failed to submit request. Please try again.", "error"),
  });

  const handleConnect = (intg) => connectMutation.mutate(intg);
  const handleDisconnect = (intg) => disconnectMutation.mutate(intg);

  const handleRequest = () => {
    if (!reqForm.name.trim()) {
      toast?.show("Integration name is required", "error");
      return;
    }
    requestMutation.mutate(reqForm);
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = integrations.filter((i) => {
    const q = search.toLowerCase();
    return (i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
      && (category === "All" || i.category === category);
  });

  const STATS = [
    { label: "Active",           value: integrations.filter((i) => i.status === "Connected").length, sub: "connected integrations" },
    { label: "Available",        value: integrations.filter((i) => i.status === "Available").length, sub: "ready to connect" },
    { label: "Failed",           value: integrations.filter((i) => i.status === "Error").length,     sub: "needs attention" },
    { label: "API Calls Today",  value: integrations.filter(i => i.connected).length > 0 ? integrations.filter(i => i.connected).length * 500 : "—", sub: "across all integrations" },
  ];

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      {isReadOnly && (
        <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
          View Only - Connecting, disconnecting and configuring integrations is restricted to Super Admin.
        </Alert>
      )}

      <AppPageHeader
        title="Integrations"
        sub="Connect third-party tools to this platform"
        action={!isReadOnly && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowAddModal(true)}>
            Add Integration
          </Button>
        )}
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

      {isLoading ? (
        <Center py={60}><Loader size="md" /></Center>
      ) : (
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
                      <ActionIcon variant="default" size="lg" title="Sync" onClick={() => toast?.show(`Syncing ${intg.name}...`, "info")}>
                        <IconRefresh size={14} />
                      </ActionIcon>
                      <ActionIcon variant="default" size="lg" title="Configure" onClick={() => toast?.show(`Opening configuration for ${intg.name}...`, "info")}>
                        <IconSettings size={14} />
                      </ActionIcon>
                      <Button
                        size="xs" color="red" variant="light"
                        leftSection={<IconPlugConnectedX size={12} />}
                        loading={disconnectMutation.isPending && disconnectMutation.variables?.id === intg.id}
                        onClick={() => handleDisconnect(intg)}
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                  {intg.status === "Available" && (
                    <Button
                      fullWidth size="sm" variant="light"
                      leftSection={<IconPlugConnected size={14} />}
                      loading={connectMutation.isPending && connectMutation.variables?.id === intg.id}
                      onClick={() => handleConnect(intg)}
                    >
                      Connect
                    </Button>
                  )}
                  {intg.status === "Error" && (
                    <Group gap="xs" grow style={{ width: "100%" }}>
                      <Button
                        size="xs" color="orange" variant="light"
                        loading={connectMutation.isPending && connectMutation.variables?.id === intg.id}
                        onClick={() => handleConnect(intg)}
                      >
                        Reconnect
                      </Button>
                      <Button size="xs" variant="default" onClick={() => toast?.show(`Opening configuration for ${intg.name}...`, "info")}>
                        Configure
                      </Button>
                    </Group>
                  )}
                </Group>
              )}
            </Paper>
          ))}
        </SimpleGrid>
      )}

      {!isLoading && filtered.length === 0 && (
        <AppEmptyState
          icon={<IconPlugConnected size={24} />}
          message="No integrations found"
          sub="No integrations match your search."
          py={60}
        />
      )}

      <Modal opened={showAddModal} onClose={() => setShowAddModal(false)} title="Request New Integration" size="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Submit a request for an integration not listed here. Our team will evaluate and add it to the catalogue.
          </Text>
          <TextInput
            label="Integration Name *"
            placeholder="e.g. Salesforce CRM"
            value={reqForm.name}
            onChange={(e) => setReqForm({ ...reqForm, name: e.currentTarget.value })}
          />
          <Select
            label="Category"
            data={CATEGORIES.filter((c) => c !== "All")}
            value={reqForm.category}
            onChange={(v) => setReqForm({ ...reqForm, category: v })}
          />
          <Textarea
            label="Reason / Use Case"
            placeholder="Describe why this integration is needed..."
            minRows={3}
            autosize
            value={reqForm.reason}
            onChange={(e) => setReqForm({ ...reqForm, reason: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleRequest} loading={requestMutation.isPending}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
