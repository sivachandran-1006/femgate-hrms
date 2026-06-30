import { useMemo, useState } from "react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Button,
  ThemeIcon,
  Avatar,
  Table,
  Progress,
  Modal,
  TextInput,
  SimpleGrid,
  Tabs,
  Divider,
} from "@mantine/core";
import {
  IconUserMinus as UserMinus,
  IconCircleCheck as CheckCircle,
  IconAlertCircle as AlertCircle,
  IconCheck as Check,
  IconFileText as FileText,
  IconDownload as Download,
  IconPrinter as Printer,
  IconUser as User,
  IconCalendar as Calendar,
  IconCurrencyDollar as DollarSign,
  IconShield as Shield,
  IconDeviceLaptop as Laptop,
  IconBook as BookOpen,
  IconCreditCard as CreditCard,
  IconMessage as MessageSquare,
  IconRefresh as RefreshCw,
} from "@tabler/icons-react";

import { useExits, useUpdateExit }             from "../../queries/useHr";
import { useToast }                            from "../../components/ui/Toast";
import { AppPageHeader }                       from "../../components/ui/AppPageHeader";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatLWD = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// ── Display templates ─────────────────────────────────────────────────────────

const CLEARANCE_ITEMS = [
  { id: 1, label: "IT Assets Return",    icon: Laptop,        owner: "IT Department",  dueDate: "25 Jun 2026", status: "Completed",   checklistKey: "itAssets"  },
  { id: 2, label: "Access Revocation",   icon: Shield,        owner: "IT / Security",  dueDate: "25 Jun 2026", status: "Completed"                              },
  { id: 3, label: "Library Books",       icon: BookOpen,      owner: "Admin",          dueDate: "28 Jun 2026", status: "Pending",     checklistKey: "knowledge" },
  { id: 4, label: "Finance Clearance",   icon: CreditCard,    owner: "Finance Dept",   dueDate: "28 Jun 2026", status: "Pending",     checklistKey: "finance"   },
  { id: 5, label: "HR Documentation",    icon: FileText,      owner: "HR Department",  dueDate: "29 Jun 2026", status: "In Progress", checklistKey: "hrDocs"    },
  { id: 6, label: "Exit Interview",      icon: MessageSquare, owner: "HR Department",  dueDate: "30 Jun 2026", status: "Pending"                                },
];

const FNF_DETAILS = {
  name: "Ramesh Kumar",
  dept: "IT",
  lwdDisplay: "30 Jun 2026",
  items: [
    { label: "Basic Salary",             amount: 65000, sign:  1, note: "Pro-rated for 30 days"   },
    { label: "Notice Period Recovery",   amount: 0,     sign: -1, note: "Fully served"             },
    { label: "Earned Leave Encashment",  amount: 8125,  sign:  1, note: "6.5 days @ ₹1,250/day"   },
    { label: "Gratuity",                 amount: 15000, sign:  1, note: "5 years of service"       },
    { label: "Other Deductions",         amount: 1200,  sign: -1, note: "Miscellaneous dues"       },
  ],
  net: 86925,
};

// Map dept/stage/status → Mantine Badge color
const DEPT_COLOR_MAP = {
  IT:         "blue",
  HR:         "violet",
  Finance:    "green",
  Marketing:  "cyan",
  Operations: "orange",
};

const STAGE_COLOR_MAP = {
  "Clearance In Progress": "cyan",
  "Notice Period":          "yellow",
  "Document Collection":    "violet",
  "Full & Final Pending":   "red",
};

const STATUS_COLOR_MAP = {
  Completed:     "green",
  "In Progress": "cyan",
  Pending:       "yellow",
};

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = ["blue", "violet", "cyan", "yellow", "orange"];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Main Component ─────────────────────────────────────────────────────────────

const ExitManagement = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [remarks, setRemarks]     = useState({});
  const [viewExit, setViewExit]   = useState(null);

  const { data: exits = [] } = useExits();
  const updateExit           = useUpdateExit();
  const { show }             = useToast();

  const ACTIVE_EXITS = useMemo(
    () =>
      exits
        .filter((e) => e.status === "Active")
        .map((e) => ({
          id: e.id,
          name: e.name,
          dept: e.dept,
          lwdDisplay: formatLWD(e.lastWorkingDay),
          notice: `${e.noticeDays} days`,
          type: e.type,
          stage: e.stage,
          checklist: e.checklist,
        })),
    [exits],
  );

  const EXIT_REQUESTS = useMemo(
    () =>
      exits
        .filter((e) => e.status === "Request")
        .map((e) => ({
          id: e.id,
          name: e.name,
          dept: e.dept,
          submitDate: "—",
          requestedLWD: formatLWD(e.lastWorkingDay),
          reason: e.reason,
          status: "Pending",
        })),
    [exits],
  );

  const completedCount = exits.filter((e) => e.status === "Completed").length;
  const clearancePendingCount = ACTIVE_EXITS.filter(
    (e) => e.checklist && Object.values(e.checklist).some((v) => !v),
  ).length;

  const clearanceExit =
    ACTIVE_EXITS.find((e) => e.stage === "Clearance In Progress") || ACTIVE_EXITS[0];

  const clearanceItems = CLEARANCE_ITEMS.map((item) =>
    item.checklistKey && clearanceExit?.checklist
      ? { ...item, status: clearanceExit.checklist[item.checklistKey] ? "Completed" : "Pending" }
      : item,
  );

  const handleApprove = async (req) => {
    try {
      await updateExit.mutateAsync({ id: req.id, status: "Active", stage: "Notice Period" });
      show(`Exit request for ${req.name} approved`, "success");
    } catch {
      show("Failed to approve exit request", "error");
    }
  };

  const handleReject = async (req) => {
    try {
      await updateExit.mutateAsync({ id: req.id, status: "Completed", stage: "Rejected" });
      show(`Exit request for ${req.name} rejected`, "success");
    } catch {
      show("Failed to reject exit request", "error");
    }
  };

  const STAT_CARDS = [
    { label: "Total Exits This Year", value: exits.length,          icon: UserMinus,   color: "blue"   },
    { label: "In Progress",           value: ACTIVE_EXITS.length,   icon: RefreshCw,   color: "yellow" },
    { label: "Clearance Pending",     value: clearancePendingCount, icon: AlertCircle, color: "orange" },
    { label: "Completed",             value: completedCount,        icon: CheckCircle, color: "green"  },
  ];

  const completedClearance = clearanceItems.filter((i) => i.status === "Completed").length;
  const clearancePct = Math.round((completedClearance / clearanceItems.length) * 100);

  return (
    <Box p="lg">
      <AppPageHeader title="Exit Management" sub="Manage employee offboarding, clearances, and full & final settlements" />

      {/* ── Stat Cards ── */}
      <SimpleGrid cols={4} spacing="md" mb="lg">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Paper key={card.label} withBorder radius="lg" p="md">
              <Group gap="md" wrap="nowrap">
                <ThemeIcon size={44} radius="lg" color={card.color} variant="light">
                  <Icon size={20} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={700} size="xl" lh={1.1}>{card.value}</Text>
                  <Text size="xs" c="dimmed">{card.label}</Text>
                </Stack>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="active">Active Exits</Tabs.Tab>
          <Tabs.Tab value="requests">Exit Requests</Tabs.Tab>
          <Tabs.Tab value="clearance">Clearance Checklist</Tabs.Tab>
          <Tabs.Tab value="fnf">Full &amp; Final</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* ── Tab: Active Exits ── */}
      {activeTab === "active" && (
        <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
          <Box p="md" pb={0} mb="sm">
            <Text fw={600} size="md">Active Exits</Text>
            <Text size="xs" c="dimmed" mt={4}>Employees currently in the offboarding process</Text>
          </Box>
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withColumnBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  {["Employee", "Department", "Last Working Day", "Notice Period", "Exit Type", "Stage", "Actions"].map((col) => (
                    <Table.Th key={col}>{col}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ACTIVE_EXITS.map((emp) => (
                  <Table.Tr key={emp.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar color={avatarColor(emp.name)} radius="xl" size={34}>
                          {initials(emp.name)}
                        </Avatar>
                        <Text fw={500} size="sm">{emp.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={DEPT_COLOR_MAP[emp.dept] || "gray"}>
                        {emp.dept}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Calendar size={14} />
                        <Text fw={500} size="sm">{emp.lwdDisplay}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{emp.notice}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={emp.type === "Contract End" ? "violet" : "cyan"}>
                        {emp.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={STAGE_COLOR_MAP[emp.stage] || "gray"}>
                        {emp.stage}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" variant="light" color="blue" onClick={() => setViewExit(emp)}>
                          View
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="cyan"
                          onClick={() => { setViewExit(emp); setActiveTab("clearance"); }}
                        >
                          Track
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      )}

      {/* ── Tab: Exit Requests ── */}
      {activeTab === "requests" && (
        <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
          <Box p="md" pb={0} mb="sm">
            <Text fw={600} size="md">Pending Exit Requests</Text>
            <Text size="xs" c="dimmed" mt={4}>Resignation requests awaiting HR approval</Text>
          </Box>
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withColumnBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  {["Employee", "Submit Date", "Requested LWD", "Reason", "Status", "Actions"].map((col) => (
                    <Table.Th key={col}>{col}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {EXIT_REQUESTS.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar color={avatarColor(req.name)} radius="xl" size={34}>
                          {initials(req.name)}
                        </Avatar>
                        <Stack gap={2}>
                          <Text fw={500} size="sm">{req.name}</Text>
                          <Badge variant="light" color={DEPT_COLOR_MAP[req.dept] || "gray"} size="xs">
                            {req.dept}
                          </Badge>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{req.submitDate}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Calendar size={14} />
                        <Text fw={500} size="sm">{req.requestedLWD}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td maw={260}>
                      <Text size="xs" c="dimmed" title={req.reason} truncate="end" maw={240}>
                        {req.reason}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="yellow">{req.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" variant="light" color="green" onClick={() => handleApprove(req)}>
                          Approve
                        </Button>
                        <Button size="xs" variant="light" color="red" onClick={() => handleReject(req)}>
                          Reject
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      )}

      {/* ── Tab: Clearance Checklist ── */}
      {activeTab === "clearance" && (
        <Stack gap="md">
          {/* Employee info banner */}
          <Paper withBorder radius="lg" p="md">
            <Group gap="md" wrap="nowrap">
              <Avatar color={avatarColor(clearanceExit?.name || "")} radius="xl" size={44}>
                {initials(clearanceExit?.name || "—")}
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="md">{clearanceExit?.name || "No active exit"}</Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {clearanceExit?.dept || "—"} Department · Last Working Day: {clearanceExit?.lwdDisplay || "—"}
                </Text>
              </Box>
              <Badge variant="light" color={STAGE_COLOR_MAP[clearanceExit?.stage] || "gray"}>
                {clearanceExit?.stage || "—"}
              </Badge>
            </Group>
          </Paper>

          {/* Checklist items */}
          <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
            <Box p="md" pb={0} mb="sm">
              <Text fw={600} size="md">Clearance Checklist</Text>
              <Text size="xs" c="dimmed" mt={4}>
                {completedClearance} of {clearanceItems.length} items completed
              </Text>
            </Box>

            <Box px="md" mb="md">
              <Progress value={clearancePct} color="green" radius="xl" size="sm" />
            </Box>

            <Stack gap={0}>
              {clearanceItems.map((item, idx) => {
                const Icon = item.icon;
                const isCompleted = item.status === "Completed";
                const isInProgress = item.status === "In Progress";
                return (
                  <Box key={item.id}>
                    {idx > 0 && <Divider />}
                    <Group gap="md" align="flex-start" p="sm" px="md" wrap="nowrap">
                      {/* Status circle */}
                      <ThemeIcon
                        size={32}
                        radius="xl"
                        variant={isCompleted ? "light" : "outline"}
                        color={isCompleted ? "green" : isInProgress ? "cyan" : "gray"}
                        mt={2}
                        style={{ flexShrink: 0 }}
                      >
                        {isCompleted
                          ? <Check size={14} strokeWidth={2.5} />
                          : isInProgress
                            ? <RefreshCw size={13} />
                            : null
                        }
                      </ThemeIcon>

                      {/* Item icon */}
                      <ThemeIcon size={36} radius="lg" variant="light" color="gray" style={{ flexShrink: 0 }}>
                        <Icon size={16} />
                      </ThemeIcon>

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="sm" wrap="wrap">
                          <Text
                            fw={500}
                            size="sm"
                            td={isCompleted ? "line-through" : undefined}
                            c={isCompleted ? "dimmed" : undefined}
                          >
                            {item.label}
                          </Text>
                          <Badge variant="light" color={STATUS_COLOR_MAP[item.status] || "gray"} size="sm">
                            {item.status}
                          </Badge>
                        </Group>
                        <Group gap="md" mt={3}>
                          <Group gap={4}>
                            <User size={11} />
                            <Text size="xs" c="dimmed">{item.owner}</Text>
                          </Group>
                          <Group gap={4}>
                            <Calendar size={11} />
                            <Text size="xs" c="dimmed">Due: {item.dueDate}</Text>
                          </Group>
                        </Group>
                      </Box>

                      {/* Remarks input */}
                      <Box style={{ flexShrink: 0, minWidth: 200 }}>
                        <TextInput
                          placeholder="Add remark..."
                          size="xs"
                          value={remarks[item.id] || ""}
                          onChange={(e) => setRemarks((r) => ({ ...r, [item.id]: e.target.value }))}
                        />
                      </Box>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* ── Tab: Full & Final ── */}
      {activeTab === "fnf" && (
        <Stack gap="md" maw={640}>
          {/* Employee header */}
          <Paper withBorder radius="lg" p="md">
            <Group gap="md" wrap="nowrap">
              <Avatar color={avatarColor(FNF_DETAILS.name)} radius="xl" size={44}>
                {initials(FNF_DETAILS.name)}
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="md">{FNF_DETAILS.name}</Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {FNF_DETAILS.dept} Department · LWD: {FNF_DETAILS.lwdDisplay}
                </Text>
              </Box>
              <Badge variant="light" color="yellow">Settlement Pending</Badge>
            </Group>
          </Paper>

          {/* Settlement card */}
          <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
            {/* Header */}
            <Group gap="sm" p="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
              <ThemeIcon size={34} radius="lg" color="green" variant="light">
                <DollarSign size={16} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="md">Full &amp; Final Settlement</Text>
                <Text size="xs" c="dimmed">Calculated settlement breakdown</Text>
              </Box>
            </Group>

            {/* Line items */}
            {FNF_DETAILS.items.map((item, idx) => {
              const isDeduction = item.sign === -1 && item.amount > 0;
              const amtColor = isDeduction ? "red" : "green";
              const amtPrefix = isDeduction ? "-₹" : item.sign === 1 && idx > 0 ? "+₹" : "₹";
              return (
                <Group
                  key={item.label}
                  justify="space-between"
                  p="sm"
                  px="md"
                  style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
                >
                  <Box>
                    <Text size="sm" fw={500}>{item.label}</Text>
                    <Text size="xs" c="dimmed" mt={2}>{item.note}</Text>
                  </Box>
                  <Text size="md" fw={600} c={idx === 0 ? undefined : amtColor}>
                    {idx === 0
                      ? `₹${item.amount.toLocaleString("en-IN")}`
                      : `${amtPrefix}${item.amount.toLocaleString("en-IN")}`
                    }
                  </Text>
                </Group>
              );
            })}

            {/* Net Settlement */}
            <Group
              justify="space-between"
              p="md"
              bg="green.0"
              style={{ borderTop: "2px solid var(--mantine-color-green-6)" }}
            >
              <Text fw={700} size="md" c="green">Net Settlement Amount</Text>
              <Text fw={700} size="xl" c="green">
                ₹{FNF_DETAILS.net.toLocaleString("en-IN")}
              </Text>
            </Group>

            {/* Actions */}
            <Group p="md" gap="sm" wrap="wrap" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
              <Button leftSection={<FileText size={15} />} color="blue">
                Generate Settlement Letter
              </Button>
              <Button leftSection={<Download size={15} />} variant="default">
                Download PDF
              </Button>
              <Button leftSection={<Printer size={15} />} variant="default">
                Print
              </Button>
            </Group>
          </Paper>
        </Stack>
      )}

      {/* ── View Exit Detail Modal ── */}
      <Modal
        opened={!!viewExit}
        onClose={() => setViewExit(null)}
        title={<Text fw={700} size="md">Exit Details</Text>}
        radius="lg"
        size="sm"
      >
        {viewExit && (
          <Stack gap={0}>
            {[
              ["Employee",         viewExit.name],
              ["Department",       viewExit.dept],
              ["Last Working Day", formatLWD(viewExit.lwd || viewExit.lastWorkingDay)],
              ["Exit Type",        viewExit.type],
              ["Stage",            viewExit.stage],
              ["Notice Period",    viewExit.noticePeriod || "—"],
            ].map(([label, value]) => (
              <Group
                key={label}
                justify="space-between"
                py="xs"
                style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
              >
                <Text size="sm" c="dimmed">{label}</Text>
                <Text size="sm" fw={500}>{value}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default ExitManagement;
