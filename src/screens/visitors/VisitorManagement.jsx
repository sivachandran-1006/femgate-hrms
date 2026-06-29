import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Loader, Center, Tooltip, Avatar,
} from "@mantine/core";
import {
  IconUsers, IconUserCheck, IconCalendarEvent, IconWalk, IconClock, IconUserX,
  IconId, IconChartBar, IconPlus, IconTrash, IconCheck, IconX, IconLogin, IconLogout,
  IconQrcode, IconBan, IconReportAnalytics,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  useVisitorDashboard,
  useVisitors, useRegisterVisitor, useRegisterWalkIn,
  useApproveVisitor, useRejectVisitor, useCancelVisitor, useCheckInVisitor, useCheckOutVisitor, usePrintBadge, useQrCheckIn,
  useBlacklist, useAddBlacklist, useRemoveBlacklist,
} from "../../queries/useVisitors";

const VISITOR_TYPES = ["Business Visitor", "Interview Candidate", "Vendor", "Customer", "Contractor", "Consultant", "Delivery Personnel", "Guest"];
const VISITOR_STATUS = ["Scheduled", "Pending Approval", "Approved", "Checked In", "Checked Out", "Rejected", "Cancelled"];
const ID_PROOF_TYPES = ["Aadhaar", "PAN", "Driving License", "Passport", "Voter ID", "Company ID"];
const STATUS_COLOR = {
  Scheduled: "blue", "Pending Approval": "orange", Approved: "teal", "Checked In": "green", "Checked Out": "gray", Rejected: "red", Cancelled: "dark",
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const useEmployeeOptions = () => {
  const { data: employees = [] } = useFetchAllEmployees();
  const options = (employees || []).map((e) => ({ value: e.name, label: e.employeeId ? `${e.name} (${e.employeeId})` : e.name }));
  const byName = Object.fromEntries((employees || []).map((e) => [e.name, e]));
  return { options, byName };
};

function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

const EMPTY_FORM = {
  name: "", company: "", email: "", mobile: "", visitorType: VISITOR_TYPES[0],
  idProofType: "", idProofNumber: "", purpose: "", hostEmployee: "", department: "",
  visitDate: "", visitTime: "", expectedDuration: "", vehicleNumber: "", remarks: "",
};

// ═══ Dashboard ═══
function DashboardTab() {
  const { data: d, isLoading } = useVisitorDashboard();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      <Kpi label="Today's Visitors" value={dash.todaysVisitors} icon={IconUsers} color="blue" />
      <Kpi label="Inside Premises" value={dash.visitorsInside} icon={IconUserCheck} color="green" sub="currently in" />
      <Kpi label="Scheduled" value={dash.scheduledVisitors} icon={IconCalendarEvent} color="cyan" />
      <Kpi label="Walk-in" value={dash.walkInVisitors} icon={IconWalk} color="grape" sub="today" />
      <Kpi label="Pending Approvals" value={dash.pendingApprovals} icon={IconClock} color="orange" />
      <Kpi label="Rejected" value={dash.rejectedVisitors} icon={IconUserX} color="red" />
      <Kpi label="Expired Passes" value={dash.expiredPasses} icon={IconId} color="yellow" />
    </SimpleGrid>
  );
}

// ═══ Visitor List ═══
function VisitorsTab({ canManage, scope }) {
  const { show } = useToast();
  const [filters, setFilters] = useState({ search: "", status: "All", visitorType: "All", scope });
  const { data: visitors = [], isLoading } = useVisitors(filters);
  const { options: empOptions, byName } = useEmployeeOptions();
  const reg = useRegisterVisitor();
  const walkIn = useRegisterWalkIn();
  const approve = useApproveVisitor();
  const reject = useRejectVisitor();
  const checkIn = useCheckInVisitor();
  const checkOut = useCheckOutVisitor();
  const badge = usePrintBadge();
  const [open, setOpen] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [badgeView, setBadgeView] = useState(null);

  const openForm = (walk) => { setIsWalkIn(walk); setForm(EMPTY_FORM); setOpen(true); };

  const submit = async (sendInvitation) => {
    if (!form.name || !form.mobile || !form.purpose || !form.hostEmployee || !form.visitDate)
      return show("Name, mobile, purpose, host and visit date are required", "error");
    const emp = byName[form.hostEmployee];
    const payload = { ...form, hostEmployeeId: emp?.id, department: form.department || emp?.department, sendInvitation };
    try {
      if (isWalkIn) await walkIn.mutateAsync(payload);
      else await reg.mutateAsync(payload);
      show(isWalkIn ? "Walk-in registered" : (sendInvitation ? "Invitation sent" : "Visitor registered"), "success");
      setOpen(false); setForm(EMPTY_FORM);
    } catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
        <Group>
          <TextInput placeholder="Search name, ID, company, host, phone..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} w={280} />
          <Select data={["All", ...VISITOR_STATUS]} value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} w={160} />
          <Select data={["All", ...VISITOR_TYPES]} value={filters.visitorType} onChange={(v) => setFilters({ ...filters, visitorType: v })} w={170} />
        </Group>
        {canManage && (
          <Group>
            <Button variant="default" leftSection={<IconWalk size={14} />} onClick={() => openForm(true)}>Walk-in</Button>
            <Button leftSection={<IconPlus size={14} />} onClick={() => openForm(false)}>Pre-Register</Button>
          </Group>
        )}
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr>
          <Table.Th>ID</Table.Th><Table.Th>Visitor</Table.Th><Table.Th>Company</Table.Th><Table.Th>Host</Table.Th>
          <Table.Th>Purpose</Table.Th><Table.Th>Visit Date</Table.Th><Table.Th>In / Out</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th>
        </Table.Tr></Table.Thead>
        <Table.Tbody>
          {visitors.length === 0 && <Table.Tr><Table.Td colSpan={9}><AppEmptyState icon={<IconUsers size={24} />} message="No visitors found" sub={canManage ? "No visitor records available. Register a visitor to get started." : "No visitor records available."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => openForm(false)}>Pre-Register</Button>} /></Table.Td></Table.Tr>}
          {visitors.map((v) => (
            <Table.Tr key={v.id}>
              <Table.Td><Text size="xs" fw={500}>{v.visitorCode}</Text></Table.Td>
              <Table.Td><Text size="sm" fw={500}>{v.name}</Text><Text size="xs" c="dimmed">{v.mobile}</Text></Table.Td>
              <Table.Td><Text size="xs">{v.company || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{v.hostEmployee}</Text></Table.Td>
              <Table.Td><Badge size="xs" variant="light">{v.visitorType}</Badge></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(v.visitDate)} {v.visitTime || ""}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtTime(v.checkInTime)} / {fmtTime(v.checkOutTime)}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[v.status] || "gray"} variant="light">{v.status}</Badge></Table.Td>
              <Table.Td>
                <Group gap={4} wrap="nowrap">
                  {canManage && v.status === "Pending Approval" && <>
                    <Tooltip label="Approve"><ActionIcon size="sm" variant="light" color="green" onClick={async () => { await approve.mutateAsync(v.id); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Reject"><ActionIcon size="sm" variant="light" color="red" onClick={async () => { await reject.mutateAsync({ id: v.id, reason: "Rejected by host" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon></Tooltip>
                  </>}
                  {canManage && v.status === "Approved" && <Tooltip label="Check In"><ActionIcon size="sm" variant="light" color="blue" onClick={async () => { await checkIn.mutateAsync(v.id); show("Checked in", "success"); }}><IconLogin size={13} /></ActionIcon></Tooltip>}
                  {canManage && v.status === "Checked In" && <Tooltip label="Check Out"><ActionIcon size="sm" variant="light" color="orange" onClick={async () => { await checkOut.mutateAsync(v.id); show("Checked out", "success"); }}><IconLogout size={13} /></ActionIcon></Tooltip>}
                  <Tooltip label="Badge"><ActionIcon size="sm" variant="subtle" onClick={() => { setBadgeView(v); if (canManage && !v.badgePrinted) badge.mutate(v.id); }}><IconId size={13} /></ActionIcon></Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Register / Walk-in modal */}
      <Modal opened={open} onClose={() => setOpen(false)} title={isWalkIn ? "Walk-in Registration" : "Pre-Register Visitor"} size="lg">
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Visitor Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextInput label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Group>
          <Group grow>
            <TextInput label="Mobile Number" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Group>
          <Group grow>
            <Select label="Visitor Type" data={VISITOR_TYPES} value={form.visitorType} onChange={(v) => setForm({ ...form, visitorType: v })} />
            <Select label="Host Employee" placeholder="Select host" required searchable data={empOptions} value={form.hostEmployee} onChange={(v) => setForm({ ...form, hostEmployee: v })} nothingFoundMessage="No employee found" />
          </Group>
          <TextInput label="Purpose of Visit" required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          <Group grow>
            <Select label="ID Proof Type" data={ID_PROOF_TYPES} value={form.idProofType} onChange={(v) => setForm({ ...form, idProofType: v })} clearable />
            <TextInput label="ID Proof Number" value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} />
          </Group>
          <Group grow>
            <TextInput type="date" label="Visit Date" required value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
            <TextInput type="time" label="Visit Time" value={form.visitTime} onChange={(e) => setForm({ ...form, visitTime: e.target.value })} />
            <TextInput label="Duration" placeholder="1 hour" value={form.expectedDuration} onChange={(e) => setForm({ ...form, expectedDuration: e.target.value })} />
          </Group>
          <Group grow>
            <TextInput label="Vehicle Number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
            <TextInput label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </Group>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
            {!isWalkIn && <Button variant="light" onClick={() => submit(true)} loading={reg.isPending}>Send Invitation</Button>}
            <Button onClick={() => submit(false)} loading={reg.isPending || walkIn.isPending}>{isWalkIn ? "Register" : "Save"}</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Visitor Badge preview */}
      <Modal opened={!!badgeView} onClose={() => setBadgeView(null)} title="Visitor Badge" size="sm" centered>
        {badgeView && (
          <Card withBorder radius="md" p="lg">
            <Stack align="center" gap="xs">
              <Avatar size={72} radius="md" color="blue">{badgeView.name.slice(0, 2).toUpperCase()}</Avatar>
              <Text fw={700} size="lg">{badgeView.name}</Text>
              <Badge variant="light">{badgeView.visitorType}</Badge>
              <Stack gap={2} align="center" mt="xs">
                <Text size="xs" c="dimmed">Host: <Text span fw={600}>{badgeView.hostEmployee}</Text></Text>
                {badgeView.department && <Text size="xs" c="dimmed">Dept: {badgeView.department}</Text>}
                <Text size="xs" c="dimmed">Visit: {fmtDate(badgeView.visitDate)} {badgeView.visitTime || ""}</Text>
                <Text size="xs" c="dimmed">Pass: {badgeView.visitorCode}</Text>
              </Stack>
              <Box mt="sm" p="md" style={{ background: "var(--mantine-color-gray-1)", borderRadius: 8 }}>
                <IconQrcode size={72} />
              </Box>
              <Text size="xs" c="dimmed">{badgeView.qrCode}</Text>
              <Button fullWidth mt="sm" variant="light" leftSection={<IconId size={14} />} onClick={() => { window.print(); }}>Print Badge</Button>
            </Stack>
          </Card>
        )}
      </Modal>
    </Stack>
  );
}

// ═══ QR Self Check-In ═══
function QrCheckInTab() {
  const { show } = useToast();
  const qr = useQrCheckIn();
  const [code, setCode] = useState("");
  const submit = async () => {
    if (!code.trim()) return show("Enter a QR code", "error");
    try { const v = await qr.mutateAsync(code.trim()); show(`${v.name} checked in`, "success"); setCode(""); }
    catch (e) { show(e?.response?.data?.message || "Invalid QR code", "error"); }
  };
  return (
    <Center h={300}>
      <Card withBorder radius="md" p="xl" w={420}>
        <Stack align="center" gap="md">
          <IconQrcode size={64} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="lg">QR Self Check-In</Text>
          <Text size="sm" c="dimmed" ta="center">Enter or scan your visitor QR code for fast entry.</Text>
          <TextInput w="100%" placeholder="QR-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button fullWidth leftSection={<IconLogin size={16} />} onClick={submit} loading={qr.isPending}>Check In</Button>
        </Stack>
      </Card>
    </Center>
  );
}

// ═══ Blacklist ═══
function BlacklistTab({ canManage }) {
  const { show } = useToast();
  const { data: list = [], isLoading } = useBlacklist();
  const add = useAddBlacklist();
  const remove = useRemoveBlacklist();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", reason: "", expiryDate: "" });

  const submit = async () => {
    if (!form.name || !form.reason) return show("Name and reason are required", "error");
    try { await add.mutateAsync(form); show("Added to blacklist", "success"); setOpen(false); setForm({ name: "", mobile: "", reason: "", expiryDate: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  const active = list.filter((b) => b.active);
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button color="red" variant="light" leftSection={<IconBan size={14} />} onClick={() => setOpen(true)}>Block Visitor</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Mobile</Table.Th><Table.Th>Reason</Table.Th><Table.Th>Expiry</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {active.length === 0 && <Table.Tr><Table.Td colSpan={5}><AppEmptyState icon={<IconBan size={24} />} message="No blacklisted visitors" sub="Blocked visitors will appear here." /></Table.Td></Table.Tr>}
          {active.map((b) => (
            <Table.Tr key={b.id}>
              <Table.Td fw={500}>{b.name}</Table.Td>
              <Table.Td><Text size="xs">{b.mobile || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{b.reason}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(b.expiryDate)}</Text></Table.Td>
              <Table.Td>{canManage && <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await remove.mutateAsync(b.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Block Visitor" size="md">
        <Stack gap="sm">
          <TextInput label="Visitor Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextInput label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Textarea label="Reason" required minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <TextInput type="date" label="Expiry Date (optional)" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button color="red" onClick={submit} loading={add.isPending}>Block</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Main ═══
export default function VisitorManagement() {
  const { user } = useAuth();
  // Admins, HR, reception/security (IT_ADMIN stands in) manage; others (employees) can register/approve their own
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER", "IT_ADMIN", "MANAGER"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <AppPageHeader title="Visitor Management" sub="Register, approve, check-in and manage visitor badges" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconUsers size={14} />}>All Visitors</Tabs.Tab>
          <Tabs.Tab value="today" leftSection={<IconCalendarEvent size={14} />}>Today</Tabs.Tab>
          <Tabs.Tab value="inside" leftSection={<IconUserCheck size={14} />}>Inside</Tabs.Tab>
          <Tabs.Tab value="pending" leftSection={<IconClock size={14} />}>Approvals</Tabs.Tab>
          <Tabs.Tab value="qr" leftSection={<IconQrcode size={14} />}>QR Check-In</Tabs.Tab>
          <Tabs.Tab value="blacklist" leftSection={<IconBan size={14} />}>Blacklist</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="all"><VisitorsTab canManage={canManage} scope="all" /></Tabs.Panel>
        <Tabs.Panel value="today"><VisitorsTab canManage={canManage} scope="today" /></Tabs.Panel>
        <Tabs.Panel value="inside"><VisitorsTab canManage={canManage} scope="inside" /></Tabs.Panel>
        <Tabs.Panel value="pending"><VisitorsTab canManage={canManage} scope="pending" /></Tabs.Panel>
        <Tabs.Panel value="qr"><QrCheckInTab /></Tabs.Panel>
        <Tabs.Panel value="blacklist"><BlacklistTab canManage={canManage} /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
