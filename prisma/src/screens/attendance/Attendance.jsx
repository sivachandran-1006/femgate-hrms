import { useEffect, useState } from "react";
import { fetchAttendance, createAttendanceRecord, checkOutAttendance } from "../../api/attendanceApi";
import { Search, Plus, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { 
  Group, Stack, Text, Badge, TextInput, Select, SimpleGrid, Tabs, Progress, Box, Table
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

const TODAY = new Date().toISOString().split("T")[0];
const FMT_DATE = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  try {
    const s = new Date('1970-01-01 ' + checkIn);
    const e = new Date('1970-01-01 ' + checkOut);
    const diff = e - s;
    if (diff <= 0) return "—";
    return Math.floor(diff / 3600000) + "h " + Math.floor((diff % 3600000) / 60000) + "m";
  } catch { return "—"; }
};

const MOCK_ATTENDANCE = [
  // Today
  { _id: "a01", employee: "Mani",       department: "IT",         date: TODAY,        checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present" },
  { _id: "a02", employee: "P Santhosh", department: "IT",         date: TODAY,        checkIn: "09:15 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a03", employee: "C Santhosh", department: "IT",         date: TODAY,        checkIn: "09:30 AM", checkOut: "",         status: "Present" },
  { _id: "a04", employee: "Suriya",     department: "IT",         date: TODAY,        checkIn: "10:20 AM", checkOut: "07:15 PM", status: "Late"    },
  { _id: "a05", employee: "Siva",       department: "Management", date: TODAY,        checkIn: "08:50 AM", checkOut: "05:55 PM", status: "Present" },
  { _id: "a06", employee: "Aravinth",   department: "IT",         date: TODAY,        checkIn: "09:10 AM", checkOut: "",         status: "Present" },
  { _id: "a07", employee: "Safeer",     department: "Finance",    date: TODAY,        checkIn: "",         checkOut: "",         status: "Leave"   },
  { _id: "a08", employee: "Sabari",     department: "IT",         date: TODAY,        checkIn: "09:08 AM", checkOut: "06:05 PM", status: "Present" },
  { _id: "a09", employee: "Vignesh",    department: "IT",         date: TODAY,        checkIn: "",         checkOut: "",         status: "Absent"  },
  // 2026-05-29
  { _id: "a10", employee: "Mani",       department: "IT",         date: "2026-05-29", checkIn: "09:02 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a11", employee: "P Santhosh", department: "IT",         date: "2026-05-29", checkIn: "09:50 AM", checkOut: "06:45 PM", status: "Late"    },
  { _id: "a12", employee: "C Santhosh", department: "IT",         date: "2026-05-29", checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present" },
];

const DEPARTMENTS = ["All", "IT", "HR", "Finance", "Management"];

const Attendance = () => {
  const { show } = useToast();

  const [attendance, setAttendance]     = useState(MOCK_ATTENDANCE);
  const [searchTerm, setSearchTerm]     = useState("");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter]     = useState(TODAY);
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("records");

  const [fName, setFName]     = useState("");
  const [fDept, setFDept]     = useState("IT");
  const [fStatus, setFStatus] = useState("Present");

  const loadAttendance = async () => {
    try {
      const data = await fetchAttendance();
      if (data && data.length > 0) setAttendance(data);
    } catch { /* keep mock */ }
  };
  useEffect(() => { loadAttendance(); }, []);

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

  const deptSummary = ["IT","HR","Finance","Management"].map(dept => ({
    dept,
    present: todayRecords.filter(a => a.department === dept && (a.status === "Present" || a.status === "Late")).length,
    total:   todayRecords.filter(a => a.department === dept).length,
  }));

  const handleCheckIn = async () => {
    if (!fName.trim()) { show("Employee name is required", "error"); return; }
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const isLate = new Date().getHours() >= 10;
    const newRecord = {
      _id: `a${Date.now()}`, employee: fName, department: fDept,
      date: TODAY, checkIn: now, checkOut: "",
      status: fStatus === "Present" && isLate ? "Late" : fStatus,
    };
    try { await createAttendanceRecord({ ...newRecord, status: newRecord.status }); } catch {}
    setAttendance(prev => [newRecord, ...prev]);
    setFName(""); setFDept("IT"); setFStatus("Present");
    setShowModal(false);
    show("Checked in successfully", "success");
  };

  const handleCheckOut = async (id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    try { await checkOutAttendance(id, { checkOut: now }); } catch {}
    setAttendance(prev => prev.map(a => a._id === id ? { ...a, checkOut: now } : a));
    show("Checked out successfully", "success");
  };

  const STATUS_COLORS = {
    Present: "green",
    Late: "yellow",
    Absent: "red",
    Leave: "blue",
  };

  return (
    <Box>
      <AppPageHeader
        title="Attendance"
        sub={`${FMT_DATE(TODAY)} · ${todayRecords.length} records today`}
        action={
          <AppButton leftSection={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Mark Attendance
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <AppStatCard icon={<CheckCircle size={22}/>} label="Present Today" value={todayPresent} color="green" />
        <AppStatCard icon={<Clock size={22}/>}       label="Late Arrivals" value={todayLate}    color="yellow" />
        <AppStatCard icon={<XCircle size={22}/>}     label="Absent Today"  value={todayAbsent}  color="red" />
        <AppStatCard icon={<UserCheck size={22}/>}   label="On Leave"      value={todayLeave}   color="blue" />
      </SimpleGrid>

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
                leftSection={<Search size={15} />}
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
                data={DEPARTMENTS.map(d => ({ value: d, label: d === "All" ? "All Departments" : d }))}
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
                  <Table.Td><Text fz="sm" fw={600}>{calcHours(item.checkIn, item.checkOut)}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[item.status] || "gray"} variant="light" size="sm">
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {item.date === TODAY && !item.checkOut && item.checkIn ? (
                      <AppButton size="xs" color="red" onClick={() => handleCheckOut(item._id)}>
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

      <AppModal opened={showModal} onClose={() => setShowModal(false)} title="Mark Attendance" icon={<CheckCircle size={20} />} iconColor="#10b981" size="sm">
        <Stack gap="md">
          <AppInput label="Employee Name *" placeholder="Full name" value={fName} onChange={(e) => setFName(e.target.value)} />
          <Group grow>
            <Select label="Department" value={fDept} onChange={setFDept} data={["IT","HR","Finance","Management"]} />
            <Select label="Status" value={fStatus} onChange={setFStatus} data={["Present","Absent","Leave","Late"]} />
          </Group>
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
            <AppButton color="green" onClick={handleCheckIn}>Mark Check In</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default Attendance;
