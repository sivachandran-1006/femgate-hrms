import { useState } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, Stack, Tabs, Menu, ActionIcon,
  Button, NumberInput, Divider, Box,
} from "@mantine/core";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconUsers, IconCash, IconClock, IconCircleCheck, IconSend, IconReceiptTax, IconWallet,
  IconChartBar, IconList, IconLayoutGrid, IconReceipt, IconFileExport, IconDownload,
  IconPlus, IconPencil, IconTrash, IconAlertTriangle,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import Payroll from "./Payroll";

// ── Mock stubs for removed service functions ──
const exportPayroll = async (...args) => { console.log("Mock: exportPayroll"); return new Blob(["mock data"], { type: "text/csv" }); };


const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PayrollManagement({ darkMode }) {
  const { show: toast } = useToast();
  const doExport = async (fmt) => {
    try {
      const blob = await exportPayroll(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `payroll.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };

  return (
    <>
      <AppPageHeader title="Payroll Management" sub="Process salaries, generate payslips and manage structures"
        action={
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("excel")}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("csv")}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("pdf")}>PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />
      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard"  leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="runs"       leftSection={<IconList size={15} />}>Payroll Runs</Tabs.Tab>
          <Tabs.Tab value="structures" leftSection={<IconLayoutGrid size={15} />}>Salary Structures</Tabs.Tab>
          <Tabs.Tab value="payslips"   leftSection={<IconReceipt size={15} />}>Payslips</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="runs"><Payroll embedded /></Tabs.Panel>
        <Tabs.Panel value="structures"><StructuresTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="payslips"><PayslipsTab /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data: dash } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: an } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const c = dash?.cards || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} mb="lg">
        <AppStatCard icon={<IconUsers size={20} />} label="Employees" value={c.totalEmployees ?? 0} color="blue" />
        <AppStatCard icon={<IconCash size={20} />} label="Payroll Cost" value={inr(c.payrollCost)} color="teal" />
        <AppStatCard icon={<IconClock size={20} />} label="Pending" value={c.pending ?? 0} color="orange" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Processed" value={c.processed ?? 0} color="green" />
        <AppStatCard icon={<IconSend size={20} />} label="Published" value={c.published ?? 0} color="grape" />
        <AppStatCard icon={<IconReceiptTax size={20} />} label="Deductions" value={inr(c.totalDeductions)} color="red" />
        <AppStatCard icon={<IconWallet size={20} />} label="Net Payable" value={inr(c.netPayable)} color="indigo" />
      </SimpleGrid>

      <AppSection title="Monthly Payroll Trend" mb="md">
        {an?.monthlyTrend?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={an.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => inr(v)} />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net Pay" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <AppEmptyState message="No payroll records available." py={60} />}
      </AppSection>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Department Salary Cost">
          {an?.departmentCost?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={an.departmentCost}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => inr(v)} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
        <AppSection title="Payroll Distribution">
          {an?.distribution?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={an.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {an.distribution.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>

      <AppSection title="Deductions Trend">
        {an?.deductionsTrend?.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={an.deductionsTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => inr(v)} />
              <Bar dataKey="deductions" fill="#ef4444" radius={[6, 6, 0, 0]} name="Deductions" />
            </BarChart>
          </ResponsiveContainer>
        ) : <AppEmptyState message="No data" py={60} />}
      </AppSection>
    </>
  );
}

const EMPTY_STRUCT = { name: "", department: "", grade: "", basic: 50, hra: 20, specialAllowance: 30, conveyance: 0, medicalAllowance: 0, bonus: 0, variablePay: 0, pf: 12, esi: 0, professionalTax: 200, status: "Active" };

function StructuresTab({ toast }) {
  const { data: structures = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_STRUCT);
  const [delTarget, setDelTarget] = useState(null);

  const openAdd = () => { setEditing(null); setForm(EMPTY_STRUCT); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...EMPTY_STRUCT, ...s }); setOpen(true); };
  const num = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { toast("Structure Name is required", "error"); return; }
    try {
      if (editing) { await updateMut.mutateAsync({ id: editing.id, ...form }); toast("Structure updated", "success"); }
      else { await createMut.mutateAsync(form); toast("Structure created", "success"); }
      setOpen(false);
    } catch (e) { toast(e?.response?.data?.message || "Failed to save", "error"); }
  };
  const del = async () => { try { await deleteMut.mutateAsync(delTarget.id); toast("Structure deleted", "success"); setDelTarget(null); } catch { toast("Failed to delete", "error"); } };

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Structure</AppButton></Group>
      <AppSection noPadding title="Salary Structures" sub={`${structures.length} structures`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Structure", "Department", "Grade", "Basic %", "HRA %", "PF %", "Employees", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {structures.length === 0 ? <Table.Tr><Table.Td colSpan={9}><AppEmptyState message="No salary structures configured" action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Structure</AppButton>} /></Table.Td></Table.Tr>
                : structures.map((s) => (
                  <Table.Tr key={s.id}>
                    <Table.Td><Text size="sm" fw={600}>{s.name}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{s.department || "All"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{s.grade || "—"}</Text></Table.Td>
                    <Table.Td>{s.basic}%</Table.Td>
                    <Table.Td>{s.hra}%</Table.Td>
                    <Table.Td>{s.pf}%</Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{s.employeesAssigned || 0}</Badge></Table.Td>
                    <Table.Td><Badge variant="light" color={s.status === "Active" ? "green" : "gray"} radius="xl">{s.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="blue" size="sm" title="Edit" onClick={() => openEdit(s)}><IconPencil size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => setDelTarget(s)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <AppModal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Salary Structure" : "Add Salary Structure"} icon={<IconLayoutGrid size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput label="Structure Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <AppInput label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <AppInput label="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          </SimpleGrid>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">Earnings (% of CTC)</Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <NumberInput label="Basic" suffix="%" value={form.basic} onChange={num("basic")} />
            <NumberInput label="HRA" suffix="%" value={form.hra} onChange={num("hra")} />
            <NumberInput label="Special Allow." suffix="%" value={form.specialAllowance} onChange={num("specialAllowance")} />
            <NumberInput label="Conveyance" suffix="%" value={form.conveyance} onChange={num("conveyance")} />
          </SimpleGrid>
          <Divider />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">Deductions</Text>
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
            <NumberInput label="PF (% of basic)" suffix="%" value={form.pf} onChange={num("pf")} />
            <NumberInput label="ESI" suffix="%" value={form.esi} onChange={num("esi")} />
            <NumberInput label="Professional Tax (₹)" value={form.professionalTax} onChange={num("professionalTax")} />
          </SimpleGrid>
          <AppInput type="select" label="Status" data={["Active", "Inactive"]} value={form.status} onChange={(v) => setForm({ ...form, status: v })} w={200} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending || updateMut.isPending} onClick={save}>{editing ? "Save Changes" : "Save"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      <AppModal opened={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Structure" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{delTarget?.name}</Text>?</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button color="red" loading={deleteMut.isPending} onClick={del}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}

function PayslipsTab() {
  const { data: records = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [viewId, setViewId] = useState(null);
  const published = (records || []).filter((r) => ["Published", "Paid", "Approved"].includes(r.status));

  return (
    <>
      <AppSection noPadding title="Published Payslips" sub={`${published.length} payslips`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Pay ID", "Employee", "Month", "Net Salary", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {published.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No published payslips" /></Table.Td></Table.Tr>
                : published.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.payId}</Text></Table.Td>
                    <Table.Td><Text size="sm">{r.employee?.name || r.employeeName}</Text></Table.Td>
                    <Table.Td>{r.month} {r.year}</Table.Td>
                    <Table.Td><Text size="sm" fw={600} c="green">{inr(r.netSalary)}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color="green" radius="sm">{r.status}</Badge></Table.Td>
                    <Table.Td><AppButton size="xs" variant="light" leftSection={<IconReceipt size={13} />} onClick={() => setViewId(r.id)}>View Payslip</AppButton></Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <PayslipViewer id={viewId} onClose={() => setViewId(null)} />
    </>
  );
}

function PayslipViewer({ id, onClose }) {
  const { data: p } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  if (!id) return null;
  const earnings = [
    ["Basic", p?.basic], ["HRA", p?.hra], ["Special Allowance", p?.specialAllowance],
    ["Conveyance", p?.conveyance], ["Medical", p?.medicalAllowance], ["Bonus", p?.bonus], ["Variable Pay", p?.variablePay],
  ].filter(([, v]) => v);
  const deductions = [
    ["PF", p?.pf], ["ESI", p?.esi], ["Professional Tax", p?.professionalTax],
    ["Income Tax", p?.incomeTax], ["Loan Recovery", p?.loanRecovery], ["Other", p?.otherDeduction],
  ].filter(([, v]) => v);

  return (
    <AppModal opened={!!id} onClose={onClose} title={`Payslip — ${p?.payId || ""}`} icon={<IconReceipt size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
      {!p ? <Box ta="center" py="xl"><Text c="dimmed">Loading…</Text></Box> : (
        <Stack gap="md">
          <Group justify="space-between">
            <div><Text fw={700}>{p.employee?.name || p.employeeName}</Text><Text size="xs" c="dimmed">{p.employee?.employeeId} · {p.departmentName || p.employee?.department}</Text></div>
            <div style={{ textAlign: "right" }}><Text size="sm" fw={600}>{p.month} {p.year}</Text><Badge variant="light" color="green" radius="sm">{p.status}</Badge></div>
          </Group>
          <Divider />
          <SimpleGrid cols={2}>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Earnings</Text>
              <Stack gap={4}>
                {earnings.length ? earnings.map(([k, v]) => <Group key={k} justify="space-between"><Text size="sm" c="dimmed">{k}</Text><Text size="sm">{inr(v)}</Text></Group>)
                  : <Group justify="space-between"><Text size="sm" c="dimmed">Gross</Text><Text size="sm">{inr(p.salary)}</Text></Group>}
              </Stack>
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Deductions</Text>
              <Stack gap={4}>
                {deductions.length ? deductions.map(([k, v]) => <Group key={k} justify="space-between"><Text size="sm" c="dimmed">{k}</Text><Text size="sm" c="red">-{inr(v)}</Text></Group>)
                  : <Group justify="space-between"><Text size="sm" c="dimmed">Total</Text><Text size="sm" c="red">-{inr(p.deduction)}</Text></Group>}
              </Stack>
            </div>
          </SimpleGrid>
          <Divider />
          <Group justify="space-between">
            <Text fw={700}>Net Salary</Text>
            <Text fw={800} c="green" fz="lg">{inr(p.netSalary)}</Text>
          </Group>
        </Stack>
      )}
    </AppModal>
  );
}
