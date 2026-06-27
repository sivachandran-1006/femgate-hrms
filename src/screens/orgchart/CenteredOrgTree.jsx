// Centered top-down org tree (CEO at top → reports fan out below with connector
// lines), premium avatar cards, department color-coding and member-count pills.
import { Box, Text, Avatar, Badge, Group } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { getInitials } from "../../utils/helpers";

// Stable color per department (for the card accent + branch identity)
const DEPT_PALETTE = [
  { bar: "#7c3aed", soft: "#f5f3ff", text: "#6d28d9" }, // violet
  { bar: "#3b82f6", soft: "#eff6ff", text: "#1d4ed8" }, // blue
  { bar: "#10b981", soft: "#ecfdf5", text: "#047857" }, // green
  { bar: "#f59e0b", soft: "#fffbeb", text: "#b45309" }, // amber
  { bar: "#ec4899", soft: "#fdf2f8", text: "#be185d" }, // pink
  { bar: "#06b6d4", soft: "#ecfeff", text: "#0e7490" }, // cyan
  { bar: "#ef4444", soft: "#fef2f2", text: "#b91c1c" }, // red
  { bar: "#14b8a6", soft: "#f0fdfa", text: "#0f766e" }, // teal
];
const deptColor = (dept, depth) => {
  if (depth === 0) return { bar: "#7c3aed", soft: "#f5f3ff", text: "#6d28d9" };
  let h = 0; const s = dept || "x";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return DEPT_PALETTE[h % DEPT_PALETTE.length];
};

const LINE = "#d1d5db";

// ── A single org card ──
function OrgCard({ node, depth, onView }) {
  const c = deptColor(node.department, depth);
  const reports = node.directReports ?? (node.children || []).length;
  const isRoot = depth === 0;
  return (
    <Box
      onClick={() => onView?.(node)}
      style={{
        width: isRoot ? 240 : 210,
        background: "#fff",
        border: `1px solid ${isRoot ? c.bar : "#e5e7eb"}`,
        borderRadius: 16,
        boxShadow: isRoot ? `0 8px 24px ${c.bar}22` : "0 1px 3px rgba(16,24,40,0.06)",
        padding: 14,
        cursor: "pointer",
        transition: "transform .15s ease, box-shadow .15s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 28px ${c.bar}26`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = isRoot ? `0 8px 24px ${c.bar}22` : "0 1px 3px rgba(16,24,40,0.06)"; }}
    >
      <Box style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: c.bar }} />
      <Group gap="sm" wrap="nowrap" align="center" mt={4}>
        <Avatar size={isRoot ? 52 : 44} radius="xl" src={node.photoUrl || undefined} color="violet" style={{ border: `2px solid ${c.soft}` }}>
          {getInitials(node.name)}
        </Avatar>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={700} truncate title={node.name}>{node.name}</Text>
          <Text size="xs" c="dimmed" truncate title={node.designation}>{node.designation || node.department || "—"}</Text>
        </Box>
      </Group>
      <Group justify="space-between" mt={10}>
        <Badge size="xs" variant="light" radius="sm" style={{ background: c.soft, color: c.text }}>{node.department || "—"}</Badge>
        {reports > 0 && (
          <Badge size="xs" radius="sm" variant="light" color="gray" leftSection={<IconUsers size={10} />}>
            {reports} {reports === 1 ? "report" : "reports"}
          </Badge>
        )}
      </Group>
    </Box>
  );
}

// ── Recursive subtree: card on top, horizontal row of children below with connectors ──
function Subtree({ node, depth, onView }) {
  const children = node.children || [];
  const has = children.length > 0;
  return (
    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <OrgCard node={node} depth={depth} onView={onView} />

      {has && (
        <>
          {/* vertical stem down from parent */}
          <Box style={{ width: 2, height: 26, background: LINE }} />

          {/* children row */}
          <Box style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            {children.map((child, i) => {
              const first = i === 0, last = i === children.length - 1;
              const only = children.length === 1;
              return (
                <Box key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 14px", position: "relative" }}>
                  {/* horizontal connector segment (skip the outer half on the ends) */}
                  {!only && (
                    <Box style={{
                      position: "absolute", top: 0, height: 2, background: LINE,
                      left: first ? "50%" : 0,
                      right: last ? "50%" : 0,
                    }} />
                  )}
                  {/* vertical drop into each child */}
                  <Box style={{ width: 2, height: 26, background: LINE }} />
                  <Subtree node={child} depth={depth + 1} onView={onView} />
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

export default function CenteredOrgTree({ roots = [], onView }) {
  return (
    <Box style={{ display: "flex", gap: 48, justifyContent: roots.length === 1 ? "center" : "flex-start", minWidth: "fit-content" }}>
      {roots.map((root) => (
        <Subtree key={root.id} node={root} depth={0} onView={onView} />
      ))}
    </Box>
  );
}
