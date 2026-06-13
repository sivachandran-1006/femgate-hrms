import { useState } from "react";
import {
  SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select,
  Modal, Table, ActionIcon, Tabs, Textarea, NumberInput, Loader, Alert,
} from "@mantine/core";
import {
  IconPlus, IconSearch, IconEye, IconCheck, IconX,
  IconWallet, IconReceipt, IconAlertCircle,
} from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection }    from "../../components/ui/AppSection";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { useToast }      from "../../components/ui/Toast";
import {
  useExpenses, useCreateExpense, useApproveExpense, useRejectExpense,
} from "../../queries/useExpenses";

const CATEGORIES = ["Travel","Food","Accommodation","Equipment","Software","Training","Medical","Other"];
const STATUS_COLOR = { Approved: "green", Pending: "yellow", Rejected: "red" };
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const EMPTY_FORM = { employee: "", category: "Travel", amount: "", date: "", desc: "" };

export default function ExpenseManagement() {
  const { show: showToast } = useToast();
  const { data: expenses = [], isLoading, isError } = useExpenses();

  const createMut  = useCreateExpense();
  const approveMut = useApproveExpense();
  const rejectMut  = useRejectExpense();

  const [tab, setTab]             = useState("all");
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  const tabFiltered = tab === "all" ? expenses : expenses.filter((e) => e.status.toLowerCase() === tab);
  const filtered = tabFiltered.filter((e) => {
    const matchQ = !search ||
      e.employee.toLowerCase().includes(search.toLowerCase()) ||
      (e.desc || "").toLowerCase().includes(search.toLowerCase());
    const matchC = filterCat === "All" || e.category === filterCat;
    return matchQ && matchC;
  });

  const totalAmt    = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingAmt  = expenses.filter((e) => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
  const approvedAmt = expenses.filter((e) => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
  const pendingCnt  = expenses.filter((e) => e.status === "Pending").length;

  const handleApprove = async (id) => {
    try {
      await approveMut.mutateAsync(id);
      showToast("Expense approved", "success");
      setViewModal(null);
    } catch {
      showToast("Failed to approve", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMut.mutateAsync(id);
      showToast("Expense rejected", "error");
      setViewModal(null);
    } catch {
      showToast("Failed to reject", "error");
    }
  };

  const handleSubmit = async () => {
    if (!form.employee || !form.amount || !form.date) return showToast("Fill all required fields", "error");
    try {
      await createMut.mutateAsync({ ...form, amount: Number(form.amount) });
      showToast("Expense claim submitted", "success");
      setModalOpen(false);
      setForm(EMPTY_FORM);
    } catch {
      showToast("Failed to submit claim", "error");
    }
  };

  return (
    <Box>
      <AppPageHeader
        title="Expense Management"
        subtitle="Track and approve employee expense claims and reimbursements"
        action={<Button leftSection={<IconPlus size={16}/>} onClick={() => setModalOpen(true)} size="sm">New Claim</Button>}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconWallet size={18}/>}  label="Total Claims"    value={expenses.length}  sub="All time"        color="blue"   />
        <AppStatCard icon={<IconReceipt size={18}/>} label="Pending"         value={pendingCnt}       sub={fmt(pendingAmt)} color="yellow" />
        <AppStatCard icon={<IconCheck size={18}/>}   label="Approved Amount" value={fmt(approvedAmt)} sub="This month"      color="green"  />
        <AppStatCard icon={<IconWallet size={18}/>}  label="Total Value"     value={fmt(totalAmt)}    sub="All claims"      color="violet" />
      </SimpleGrid>

      <Group mb="md" gap="sm">
        <TextInput placeholder="Search by employee or description..."
          leftSection={<IconSearch size={14}/>} value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 340 }} size="sm" />
        <Select value={filterCat} onChange={setFilterCat}
          data={["All", ...CATEGORIES]} size="sm" w={160} placeholder="Category" />
      </Group>

      <Tabs value={tab} onChange={setTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="all">All ({expenses.length})</Tabs.Tab>
          <Tabs.Tab value="pending">Pending ({expenses.filter(e => e.status==="Pending").length})</Tabs.Tab>
          <Tabs.Tab value="approved">Approved ({expenses.filter(e => e.status==="Approved").length})</Tabs.Tab>
          <Tabs.Tab value="rejected">Rejected ({expenses.filter(e => e.status==="Rejected").length})</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}

      {isError && (
        <Alert icon={<IconAlertCircle size={16}/>} color="red" mb="md">
          Failed to load expenses. Make sure the backend is running and you are logged in.
        </Alert>
      )}

      {!isLoading && !isError && (
        <AppSection title="Expense Claims" sub={`${filtered.length} records`} noPadding>
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withTableBorder={false} fz="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Employee</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Receipt</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text ta="center" c="dimmed" py="lg">No expense claims found</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {filtered.map((e) => (
                  <Table.Tr key={e.id}>
                    <Table.Td><Text fw={500}>{e.employee}</Text></Table.Td>
                    <Table.Td><Text fz="sm" c="dimmed">{e.category}</Text></Table.Td>
                    <Table.Td><Text fw={600}>{fmt(e.amount)}</Text></Table.Td>
                    <Table.Td><Text c="dimmed">{new Date(e.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</Text></Table.Td>
                    <Table.Td><Text fz="sm" c="dimmed" style={{ maxWidth: 200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.desc}</Text></Table.Td>
                    <Table.Td><Badge color={e.receipt ? "green" : "gray"} variant="light" size="xs">{e.receipt ? "Attached" : "Missing"}</Badge></Table.Td>
                    <Table.Td><Badge color={STATUS_COLOR[e.status] || "gray"} variant="light" size="sm">{e.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => setViewModal(e)}><IconEye size={14}/></ActionIcon>
                        {e.status === "Pending" && <>
                          <ActionIcon size="sm" variant="subtle" color="green" loading={approveMut.isPending && approveMut.variables === e.id} onClick={() => handleApprove(e.id)}><IconCheck size={14}/></ActionIcon>
                          <ActionIcon size="sm" variant="subtle" color="red"   loading={rejectMut.isPending && rejectMut.variables === e.id}  onClick={() => handleReject(e.id)}><IconX size={14}/></ActionIcon>
                        </>}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </AppSection>
      )}

      {/* New Claim Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Submit Expense Claim" size="md">
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Employee Name" value={form.employee}
            onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))} required />
          <Select label="Category" value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))} data={CATEGORIES} />
          <NumberInput label="Amount (₹)" value={form.amount}
            onChange={(v) => setForm((f) => ({ ...f, amount: v }))} min={0} prefix="₹" required />
          <TextInput type="date" label="Date" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Textarea label="Description" value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} minRows={2} />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMut.isPending}>Submit Claim</Button>
          </Group>
        </Box>
      </Modal>

      {/* View / Approve Modal */}
      <Modal opened={!!viewModal} onClose={() => setViewModal(null)} title="Expense Details" size="sm">
        {viewModal && (
          <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Employee",    viewModal.employee],
              ["Category",    viewModal.category],
              ["Amount",      fmt(viewModal.amount)],
              ["Date",        new Date(viewModal.date).toLocaleDateString("en-IN")],
              ["Description", viewModal.desc || "—"],
              ["Receipt",     viewModal.receipt ? "Attached" : "Not attached"],
              ["Status",      viewModal.status],
            ].map(([label, value]) => (
              <Group key={label} justify="space-between" wrap="nowrap">
                <Text fz="sm" c="dimmed" w={120}>{label}</Text>
                <Text fz="sm" fw={500}>{value}</Text>
              </Group>
            ))}
            {viewModal.status === "Pending" && (
              <Group mt="md" gap="sm">
                <Button color="green" flex={1} loading={approveMut.isPending} onClick={() => handleApprove(viewModal.id)}>Approve</Button>
                <Button color="red"   flex={1} loading={rejectMut.isPending}  onClick={() => handleReject(viewModal.id)}>Reject</Button>
              </Group>
            )}
          </Box>
        )}
      </Modal>
    </Box>
  );
}
