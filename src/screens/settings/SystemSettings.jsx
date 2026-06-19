import { useState, useEffect } from "react";
import {
  Group, SimpleGrid, Text, Tabs, Stack, Box, Loader, TextInput, NumberInput, Switch, Select,
  Paper, ThemeIcon, ScrollArea, Table, Badge, Divider,
} from "@mantine/core";
import {
  IconBuilding, IconUser, IconClock, IconCalendarOff, IconCash, IconBell, IconShieldLock,
  IconRouteSquare, IconPlug, IconSettings, IconSearch, IconDeviceFloppy, IconClipboardList,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useToast }      from "../../components/ui/Toast";
import { useAllSettings, useSaveSettings, useSettingsAudit } from "../../queries/useSettings";

// field schema per group — drives the forms
const FIELD_DEFS = {
  employee: [
    { key: "idFormat", label: "Employee ID Format", type: "text" },
    { key: "autoCreate", label: "Auto Employee Creation", type: "switch" },
    { key: "profileCompletionTarget", label: "Profile Completion Target %", type: "number" },
    { key: "probationMonths", label: "Probation Period (months)", type: "number" },
    { key: "retirementAge", label: "Retirement Age", type: "number" },
  ],
  attendance: [
    { key: "officeStart", label: "Office Start Time", type: "text" },
    { key: "officeEnd", label: "Office End Time", type: "text" },
    { key: "graceMinutes", label: "Grace Time (minutes)", type: "number" },
    { key: "halfDayHours", label: "Half Day Hours", type: "number" },
    { key: "overtimeAfter", label: "Overtime After (hours)", type: "number" },
    { key: "wfhAllowed", label: "Work From Home Allowed", type: "switch" },
    { key: "geoFencing", label: "Geo Fencing", type: "switch" },
    { key: "biometric", label: "Biometric Integration", type: "switch" },
  ],
  leave: [
    { key: "leaveYear", label: "Leave Year", type: "select", options: ["Calendar", "Financial"] },
    { key: "accrual", label: "Leave Accrual", type: "select", options: ["Monthly", "Quarterly", "Yearly"] },
    { key: "carryForward", label: "Carry Forward", type: "switch" },
    { key: "carryForwardMax", label: "Max Carry Forward (days)", type: "number" },
    { key: "encashment", label: "Encashment", type: "switch" },
    { key: "approvalWorkflow", label: "Approval Workflow", type: "text" },
    { key: "maxConsecutive", label: "Max Consecutive Leave (days)", type: "number" },
  ],
  payroll: [
    { key: "cycle", label: "Payroll Cycle", type: "select", options: ["Monthly", "Bi-Weekly", "Weekly"] },
    { key: "processingDate", label: "Salary Processing Date", type: "number" },
    { key: "pfPercent", label: "PF % (of basic)", type: "number" },
    { key: "esiPercent", label: "ESI %", type: "number" },
    { key: "professionalTax", label: "Professional Tax (₹)", type: "number" },
    { key: "tdsEnabled", label: "TDS Rules Enabled", type: "switch" },
    { key: "payslipTemplate", label: "Payslip Template", type: "select", options: ["Default", "Detailed", "Compact"] },
  ],
  workflow: [
    { key: "leaveApproval", label: "Leave Approval Flow", type: "text" },
    { key: "attendanceApproval", label: "Attendance Approval Flow", type: "text" },
    { key: "expenseApproval", label: "Expense Approval Flow", type: "text" },
    { key: "assetApproval", label: "Asset Approval Flow", type: "text" },
    { key: "recruitmentApproval", label: "Recruitment Approval Flow", type: "text" },
  ],
  holiday: [
    { key: "regionalHolidays", label: "Regional Holidays", type: "switch" },
    { key: "branchHolidays", label: "Branch Holidays", type: "switch" },
    { key: "restrictedHolidays", label: "Restricted Holidays (count)", type: "number" },
  ],
  roles: [
    { key: "defaultRole", label: "Default Role", type: "select", options: ["EMPLOYEE", "MANAGER", "HR"] },
    { key: "autoAssignByDept", label: "Auto-assign Role by Department", type: "switch" },
  ],
  organization: [
    { key: "enforceReportingHierarchy", label: "Enforce Reporting Hierarchy", type: "switch" },
    { key: "allowCrossDeptManager", label: "Allow Cross-Department Manager", type: "switch" },
  ],
  maintenance: [
    { key: "backupFrequency", label: "Backup Frequency", type: "select", options: ["Daily", "Weekly", "Monthly"] },
    { key: "dataRetentionMonths", label: "Data Retention (months)", type: "number" },
    { key: "auditRetentionMonths", label: "Audit Retention (months)", type: "number" },
    { key: "archiveEnabled", label: "Archiving Enabled", type: "switch" },
  ],
};

const GROUPS = [
  { key: "employee", label: "Employee", icon: IconUser, color: "blue" },
  { key: "attendance", label: "Attendance", icon: IconClock, color: "cyan" },
  { key: "leave", label: "Leave", icon: IconCalendarOff, color: "yellow" },
  { key: "payroll", label: "Payroll", icon: IconCash, color: "teal" },
  { key: "workflow", label: "Workflow", icon: IconRouteSquare, color: "grape" },
  { key: "holiday", label: "Holiday", icon: IconCalendarOff, color: "orange" },
  { key: "roles", label: "Roles", icon: IconShieldLock, color: "indigo" },
  { key: "organization", label: "Organization", icon: IconBuilding, color: "blue" },
  { key: "maintenance", label: "Maintenance", icon: IconSettings, color: "gray" },
];

function GroupForm({ group, settings }) {
  const { show: toast } = useToast();
  const saveMut = useSaveSettings();
  const [form, setForm] = useState({});
  useEffect(() => { setForm(settings || {}); }, [settings, group]);

  const fields = FIELD_DEFS[group] || [];
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const save = async () => {
    try { await saveMut.mutateAsync({ group, data: form }); toast("Settings saved", "success"); }
    catch (e) { toast(e?.response?.data?.message || "Failed to save", "error"); }
  };
  const reset = () => setForm(settings || {});

  return (
    <AppSection title={`${GROUPS.find((g) => g.key === group)?.label} Settings`}
      action={<Group gap="sm"><AppButton variant="default" onClick={reset}>Reset</AppButton><AppButton leftSection={<IconDeviceFloppy size={16} />} loading={saveMut.isPending} onClick={save}>Save</AppButton></Group>}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {fields.map((f) => {
          if (f.type === "switch") return <Switch key={f.key} label={f.label} checked={!!form[f.key]} onChange={(e) => set(f.key, e.currentTarget.checked)} />;
          if (f.type === "number") return <NumberInput key={f.key} label={f.label} value={form[f.key] ?? 0} onChange={(v) => set(f.key, v)} />;
          if (f.type === "select") return <Select key={f.key} label={f.label} data={f.options} value={form[f.key] ?? f.options[0]} onChange={(v) => set(f.key, v)} />;
          return <TextInput key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />;
        })}
      </SimpleGrid>
    </AppSection>
  );
}

function AuditTab() {
  const { data: logs = [] } = useSettingsAudit();
  const fmt = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  return (
    <AppSection noPadding title="Settings Audit Logs" sub={`${logs.length} events`}>
      <ScrollArea>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead><Table.Tr>{["Action", "Group", "Details", "By", "When"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
          <Table.Tbody>
            {logs.length === 0 ? <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No settings changes logged yet" /></Table.Td></Table.Tr>
              : logs.map((l) => (
                <Table.Tr key={l.id}>
                  <Table.Td><Badge variant="light" radius="xl">{l.action}</Badge></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{l.groupKey || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{l.details || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{l.actorName || "System"}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{fmt(l.createdAt)}</Text></Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </AppSection>
  );
}

export default function SystemSettings({ darkMode }) {
  const { data: settings, isLoading } = useAllSettings();
  const [active, setActive] = useState(null);   // null = dashboard view
  const [search, setSearch] = useState("");

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;

  const filteredGroups = GROUPS.filter((g) => !search || g.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <AppPageHeader title="System Configuration" sub="Configure HRPLUSE for your company policies and workflows" />

      <Tabs value={active === null ? "dashboard" : active} onChange={(v) => setActive(v === "dashboard" ? null : v)}>
        <Tabs.List mb="lg" style={{ flexWrap: "wrap" }}>
          <Tabs.Tab value="dashboard" leftSection={<IconSettings size={15} />}>Overview</Tabs.Tab>
          {GROUPS.map((g) => <Tabs.Tab key={g.key} value={g.key} leftSection={<g.icon size={15} />}>{g.label}</Tabs.Tab>)}
          <Tabs.Tab value="audit" leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard">
          <TextInput placeholder="Search settings…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" mb="md" style={{ maxWidth: 320 }} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
            {filteredGroups.map((g) => (
              <Paper key={g.key} withBorder radius="lg" p="lg" style={{ cursor: "pointer" }} onClick={() => setActive(g.key)}>
                <Group gap="md" wrap="nowrap">
                  <ThemeIcon size={44} radius="md" variant="light" color={g.color}><g.icon size={22} /></ThemeIcon>
                  <div>
                    <Text fw={700}>{g.label} Settings</Text>
                    <Text size="xs" c="dimmed">{(FIELD_DEFS[g.key] || []).length} options</Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
          {filteredGroups.length === 0 && <AppEmptyState message="No settings match your search." py={60} />}
          <Divider my="lg" />
          <Text size="xs" c="dimmed">Tip: Company branding, Email Templates, Notification channels, Security policies and Integrations are managed in their dedicated Super Admin screens (Company Settings, Notification Center, Security Center, Integrations).</Text>
        </Tabs.Panel>

        {GROUPS.map((g) => (
          <Tabs.Panel key={g.key} value={g.key}>
            <GroupForm group={g.key} settings={settings?.[g.key]} />
          </Tabs.Panel>
        ))}

        <Tabs.Panel value="audit"><AuditTab /></Tabs.Panel>
      </Tabs>
    </>
  );
}
