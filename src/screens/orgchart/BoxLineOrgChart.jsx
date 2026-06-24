import { useState, useMemo } from "react";
import { Paper, Group, Text, Avatar, Badge, Box, Loader, Center, Tooltip } from "@mantine/core";
import { useOrgTree } from "../../queries/useOrgChart";
import { getAvatarColor, getInitials } from "../../utils/helpers";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

// Employee card with avatar on top
function EmployeeCard({ node, onClick }) {
  const av = getAvatarColor(node.name);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={onClick}
    >
      {/* Avatar - positioned above the card */}
      <Tooltip label={node.name}>
        <Avatar
          size={56}
          radius="xl"
          style={{
            background: av.bg,
            color: av.color,
            fontWeight: "bold",
            fontSize: 18,
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 10,
            marginBottom: -28,
          }}
        >
          {getInitials(node.name)}
        </Avatar>
      </Tooltip>

      {/* Card */}
      <Paper
        p="md"
        radius="lg"
        withBorder
        style={{
          minWidth: 200,
          maxWidth: 220,
          background: "white",
          border: "2px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          paddingTop: 36,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          e.currentTarget.style.borderColor = "#3b82f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        {/* Name */}
        <Text fw={700} size="sm" ta="center" mb={4} style={{ color: "#1e40af" }}>
          {node.name}
        </Text>

        {/* Designation */}
        <Text size="xs" c="dimmed" ta="center" mb={8}>
          {node.designation || "—"}
        </Text>

        {/* Badges */}
        <Group gap={4} mb={8} justify="center" wrap="wrap">
          <Badge size="xs" variant="light" radius="sm">
            {node.department || "—"}
          </Badge>
          <Badge size="xs" color={STATUS_COLOR[node.status] || "gray"} variant="light" radius="sm">
            {node.status}
          </Badge>
        </Group>

        {/* Reports count badge */}
        {node.directReports > 0 && (
          <Box style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#3b82f6",
                color: "white",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {node.directReports}
            </div>
          </Box>
        )}
      </Paper>
    </div>
  );
}

// Box and line org chart renderer
function BoxLineChart({ tree, onNodeClick }) {
  const renderNode = (node, depth = 0, isLast = true, parentX = null, parentY = null) => {
    const children = node.children || [];
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 60 }}>
        {/* Node */}
        <EmployeeCard node={node} onClick={() => onNodeClick(node)} />

        {/* Children */}
        {hasChildren && (
          <div style={{ marginTop: 40, position: "relative" }}>
            {/* Vertical line from parent */}
            <div
              style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 2,
                height: 40,
                background: "#94a3b8",
              }}
            />

            {/* Horizontal line connecting all children */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "#94a3b8",
                transform: "translateY(-40px)",
              }}
            />

            {/* Children container */}
            <div
              style={{
                display: "flex",
                gap: 40,
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {children.map((child, idx) => {
                const isLastChild = idx === children.length - 1;
                const childKey = `${node.id}-${child.id}`;

                return (
                  <div key={childKey} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Vertical line from horizontal to child */}
                    <div
                      style={{
                        position: "absolute",
                        top: -40,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 2,
                        height: 40,
                        background: "#94a3b8",
                      }}
                    />

                    {/* Render child recursively */}
                    {renderNode(child, depth + 1, isLastChild, null, null)}
                  </div>
                );
              })}
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
        padding: 40,
        overflowX: "auto",
        overflowY: "auto",
      }}
    >
      {tree.map((root) => renderNode(root))}
    </div>
  );
}

export default function BoxLineOrgChart() {
  const { data: treeData, isLoading } = useOrgTree();
  const [selectedNode, setSelectedNode] = useState(null);

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  const tree = treeData?.tree || [];

  if (tree.length === 0) {
    return <AppEmptyState message="Organization structure not configured." />;
  }

  return (
    <div>
      {/* Chart */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          minHeight: 600,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <BoxLineChart tree={tree} onNodeClick={setSelectedNode} />
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <Paper p="md" mt="md" withBorder radius="lg">
          <Group gap="md">
            <Avatar
              size={80}
              radius="xl"
              style={{
                background: getAvatarColor(selectedNode.name).bg,
                color: getAvatarColor(selectedNode.name).color,
              }}
            >
              {getInitials(selectedNode.name)}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text fw={700} size="lg">
                {selectedNode.name}
              </Text>
              <Text c="dimmed" size="sm" mb={8}>
                {selectedNode.designation}
              </Text>
              <Group gap={8} wrap="wrap">
                <Badge variant="light">{selectedNode.department}</Badge>
                <Badge color={STATUS_COLOR[selectedNode.status] || "gray"} variant="light">
                  {selectedNode.status}
                </Badge>
                {selectedNode.directReports > 0 && (
                  <Badge color="blue" variant="light">
                    {selectedNode.directReports} direct reports
                  </Badge>
                )}
              </Group>
              {selectedNode.email && (
                <Text size="sm" c="blue" mt={8}>
                  {selectedNode.email}
                </Text>
              )}
            </div>
          </Group>
        </Paper>
      )}
    </div>
  );
}
