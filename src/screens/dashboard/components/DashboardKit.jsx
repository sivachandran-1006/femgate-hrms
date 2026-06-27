// Shared premium dashboard primitives — used by all role dashboards for a
// consistent Stripe/Linear-grade look (sparkline KPI cards, panels, tooltips).
import { Card, Group, Text, Box, ThemeIcon, Badge } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

export const SPARK_HEX = {
  blue: "#3b82f6", green: "#10b981", orange: "#f59e0b", violet: "#7c3aed",
  red: "#ef4444", grape: "#be4bdb", teal: "#14b8a6", cyan: "#06b6d4",
  indigo: "#6366f1", pink: "#ec4899", yellow: "#f59e0b", gray: "#94a3b8",
};

export const fmtMoney = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

export const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// Pie/donut readability: keep the top N slices by value, roll the rest into "Others".
// Prevents cluttered, unreadable pies when a category list is large.
//   topSlices(data, "value", 5)  → [...top5, { name:"Others", value:sumOfRest }]
export const topSlices = (data = [], valueKey = "value", n = 5, nameKey = "name") => {
  const arr = [...(data || [])].sort((a, b) => (Number(b[valueKey]) || 0) - (Number(a[valueKey]) || 0));
  if (arr.length <= n) return arr;
  const top = arr.slice(0, n);
  const rest = arr.slice(n).reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  return [...top, { [nameKey]: "Others", [valueKey]: rest, __others: true }];
};

export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box p="xs" style={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      {label && <Text fw={600} fz="xs" mb={2}>{label}</Text>}
      {payload.map((p) => <Text key={p.dataKey || p.name} fz="xs" c={p.color}>{p.name}: <Text span fw={700}>{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}</Text></Text>)}
    </Box>
  );
};

// Premium KPI card: colored icon tile + trend badge + sparkline + hover lift
export function KpiCard({ icon: Icon, label, value, trend, up = true, sub, color = "violet", spark = [] }) {
  const stroke = SPARK_HEX[color] || "#7c3aed";
  const sparkData = (spark || []).map((v, i) => ({ i, v: Number(v) || 0 }));
  return (
    <Card
      withBorder radius={20} p="lg"
      style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)", transition: "transform .18s ease, box-shadow .18s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(16,24,40,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)"; }}
    >
      <Group justify="space-between" align="flex-start" mb="sm">
        <ThemeIcon size={46} radius={14} variant="light" color={color}><Icon size={24} /></ThemeIcon>
        {trend != null && (
          <Badge color={up ? "green" : "red"} variant="light" radius="sm" leftSection={up ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}>
            {trend}
          </Badge>
        )}
      </Group>
      <Text size="xs" c="dimmed" fw={500}>{label}</Text>
      <Text fw={800} size="28px" lh={1.1} my={2} style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</Text>
      <Group justify="space-between" align="flex-end" wrap="nowrap" gap="xs">
        {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        {sparkData.length > 1 && (
          <Box style={{ width: 72, height: 28, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spk-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.8} fill={`url(#spk-${color})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Group>
    </Card>
  );
}

// Premium panel/section card
export function PanelCard({ title, sub, action, children, ...rest }) {
  return (
    <Card withBorder radius={20} p="lg" style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }} {...rest}>
      {(title || action) && (
        <Group justify="space-between" mb="md">
          <Box>
            {title && <Text fw={700}>{title}</Text>}
            {sub && <Text size="xs" c="dimmed">{sub}</Text>}
          </Box>
          {action}
        </Group>
      )}
      {children}
    </Card>
  );
}
