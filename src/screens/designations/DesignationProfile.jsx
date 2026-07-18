import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Avatar,
  Loader, Box, Alert, ActionIcon, Divider,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconArrowLeft, IconBriefcase, IconUsers, IconChartBar, IconClipboardList,
  IconAlertCircle, IconSitemap, IconChevronDown, IconUserCheck,
} from "@tabler/icons-react";

import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const MOCK_DESIGNATIONS = [
  { id: "g1", name: "Senior Manager", code: "SM", department: { name: "Engineering" }, departmentId: "d1", level: 6, levelName: "6 — Manager", grade: "B1", employmentCategory: "Full-time", employeeCount: 8, status: "Active", description: "Leads a team of engineers and owns delivery for a product area.", createdAt: "2024-02-10T00:00:00Z" },
  { id: "g2", name: "Software Engineer", code: "SE", department: { name: "Engineering" }, departmentId: "d1", level: 3, levelName: "3 — Executive", grade: "A2", employmentCategory: "Full-time", employeeCount: 21, status: "Active", description: "Builds and maintains product features across the stack.", createdAt: "2024-01-20T00:00:00Z" },
  { id: "g3", name: "HR Executive", code: "HRE", department: { name: "HR" }, departmentId: "d3", level: 3, levelName: "3 — Executive", grade: "A3", employmentCategory: "Full-time", employeeCount: 5, status: "Active", description: "Handles recruitment, onboarding and employee relations.", createdAt: "2024-03-05T00:00:00Z" },
  { id: "g4", name: "Finance Analyst", code: "FA", department: { name: "Finance" }, departmentId: "d4", level: 4, levelName: "4 — Senior Executive", grade: "B2", employmentCategory: "Contract", employeeCount: 3, status: "Inactive", description: "Prepares financial reports and assists with budgeting.", createdAt: "2024-04-12T00:00:00Z" },
];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Field = ({ label, value }) => (
  <Box>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text>
    <Text size="sm" fw={500}>{value || "—"}</Text>
  </Box>
);

export default function DesignationProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: rawDesig, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const desig = rawDesig ?? MOCK_DESIGNATIONS.find((m) => String(m.id) === String(id)) ?? MOCK_DESIGNATIONS[0];
  const { data: employees = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: chain }          = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: analytics }      = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: auditLogs = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (!desig) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Designation not found.{" "}
      <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/designations")}>Back to list</Text>
    </Alert>
  );

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/designations")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <Avatar size={48} radius="md" color="blue" variant="light"><IconBriefcase size={24} /></Avatar>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{desig.name}</Text>
              <Badge color={desig.status === "Active" ? "green" : "gray"} variant="light" radius="xl">{desig.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{desig.code || "—"} · {desig.levelName || `Level ${desig.level}`} · Grade {desig.grade || "—"}</Text>
          </div>
        </Group>
        <AppButton variant="default" onClick={() => navigate("/designations")}>All Designations</AppButton>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"  leftSection={<IconBriefcase size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="employees" leftSection={<IconUsers size={15} />}>Employees</Tabs.Tab>
          <Tabs.Tab value="hierarchy" leftSection={<IconSitemap size={15} />}>Hierarchy</Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={15} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="audit"     leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        {/* OVERVIEW */}
        <Tabs.Panel value="overview">
          <AppSection title="Designation Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Designation Name" value={desig.name} />
              <Field label="Designation Code" value={desig.code} />
              <Field label="Department" value={desig.department?.name} />
              <Field label="Level" value={desig.levelName || `Level ${desig.level}`} />
              <Field label="Grade" value={desig.grade} />
              <Field label="Employment Category" value={desig.employmentCategory} />
              <Field label="Status" value={desig.status} />
              <Field label="Created Date" value={fmtDate(desig.createdAt)} />
            </SimpleGrid>
            <Divider my="md" />
            <Field label="Description" value={desig.description} />
          </AppSection>
        </Tabs.Panel>

        {/* EMPLOYEES */}
        <Tabs.Panel value="employees">
          <AppSection noPadding title="Employees" sub={`${employees.length} assigned`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Employee ID", "Name", "Department", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {employees.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No employees with this designation" /></Table.Td></Table.Tr>
                  ) : employees.map((e) => (
                    <Table.Tr key={e.id}>
                      <Table.Td><Text size="sm" fw={600}>{e.employeeId}</Text></Table.Td>
                      <Table.Td><Group gap="sm" wrap="nowrap"><Avatar size={28} radius="xl" color="blue" variant="light">{e.name?.[0]}</Avatar><Text size="sm">{e.name}</Text></Group></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{e.department || "—"}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={e.status === "Active" ? "green" : "gray"} radius="xl">{e.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* HIERARCHY — tree view */}
        <Tabs.Panel value="hierarchy">
          <SimpleGrid cols={{ base: 1, md: 2 }} mb="lg">
            <AppSection title="Direct Relationship">
              <Stack gap="sm">
                <Field label="Parent Designation (higher)" value={chain?.parent?.name ? `${chain.parent.name} (${chain.parent.levelName})` : "— (top level)"} />
                <Divider />
                <Field label="Current" value={`${desig.name} (${desig.levelName || `Level ${desig.level}`})`} />
                <Divider />
                <Field label="Child Designation (lower)" value={chain?.child?.name ? `${chain.child.name} (${chain.child.levelName})` : "— (lowest level)"} />
              </Stack>
            </AppSection>

            <AppSection title="Full Hierarchy (Top → Bottom)">
              <Stack gap={6}>
                {(chain?.chain || []).map((c, i) => {
                  const isCurrent = c.id === desig.id;
                  return (
                    <Box key={c.id}>
                      <Group gap="sm" wrap="nowrap"
                        style={{ padding: "8px 12px", borderRadius: 8, background: isCurrent ? "var(--mantine-color-blue-light)" : "transparent", border: isCurrent ? "1px solid var(--mantine-color-blue-3)" : "1px solid transparent" }}>
                        <Badge size="sm" variant={isCurrent ? "filled" : "light"} radius="xl">L{c.level}</Badge>
                        <Text size="sm" fw={isCurrent ? 700 : 500}>{c.name}</Text>
                        <Text size="xs" c="dimmed">{c.levelName}</Text>
                      </Group>
                      {i < (chain || []).length - 1 && (
                        <Group justify="center" my={-2}><IconChevronDown size={14} color="var(--mantine-color-gray-5)" /></Group>
                      )}
                    </Box>
                  );
                })}
                {(!chain?.chain || (chain || []).length === 0) && <AppEmptyState message="No hierarchy data" py={40} />}
              </Stack>
            </AppSection>
          </SimpleGrid>
        </Tabs.Panel>

        {/* ANALYTICS */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
            <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={analytics?.cards?.total ?? 0} color="blue" />
            <AppStatCard icon={<IconUserCheck size={22} />} label="Active Employees" value={analytics?.cards?.active ?? 0} color="green" />
            <AppStatCard icon={<IconBriefcase size={22} />} label="Open Positions" value={analytics?.cards?.openPositions ?? 0} color="violet" />
            <AppStatCard icon={<IconChartBar size={22} />} label="Vacant Positions" value={analytics?.cards?.vacant ?? 0} color="orange" />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <AppSection title="Designation Distribution (Company)">
              {analytics?.designationDistribution?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.designationDistribution} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
            <AppSection title="Department Distribution">
              {analytics?.departmentDistribution?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.departmentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {analytics.departmentDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No employees yet" py={60} />}
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
    </>
  );
}
