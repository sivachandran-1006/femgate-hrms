import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, TextInput,
  Select, Tabs, Table, ScrollArea, SimpleGrid,
} from "@mantine/core";
import {
  IconShield, IconSettings, IconUser, IconSearch, IconDownload,
  IconChevronDown, IconChevronRight,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";

const SEV_COLOR = { Critical: "red", Warning: "yellow", Info: "blue" };

const MOD_ICON = {
  Security:     <IconShield size={13} />,
  System:       <IconSettings size={13} />,
  "User Actions": <IconUser size={13} />,
};

const LOGS = [
  { id:1,  ts:"2026-06-09 09:14", actor:"superadmin@mgatesystems.com", action:"Login failed — 3 attempts",              module:"Security",     ip:"203.0.113.12", sev:"Critical", detail:{ event:"brute_force",  attempts:3, blocked:true } },
  { id:2,  ts:"2026-06-09 08:30", actor:"finance@mgatesystems.com",    action:"Payroll approved for May 2026",           module:"System",       ip:"10.0.1.22",    sev:"Info",     detail:{ payroll_id:"PAY-2026-05", total:485000, employees:12 } },
  { id:3,  ts:"2026-06-08 07:45", actor:"admin@mgatesystems.com",      action:"Role permissions updated: HR",            module:"System",       ip:"10.0.1.15",    sev:"Warning",  detail:{ role:"HR", added:["edit_employees","export_reports"] } },
  { id:4,  ts:"2026-06-08 16:20", actor:"admin@mgatesystems.com",      action:"Employee record deleted: EMP-009",        module:"User Actions", ip:"10.0.1.15",    sev:"Warning",  detail:{ employee_id:"EMP-009", reason:"Resigned" } },
  { id:5,  ts:"2026-06-08 15:10", actor:"admin@mgatesystems.com",      action:"New user created: kavitha@mgatesystems.com", module:"User Actions",ip:"10.0.1.15", sev:"Info",     detail:{ user_id:12, role:"HR" } },
  { id:6,  ts:"2026-06-07 14:00", actor:"superadmin@mgatesystems.com", action:"MFA enabled globally",                    module:"Security",     ip:"203.0.113.12", sev:"Critical", detail:{ policy:"mfa_enforcement", before:"optional", after:"required" } },
  { id:7,  ts:"2026-06-07 12:30", actor:"hr@mgatesystems.com",         action:"Leave approved: Priya Sharma",            module:"User Actions", ip:"10.0.1.18",    sev:"Info",     detail:{ leave_id:"LV-045", days:3, type:"Annual" } },
  { id:8,  ts:"2026-06-07 11:15", actor:"itadmin@mgatesystems.com",    action:"System backup initiated",                 module:"System",       ip:"10.0.1.30",    sev:"Info",     detail:{ backup_id:"BKP-20260607", size:"2.3 GB" } },
  { id:9,  ts:"2026-06-06 10:05", actor:"superadmin@mgatesystems.com", action:"Integration disconnected: SAP",           module:"System",       ip:"203.0.113.12", sev:"Warning",  detail:{ integration:"SAP", reason:"API key expired" } },
  { id:10, ts:"2026-06-06 09:00", actor:"finance@mgatesystems.com",    action:"Invoice downloaded: INV-2026-005",        module:"User Actions", ip:"10.0.1.22",    sev:"Info",     detail:{ invoice_id:"INV-2026-005", amount:45000 } },
  { id:11, ts:"2026-06-05 17:40", actor:"admin@mgatesystems.com",      action:"Password reset: mani@mgatesystems.com",  module:"User Actions", ip:"10.0.1.15",    sev:"Info",     detail:{ user:"mani@mgatesystems.com", method:"email_link" } },
  { id:12, ts:"2026-06-05 16:20", actor:"superadmin@mgatesystems.com", action:"Suspicious login from new country: US",  module:"Security",     ip:"198.51.100.5", sev:"Critical", detail:{ country:"US", previous:"IN", blocked:false } },
  { id:13, ts:"2026-06-04 14:00", actor:"hr@mgatesystems.com",         action:"Bulk employee import: 3 records",         module:"System",       ip:"10.0.1.18",    sev:"Info",     detail:{ records:3, source:"CSV" } },
  { id:14, ts:"2026-06-04 12:30", actor:"manager@mgatesystems.com",    action:"Performance review submitted: Arjun",     module:"User Actions", ip:"10.0.1.20",    sev:"Info",     detail:{ review_id:"REV-034", rating:4.2 } },
  { id:15, ts:"2026-06-04 11:00", actor:"itadmin@mgatesystems.com",    action:"API rate limit exceeded",                 module:"Security",     ip:"10.0.1.30",    sev:"Warning",  detail:{ endpoint:"/api/employees", actual:1243 } },
  { id:16, ts:"2026-06-03 09:45", actor:"admin@mgatesystems.com",      action:"User suspended: mani@mgatesystems.com",  module:"User Actions", ip:"10.0.1.15",    sev:"Warning",  detail:{ reason:"Policy violation" } },
  { id:17, ts:"2026-06-02 16:10", actor:"finance@mgatesystems.com",    action:"Tax report exported: FY 2025-26",         module:"User Actions", ip:"10.0.1.22",    sev:"Info",     detail:{ format:"PDF", size:"1.2 MB" } },
  { id:18, ts:"2026-06-02 14:00", actor:"superadmin@mgatesystems.com", action:"New tenant created: SynEx Systems",      module:"System",       ip:"203.0.113.12", sev:"Warning",  detail:{ company:"SynEx Systems", plan:"Starter" } },
  { id:19, ts:"2026-06-01 11:30", actor:"admin@mgatesystems.com",      action:"Email template updated: leave_approval", module:"System",       ip:"10.0.1.15",    sev:"Info",     detail:{ template:"leave_approval", fields:["subject","body"] } },
  { id:20, ts:"2026-06-01 09:00", actor:"superadmin@mgatesystems.com", action:"Session timeout changed: 30 min",        module:"Security",     ip:"203.0.113.12", sev:"Warning",  detail:{ before:"60", after:"30", unit:"minutes" } },
];

const DATE_OPT  = ["All Time","Today","This Week","This Month"];
const SEV_OPT   = ["All","Critical","Warning","Info"];
const ACTOR_OPT = ["All", ...Array.from(new Set(LOGS.map(l => l.actor)))];

const todayPfx  = "2026-06-09";
const weekPfxs  = ["2026-06-09","2026-06-08","2026-06-07","2026-06-06","2026-06-05","2026-06-04","2026-06-03"];
const monthPfxs = [...weekPfxs,"2026-06-02","2026-06-01"];

export default function AuditLogs({ userRole = "SUPER_ADMIN" }) {
  const [search, setSearch]       = useState("");
  const [dateFilter, setDate]     = useState("This Month");
  const [sevFilter, setSev]       = useState("All");
  const [actorFilter, setActor]   = useState("All");
  const [activeTab, setTab]       = useState("all");
  const [expanded, setExpanded]   = useState(null);

  const visibleLogs = userRole === "SUPER_ADMIN" ? LOGS : LOGS.filter(l => l.module !== "Security");

  const filtered = visibleLogs.filter(l => {
    const tabOk   = activeTab === "all" || l.module.toLowerCase().replace(" ", "-") === activeTab;
    const sevOk   = sevFilter === "All" || l.sev === sevFilter;
    const actorOk = actorFilter === "All" || l.actor === actorFilter;
    const q       = search.toLowerCase();
    const searchOk = !q || l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q);
    const dateOk  = dateFilter === "All Time"
      || (dateFilter === "Today"      && l.ts.startsWith(todayPfx))
      || (dateFilter === "This Week"  && weekPfxs.some(p => l.ts.startsWith(p)))
      || (dateFilter === "This Month" && monthPfxs.some(p => l.ts.startsWith(p)));
    return tabOk && sevOk && actorOk && searchOk && dateOk;
  });

  const stats = [
    { label:"Total Events",    value:"248",  color:"blue"   },
    { label:"Security Events", value:String(LOGS.filter(l=>l.module==="Security").length),     color:"red"    },
    { label:"System Changes",  value:String(LOGS.filter(l=>l.module==="System").length),       color:"violet" },
    { label:"User Actions",    value:String(LOGS.filter(l=>l.module==="User Actions").length), color:"green"  },
  ];

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Audit Logs"
        sub="Track all system events and user actions"
        action={
          userRole === "SUPER_ADMIN" && (
            <Button leftSection={<IconDownload size={14} />} color="blue" size="sm">
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
        {stats.map(s => (
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
              data={ACTOR_OPT.map(a => ({ value: a, label: a === "All" ? "All Users" : a.split("@")[0] }))}
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
                  {filtered.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text ta="center" py="xl" c="dimmed" size="sm">No log entries match your filters.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : filtered.map(log => (
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
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
