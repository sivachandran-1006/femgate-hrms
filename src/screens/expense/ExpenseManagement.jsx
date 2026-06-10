import { useState } from "react";
import { SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select, Modal, Table, ActionIcon, Tabs, Textarea, NumberInput } from "@mantine/core";
import { IconPlus, IconSearch, IconEye, IconCheck, IconX, IconWallet, IconReceipt, IconCar, IconRefresh } from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection } from "../../components/ui/AppSection";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { useToast } from "../../components/ui/Toast";

const CATEGORIES = ["Travel","Food","Accommodation","Equipment","Software","Training","Medical","Other"];

const INIT_EXPENSES = [
  { id: 1, empId: "MGT001", employee: "Safeer Ahmed",   category: "Travel",       amount: 3500,  date: "2026-05-28", desc: "Client visit - Chennai to Bangalore", status: "Approved",  receipt: true  },
  { id: 2, empId: "MGT002", employee: "Suriya Kumar",   category: "Food",         amount: 850,   date: "2026-05-30", desc: "Team lunch - design workshop",        status: "Pending",   receipt: true  },
  { id: 3, empId: "MGT003", employee: "Aravinth Raja",  category: "Software",     amount: 5000,  date: "2026-06-01", desc: "VS Code plugin license renewal",       status: "Pending",   receipt: false },
  { id: 4, empId: "MGT004", employee: "Santhosh C",     category: "Equipment",    amount: 2200,  date: "2026-06-02", desc: "USB hub and keyboard for WFH",         status: "Approved",  receipt: true  },
  { id: 5, empId: "MGT005", employee: "Mani Bharathi",  category: "Training",     amount: 7500,  date: "2026-06-03", desc: "SHRM online course enrollment",        status: "Rejected",  receipt: true  },
  { id: 6, empId: "MGT006", employee: "Santhosh P",     category: "Travel",       amount: 1800,  date: "2026-06-04", desc: "Outstation meeting - cab reimbursement", status: "Pending", receipt: true  },
  { id: 7, empId: "MGT007", employee: "Vignesh M",      category: "Accommodation",amount: 4200,  date: "2026-06-05", desc: "Hotel stay for marketing conference",  status: "Pending",   receipt: true  },
  { id: 8, empId: "MGT008", employee: "Priya Lakshmi",  category: "Other",        amount: 620,   date: "2026-06-06", desc: "Office supplies - stationery",         status: "Approved",  receipt: false },
];

const STATUS_COLOR = { Approved: "green", Pending: "yellow", Rejected: "red", Paid: "blue" };
const CAT_ICON = { Travel: <IconCar size={14}/>, Food: <IconReceipt size={14}/>, Equipment: <IconWallet size={14}/> };

const EMPTY_FORM = { employee: "", category: "Travel", amount: "", date: "", desc: "" };

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function ExpenseManagement() {
  const [expenses, setExpenses]     = useState(INIT_EXPENSES);
  const [tab, setTab]               = useState("all");
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("All");
  const [modalOpen, setModalOpen]   = useState(false);
  const [viewModal, setViewModal]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const { showToast }               = useToast();

  const tabFiltered = tab === "all" ? expenses : expenses.filter((e) => e.status.toLowerCase() === tab);
  const filtered = tabFiltered.filter((e) => {
    const q = search.toLowerCase();
    const matchQ = !q || e.employee.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q);
    const matchC = filterCat === "All" || e.category === filterCat;
    return matchQ && matchC;
  });

  const totalAmt    = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingAmt  = expenses.filter((e) => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
  const approvedAmt = expenses.filter((e) => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
  const pendingCnt  = expenses.filter((e) => e.status === "Pending").length;

  const handleApprove = (id) => {
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, status: "Approved" } : e));
    showToast("Expense approved", "success");
  };
  const handleReject = (id) => {
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, status: "Rejected" } : e));
    showToast("Expense rejected", "error");
  };

  const handleSubmit = () => {
    if (!form.employee || !form.amount || !form.date) return showToast("Fill all required fields", "error");
    setExpenses((prev) => [...prev, {
      ...form, id: Date.now(), empId: "NEW", status: "Pending", receipt: false,
      amount: Number(form.amount),
    }]);
    showToast("Expense claim submitted", "success");
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  return (
    <Box>
      <AppPageHeader
        title="Expense Management"
        subtitle="Track and approve employee expense claims and reimbursements"
        action={<Button leftSection={<IconPlus size={16}/>} onClick={() => setModalOpen(true)} size="sm">New Claim</Button>}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconWallet size={18}/>}  label="Total Claims"    value={expenses.length}  sub="All time"         color="blue"   />
        <AppStatCard icon={<IconRefresh size={18}/>} label="Pending"         value={pendingCnt}        sub={fmt(pendingAmt)}  color="yellow" />
        <AppStatCard icon={<IconCheck size={18}/>}   label="Approved Amount" value={fmt(approvedAmt)}  sub="This month"       color="green"  />
        <AppStatCard icon={<IconReceipt size={18}/>} label="Total Value"     value={fmt(totalAmt)}     sub="All claims"       color="violet" />
      </SimpleGrid>

      {/* Filters */}
      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Search by employee or description..."
          leftSection={<IconSearch size={14}/>}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320 }}
          size="sm"
        />
        <Select
          value={filterCat}
          onChange={setFilterCat}
          data={["All", ...CATEGORIES]}
          size="sm"
          w={160}
          placeholder="Category"
        />
      </Group>

      <Tabs value={tab} onChange={setTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="all">All ({expenses.length})</Tabs.Tab>
          <Tabs.Tab value="pending">Pending ({expenses.filter(e=>e.status==="Pending").length})</Tabs.Tab>
          <Tabs.Tab value="approved">Approved ({expenses.filter(e=>e.status==="Approved").length})</Tabs.Tab>
          <Tabs.Tab value="rejected">Rejected ({expenses.filter(e=>e.status==="Rejected").length})</Tabs.Tab>
        </Tabs.List>
      </Tabs>

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
              {filtered.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text fw={500} fz="sm">{e.employee}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Box c="dimmed">{CAT_ICON[e.category] || <IconWallet size={14}/>}</Box>
                      <Text fz="sm" c="dimmed">{e.category}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text fw={600} fz="sm">{fmt(e.amount)}</Text></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{new Date(e.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</Text></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={e.receipt ? "green" : "gray"} variant="light" size="xs">{e.receipt ? "Attached" : "Missing"}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLOR[e.status] || "gray"} variant="light" size="sm">{e.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => setViewModal(e)}><IconEye size={14}/></ActionIcon>
                      {e.status === "Pending" && <>
                        <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleApprove(e.id)}><IconCheck size={14}/></ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleReject(e.id)}><IconX size={14}/></ActionIcon>
                      </>}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </AppSection>

      {/* New Claim Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Submit Expense Claim" size="md">
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Employee Name" value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))} required />
          <Select label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} data={CATEGORIES} />
          <NumberInput label="Amount (₹)" value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} min={0} prefix="₹" required />
          <TextInput type="date" label="Date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Textarea label="Description" value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} minRows={2} />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Claim</Button>
          </Group>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal opened={!!viewModal} onClose={() => setViewModal(null)} title="Expense Details" size="sm">
        {viewModal && (
          <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Employee",    viewModal.employee],
              ["Category",    viewModal.category],
              ["Amount",      fmt(viewModal.amount)],
              ["Date",        new Date(viewModal.date).toLocaleDateString("en-IN")],
              ["Description", viewModal.desc],
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
                <Button color="green" flex={1} onClick={() => { handleApprove(viewModal.id); setViewModal(null); }}>Approve</Button>
                <Button color="red" flex={1} onClick={() => { handleReject(viewModal.id); setViewModal(null); }}>Reject</Button>
              </Group>
            )}
          </Box>
        )}
      </Modal>
    </Box>
  );
}
