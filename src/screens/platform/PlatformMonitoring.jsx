import { useEffect, useState } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, SimpleGrid, Grid,
  ThemeIcon, Center, Loader, Box,
} from "@mantine/core";
import {
  IconServer, IconDatabase, IconMail, IconCreditCard, IconShieldCheck,
  IconCloudUpload, IconStack2, IconCircleCheck, IconAlertTriangle, IconX,
  IconRefresh,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { ChartTooltip } from "../dashboard/components/DashboardKit";
import { usePlatformHealth, usePlatformStats, useHealthHistory } from "../../queries/usePlatform";

const MOCK_SERVICES = [
  { service:"api",      status:"healthy",  latencyMs:45  },
  { service:"database", status:"healthy",  latencyMs:12  },
  { service:"queue",    status:"healthy",  latencyMs:8   },
  { service:"storage",  status:"healthy",  latencyMs:23  },
  { service:"email",    status:"degraded", latencyMs:890 },
  { service:"billing",  status:"healthy",  latencyMs:67  },
  { service:"auth",     status:"healthy",  latencyMs:31  },
];

const MOCK_HISTORY = [
  { hour:"00:00", healthy:7, degraded:0, down:0 },
  { hour:"04:00", healthy:6, degraded:1, down:0 },
  { hour:"08:00", healthy:7, degraded:0, down:0 },
  { hour:"12:00", healthy:5, degraded:1, down:1 },
  { hour:"16:00", healthy:6, degraded:1, down:0 },
  { hour:"20:00", healthy:7, degraded:0, down:0 },
];

const MOCK_STATS = { tenants:6, employees:312, activeUsers:28, invoicesThisMonth:14 };

const SERVICE_ICONS = {
  api: IconServer, database: IconDatabase, queue: IconStack2,
  storage: IconCloudUpload, email: IconMail, billing: IconCreditCard, auth: IconShieldCheck,
};

const STATUS_COLOR = { healthy:"green", degraded:"orange", down:"red" };
const STATUS_ICON  = { healthy: IconCircleCheck, degraded: IconAlertTriangle, down: IconX };

function ServiceCard({ svc }) {
  const Icon       = SERVICE_ICONS[svc.service] || IconServer;
  const StatusIcon = STATUS_ICON[svc.status]    || IconCircleCheck;
  const color      = STATUS_COLOR[svc.status]   || "gray";
  return (
    <Paper withBorder p="md" radius="lg">
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <ThemeIcon size={32} radius={8} variant="light" color={color}><Icon size={16} /></ThemeIcon>
          <Text fw={600} size="sm" tt="capitalize">{svc.service}</Text>
        </Group>
        <Badge size="xs" color={color} variant="light" leftSection={<StatusIcon size={10} />}>{svc.status}</Badge>
      </Group>
      <Text size="xs" c="dimmed">Latency: <Text span fw={600} c={svc.latencyMs > 500 ? "red" : svc.latencyMs > 200 ? "orange" : "green"}>
        {svc.latencyMs}ms
      </Text></Text>
    </Paper>
  );
}

export default function PlatformMonitoring() {
  const { user } = useAuth();
  const toast    = useToast();
  const isSA     = ["SUPER_ADMIN"].includes(user?.role);

  const { data: healthData, isLoading: loadingHealth, refetch } = usePlatformHealth();
  const { data: statsData,  isLoading: loadingStats             } = usePlatformStats();
  const { data: rawHistory = []                                  } = useHealthHistory();
  const historyData = rawHistory.length ? rawHistory : MOCK_HISTORY;
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      refetch(); setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, [refetch]);

  const services = healthData?.services?.length ? healthData.services : MOCK_SERVICES;
  const summary  = healthData?.summary || { healthy: services.filter(s => s.status === "healthy").length, degraded: services.filter(s => s.status === "degraded").length, down: services.filter(s => s.status === "down").length };
  const stats    = statsData || MOCK_STATS;

  const overallStatus = summary.down > 0 ? "Major Outage" : summary.degraded > 0 ? "Partial Outage" : "All Systems Operational";
  const overallColor  = summary.down > 0 ? "red" : summary.degraded > 0 ? "orange" : "green";

  if (!isSA) return <AppEmptyState icon={<IconServer size={22} />} message="Restricted" sub="Super Admin only." />;

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Platform Monitoring"
        sub="Real-time system health and performance"
        onRefresh={() => { refetch(); setLastRefresh(new Date()); toast.show("Refreshed", "info"); }}
      />

      {/* System status banner */}
      <Paper withBorder p="md" radius="lg" style={{ borderColor: `var(--mantine-color-${overallColor}-4)`, background: `var(--mantine-color-${overallColor}-0)` }}>
        <Group gap="sm">
          {overallColor === "green" ? <IconCircleCheck size={20} color={`var(--mantine-color-${overallColor}-6)`} /> :
           overallColor === "orange" ? <IconAlertTriangle size={20} color={`var(--mantine-color-${overallColor}-6)`} /> :
           <IconX size={20} color="var(--mantine-color-red-6)" />}
          <Text fw={700} c={`${overallColor}.7`}>{overallStatus}</Text>
          <Text size="xs" c="dimmed" ml="auto">Last checked: {lastRefresh.toLocaleTimeString()}</Text>
        </Group>
      </Paper>

      {/* Platform stats */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {[
          { label:"Total Tenants",        value:stats.tenants,             color:"blue"   },
          { label:"Active Employees",     value:stats.employees,           color:"green"  },
          { label:"Active Sessions",      value:stats.activeUsers,         color:"violet" },
          { label:"Invoices This Month",  value:stats.invoicesThisMonth,   color:"orange" },
        ].map(s => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase">{s.label}</Text>
            <Text fw={800} size="xl" c={s.color}>{s.value ?? "—"}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Service cards */}
      {(loadingHealth) ? <Center h={160}><Loader /></Center> : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
          {services.map(s => <ServiceCard key={s.service} svc={s} />)}
        </SimpleGrid>
      )}

      {/* Health history chart */}
      <Paper withBorder p="lg" radius="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Service Health (Last 6 Hours)</Text>
          <Group gap="xs">
            <Badge size="xs" color="green" variant="dot">Healthy</Badge>
            <Badge size="xs" color="orange" variant="dot">Degraded</Badge>
            <Badge size="xs" color="red" variant="dot">Down</Badge>
          </Group>
        </Group>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 7]} />
            <RTooltip content={<ChartTooltip />} />
            <Bar dataKey="healthy"  name="Healthy"  fill="#16a34a" radius={[3,3,0,0]} />
            <Bar dataKey="degraded" name="Degraded" fill="#f59e0b" radius={[3,3,0,0]} />
            <Bar dataKey="down"     name="Down"     fill="#dc2626" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Stack>
  );
}
