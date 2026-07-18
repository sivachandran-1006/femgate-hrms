import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Group, Text, Button, ActionIcon, Menu, ScrollArea, Loader, Box, Tabs, SimpleGrid, Paper, Badge, Avatar, Stack, Select,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconArrowsMaximize, IconArrowsMinimize, IconZoomIn, IconZoomOut, IconPrinter,
  IconFileExport, IconUsers, IconBuildingCommunity, IconBuilding, IconUserStar,
  IconUser, IconHierarchy, IconChartBar, IconAlertTriangle,
  IconPlus, IconMinus, IconEye, IconChevronDown, IconChevronRight,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import CenteredOrgTree from "./CenteredOrgTree";

const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];
const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

const flatten = (nodes, out = []) => { nodes.forEach((n) => { out.push(n); flatten(n.children || [], out); }); return out; };

// ─── Node card (Zoho-style) ──────────────────────────────────────────────────
function NodeCard({ node, onToggle, expanded, hasChildren, onView, onTeam, compact }) {
  const av = getAvatarColor(node.name);
  const isExecutive = node.designation?.toLowerCase().includes("director") || node.designation?.toLowerCase().includes("head") || node.designation?.toLowerCase().includes("ceo");

  return (
    <Paper
      withBorder
      radius="md"
      p={compact ? "sm" : "md"}
      shadow="sm"
      style={{
        minWidth: 260,
        maxWidth: 280,
        position: "relative",
        border: isExecutive ? "2px solid var(--mantine-color-blue-5)" : "1px solid var(--mantine-color-gray-2)",
        background: isExecutive ? "linear-gradient(135deg, #f0f7ff, #ffffff)" : "white",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      {/* Header with avatar and collapse button */}
      <Group gap="sm" wrap="nowrap" align="flex-start" mb="sm">
        <Avatar
          size={compact ? 40 : 48}
          radius="xl"
          color={av.color}
          style={{
            background: av.bg,
            color: av.color,
            fontWeight: 700,
            fontSize: compact ? 14 : 16,
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {getInitials(node.name)}
        </Avatar>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Group gap={4} wrap="nowrap" justify="space-between">
            <Text size="sm" fw={700} truncate style={{ color: "#1a1a1a" }}>{node.name}</Text>
            {isExecutive && <Badge size="xs" color="blue" radius="xs">Senior</Badge>}
          </Group>
          <Text size="xs" c="dimmed" truncate style={{ marginTop: 2 }}>{node.designation || "—"}</Text>
        </div>
      </Group>

      {/* Department & Status Badges */}
      <Group gap={4} mb="md" wrap="wrap">
        <Badge
          size="sm"
          variant="light"
          radius="sm"
          style={{ fontSize: "10px", fontWeight: 600 }}
        >
          {node.department || "—"}
        </Badge>
        <Badge
          size="sm"
          color={STATUS_COLOR[node.status] || "gray"}
          variant="dot"
          radius="sm"
          style={{ fontSize: "10px", fontWeight: 600 }}
        >
          {node.status}
        </Badge>
      </Group>

      {/* Employee Info */}
      <Stack gap={4} mb="md" style={{ borderTop: "1px solid var(--mantine-color-gray-1)", paddingTop: "sm" }}>
        <Group gap={6} justify="space-between">
          <Group gap={4}>
            <Text size="xs" c="dimmed" fw={500}>ID:</Text>
            <Text size="xs" fw={600} c="blue">{node.employeeId}</Text>
          </Group>
          <Group gap={4}>
            <IconUsers size={14} style={{ color: "var(--mantine-color-gray-6)" }} />
            <Text size="xs" fw={600}>{node.directReports || 0}</Text>
          </Group>
        </Group>
      </Stack>

      {/* Action buttons */}
      <Group gap={4} justify="space-between">
        <Group gap={4}>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="blue"
            title="View Profile"
            onClick={() => onView(node)}
            style={{ transition: "all 0.15s" }}
          >
            <IconEye size={14} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="blue"
            title="View Team"
            onClick={() => onTeam(node)}
            style={{ transition: "all 0.15s" }}
          >
            <IconUsers size={14} />
          </ActionIcon>
        </Group>
        {hasChildren && (
          <ActionIcon
            size="sm"
            variant="light"
            color="blue"
            title={expanded ? "Collapse" : "Expand"}
            onClick={() => onToggle(node.id)}
          >
            {expanded ? <IconMinus size={14} /> : <IconPlus size={14} />}
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}

// ─── Recursive tree node with visual cards and connectors ─────────────────────────────────
function TreeNode({ node, expandedSet, onToggle, onView, onTeam, depth = 0, isLast = true, showConnector = false }) {
  const hasChildren = (node.children || []).length > 0;
  const expanded = expandedSet.has(node.id);
  const childrenList = node.children || [];

  return (
    <div style={{ position: "relative", paddingLeft: depth > 0 ? 60 : 0 }}>
      {showConnector && depth > 0 && (
        <>
          <div style={{
            position: "absolute", left: -30, top: -25, width: 30, height: 50,
            borderLeft: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1",
            borderBottomLeftRadius: 8,
          }} />
          {!isLast && (
            <div style={{
              position: "absolute", left: -30, top: 25, width: 2, height: "100%",
              background: "#cbd5e1",
            }} />
          )}
        </>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, position: "relative", zIndex: 1 }}>
        {hasChildren && (
          <ActionIcon
            size="lg"
            variant="light"
            onClick={() => onToggle(node.id)}
            style={{ marginTop: 10, flexShrink: 0 }}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
          </ActionIcon>
        )}
        {!hasChildren && <div style={{ width: 40, flexShrink: 0 }} />}

        <NodeCard node={node} expanded={expanded} hasChildren={hasChildren} onToggle={onToggle} onView={onView} onTeam={onTeam} compact={false} />
      </div>

      {hasChildren && expanded && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: -10, height: 30, width: "2px", background: "#cbd5e1" }} />
          <div>
            {childrenList.map((child, idx) => (
              <TreeNode
                key={child.id}
                node={child}
                expandedSet={expandedSet}
                onToggle={onToggle}
                onView={onView}
                onTeam={onTeam}
                depth={depth + 1}
                isLast={idx === childrenList.length - 1}
                showConnector={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: treeData, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: analytics } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: vacant } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: branchesRes } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const branches = branchesRes || [];

  const tree = treeData?.tree || [];
  const flat = treeData?.flat || [];

  const [zoom, setZoom]         = useState(1);
  const [levels, setLevels]     = useState("All");
  const printRef = useRef(null);

  // Prune the tree to N levels deep (for the "Levels" control)
  const pruneLevels = (nodes, maxDepth, depth = 1) =>
    (nodes || []).map((n) => ({
      ...n,
      children: depth >= maxDepth ? [] : pruneLevels(n.children || [], maxDepth, depth + 1),
    }));
  const visibleRoots = levels === "All" ? tree : pruneLevels(tree, Number(levels));

  const onView = (node) => navigate(`/employees/${node.id}`);

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
            <Group justify="space-between" wrap="wrap">
              <Group gap="sm">
                <Group gap={6}>
                  <Text size="xs" c="dimmed" fw={500}>Levels</Text>
                  <Select size="xs" w={110} value={levels} onChange={setLevels}
                    data={["All", "2", "3", "4"].map((v) => ({ value: v, label: v === "All" ? "All Levels" : `${v} Levels` }))} />
                </Group>
              </Group>
              <Group gap={4}>
                <Button size="xs" variant="default" onClick={() => setZoom(1)}>Fit</Button>
                <ActionIcon variant="default" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} title="Zoom out"><IconZoomOut size={16} /></ActionIcon>
                <Text size="xs" w={40} ta="center" fw={600}>{Math.round(zoom * 100)}%</Text>
                <ActionIcon variant="default" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} title="Zoom in"><IconZoomIn size={16} /></ActionIcon>
              </Group>
            </Group>
          </AppSection>

          {flat.length === 0 ? (
            <AppEmptyState icon={<IconHierarchy size={24} />} message="Organization structure not configured" sub="Set reporting managers on employees to build the chart." />
          ) : (
            <AppSection p={0} style={{ overflow: "hidden" }}>
              <ScrollArea h="calc(100vh - 320px)" type="auto">
                <div ref={printRef} style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s", padding: "48px 60px", minWidth: "fit-content", background: "radial-gradient(circle at 50% 0, #faf5ff 0, #f8fafc 45%)" }}>
                  <CenteredOrgTree roots={visibleRoots} onView={onView} />
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
          <Stack gap="xl">
            {/* Open Designations */}
            <Box>
              <Group mb="md" align="flex-end">
                <IconUserStar size={20} style={{ color: "var(--mantine-color-blue-6)" }} />
                <div style={{ flex: 1 }}>
                  <Text fw={700} size="lg">Open Designations</Text>
                  <Text size="sm" c="dimmed">{vacant?.openDesignations?.length || 0} positions need to be filled</Text>
                </div>
                <Badge size="lg" color="blue" variant="light">{vacant?.openDesignations?.length || 0}</Badge>
              </Group>
              {(vacant?.openDesignations || []).length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {(vacant?.openDesignations || []).map((d) => (
                    <Paper key={d.id} withBorder radius="lg" p="md" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
                      <Group justify="space-between" mb="sm">
                        <Text fw={600} size="sm">{d.name}</Text>
                        <Badge color="blue" variant="filled" radius="sm">Level {d.level}</Badge>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">Department:</Text>
                        <Badge variant="light" radius="xs">{d.department || "—"}</Badge>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              ) : (
                <Paper withBorder radius="lg" p="lg" ta="center">
                  <Text size="sm" c="dimmed">All designations are filled</Text>
                </Paper>
              )}
            </Box>

            {/* Unassigned Reporting */}
            <Box>
              <Group mb="md" align="flex-end">
                <IconUsers size={20} style={{ color: "var(--mantine-color-orange-6)" }} />
                <div style={{ flex: 1 }}>
                  <Text fw={700} size="lg">Employees Without Manager</Text>
                  <Text size="sm" c="dimmed">{vacant?.unassignedReporting?.length || 0} employees need reporting manager assignment</Text>
                </div>
                <Badge size="lg" color="orange" variant="light">{vacant?.unassignedReporting?.length || 0}</Badge>
              </Group>
              {(vacant?.unassignedReporting || []).length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {(vacant?.unassignedReporting || []).map((e) => (
                    <Paper key={e.id} withBorder radius="lg" p="md" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
                      <Group justify="space-between" mb="sm">
                        <Text fw={600} size="sm" truncate>{e.name}</Text>
                        <Badge color="orange" variant="filled" radius="xs" size="sm">Unassigned</Badge>
                      </Group>
                      <Stack gap="xs">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Designation:</Text>
                          <Text size="xs" fw={500}>{e.designation || "—"}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Department:</Text>
                          <Badge variant="light" radius="xs" size="sm">{e.department || "—"}</Badge>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              ) : (
                <Paper withBorder radius="lg" p="lg" ta="center">
                  <Text size="sm" c="dimmed">All employees have assigned managers</Text>
                </Paper>
              )}
            </Box>

            {/* Vacant Department Heads */}
            <Box>
              <Group mb="md" align="flex-end">
                <IconBuildingCommunity size={20} style={{ color: "var(--mantine-color-red-6)" }} />
                <div style={{ flex: 1 }}>
                  <Text fw={700} size="lg">Departments Without Heads</Text>
                  <Text size="sm" c="dimmed">{vacant?.vacantDeptHeads?.length || 0} departments need head assignments</Text>
                </div>
                <Badge size="lg" color="red" variant="light">{vacant?.vacantDeptHeads?.length || 0}</Badge>
              </Group>
              {(vacant?.vacantDeptHeads || []).length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {(vacant?.vacantDeptHeads || []).map((d) => (
                    <Paper key={d.id} withBorder radius="lg" p="md" style={{ background: "linear-gradient(135deg, #fee2e2, #fecaca)" }}>
                      <Group justify="space-between" mb="sm">
                        <Text fw={600} size="sm">{d.name}</Text>
                        <Badge color="red" variant="filled" radius="sm">No Head</Badge>
                      </Group>
                      <Text size="xs" c="dimmed">This department requires immediate head assignment</Text>
                    </Paper>
                  ))}
                </SimpleGrid>
              ) : (
                <Paper withBorder radius="lg" p="lg" ta="center">
                  <Text size="sm" c="dimmed">All departments have heads assigned</Text>
                </Paper>
              )}
            </Box>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
