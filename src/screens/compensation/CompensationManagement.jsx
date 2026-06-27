import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Loader, Center, NumberInput,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
} from "recharts";
import {
  IconCoin, IconTrendingUp, IconGift, IconChartBar, IconArrowUpRight,
  IconScale, IconReportMoney, IconPlus, IconTrash, IconCheck, IconX, IconCash,
  IconDownload, IconWorld, IconWallet, IconHistory,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { topSlices } from "../dashboard/components/DashboardKit";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useDesignations } from "../../queries/useDesignations";
import {
  useCompDashboard, useCompAnalytics,
  useBands, useCreateBand, useDeleteBand,
  useRevisions, useCreateRevision, useUpdateRevisionStatus,
  useBonuses, useCreateBonus, useUpdateBonusStatus,
  useVariablePay, useCreateVariablePay, useUpdateVariablePayStatus,
  usePromotions, useCreatePromotion, useUpdatePromotionStatus,
  useBenchmarking, useBudget, useCompHistory,
} from "../../queries/useCompensation";

const CHART_COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2", "#fd7014", "#15aabf"];

// CSV export helper — turns an array of rows into a downloaded CSV file
const exportCSV = (filename, rows) => {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const GRADES = ["Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "Custom Grade"];
const REVISION_TYPES = ["Annual Increment", "Promotion Increment", "Special Increment", "Retention Increment"];
const CYCLES = ["Annual", "Half-Yearly", "Quarterly", "Promotion Based", "Custom"];
const BONUS_TYPES = ["Performance Bonus", "Festival Bonus", "Project Bonus", "Referral Bonus", "Retention Bonus", "Custom Bonus"];
const VARPAY_TYPES = ["Performance Linked Incentive", "Sales Incentive", "Quarterly Incentive", "Annual Incentive", "Project Incentive"];
const STATUS_COLOR = {
  Pending: "orange", "HR Approved": "blue", "Finance Approved": "cyan", Approved: "green", Rejected: "red",
  Released: "teal", Paid: "teal",
};
const money = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// Pickers with fallback (memory rule)
const useEmployeeOptions = () => {
  const { data: employees = [] } = useFetchAllEmployees();
  return (employees || []).map((e) => ({ value: e.name, label: e.employeeId ? `${e.name} (${e.employeeId})` : e.name }));
};
const useDesignationOptions = () => {
  const { data: desigs = [] } = useDesignations();
  const { data: employees = [] } = useFetchAllEmployees();
  const fromApi = (desigs || []).map((d) => d.name).filter(Boolean);
  if (fromApi.length) return fromApi;
  return [...new Set((employees || []).map((e) => e.designation).filter(Boolean))];
};
const useEmployeeMap = () => {
  const { data: employees = [] } = useFetchAllEmployees();
  return Object.fromEntries((employees || []).map((e) => [e.name, e]));
};

function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}><Icon size={18} color={`var(--mantine-color-${color}-6)`} /></Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ═══ Dashboard ═══
function DashboardTab() {
  const { data: d, isLoading } = useCompDashboard();
  const { data: an } = useCompAnalytics();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  const a = an || {};
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Kpi label="Employees" value={dash.employeesUnderComp} icon={IconCoin} color="blue" sub="under compensation" />
        <Kpi label="Pending Revisions" value={dash.pendingRevisions} icon={IconScale} color="orange" />
        <Kpi label="Approved Revisions" value={dash.approvedRevisions} icon={IconCheck} color="green" />
        <Kpi label="Increment Cycle" value={dash.upcomingIncrementCycle} icon={IconTrendingUp} color="grape" />
        <Kpi label="Average Salary" value={money(dash.averageSalary)} icon={IconCash} color="teal" />
        <Kpi label="Bonus Budget" value={money(dash.bonusBudget)} icon={IconGift} color="pink" />
        <Kpi label="Variable Pay" value={money(dash.variablePayBudget)} icon={IconReportMoney} color="indigo" sub="budget" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Salary Distribution</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={a.salaryDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><RTooltip />
              <Bar dataKey="value" fill="#228be6" radius={[4, 4, 0, 0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Department Salary Cost</Text>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={topSlices(a.departmentCost || [], "value", 5, "name")} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} label={(e) => e.name}>
                {topSlices(a.departmentCost || [], "value", 5, "name").map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={(v) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Annual Increment Trend</Text>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={a.incrementTrend || []}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><RTooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="value" stroke="#40c057" strokeWidth={2} name="Avg Increment %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Bonus Distribution</Text>
          {(a.bonusDistribution || []).length === 0
            ? <AppEmptyState icon={<IconGift size={24} />} message="No bonus data yet" sub="Bonus distribution by type will show here." py={40} />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={a.bonusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>
                    {a.bonusDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RTooltip formatter={(v) => money(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

// ═══ Market Benchmarking ═══
function BenchmarkingTab() {
  const { data: rows = [], isLoading } = useBenchmarking();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const posColor = { "At/Above Market": "green", "Near Market": "orange", "Below Market": "red" };
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button variant="default" size="sm" leftSection={<IconDownload size={14} />} onClick={() => exportCSV("market-benchmarking.csv", rows)}>Export CSV</Button></Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Designation</Table.Th><Table.Th>Internal Avg</Table.Th><Table.Th>Market Avg</Table.Th><Table.Th>Gap</Table.Th><Table.Th>Position</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {rows.length === 0 && <Table.Tr><Table.Td colSpan={5}><AppEmptyState icon={<IconWorld size={24} />} message="No benchmarking data" sub="Add employees with designations & salaries to compare against the market." /></Table.Td></Table.Tr>}
          {rows.map((r, i) => (
            <Table.Tr key={i}>
              <Table.Td fw={500}>{r.designation}</Table.Td>
              <Table.Td>{money(r.internalAvg)}</Table.Td>
              <Table.Td>{money(r.marketAvg)}</Table.Td>
              <Table.Td><Badge color={r.gapPct >= 0 ? "green" : "red"} variant="light">{r.gapPct}%</Badge></Table.Td>
              <Table.Td><Badge color={posColor[r.position] || "gray"} variant="light">{r.position}</Badge></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

// ═══ Budget Planning ═══
function BudgetTab() {
  const { data: b, isLoading } = useBudget();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const data = b || {};
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Kpi label="Salary Budget" value={money(data.salaryBudget)} icon={IconWallet} color="blue" />
        <Kpi label="Bonus Budget" value={money(data.bonusBudget)} icon={IconGift} color="pink" />
        <Kpi label="Increment Budget" value={money(data.incrementBudget)} icon={IconTrendingUp} color="grape" />
      </SimpleGrid>
      <Card withBorder radius="md" p="md">
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Department Budget vs Actual</Text>
          <Button variant="default" size="xs" leftSection={<IconDownload size={14} />} onClick={() => exportCSV("budget.csv", data.departments || [])}>Export CSV</Button>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead><Table.Tr><Table.Th>Department</Table.Th><Table.Th>Budget</Table.Th><Table.Th>Actual Spend</Table.Th><Table.Th>Utilization</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>
            {(data.departments || []).length === 0 && <Table.Tr><Table.Td colSpan={4}><AppEmptyState icon={<IconWallet size={24} />} message="No budget data" sub="Department salary budgets will appear here." /></Table.Td></Table.Tr>}
            {(data.departments || []).map((d, i) => (
              <Table.Tr key={i}>
                <Table.Td fw={500}>{d.department}</Table.Td>
                <Table.Td>{money(d.salaryBudget)}</Table.Td>
                <Table.Td>{money(d.actualSpend)}</Table.Td>
                <Table.Td><Badge color={d.utilizationPct > 95 ? "red" : d.utilizationPct > 85 ? "orange" : "green"} variant="light">{d.utilizationPct}%</Badge></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

// ═══ Employee Compensation History ═══
function HistoryTab() {
  const empOptions = useEmployeeOptions();
  const [employee, setEmployee] = useState("");
  const { data: h, isLoading } = useCompHistory(employee);
  return (
    <Stack gap="md">
      <Select label="Select Employee" placeholder="Choose an employee to view history" searchable w={360} data={empOptions} value={employee} onChange={setEmployee} nothingFoundMessage="No employee found" />
      {!employee && <AppEmptyState icon={<IconHistory size={24} />} message="Select an employee" sub="View their salary, increment, bonus and promotion history." />}
      {employee && isLoading && <Center h={150}><Loader /></Center>}
      {employee && !isLoading && h && (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Card withBorder radius="md" p="md">
            <Group gap="xs" mb="sm"><IconScale size={16} /><Text fw={600}>Salary / Increment</Text></Group>
            {(h.revisions || []).length === 0 ? <Text size="xs" c="dimmed">No revisions</Text> : h.revisions.map((r) => (
              <Box key={r.id} mb="xs"><Text size="sm">{money(r.currentSalary)} → {money(r.revisedSalary)} <Badge size="xs" color="green" variant="light">{r.incrementPct}%</Badge></Text><Text size="xs" c="dimmed">{r.type} · {fmtDate(r.effectiveDate)}</Text></Box>
            ))}
          </Card>
          <Card withBorder radius="md" p="md">
            <Group gap="xs" mb="sm"><IconGift size={16} /><Text fw={600}>Bonus History</Text></Group>
            {(h.bonuses || []).length === 0 ? <Text size="xs" c="dimmed">No bonuses</Text> : h.bonuses.map((b) => (
              <Box key={b.id} mb="xs"><Text size="sm">{money(b.amount)} <Badge size="xs" variant="light">{b.type}</Badge></Text><Text size="xs" c="dimmed">{b.status}</Text></Box>
            ))}
          </Card>
          <Card withBorder radius="md" p="md">
            <Group gap="xs" mb="sm"><IconArrowUpRight size={16} /><Text fw={600}>Promotion History</Text></Group>
            {(h.promotions || []).length === 0 ? <Text size="xs" c="dimmed">No promotions</Text> : h.promotions.map((p) => (
              <Box key={p.id} mb="xs"><Text size="sm">{p.currentDesignation || "—"} → {p.newDesignation}</Text><Text size="xs" c="dimmed">{fmtDate(p.promotionDate)} · {p.status}</Text></Box>
            ))}
          </Card>
        </SimpleGrid>
      )}
    </Stack>
  );
}

// ═══ Salary Revisions ═══
function RevisionsTab({ canManage }) {
  const { show } = useToast();
  const { data: revisions = [], isLoading } = useRevisions();
  const create = useCreateRevision();
  const review = useUpdateRevisionStatus();
  const empOptions = useEmployeeOptions();
  const empMap = useEmployeeMap();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", currentSalary: "", revisedSalary: "", type: REVISION_TYPES[0], cycle: CYCLES[0], effectiveDate: "", reason: "", remarks: "" });

  const pickEmployee = (name) => {
    const e = empMap[name];
    setForm((f) => ({ ...f, employee: name, currentSalary: e?.salary ?? f.currentSalary, department: e?.department }));
  };
  const incPct = form.currentSalary > 0 && form.revisedSalary ? Math.round(((form.revisedSalary - form.currentSalary) / form.currentSalary) * 1000) / 10 : null;

  const submit = async () => {
    if (!form.employee || !form.currentSalary || !form.revisedSalary) return show("Employee, current and revised salary are required", "error");
    try { await create.mutateAsync({ ...form, employeeId: empMap[form.employee]?.id }); show("Revision created", "success"); setOpen(false); setForm({ employee: "", currentSalary: "", revisedSalary: "", type: REVISION_TYPES[0], cycle: CYCLES[0], effectiveDate: "", reason: "", remarks: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button variant="default" size="sm" leftSection={<IconDownload size={14} />} disabled={!revisions.length}
          onClick={() => exportCSV("salary-revisions.csv", revisions.map((r) => ({ employee: r.employee, currentSalary: r.currentSalary, revisedSalary: r.revisedSalary, incrementPct: r.incrementPct, type: r.type, effectiveDate: r.effectiveDate, status: r.status })))}>Export CSV</Button>
        {canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>New Revision</Button>}
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Current</Table.Th><Table.Th>Revised</Table.Th><Table.Th>Increment</Table.Th><Table.Th>Type</Table.Th><Table.Th>Effective</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {revisions.length === 0 && <Table.Tr><Table.Td colSpan={8}><AppEmptyState icon={<IconScale size={24} />} message="No salary revisions yet" sub={canManage ? "Create a salary revision to start a compensation cycle." : "Your salary revision history will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>New Revision</Button>} /></Table.Td></Table.Tr>}
          {revisions.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td fw={500}>{r.employee}</Table.Td>
              <Table.Td>{money(r.currentSalary)}</Table.Td>
              <Table.Td fw={600}>{money(r.revisedSalary)}</Table.Td>
              <Table.Td><Badge color={r.incrementPct >= 0 ? "green" : "red"} variant="light">{r.incrementPct}%</Badge></Table.Td>
              <Table.Td><Text size="xs">{r.type}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(r.effectiveDate)}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[r.status] || "gray"} variant="light">{r.status}</Badge></Table.Td>
              <Table.Td>{canManage && r.status === "Pending" && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: r.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: r.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="New Salary Revision" size="md">
        <Stack gap="sm">
          <Select label="Employee" required placeholder="Select employee" searchable data={empOptions} value={form.employee} onChange={pickEmployee} nothingFoundMessage="No employee found" />
          <Group grow>
            <NumberInput label="Current Salary (₹)" required min={0} value={form.currentSalary} onChange={(v) => setForm({ ...form, currentSalary: v })} />
            <NumberInput label="Revised Salary (₹)" required min={0} value={form.revisedSalary} onChange={(v) => setForm({ ...form, revisedSalary: v })} />
          </Group>
          {incPct != null && <Text size="xs" c={incPct >= 0 ? "green" : "red"} fw={600}>Increment: {incPct}%</Text>}
          <Group grow>
            <Select label="Type" data={REVISION_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
            <Select label="Cycle" data={CYCLES} value={form.cycle} onChange={(v) => setForm({ ...form, cycle: v })} />
          </Group>
          <TextInput type="date" label="Effective Date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
          <Textarea label="Reason" minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Generic award tab (Bonuses / Variable Pay) ═══
function AwardTab({ canManage, kind }) {
  const { show } = useToast();
  const cfg = kind === "bonus"
    ? { data: useBonuses, create: useCreateBonus, review: useUpdateBonusStatus, types: BONUS_TYPES, title: "Bonus", icon: IconGift, releaseLabel: "Released" }
    : { data: useVariablePay, create: useCreateVariablePay, review: useUpdateVariablePayStatus, types: VARPAY_TYPES, title: "Variable Pay", icon: IconReportMoney, releaseLabel: "Paid" };
  const { data: items = [], isLoading } = cfg.data();
  const create = cfg.create();
  const review = cfg.review();
  const empOptions = useEmployeeOptions();
  const empMap = useEmployeeMap();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", type: cfg.types[0], amount: "", reason: "", period: "" });

  const submit = async () => {
    if (!form.employee || !form.amount) return show("Employee and amount are required", "error");
    try { await create.mutateAsync({ ...form, employeeId: empMap[form.employee]?.id }); show(`${cfg.title} created`, "success"); setOpen(false); setForm({ employee: "", type: cfg.types[0], amount: "", reason: "", period: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>New {cfg.title}</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Type</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {items.length === 0 && <Table.Tr><Table.Td colSpan={5}><AppEmptyState icon={<cfg.icon size={24} />} message={`No ${cfg.title.toLowerCase()} records`} sub={canManage ? `Create a ${cfg.title.toLowerCase()} entry.` : `Your ${cfg.title.toLowerCase()} will appear here.`} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>New {cfg.title}</Button>} /></Table.Td></Table.Tr>}
          {items.map((it) => (
            <Table.Tr key={it.id}>
              <Table.Td fw={500}>{it.employee}</Table.Td>
              <Table.Td><Badge size="xs" variant="light">{it.type}</Badge></Table.Td>
              <Table.Td fw={600}>{money(it.amount)}</Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[it.status] || "gray"} variant="light">{it.status}</Badge></Table.Td>
              <Table.Td>{canManage && it.status === "Pending" && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: it.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: it.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}
              {canManage && it.status === "Approved" && <Button size="compact-xs" variant="light" color="teal" onClick={async () => { await review.mutateAsync({ id: it.id, status: cfg.releaseLabel }); show(cfg.releaseLabel, "success"); }}>{cfg.releaseLabel}</Button>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title={`New ${cfg.title}`} size="md">
        <Stack gap="sm">
          <Select label="Employee" required placeholder="Select employee" searchable data={empOptions} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} nothingFoundMessage="No employee found" />
          <Select label="Type" data={cfg.types} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <NumberInput label="Amount (₹)" required min={0} value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          {kind === "bonus"
            ? <Textarea label="Reason" minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            : <TextInput label="Period" placeholder="Q1 2026" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />}
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Promotions ═══
function PromotionsTab({ canManage }) {
  const { show } = useToast();
  const { data: promotions = [], isLoading } = usePromotions();
  const create = useCreatePromotion();
  const review = useUpdatePromotionStatus();
  const empOptions = useEmployeeOptions();
  const empMap = useEmployeeMap();
  const desigOptions = useDesignationOptions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", currentDesignation: "", newDesignation: "", currentSalary: "", newSalary: "", promotionDate: "", reason: "" });

  const pickEmp = (name) => { const e = empMap[name]; setForm((f) => ({ ...f, employee: name, currentDesignation: e?.designation ?? f.currentDesignation, currentSalary: e?.salary ?? f.currentSalary })); };

  const submit = async () => {
    if (!form.employee || !form.newDesignation) return show("Employee and new designation are required", "error");
    try { await create.mutateAsync({ ...form, employeeId: empMap[form.employee]?.id }); show("Promotion created", "success"); setOpen(false); setForm({ employee: "", currentDesignation: "", newDesignation: "", currentSalary: "", newSalary: "", promotionDate: "", reason: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconArrowUpRight size={14} />} onClick={() => setOpen(true)}>New Promotion</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>From → To</Table.Th><Table.Th>Salary</Table.Th><Table.Th>Date</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {promotions.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconArrowUpRight size={24} />} message="No promotions yet" sub={canManage ? "Process an employee promotion." : "Your promotion history will appear here."} action={canManage && <Button leftSection={<IconArrowUpRight size={14} />} onClick={() => setOpen(true)}>New Promotion</Button>} /></Table.Td></Table.Tr>}
          {promotions.map((p) => (
            <Table.Tr key={p.id}>
              <Table.Td fw={500}>{p.employee}</Table.Td>
              <Table.Td><Text size="xs">{p.currentDesignation || "—"} → <Text span fw={600}>{p.newDesignation}</Text></Text></Table.Td>
              <Table.Td><Text size="xs">{money(p.currentSalary)} → {money(p.newSalary)}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(p.promotionDate)}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[p.status] || "gray"} variant="light">{p.status}</Badge></Table.Td>
              <Table.Td>{canManage && p.status === "Pending" && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: p.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: p.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="New Promotion" size="md">
        <Stack gap="sm">
          <Select label="Employee" required placeholder="Select employee" searchable data={empOptions} value={form.employee} onChange={pickEmp} nothingFoundMessage="No employee found" />
          <Group grow>
            <Select label="Current Designation" placeholder="Current" searchable clearable data={desigOptions} value={form.currentDesignation} onChange={(v) => setForm({ ...form, currentDesignation: v })} nothingFoundMessage="—" />
            <Select label="New Designation" required placeholder="New" searchable data={desigOptions} value={form.newDesignation} onChange={(v) => setForm({ ...form, newDesignation: v })} nothingFoundMessage="—" />
          </Group>
          <Group grow>
            <NumberInput label="Current Salary (₹)" min={0} value={form.currentSalary} onChange={(v) => setForm({ ...form, currentSalary: v })} />
            <NumberInput label="New Salary (₹)" min={0} value={form.newSalary} onChange={(v) => setForm({ ...form, newSalary: v })} />
          </Group>
          <TextInput type="date" label="Promotion Date" value={form.promotionDate} onChange={(e) => setForm({ ...form, promotionDate: e.target.value })} />
          <Textarea label="Reason" minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Salary Bands ═══
function BandsTab({ canManage }) {
  const { show } = useToast();
  const { data: bands = [], isLoading } = useBands();
  const create = useCreateBand();
  const del = useDeleteBand();
  const desigOptions = useDesignationOptions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: GRADES[0], designation: "", minSalary: "", maxSalary: "" });

  const submit = async () => {
    if (!form.name || !form.minSalary || !form.maxSalary) return show("Name, min and max salary required", "error");
    if (Number(form.maxSalary) <= Number(form.minSalary)) return show("Max must be greater than min", "error");
    try { await create.mutateAsync(form); show("Band created", "success"); setOpen(false); setForm({ name: "", grade: GRADES[0], designation: "", minSalary: "", maxSalary: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Band</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {bands.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconScale size={24} />} message="No salary bands defined" sub={canManage ? "Define salary bands to validate revisions stay in range." : "Salary bands will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Band</Button>} /></Box>}
        {bands.map((b) => (
          <Card key={b.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs"><Text fw={700}>{b.name}</Text>{b.grade && <Badge variant="light">{b.grade}</Badge>}</Group>
            <Text size="sm">{money(b.minSalary)} – {money(b.maxSalary)}</Text>
            {b.designation && <Text size="xs" c="dimmed" mt={2}>{b.designation}</Text>}
            {canManage && <Button size="compact-xs" variant="subtle" color="red" mt="sm" onClick={async () => { await del.mutateAsync(b.id); show("Deleted", "success"); }}>Delete</Button>}
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Create Salary Band" size="md">
        <Stack gap="sm">
          <TextInput label="Band Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Group grow>
            <Select label="Grade" data={GRADES} value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} />
            <Select label="Designation" placeholder="Any" searchable clearable data={desigOptions} value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} nothingFoundMessage="—" />
          </Group>
          <Group grow>
            <NumberInput label="Minimum Salary (₹)" required min={0} value={form.minSalary} onChange={(v) => setForm({ ...form, minSalary: v })} />
            <NumberInput label="Maximum Salary (₹)" required min={0} value={form.maxSalary} onChange={(v) => setForm({ ...form, maxSalary: v })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Main ═══
export default function CompensationManagement() {
  const { user } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER", "FINANCE"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Compensation Management</Text>
          <Text size="xs" c="dimmed">Revisions · Bonuses · Variable Pay · Promotions · Bands</Text>
        </Box>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="revisions" leftSection={<IconScale size={14} />}>Salary Revisions</Tabs.Tab>
          <Tabs.Tab value="bonuses" leftSection={<IconGift size={14} />}>Bonuses</Tabs.Tab>
          <Tabs.Tab value="varpay" leftSection={<IconReportMoney size={14} />}>Variable Pay</Tabs.Tab>
          <Tabs.Tab value="promotions" leftSection={<IconArrowUpRight size={14} />}>Promotions</Tabs.Tab>
          <Tabs.Tab value="bands" leftSection={<IconCoin size={14} />}>Salary Bands</Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>Employee History</Tabs.Tab>
          <Tabs.Tab value="benchmarking" leftSection={<IconWorld size={14} />}>Benchmarking</Tabs.Tab>
          <Tabs.Tab value="budget" leftSection={<IconWallet size={14} />}>Budget</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="revisions"><RevisionsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="bonuses"><AwardTab canManage={canManage} kind="bonus" /></Tabs.Panel>
        <Tabs.Panel value="varpay"><AwardTab canManage={canManage} kind="varpay" /></Tabs.Panel>
        <Tabs.Panel value="promotions"><PromotionsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="bands"><BandsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="history"><HistoryTab /></Tabs.Panel>
        <Tabs.Panel value="benchmarking"><BenchmarkingTab /></Tabs.Panel>
        <Tabs.Panel value="budget"><BudgetTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
