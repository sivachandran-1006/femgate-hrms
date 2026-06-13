import { useState, useMemo } from "react";
import {
  IconSearch, IconFileSpreadsheet, IconPlus,
  IconPencil, IconTrash, IconUsers, IconUserCheck,
  IconUserMinus, IconUserPlus, IconBriefcase,
  IconChevronUp, IconChevronDown,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, TextInput, Select, Avatar,
  Text, Paper, ScrollArea, Table, ActionIcon,
  Pagination, Badge,
} from "@mantine/core";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { AppButton }            from "../../components/ui/AppButton";
import { AppLoader }            from "../../components/ui/AppLoader";
import { AppPageHeader }        from "../../components/ui/AppPageHeader";
import { AppStatCard }          from "../../components/ui/AppStatCard";
import { AppEmptyState }        from "../../components/ui/AppEmptyState";

import { getAvatarColor, getInitials } from "../../utils/helpers";

// ── Dept / status badge maps ────────────────────────────────────────────────

const DEPT_COLOR = {
  IT:         "blue",
  Finance:    "green",
  HR:         "violet",
  Management: "yellow",
  Marketing:  "cyan",
};

const STATUS_COLOR = {
  Present: "green",
  Leave:   "yellow",
  Absent:  "red",
};

const ROWS_PER_PAGE = 8;

// ── Component ─────────────────────────────────────────────────────────────────

const EmployeeList = () => {
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter,   setDeptFilter]   = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [sortKey,      setSortKey]      = useState("name");
  const [sortDir,      setSortDir]      = useState("asc");

  const { data: employees = [], isLoading, isError } = useFetchAllEmployees();

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
  const presentCount = employees.filter((e) => e.status === "Present").length;
  const leaveCount   = employees.filter((e) => e.status === "Leave").length;
  const newJoiners   = employees.filter((e) => (e.joiningDate || "").startsWith("2024")).length;
  const deptCount    = new Set(employees.map((e) => e.department)).size;

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <IconChevronUp size={12} style={{ opacity: 0.25 }} />;
    return sortDir === "asc"
      ? <IconChevronUp   size={12} color="var(--mantine-color-blue-6)" />
      : <IconChevronDown size={12} color="var(--mantine-color-blue-6)" />;
  };

  if (isLoading) return <AppLoader fullScreen />;
  if (isError)   return <Text c="red">Failed to load employees.</Text>;

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
            >
              Export Excel
            </AppButton>
            <AppButton
              leftSection={<IconPlus size={15} />}
              size="sm"
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
            style={{ minWidth: 150 }}
          />
          <Select
            size="sm"
            radius="md"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v || "All"); setCurrentPage(1); }}
            data={["All","Present","Leave","Absent"].map((s) => ({ value: s, label: s === "All" ? "All Status" : s }))}
            style={{ minWidth: 130 }}
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
                      cursor:        key !== "_actions" ? "pointer" : "default",
                      userSelect:    "none",
                      fontSize:      11,
                      fontWeight:    700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color:         "var(--mantine-color-gray-6)",
                      whiteSpace:    "nowrap",
                    }}
                  >
                    <Group gap={4} wrap="nowrap">
                      {label}
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
                  <Table.Tr key={emp._id}>

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
                        <div>
                          <Text size="sm" fw={600} lh={1.3}>{emp.name}</Text>
                          <Text size="xs" c="dimmed" lh={1.3}>{emp.email}</Text>
                        </div>
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
                      <Text size="sm" c="dimmed">{emp.joinDate}</Text>
                    </Table.Td>

                    {/* Actions */}
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" color="blue" size="sm" radius="md">
                          <IconPencil size={13} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" radius="md">
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
    </>
  );
};

export default EmployeeList;
