import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Button, Tabs, SimpleGrid,
  Switch, Select, Checkbox, TextInput, ActionIcon, Alert, Notification,
} from "@mantine/core";
import { IconShield, IconDeviceFloppy, IconPlus, IconX } from "@tabler/icons-react";

const STATS = [
  { label: "Active Sessions",     value: "8",      sub: "users online now" },
  { label: "Failed Logins Today", value: "3",      sub: "suspicious attempts" },
  { label: "MFA Enabled",         value: "5/12",   sub: "users protected" },
  { label: "Security Score",      value: "74/100", sub: "good standing" },
];

export default function SecurityCenter({ userRole = "SUPER_ADMIN" }) {
  const [toast, setToast] = useState(null);
  const isReadOnly = userRole !== "SUPER_ADMIN";

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState("10");
  const [complexityUppercase, setComplexityUppercase] = useState(true);
  const [complexityLowercase, setComplexityLowercase] = useState(true);
  const [complexityNumbers, setComplexityNumbers] = useState(true);
  const [complexitySymbols, setComplexitySymbols] = useState(false);
  const [loginAttemptLimit, setLoginAttemptLimit] = useState("5");

  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [singleSession, setSingleSession] = useState(false);
  const [rememberDevice, setRememberDevice] = useState("14");

  const [whitelistEnabled, setWhitelistEnabled] = useState(true);
  const [ipInput, setIpInput] = useState("");
  const [ipList, setIpList] = useState(["10.0.1.0/24", "203.0.113.12", "198.51.100.5"]);

  const [logRetention, setLogRetention] = useState("90");
  const [autoExport, setAutoExport] = useState(false);
  const [siemIntegration, setSiemIntegration] = useState(false);

  const showToast = (msg, color = "green") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) return;
    if (ipList.includes(trimmed)) { showToast("IP already in list", "red"); return; }
    setIpList([...ipList, trimmed]);
    setIpInput("");
    showToast(`IP ${trimmed} added to whitelist`);
  };

  const handleRemoveIp = (ip) => {
    setIpList(ipList.filter((i) => i !== ip));
    showToast(`IP ${ip} removed from whitelist`, "red");
  };

  const complexityOptions = [
    { label: "Uppercase letters (A-Z)", val: complexityUppercase, set: setComplexityUppercase },
    { label: "Lowercase letters (a-z)", val: complexityLowercase, set: setComplexityLowercase },
    { label: "Numbers (0-9)",           val: complexityNumbers,   set: setComplexityNumbers },
    { label: "Special symbols (!@#$)",  val: complexitySymbols,   set: setComplexitySymbols },
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
        <Alert color="yellow" icon={<IconShield size={16} />}>
          View Only - Security policy configuration is restricted to Super Admin.
        </Alert>
      )}

      <Group justify="space-between">
        <div>
          <Title order={3}>Security Center</Title>
          <Text size="sm" c="dimmed">Configure authentication, sessions and access policies</Text>
        </div>
        {!isReadOnly && (
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={() => showToast("Security settings saved successfully")}>
            Save Changes
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

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs defaultValue="authentication">
          <Tabs.List>
            <Tabs.Tab value="authentication">Authentication</Tabs.Tab>
            <Tabs.Tab value="session">Session Policy</Tabs.Tab>
            <Tabs.Tab value="ip">IP Restrictions</Tabs.Tab>
            <Tabs.Tab value="audit">Audit Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="authentication" p="lg">
            <Stack maw={560} gap="lg">
              <Text fw={600}>Multi-Factor Authentication</Text>
              <Switch
                label="Require MFA for all users"
                description="Users must set up MFA on next login"
                checked={mfaEnabled}
                onChange={(e) => !isReadOnly && setMfaEnabled(e.currentTarget.checked)}
                disabled={isReadOnly}
              />

              <Text fw={600}>Password Policy</Text>
              <Select
                label="Minimum Password Length"
                value={passwordMinLength}
                onChange={(v) => setPasswordMinLength(v)}
                data={[{ value: "8", label: "8 characters" }, { value: "10", label: "10 characters" }, { value: "12", label: "12 characters" }]}
                disabled={isReadOnly}
                w={200}
              />

              <Stack gap="xs">
                <Text size="sm" fw={500}>Complexity Requirements</Text>
                {complexityOptions.map((c) => (
                  <Checkbox
                    key={c.label}
                    label={c.label}
                    checked={c.val}
                    onChange={(e) => !isReadOnly && c.set(e.currentTarget.checked)}
                    disabled={isReadOnly}
                  />
                ))}
              </Stack>

              <Select
                label="Login Attempt Limit (before lockout)"
                value={loginAttemptLimit}
                onChange={(v) => setLoginAttemptLimit(v)}
                data={[{ value: "3", label: "3 attempts" }, { value: "5", label: "5 attempts" }, { value: "10", label: "10 attempts" }]}
                disabled={isReadOnly}
                w={200}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="session" p="lg">
            <Stack maw={560} gap="lg">
              <Text fw={600}>Session Settings</Text>
              <Select
                label="Session Timeout"
                description="Users will be logged out after this period of inactivity."
                value={sessionTimeout}
                onChange={(v) => setSessionTimeout(v)}
                data={[
                  { value: "15", label: "15 minutes" }, { value: "30", label: "30 minutes" },
                  { value: "60", label: "1 hour" }, { value: "120", label: "2 hours" },
                ]}
                disabled={isReadOnly}
                w={200}
              />
              <Switch
                label="Single Session Enforcement"
                description="Users can only be logged in from one device at a time"
                checked={singleSession}
                onChange={(e) => !isReadOnly && setSingleSession(e.currentTarget.checked)}
                disabled={isReadOnly}
              />
              <Select
                label="Remember Device Duration"
                value={rememberDevice}
                onChange={(v) => setRememberDevice(v)}
                data={[
                  { value: "7", label: "7 days" }, { value: "14", label: "14 days" },
                  { value: "30", label: "30 days" }, { value: "0", label: "Never" },
                ]}
                disabled={isReadOnly}
                w={200}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="ip" p="lg">
            <Stack maw={560} gap="lg">
              <Text fw={600}>IP Whitelist</Text>
              <Switch
                label="Enable IP Whitelist"
                description="Only allow logins from whitelisted IP addresses"
                checked={whitelistEnabled}
                onChange={(e) => !isReadOnly && setWhitelistEnabled(e.currentTarget.checked)}
                disabled={isReadOnly}
              />
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
                  <Button leftSection={<IconPlus size={14} />} onClick={handleAddIp}>Add</Button>
                </Group>
              )}
              <Stack gap="xs">
                {ipList.map((ip) => (
                  <Paper key={ip} withBorder p="sm" radius="md">
                    <Group justify="space-between">
                      <Text size="sm" ff="monospace">{ip}</Text>
                      {!isReadOnly && (
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleRemoveIp(ip)}>
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}
                {ipList.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="lg">No IPs whitelisted. All IPs are allowed.</Text>
                )}
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="audit" p="lg">
            <Stack maw={560} gap="lg">
              <Text fw={600}>Log Retention</Text>
              <Select
                label="Retain Audit Logs For"
                description="Logs older than this period will be permanently deleted."
                value={logRetention}
                onChange={(v) => setLogRetention(v)}
                data={[
                  { value: "30", label: "30 days" }, { value: "60", label: "60 days" },
                  { value: "90", label: "90 days" }, { value: "180", label: "180 days" },
                ]}
                disabled={isReadOnly}
                w={200}
              />
              <Text fw={600}>Integrations</Text>
              <Switch
                label="Auto-Export Logs"
                description="Automatically export logs to storage at end of each week"
                checked={autoExport}
                onChange={(e) => !isReadOnly && setAutoExport(e.currentTarget.checked)}
                disabled={isReadOnly}
              />
              <Switch
                label="SIEM Integration"
                description="Stream events to your security information and event management tool"
                checked={siemIntegration}
                onChange={(e) => !isReadOnly && setSiemIntegration(e.currentTarget.checked)}
                disabled={isReadOnly}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
