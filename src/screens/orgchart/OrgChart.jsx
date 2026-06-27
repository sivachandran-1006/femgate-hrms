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
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import { fetchBranches } from "../../api/branchApi";
import { useQuery } from "@tanstack/react-query";
import { useOrgTree, useOrgAnalytics, useOrgVacant } from "../../queries/useOrgChart";
import CenteredOrgTree from "./CenteredOrgTree";

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
  const { data: treeData, isLoading } = useOrgTree();
  const { data: analytics } = useOrgAnalytics();
  const { data: vacant } = useOrgVacant();
  const { data: branchesRes } = useQuery({ queryKey: ["branches"], queryFn: () => fetchBranches().then((r) => r.data?.data ?? r.data ?? []) });
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
