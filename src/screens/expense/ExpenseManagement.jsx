import { useState } from "react";
import {
  Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  NumberInput, Loader, Center,
} from "@mantine/core";
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
import { exportExpensesCSV } from "../../api/expenseApi";

const COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2"];
const CATEGORIES = ["Travel", "Food", "Accommodation", "Fuel", "Internet", "Mobile", "Training", "Office Supplies", "Client Meeting", "Medical", "Other"];
const STATUSES = ["Draft", "Submitted", "Pending Approval", "Approved", "Rejected", "Reimbursed", "Cancelled"];
const STATUS_COLORS = {
  Draft: "gray", Submitted: "blue", "Pending Approval": "orange", Approved: "green",
  Rejected: "red", Reimbursed: "teal", Cancelled: "dark",
};

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
  const { data: dash, isLoading } = useExpenseDashboard();
  const { data: analytics } = useExpenseAnalytics();

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

  const { data: result = {}, isLoading } = useExpenses({ search, status, category, page, limit });
  const deleteExp = useDeleteExpense();

  const openNew = () => { setEditId(null); setFormOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExp.mutateAsync(id);
      show("Expense deleted", "success");
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
                    <Tooltip label="View"><ActionIcon size="sm" variant="subtle"><IconEye size={14} /></ActionIcon></Tooltip>
                    {e.status === "Draft" && <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => { setEditId(e.id); setFormOpen(true); }}><IconPencil size={14} /></ActionIcon></Tooltip>}
                    {e.status === "Draft" && <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(e.id)}><IconTrash size={14} /></ActionIcon></Tooltip>}
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

  const { data: expense } = useExpense(expenseId);
  const create = useCreateExpense();
  const update = useUpdateExpense();

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

  const { data: result = {}, isLoading } = useExpenses({ status: "Pending Approval", page, limit });
  const approve = useApproveExpense();
  const reject = useRejectExpense();
  const clarify = useClarifyExpense();

  const handleApprove = async (id) => {
    const comment = prompt("Approval comment (optional):");
    try {
      await approve.mutateAsync({ id, comment });
      show("Approved", "success");
    } catch (e) {
      show(e.message, "error");
    }
  };

  const handleReject = async (id) => {
    const comment = prompt("Rejection reason (required):");
    if (!comment) return;
    try {
      await reject.mutateAsync({ id, comment });
      show("Rejected", "success");
    } catch (e) {
      show(e.message, "error");
    }
  };

  const handleClarify = async (id) => {
    const comment = prompt("Clarification request:");
    if (!comment) return;
    try {
      await clarify.mutateAsync({ id, comment });
      show("Clarification sent", "success");
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
                        <ActionIcon size="sm" color="green" variant="light" onClick={() => handleApprove(e.id)} loading={approve.isPending}>
                          <IconCheck size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Reject">
                        <ActionIcon size="sm" color="red" variant="light" onClick={() => handleReject(e.id)} loading={reject.isPending}>
                          <IconX size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Clarify">
                        <ActionIcon size="sm" color="orange" variant="light" onClick={() => handleClarify(e.id)} loading={clarify.isPending}>
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

  const { data: result = {}, isLoading } = useExpenses({ status: "Approved", page, limit });
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
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Box>
            <Text fw={700} size="lg">{employeeView ? "My Expenses" : "Expense & Reimbursement"}</Text>
            <Text size="xs" c="dimmed">
              {employeeView ? "Submit and track your expense claims" : "Track claims, approvals, and reimbursements"}
            </Text>
          </Box>
        </Group>
      </Group>

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
