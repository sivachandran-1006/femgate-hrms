import { useState } from "react";
import {
  IconSearch, IconPlus, IconClock, IconCircleCheck, IconCircleX, IconUserCheck, IconAlertCircle,
} from "@tabler/icons-react";
import {
  Group, Stack, Text, Badge, TextInput, Select, SimpleGrid, Tabs, Progress, Box, Table, Loader, Alert,
} from "@mantine/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";
import { AppButton }      from "../../components/ui/AppButton";
import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppTable }       from "../../components/ui/AppTable";
import { AppSection }     from "../../components/ui/AppSection";
import { getInitials }    from "../../utils/helpers";
import { useToast }       from "../../components/ui/Toast";

import { useAttendanceRecords, useMarkAttendance, useCheckOut } from "../../queries/useAttendance";
import { useFetchAllEmployees } from "../../queries/useEmployees";

const TODAY = new Date().toISOString().split("T")[0];
const FMT_DATE = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

const fmtHours = (h) => {
  if (!h && h !== 0) return "—";
  const whole = Math.floor(h);
  const mins  = Math.round((h - whole) * 60);
  return `${whole}h ${mins}m`;
};

const mapRecord = (r) => ({
  _id:        r.id,
  employee:   r.employee?.name || "—",
  department: r.employee?.department || "—",
  date:       (r.date || "").split("T")[0],
  checkIn:    fmtTime(r.checkIn),
  checkOut:   fmtTime(r.checkOut),
  hours:      r.hoursWorked,
  status:     r.status === "OnLeave" ? "Leave" : r.status,
});

const STATUS_COLORS = {
  Present: "green",
  Late:    "yellow",
  Absent:  "red",
  Leave:   "blue",
  HalfDay: "grape",
};

const Attendance = () => {
  const { show } = useToast();

  const { data: rawRecords = [], isLoading, isError } = useAttendanceRecords();
  const { data: employees = [] } = useFetchAllEmployees();
  const markMut     = useMarkAttendance();
  const checkOutMut = useCheckOut();

  const attendance = rawRecords.map(mapRecord);

  const [searchTerm, setSearchTerm]     = useState("");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter]     = useState(TODAY);
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("records");

  const [fEmployeeId, setFEmployeeId] = useState(null);
  const [fStatus, setFStatus]         = useState("Present");

  const departments = ["All", ...new Set(attendance.map((a) => a.department).filter((d) => d !== "—"))];

  const todayRecords = attendance.filter(a => a.date === TODAY);
  const todayPresent = todayRecords.filter(a => a.status === "Present").length;
  const todayLate    = todayRecords.filter(a => a.status === "Late").length;
  const todayAbsent  = todayRecords.filter(a => a.status === "Absent").length;
  const todayLeave   = todayRecords.filter(a => a.status === "Leave").length;
  const checkedOut   = todayRecords.filter(a => a.checkOut).length;

  const filtered = attendance.filter(a => {
    const matchDate   = !dateFilter || a.date === dateFilter;
    const matchSearch = !searchTerm || a.employee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept   = deptFilter === "All"   || a.department === deptFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchDate && matchSearch && matchDept && matchStatus;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const recs = attendance.filter(a => a.date === iso);
    return {
      day: label,
      Present: recs.filter(a => a.status === "Present").length,
      Late:    recs.filter(a => a.status === "Late").length,
      Absent:  recs.filter(a => a.status === "Absent").length,
    };
  });

  const deptSummary = departments.filter(d => d !== "All").map(dept => ({
    dept,
    present: todayRecords.filter(a => a.department === dept && (a.status === "Present" || a.status === "Late")).length,
    total:   todayRecords.filter(a => a.department === dept).length,
  }));

  const handleMarkAttendance = async () => {
    if (!fEmployeeId) { show("Select an employee", "error"); return; }
    const isLate = new Date().getHours() >= 10;
    const status = fStatus === "Present" && isLate ? "Late" : fStatus;
    try {
      await markMut.mutateAsync({ employeeId: Number(fEmployeeId), date: TODAY, status });
      setFEmployeeId(null); setFStatus("Present");
      setShowModal(false);
      show("Attendance marked", "success");
    } catch (err) {
      show(err?.response?.data?.message || "Failed to mark attendance", "error");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutMut.mutateAsync(id);
      show("Checked out successfully", "success");
    } catch {
      show("Failed to check out", "error");
    }
  };

  return (
    <Box>
      <AppPageHeader
        title="Attendance"
        sub={`${FMT_DATE(TODAY)} · ${todayRecords.length} records today`}
        action={
          <AppButton leftSection={<IconPlus size={16} />} onClick={() => setShowModal(true)}>
            Mark Attendance
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <AppStatCard icon={<IconCircleCheck size={22}/>} label="Present Today" value={todayPresent} color="green" />
        <AppStatCard icon={<IconClock size={22}/>}       label="Late Arrivals" value={todayLate}    color="yellow" />
        <AppStatCard icon={<IconCircleX size={22}/>}     label="Absent Today"  value={todayAbsent}  color="red" />
        <AppStatCard icon={<IconUserCheck size={22}/>}   label="On Leave"      value={todayLeave}   color="blue" />
      </SimpleGrid>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}

      {isError && (
        <Alert icon={<IconAlertCircle size={16}/>} color="red" mb="md">
          Failed to load attendance. Make sure the backend is running and you are logged in.
        </Alert>
      )}

      {!isLoading && !isError && (
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="records">Records</Tabs.Tab>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="records">
          <AppSection noPadding>
            <Group p="md" pb="sm" gap="sm" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <TextInput
                placeholder="Search employee…"
                leftSection={<IconSearch size={15} />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
                size="sm" radius="md"
              />
              <AppInput
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ width: 160 }}
              />
              <Select
                size="sm" radius="md"
                value={deptFilter}
                onChange={v => setDeptFilter(v || "All")}
                data={departments.map(d => ({ value: d, label: d === "All" ? "All Departments" : d }))}
                style={{ minWidth: 150 }}
              />
              <Select
                size="sm" radius="md"
                value={statusFilter}
                onChange={v => setStatusFilter(v || "All")}
                data={["All","Present","Absent","Late","Leave"].map(s => ({ value: s, label: s === "All" ? "All Status" : s }))}
                style={{ minWidth: 130 }}
              />
              <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </Text>
            </Group>

            <AppTable
              headers={["Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Status", "Action"]}
              data={filtered}
              renderRow={(item) => (
                <Table.Tr key={item._id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Box w={32} h={32} style={{ borderRadius: "50%", background: "var(--mantine-color-blue-0)", color: "var(--mantine-color-blue-7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                        {getInitials(item.employee)}
                      </Box>
                      <Text fz="sm" fw={600}>{item.employee}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{item.department}</Text></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{FMT_DATE(item.date)}</Text></Table.Td>
                  <Table.Td><Text fz="sm" fw={500}>{item.checkIn || "—"}</Text></Table.Td>
                  <Table.Td><Text fz="sm" fw={500}>{item.checkOut || "—"}</Text></Table.Td>
                  <Table.Td><Text fz="sm" fw={600}>{fmtHours(item.hours)}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[item.status] || "gray"} variant="light" size="sm">
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {item.date === TODAY && !item.checkOut && item.checkIn ? (
                      <AppButton
                        size="xs"
                        color="red"
                        loading={checkOutMut.isPending && checkOutMut.variables === item._id}
                        disabled={checkOutMut.isPending && checkOutMut.variables !== item._id}
                        onClick={() => handleCheckOut(item._id)}
                      >
                        Check Out
                      </AppButton>
                    ) : item.checkOut ? (
                      <Text fz="xs" c="dimmed">Done</Text>
                    ) : (
                      <Text fz="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              )}
              emptyText="No records found"
            />
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="overview">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <AppSection title="Weekly Attendance (Last 7 Days)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekDays} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="Present" fill="var(--mantine-color-green-5)" radius={[4,4,0,0]} />
                  <Bar dataKey="Late"    fill="var(--mantine-color-yellow-5)" radius={[4,4,0,0]} />
                  <Bar dataKey="Absent"  fill="var(--mantine-color-red-5)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <Group justify="center" mt="sm">
                {[["Present", "green"], ["Late", "yellow"], ["Absent", "red"]].map(([l, c]) => (
                  <Group key={l} gap="xs">
                    <Box w={10} h={10} style={{ borderRadius: 3, background: `var(--mantine-color-${c}-5)` }} />
                    <Text fz="sm" c="dimmed">{l}</Text>
                  </Group>
                ))}
              </Group>
            </AppSection>

            <Stack gap="md">
              <AppSection title="Department Attendance Today">
                {deptSummary.length === 0 && <Text fz="sm" c="dimmed">No records today</Text>}
                {deptSummary.map((d, i) => {
                  const pct = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
                  return (
                    <Box key={d.dept} mb={i < deptSummary.length - 1 ? "sm" : 0}>
                      <Group justify="space-between" mb={4}>
                        <Text fz="sm" fw={500}>{d.dept}</Text>
                        <Text fz="xs" c="dimmed">{d.present}/{d.total || "—"}</Text>
                      </Group>
                      <Progress value={pct} color="green" size="sm" radius="xl" />
                    </Box>
                  );
                })}
              </AppSection>

              <AppSection title="Today's Summary" noPadding>
                <Box p="md" pb="xs">
                  {[
                    { label: "Total Expected", value: todayRecords.length, color: "var(--mantine-color-text)" },
                    { label: "Present",        value: todayPresent,        color: "var(--mantine-color-green-6)" },
                    { label: "Late Arrivals",  value: todayLate,           color: "var(--mantine-color-yellow-6)" },
                    { label: "Absent",         value: todayAbsent,         color: "var(--mantine-color-red-6)" },
                    { label: "On Leave",       value: todayLeave,          color: "var(--mantine-color-blue-6)" },
                    { label: "Checked Out",    value: checkedOut,          color: "var(--mantine-color-violet-6)" },
                  ].map((row, i, arr) => (
                    <Group key={row.label} justify="space-between" py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                      <Text fz="sm" c="dimmed">{row.label}</Text>
                      <Text fz="md" fw={700} style={{ color: row.color }}>{row.value}</Text>
                    </Group>
                  ))}
                </Box>
              </AppSection>
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
      )}

      <AppModal opened={showModal} onClose={() => setShowModal(false)} title="Mark Attendance" icon={<IconCircleCheck size={20} />} iconColor="#10b981" size="sm">
        <Stack gap="md">
          <Select
            label="Employee *"
            placeholder="Select employee"
            searchable
            value={fEmployeeId}
            onChange={setFEmployeeId}
            data={employees.map((e) => ({ value: String(e.id), label: `${e.name} (${e.employeeId})` }))}
          />
          <Select label="Status" value={fStatus} onChange={setFStatus} data={["Present","Absent","Leave","Late"]} />
          <Box p="sm" style={{ background: "var(--mantine-color-green-0)", border: "1px solid var(--mantine-color-green-2)", borderRadius: "var(--mantine-radius-md)" }}>
            <Text fz="sm" c="green" fw={500}>
              Check-in time: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </Text>
            {new Date().getHours() >= 10 && fStatus === "Present" && (
              <Text fz="sm" c="yellow.8" fw={500} mt={4}>Will be marked Late</Text>
            )}
          </Box>
          <Group justify="flex-end" mt="xs">
            <AppButton variant="default" onClick={() => setShowModal(false)}>Cancel</AppButton>
            <AppButton color="green" loading={markMut.isPending} onClick={handleMarkAttendance}>Mark Check In</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default Attendance;
