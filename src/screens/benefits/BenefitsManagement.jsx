import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Loader, Center, NumberInput, Switch,
} from "@mantine/core";
import {
  IconShieldHeart, IconHeartHandshake, IconUsers, IconActivity, IconReportMoney,
  IconChartBar, IconPlus, IconTrash, IconCheck, IconX, IconUserPlus, IconReceipt2, IconCoin,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const BENEFIT_CATEGORIES = ["Medical Insurance", "Dental Insurance", "Vision Insurance", "Life Insurance", "Accident Insurance", "Retirement Fund", "Gratuity", "PF", "ESI", "Meal Card", "Transport Allowance", "Internet Allowance", "Mobile Allowance", "Gym Membership", "Learning Allowance", "Custom Benefit"];
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Guardian"];
const CLAIM_TYPES = ["Medical Claim", "Insurance Claim", "Benefit Claim"];
const STATUS_COLOR = {
  Active: "green", Inactive: "gray", Archived: "dark", Pending: "orange", Verified: "blue", Rejected: "red", Expired: "red",
  Submitted: "blue", "Under Review": "orange", Approved: "green", Paid: "teal",
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const money = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const MOCK_DASHBOARD = {
  totalPlans: 5,
  employeesEnrolled: 42,
  medicalInsurance: 28,
  lifeInsurance: 19,
  activeBenefits: 34,
  pendingEnrollments: 6,
  expiringBenefits: 3,
};

const MOCK_PLANS = [
  { id: "pl-1", name: "Group Mediclaim Policy", category: "Medical Insurance", provider: "Star Health Insurance", coverageAmount: 500000, employerContribution: 1200, employeeContribution: 300, status: "Active", _count: { enrollments: 18 } },
  { id: "pl-2", name: "Term Life Cover", category: "Life Insurance", provider: "LIC of India", coverageAmount: 1000000, employerContribution: 800, employeeContribution: 0, status: "Active", _count: { enrollments: 12 } },
  { id: "pl-3", name: "Dental Care Plan", category: "Dental Insurance", provider: "Cigna TTK", coverageAmount: 50000, employerContribution: 250, employeeContribution: 100, status: "Active", _count: { enrollments: 7 } },
  { id: "pl-4", name: "Employee PF Scheme", category: "PF", provider: "EPFO", coverageAmount: null, employerContribution: 1800, employeeContribution: 1800, status: "Active", _count: { enrollments: 40 } },
  { id: "pl-5", name: "Meal Card Benefit", category: "Meal Card", provider: "Sodexo", coverageAmount: 22000, employerContribution: 1833, employeeContribution: 0, status: "Archived", _count: { enrollments: 0 } },
];

const MOCK_ENROLLMENTS = [
  { id: "en-1", employee: "Rahul Menon", plan: { name: "Group Mediclaim Policy" }, policyNumber: "SH-2026-8841", premium: 1500, renewalDate: "2027-01-15", status: "Active" },
  { id: "en-2", employee: "Priya Sharma", plan: { name: "Term Life Cover" }, policyNumber: "LIC-TL-5523", premium: 800, renewalDate: "2027-03-01", status: "Active" },
  { id: "en-3", employee: "Ananya Iyer", plan: { name: "Dental Care Plan" }, policyNumber: "CGN-DC-1290", premium: 350, renewalDate: "2026-11-20", status: "Pending" },
  { id: "en-4", employee: "Vikram Singh", plan: { name: "Group Mediclaim Policy" }, policyNumber: "SH-2026-8842", premium: 1500, renewalDate: "2027-01-15", status: "Active" },
  { id: "en-5", employee: "Sneha Reddy", plan: { name: "Employee PF Scheme" }, policyNumber: "EPFO-9981", premium: 3600, renewalDate: "2027-04-01", status: "Active" },
  { id: "en-6", employee: "Arjun Nair", plan: { name: "Term Life Cover" }, policyNumber: "LIC-TL-5524", premium: 800, renewalDate: "2027-03-01", status: "Pending" },
  { id: "en-7", employee: "Divya Krishnan", plan: { name: "Group Mediclaim Policy" }, policyNumber: "SH-2026-8843", premium: 1500, renewalDate: "2026-09-10", status: "Rejected" },
  { id: "en-8", employee: "Karthik Raman", plan: { name: "Dental Care Plan" }, policyNumber: "CGN-DC-1291", premium: 350, renewalDate: "2026-11-20", status: "Active" },
];

const MOCK_DEPENDENTS = [
  { id: "dp-1", name: "Meera Menon", relationship: "Spouse", dob: "1990-04-12", gender: "Female", isNominee: true },
  { id: "dp-2", name: "Aarav Menon", relationship: "Child", dob: "2018-07-22", gender: "Male", isNominee: false },
  { id: "dp-3", name: "Suresh Sharma", relationship: "Parent", dob: "1962-01-05", gender: "Male", isNominee: false },
  { id: "dp-4", name: "Lakshmi Iyer", relationship: "Parent", dob: "1965-09-30", gender: "Female", isNominee: false },
  { id: "dp-5", name: "Kavya Singh", relationship: "Spouse", dob: "1992-11-18", gender: "Female", isNominee: true },
];

const MOCK_CLAIMS = [
  { id: "cl-1", employee: "Rahul Menon", type: "Medical Claim", amount: 8500, description: "Hospitalization - appendix surgery", status: "Approved" },
  { id: "cl-2", employee: "Priya Sharma", type: "Insurance Claim", amount: 25000, description: "Term life premium reimbursement", status: "Paid" },
  { id: "cl-3", employee: "Ananya Iyer", type: "Benefit Claim", amount: 1200, description: "Dental root canal treatment", status: "Under Review" },
  { id: "cl-4", employee: "Vikram Singh", type: "Medical Claim", amount: 4500, description: "OPD consultation and medicines", status: "Submitted" },
  { id: "cl-5", employee: "Sneha Reddy", type: "Medical Claim", amount: 12000, description: "Maternity checkup expenses", status: "Approved" },
  { id: "cl-6", employee: "Arjun Nair", type: "Insurance Claim", amount: 6000, description: "Accident insurance claim", status: "Rejected" },
];

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
  const { data: rawD, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const d = rawD ?? MOCK_DASHBOARD;
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      <Kpi label="Total Plans" value={dash.totalPlans} icon={IconShieldHeart} color="blue" />
      <Kpi label="Employees Enrolled" value={dash.employeesEnrolled} icon={IconUsers} color="teal" />
      <Kpi label="Medical Insurance" value={dash.medicalInsurance} icon={IconHeartHandshake} color="red" />
      <Kpi label="Life Insurance" value={dash.lifeInsurance} icon={IconShieldHeart} color="grape" />
      <Kpi label="Active Benefits" value={dash.activeBenefits} icon={IconCheck} color="green" />
      <Kpi label="Pending Enrollments" value={dash.pendingEnrollments} icon={IconActivity} color="orange" />
      <Kpi label="Expiring Benefits" value={dash.expiringBenefits} icon={IconReportMoney} color="yellow" sub="next 60 days" />
    </SimpleGrid>
  );
}

// ═══ Plans ═══
function PlansTab({ canManage }) {
  const { show } = useToast();
  const { data: rawPlans, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const plans = rawPlans?.length ? rawPlans : MOCK_PLANS;
  const create = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const del = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const enroll = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [open, setOpen] = useState(false);
  const EMPTY = { name: "", category: BENEFIT_CATEGORIES[0], provider: "", coverageAmount: "", eligibility: "", employerContribution: "", employeeContribution: "", status: "Active" };
  const [form, setForm] = useState(EMPTY);

  const submit = async () => {
    if (!form.name || !form.category) return show("Name and category are required", "error");
    try { await create.mutateAsync(form); show("Benefit plan created", "success"); setOpen(false); setForm(EMPTY); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };
  const doEnroll = async (planId) => {
    try { await enroll.mutateAsync({ planId }); show("Enrolled — pending HR verification", "success"); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Plan</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {plans.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconShieldHeart size={24} />} message="No benefit plans yet" sub={canManage ? "Create a benefit or insurance plan to get started." : "Benefit plans you can enroll in will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Plan</Button>} /></Box>}
        {plans.map((p) => (
          <Card key={p.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs">
              <Badge color="blue" variant="light">{p.category}</Badge>
              <Badge color={STATUS_COLOR[p.status] || "gray"} variant="light">{p.status}</Badge>
            </Group>
            <Text fw={700}>{p.name}</Text>
            <Text size="xs" c="dimmed" mt={2}>{p.provider || "—"}</Text>
            <Stack gap={2} mt="sm">
              <Group justify="space-between"><Text size="xs" c="dimmed">Coverage</Text><Text size="xs" fw={600}>{money(p.coverageAmount)}</Text></Group>
              <Group justify="space-between"><Text size="xs" c="dimmed">Employer</Text><Text size="xs" fw={600}>{money(p.employerContribution)}/mo</Text></Group>
              <Group justify="space-between"><Text size="xs" c="dimmed">Enrolled</Text><Text size="xs" fw={600}>{p._count?.enrollments ?? 0}</Text></Group>
            </Stack>
            <Group gap="xs" mt="md">
              {p.status === "Active" && <Button size="xs" variant="light" leftSection={<IconUserPlus size={13} />} loading={enroll.isPending && enroll.variables?.planId === p.id} onClick={() => doEnroll(p.id)}>Enroll</Button>}
              {canManage && <Button size="xs" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(p.id); show("Archived", "success"); }}>Archive</Button>}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Create Benefit Plan" size="lg">
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Benefit Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Category" data={BENEFIT_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} searchable />
          </Group>
          <Group grow>
            <TextInput label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            <NumberInput label="Coverage Amount (₹)" min={0} value={form.coverageAmount} onChange={(v) => setForm({ ...form, coverageAmount: v })} />
          </Group>
          <Textarea label="Eligibility Rules" minRows={2} placeholder="e.g. All full-time employees after 3 months" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
          <Group grow>
            <NumberInput label="Employer Contribution (₹/mo)" min={0} value={form.employerContribution} onChange={(v) => setForm({ ...form, employerContribution: v })} />
            <NumberInput label="Employee Contribution (₹/mo)" min={0} value={form.employeeContribution} onChange={(v) => setForm({ ...form, employeeContribution: v })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Enrollments ═══
function EnrollmentsTab({ canManage }) {
  const { show } = useToast();
  const { data: rawEnrollments, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const enrollments = rawEnrollments?.length ? rawEnrollments : MOCK_ENROLLMENTS;
  const updateStatus = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Table striped highlightOnHover>
      <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Plan</Table.Th><Table.Th>Policy No.</Table.Th><Table.Th>Premium</Table.Th><Table.Th>Renewal</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
      <Table.Tbody>
        {enrollments.length === 0 && <Table.Tr><Table.Td colSpan={7}><AppEmptyState icon={<IconUsers size={24} />} message="No enrollments yet" sub={canManage ? "Employee benefit enrollments will appear here." : "Your benefit enrollments will appear here."} /></Table.Td></Table.Tr>}
        {enrollments.map((e) => (
          <Table.Tr key={e.id}>
            <Table.Td fw={500}>{e.employee}</Table.Td>
            <Table.Td>{e.plan?.name || "—"}</Table.Td>
            <Table.Td><Text size="xs">{e.policyNumber || "—"}</Text></Table.Td>
            <Table.Td><Text size="xs">{money(e.premium)}</Text></Table.Td>
            <Table.Td><Text size="xs">{fmtDate(e.renewalDate)}</Text></Table.Td>
            <Table.Td><Badge color={STATUS_COLOR[e.status] || "gray"} variant="light">{e.status}</Badge></Table.Td>
            <Table.Td>{canManage && e.status === "Pending" && <Group gap={4}>
              <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await updateStatus.mutateAsync({ id: e.id, status: "Active" }); show("Activated", "success"); }}><IconCheck size={13} /></ActionIcon>
              <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await updateStatus.mutateAsync({ id: e.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
            </Group>}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

// ═══ Dependents ═══
function DependentsTab() {
  const { show } = useToast();
  const { data: rawDeps, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const deps = rawDeps?.length ? rawDeps : MOCK_DEPENDENTS;
  const add = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const del = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: RELATIONSHIPS[0], dob: "", gender: "", isNominee: false });

  const submit = async () => {
    if (!form.name) return show("Name is required", "error");
    try { await add.mutateAsync(form); show("Dependent added", "success"); setOpen(false); setForm({ name: "", relationship: RELATIONSHIPS[0], dob: "", gender: "", isNominee: false }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconUserPlus size={14} />} onClick={() => setOpen(true)}>Add Dependent</Button></Group>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {deps.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconUsers size={24} />} message="No dependents added" sub="Add spouse, children, parents or a guardian for insurance coverage." action={<Button leftSection={<IconUserPlus size={14} />} onClick={() => setOpen(true)}>Add Dependent</Button>} /></Box>}
        {deps.map((d) => (
          <Card key={d.id} withBorder radius="md" p="md">
            <Group justify="space-between">
              <Box>
                <Text fw={600}>{d.name}</Text>
                <Text size="xs" c="dimmed">{d.relationship}{d.dob ? ` · ${fmtDate(d.dob)}` : ""}</Text>
                {d.isNominee && <Badge size="xs" color="teal" variant="light" mt={4}>Nominee</Badge>}
              </Box>
              <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(d.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Dependent" size="md">
        <Stack gap="sm">
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Group grow>
            <Select label="Relationship" data={RELATIONSHIPS} value={form.relationship} onChange={(v) => setForm({ ...form, relationship: v })} />
            <TextInput type="date" label="Date of Birth" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </Group>
          <Switch label="Designate as insurance nominee" checked={form.isNominee} onChange={(e) => setForm({ ...form, isNominee: e.currentTarget.checked })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={add.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Claims ═══
function ClaimsTab({ canManage }) {
  const { show } = useToast();
  const { data: rawClaims, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const claims = rawClaims?.length ? rawClaims : MOCK_CLAIMS;
  const submit = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const review = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: CLAIM_TYPES[0], amount: "", description: "" });

  const doSubmit = async () => {
    if (!form.amount) return show("Amount is required", "error");
    try { await submit.mutateAsync(form); show("Claim submitted", "success"); setOpen(false); setForm({ type: CLAIM_TYPES[0], amount: "", description: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconReceipt2 size={14} />} onClick={() => setOpen(true)}>Submit Claim</Button></Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Type</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Description</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {claims.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconReceipt2 size={24} />} message="No claims yet" sub="Submit a medical or insurance claim to get reimbursed." action={<Button leftSection={<IconReceipt2 size={14} />} onClick={() => setOpen(true)}>Submit Claim</Button>} /></Table.Td></Table.Tr>}
          {claims.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td fw={500}>{c.employee}</Table.Td>
              <Table.Td><Badge size="xs" variant="light">{c.type}</Badge></Table.Td>
              <Table.Td fw={600}>{money(c.amount)}</Table.Td>
              <Table.Td><Text size="xs">{c.description || "—"}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[c.status] || "gray"} variant="light">{c.status}</Badge></Table.Td>
              <Table.Td>{canManage && ["Submitted", "Under Review"].includes(c.status) && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: c.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: c.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Submit Claim" size="md">
        <Stack gap="sm">
          <Select label="Claim Type" data={CLAIM_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <NumberInput label="Amount (₹)" required min={0} value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={doSubmit} loading={submit.isPending}>Submit</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Main ═══
export default function BenefitsManagement() {
  const { user } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <AppPageHeader title="Benefits & Insurance" sub="Plans · Enrollments · Dependents · Claims" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="plans" leftSection={<IconShieldHeart size={14} />}>Benefit Plans</Tabs.Tab>
          <Tabs.Tab value="enrollments" leftSection={<IconUsers size={14} />}>Enrollments</Tabs.Tab>
          <Tabs.Tab value="dependents" leftSection={<IconUserPlus size={14} />}>Dependents</Tabs.Tab>
          <Tabs.Tab value="claims" leftSection={<IconReceipt2 size={14} />}>Claims</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="plans"><PlansTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="enrollments"><EnrollmentsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="dependents"><DependentsTab /></Tabs.Panel>
        <Tabs.Panel value="claims"><ClaimsTab canManage={canManage} /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
