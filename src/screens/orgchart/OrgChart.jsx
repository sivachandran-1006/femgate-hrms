import React, { useState, useRef, useEffect } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, TextInput, Select,
  Avatar, Popover,
} from "@mantine/core";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { getAvatarColor, getInitials } from "../../utils/helpers";

// ─── Org Data ────────────────────────────────────────────────────────────────

const ORG_DATA = {
  id: "ceo",
  name: "Siva",
  designation: "CEO",
  department: "Management",
  email: "siva@company.com",
  phone: "+91 98765 00001",
  joinDate: "2018-01-15",
  children: [
    {
      id: "hr-dir",
      name: "Big Kundi",
      designation: "HR Director",
      department: "HR",
      email: "bigkundi@company.com",
      phone: "+91 98765 00002",
      joinDate: "2019-03-10",
      children: [
        { id: "hr-exec",  name: "Suriya",    designation: "HR Executive",   department: "HR", email: "suriya@company.com",   phone: "+91 98765 00005", joinDate: "2021-06-01", children: [] },
        { id: "hr-coord", name: "P Santhosh",designation: "HR Coordinator", department: "HR", email: "psanthosh@company.com",phone: "+91 98765 00006", joinDate: "2022-01-20", children: [] },
      ],
    },
    {
      id: "eng-mgr",
      name: "Mani",
      designation: "Engineering Manager",
      department: "IT",
      email: "mani@company.com",
      phone: "+91 98765 00003",
      joinDate: "2019-06-15",
      children: [
        {
          id: "tech-lead",
          name: "Suriya",
          designation: "Tech Lead",
          department: "IT",
          email: "suriya2@company.com",
          phone: "+91 98765 00007",
          joinDate: "2020-02-10",
          children: [
            { id: "dev1", name: "C Santhosh", designation: "Software Engineer",  department: "IT", email: "csanthosh@company.com", phone: "+91 98765 00009", joinDate: "2021-08-01", children: [] },
            { id: "dev2", name: "Aravinth",   designation: "Software Engineer",  department: "IT", email: "aravinth@company.com",  phone: "+91 98765 00010", joinDate: "2022-03-15", children: [] },
            { id: "dev3", name: "Vignesh",    designation: "Frontend Developer", department: "IT", email: "vignesh@company.com",   phone: "+91 98765 00011", joinDate: "2022-07-01", children: [] },
          ],
        },
        { id: "qa1", name: "Sabari", designation: "QA Engineer", department: "IT", email: "sabari@company.com", phone: "+91 98765 00012", joinDate: "2021-11-01", children: [] },
      ],
    },
    {
      id: "fin-mgr",
      name: "Safeer",
      designation: "Finance Manager",
      department: "Finance",
      email: "safeer@company.com",
      phone: "+91 98765 00004",
      joinDate: "2020-01-20",
      children: [
        { id: "fin1", name: "Suganthan", designation: "Finance Analyst", department: "Finance", email: "suganthan@company.com", phone: "+91 98765 00013", joinDate: "2021-04-10", children: [] },
      ],
    },
  ],
};

// ─── Dept colors ─────────────────────────────────────────────────────────────

const DEPT_COLOR = {
  Management: "violet",
  HR:         "cyan",
  IT:         "blue",
  Finance:    "green",
};

const getDeptColor = (dept) => DEPT_COLOR[dept] || "gray";

// ─── Flatten tree ─────────────────────────────────────────────────────────────

const flattenTree = (node, result = []) => {
  result.push(node);
  (node.children || []).forEach(c => flattenTree(c, result));
  return result;
};

const getAllDepts = (node) => {
  const all = flattenTree(node).map(n => n.department);
  return ["All", ...Array.from(new Set(all))];
};

// ─── ConnectedChildren — measures DOM to draw exact horizontal bar ────────────

function ConnectedChildren({ children }) {
  const containerRef = useRef(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const els = Array.from(containerRef.current.children).filter(el => el.dataset.connector !== "bar");
    if (els.length < 2) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const firstCenter = els[0].getBoundingClientRect().left + els[0].getBoundingClientRect().width / 2 - parentRect.left;
    const lastCenter  = els[els.length - 1].getBoundingClientRect().left + els[els.length - 1].getBoundingClientRect().width / 2 - parentRect.left;
    setBar({ left: firstCenter, width: lastCenter - firstCenter });
  }, [children]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "row", gap: 24, alignItems: "flex-start", position: "relative" }}>
      {React.Children.count(children) > 1 && (
        <div data-connector="bar" style={{ position: "absolute", top: 0, left: bar.left, width: bar.width, height: 2, background: "var(--mantine-color-gray-3)", zIndex: 0 }} />
      )}
      {children}
    </div>
  );
}

// ─── NodeCard ─────────────────────────────────────────────────────────────────

function NodeCard({ node, searchQuery, deptFilter, isExpanded, onToggle }) {
  const av       = getAvatarColor(node.name);
  const initials = getInitials(node.name);
  const color    = getDeptColor(node.department);

  const allNodes = flattenTree(node);
  const matchesSearch = !searchQuery || allNodes.some(n =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selfMatch = !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.department.toLowerCase().includes(searchQuery.toLowerCase());

  const dimmed = deptFilter !== "All" && node.department !== deptFilter;

  if (!matchesSearch) return null;

  const popoverContent = (
    <Stack gap={4} p={4} style={{ minWidth: 200 }}>
      <Text size="sm" fw={700}>{node.name}</Text>
      <Badge color={color} variant="light" size="xs" w="fit-content">{node.department}</Badge>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">Email</Text>
        <Text size="xs">{node.email}</Text>
      </Group>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">Phone</Text>
        <Text size="xs">{node.phone}</Text>
      </Group>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">Joined</Text>
        <Text size="xs">{new Date(node.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Text>
      </Group>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">Direct Reports</Text>
        <Badge color="blue" variant="light" size="xs">{(node.children || []).length}</Badge>
      </Group>
    </Stack>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", opacity: dimmed ? 0.35 : 1 }}>
      <Popover width={240} position="bottom" withArrow shadow="md">
        <Popover.Target>
          <Paper
            p="md"
            radius="xl"
            withBorder
            style={{
              minWidth: 160, maxWidth: 190, textAlign: "center", cursor: "pointer",
              userSelect: "none",
              border: selfMatch && searchQuery ? "1.5px solid var(--mantine-color-blue-5)" : undefined,
              boxShadow: selfMatch && searchQuery ? "0 0 0 3px var(--mantine-color-blue-1)" : undefined,
            }}
          >
            <Avatar
              size={44}
              radius="xl"
              mx="auto"
              mb={8}
              style={{ background: av.bg, color: av.color }}
            >
              <Text size="xs" fw={700}>{initials}</Text>
            </Avatar>
            <Text size="sm" fw={600} lh={1.3} mb={2}>{node.name}</Text>
            <Text size="xs" c="dimmed" lh={1.3} mb={8}>{node.designation}</Text>
            <Badge color={color} variant="light" size="xs">{node.department}</Badge>

            {(node.children || []).length > 0 && (
              <div
                onClick={e => { e.stopPropagation(); onToggle(node.id); }}
                style={{
                  position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)",
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--mantine-color-blue-6)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                {isExpanded
                  ? <IconChevronUp size={12} strokeWidth={3} />
                  : <IconChevronDown size={12} strokeWidth={3} />}
              </div>
            )}
          </Paper>
        </Popover.Target>
        <Popover.Dropdown>{popoverContent}</Popover.Dropdown>
      </Popover>
    </div>
  );
}

// ─── TreeNodeV2 ───────────────────────────────────────────────────────────────

function TreeNodeV2({ node, searchQuery, deptFilter, expandedNodes, onToggle }) {
  const hasChildren = (node.children || []).length > 0;
  const isExpanded  = expandedNodes.has(node.id);

  const visibleChildren = (node.children || []).filter(child => {
    const all = flattenTree(child);
    return !searchQuery || all.some(n =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const card = (
    <NodeCard
      node={node}
      searchQuery={searchQuery}
      deptFilter={deptFilter}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );

  if (!card) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {card}

      {hasChildren && isExpanded && visibleChildren.length > 0 && (
        <>
          {/* Vertical stem */}
          <div style={{ width: 2, height: 28, background: "var(--mantine-color-gray-3)", marginTop: 12, flexShrink: 0 }} />

          <ConnectedChildren>
            {visibleChildren.map(child => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Drop line */}
                <div style={{ width: 2, height: 28, background: "var(--mantine-color-gray-3)", flexShrink: 0 }} />
                <TreeNodeV2
                  node={child}
                  searchQuery={searchQuery}
                  deptFilter={deptFilter}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                />
              </div>
            ))}
          </ConnectedChildren>
        </>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OrgChart() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter]   = useState("All");
  const [expandedNodes, setExpandedNodes] = useState(
    () => new Set(flattenTree(ORG_DATA).map(n => n.id))
  );

  const departments = getAllDepts(ORG_DATA);
  const allNodeIds  = flattenTree(ORG_DATA).map(n => n.id);
  const allExpanded = expandedNodes.size === allNodeIds.length;

  const handleToggle = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedNodes(allExpanded ? new Set() : new Set(allNodeIds));
  };

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Organisation Chart"
        sub="Visual hierarchy of the company structure"
        action={
          <Group gap="sm">
            <TextInput
              placeholder="Search name or role…"
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size="sm"
              w={200}
            />
            <Select
              data={departments}
              value={deptFilter}
              onChange={v => setDeptFilter(v)}
              size="sm"
              w={160}
            />
            <Button size="sm" variant="light" onClick={handleExpandAll}>
              {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
          </Group>
        }
      />

      {/* Legend */}
      <Paper p="sm" radius="lg" withBorder>
        <Group gap="md" wrap="wrap">
          <Text size="xs" c="dimmed" fw={500}>Departments:</Text>
          {Object.entries(DEPT_COLOR).map(([dept, color]) => (
            <Group key={dept} gap={6}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: `var(--mantine-color-${color}-5)` }} />
              <Text size="xs" c="dimmed">{dept}</Text>
            </Group>
          ))}
          <Text size="xs" c="dimmed" ml="auto">Click any card for details · Click ▲/▼ to expand/collapse</Text>
        </Group>
      </Paper>

      {/* Chart area */}
      <Paper radius="xl" withBorder p="xl" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", minWidth: "max-content", paddingBottom: 24 }}>
          <TreeNodeV2
            node={ORG_DATA}
            searchQuery={searchQuery}
            deptFilter={deptFilter}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
          />
        </div>
      </Paper>

      <Text ta="center" size="xs" c="dimmed">
        {flattenTree(ORG_DATA).length} employees across {Object.keys(DEPT_COLOR).length} departments
      </Text>
    </Stack>
  );
}
