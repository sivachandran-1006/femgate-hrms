import { useState, useEffect } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Switch, TextInput,
  Table, ActionIcon, SimpleGrid, Tabs, Select, Progress, Alert,
} from "@mantine/core";
import {
  IconShield, IconDeviceFloppy, IconPlus, IconX, IconLogout,
  IconUsers, IconAlertTriangle, IconLock, IconStarFilled,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getSecuritySettings,
  updateSecuritySettings,
  getActiveSessions,
  forceLogoutSession,
  forceLogoutAll,
  getSecurityStats,
  addIpToWhitelist,
  removeIpFromWhitelist,
} from "../../api/securityApi";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { useToast } from "../../components/ui/Toast";

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_SECURITY_STATS = {
  activeSessions:   8,
  failedLoginsToday: 3,
  mfaEnabled:       11,
  mfaTotal:         17,
  securityScore:    82,
};

const MOCK_SECURITY_SETTINGS = {
  mfaEnabled:          false,
  sessionTimeout:      "30",
  passwordPolicy:      "Min 8 chars, uppercase, number, symbol required",
  ipWhitelistEnabled:  false,
  auditLogging:        true,
  ipList:              ["203.0.113.0/24", "10.0.0.0/8"],
};

const MOCK_SESSIONS = [
  { id: "s1", user: "Arjun Sharma",  email: "arjun.sharma@mgate.in",  device: "Chrome / macOS",   ip: "203.0.113.10",  lastActive: "Just now" },
  { id: "s2", user: "Priya Nair",    email: "priya.nair@mgate.in",    device: "Firefox / Windows", ip: "203.0.113.21",  lastActive: "5 min ago" },
  { id: "s3", user: "Rohit Verma",   email: "rohit.verma@mgate.in",   device: "Safari / iPhone",  ip: "192.168.1.55",  lastActive: "12 min ago" },
  { id: "s4", user: "Sneha Pillai",  email: "sneha.pillai@mgate.in",  device: "Chrome / Windows", ip: "10.0.0.14",     lastActive: "28 min ago" },
  { id: "s5", user: "Kiran Reddy",   email: "kiran.reddy@mgate.in",   device: "Edge / Windows",   ip: "192.168.2.100", lastActive: "45 min ago" },
];

export default function SecurityCenter({ userRole = "SUPER_ADMIN" }) {
  const isReadOnly = userRole !== "SUPER_ADMIN";
  const toast = useToast();
  const queryClient = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: statsData } = useQuery({
    queryKey: ["security-stats"],
    queryFn: getSecurityStats,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["security-settings"],
    queryFn: getSecuritySettings,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["security-sessions"],
    queryFn: getActiveSessions,
  });

  // ── Local settings form state (seeded from API) ────────────────────────────

  const [settings, setSettings] = useState({
    mfaEnabled: false,
    sessionTimeout: "30",
    passwordPolicy: "",
    ipWhitelistEnabled: false,
    auditLogging: false,
  });

  useEffect(() => {
    const sd = settingsData?.data || settingsData;
    if (sd) {
      setSettings({
        mfaEnabled:         sd.mfaEnabled         ?? false,
        sessionTimeout:     String(sd.sessionTimeout ?? "30"),
        passwordPolicy:     sd.passwordPolicy      ?? "",
        ipWhitelistEnabled: sd.ipWhitelistEnabled  ?? false,
        auditLogging:       sd.auditLogging        ?? false,
      });
    }
  }, [settingsData]);

  const patchSettings = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // ── Settings mutation ──────────────────────────────────────────────────────

  const saveSettingsMutation = useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
      toast.show("Security settings saved successfully", "success");
    },
    onError: () => toast.show("Failed to save settings", "error"),
  });

  // ── Session mutations ──────────────────────────────────────────────────────

  const forceLogoutOneMutation = useMutation({
    mutationFn: forceLogoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
      toast.show("Session terminated", "success");
    },
    onError: () => toast.show("Failed to terminate session", "error"),
  });

  const forceLogoutAllMutation = useMutation({
    mutationFn: forceLogoutAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
      toast.show("All sessions terminated", "success");
    },
    onError: () => toast.show("Failed to terminate sessions", "error"),
  });

  // ── IP whitelist mutations ─────────────────────────────────────────────────

  const [ipInput, setIpInput] = useState("");

  const addIpMutation = useMutation({
    mutationFn: addIpToWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setIpInput("");
      toast.show("IP added to whitelist", "success");
    },
    onError: () => toast.show("Failed to add IP", "error"),
  });

  const removeIpMutation = useMutation({
    mutationFn: removeIpFromWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      toast.show("IP removed from whitelist", "success");
    },
    onError: () => toast.show("Failed to remove IP", "error"),
  });

  const handleAddIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) return;
    addIpMutation.mutate(trimmed);
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const stats    = statsData?.data    || statsData    || MOCK_SECURITY_STATS;
  const sd       = settingsData?.data || settingsData || MOCK_SECURITY_SETTINGS;
  const rawSessions = sessionsData?.data?.sessions || sessionsData?.sessions || sessionsData || [];
  const sessions = Array.isArray(rawSessions) && rawSessions.length ? rawSessions : MOCK_SESSIONS;
  const ipList   = sd.ipList ?? sd.ipWhitelist ?? MOCK_SECURITY_SETTINGS.ipList;

  const score = stats.securityScore ?? 0;
  const scoreColor = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>

      <AppPageHeader
        title="Security Center"
        sub="Configure authentication, sessions and access policies"
        action={
          !isReadOnly && (
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              loading={saveSettingsMutation.isPending}
              onClick={() => saveSettingsMutation.mutate(settings)}
            >
              Save Changes
            </Button>
          )
        }
      />

      {isReadOnly && (
        <Alert color="yellow" icon={<IconShield size={16} />}>
          View Only — Security policy configuration is restricted to Super Admin.
        </Alert>
      )}

      {/* Stats row */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <AppStatCard
          icon={<IconUsers size={22} />}
          label="Active Sessions"
          value={stats.activeSessions ?? "—"}
          sub="users online now"
          color="blue"
        />
        <AppStatCard
          icon={<IconAlertTriangle size={22} />}
          label="Failed Logins Today"
          value={stats.failedLoginsToday ?? "—"}
          sub="suspicious attempts"
          color="red"
        />
        <AppStatCard
          icon={<IconLock size={22} />}
          label="MFA Enabled"
          value={
            stats.securityScore !== undefined
              ? `${stats.mfaEnabled}/${stats.mfaTotal}`
              : "—"
          }
          sub="users protected"
          color="teal"
        />
        <AppStatCard
          icon={<IconStarFilled size={22} />}
          label="Security Score"
          value={stats.securityScore !== undefined ? `${stats.securityScore}/100` : "—"}
          sub="overall standing"
          color={scoreColor}
        />
      </SimpleGrid>

      {/* Score progress bar */}
      {stats.securityScore !== undefined && (
        <Paper withBorder radius="lg" p="md">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>Security Score</Text>
            <Badge color={scoreColor}>{score}/100</Badge>
          </Group>
          <Progress value={score} color={scoreColor} radius="xl" size="md" />
        </Paper>
      )}

      {/* Tabs */}
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
            <Tabs.Tab value="sessions">
              Sessions{sessions.length > 0 && ` (${sessions.length})`}
            </Tabs.Tab>
            <Tabs.Tab value="ip">IP Whitelist</Tabs.Tab>
          </Tabs.List>

          {/* ── Overview ──────────────────────────────────────────────────── */}
          <Tabs.Panel value="overview" p="lg">
            <Stack gap="md" maw={560}>
              <Text fw={600}>Current Security Status</Text>
              <SimpleGrid cols={2}>
                <Paper withBorder p="sm" radius="md">
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>Active Sessions</Text>
                  <Text size="xl" fw={700}>{stats.activeSessions ?? "—"}</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md">
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>Failed Logins Today</Text>
                  <Text size="xl" fw={700}>{stats.failedLoginsToday ?? "—"}</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md">
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>MFA Coverage</Text>
                  <Text size="xl" fw={700}>
                    {statsData ? `${stats.mfaEnabled}/${stats.mfaTotal}` : "—"}
                  </Text>
                </Paper>
                <Paper withBorder p="sm" radius="md">
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>Security Score</Text>
                  <Text size="xl" fw={700} c={scoreColor}>
                    {statsData ? `${stats.securityScore}/100` : "—"}
                  </Text>
                </Paper>
              </SimpleGrid>
              {stats.securityScore !== undefined && (
                <>
                  <Text size="sm" fw={500} mt="xs">Score breakdown</Text>
                  <Progress value={score} color={scoreColor} radius="xl" size="lg" />
                  <Text size="xs" c="dimmed">
                    {score >= 80
                      ? "Excellent — your security posture is strong."
                      : score >= 60
                      ? "Good — consider enabling MFA for remaining users."
                      : "Needs attention — review settings and active sessions."}
                  </Text>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ── Settings ──────────────────────────────────────────────────── */}
          <Tabs.Panel value="settings" p="lg">
            <Stack maw={560} gap="lg">
              <Switch
                label="Require MFA for all users"
                description="Users must set up MFA on next login"
                checked={settings.mfaEnabled}
                onChange={(e) =>
                  !isReadOnly && patchSettings("mfaEnabled", e.currentTarget.checked)
                }
                disabled={isReadOnly}
              />

              <Select
                label="Session Timeout"
                description="Users will be logged out after this period of inactivity."
                value={settings.sessionTimeout}
                onChange={(v) => patchSettings("sessionTimeout", v)}
                data={[
                  { value: "15", label: "15 minutes" },
                  { value: "30", label: "30 minutes" },
                  { value: "60", label: "1 hour" },
                  { value: "120", label: "2 hours" },
                ]}
                disabled={isReadOnly}
                w={200}
              />

              <TextInput
                label="Password Policy"
                description="Describe the password requirements enforced for all users"
                placeholder="e.g. min 10 chars, uppercase, numbers, symbols"
                value={settings.passwordPolicy}
                onChange={(e) => patchSettings("passwordPolicy", e.currentTarget.value)}
                disabled={isReadOnly}
              />

              <Switch
                label="Enable IP Whitelist"
                description="Only allow logins from whitelisted IP addresses"
                checked={settings.ipWhitelistEnabled}
                onChange={(e) =>
                  !isReadOnly && patchSettings("ipWhitelistEnabled", e.currentTarget.checked)
                }
                disabled={isReadOnly}
              />

              <Switch
                label="Audit Logging"
                description="Record all security-relevant events to the audit log"
                checked={settings.auditLogging}
                onChange={(e) =>
                  !isReadOnly && patchSettings("auditLogging", e.currentTarget.checked)
                }
                disabled={isReadOnly}
              />

              {!isReadOnly && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={saveSettingsMutation.isPending}
                  onClick={() => saveSettingsMutation.mutate(settings)}
                  w="fit-content"
                >
                  Save Settings
                </Button>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ── Sessions ──────────────────────────────────────────────────── */}
          <Tabs.Panel value="sessions" p="lg">
            <Stack gap="md">
              {!isReadOnly && sessions.length > 0 && (
                <Group justify="flex-end">
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    loading={forceLogoutAllMutation.isPending}
                    onClick={() => forceLogoutAllMutation.mutate()}
                  >
                    Force Logout All
                  </Button>
                </Group>
              )}

              {sessions.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No active sessions found.
                </Text>
              ) : (
                <Table highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Device</Table.Th>
                      <Table.Th>IP Address</Table.Th>
                      <Table.Th>Last Active</Table.Th>
                      {!isReadOnly && <Table.Th>Action</Table.Th>}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sessions.map((session) => (
                      <Table.Tr key={session.id}>
                        <Table.Td fw={500}>{session.user}</Table.Td>
                        <Table.Td>{session.email}</Table.Td>
                        <Table.Td>{session.device}</Table.Td>
                        <Table.Td ff="monospace">{session.ip}</Table.Td>
                        <Table.Td>{session.lastActive}</Table.Td>
                        {!isReadOnly && (
                          <Table.Td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              loading={forceLogoutOneMutation.isPending}
                              onClick={() => forceLogoutOneMutation.mutate(session.id)}
                            >
                              <IconLogout size={14} />
                            </ActionIcon>
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ── IP Whitelist ───────────────────────────────────────────────── */}
          <Tabs.Panel value="ip" p="lg">
            <Stack maw={560} gap="md">
              <Text fw={600}>Whitelisted IP Addresses</Text>

              {!isReadOnly && (
                <Group gap="sm" align="flex-end">
                  <TextInput
                    label="Add IP Address or CIDR Range"
                    placeholder="e.g. 192.168.1.0/24 or 203.0.113.5"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddIp()}
                    style={{ flex: 1 }}
                  />
                  <Button
                    leftSection={<IconPlus size={14} />}
                    loading={addIpMutation.isPending}
                    onClick={handleAddIp}
                  >
                    Add
                  </Button>
                </Group>
              )}

              <Stack gap="xs">
                {ipList.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="lg">
                    No IPs whitelisted. All IPs are allowed.
                  </Text>
                ) : (
                  ipList.map((ip) => (
                    <Paper key={ip} withBorder p="sm" radius="md">
                      <Group justify="space-between">
                        <Text size="sm" ff="monospace">{ip}</Text>
                        {!isReadOnly && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            loading={removeIpMutation.isPending}
                            onClick={() => removeIpMutation.mutate(ip)}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
