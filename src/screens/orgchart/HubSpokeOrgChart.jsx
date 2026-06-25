import { useState, useEffect } from "react";
import { Box, Group, Text, Paper, Badge, Avatar, Loader, Center, Tabs, ActionIcon, Menu, Button, TextInput, Select } from "@mantine/core";
import { IconSearch, IconZoomIn, IconZoomOut, IconFileExport, IconPrinter, IconChartRadar } from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection } from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import { useOrgTree } from "../../queries/useOrgChart";

const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

// Hub node (center) - Enhanced
function HubNode({ node, onClick }) {
  const av = getAvatarColor(node.name);
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Outer glow */}
      <circle cx="0" cy="0" r="70" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.2" />
      <circle cx="0" cy="0" r="60" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.15" />

      {/* Main circle */}
      <circle cx="0" cy="0" r="55" fill="white" stroke="#2563eb" strokeWidth="3" />
      <circle cx="0" cy="0" r="50" fill="url(#ceoGradient)" opacity="0.4" />

      {/* Icon background */}
      <circle cx="0" cy="0" r="45" fill="#dbeafe" opacity="0.2" />

      {/* Text */}
      <text x="0" y="-8" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">{getInitials(node.name)}</text>
      <text x="0" y="6" textAnchor="middle" fontSize="10" fill="#1e40af" fontWeight="600">{node.designation?.substring(0, 15)}</text>
      <text x="0" y="18" textAnchor="middle" fontSize="8" fill="#64748b" fontStyle="italic">CEO</text>
    </g>
  );
}

// Spoke node (around the circle) - Enhanced
function SpokeNode({ x, y, node, onClick }) {
  const av = getAvatarColor(node.name);
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Line from center to node - gradient effect */}
      <defs>
        <linearGradient id={`line-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <line x1="0" y1="0" x2={x * 0.6} y2={y * 0.6} stroke={`url(#line-${node.id})`} strokeWidth="2.5" />

      {/* Outer ring */}
      <circle cx={x} cy={y} r="48" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.2" />

      {/* Node circle */}
      <circle cx={x} cy={y} r="40" fill="white" stroke="#8b5cf6" strokeWidth="2.5" />
      <circle cx={x} cy={y} r="36" fill="#ede9fe" opacity="0.2" />

      {/* Avatar and text */}
      <text x={x} y={y - 8} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#5b21b6">{getInitials(node.name)}</text>
      <text x={x} y={y + 8} textAnchor="middle" fontSize="9" fill="#6b21a8" fontWeight="500">{node.designation?.substring(0, 12) || "Staff"}</text>
    </g>
  );
}

// Sub-spoke nodes (second level, smaller) - Enhanced
function SubSpokeNode({ x, y, parentX, parentY, node, onClick }) {
  const av = getAvatarColor(node.name);
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Line from parent spoke to sub-spoke - dashed with gradient */}
      <defs>
        <linearGradient id={`subline-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <line
        x1={parentX}
        y1={parentY}
        x2={x * 0.8}
        y2={y * 0.8}
        stroke={`url(#subline-${node.id})`}
        strokeWidth="1.5"
        strokeDasharray="5,3"
      />

      {/* Node circle (smaller) with gradient */}
      <circle cx={x} cy={y} r="32" fill="none" stroke="#d8b4fe" strokeWidth="1" opacity="0.3" />
      <circle cx={x} cy={y} r="28" fill="white" stroke="#c084fc" strokeWidth="1.5" />
      <circle cx={x} cy={y} r="25" fill="#faf5ff" opacity="0.3" />

      {/* Avatar and text */}
      <text x={x} y={y - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7c3aed">{getInitials(node.name)}</text>
      <text x={x} y={y + 6} textAnchor="middle" fontSize="7" fill="#a78bfa">{node.designation?.substring(0, 8) || "Staff"}</text>
    </g>
  );
}

export default function HubSpokeOrgChart() {
  const { data: treeData, isLoading } = useOrgTree();
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  const tree = treeData?.tree || [];
  const flat = treeData?.flat || [];

  // Find the CEO (root node)
  const ceo = tree.find(n => n.name === "Super Admin") || tree[0];
  if (!ceo) return <AppEmptyState message="Organization structure not configured." />;

  const directReports = ceo.children || [];
  const numSpokes = directReports.length;
  const radius = 280;

  // Calculate positions for spokes in a circle
  const spokePositions = directReports.map((_, i) => {
    const angle = (i / numSpokes) * 2 * Math.PI - Math.PI / 2; // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle,
    };
  });

  const SVGWidth = 1200;
  const SVGHeight = 900;
  const centerX = SVGWidth / 2;
  const centerY = SVGHeight / 2;

  return (
    <>
      <AppPageHeader
        title="Organization Chart - Hub & Spoke"
        sub="Radial view: CEO at center with teams around"
        action={
          <Group gap="sm">
            <Menu position="bottom-end" withinPortal>
              <Menu.Target><Button variant="default" size="sm" leftSection={<IconFileExport size={15} />}>Export</Button></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>PDF</Menu.Item>
                <Menu.Item>PNG</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="default" size="lg" title="Print"><IconPrinter size={16} /></ActionIcon>
          </Group>
        }
      />

      <AppSection p="md">
        <Group gap="sm" mb="md">
          <Group gap={4}>
            <ActionIcon variant="default" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} title="Zoom out"><IconZoomOut size={16} /></ActionIcon>
            <Text size="xs" w={36} ta="center">{Math.round(zoom * 100)}%</Text>
            <ActionIcon variant="default" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} title="Zoom in"><IconZoomIn size={16} /></ActionIcon>
          </Group>
          <Text size="sm" c="dimmed">Click any node to view details</Text>
        </Group>

        <div style={{
          overflowX: "auto",
          overflowY: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          height: 700,
        }}>
          <svg
            width={SVGWidth}
            height={SVGHeight}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s",
            }}
          >
            {/* SVG Definitions for gradients */}
            <defs>
              <linearGradient id="ceoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="1" />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.8" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* CEO Hub */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <HubNode node={ceo} onClick={() => setSelectedNode(ceo)} />

              {/* Direct reports (spokes) */}
              {directReports.map((spoke, i) => {
                const pos = spokePositions[i];
                const subReports = spoke.children || [];

                return (
                  <g key={spoke.id}>
                    {/* Spoke node */}
                    <SpokeNode
                      x={pos.x}
                      y={pos.y}
                      node={spoke}
                      onClick={() => setSelectedNode(spoke)}
                    />

                    {/* Sub-spoke nodes (teams under each director) */}
                    {subReports.map((subNode, j) => {
                      const subAngle = pos.angle + (j - (subReports.length - 1) / 2) * 0.4;
                      const subRadius = 380;
                      const subX = Math.cos(subAngle) * subRadius;
                      const subY = Math.sin(subAngle) * subRadius;

                      return (
                        <SubSpokeNode
                          key={subNode.id}
                          x={subX}
                          y={subY}
                          parentX={pos.x}
                          parentY={pos.y}
                          node={subNode}
                          onClick={() => setSelectedNode(subNode)}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </AppSection>

      {/* Selected node details */}
      {selectedNode && (
        <AppSection mt="md" p="md" title="Selected Employee">
          <Paper p="md" withBorder>
            <Group gap="md">
              <Avatar
                size={80}
                radius="xl"
                style={{ background: getAvatarColor(selectedNode.name).bg }}
              >
                {getInitials(selectedNode.name)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text fw={700} size="lg">{selectedNode.name}</Text>
                <Text c="dimmed" size="sm" mb={8}>{selectedNode.designation}</Text>
                <Group gap={8} wrap="wrap">
                  <Badge variant="light" radius="sm">{selectedNode.department}</Badge>
                  <Badge variant="light" color={STATUS_COLOR[selectedNode.status] || "gray"} radius="sm">{selectedNode.status}</Badge>
                  {selectedNode.directReports > 0 && (
                    <Badge color="blue" variant="light" radius="sm">{selectedNode.directReports} direct reports</Badge>
                  )}
                </Group>
                {selectedNode.email && (
                  <Text size="sm" c="blue" mt={8}>{selectedNode.email}</Text>
                )}
              </div>
            </Group>
          </Paper>
        </AppSection>
      )}

      {/* Legend */}
      <AppSection mt="md" p="md" title="Legend">
        <Group gap="xl">
          <Group gap={8}>
            <div style={{ width: 50, height: 50, borderRadius: 50, background: "#dbeafe", border: "3px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text size="xs" fw={700}>CEO</Text>
            </div>
            <Text size="sm">Executive (Center Hub)</Text>
          </Group>
          <Group gap={8}>
            <div style={{ width: 40, height: 40, borderRadius: 50, background: "#ede9fe", border: "2px solid #8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text size="xs" fw={700}>D</Text>
            </div>
            <Text size="sm">Department/Manager (Spoke)</Text>
          </Group>
          <Group gap={8}>
            <div style={{ width: 30, height: 30, borderRadius: 50, background: "#f3e8ff", border: "1.5px solid #a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text size="xs" fw={700} style={{fontSize: 8}}>S</Text>
            </div>
            <Text size="sm">Team Member (Sub-spoke)</Text>
          </Group>
        </Group>
      </AppSection>
    </>
  );
}
