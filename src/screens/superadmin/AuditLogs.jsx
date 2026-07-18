import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, TextInput,
  Select, Tabs, Table, ScrollArea, SimpleGrid, Loader, Center,
} from "@mantine/core";
import {
  IconShield, IconSettings, IconUser, IconSearch, IconDownload,
  IconChevronDown, IconChevronRight, IconClipboardList,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

// ── Mock stubs for removed service functions ──
const exportAuditLogs = async (...args) => { console.log("Mock: exportAuditLogs"); return new Blob(["mock data"], { type: "text/csv" }); };


const SEV_COLOR = { Critical: "red", Warning: "yellow", Info: "blue" };

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_LOGS = [
  { id: "log1",  ts: "2026-07-01 09:12:34", actor: "arjun.sharma@mgate.in", action: "User login successful",               module: "Security",     ip: "203.0.113.10",  sev: "Info",     detail: { userId: "u1", method: "password" } },
  { id: "log2",  ts: "2026-07-01 09:05:11", actor: "priya.nair@mgate.in",   action: "Role updated: EMPLOYEE → MANAGER",    module: "User Actions", ip: "203.0.113.21",  sev: "Warning",  detail: { targetUser: "u4", oldRole: "EMPLOYEE", newRole: "MANAGER" } },
  { id: "log3",  ts: "2026-06-30 18:42:00", actor: "rohit.verma@mgate.in",  action: "New employee record created",         module: "User Actions", ip: "192.168.1.55",  sev: "Info",     detail: { employeeId: "EMP042", name: "Suresh Kumar" } },
  { id: "log4",  ts: "2026-06-30 15:30:22", actor: "arjun.sharma@mgate.in", action: "Security settings updated (MFA on)", module: "Security",     ip: "203.0.113.10",  sev: "Critical", detail: { changed: ["mfaEnabled"], mfaEnabled: true } },
  { id: "log5",  ts: "2026-06-30 12:01:05", actor: "sneha.pillai@mgate.in", action: "Payroll batch processed",             module: "System",       ip: "10.0.0.14",     sev: "Info",     detail: { month: "June 2026", count: 134 } },
  { id: "log6",  ts: "2026-06-29 23:14:48", actor: "system",                action: "Automated backup completed",          module: "System",       ip: "127.0.0.1",     sev: "Info",     detail: { size: "1.2 GB", duration: "4m 32s" } },
  { id: "log7",  ts: "2026-06-29 14:55:30", actor: "kiran.reddy@mgate.in",  action: "Invoice INV-2026-061 downloaded",     module: "User Actions", ip: "192.168.2.100", sev: "Info",     detail: { invoiceId: "INV-2026-061", amount: 45000 } },
  { id: "log8",  ts: "2026-06-28 11:30:12", actor: "unknown",               action: "Failed login attempt (3rd attempt)",  module: "Security",     ip: "45.33.32.156",  sev: "Critical", detail: { email: "admin@mgate.in", attempts: 3 } },
  { id: "log9",  ts: "2026-06-28 09:00:00", actor: "arjun.sharma@mgate.in", action: "IP 203.0.113.99 added to whitelist",  module: "Security",     ip: "203.0.113.10",  sev: "Warning",  detail: { ip: "203.0.113.99" } },
  { id: "log10", ts: "2026-06-27 16:22:44", actor: "priya.nair@mgate.in",   action: "Company settings updated",            module: "System",       ip: "203.0.113.21",  sev: "Warning",  detail: { fields: ["timezone", "currency"] } },
];

const MOCK_AUDIT_STATS = { total: 247, security: 38, system: 82, userActions: 127 };

const MOD_ICON = {
  Security:       <IconShield size={13} />,
  System:         <IconSettings size={13} />,
  "User Actions": <IconUser size={13} />,
};

const DATE_OPT = ["All Time", "Today", "This Week", "This Month"];
const SEV_OPT  = ["All", "Critical", "Warning", "Info"];

export default function AuditLogs({ userRole = "SUPER_ADMIN" }) {
  const [search, setSearch]     = useState("");
  const [dateFilter, setDate]   = useState("This Month");
  const [sevFilter, setSev]     = useState("All");
  const [actorFilter, setActor] = useState("All");
  const [activeTab, setTab]     = useState("all");
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const { data: stats } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const rawLogs = data?.data?.logs || data?.logs || [];
  const logs = rawLogs.length ? rawLogs : MOCK_LOGS;

  // Build actor options from returned logs for the current query (or keep "All" only when loading)
  const actorOptions = [
    "All",
    ...Array.from(new Set(logs.map(l => l.actor))),
  ];

  const rawStats = stats?.data || stats || null;
  const s = rawStats ?? MOCK_AUDIT_STATS;
  const statCards = [
    { label: "Total Events",    value: s.total        != null ? String(s.total)        : "—", color: "blue"   },
    { label: "Security Events", value: s.security     != null ? String(s.security)     : "—", color: "red"    },
    { label: "System Changes",  value: s.system       != null ? String(s.system)       : "—", color: "violet" },
    { label: "User Actions",    value: s.userActions  != null ? String(s.userActions)  : "—", color: "green"  },
  ];

  async function handleExport() {
    try {
      const response = await exportAuditLogs();
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-logs.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  }

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Audit Logs"
        sub="Track all system events and user actions"
        action={
          userRole === "SUPER_ADMIN" && (
            <Button
              leftSection={<IconDownload size={14} />}
              color="blue"
              size="sm"
              onClick={handleExport}
            >
              Export CSV
            </Button>
          )
        }
      />

      {userRole !== "SUPER_ADMIN" && (
        <Paper p="sm" radius="md" bg="yellow.0" style={{ border: "1px solid var(--mantine-color-yellow-3)" }}>
          <Text size="sm" c="yellow.8" fw={500}>View Only — Security logs restricted to Super Admin.</Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {statCards.map(s => (
          <AppStatCard key={s.label} label={s.label} value={s.value} color={s.color} />
        ))}
      </SimpleGrid>

      <Paper radius="lg" withBorder>
        <Tabs value={activeTab} onChange={setTab}>
          <Tabs.List px="md" pt="xs">
            <Tabs.Tab value="all">All Logs</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
            <Tabs.Tab value="system">System</Tabs.Tab>
            <Tabs.Tab value="user-actions">User Actions</Tabs.Tab>
          </Tabs.List>

          <Group p="md" gap="sm" wrap="wrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <TextInput
              placeholder="Search actions or actors…"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
              size="sm"
            />
            <Select
              data={DATE_OPT}
              value={dateFilter}
              onChange={v => setDate(v)}
              size="sm"
              w={140}
            />
            <Select
              data={actorOptions.map(a => ({ value: a, label: a === "All" ? "All Users" : a.split("@")[0] }))}
              value={actorFilter}
              onChange={v => setActor(v)}
              size="sm"
              w={160}
            />
            <Select
              data={SEV_OPT.map(s => ({ value: s, label: s === "All" ? "All Severity" : s }))}
              value={sevFilter}
              onChange={v => setSev(v)}
              size="sm"
              w={130}
            />
          </Group>

          <Tabs.Panel value={activeTab}>
            {isLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <ScrollArea>
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 700 }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={32} />
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">Timestamp</Text></Table.Th>
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">Actor</Text></Table.Th>
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">Action</Text></Table.Th>
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">Module</Text></Table.Th>
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">IP</Text></Table.Th>
                      <Table.Th><Text size="xs" fw={600} c="dimmed" tt="uppercase">Severity</Text></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {logs.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <AppEmptyState
                            icon={<IconClipboardList size={24} />}
                            message="No log entries"
                            sub="No log entries match your filters."
                          />
                        </Table.Td>
                      </Table.Tr>
                    ) : logs.map(log => (
                      <>
                        <Table.Tr
                          key={log.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        >
                          <Table.Td c="dimmed">
                            {expanded === log.id
                              ? <IconChevronDown size={14} />
                              : <IconChevronRight size={14} />}
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{log.ts}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{log.actor}</Text>
                          </Table.Td>
                          <Table.Td style={{ maxWidth: 260 }}>
                            <Text size="sm">{log.action}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={5} wrap="nowrap">
                              <Text size="xs" c="dimmed">{MOD_ICON[log.module]}</Text>
                              <Text size="xs" c="dimmed">{log.module}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed" ff="monospace">{log.ip}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={SEV_COLOR[log.sev]} variant="light" radius="xl" size="sm">
                              {log.sev}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                        {expanded === log.id && (
                          <Table.Tr key={`${log.id}-detail`}>
                            <Table.Td colSpan={7} bg="gray.0">
                              <Paper p="sm" radius="md" withBorder my={4}>
                                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Event Details</Text>
                                <Text size="xs" ff="monospace" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {JSON.stringify(log.detail, null, 2)}
                                </Text>
                              </Paper>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
