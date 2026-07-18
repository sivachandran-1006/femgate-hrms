import { useState } from "react";
import { Paper, Group, Text, Badge, ActionIcon, Loader, Center, Button, Modal } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconBriefcase,
  IconPalette,
  IconTrendingUp,
  IconUsers,
  IconDeviceDesktop,
  IconDatabase,
  IconBug,
  IconChartBar,
  IconMail,
  IconShoppingCart,
} from "@tabler/icons-react";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const ROLE_ICONS = {
  CEO: <IconBriefcase size={24} />,
  CTO: <IconCode size={24} />,
  "React Native Developer": <IconDeviceDesktop size={24} />,
  "Backend Developer": <IconDatabase size={24} />,
  "QA Engineer": <IconBug size={24} />,
  "Project Manager": <IconChartBar size={24} />,
  "Business Analyst": <IconChartBar size={24} />,
  "UI/UX Manager": <IconPalette size={24} />,
  "UI/UX Designer": <IconPalette size={24} />,
  "Sales & Marketing Manager": <IconTrendingUp size={24} />,
  "Sales Executive": <IconShoppingCart size={24} />,
  "Digital Marketing Specialist": <IconMail size={24} />,
};

const DEPARTMENT_COLORS = {
  Engineering: { bg: "rgba(59, 130, 246, 0.1)", border: "#3B82F6", badge: "#2563EB" },
  Product: { bg: "rgba(139, 92, 246, 0.1)", border: "#8B5CF6", badge: "#7C3AED" },
  Design: { bg: "rgba(236, 72, 153, 0.1)", border: "#EC4899", badge: "#DB2777" },
  Marketing: { bg: "rgba(34, 197, 94, 0.1)", border: "#22C55E", badge: "#16A34A" },
  Sales: { bg: "rgba(59, 130, 246, 0.1)", border: "#3B82F6", badge: "#2563EB" },
};

// Modern premium role card with glassmorphism
function ModernRoleCard({ node, onClick, depth = 0 }) {
  const deptColor = DEPARTMENT_COLORS[node.department] || DEPARTMENT_COLORS.Engineering;
  const icon = ROLE_ICONS[node.designation] || <IconBriefcase size={24} />;
  const isExecutive = depth === 0;

  return (
    <Paper
      p={isExecutive ? 24 : 20}
      radius={20}
      withBorder
      onClick={onClick}
      style={{
        minWidth: isExecutive ? 280 : 260,
        maxWidth: isExecutive ? 320 : 280,
        background: isExecutive
          ? "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)"
          : `linear-gradient(135deg, ${deptColor.bg} 0%, rgba(255, 255, 255, 0.5) 100%)`,
        border: `2px solid ${isExecutive ? "#7C3AED" : deptColor.border}`,
        boxShadow: isExecutive
          ? "0 8px 32px rgba(124, 58, 237, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
          : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isExecutive
          ? "0 16px 48px rgba(124, 58, 237, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
          : "0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)";
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = isExecutive ? "#9333EA" : deptColor.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isExecutive
          ? "0 8px 32px rgba(124, 58, 237, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
          : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = isExecutive ? "#7C3AED" : deptColor.border;
      }}
    >
      {/* Header gradient strip for executive roles */}
      {isExecutive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #7C3AED, #9333EA)",
          }}
        />
      )}

      {/* Icon container */}
      <Group justify="space-between" mb={16} align="flex-start">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isExecutive ? 56 : 48,
            height: isExecutive ? 56 : 48,
            borderRadius: 14,
            background: isExecutive
              ? "linear-gradient(135deg, #7C3AED, #9333EA)"
              : `linear-gradient(135deg, ${deptColor.border}20, ${deptColor.border}40)`,
            color: isExecutive ? "white" : deptColor.badge,
            boxShadow: isExecutive ? "0 4px 12px rgba(124, 58, 237, 0.3)" : "none",
          }}
        >
          {icon}
        </div>
        {node.directReports > 0 && (
          <Badge
            size="sm"
            radius="md"
            style={{
              background: isExecutive ? "#7C3AED" : deptColor.badge,
              color: "white",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {node.directReports}
          </Badge>
        )}
      </Group>

      {/* Role title */}
      <Text
        fw={700}
        size={isExecutive ? "md" : "sm"}
        mb={4}
        style={{
          color: "#1F2937",
          letterSpacing: "-0.3px",
        }}
      >
        {node.designation || "Role"}
      </Text>

      {/* Department badge */}
      <Badge
        size="xs"
        variant="light"
        radius="md"
        style={{
          background: `${deptColor.badge}20`,
          color: deptColor.badge,
          fontWeight: 600,
          fontSize: 10,
        }}
      >
        {node.department || "Department"}
      </Badge>

      {/* Status indicator */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${deptColor.border}30`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: node.status === "Active" ? "#10B981" : "#94A3B8",
          }}
        />
        <Text size="xs" c="dimmed" style={{ fontWeight: 500 }}>
          {node.status || "Active"}
        </Text>
      </div>
    </Paper>
  );
}

// Modern connector lines with minimal design
function ConnectorLine({ fromX, fromY, toX, toY }) {
  const controlY = fromY + (toY - fromY) / 2;

  return (
    <svg
      style={{
        position: "absolute",
        pointerEvents: "none",
        overflow: "visible",
      }}
      width="100%"
      height="100%"
      viewBox={`0 0 ${Math.max(fromX, toX) + 50} ${Math.max(fromY, toY) + 50}`}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
        </linearGradient>
        <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
        </filter>
      </defs>
      <path
        d={`M ${fromX} ${fromY} Q ${fromX} ${controlY} ${toX} ${toY}`}
        stroke="url(#lineGradient)"
        strokeWidth="2"
        fill="none"
        filter="url(#lineShadow)"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Modern org tree renderer
function ModernOrgTree({ tree, selectedNode, onNodeClick }) {
  const renderNode = (node, depth = 0, x = 0, y = 0) => {
    const children = node.children || [];
    const hasChildren = children.length > 0;
    const childWidth = 280 + 40;
    const totalChildWidth = children.length * childWidth;
    const childStartX = x - totalChildWidth / 2;

    return (
      <div
        key={node.id}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: depth === 0 ? 100 : 80,
          position: "relative",
        }}
      >
        {/* Card */}
        <ModernRoleCard
          node={node}
          onClick={() => onNodeClick(node)}
          depth={depth}
        />

        {/* Children */}
        {hasChildren && (
          <div
            style={{
              marginTop: 60,
              display: "flex",
              gap: 40,
              justifyContent: "center",
              position: "relative",
              width: "100%",
            }}
          >
            {/* Top connector vertical line */}
            <svg
              style={{
                position: "absolute",
                top: -60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 2,
                height: 60,
                zIndex: 0,
              }}
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="60"
                stroke="#7C3AED"
                strokeWidth="2"
                opacity="0.4"
              />
            </svg>

            {/* Horizontal connector line */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 60,
                zIndex: 0,
              }}
            >
              <line
                x1="0"
                y1="30"
                x2="100%"
                y2="30"
                stroke="#7C3AED"
                strokeWidth="2"
                opacity="0.4"
              />
              {/* Vertical drops to each child */}
              {children.map((_, idx) => {
                const percent = (idx + 1) / (children.length + 1);
                return (
                  <line
                    key={`drop-${idx}`}
                    x1={`${percent * 100}%`}
                    y1="30"
                    x2={`${percent * 100}%`}
                    y2="60"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    opacity="0.4"
                  />
                );
              })}
            </svg>

            {/* Child nodes */}
            <div
              style={{
                display: "flex",
                gap: 40,
                justifyContent: "center",
                flexWrap: "wrap",
                position: "relative",
                zIndex: 10,
                paddingTop: 30,
              }}
            >
              {children.map((child) => renderNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "80px 60px",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {tree.map((root) => renderNode(root))}
    </div>
  );
}

export default function ModernPremiumOrgChart() {
  const { data: treeData, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [selectedNode, setSelectedNode] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (isLoading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );

  const tree = treeData?.tree || [];

  if (tree.length === 0) {
    return (
      <AppEmptyState message="Organization structure not configured." />
    );
  }

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <ModernOrgTree tree={tree} selectedNode={selectedNode} onNodeClick={(node) => {
        setSelectedNode(node);
        setDetailsOpen(true);
      }} />

      {/* Details Modal */}
      <Modal
        opened={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selectedNode?.designation || "Role Details"}
        size="md"
        radius={20}
        centered
      >
        {selectedNode && (
          <Group direction="column" spacing="lg">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #7C3AED, #9333EA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {ROLE_ICONS[selectedNode.designation] || <IconBriefcase size={32} />}
              </div>
              <div>
                <Text fw={700} size="lg">
                  {selectedNode.designation}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedNode.department}
                </Text>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16 }}>
              <Group spacing="sm">
                <Badge radius="md" style={{ background: "#7C3AED", color: "white" }}>
                  {selectedNode.status}
                </Badge>
                {selectedNode.directReports > 0 && (
                  <Badge
                    radius="md"
                    variant="light"
                    style={{ background: "#7C3AED20", color: "#7C3AED" }}
                  >
                    {selectedNode.directReports} direct reports
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
        )}
      </Modal>
    </div>
  );
}
