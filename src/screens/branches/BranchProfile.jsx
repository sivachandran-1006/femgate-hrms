import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Avatar,
  Loader, Box, Alert, ActionIcon, Divider, Button,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconArrowLeft, IconBuilding, IconUsers, IconBuildingCommunity, IconChartBar,
  IconClipboardList, IconAlertCircle, IconCalendarEvent, IconPlus, IconPencil, IconTrash,
  IconAlertTriangle, IconUserCheck, IconTicket,
} from "@tabler/icons-react";

import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { usePermission } from "../../hooks/usePermission";
import {
  useBranch, useBranchDepartments, useBranchEmployees, useBranchHolidays,
  useBranchAnalytics, useBranchAudit,
  useAddBranchHoliday, useUpdateBranchHoliday, useDeleteBranchHoliday,
} from "../../queries/useBranches";

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
const HOLIDAY_TYPES = ["Public", "Regional", "Company", "National"];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Field = ({ label, value }) => (
  <Box>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text>
    <Text size="sm" fw={500}>{value || "—"}</Text>
  </Box>
);

const EMPTY_H = { name: "", date: "", type: "Public", optional: false };

export default function BranchProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const can = usePermission();
  const canEdit = can("branches.edit") || can("branches.create");

  const { data: branch, isLoading, isError } = useBranch(id);
  const { data: departments = [] } = useBranchDepartments(id);
  const { data: employees = [] }   = useBranchEmployees(id);
  const { data: holidays = [] }    = useBranchHolidays(id);
  const { data: analytics }        = useBranchAnalytics(id);
  const { data: auditLogs = [] }   = useBranchAudit(id);

  const addH = useAddBranchHoliday(id);
  const updH = useUpdateBranchHoliday(id);
  const delH = useDeleteBranchHoliday(id);

  const [hModal, setHModal]   = useState(false);
  const [hEdit, setHEdit]     = useState(null);
  const [hForm, setHForm]     = useState(EMPTY_H);
  const [hDelete, setHDelete] = useState(null);

  const openAddH  = () => { setHEdit(null); setHForm(EMPTY_H); setHModal(true); };
  const openEditH = (h) => { setHEdit(h); setHForm({ name: h.name, date: h.date?.slice(0, 10), type: h.type, optional: h.optional }); setHModal(true); };

  const saveH = async () => {
    if (!hForm.name || !hForm.date) return showToast("Holiday name and date are required", "error");
    try {
      if (hEdit) { await updH.mutateAsync({ hid: hEdit.id, ...hForm }); showToast("Holiday updated", "success"); }
      else       { await addH.mutateAsync(hForm); showToast("Holiday added", "success"); }
      setHModal(false);
    } catch (e) { showToast(e?.response?.data?.message || "Failed to save holiday", "error"); }
  };
  const removeH = async () => {
    try { await delH.mutateAsync(hDelete.id); showToast("Holiday deleted", "success"); setHDelete(null); }
    catch { showToast("Failed to delete holiday", "error"); }
  };

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !branch) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Branch not found.{" "}
      <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/branches")}>Back to list</Text>
    </Alert>
  );

  const address = [branch.address1, branch.address2, branch.city, branch.state, branch.postalCode, branch.country].filter(Boolean).join(", ");

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/branches")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <Avatar size={48} radius="md" variant="gradient" gradient={{ from: "blue", to: "indigo" }}><IconBuilding size={24} /></Avatar>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{branch.name}</Text>
              <Badge color={branch.status === "Active" ? "green" : "gray"} variant="light" radius="xl">{branch.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{branch.code || "—"} · {branch.type || "Branch"} · {[branch.city, branch.country].filter(Boolean).join(", ") || "—"}</Text>
          </div>
        </Group>
        <AppButton variant="default" onClick={() => navigate("/branches")}>All Branches</AppButton>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"   leftSection={<IconBuilding size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="departments" leftSection={<IconBuildingCommunity size={15} />}>Departments</Tabs.Tab>
          <Tabs.Tab value="employees"  leftSection={<IconUsers size={15} />}>Employees</Tabs.Tab>
          <Tabs.Tab value="holidays"   leftSection={<IconCalendarEvent size={15} />}>Holiday Calendar</Tabs.Tab>
          <Tabs.Tab value="analytics"  leftSection={<IconChartBar size={15} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="audit"      leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        {/* OVERVIEW */}
        <Tabs.Panel value="overview">
          <AppSection title="Branch Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Branch Name" value={branch.name} />
              <Field label="Branch Code" value={branch.code} />
              <Field label="Type" value={branch.type} />
              <Field label="Location" value={branch.location || [branch.city, branch.state].filter(Boolean).join(", ")} />
              <Field label="Branch Head" value={branch.headName} />
              <Field label="Timezone" value={branch.timezone} />
              <Field label="Phone" value={branch.phone} />
              <Field label="Email" value={branch.email} />
              <Field label="Status" value={branch.status} />
              <Field label="Created Date" value={fmtDate(branch.createdAt)} />
            </SimpleGrid>
            <Divider my="md" />
            <Field label="Address" value={address} />
          </AppSection>
        </Tabs.Panel>

        {/* DEPARTMENTS */}
        <Tabs.Panel value="departments">
          <AppSection noPadding title="Departments" sub={`${departments.length} in this branch`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Department", "Code", "Head", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {departments.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No departments in this branch" /></Table.Td></Table.Tr>
                  ) : departments.map((d) => (
                    <Table.Tr key={d.id}>
                      <Table.Td><Text size="sm" fw={600}>{d.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{d.code || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{d.headName || "—"}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={d.status === "Active" ? "green" : "gray"} radius="xl">{d.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* EMPLOYEES */}
        <Tabs.Panel value="employees">
          <AppSection noPadding title="Employees" sub={`${employees.length} assigned`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Employee ID", "Name", "Department", "Designation", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {employees.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No employees in this branch" /></Table.Td></Table.Tr>
                  ) : employees.map((e) => (
                    <Table.Tr key={e.id}>
                      <Table.Td><Text size="sm" fw={600}>{e.employeeId}</Text></Table.Td>
                      <Table.Td><Group gap="sm" wrap="nowrap"><Avatar size={28} radius="xl" color="blue" variant="light">{e.name?.[0]}</Avatar><Text size="sm">{e.name}</Text></Group></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{e.department || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{e.designation || "—"}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={e.status === "Active" ? "green" : "gray"} radius="xl">{e.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* HOLIDAY CALENDAR */}
        <Tabs.Panel value="holidays">
          <AppSection noPadding title="Holiday Calendar" sub={`${holidays.length} holidays`}
            action={canEdit ? <AppButton size="xs" leftSection={<IconPlus size={14} />} onClick={openAddH}>Add Holiday</AppButton> : null}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Holiday", "Date", "Type", "Scope", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {holidays.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No holidays configured" /></Table.Td></Table.Tr>
                  ) : holidays.map((h) => (
                    <Table.Tr key={h.id}>
                      <Table.Td><Text size="sm" fw={600}>{h.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{fmtDate(h.date)}</Text></Table.Td>
                      <Table.Td><Badge variant="light" radius="xl">{h.type}</Badge></Table.Td>
                      <Table.Td><Badge variant="light" color={h.branchId ? "blue" : "gray"} radius="xl">{h.branchId ? "Branch" : "Company"}</Badge></Table.Td>
                      <Table.Td>
                        {canEdit && h.branchId ? (
                          <Group gap="xs">
                            <ActionIcon variant="light" color="blue" size="sm" onClick={() => openEditH(h)}><IconPencil size={13} /></ActionIcon>
                            <ActionIcon variant="light" color="red" size="sm" onClick={() => setHDelete(h)}><IconTrash size={13} /></ActionIcon>
                          </Group>
                        ) : <Text size="xs" c="dimmed">—</Text>}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* ANALYTICS */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} mb="lg">
            <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={analytics?.cards?.total ?? 0} color="blue" />
            <AppStatCard icon={<IconBuildingCommunity size={22} />} label="Departments" value={analytics?.cards?.departments ?? 0} color="green" />
            <AppStatCard icon={<IconUserCheck size={22} />} label="Attendance %" value={`${analytics?.cards?.attendancePct ?? 0}%`} color="violet" />
            <AppStatCard icon={<IconChartBar size={22} />} label="Open Positions" value={analytics?.cards?.openPositions ?? 0} color="orange" />
            <AppStatCard icon={<IconTicket size={22} />} label="Open Tickets" value={analytics?.cards?.openTickets ?? 0} color="red" />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <AppSection title="Employee Distribution (by Status)">
              {analytics?.statusDistribution?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={analytics.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {analytics.statusDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
            <AppSection title="Department Distribution">
              {analytics?.departmentDistribution?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.departmentDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
          </SimpleGrid>
        </Tabs.Panel>

        {/* AUDIT LOGS */}
        <Tabs.Panel value="audit">
          <AppSection noPadding title="Audit Logs" sub={`${auditLogs.length} events`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Action", "Details", "By", "When"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {auditLogs.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No audit history yet" /></Table.Td></Table.Tr>
                  ) : auditLogs.map((l) => (
                    <Table.Tr key={l.id}>
                      <Table.Td><Badge variant="light" radius="xl">{l.action}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{l.details || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{l.actorName || "System"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{fmtDateTime(l.createdAt)}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      {/* Holiday add/edit modal */}
      <AppModal opened={hModal} onClose={() => setHModal(false)} title={hEdit ? "Edit Holiday" : "Add Holiday"}
        icon={<IconCalendarEvent size={16} color="#3b82f6" />} iconColor="#3b82f6">
        <Stack gap="md">
          <AppInput label="Holiday Name *" value={hForm.name} onChange={(e) => setHForm({ ...hForm, name: e.currentTarget.value })} />
          <AppInput type="date" label="Date *" value={hForm.date} onChange={(e) => setHForm({ ...hForm, date: e.currentTarget.value })} />
          <AppInput type="select" label="Type" data={HOLIDAY_TYPES} value={hForm.type} onChange={(v) => setHForm({ ...hForm, type: v })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setHModal(false)}>Cancel</AppButton>
            <AppButton loading={addH.isPending || updH.isPending} onClick={saveH}>{hEdit ? "Save Changes" : "Add Holiday"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      <AppModal opened={!!hDelete} onClose={() => setHDelete(null)} title="Delete Holiday"
        icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{hDelete?.name}</Text>?</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setHDelete(null)}>Cancel</Button>
            <Button color="red" onClick={removeH} loading={delH.isPending}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
