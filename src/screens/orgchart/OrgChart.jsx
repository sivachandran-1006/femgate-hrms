import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack, Group, Text, Paper, Badge, Button, TextInput, Select, Avatar,
  SimpleGrid, SegmentedControl, ActionIcon, Menu, ScrollArea, Table, Loader, Box, Tabs,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconSearch, IconChevronDown, IconChevronRight, IconPlus, IconMinus,
  IconArrowsMaximize, IconArrowsMinimize, IconZoomIn, IconZoomOut, IconPrinter,
  IconFileExport, IconUsers, IconBuildingCommunity, IconBuilding, IconUserStar,
  IconUser, IconHierarchy, IconChartBar, IconAlertTriangle, IconEye, IconUsersGroup,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import { fetchBranches } from "../../api/branchApi";
import { useQuery } from "@tanstack/react-query";
import { useOrgTree, useOrgAnalytics, useOrgVacant } from "../../queries/useOrgChart";

const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];
const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

const flatten = (nodes, out = []) => { nodes.forEach((n) => { out.push(n); flatten(n.children || [], out); }); return out; };

// ─── Node card ────────────────────────────────────────────────────────────────
function NodeCard({ node, onToggle, expanded, hasChildren, onView, onTeam, compact }) {
  const av = getAvatarColor(node.name);
  return (
    <Paper withBorder radius="lg" p={compact ? "sm" : "md"} shadow="xs"
      style={{ minWidth: 220, maxWidth: 240, position: "relative" }}>
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Avatar size={compact ? 36 : 44} radius="xl" color={av.color} style={{ background: av.bg, color: av.color }}>
          {getInitials(node.name)}
        </Avatar>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={700} truncate>{node.name}</Text>
          <Text size="xs" c="dimmed" truncate>{node.designation || "—"}</Text>
          <Group gap={6} mt={4}>
            <Badge size="xs" variant="light" radius="sm">{node.department || "—"}</Badge>
            <Badge size="xs" variant="light" color={STATUS_COLOR[node.status] || "gray"} radius="sm">{node.status}</Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>{node.employeeId} · {node.directReports || 0} reports</Text>
        </div>
      </Group>
      <Group gap={4} mt="xs" justify="space-between">
        <Group gap={4}>
          <ActionIcon size="sm" variant="subtle" title="View Profile" onClick={() => onView(node)}><IconEye size={13} /></ActionIcon>
          <ActionIcon size="sm" variant="subtle" title="View Team" onClick={() => onTeam(node)}><IconUsersGroup size={13} /></ActionIcon>
        </Group>
        {hasChildren && (
          <ActionIcon size="sm" variant="light" title={expanded ? "Collapse" : "Expand"} onClick={() => onToggle(node.id)}>
            {expanded ? <IconMinus size={13} /> : <IconPlus size={13} />}
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}

// ─── Recursive tree node (vertical, indented) ─────────────────────────────────
function TreeNode({ node, expandedSet, onToggle, onView, onTeam, depth = 0 }) {
  const hasChildren = (node.children || []).length > 0;
  const expanded = expandedSet.has(node.id);
  return (
    <div style={{ marginLeft: depth ? 28 : 0, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
        {hasChildren ? (
          <ActionIcon size="sm" variant="subtle" onClick={() => onToggle(node.id)}>
            {expanded ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
          </ActionIcon>
        ) : <span style={{ width: 28 }} />}
        <NodeCard node={node} expanded={expanded} hasChildren={hasChildren} onToggle={onToggle} onView={onView} onTeam={onTeam} compact />
      </div>
      {hasChildren && expanded && (
        <div style={{ borderLeft: "1px dashed var(--mantine-color-gray-4)", marginLeft: 14 }}>
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} expandedSet={expandedSet} onToggle={onToggle} onView={onView} onTeam={onTeam} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const navigate = useNavigate();
  const { data: treeData, isLoading } = useOrgTree();
  const { data: analytics } = useOrgAnalytics();
  const { data: vacant } = useOrgVacant();
  const { data: branchesRes } = useQuery({ queryKey: ["branches"], queryFn: () => fetchBranches().then((r) => r.data?.data ?? r.data ?? []) });
  const branches = branchesRes || [];

  const tree = treeData?.tree || [];
  const flat = treeData?.flat || [];

  const [viewMode, setViewMode] = useState("tree");      // tree | card | hierarchy
  const [search, setSearch]     = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [branchF, setBranchF]   = useState("All");
  const [deptF, setDeptF]       = useState("All");
  const [statusF, setStatusF]   = useState("All");
  const [zoom, setZoom]         = useState(1);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const printRef = useRef(null);

  // expand all once data arrives
  useEffect(() => { if (flat.length) setExpandedSet(new Set(flat.map((n) => n.id))); }, [treeData]); // eslint-disable-line

  const departments = useMemo(() => ["All", ...new Set(flat.map((e) => e.department).filter(Boolean))], [flat]);

  const allIds = flat.map((n) => n.id);
  const allExpanded = expandedSet.size >= allIds.length && allIds.length > 0;
  const toggle = (id) => setExpandedSet((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const expandAll = () => setExpandedSet(new Set(allIds));
  const collapseAll = () => setExpandedSet(new Set());

  const onView = (node) => navigate(`/employees/${node.id}`);
  const onTeam = (node) => { setViewMode("card"); setSearch(node.name); setSearchBy("name"); };

  // search/filter predicate for flat lists (card & hierarchy views)
  const matches = (e) => {
    const q = search.toLowerCase();
    const field = searchBy === "id" ? (e.employeeId || "")
      : searchBy === "designation" ? (e.designation || "")
      : searchBy === "department" ? (e.department || "") : e.name;
    const branchName = branches.find((b) => b.id === e.branchId)?.name;
    return (!q || field.toLowerCase().includes(q))
      && (branchF === "All" || String(e.branchId) === branchF)
      && (deptF === "All" || e.department === deptF)
      && (statusF === "All" || e.status === statusF);
  };
  const filteredFlat = flat.filter(matches);

  // ─── render ───
  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;

  const handlePrint = () => window.print();
  const handleExport = (fmt) => {
    if (fmt === "excel" || fmt === "csv") {
      const rows = flat.map((e) => ({ EmployeeID: e.employeeId, Name: e.name, Designation: e.designation || "", Department: e.department || "", Manager: flat.find((m) => m.id === e.reportingTo)?.name || "", DirectReports: e.directReports || 0, Status: e.status }));
      const header = Object.keys(rows[0] || { EmployeeID: "", Name: "" });
      const csv = [header.join(","), ...rows.map((r) => header.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a"); a.href = url; a.download = "org-chart.csv"; a.click(); URL.revokeObjectURL(url);
    } else {
      handlePrint();   // PDF / PNG → browser print dialog (Save as PDF)
    }
  };

  return (
    <>
      <AppPageHeader
        title="Organization Chart"
        sub="Visual hierarchy of the company"
        action={
          <Group gap="sm">
            <Button.Group>
              <Button variant="default" size="sm" onClick={expandAll} leftSection={<IconArrowsMaximize size={15} />}>Expand</Button>
              <Button variant="default" size="sm" onClick={collapseAll} leftSection={<IconArrowsMinimize size={15} />}>Collapse</Button>
            </Button.Group>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target><Button variant="default" size="sm" leftSection={<IconFileExport size={15} />}>Export</Button></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => handleExport("pdf")}>PDF</Menu.Item>
                <Menu.Item onClick={() => handleExport("png")}>PNG</Menu.Item>
                <Menu.Item onClick={() => handleExport("excel")}>Excel</Menu.Item>
                <Menu.Item onClick={handlePrint}>Print Layout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="default" size="lg" onClick={handlePrint} title="Print"><IconPrinter size={16} /></ActionIcon>
          </Group>
        }
      />

      <Tabs defaultValue="chart" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="chart"     leftSection={<IconHierarchy size={15} />}>Chart</Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={15} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="vacant"    leftSection={<IconAlertTriangle size={15} />}>Vacant Positions</Tabs.Tab>
        </Tabs.List>

        {/* ── CHART ── */}
        <Tabs.Panel value="chart">
          <AppSection mb="md" p="md">
            <Group gap="sm" wrap="wrap" align="flex-end">
              <SegmentedControl size="sm"
                data={[{ value: "tree", label: "Tree" }, { value: "card", label: "Card" }, { value: "hierarchy", label: "Hierarchy" }]}
                value={viewMode} onChange={setViewMode} />
              <Select label="Search by" w={140} size="sm" value={searchBy} onChange={setSearchBy}
                data={[{ value: "name", label: "Name" }, { value: "id", label: "Employee ID" }, { value: "designation", label: "Designation" }, { value: "department", label: "Department" }]} />
              <TextInput label="Search" placeholder="Search employee…" leftSection={<IconSearch size={15} />}
                value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
              <Select label="Branch" w={140} size="sm" data={["All", ...branches.map((b) => ({ value: String(b.id), label: b.name }))]} value={branchF} onChange={setBranchF} />
              <Select label="Department" w={150} size="sm" data={departments} value={deptF} onChange={setDeptF} />
              <Select label="Status" w={130} size="sm" data={["All", "Active", "Probation", "Notice Period", "Resigned", "Terminated", "Inactive"]} value={statusF} onChange={setStatusF} />
              <Group gap={4}>
                <ActionIcon variant="default" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} title="Zoom out"><IconZoomOut size={16} /></ActionIcon>
                <Text size="xs" w={36} ta="center">{Math.round(zoom * 100)}%</Text>
                <ActionIcon variant="default" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} title="Zoom in"><IconZoomIn size={16} /></ActionIcon>
              </Group>
            </Group>
          </AppSection>

          {flat.length === 0 ? (
            <AppEmptyState message="Organization structure not configured." />
          ) : (
            <AppSection p="md">
              <ScrollArea>
                <div ref={printRef} style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.15s", minWidth: "fit-content" }}>
                  {viewMode === "tree" && tree.map((root) => (
                    <TreeNode key={root.id} node={root} expandedSet={expandedSet} onToggle={toggle} onView={onView} onTeam={onTeam} />
                  ))}

                  {viewMode === "card" && (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                      {filteredFlat.map((e) => (
                        <NodeCard key={e.id} node={e} hasChildren={false} onView={onView} onTeam={onTeam} onToggle={() => {}} />
                      ))}
                    </SimpleGrid>
                  )}

                  {viewMode === "hierarchy" && (
                    <Table striped highlightOnHover>
                      <Table.Thead><Table.Tr>{["Employee", "Designation", "Department", "Reports To", "Direct Reports", "Status"].map((c) => <Table.Th key={c}>{c}</Table.Th>)}</Table.Tr></Table.Thead>
                      <Table.Tbody>
                        {filteredFlat.map((e) => (
                          <Table.Tr key={e.id} style={{ cursor: "pointer" }} onClick={() => onView(e)}>
                            <Table.Td><Group gap="sm" wrap="nowrap"><Avatar size={28} radius="xl">{getInitials(e.name)}</Avatar><Text size="sm" fw={600}>{e.name}</Text></Group></Table.Td>
                            <Table.Td><Text size="sm" c="dimmed">{e.designation || "—"}</Text></Table.Td>
                            <Table.Td><Text size="sm" c="dimmed">{e.department || "—"}</Text></Table.Td>
                            <Table.Td><Text size="sm" c="dimmed">{flat.find((m) => m.id === e.reportingTo)?.name || "—"}</Text></Table.Td>
                            <Table.Td><Badge variant="light" radius="sm">{e.directReports || 0}</Badge></Table.Td>
                            <Table.Td><Badge variant="light" color={STATUS_COLOR[e.status] || "gray"} radius="sm">{e.status}</Badge></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </div>
              </ScrollArea>
            </AppSection>
          )}
        </Tabs.Panel>

        {/* ── ANALYTICS ── */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} mb="lg">
            <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={analytics?.cards?.totalEmployees ?? 0} color="blue" />
            <AppStatCard icon={<IconBuildingCommunity size={22} />} label="Departments" value={analytics?.cards?.totalDepartments ?? 0} color="violet" />
            <AppStatCard icon={<IconBuilding size={22} />} label="Branches" value={analytics?.cards?.totalBranches ?? 0} color="teal" />
            <AppStatCard icon={<IconUserStar size={22} />} label="Managers" value={analytics?.cards?.totalManagers ?? 0} color="orange" />
            <AppStatCard icon={<IconUser size={22} />} label="Individual Contributors" value={analytics?.cards?.totalIndividualContributors ?? 0} color="green" />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <AppSection title="Headcount by Department">
              {analytics?.headcountByDepartment?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.headcountByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
            <AppSection title="Headcount by Branch">
              {analytics?.headcountByBranch?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.headcountByBranch} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {analytics.headcountByBranch.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
          </SimpleGrid>
          <AppSection title="Hierarchy Distribution (by Level)" mt="md">
            {analytics?.hierarchyDistribution?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.hierarchyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="level" tickFormatter={(l) => `L${l}`} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip labelFormatter={(l) => `Level ${l}`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <AppEmptyState message="No data" py={60} />}
          </AppSection>
        </Tabs.Panel>

        {/* ── VACANT ── */}
        <Tabs.Panel value="vacant">
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <AppSection title="Open Designations" sub={`${vacant?.openDesignations?.length || 0} vacant`}>
              <Stack gap="xs">
                {(vacant?.openDesignations || []).map((d) => (
                  <Group key={d.id} justify="space-between"><Text size="sm">{d.name}</Text><Badge variant="light" radius="sm">L{d.level}</Badge></Group>
                ))}
                {!vacant?.openDesignations?.length && <Text size="sm" c="dimmed">None</Text>}
              </Stack>
            </AppSection>
            <AppSection title="Unassigned Reporting" sub={`${vacant?.unassignedReporting?.length || 0} without manager`}>
              <Stack gap="xs">
                {(vacant?.unassignedReporting || []).map((e) => (
                  <Group key={e.id} justify="space-between"><Text size="sm">{e.name}</Text><Text size="xs" c="dimmed">{e.designation || "—"}</Text></Group>
                ))}
                {!vacant?.unassignedReporting?.length && <Text size="sm" c="dimmed">None</Text>}
              </Stack>
            </AppSection>
            <AppSection title="Vacant Department Heads" sub={`${vacant?.vacantDeptHeads?.length || 0} without head`}>
              <Stack gap="xs">
                {(vacant?.vacantDeptHeads || []).map((d) => (
                  <Group key={d.id} justify="space-between"><Text size="sm">{d.name}</Text><Badge variant="light" color="orange" radius="sm">No head</Badge></Group>
                ))}
                {!vacant?.vacantDeptHeads?.length && <Text size="sm" c="dimmed">None</Text>}
              </Stack>
            </AppSection>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
