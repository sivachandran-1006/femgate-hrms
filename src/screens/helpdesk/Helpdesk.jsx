import { useState } from "react";
import {
  Stack, Group, SimpleGrid, Text, Title, Paper, Badge, Button,
  TextInput, Select, ActionIcon, Tabs, Table, Pagination, Modal,
  Textarea, ThemeIcon,
} from "@mantine/core";
import {
  IconTicket, IconSearch, IconEye, IconX, IconAlertCircle,
  IconRefresh, IconCheckbox, IconBolt, IconChartBar, IconPlus,
} from "@tabler/icons-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

import { COLORS }            from "../../theme/colors";
import { getAvatarColor }    from "../../utils/helpers";
import { useToast }          from "../../components/ui/Toast";
import { usePermission }     from "../../hooks/usePermission";
import { useAuth }           from "../../hooks/useAuth";
import { useTickets, useRaiseTicket, useUpdateTicketStatus } from "../../queries/useTickets";
import { AppModal }          from "../../components/ui/AppModal";
import { AppInput }          from "../../components/ui/AppInput";
import { AppButton }         from "../../components/ui/AppButton";
import { AppPageHeader }     from "../../components/ui/AppPageHeader";

// Map API ticket → UI shape ("InProgress" → "In Progress")
const mapTicket = (t) => ({
  dbId:        t.id,
  id:          t.ticketId,
  subject:     t.subject,
  category:    t.category,
  raisedBy:    t.raisedBy,
  priority:    t.priority,
  status:      t.status === "InProgress" ? "In Progress" : t.status,
  createdDate: (t.createdAt || "").split("T")[0],
  description: t.description,
});

const PRIORITY_COLORS = { High: "red", Medium: "yellow", Low: "blue" };
const STATUS_COLORS   = { Open: "red", "In Progress": "yellow", Pending: "cyan", Resolved: "green", Closed: "gray" };
const CATEGORY_COLORS_MAP = {
  Hardware: "red", Software: "blue", Network: "violet",
  "Access Request": "cyan", "New Employee Setup": "green",
};

const CATEGORIES = ["All", "Hardware", "Software", "Network", "Access Request", "New Employee Setup"];
const STATUSES   = ["All", "Open", "In Progress", "Pending", "Resolved", "Closed"];
const PRIORITIES = ["High", "Medium", "Low"];
const MODAL_CATS = ["Hardware", "Software", "Network", "Access Request", "New Employee Setup"];

// Trend: tickets opened/resolved per day over the last 6 days
const buildTrend = (tickets) =>
  Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (5 - i));
    const iso = d.toISOString().split("T")[0];
    return {
      day:      d.toLocaleDateString("en-IN", { weekday: "short" }),
      opened:   tickets.filter((t) => t.createdDate === iso).length,
      resolved: tickets.filter((t) => ["Resolved", "Closed"].includes(t.status) && t.createdDate <= iso).length ? tickets.filter((t) => t.createdDate === iso && ["Resolved", "Closed"].includes(t.status)).length : 0,
    };
  });

// SLA: per-category totals from real tickets
const buildSla = (tickets) =>
  MODAL_CATS.map((category) => {
    const rows = tickets.filter((t) => t.category === category);
    return {
      category,
      total:    rows.length,
      resolved: rows.filter((t) => ["Resolved", "Closed"].includes(t.status)).length,
      breached: rows.filter((t) => t.priority === "High" && ["Open", "Pending"].includes(t.status)).length,
    };
  }).filter((r) => r.total > 0);

const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const ROWS = 6;

export default function Helpdesk() {
  const { show } = useToast();
  const can = usePermission();
  const { user } = useAuth();

  const { data: rawTickets = [] } = useTickets();
  const raiseMut  = useRaiseTicket();
  const statusMut = useUpdateTicketStatus();

  const tickets = rawTickets.map(mapTicket);
  const [activeTab, setActiveTab]       = useState(can("helpdesk.view_all_tickets") ? "all" : "mine");
  const [searchQuery, setSearchQuery]   = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewTicket, setViewTicket]     = useState(null);
  const [page, setPage]                 = useState(1);

  const [newTicket, setNewTicket] = useState({ subject: "", category: "Hardware", priority: "Medium", description: "" });

  const total      = tickets.length;
  const openCount  = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const resolved   = tickets.filter((t) => t.status === "Resolved").length;
  const highPrio   = tickets.filter((t) => t.priority === "High").length;

  const kpis = [
    { label: "Total Tickets", value: total,      color: "blue",   icon: <IconTicket size={20} /> },
    { label: "Open",          value: openCount,  color: "red",    icon: <IconAlertCircle size={20} /> },
    { label: "In Progress",   value: inProgress, color: "yellow", icon: <IconRefresh size={20} /> },
    { label: "Resolved",      value: resolved,   color: "green",  icon: <IconCheckbox size={20} /> },
    { label: "High Priority", value: highPrio,   color: "orange", icon: <IconBolt size={20} /> },
  ];

  const catPie = MODAL_CATS.map((c) => ({
    name: c, value: tickets.filter((t) => t.category === c).length,
  })).filter((d) => d.value > 0);

  const PIE_COLORS = ["#ef4444", "#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e"];

  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch   = !q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.raisedBy.toLowerCase().includes(q);
    const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchStatus   = statusFilter   === "All" || t.status   === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchTab      = activeTab === "all" || (activeTab === "mine" && t.raisedBy === (user?.name || ""));
    return matchSearch && matchCategory && matchStatus && matchPriority && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const paginated  = filtered.slice((page - 1) * ROWS, page * ROWS);

  const handleRaise = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
    try {
      const created = await raiseMut.mutateAsync(newTicket);
      show(`Ticket ${created.ticketId} raised — IT team will respond shortly`, "success");
      setNewTicket({ subject: "", category: "Hardware", priority: "Medium", description: "" });
      setShowRaiseModal(false);
    } catch {
      show("Failed to raise ticket", "error");
    }
  };

  const handleStatusChange = async (ticket, status) => {
    try {
      await statusMut.mutateAsync({ id: ticket.dbId, status });
      show(`${ticket.id} → ${status}`, "success");
      setViewTicket(null);
    } catch {
      show("Failed to update status", "error");
    }
  };

  const clearFilters = () => { setCategoryFilter("All"); setStatusFilter("All"); setPriorityFilter("All"); setSearchQuery(""); setPage(1); };
  const hasFilters = categoryFilter !== "All" || statusFilter !== "All" || priorityFilter !== "All" || searchQuery;

  const TABS = [
    { value: "mine", label: "My Tickets" },
    ...(can("helpdesk.view_all_tickets") ? [{ value: "all", label: "All Tickets" }] : []),
    ...(can("helpdesk.view_analytics")   ? [{ value: "analytics", label: "Analytics", icon: <IconChartBar size={13} /> }] : []),
    ...(can("helpdesk.view_sla")         ? [{ value: "sla", label: "SLA Report" }] : []),
  ];

  const showTable = activeTab === "all" || activeTab === "mine";

  return (
    <Stack gap="lg">
      <AppPageHeader title="IT Helpdesk" sub="Manage and track IT support tickets"
        action={<Button leftSection={<IconPlus size={16} />} onClick={() => setShowRaiseModal(true)}>Raise Ticket</Button>}
      />

      <SimpleGrid cols={5}>
        {kpis.map((k) => (
          <Paper key={k.label} withBorder p="md" radius="lg">
            <Group justify="space-between" mb="xs">
              <ThemeIcon color={k.color} variant="light" size="md" radius="md">{k.icon}</ThemeIcon>
              <Badge size="xs" color={k.color} variant="light">LIVE</Badge>
            </Group>
            <Text size="xl" fw={700} lh={1}>{k.value}</Text>
            <Text size="xs" fw={600} mt={2}>{k.label}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setPage(1); }}>
        <Tabs.List>
          {TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} leftSection={t.icon}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {/* ── TICKET TABLE ── */}
        {TABS.filter((t) => t.value === "mine" || t.value === "all").map((t) => (
          <Tabs.Panel key={t.value} value={t.value} pt="md">
            <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
              <Group p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }} wrap="wrap" gap="sm">
                <TextInput
                  placeholder="Search tickets, ID, employee..."
                  leftSection={<IconSearch size={15} />}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.currentTarget.value); setPage(1); }}
                  style={{ flex: 1, minWidth: 220 }}
                />
                <Select
                  value={categoryFilter}
                  onChange={(v) => { setCategoryFilter(v); setPage(1); }}
                  data={CATEGORIES.map((c) => ({ value: c, label: c === "All" ? "All Categories" : c }))}
                  w={160}
                />
                <Select
                  value={statusFilter}
                  onChange={(v) => { setStatusFilter(v); setPage(1); }}
                  data={STATUSES.map((s) => ({ value: s, label: s === "All" ? "All Status" : s }))}
                  w={150}
                />
                <Select
                  value={priorityFilter}
                  onChange={(v) => { setPriorityFilter(v); setPage(1); }}
                  data={["All", ...PRIORITIES].map((p) => ({ value: p, label: p === "All" ? "All Priority" : p }))}
                  w={140}
                />
                <Group gap="xs" ml="auto">
                  <Text size="sm" c="dimmed">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</Text>
                  {hasFilters && (
                    <ActionIcon variant="light" color="red" size="sm" onClick={clearFilters} title="Clear filters">
                      <IconX size={12} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>

              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ticket ID</Table.Th>
                    <Table.Th>Subject</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Raised By</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginated.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8} ta="center" py="xl" c="dimmed">No tickets found</Table.Td>
                    </Table.Tr>
                  ) : paginated.map((tk) => {
                    const av = getAvatarColor(tk.raisedBy);
                    return (
                      <Table.Tr key={tk.id}>
                        <Table.Td>
                          <Text size="sm" fw={700} c="blue" ff="monospace">{tk.id}</Text>
                        </Table.Td>
                        <Table.Td maw={220} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Text size="sm" fw={600} truncate>{tk.subject}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={CATEGORY_COLORS_MAP[tk.category] || "gray"} variant="light">{tk.category}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                              {initials(tk.raisedBy)}
                            </div>
                            <Text size="sm">{tk.raisedBy}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={PRIORITY_COLORS[tk.priority]} variant="dot">{tk.priority}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={STATUS_COLORS[tk.status]} variant="light">{tk.status}</Badge>
                        </Table.Td>
                        <Table.Td c="dimmed" style={{ whiteSpace: "nowrap" }}>{fmtDate(tk.createdDate)}</Table.Td>
                        <Table.Td>
                          <Button size="xs" variant="light" leftSection={<IconEye size={12} />} onClick={() => setViewTicket(tk)}>
                            View
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>

              {totalPages > 1 && (
                <Group justify="space-between" p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                  <Text size="sm" c="dimmed">
                    Showing {(page - 1) * ROWS + 1}–{Math.min(page * ROWS, filtered.length)} of {filtered.length}
                  </Text>
                  <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
                </Group>
              )}
            </Paper>
          </Tabs.Panel>
        ))}

        {/* ── ANALYTICS TAB ── */}
        <Tabs.Panel value="analytics" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={2} spacing="md">
              <Paper withBorder p="md" radius="lg">
                <Text fw={600} mb="md">Ticket Trend — This Week</Text>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={buildTrend(tickets)}>
                    <defs>
                      <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="resolGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="opened" name="Opened" stroke="#ef4444" fill="url(#openGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#resolGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
              <Paper withBorder p="md" radius="lg">
                <Text fw={600} mb="md">Tickets by Category</Text>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={catPie} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={2}>
                      {catPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Stack gap={6} mt="xs">
                  {catPie.map((d, i) => (
                    <Group key={d.name} justify="space-between">
                      <Group gap="xs">
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <Text size="xs" c="dimmed">{d.name}</Text>
                      </Group>
                      <Text size="xs" fw={700}>{d.value}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={2} spacing="md">
              {[
                { title: "By Priority", items: PRIORITIES, getter: (p) => tickets.filter((t) => t.priority === p).length, colorOf: (p) => ({ High: "#ef4444", Medium: "#f59e0b", Low: "#3b82f6" })[p] },
                { title: "By Status", items: ["Open", "In Progress", "Pending", "Resolved", "Closed"], getter: (s) => tickets.filter((t) => t.status === s).length, colorOf: (s) => ({ Open: "#ef4444", "In Progress": "#f59e0b", Pending: "#06b6d4", Resolved: "#22c55e", Closed: "#94a3b8" })[s] },
              ].map(({ title, items, getter, colorOf }) => (
                <Paper key={title} withBorder p="md" radius="lg">
                  <Text fw={600} mb="md">{title}</Text>
                  <Stack gap="sm">
                    {items.map((item) => {
                      const count = getter(item);
                      const pct = Math.round((count / total) * 100);
                      return (
                        <Stack key={item} gap={4}>
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>{item}</Text>
                            <Text size="xs" c="dimmed">{count} ({pct}%)</Text>
                          </Group>
                          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: colorOf(item), borderRadius: 999, transition: "width 0.5s" }} />
                          </div>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── SLA REPORT TAB ── */}
        <Tabs.Panel value="sla" pt="md">
          <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
            <Stack p="md" gap={2} style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <Text fw={600}>SLA Performance Report</Text>
              <Text size="xs" c="dimmed">Service Level Agreement compliance by category</Text>
            </Stack>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Category</Table.Th>
                  <Table.Th ta="center">Total</Table.Th>
                  <Table.Th ta="center">Resolved</Table.Th>
                  <Table.Th ta="center">Breached</Table.Th>
                  <Table.Th>SLA %</Table.Th>
                  <Table.Th>Health</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {buildSla(tickets).map((row) => {
                  const pct = row.total > 0 ? Math.round(((row.total - row.breached) / row.total) * 100) : 100;
                  const barColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
                  const healthColor = pct >= 80 ? "green" : pct >= 50 ? "yellow" : "red";
                  return (
                    <Table.Tr key={row.category}>
                      <Table.Td>
                        <Badge size="sm" color={CATEGORY_COLORS_MAP[row.category] || "gray"} variant="light">{row.category}</Badge>
                      </Table.Td>
                      <Table.Td ta="center" fw={600}>{row.total}</Table.Td>
                      <Table.Td ta="center" fw={600} c="green">{row.resolved}</Table.Td>
                      <Table.Td ta="center" fw={600} c={row.breached > 0 ? "red" : "green"}>{row.breached}</Table.Td>
                      <Table.Td miw={140}>
                        <Group gap="xs">
                          <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999 }} />
                          </div>
                          <Text size="sm" fw={700} c={healthColor} miw={36}>{pct}%</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" color={healthColor} variant="light">
                          {pct >= 80 ? "Good" : pct >= 50 ? "At Risk" : "Breached"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* ── Raise Ticket Modal ── */}
      <AppModal
        opened={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Raise New Ticket"
        subtitle="Describe the issue and we'll assign it to the right team"
        icon={<IconPlus size={18} color={COLORS.primary} />}
        iconColor={COLORS.primary}
        size="md"
      >
        <Stack gap="md">
          <AppInput
            label="Subject *"
            placeholder="Briefly describe the issue"
            value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
          />
          <SimpleGrid cols={2} spacing="md">
            <AppInput
              type="select"
              label="Category *"
              value={newTicket.category}
              onChange={(v) => setNewTicket({ ...newTicket, category: v })}
              data={MODAL_CATS}
            />
            <AppInput
              type="select"
              label="Priority *"
              value={newTicket.priority}
              onChange={(v) => setNewTicket({ ...newTicket, priority: v })}
              data={PRIORITIES}
            />
          </SimpleGrid>
          <AppInput
            type="textarea"
            label="Description *"
            placeholder="Provide detailed information about the issue..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            minRows={4}
          />
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowRaiseModal(false)}>Cancel</AppButton>
            <AppButton onClick={handleRaise} disabled={!newTicket.subject.trim() || !newTicket.description.trim()}>
              Submit Ticket
            </AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* ── View Ticket Modal ── */}
      <Modal opened={!!viewTicket} onClose={() => setViewTicket(null)} title={viewTicket?.id} size="md">
        {viewTicket && (
          <Stack gap="md">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Subject</Text>
              <Text size="md" fw={600}>{viewTicket.subject}</Text>
            </Paper>
            <SimpleGrid cols={2} spacing="sm">
              {[
                ["Raised By", viewTicket.raisedBy],
                ["Category", viewTicket.category],
                ["Created Date", fmtDate(viewTicket.createdDate)],
                ["Ticket ID", viewTicket.id],
              ].map(([label, value]) => (
                <Paper key={label} withBorder p="sm" radius="md" bg="gray.0">
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={2}>{label}</Text>
                  <Text size="sm" fw={500}>{value}</Text>
                </Paper>
              ))}
              <Paper withBorder p="sm" radius="md" bg="gray.0">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Priority</Text>
                <Badge color={PRIORITY_COLORS[viewTicket.priority]} variant="dot">{viewTicket.priority}</Badge>
              </Paper>
              <Paper withBorder p="sm" radius="md" bg="gray.0">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Status</Text>
                <Badge color={STATUS_COLORS[viewTicket.status]} variant="light">{viewTicket.status}</Badge>
              </Paper>
            </SimpleGrid>
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Description</Text>
              <Text size="sm" style={{ lineHeight: 1.7 }}>{viewTicket.description}</Text>
            </Paper>
            <Group justify="space-between">
              {can("helpdesk.manage_tickets") && !["Resolved", "Closed"].includes(viewTicket.status) ? (
                <Group gap="xs">
                  {viewTicket.status !== "In Progress" && (
                    <Button size="xs" color="yellow" variant="light" loading={statusMut.isPending}
                      onClick={() => handleStatusChange(viewTicket, "In Progress")}>
                      Start Progress
                    </Button>
                  )}
                  <Button size="xs" color="green" loading={statusMut.isPending}
                    onClick={() => handleStatusChange(viewTicket, "Resolved")}>
                    Mark Resolved
                  </Button>
                </Group>
              ) : <span />}
              <Button onClick={() => setViewTicket(null)}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
