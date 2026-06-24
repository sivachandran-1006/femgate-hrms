import { useState } from "react";
import { Paper, Group, Text, Avatar, Badge, ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconEye, IconUsersGroup, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { getAvatarColor, getInitials } from "../../utils/helpers";

const STATUS_COLOR = { Active: "green", Probation: "yellow", "Notice Period": "orange", Resigned: "red", Terminated: "red", Inactive: "gray" };

// Enhanced professional node card
function EnhancedNodeCard({ node, onView, onTeam, hasChildren, expanded, onToggle, depth }) {
  const av = getAvatarColor(node.name);
  const levelColors = {
    0: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af" }, // CEO - Blue
    1: { bg: "#ede9fe", border: "#8b5cf6", text: "#5b21b6" }, // Directors - Purple
    2: { bg: "#fce7f3", border: "#ec4899", text: "#be185d" }, // Managers - Pink
    3: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }, // Team Leads - Amber
  };

  const colors = levelColors[Math.min(depth, 3)] || levelColors[3];

  return (
    <Paper
      p="md"
      radius="lg"
      withBorder
      style={{
        minWidth: 280,
        maxWidth: 300,
        background: `linear-gradient(135deg, white 0%, ${colors.bg}20 100%)`,
        border: `2px solid ${colors.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 16px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Header with expand button */}
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          {hasChildren && (
            <ActionIcon
              size="sm"
              variant="light"
              color={colors.text}
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </ActionIcon>
          )}
          {!hasChildren && <Box w={24} />}
        </Group>
        <Tooltip label={`Level ${depth + 1}`}>
          <Box
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: colors.border,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            {depth + 1}
          </Box>
        </Tooltip>
      </Group>

      {/* Employee info */}
      <Group gap="sm" mb="sm">
        <Avatar
          size={48}
          radius="xl"
          style={{
            background: av.bg,
            color: av.color,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {getInitials(node.name)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} size="sm" truncate style={{ color: colors.text }}>
            {node.name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {node.designation || "—"}
          </Text>
        </div>
      </Group>

      {/* Badges */}
      <Group gap={6} mb="md">
        <Badge size="xs" variant="light" radius="sm">
          {node.department || "—"}
        </Badge>
        <Badge
          size="xs"
          color={STATUS_COLOR[node.status] || "gray"}
          variant="light"
          radius="sm"
        >
          {node.status}
        </Badge>
      </Group>

      {/* Stats */}
      <Group gap="xs" mb="sm">
        <Box style={{ fontSize: 11, color: "#64748b" }}>
          <Text size="xs">ID: {node.employeeId}</Text>
        </Box>
        {node.directReports > 0 && (
          <Badge color="blue" size="xs" variant="filled">
            {node.directReports} reports
          </Badge>
        )}
      </Group>

      {/* Actions */}
      <Group gap={4} justify="flex-end">
        <Tooltip label="View Profile">
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={(e) => { e.stopPropagation(); onView(node); }}
          >
            <IconEye size={14} />
          </ActionIcon>
        </Tooltip>
        {node.directReports > 0 && (
          <Tooltip label="View Team">
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={(e) => { e.stopPropagation(); onTeam(node); }}
            >
              <IconUsersGroup size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
}

// Enhanced tree node with professional Mantine-style connectors
export function EnhancedTreeNode({ node, expandedSet, onToggle, onView, onTeam, depth = 0, isLast = true, showConnector = false }) {
  const hasChildren = (node.children || []).length > 0;
  const expanded = expandedSet.has(node.id);
  const childrenList = node.children || [];
  const connectorColor = "#d0d9e8";
  const connectorWidth = 2;

  return (
    <div style={{ position: "relative", paddingLeft: depth > 0 ? 60 : 0, marginBottom: 32 }}>
      {/* Vertical connector from parent - clean Mantine style */}
      {showConnector && depth > 0 && (
        <>
          {/* Vertical line from parent to card */}
          <svg
            style={{
              position: "absolute",
              left: -30,
              top: -20,
              width: 30,
              height: 60,
              overflow: "visible",
            }}
          >
            <path
              d={`M 28 0 L 28 ${isLast ? 30 : 100} L 0 30 Q 0 30 0 45`}
              stroke={connectorColor}
              strokeWidth={connectorWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Vertical continuation line for non-last items */}
          {!isLast && (
            <div
              style={{
                position: "absolute",
                left: -30,
                top: 30,
                width: connectorWidth,
                height: "calc(100% + 20px)",
                background: connectorColor,
              }}
            />
          )}
        </>
      )}

      {/* Node Card */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20, position: "relative", zIndex: 1 }}>
        <EnhancedNodeCard
          node={node}
          onView={onView}
          onTeam={onTeam}
          hasChildren={hasChildren}
          expanded={expanded}
          onToggle={() => onToggle(node.id)}
          depth={depth}
        />
      </div>

      {/* Children with professional horizontal connector */}
      {hasChildren && expanded && (
        <div style={{ position: "relative", marginLeft: 0 }}>
          {/* Horizontal line connecting to children */}
          {childrenList.length > 0 && (
            <svg
              style={{
                position: "absolute",
                left: 0,
                top: -32,
                width: "100%",
                height: 80,
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              {/* Top vertical stem */}
              <line
                x1="30"
                y1="32"
                x2="30"
                y2="60"
                stroke={connectorColor}
                strokeWidth={connectorWidth}
                strokeLinecap="round"
              />

              {/* Horizontal line across children */}
              <line
                x1="30"
                y1="60"
                x2="calc(100% - 30px)"
                y2="60"
                stroke={connectorColor}
                strokeWidth={connectorWidth}
                strokeLinecap="round"
              />

              {/* Vertical drops to each child */}
              {childrenList.map((_, idx) => {
                const childCount = childrenList.length;
                const childWidth = 100 / (childCount + 1);
                const xPos = (idx + 1) * childWidth;
                return (
                  <line
                    key={`drop-${idx}`}
                    x1={`${xPos}%`}
                    y1="60"
                    x2={`${xPos}%`}
                    y2="80"
                    stroke={connectorColor}
                    strokeWidth={connectorWidth}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          )}

          {/* Children nodes */}
          <div>
            {childrenList.map((child, idx) => (
              <EnhancedTreeNode
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

export default EnhancedTreeNode;
