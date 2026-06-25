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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppLoader }     from "../../components/ui/AppLoader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useToast }      from "../../components/ui/Toast";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
} from "../../api/notificationsApi";

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

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
}

export default function NotificationCenter() {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const [category, setCategory]     = useState("All");
  const [search, setSearch]         = useState("");
  const [showUnread, setShowUnread] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
  const notifications = data?.data?.notifications ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => { invalidate(); show("All notifications marked as read", "success"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidate,
  });

  const clearReadMutation = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => { invalidate(); show("Read notifications cleared", "success"); },
  });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const unreadCount   = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === "critical").length;
  const todayCount    = notifications.filter(n => isToday(n.createdAt ?? n.timestamp ?? n.time)).length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    const catMatch    = category === "All" || n.category === category;
    const readMatch   = !showUnread || !n.read;
    const q           = search.toLowerCase();
    const searchMatch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return catMatch && readMatch && searchMatch;
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) return <AppLoader fullScreen />;

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Notification Center"
        sub={unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
        action={
          <Group gap="sm">
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconTrash size={14} />}
              onClick={() => clearReadMutation.mutate()}
              loading={clearReadMutation.isPending}
            >
              Clear Read
            </Button>
            <Button
              size="sm"
              leftSection={<IconChecks size={14} />}
              onClick={() => markAllReadMutation.mutate()}
              loading={markAllReadMutation.isPending}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <AppStatCard label="Total"    value={String(notifications.length)} color="blue"   />
        <AppStatCard label="Unread"   value={String(unreadCount)}          color="red"    />
        <AppStatCard label="Critical" value={String(criticalCount)}        color="orange" />
        <AppStatCard label="Today"    value={String(todayCount)}           color="green"  />
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
          <AppEmptyState
            icon={<IconBell size={24} />}
            message="No notifications found"
            sub="You're all caught up — new notifications will appear here."
            py={48}
          />
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
                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--mantine-color-gray-2)" : "none",
                  background: n.read ? "transparent" : "var(--mantine-color-blue-0)",
                  cursor: n.read ? "default" : "pointer",
                }}
              >
                {/* Severity dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: n.read ? "transparent" : `var(--mantine-color-${SEV_DOT_COLOR[n.severity] ?? "blue"}-5)`,
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
                      <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        {n.time ?? n.createdAt ?? ""}
                      </Text>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        onClick={e => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                        loading={deleteMutation.isPending && deleteMutation.variables === n.id}
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
