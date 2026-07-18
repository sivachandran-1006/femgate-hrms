import { useState, useEffect } from "react";
import {
  Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  NumberInput, Loader, Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus, IconSearch, IconDownload, IconEye, IconPencil, IconTrash,
  IconCheck, IconX, IconClock, IconAlertCircle, IconCreditCard,
  IconChartLine, IconFileText, IconReceipt,
} from "@tabler/icons-react";
import { LineChart as RechartLine, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart as RechartPie, Pie, Cell } from "recharts";
import { topSlices } from "../dashboard/components/DashboardKit";
import {
  useExpenseDashboard, useExpenseAnalytics, useExpenses, useExpense,
  useCreateExpense, useUpdateExpense, useSubmitExpense, useApproveExpense, useRejectExpense, useClarifyExpense, useReimburseExpense, useDeleteExpense,
} from "../../queries/useExpense";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { exportExpensesCSV } from "../../api/expenseApi";

const COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2"];
const CATEGORIES = ["Travel", "Food", "Accommodation", "Fuel", "Internet", "Mobile", "Training", "Office Supplies", "Client Meeting", "Medical", "Other"];
const STATUSES = ["Draft", "Submitted", "Pending Approval", "Approved", "Rejected", "Reimbursed", "Cancelled"];
const STATUS_COLORS = {
  Draft: "gray", Submitted: "blue", "Pending Approval": "orange", Approved: "green",
  Rejected: "red", Reimbursed: "teal", Cancelled: "dark",
};

// ─── Mock fallback data (main_v1 UI-only branch) ────────────────────────────
const MOCK_DASHBOARD = {
  totalClaims: 128,
  pendingApprovals: 14,
  approvedClaims: 76,
  rejectedClaims: 9,
  reimbursedAmount: 452300,
  pendingReimbursements: 68500,
  monthlyExpense: 94200,
};

const MOCK_ANALYTICS = {
  trend: [
    { month: "Feb", amount: 62000 },
    { month: "Mar", amount: 71500 },
    { month: "Apr", amount: 58900 },
    { month: "May", amount: 88200 },
    { month: "Jun", amount: 79400 },
    { month: "Jul", amount: 94200 },
  ],
  byCategory: [
    { category: "Travel", amount: 128500 },
    { category: "Accommodation", amount: 96200 },
    { category: "Food", amount: 54300 },
    { category: "Fuel", amount: 41800 },
    { category: "Internet", amount: 18600 },
    { category: "Training", amount: 62000 },
    { category: "Client Meeting", amount: 33500 },
  ],
};

const MOCK_EXPENSES = [
  { id: "exp-1", claimNo: "EXP-2026-0142", employee: "Ananya Sharma", category: "Travel", amount: 12500, date: "2026-07-10", submittedAt: null, status: "Draft", description: "Client site visit travel - not yet submitted", currency: "INR", project: "Project Falcon", costCenter: "CC-101" },
  { id: "exp-2", claimNo: "EXP-2026-0138", employee: "Rohit Verma", category: "Food", amount: 1850, date: "2026-07-08", submittedAt: "2026-07-09", status: "Submitted", description: "Team lunch with client", currency: "INR", project: "Project Orion", costCenter: "CC-102" },
  { id: "exp-3", claimNo: "EXP-2026-0135", employee: "Priya Nair", category: "Accommodation", amount: 8600, date: "2026-07-05", submittedAt: "2026-07-06", status: "Pending Approval", description: "Hotel stay for onsite training", currency: "INR", project: "Project Falcon", costCenter: "CC-101" },
  { id: "exp-4", claimNo: "EXP-2026-0130", employee: "Karthik Iyer", category: "Fuel", amount: 3200, date: "2026-07-03", submittedAt: "2026-07-04", status: "Pending Approval", description: "Fuel reimbursement for client visits", currency: "INR", project: "Project Nova", costCenter: "CC-103" },
  { id: "exp-5", claimNo: "EXP-2026-0126", employee: "Sneha Reddy", category: "Internet", amount: 999, date: "2026-06-28", submittedAt: "2026-06-29", status: "Approved", description: "WFH broadband reimbursement", currency: "INR", project: "", costCenter: "CC-104" },
  { id: "exp-6", claimNo: "EXP-2026-0119", employee: "Arjun Menon", category: "Mobile", amount: 799, date: "2026-06-25", submittedAt: "2026-06-26", status: "Approved", description: "Monthly mobile plan reimbursement", currency: "INR", project: "", costCenter: "CC-104" },
  { id: "exp-7", claimNo: "EXP-2026-0112", employee: "Divya Krishnan", category: "Training", amount: 15000, date: "2026-06-20", submittedAt: "2026-06-21", status: "Approved", description: "AWS certification course fee", currency: "INR", project: "Learning & Development", costCenter: "CC-105" },
  { id: "exp-8", claimNo: "EXP-2026-0108", employee: "Vikram Singh", category: "Office Supplies", amount: 2400, date: "2026-06-18", submittedAt: "2026-06-19", status: "Rejected", description: "Desk accessories purchase", currency: "INR", project: "", costCenter: "CC-102", rejectReason: "Missing original invoice" },
  { id: "exp-9", claimNo: "EXP-2026-0101", employee: "Meera Pillai", category: "Client Meeting", amount: 5600, date: "2026-06-14", submittedAt: "2026-06-15", status: "Rejected", description: "Client dinner - exceeded per-diem limit", currency: "INR", project: "Project Orion", costCenter: "CC-102", rejectReason: "Exceeds approved per-diem limit" },
  { id: "exp-10", claimNo: "EXP-2026-0095", employee: "Rahul Desai", category: "Medical", amount: 4200, date: "2026-06-10", submittedAt: "2026-06-11", status: "Reimbursed", description: "Medical reimbursement claim", currency: "INR", project: "", costCenter: "CC-104", paymentDate: "2026-06-20", paymentRef: "TXN-88213", paymentMode: "Bank Transfer" },
  { id: "exp-11", claimNo: "EXP-2026-0088", employee: "Nisha Kapoor", category: "Travel", amount: 22300, date: "2026-06-05", submittedAt: "2026-06-06", status: "Reimbursed", description: "Flight tickets for onsite deployment", currency: "INR", project: "Project Falcon", costCenter: "CC-101", paymentDate: "2026-06-16", paymentRef: "TXN-88104", paymentMode: "UPI" },
  { id: "exp-12", claimNo: "EXP-2026-0081", employee: "Suresh Kumar", category: "Fuel", amount: 1600, date: "2026-05-30", submittedAt: "2026-05-31", status: "Cancelled", description: "Fuel claim cancelled - duplicate entry", currency: "INR", project: "", costCenter: "CC-103" },
  { id: "exp-13", claimNo: "EXP-2026-0075", employee: "Anjali Bhatt", category: "Other", amount: 950, date: "2026-05-25", submittedAt: "2026-05-26", status: "Approved", description: "Courier charges for document dispatch", currency: "INR", project: "", costCenter: "CC-105" },
  { id: "exp-14", claimNo: "EXP-2026-0070", employee: "Aditya Rao", category: "Accommodation", amount: 11200, date: "2026-05-20", submittedAt: "2026-05-21", status: "Pending Approval", description: "Hotel stay - annual review offsite", currency: "INR", project: "Project Nova", costCenter: "CC-103" },
  { id: "exp-15", claimNo: "EXP-2026-0063", employee: "Kavya Menon", category: "Food", amount: 1120, date: "2026-05-15", submittedAt: "2026-05-16", status: "Submitted", description: "Team offsite meal expenses", currency: "INR", project: "Project Orion", costCenter: "CC-102" },
];

function buildMockExpenseResult({ search = "", status = "", category = "", page = 1, limit = 25 } = {}) {
  const q = search.trim().toLowerCase();
  const filtered = MOCK_EXPENSES.filter((e) => {
    if (status && e.status !== status) return false;
    if (category && e.category !== category) return false;
    if (q && !`${e.claimNo} ${e.employee} ${e.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const start = (page - 1) * limit;
  return { expenses: filtered.slice(start, start + limit), total: filtered.length };
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, onClick }) {
  return (
    <Card withBorder radius="md" p="md" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{typeof value === "number" ? value.toLocaleString() : value}</Text>
    </Card>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: rawDash, isLoading } = useExpenseDashboard();
  const dash = rawDash ?? MOCK_DASHBOARD;
  const { data: rawAnalytics } = useExpenseAnalytics();
  const analytics = rawAnalytics ?? MOCK_ANALYTICS;

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <KpiCard label="Total Claims" value={dash.totalClaims} icon={IconFileText} color="blue" />
        <KpiCard label="Pending Approvals" value={dash.pendingApprovals} icon={IconClock} color="orange" />
        <KpiCard label="Approved Claims" value={dash.approvedClaims} icon={IconCheck} color="green" />
        <KpiCard label="Rejected" value={dash.rejectedClaims} icon={IconX} color="red" />
        <KpiCard label="Reimbursed (₹)" value={`₹${(dash.reimbursedAmount || 0).toLocaleString()}`} icon={IconCreditCard} color="teal" />
        <KpiCard label="Pending Reimburse (₹)" value={`₹${(dash.pendingReimbursements || 0).toLocaleString()}`} icon={IconAlertCircle} color="yellow" />
        <KpiCard label="Monthly Cost (₹)" value={`₹${(dash.monthlyExpense || 0).toLocaleString()}`} icon={IconChartLine} color="indigo" />
      </SimpleGrid>

      {analytics && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="md" p="md">
              <Text fw={600} mb="md">6-Month Expense Trend</Text>
              <ResponsiveContainer width="100%" height={250}>
                <RechartLine data={analytics.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Line type="monotone" dataKey="amount" stroke="#228be6" strokeWidth={2} name="Amount (₹)" />
                </RechartLine>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="md">
              <Text fw={600} mb="md">By Category</Text>
              <ResponsiveContainer width="100%" height={250}>
                <RechartPie data={topSlices(analytics.byCategory || [], "amount", 5, "category")} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} label>
                  {topSlices(analytics.byCategory || [], "amount", 5, "category").map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </RechartPie>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

// ─── Expense List Tab ─────────────────────────────────────────────────────────
function ExpenseListTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewExp, setViewExp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  const { data: rawResult, isLoading } = useExpenses({ search, status, category, page, limit });
  const result = rawResult?.expenses?.length
    ? rawResult
    : buildMockExpenseResult({ search, status, category, page, limit });
  const deleteExp = useDeleteExpense();

  const openNew = () => { setEditId(null); setFormOpen(true); };

  const handleDeleteClick = (id) => { setDeleteId(id); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    try {
      await deleteExp.mutateAsync(deleteId);
      show("Expense deleted", "success");
      closeDeleteModal();
      setDeleteId(null);
    } catch (e) {
      show(e.message, "error");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportExpensesCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      show(e.message, "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Status" data={["", ...STATUSES]} value={status} onChange={setStatus} w={150} clearable />
          <Select placeholder="Category" data={["", ...CATEGORIES]} value={category} onChange={setCategory} w={150} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={openNew}>New Expense</Button>
        </Group>
      </Group>

      {isLoading ? (
        <Center h={200}><Loader /></Center>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Claim ID</Table.Th>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.expenses || []).map((e) => (
              <Table.Tr key={e.id}>
                <Table.Td><Text fw={500} size="sm">{e.claimNo}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.employee}</Text></Table.Td>
                <Table.Td><Badge variant="light" color="blue">{e.category}</Badge></Table.Td>
                <Table.Td><Text size="sm" fw={500}>₹{e.amount.toLocaleString()}</Text></Table.Td>
                <Table.Td><Text size="sm">{new Date(e.date).toLocaleDateString()}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : "—"}</Text></Table.Td>
                <Table.Td><Badge color={STATUS_COLORS[e.status]}>{e.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewExp(e)}><IconEye size={14} /></ActionIcon></Tooltip>
                    {e.status === "Draft" && <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => { setEditId(e.id); setFormOpen(true); }}><IconPencil size={14} /></ActionIcon></Tooltip>}
                    {e.status === "Draft" && <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteClick(e.id)}><IconTrash size={14} /></ActionIcon></Tooltip>}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Group justify="space-between">
        <Text size="sm" c="dimmed">Showing {(result.expenses || []).length} of {result.total || 0}</Text>
        <Group>
          <Button variant="default" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
          <Text size="sm">{page}</Text>
          <Button variant="default" size="sm" onClick={() => setPage(page + 1)} disabled={(page * limit) >= (result.total || 0)}>Next</Button>
        </Group>
      </Group>

      <ExpenseFormModal opened={formOpen} onClose={() => setFormOpen(false)} expenseId={editId} />

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Expense" size="sm" centered>
        <Text size="sm" mb="lg">Are you sure you want to delete this expense? This cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleteExp.isPending}>Delete</Button>
        </Group>
      </Modal>

      <Modal opened={!!viewExp} onClose={() => setViewExp(null)} title="Expense Details" size="md" radius="lg">
        {viewExp && (
          <Stack gap="sm">
            <Group justify="space-between"><Text size="sm" c="dimmed">Claim ID</Text><Text fw={500}>{viewExp.claimNo}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Employee</Text><Text fw={500}>{viewExp.employee}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Category</Text><Badge variant="light" color="blue">{viewExp.category}</Badge></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Amount</Text><Text fw={700} size="lg">₹{viewExp.amount?.toLocaleString()}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Date</Text><Text>{new Date(viewExp.date).toLocaleDateString()}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Submitted</Text><Text>{viewExp.submittedAt ? new Date(viewExp.submittedAt).toLocaleDateString() : "—"}</Text></Group>
            <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><Badge color={STATUS_COLORS[viewExp.status]}>{viewExp.status}</Badge></Group>
            {viewExp.description && <><Text size="sm" c="dimmed" mt="xs">Description</Text><Text size="sm">{viewExp.description}</Text></>}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ─── Create/Edit Expense Form ─────────────────────────────────────────────────
function ExpenseFormModal({ opened, onClose, expenseId }) {
  const { show } = useToast();
  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    currency: "INR",
    project: "",
    costCenter: "",
  });

  const { data: rawExpense } = useExpense(expenseId);
  const expense = rawExpense ?? (expenseId ? MOCK_EXPENSES.find((e) => e.id === expenseId) : null);
  const create = useCreateExpense();
  const update = useUpdateExpense();

  useEffect(() => {
    if (expense) setForm(expense);
  }, [expense]);

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async (draft = true) => {
    try {
      if (expenseId) {
        await update.mutateAsync({ id: expenseId, ...form });
        show("Updated", "success");
      } else {
        await create.mutateAsync(form);
        show(draft ? "Draft saved" : "Submitted", "success");
      }
      onClose();
    } catch (e) {
      show(e.message, "error");
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={expenseId ? "Edit Expense" : "New Expense"} size="lg">
      <Stack gap="sm">
        <Select label="Category" required data={CATEGORIES} value={form.category} onChange={f("category")} />
        <Grid>
          <Grid.Col span={6}>
            <NumberInput label="Amount (₹)" required value={form.amount} onChange={f("amount")} min={0} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput type="date" label="Date" required value={form.date} onChange={f("date")} />
          </Grid.Col>
        </Grid>
        <Textarea label="Description" required minRows={3} value={form.description} onChange={(e) => f("description")(e.target.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save(true)} loading={create.isPending || update.isPending}>Save Draft</Button>
          <Button onClick={() => save(false)} loading={create.isPending || update.isPending}>Submit</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ─── Approvals Tab ───────────────────────────────────────────────────────────
function ApprovalsTab() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [actionTarget, setActionTarget] = useState(null); // { id, type: "approve"|"reject"|"clarify" }
  const [actionComment, setActionComment] = useState("");
  const [actionModalOpened, { open: openActionModal, close: closeActionModal }] = useDisclosure(false);

  const { data: rawResult, isLoading } = useExpenses({ status: "Pending Approval", page, limit });
  const result = rawResult?.expenses?.length
    ? rawResult
    : buildMockExpenseResult({ status: "Pending Approval", page, limit });
  const approve = useApproveExpense();
  const reject = useRejectExpense();
  const clarify = useClarifyExpense();

  const openAction = (id, type) => { setActionTarget({ id, type }); setActionComment(""); openActionModal(); };

  const ACTION_LABELS = { approve: "Approve", reject: "Reject", clarify: "Request Clarification" };
  const ACTION_COLORS = { approve: "green", reject: "red", clarify: "orange" };

  const handleActionConfirm = async () => {
    if (!actionTarget) return;
    const { id, type } = actionTarget;
    if ((type === "reject" || type === "clarify") && !actionComment.trim()) {
      show("Comment is required", "error");
      return;
    }
    try {
      if (type === "approve") {
        await approve.mutateAsync({ id, comment: actionComment });
        show("Approved", "success");
      } else if (type === "reject") {
        await reject.mutateAsync({ id, comment: actionComment });
        show("Rejected", "success");
      } else {
        await clarify.mutateAsync({ id, comment: actionComment });
        show("Clarification sent", "success");
      }
      closeActionModal();
      setActionTarget(null);
    } catch (e) {
      show(e.message, "error");
    }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="md">
      {(result.expenses || []).length === 0 ? (
        <AppEmptyState icon={<IconClock size={24} />} message="No claims pending approval" sub="Claims will appear here once submitted for approval." py={60} />
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Claim ID</Table.Th>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Submitted</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(result.expenses || []).map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text fw={500} size="sm">{e.claimNo}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.employee}</Text></Table.Td>
                  <Table.Td><Badge variant="light">{e.category}</Badge></Table.Td>
                  <Table.Td><Text fw={500}>₹{e.amount.toLocaleString()}</Text></Table.Td>
                  <Table.Td><Text size="sm">{new Date(e.date).toLocaleDateString()}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : "—"}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Approve">
                        <ActionIcon size="sm" color="green" variant="light" onClick={() => openAction(e.id, "approve")}>
                          <IconCheck size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Reject">
                        <ActionIcon size="sm" color="red" variant="light" onClick={() => openAction(e.id, "reject")}>
                          <IconX size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Clarify">
                        <ActionIcon size="sm" color="orange" variant="light" onClick={() => openAction(e.id, "clarify")}>
                          <IconAlertCircle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">Showing {(result.expenses || []).length} of {result.total || 0}</Text>
            <Group>
              <Button variant="default" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
              <Text size="sm">{page}</Text>
              <Button variant="default" size="sm" onClick={() => setPage(page + 1)} disabled={(page * limit) >= (result.total || 0)}>Next</Button>
            </Group>
          </Group>
        </>
      )}

      <Modal
        opened={actionModalOpened}
        onClose={closeActionModal}
        title={actionTarget ? ACTION_LABELS[actionTarget.type] : ""}
        size="sm"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label={actionTarget?.type === "approve" ? "Comment (optional)" : "Reason (required)"}
            placeholder={actionTarget?.type === "approve" ? "Add an approval comment..." : actionTarget?.type === "reject" ? "Enter rejection reason..." : "Describe the clarification needed..."}
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeActionModal}>Cancel</Button>
            <Button
              color={actionTarget ? ACTION_COLORS[actionTarget.type] : "blue"}
              onClick={handleActionConfirm}
              loading={approve.isPending || reject.isPending || clarify.isPending}
            >
              {actionTarget ? ACTION_LABELS[actionTarget.type] : "Confirm"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Reimbursements Tab ──────────────────────────────────────────────────────
function ReimbursementsTab() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentRef: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Transfer",
    remarks: "",
  });

  const { data: rawResult, isLoading } = useExpenses({ status: "Approved", page, limit });
  const result = rawResult?.expenses?.length
    ? rawResult
    : buildMockExpenseResult({ status: "Approved", page, limit });
  const reimburse = useReimburseExpense();

  const pf = (k) => (v) => setPaymentForm((p) => ({ ...p, [k]: v }));

  const handleMarkReimbursed = async () => {
    if (!paymentForm.paymentRef || !paymentForm.paymentDate) {
      show("Payment reference and date required", "error");
      return;
    }
    try {
      await reimburse.mutateAsync({ id: selectedId, ...paymentForm });
      show("Marked as reimbursed", "success");
      setPaymentModal(false);
      setSelectedId(null);
    } catch (e) {
      show(e.message, "error");
    }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="md">
      {(result.expenses || []).length === 0 ? (
        <AppEmptyState icon={<IconCreditCard size={24} />} message="No approved claims pending reimbursement" sub="Approved claims awaiting payment will show up here." py={60} />
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Claim ID</Table.Th>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Approved Date</Table.Th>
                <Table.Th>Payment Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(result.expenses || []).map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text fw={500} size="sm">{e.claimNo}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.employee}</Text></Table.Td>
                  <Table.Td><Text fw={500}>₹{e.amount.toLocaleString()}</Text></Table.Td>
                  <Table.Td><Badge variant="light">{e.category}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : "—"}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={e.paymentDate ? "green" : "yellow"} size="sm">
                      {e.paymentDate ? "Paid" : "Pending"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {!e.paymentDate && (
                      <Button
                        size="xs"
                        onClick={() => {
                          setSelectedId(e.id);
                          setPaymentModal(true);
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {e.paymentDate && <Text size="xs" c="dimmed">{e.paymentRef}</Text>}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">Showing {(result.expenses || []).length} of {result.total || 0}</Text>
            <Group>
              <Button variant="default" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
              <Text size="sm">{page}</Text>
              <Button variant="default" size="sm" onClick={() => setPage(page + 1)} disabled={(page * limit) >= (result.total || 0)}>Next</Button>
            </Group>
          </Group>
        </>
      )}

      <Modal opened={paymentModal} onClose={() => setPaymentModal(false)} title="Mark as Reimbursed" size="md">
        <Stack gap="sm">
          <TextInput label="Payment Reference" required placeholder="Bank ref / Cheque no" value={paymentForm.paymentRef} onChange={(e) => pf("paymentRef")(e.target.value)} />
          <TextInput type="date" label="Payment Date" required value={paymentForm.paymentDate} onChange={(e) => pf("paymentDate")(e.target.value)} />
          <Select label="Payment Mode" required data={["Bank Transfer", "Cheque", "Cash", "UPI"]} value={paymentForm.paymentMode} onChange={pf("paymentMode")} />
          <Textarea label="Remarks" value={paymentForm.remarks} onChange={(e) => pf("remarks")(e.target.value)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleMarkReimbursed} loading={reimburse.isPending}>Mark Paid</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExpenseManagement({ employeeView = false }) {
  const [tab, setTab] = useState(employeeView ? "expenses" : "dashboard");
  const [modalOpened, setModalOpened] = useState(false);
  const [editId, setEditId] = useState(null);

  return (
    <Box>
      <AppPageHeader
        title={employeeView ? "My Expenses" : "Expense & Reimbursement"}
        sub={employeeView ? "Submit and track your expense claims" : "Track claims, approvals, and reimbursements"}
      />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          {!employeeView && <Tabs.Tab value="dashboard" leftSection={<IconChartLine size={14} />}>Dashboard</Tabs.Tab>}
          <Tabs.Tab value="expenses" leftSection={<IconFileText size={14} />}>My Claims</Tabs.Tab>
          {!employeeView && <Tabs.Tab value="approvals" leftSection={<IconCheck size={14} />}>Approvals</Tabs.Tab>}
          {!employeeView && <Tabs.Tab value="reimburse" leftSection={<IconCreditCard size={14} />}>Reimbursements</Tabs.Tab>}
        </Tabs.List>

        {!employeeView && <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>}
        <Tabs.Panel value="expenses"><ExpenseListTab /></Tabs.Panel>
        {!employeeView && <Tabs.Panel value="approvals"><ApprovalsTab /></Tabs.Panel>}
        {!employeeView && <Tabs.Panel value="reimburse"><ReimbursementsTab /></Tabs.Panel>}
      </Tabs>

      <ExpenseFormModal opened={modalOpened} onClose={() => setModalOpened(false)} expenseId={editId} />
    </Box>
  );
}
