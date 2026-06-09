import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, TextInput,
  ActionIcon, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import {
  IconBell, IconCheck, IconChecks, IconTrash, IconSearch,
  IconFilter, IconShield, IconCreditCard, IconUsers,
  IconCalendar, IconPackage, IconFileText, IconInfoCircle,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { useToast }      from "../../components/ui/Toast";

const CATEGORIES = ["All", "HR", "Payroll", "Security", "System", "Assets", "Leave"];

const CAT_CONFIG = {
  HR:       { color: "violet", icon: <IconUsers size={16} /> },
  Payroll:  { color: "green",  icon: <IconCreditCard size={16} /> },
  Security: { color: "red",    icon: <IconShield size={16} /> },
  System:   { color: "blue",   icon: <IconInfoCircle size={16} /> },
  Assets:   { color: "orange", icon: <IconPackage size={16} /> },
  Leave:    { color: "cyan",   icon: <IconCalendar size={16} /> },
  Document: { color: "gray",   icon: <IconFileText size={16} /> },
};

const SEV_DOT_COLOR = { critical: "red", warning: "yellow", info: "blue" };

const INIT_NOTIFICATIONS = [
  { id: 1,  category: "Security", title: "Failed login attempt detected",       body: "3 consecutive failed login attempts from IP 203.0.113.12 for superadmin account.",           time: "2 min ago",   read: false, severity: "critical" },
  { id: 2,  category: "Payroll",  title: "May 2026 payroll processed",           body: "Payroll for 12 employees has been processed. Total disbursement: ₹4,85,000.",               time: "1 hour ago",  read: false, severity: "info"     },
  { id: 3,  category: "HR",       title: "New employee onboarding: Arjun Kumar", body: "Arjun Kumar (EMP-013) has completed onboarding and is now active in the system.",            time: "3 hours ago", read: false, severity: "info"     },
  { id: 4,  category: "Leave",    title: "Leave request pending approval",        body: "Priya Sharma has requested 3 days of Annual Leave (Jun 15–17). Awaiting manager approval.", time: "4 hours ago", read: false, severity: "info"     },
  { id: 5,  category: "System",   title: "System backup completed",               body: "Automated backup (BKP-20260609) completed successfully. Size: 2.3 GB.",                     time: "6 hours ago", read: true,  severity: "info"     },
  { id: 6,  category: "Assets",   title: "Asset assigned: MacBook Pro",           body: "Asset AST-045 (MacBook Pro 14\") assigned to Kavitha R by IT Admin.",                       time: "Yesterday",   read: true,  severity: "info"     },
  { id: 7,  category: "Security", title: "MFA enabled globally",                 body: "Super Admin has enforced Multi-Factor Authentication for all admin accounts.",               time: "Yesterday",   read: true,  severity: "warning"  },
  { id: 8,  category: "HR",       title: "Performance review cycle started",      body: "Q2 2026 performance review cycle has been initiated for all employees.",                     time: "2 days ago",  read: true,  severity: "info"     },
  { id: 9,  category: "Payroll",  title: "Tax report ready for download",         body: "FY 2025-26 tax summary report is available for download in the Payroll module.",             time: "2 days ago",  read: true,  severity: "info"     },
  { id: 10, category: "System",   title: "API rate limit warning",                body: "Endpoint /api/employees exceeded 80% of rate limit (800/1000 req/hour).",                   time: "3 days ago",  read: true,  severity: "warning"  },
  { id: 11, category: "Leave",    title: "Leave balance updated",                 body: "Annual leave balance refreshed for all employees. Policy: 18 days per year.",               time: "4 days ago",  read: true,  severity: "info"     },
  { id: 12, category: "Assets",   title: "Asset maintenance due",                 body: "2 assets (AST-012, AST-031) are due for scheduled maintenance this week.",                  time: "5 days ago",  read: true,  severity: "warning"  },
];

export default function NotificationCenter() {
  const { show } = useToast();
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS);
  const [category, setCategory]           = useState("All");
  const [search, setSearch]               = useState("");
  const [showUnread, setShowUnread]       = useState(false);

  const filtered = notifications.filter(n => {
    const catMatch   = category === "All" || n.category === category;
    const readMatch  = !showUnread || !n.read;
    const q          = search.toLowerCase();
    const searchMatch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return catMatch && readMatch && searchMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead    = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications(p => p.map(n => ({ ...n, read: true }))); show("All notifications marked as read", "success"); };
  const deleteNotif = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const clearAll    = () => { setNotifications(p => p.filter(n => !n.read)); show("Read notifications cleared", "success"); };

  const todayTimes = ["2 min ago","1 hour ago","3 hours ago","4 hours ago","6 hours ago"];

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Notification Center"
        sub={unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
        action={
          <Group gap="sm">
            <Button variant="outline" size="sm" leftSection={<IconTrash size={14} />} onClick={clearAll}>
              Clear Read
            </Button>
            <Button
              size="sm"
              leftSection={<IconChecks size={14} />}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <AppStatCard label="Total"    value={String(notifications.length)}                                              color="blue"   />
        <AppStatCard label="Unread"   value={String(unreadCount)}                                                       color="red"    />
        <AppStatCard label="Critical" value={String(notifications.filter(n => n.severity === "critical").length)}       color="orange" />
        <AppStatCard label="Today"    value={String(notifications.filter(n => todayTimes.includes(n.time)).length)}     color="green"  />
      </SimpleGrid>

      <Paper radius="lg" withBorder>
        {/* Filters */}
        <Group p="md" gap="sm" wrap="wrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <TextInput
            placeholder="Search notifications…"
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
            size="sm"
          />
          <Group gap={6} wrap="wrap">
            {CATEGORIES.map(c => (
              <Button
                key={c}
                size="xs"
                variant={category === c ? "filled" : "outline"}
                color={category === c ? "blue" : "gray"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </Group>
          <Button
            size="xs"
            variant={showUnread ? "filled" : "outline"}
            color={showUnread ? "blue" : "gray"}
            leftSection={<IconFilter size={12} />}
            onClick={() => setShowUnread(v => !v)}
          >
            Unread only
          </Button>
        </Group>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <Stack align="center" py={48} gap="xs">
            <IconBell size={32} color="var(--mantine-color-gray-4)" strokeWidth={1.2} />
            <Text size="sm" c="dimmed">No notifications found</Text>
          </Stack>
        ) : (
          filtered.map((n, i) => {
            const cfg = CAT_CONFIG[n.category] || CAT_CONFIG.Document;
            return (
              <Group
                key={n.id}
                p="md"
                gap="sm"
                align="flex-start"
                wrap="nowrap"
                onClick={() => markRead(n.id)}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--mantine-color-gray-2)" : "none",
                  background: n.read ? "transparent" : "var(--mantine-color-blue-0)",
                  cursor: "pointer",
                }}
              >
                {/* Severity dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: n.read ? "transparent" : `var(--mantine-color-${SEV_DOT_COLOR[n.severity]}-5)`,
                }} />

                {/* Category icon */}
                <ThemeIcon size={36} radius="xl" variant="light" color={cfg.color} style={{ flexShrink: 0 }}>
                  {cfg.icon}
                </ThemeIcon>

                {/* Content */}
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Group justify="space-between" gap="xs" wrap="nowrap">
                    <Text size="sm" fw={n.read ? 400 : 700}>{n.title}</Text>
                    <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
                      <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{n.time}</Text>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                      >
                        <IconTrash size={13} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2}>{n.body}</Text>
                  <Badge size="xs" color={cfg.color} variant="light" mt={4} w="fit-content">
                    {n.category}
                  </Badge>
                </Stack>
              </Group>
            );
          })
        )}
      </Paper>
    </Stack>
  );
}
