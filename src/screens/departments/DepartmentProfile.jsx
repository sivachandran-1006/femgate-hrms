import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Avatar,
  Loader, Box, Alert, ActionIcon, Divider,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconArrowLeft, IconBuildingCommunity, IconUsers, IconBriefcase, IconChartBar,
  IconClipboardList, IconAlertCircle, IconUserCheck, IconCurrencyRupee, IconMapPin,
} from "@tabler/icons-react";

import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useDepartment, useDeptEmployees, useDeptDesignations, useDeptAnalytics, useDeptAudit,
} from "../../queries/useDepartments";

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_DEPARTMENTS = [
  { id: "d1", name: "Engineering",  code: "ENG",  headName: "Arjun Kumar",   branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 16, status: "Active",   createdAt: "2024-01-15T00:00:00Z" },
  { id: "d2", name: "Sales",        code: "SLS",  headName: "Rahul Verma",   branch: { name: "Bangalore"  }, branchId: "b2", employeeCount: 9,  status: "Active",   createdAt: "2024-01-20T00:00:00Z" },
  { id: "d3", name: "HR",           code: "HR",   headName: "Priya Sharma",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 5,  status: "Active",   createdAt: "2024-02-01T00:00:00Z" },
  { id: "d4", name: "Finance",      code: "FIN",  headName: "Sneha Nair",    branch: { name: "Mumbai"     }, branchId: "b3", employeeCount: 6,  status: "Active",   createdAt: "2024-02-10T00:00:00Z" },
  { id: "d5", name: "Operations",   code: "OPS",  headName: "Vikram Singh",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 6,  status: "Active",   createdAt: "2024-03-05T00:00:00Z" },
  { id: "d6", name: "Marketing",    code: "MKT",  headName: "Deepika Rao",   branch: { name: "Bangalore"  }, branchId: "b2", employeeCount: 4,  status: "Active",   createdAt: "2024-03-12T00:00:00Z" },
  { id: "d7", name: "Legal",        code: "LGL",  headName: null,            branch: { name: "Mumbai"     }, branchId: "b3", employeeCount: 2,  status: "Inactive", createdAt: "2024-04-01T00:00:00Z" },
  { id: "d8", name: "IT Support",   code: "ITS",  headName: "Arun Prakash",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 3,  status: "Active",   createdAt: "2024-04-15T00:00:00Z" },
];
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Field = ({ label, value }) => (
  <Box>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text>
    <Text size="sm" fw={500}>{value || "—"}</Text>
  </Box>
);

export default function DepartmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: rawDept, isLoading, isError: rawIsError } = useDepartment(id);
  const dept = rawDept ?? MOCK_DEPARTMENTS.find((m) => String(m.id) === String(id)) ?? MOCK_DEPARTMENTS[0];
  const isError = rawIsError && !dept;
  const { data: employees = [] }   = useDeptEmployees(id);
  const { data: designations = [] } = useDeptDesignations(id);
  const { data: analytics }        = useDeptAnalytics(id);
  const { data: auditLogs = [] }   = useDeptAudit(id);

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !dept) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Department not found.{" "}
      <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/departments")}>Back to list</Text>
    </Alert>
  );

  return (
    <>
      {/* Header */}
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/departments")} title="Back">
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Avatar size={48} radius="md" color="blue" variant="light"><IconBuildingCommunity size={24} /></Avatar>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{dept.name}</Text>
              <Badge color={dept.status === "Active" ? "green" : "gray"} variant="light" radius="xl">{dept.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{dept.code || "—"} · {dept.branch?.name || "No branch"}</Text>
          </div>
        </Group>
        <AppButton variant="default" onClick={() => navigate("/departments")}>All Departments</AppButton>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"     leftSection={<IconBuildingCommunity size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="employees"    leftSection={<IconUsers size={15} />}>Employees</Tabs.Tab>
          <Tabs.Tab value="designations" leftSection={<IconBriefcase size={15} />}>Designations</Tabs.Tab>
          <Tabs.Tab value="analytics"    leftSection={<IconChartBar size={15} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="audit"        leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        {/* OVERVIEW */}
        <Tabs.Panel value="overview">
          <AppSection title="Department Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Department Name" value={dept.name} />
              <Field label="Department Code" value={dept.code} />
              <Field label="Status" value={dept.status} />
              <Field label="Branch" value={dept.branch?.name} />
              <Field label="Department Head" value={dept.headName} />
              <Field label="Email Alias" value={dept.emailAlias} />
              <Field label="Cost Center" value={dept.costCenter} />
              <Field label="Budget" value={dept.budget != null ? `₹${Number(dept.budget).toLocaleString("en-IN")}` : null} />
              <Field label="Created Date" value={fmtDate(dept.createdAt)} />
            </SimpleGrid>
            <Divider my="md" />
            <Field label="Description" value={dept.description} />
          </AppSection>
        </Tabs.Panel>

        {/* EMPLOYEES */}
        <Tabs.Panel value="employees">
          <AppSection noPadding title="Employees" sub={`${employees.length} assigned`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee ID", "Name", "Designation", "Reporting Manager", "Status", "Actions"].map((c) => (
                      <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {employees.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No employees in this department" /></Table.Td></Table.Tr>
                  ) : employees.map((e) => (
                    <Table.Tr key={e.id}>
                      <Table.Td><Text size="sm" fw={600}>{e.employeeId}</Text></Table.Td>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar size={28} radius="xl" color="blue" variant="light">{e.name?.[0]}</Avatar>
                          <Text size="sm">{e.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{e.designation || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{e.reportingManager}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={e.status === "Active" ? "green" : "gray"} radius="xl">{e.status}</Badge></Table.Td>
                      <Table.Td>
                        <AppButton size="xs" variant="light" onClick={() => navigate(`/employees`)}>View</AppButton>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* DESIGNATIONS */}
        <Tabs.Panel value="designations">
          <AppSection noPadding title="Designations" sub={`${designations.length} linked`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Designation", "Level", "Status"].map((c) => (
                      <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {designations.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={3}><AppEmptyState message="No designations linked to this department" /></Table.Td></Table.Tr>
                  ) : designations.map((d) => (
                    <Table.Tr key={d.id}>
                      <Table.Td><Text size="sm" fw={600}>{d.name}</Text></Table.Td>
                      <Table.Td><Badge variant="light" radius="xl">Level {d.level}</Badge></Table.Td>
                      <Table.Td><Badge variant="light" color={d.status === "Active" ? "green" : "gray"} radius="xl">{d.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* ANALYTICS */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
            <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={analytics?.cards?.total ?? 0} color="blue" />
            <AppStatCard icon={<IconUserCheck size={22} />} label="Active Employees" value={analytics?.cards?.active ?? 0} color="green" />
            <AppStatCard icon={<IconBriefcase size={22} />} label="Open Positions" value={analytics?.cards?.openPositions ?? 0} color="violet" />
            <AppStatCard icon={<IconChartBar size={22} />} label="Attrition Rate" value={`${analytics?.cards?.attrition ?? 0}%`} color="orange" />
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

            <AppSection title="Designation Distribution">
              {analytics?.designationDistribution?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.designationDistribution}>
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
                <Table.Thead>
                  <Table.Tr>
                    {["Action", "Details", "By", "When"].map((c) => (
                      <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
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
    </>
  );
}
