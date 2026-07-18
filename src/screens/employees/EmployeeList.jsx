import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconSearch, IconFileSpreadsheet, IconPlus,
  IconPencil, IconTrash, IconUsers, IconUserCheck,
  IconUserMinus, IconUserPlus, IconBriefcase,
  IconChevronUp, IconChevronDown, IconEye, IconAlertTriangle,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, TextInput, Select, Avatar,
  Text, Paper, ScrollArea, Table, ActionIcon,
  Pagination, Badge, Modal, Button, Stack, ThemeIcon,
} from "@mantine/core";
import EmployeeModal from "./EmployeeModal";

import { AppButton }            from "../../components/ui/AppButton";
import { AppLoader }            from "../../components/ui/AppLoader";
import { AppPageHeader }        from "../../components/ui/AppPageHeader";
import { AppStatCard }          from "../../components/ui/AppStatCard";
import { AppEmptyState }        from "../../components/ui/AppEmptyState";
import { useToast }             from "../../components/ui/Toast";

import { getAvatarColor, getInitials } from "../../utils/helpers";

const EMPTY_FORM = {
  name: "", email: "", phone: "", designation: "",
  department: "Engineering", salary: "", joinDate: "", status: "Active",
};

// ── Dept / status badge maps ────────────────────────────────────────────────

const DEPT_COLOR = {
  IT:         "blue",
  Finance:    "green",
  HR:         "violet",
  Management: "yellow",
  Marketing:  "cyan",
};

const STATUS_COLOR = {
  Active:    "green",
  "On Leave": "yellow",
  Inactive:  "red",
};

const ROWS_PER_PAGE = 8;

// ── Mock fallback data ──────────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  { id: 1,  name: "Aditi Sharma",     email: "aditi.sharma@mgate.com",     phone: "+91 98765 10001", designation: "Software Engineer",       department: "IT",         salary: 850000,  joinDate: "2023-03-14", status: "Active" },
  { id: 2,  name: "Rohan Verma",      email: "rohan.verma@mgate.com",      phone: "+91 98765 10002", designation: "Senior Software Engineer", department: "IT",         salary: 1250000, joinDate: "2021-07-01", status: "Active" },
  { id: 3,  name: "Priya Nair",       email: "priya.nair@mgate.com",       phone: "+91 98765 10003", designation: "QA Engineer",              department: "IT",         salary: 700000,  joinDate: "2022-11-20", status: "On Leave" },
  { id: 4,  name: "Karan Mehta",      email: "karan.mehta@mgate.com",      phone: "+91 98765 10004", designation: "DevOps Engineer",          department: "IT",         salary: 950000,  joinDate: "2024-01-09", status: "Active" },
  { id: 5,  name: "Sneha Kulkarni",   email: "sneha.kulkarni@mgate.com",   phone: "+91 98765 10005", designation: "Finance Manager",          department: "Finance",    salary: 1400000, joinDate: "2019-05-18", status: "Active" },
  { id: 6,  name: "Arjun Reddy",      email: "arjun.reddy@mgate.com",      phone: "+91 98765 10006", designation: "Accountant",               department: "Finance",    salary: 620000,  joinDate: "2022-08-02", status: "Active" },
  { id: 7,  name: "Meera Iyer",       email: "meera.iyer@mgate.com",       phone: "+91 98765 10007", designation: "Payroll Specialist",       department: "Finance",    salary: 680000,  joinDate: "2023-06-10", status: "Inactive" },
  { id: 8,  name: "Vikram Singh",     email: "vikram.singh@mgate.com",     phone: "+91 98765 10008", designation: "HR Manager",               department: "HR",         salary: 1150000, joinDate: "2020-02-25", status: "Active" },
  { id: 9,  name: "Ananya Das",       email: "ananya.das@mgate.com",       phone: "+91 98765 10009", designation: "HR Executive",             department: "HR",         salary: 550000,  joinDate: "2024-04-03", status: "Active" },
  { id: 10, name: "Rahul Gupta",      email: "rahul.gupta@mgate.com",      phone: "+91 98765 10010", designation: "Talent Acquisition Lead",  department: "HR",         salary: 900000,  joinDate: "2021-09-15", status: "On Leave" },
  { id: 11, name: "Divya Menon",      email: "divya.menon@mgate.com",      phone: "+91 98765 10011", designation: "General Manager",          department: "Management", salary: 2200000, joinDate: "2018-01-10", status: "Active" },
  { id: 12, name: "Suresh Pillai",    email: "suresh.pillai@mgate.com",    phone: "+91 98765 10012", designation: "Operations Head",          department: "Management", salary: 1900000, joinDate: "2019-12-01", status: "Active" },
  { id: 13, name: "Neha Joshi",       email: "neha.joshi@mgate.com",       phone: "+91 98765 10013", designation: "Marketing Manager",        department: "Marketing",  salary: 1050000, joinDate: "2022-03-22", status: "Active" },
  { id: 14, name: "Amitabh Rao",      email: "amitabh.rao@mgate.com",      phone: "+91 98765 10014", designation: "Content Strategist",       department: "Marketing",  salary: 600000,  joinDate: "2023-10-05", status: "Active" },
  { id: 15, name: "Ishita Kapoor",    email: "ishita.kapoor@mgate.com",    phone: "+91 98765 10015", designation: "Digital Marketing Exec",   department: "Marketing",  salary: 520000,  joinDate: "2024-06-17", status: "Inactive" },
  { id: 16, name: "Manoj Tiwari",     email: "manoj.tiwari@mgate.com",     phone: "+91 98765 10016", designation: "Backend Developer",        department: "IT",         salary: 800000,  joinDate: "2023-01-30", status: "Active" },
  { id: 17, name: "Pooja Bhatt",      email: "pooja.bhatt@mgate.com",      phone: "+91 98765 10017", designation: "Frontend Developer",       department: "IT",         salary: 780000,  joinDate: "2024-02-14", status: "On Leave" },
  { id: 18, name: "Siddharth Rao",    email: "siddharth.rao@mgate.com",    phone: "+91 98765 10018", designation: "Financial Analyst",        department: "Finance",    salary: 710000,  joinDate: "2022-05-09", status: "Active" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const EmployeeList = () => {
  const navigate = useNavigate();
  const { show: showToast } = useToast();

  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter,   setDeptFilter]   = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [sortKey,      setSortKey]      = useState("name");
  const [sortDir,      setSortDir]      = useState("asc");

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);

  const { data: rawEmployees, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const employees = rawEmployees?.length ? rawEmployees : MOCK_EMPLOYEES;
  const { data: deptList = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  // All departments from DB (fallback to ones present on employees)
  const DEPARTMENTS = deptList.length
    ? deptList.map((d) => d.name)
    : [...new Set(employees.map((e) => e.department).filter(Boolean))];

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditTarget(emp.id);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget, ...payload });
        showToast("Employee updated", "success");
      } else {
        await createMut.mutateAsync(payload);
        showToast("Employee added", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save employee", "error");
    }
  };

  const handleSaveAndInvite = async (payload) => {
    try {
      await createMut.mutateAsync({ ...payload, sendInvite: true });
      showToast(`Employee created — invite sent to ${payload.email}`, "success");
      setModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create employee", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch {
      showToast("Failed to delete employee", "error");
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const departments = useMemo(
    () => ["All", ...new Set(employees.map((e) => e.department).filter(Boolean))],
    [employees],
  );

  const filtered = useMemo(() => {
    let list = employees.filter((e) => {
      const q          = searchTerm.toLowerCase();
      const matchSearch = !q || (e.name || "").toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q) || (e.designation || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      const matchDept   = deptFilter   === "All" || e.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
    list = [...list].sort((a, b) => {
      let va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
      if (sortKey === "salary") { va = Number(va); vb = Number(vb); return sortDir === "asc" ? va - vb : vb - va; }
      va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [employees, searchTerm, statusFilter, deptFilter, sortKey, sortDir]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated    = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
  const totalCount   = employees.length;
  const presentCount = employees.filter((e) => e.status === "Active").length;
  const leaveCount   = employees.filter((e) => e.status === "On Leave").length;
  const newJoiners   = employees.filter((e) => (e.joinDate || "").toString().startsWith("2024") || (e.joinDate || "").toString().startsWith("2025") || (e.joinDate || "").toString().startsWith("2026")).length;
  const deptCount    = new Set(employees.map((e) => e.department)).size;

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <IconChevronUp size={12} style={{ opacity: 0.25 }} />;
    return sortDir === "asc"
      ? <IconChevronUp   size={12} color="var(--mantine-color-blue-6)" />
      : <IconChevronDown size={12} color="var(--mantine-color-blue-6)" />;
  };

  if (isLoading) return <AppLoader fullScreen />;

  return (
    <>
      {/* ── Page Header ── */}
      <AppPageHeader
        title="Employees"
        sub={`${totalCount} team members across ${deptCount} departments`}
        action={
          <Group gap="sm">
            <AppButton
              variant="default"
              leftSection={<IconFileSpreadsheet size={15} />}
              size="sm"
              onClick={() => {
                const rows = employees.map(e => [e.name, e.email, e.designation, e.department, e.status, e.joinDate].join(","));
                const csv = ["Name,Email,Designation,Department,Status,Join Date", ...rows].join("\n");
                const a = document.createElement("a");
                a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                a.download = "employees.csv";
                a.click();
              }}
            >
              Export Excel
            </AppButton>
            <AppButton
              leftSection={<IconPlus size={15} />}
              size="sm"
              onClick={openAdd}
            >
              Add Employee
            </AppButton>
          </Group>
        }
      />

      {/* ── Stat Cards ── */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md" mb="lg">
        <AppStatCard icon={<IconUsers     size={22} />} label="Total Employees" value={totalCount}   color="blue"   trend="+5%"  up />
        <AppStatCard icon={<IconUserCheck size={22} />} label="Present Today"   value={presentCount} color="green"  trend="+2%"  up />
        <AppStatCard icon={<IconUserMinus size={22} />} label="On Leave"        value={leaveCount}   color="yellow" trend="-1%"  up={false} />
        <AppStatCard icon={<IconUserPlus  size={22} />} label="New Joiners"     value={newJoiners}   color="violet" trend="+8%"  up />
        <AppStatCard icon={<IconBriefcase size={22} />} label="Departments"     value={deptCount}    color="cyan" />
      </SimpleGrid>

      {/* ── Table Card ── */}
      <Paper withBorder radius="xl" style={{ overflow: "hidden" }}>

        {/* Toolbar */}
        <Group p="md" pb="sm" gap="sm" wrap="nowrap"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
        >
          <TextInput
            placeholder="Search by name, email or role…"
            leftSection={<IconSearch size={15} />}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: 220 }}
            size="sm"
            radius="md"
          />
          <Select
            size="sm"
            radius="md"
            value={deptFilter}
            onChange={(v) => { setDeptFilter(v || "All"); setCurrentPage(1); }}
            data={departments.map((d) => ({ value: d, label: d === "All" ? "All Departments" : d }))}
            miw={150}
          />
          <Select
            size="sm"
            radius="md"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v || "All"); setCurrentPage(1); }}
            data={["All","Active","On Leave","Inactive"].map((s) => ({ value: s, label: s === "All" ? "All Status" : s }))}
            miw={130}
          />
          <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        {/* Table */}
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 750 }}>
            <Table.Thead style={{ background: "var(--mantine-color-gray-0)" }}>
              <Table.Tr>
                {[
                  { key: "name",        label: "Employee"    },
                  { key: "department",  label: "Department"  },
                  { key: "designation", label: "Designation" },
                  { key: "salary",      label: "Salary"      },
                  { key: "status",      label: "Status"      },
                  { key: "joinDate",    label: "Joined"      },
                  { key: "_actions",    label: "Actions"     },
                ].map(({ key, label }) => (
                  <Table.Th
                    key={key}
                    onClick={key !== "_actions" ? () => handleSort(key) : undefined}
                    style={{
                      cursor:     key !== "_actions" ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Group gap={4} wrap="nowrap">
                      <Text fz={11} fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="gray.6">
                        {label}
                      </Text>
                      {key !== "_actions" && <SortIcon col={key} />}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginated.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <AppEmptyState message="No employees match your filters" />
                  </Table.Td>
                </Table.Tr>
              ) : paginated.map((emp) => {
                const av = getAvatarColor(emp.name);
                return (
                  <Table.Tr key={emp.id}>

                    {/* Employee */}
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar
                          size={36}
                          radius="xl"
                          style={{ background: av.bg, color: av.color, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                        >
                          {getInitials(emp.name)}
                        </Avatar>
                        <Stack gap={2}>
                          <Text size="sm" fw={600} lh={1.3}>{emp.name}</Text>
                          <Text size="xs" c="dimmed" lh={1.3}>{emp.email}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>

                    {/* Department */}
                    <Table.Td>
                      <Badge
                        color={DEPT_COLOR[emp.department] || "gray"}
                        variant="light"
                        size="sm"
                        radius="xl"
                      >
                        {emp.department}
                      </Badge>
                    </Table.Td>

                    {/* Designation */}
                    <Table.Td>
                      <Text size="sm" c="dimmed">{emp.designation}</Text>
                    </Table.Td>

                    {/* Salary */}
                    <Table.Td>
                      <Text size="sm" fw={600}>₹{Number(emp.salary).toLocaleString("en-IN")}</Text>
                    </Table.Td>

                    {/* Status */}
                    <Table.Td>
                      <Badge
                        color={STATUS_COLOR[emp.status] || "gray"}
                        variant="light"
                        size="sm"
                        radius="xl"
                      >
                        {emp.status}
                      </Badge>
                    </Table.Td>

                    {/* Joined */}
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                      </Text>
                    </Table.Td>

                    {/* Actions */}
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" color="gray" size="sm" radius="md" title="View"
                          onClick={() => navigate(`/employees/${emp.id}`)}>
                          <IconEye size={13} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="blue" size="sm" radius="md" title="Edit"
                          onClick={() => openEdit(emp)}>
                          <IconPencil size={13} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" radius="md" title="Delete"
                          onClick={() => setDeleteTarget(emp)}>
                          <IconTrash size={13} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="space-between" align="center" p="md" pt="sm"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Text size="sm" c="dimmed">
              Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            </Text>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
              radius="md"
            />
          </Group>
        )}
      </Paper>

      {/* ── Add / Edit Modal (Wizard) ── */}
      <EmployeeModal
        key={editTarget || "new"}
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        editingEmployee={editTarget ? employees.find(e => e.id === editTarget) : null}
        employees={employees}
        onSave={handleSave}
        onSaveAndInvite={handleSaveAndInvite}
      />

      {/* ── Delete Confirm Modal ── */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        size="sm"
      >
        <Stack gap="md" align="center" ta="center">
          <ThemeIcon size={56} radius="xl" color="red" variant="light">
            <IconAlertTriangle size={26} />
          </ThemeIcon>
          <Text fz="sm">
            Are you sure you want to delete{" "}
            <Text span fw={700}>{deleteTarget?.name}</Text>?
            This will permanently remove their record.
          </Text>
          <Group grow w="100%">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} loading={deleteMut.isPending}>
              Yes, Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default EmployeeList;
