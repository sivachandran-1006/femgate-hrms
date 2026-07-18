import { useState } from "react";
import { Paper, Avatar, Text, Badge, Group, Loader, Center, Box } from "@mantine/core";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

// Premium employee card with avatar positioned on top
function PremiumEmployeeCard({ node, onClick }) {
  const av = getAvatarColor(node.name);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Avatar - Large, positioned above card with shadow */}
      <Avatar
        size={64}
        radius="xl"
        style={{
          background: av.bg,
          color: av.color,
          fontWeight: "bold",
          fontSize: 22,
          border: "4px solid white",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          cursor: "pointer",
          marginBottom: -32,
          zIndex: 20,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        onClick={onClick}
      >
        {getInitials(node.name)}
      </Avatar>

      {/* Premium Card */}
      <Paper
        p="lg"
        radius="xl"
        withBorder
        style={{
          minWidth: 240,
          maxWidth: 280,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          border: "2px solid #e0e7ff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          paddingTop: 56,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
          e.currentTarget.style.borderColor = "#e0e7ff";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onClick={onClick}
      >
        {/* Name - Premium styling */}
        <Text fw={700} size="md" ta="center" mb={4} style={{ color: "#1e3a8a", letterSpacing: "-0.5px" }}>
          {node.name}
        </Text>

        {/* Designation */}
        <Text size="sm" c="dimmed" ta="center" mb={12}>
          {node.designation || "—"}
        </Text>

        {/* Department Badge */}
        <Group gap={6} mb={12} justify="center">
          <Badge
            size="sm"
            variant="light"
            radius="md"
            style={{
              background: "#dbeafe",
              color: "#1e40af",
              fontWeight: 600,
            }}
          >
            {node.department || "—"}
          </Badge>
          <Badge
            size="sm"
            color={STATUS_COLOR[node.status] || "gray"}
            variant="light"
            radius="md"
          >
            {node.status}
          </Badge>
        </Group>

        {/* Reports Badge - Premium blue circle */}
        {node.directReports > 0 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                fontSize: 14,
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
              }}
            >
              {node.directReports}
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
}

// Premium Box & Line org chart
function BoxLineChart({ tree, onNodeClick }) {
  const renderNode = (node, depth = 0) => {
    const children = node.children || [];
    const hasChildren = children.length > 0;

    return (
      <div
        key={node.id}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 80,
        }}
      >
        {/* Node Card */}
        <PremiumEmployeeCard node={node} onClick={() => onNodeClick(node)} />

        {/* Children Connector Structure */}
        {hasChildren && (
          <div style={{ marginTop: 48, position: "relative", width: "100%" }}>
            {/* Vertical line from card to horizontal line */}
            <svg
              style={{
                position: "absolute",
                top: -48,
                left: "50%",
                transform: "translateX(-50%)",
                width: 2,
                height: 48,
              }}
            >
              <line x1="1" y1="0" x2="1" y2="48" stroke="#94a3b8" strokeWidth="2" />
            </svg>

            {/* Container for children with horizontal line */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", gap: 60 }}>
              {/* Horizontal line */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 48,
                  width: "100%",
                  pointerEvents: "none",
                }}
              >
                <line
                  x1="0"
                  y1="24"
                  x2="100%"
                  y2="24"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {/* Vertical lines from horizontal to each child */}
                {children.map((_, idx) => {
                  const totalWidth = children.length * 260 + (children.length - 1) * 60;
                  const startX = (100 - (totalWidth / window.innerWidth) * 100) / 2;
                  const xPercent = startX + idx * ((260 + 60) / window.innerWidth) * 100 + 130 / window.innerWidth * 100;
                  return (
                    <line
                      key={`v-${idx}`}
                      x1={`${xPercent}%`}
                      y1="24"
                      x2={`${xPercent}%`}
                      y2="48"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Children Cards */}
              <div style={{ display: "flex", gap: 60, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 10, paddingTop: 24 }}>
                {children.map((child) => (
                  <div key={child.id}>
                    {renderNode(child, depth + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 40px",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e9ecf1 100%)",
        minHeight: "100vh",
      }}
    >
      {tree.map((root) => renderNode(root))}
    </div>
  );
}

export default function BoxLineOrgChart() {
  const { data: treeData, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const [selectedNode, setSelectedNode] = useState(null);

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  const tree = treeData?.tree || [];

  if (tree.length === 0) {
    return <AppEmptyState message="Organization structure not configured." />;
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <BoxLineChart tree={tree} onNodeClick={setSelectedNode} />

      {/* Selected node details panel */}
      {selectedNode && (
        <Paper
          p="xl"
          radius="xl"
          withBorder
          style={{
            margin: "20px 40px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Group gap="lg">
            <Avatar
              size={80}
              radius="xl"
              style={{
                background: getAvatarColor(selectedNode.name).bg,
                color: getAvatarColor(selectedNode.name).color,
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              {getInitials(selectedNode.name)}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text fw={700} size="lg" style={{ color: "#1e3a8a" }}>
                {selectedNode.name}
              </Text>
              <Text c="dimmed" size="sm" mb={12}>
                {selectedNode.designation}
              </Text>
              <Group gap={8} wrap="wrap">
                <Badge variant="light" style={{ background: "#dbeafe", color: "#1e40af" }}>
                  {selectedNode.department}
                </Badge>
                <Badge color={STATUS_COLOR[selectedNode.status] || "gray"} variant="light">
                  {selectedNode.status}
                </Badge>
                {selectedNode.directReports > 0 && (
                  <Badge color="blue" variant="light">
                    {selectedNode.directReports} direct reports
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
        </Paper>
      )}
    </div>
  );
}
