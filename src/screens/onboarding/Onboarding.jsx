import { useState } from "react";
import {
  IconUserPlus, IconUsers, IconCheckbox, IconClock, IconTrendingUp,
  IconFileText, IconDeviceDesktop, IconMail, IconBook, IconShield, IconCalendar,
  IconCheck, IconX, IconBriefcase, IconArrowUpRight, IconChevronDown, IconChevronUp,
  IconAlertCircle, IconTrash, IconPlayerPlay,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, Stack, Text, Badge, Avatar,
  ScrollArea, Table, Progress, Tabs, Paper, Box,
  ActionIcon, Select, Loader, Center, Alert,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";
import { useToast }       from "../../components/ui/Toast";

import { COLORS }         from "../../theme/colors";
import { getAvatarColor } from "../../utils/helpers";
import {
  useOnboarding, useCreateJoiner, useToggleTask, useStartOnboarding, useDeleteOnboarding,
} from "../../queries/useOnboarding";
import { useDepartments } from "../../queries/useDepartments";
import { useFetchAllEmployees } from "../../queries/useEmployees";

// ── Data ─────────────────────────────────────────────────────────────────────

const TASK_DEFS = [
  { key: "documentCollection", label: "Document Collection", icon: IconFileText,       color: COLORS.primary },
  { key: "itAssetSetup",       label: "IT Asset Setup",      icon: IconDeviceDesktop,  color: COLORS.purple  },
  { key: "emailCreation",      label: "Email Creation",      icon: IconMail,           color: COLORS.info    },
  { key: "trainingAssignment", label: "Training Assignment", icon: IconBook,           color: COLORS.warning },
  { key: "policyAcceptance",   label: "Policy Acceptance",   icon: IconShield,         color: COLORS.success },
];

const DEPT_COLORS = {
  Engineering: { color: "blue"   },
  IT:          { color: "blue"   },
  HR:          { color: "violet" },
  Finance:     { color: "green"  },
  Management:  { color: "yellow" },
  Marketing:   { color: "cyan"   },
  Operations:  { color: "orange" },
};

const initials    = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const getProgress = (tasks = {}) => {
  const v = Object.values(tasks);
  if (!v.length) return 0;
  return Math.round((v.filter(Boolean).length / v.length) * 100);
};
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysFrom = (dateStr) => Math.max(0, Math.ceil((new Date(dateStr) - new Date()) / 86400000));

const EMPTY_FORM = { name: "", department: "", role: "", joiningDate: "", mentor: "" };

// ── Component ─────────────────────────────────────────────────────────────────

const Onboarding = () => {
  const { show } = useToast();
  const { data: records = [], isLoading, isError } = useOnboarding();
  const { data: deptList = [] }  = useDepartments();
  const { data: employees = [] } = useFetchAllEmployees();

  const createMut = useCreateJoiner();
  const toggleMut = useToggleTask();
  const startMut  = useStartOnboarding();
  const deleteMut = useDeleteOnboarding();

  const [activeTab, setActiveTab] = useState("active");
  const [expanded, setExpanded]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  const active   = records.filter((r) => r.status === "Active" || r.status === "Completed");
  const upcoming = records.filter((r) => r.status === "Upcoming");

  const completedCount = active.filter((e) => getProgress(e.tasks) === 100).length;
  const pendingTasks   = active.reduce((s, e) => s + Object.values(e.tasks).filter((v) => !v).length, 0);
  const doneTasks      = active.reduce((s, e) => s + Object.values(e.tasks).filter(Boolean).length, 0);
  const avgProgress    = active.length ? Math.round(active.reduce((s, e) => s + getProgress(e.tasks), 0) / active.length) : 0;

  const handleAddJoiner = async () => {
    if (!form.name.trim() || !form.joiningDate) return show("Name and joining date are required", "error");
    try {
      await createMut.mutateAsync(form);
      show("New joiner added", "success");
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch {
      show("Failed to add joiner", "error");
    }
  };

  const handleToggleTask = async (rec, key) => {
    try {
      await toggleMut.mutateAsync({ id: rec.id, key, done: !rec.tasks[key] });
    } catch {
      show("Failed to update task", "error");
    }
  };

  const handleStart = async (id) => {
    try {
      await startMut.mutateAsync(id);
      show("Onboarding started", "success");
      setActiveTab("active");
    } catch {
      show("Failed to start onboarding", "error");
    }
  };

  const handleDelete = async (rec) => {
    try {
      await deleteMut.mutateAsync(rec.id);
      show(`"${rec.name}" removed`, "success");
    } catch {
      show("Failed to delete", "error");
    }
  };

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  return (
    <>
      <AppPageHeader
        title="Onboarding"
        sub="Manage and track new joiner onboarding progress"
        action={
          <AppButton leftSection={<IconUserPlus size={16} />} onClick={() => setShowModal(true)}>
            Add New Joiner
          </AppButton>
        }
      />

      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          Failed to load onboarding data. Make sure the backend is running.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<IconUsers size={22} />}      label="Active Onboardings"  value={active.length}    sub={`${completedCount} completed`}       color="blue"   />
        <AppStatCard icon={<IconClock size={22} />}      label="Pending Tasks"       value={pendingTasks}     sub="across all joiners"                  color="yellow" />
        <AppStatCard icon={<IconCheckbox size={22} />}   label="Completed Tasks"     value={doneTasks}        sub={`${doneTasks + pendingTasks} total`} color="green"  />
        <AppStatCard icon={<IconTrendingUp size={22} />} label="Avg Completion Rate" value={`${avgProgress}%`} sub="this onboarding cycle"              color="violet" />
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="active">Active ({active.length})</Tabs.Tab>
          <Tabs.Tab value="upcoming">Upcoming ({upcoming.length})</Tabs.Tab>
          <Tabs.Tab value="checklist">Task Checklist</Tabs.Tab>
        </Tabs.List>

        {/* ── ACTIVE ONBOARDINGS ── */}
        <Tabs.Panel value="active">
          <Group align="flex-start" gap="lg" wrap="nowrap" style={{ alignItems: "stretch" }}>
            <Stack gap="md" style={{ flex: "1.6 1 0", minWidth: 0 }}>
              {active.length === 0 && (
                <Paper withBorder radius="xl" p="xl">
                  <Text ta="center" c="dimmed">No active onboardings</Text>
                </Paper>
              )}
              {active.map((emp) => {
                const progress   = getProgress(emp.tasks);
                const av         = getAvatarColor(emp.name);
                const deptColor  = DEPT_COLORS[emp.department]?.color || "gray";
                const completed  = Object.values(emp.tasks).filter(Boolean).length;
                const isExpanded = expanded === emp.id;
                const isComplete = progress === 100;

                return (
                  <Paper
                    key={emp.id}
                    withBorder
                    radius="xl"
                    style={{ overflow: "hidden", borderColor: isComplete ? "#86efac" : undefined }}
                  >
                    {isComplete && (
                      <Box style={{ height: 3, background: "linear-gradient(90deg,#22c55e,#34d399)" }} />
                    )}
                    <Box p="md">
                      <Group gap="md" mb="md" wrap="nowrap" align="flex-start">
                        <Avatar size={48} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                          <Text fw={700} size="md">{initials(emp.name)}</Text>
                        </Avatar>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" mb={2} wrap="wrap">
                            <Text size="sm" fw={700}>{emp.name}</Text>
                            <Badge color={deptColor} variant="light" radius="xl" size="xs">{emp.department || "—"}</Badge>
                          </Group>
                          <Text size="xs" c="dimmed">{emp.role || "—"}</Text>
                          <Group gap="md" mt={4}>
                            <Group gap={4} wrap="nowrap">
                              <IconCalendar size={11} />
                              <Text size="xs" c="dimmed">{fmtDate(emp.joiningDate)}</Text>
                            </Group>
                            <Group gap={4} wrap="nowrap">
                              <IconBriefcase size={11} />
                              <Text size="xs" c="dimmed">Mentor: {emp.mentor || "—"}</Text>
                            </Group>
                          </Group>
                        </Box>
                        <Group gap={6} style={{ flexShrink: 0 }}>
                          <Badge color={isComplete ? "green" : "yellow"} variant="light" radius="xl">
                            {isComplete ? "✓ Completed" : "In Progress"}
                          </Badge>
                          <ActionIcon size="sm" variant="subtle" color="red"
                            loading={deleteMut.isPending && deleteMut.variables === emp.id}
                            onClick={() => handleDelete(emp)}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      {/* Progress bar */}
                      <Box mb="md">
                        <Group justify="space-between" mb={6}>
                          <Text size="xs" c="dimmed">{completed} of {TASK_DEFS.length} tasks done</Text>
                          <Text size="xs" fw={700} c={isComplete ? "green" : "blue"}>{progress}%</Text>
                        </Group>
                        <Progress value={progress} color={isComplete ? "green" : "blue"} radius="xl" size="sm" />
                      </Box>

                      {/* Task pills — click to toggle */}
                      <Group gap="xs" mb={isExpanded ? "md" : 0} wrap="wrap">
                        {TASK_DEFS.map(({ key, label, icon: Icon, color }) => {
                          const done = emp.tasks[key];
                          return (
                            <Badge
                              key={key}
                              color={done ? "green" : "gray"}
                              variant={done ? "light" : "outline"}
                              radius="xl"
                              size="sm"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleToggleTask(emp, key)}
                              leftSection={done ? <IconCheck size={10} stroke={2.5} /> : <Icon size={10} color={color} />}
                            >
                              {label}
                            </Badge>
                          );
                        })}
                      </Group>

                      <AppButton
                        variant="subtle"
                        size="xs"
                        mt="xs"
                        leftSection={isExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                        onClick={() => setExpanded(isExpanded ? null : emp.id)}
                        px={0}
                      >
                        {isExpanded ? "Show less" : "Show task details"}
                      </AppButton>

                      {isExpanded && (
                        <Stack gap="xs" mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                          {TASK_DEFS.map(({ key, label, icon: Icon, color }) => {
                            const done = emp.tasks[key];
                            return (
                              <Group
                                key={key}
                                gap="md"
                                p="sm"
                                style={{
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  background: done ? "var(--mantine-color-green-0)" : "var(--mantine-color-gray-0)",
                                  border: `1px solid ${done ? "var(--mantine-color-green-2)" : "var(--mantine-color-gray-2)"}`,
                                }}
                                wrap="nowrap"
                                onClick={() => handleToggleTask(emp, key)}
                              >
                                <Avatar size={32} radius="md" color={done ? "green" : "gray"} variant="light" style={{ flexShrink: 0 }}>
                                  <Icon size={15} color={done ? COLORS.success : color} />
                                </Avatar>
                                <Box style={{ flex: 1 }}>
                                  <Text size="sm" fw={500} c={done ? "green" : undefined}>{label}</Text>
                                  <Text size="xs" c="dimmed">Click to mark {done ? "incomplete" : "complete"}</Text>
                                </Box>
                                <Avatar size={22} radius="xl" color={done ? "green" : "gray"} variant={done ? "filled" : "light"}>
                                  {done ? <IconCheck size={12} color="#fff" stroke={2.5} /> : <IconX size={10} />}
                                </Avatar>
                              </Group>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>

            {/* Right Panel */}
            <Stack gap="md" style={{ flex: "1 1 0", minWidth: 260 }}>
              <Paper radius="xl" p="md" style={{ background: `linear-gradient(135deg,${COLORS.primary},${COLORS.primaryHover})`, color: "#fff" }}>
                <Text size="xs" fw={600} mb="md" style={{ opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em" }}>Summary</Text>
                {[
                  { label: "Active Onboardings", value: active.length },
                  { label: "Fully Completed",    value: completedCount },
                  { label: "In Progress",        value: active.length - completedCount },
                  { label: "Pre-joining",        value: upcoming.length },
                  { label: "Avg Completion",     value: `${avgProgress}%` },
                ].map(({ label, value }, i, arr) => (
                  <Group
                    key={label}
                    justify="space-between"
                    pb={i < arr.length - 1 ? "xs" : 0}
                    mb={i < arr.length - 1 ? "xs" : 0}
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}
                  >
                    <Text size="sm" style={{ opacity: 0.85 }}>{label}</Text>
                    <Text size="sm" fw={700}>{value}</Text>
                  </Group>
                ))}
              </Paper>

              <AppSection
                noPadding
                title="Upcoming Joiners"
                action={
                  <AppButton variant="subtle" size="xs" rightSection={<IconArrowUpRight size={12} />} onClick={() => setActiveTab("upcoming")}>
                    View all
                  </AppButton>
                }
              >
                {upcoming.length === 0 && <Text ta="center" c="dimmed" fz="sm" py="md">No upcoming joiners</Text>}
                {upcoming.slice(0, 3).map((j, i, arr) => {
                  const av   = getAvatarColor(j.name);
                  const days = daysFrom(j.joiningDate);
                  return (
                    <Group
                      key={j.id}
                      gap="sm"
                      p="sm"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-gray-2)" : "none" }}
                      wrap="nowrap"
                    >
                      <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                        <Text size="xs" fw={700}>{initials(j.name)}</Text>
                      </Avatar>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="xs" fw={600} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.name}</Text>
                        <Text size="xs" c="dimmed">{j.department}</Text>
                      </Box>
                      <Badge color={days <= 7 ? "yellow" : "blue"} variant="light" radius="xl" size="xs">{days}d</Badge>
                    </Group>
                  );
                })}
              </AppSection>
            </Stack>
          </Group>
        </Tabs.Panel>

        {/* ── UPCOMING JOINERS ── */}
        <Tabs.Panel value="upcoming">
          {upcoming.length === 0 && (
            <Paper withBorder radius="xl" p="xl"><Text ta="center" c="dimmed">No upcoming joiners</Text></Paper>
          )}
          <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md">
            {upcoming.map((j) => {
              const av        = getAvatarColor(j.name);
              const deptColor = DEPT_COLORS[j.department]?.color || "gray";
              const days      = daysFrom(j.joiningDate);
              return (
                <Paper key={j.id} withBorder radius="xl" style={{ overflow: "hidden" }}>
                  <Box style={{ height: 4, background: j.offerAccepted ? "linear-gradient(90deg,#22c55e,#34d399)" : "linear-gradient(90deg,#f59e0b,#fb923c)" }} />
                  <Box p="md">
                    <Group gap="md" mb="md" wrap="nowrap" align="flex-start">
                      <Avatar size={50} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                        <Text fw={700} size="md">{initials(j.name)}</Text>
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={700}>{j.name}</Text>
                        <Text size="xs" c="dimmed">{j.role}</Text>
                      </Box>
                      <Badge
                        color={j.offerAccepted ? "green" : "yellow"}
                        variant="light"
                        radius="xl"
                        size="sm"
                        style={{ flexShrink: 0 }}
                      >
                        {j.offerAccepted ? "Offer Accepted" : "Pending"}
                      </Badge>
                    </Group>

                    <SimpleGrid cols={2} spacing="xs" mb="sm">
                      <Paper withBorder radius="md" p="xs">
                        <Group gap={5} mb={2} wrap="nowrap">
                          <IconBriefcase size={13} />
                          <Text size="xs" c="dimmed" fw={500}>Department</Text>
                        </Group>
                        <Badge color={deptColor} variant="light" radius="xl" size="xs">{j.department || "—"}</Badge>
                      </Paper>
                      <Paper withBorder radius="md" p="xs">
                        <Group gap={5} mb={2} wrap="nowrap">
                          <IconCalendar size={13} />
                          <Text size="xs" c="dimmed" fw={500}>Joining</Text>
                        </Group>
                        <Text size="xs" fw={600}>{fmtDate(j.joiningDate)}</Text>
                      </Paper>
                    </SimpleGrid>

                    <Group justify="space-between" align="center">
                      <Badge
                        color={days <= 7 ? "yellow" : days <= 14 ? "blue" : "green"}
                        variant="light"
                        radius="xl"
                      >
                        in {days} day{days !== 1 ? "s" : ""}
                      </Badge>
                      <Group gap={6}>
                        <AppButton
                          size="xs"
                          color="green"
                          leftSection={<IconPlayerPlay size={12} />}
                          loading={startMut.isPending && startMut.variables === j.id}
                          onClick={() => handleStart(j.id)}
                        >
                          Start Onboarding
                        </AppButton>
                        <ActionIcon size="sm" variant="subtle" color="red"
                          loading={deleteMut.isPending && deleteMut.variables === j.id}
                          onClick={() => handleDelete(j)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Tabs.Panel>

        {/* ── TASK CHECKLIST ── */}
        <Tabs.Panel value="checklist">
          <AppSection
            noPadding
            title="All Onboarding Tasks"
            action={<Text size="sm" c="dimmed">{doneTasks} of {doneTasks + pendingTasks} completed</Text>}
          >
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee", "Department", ...TASK_DEFS.map((t) => t.label), "Progress"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {active.map((emp) => {
                    const av        = getAvatarColor(emp.name);
                    const deptColor = DEPT_COLORS[emp.department]?.color || "gray";
                    const progress  = getProgress(emp.tasks);
                    return (
                      <Table.Tr key={emp.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={32} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                              <Text size="xs" fw={700}>{initials(emp.name)}</Text>
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={600}>{emp.name}</Text>
                              <Text size="xs" c="dimmed">{emp.role}</Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={deptColor} variant="light" radius="xl" size="xs">{emp.department || "—"}</Badge>
                        </Table.Td>
                        {TASK_DEFS.map(({ key }) => (
                          <Table.Td key={key} style={{ textAlign: "center" }}>
                            <Avatar
                              size={24}
                              radius="xl"
                              color={emp.tasks[key] ? "green" : "gray"}
                              variant={emp.tasks[key] ? "filled" : "light"}
                              style={{ margin: "0 auto", cursor: "pointer" }}
                              onClick={() => handleToggleTask(emp, key)}
                            >
                              {emp.tasks[key]
                                ? <IconCheck size={13} color="#fff" stroke={2.5} />
                                : <IconX size={11} />
                              }
                            </Avatar>
                          </Table.Td>
                        ))}
                        <Table.Td style={{ minWidth: 120 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Progress
                              value={progress}
                              color={progress === 100 ? "green" : "blue"}
                              radius="xl"
                              size="xs"
                              style={{ flex: 1 }}
                            />
                            <Text size="xs" fw={700} c={progress === 100 ? "green" : "blue"} w={30}>{progress}%</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      {/* Add New Joiner Modal */}
      <AppModal
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Joiner"
        icon={<IconUserPlus size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        <Stack gap="md">
          <AppInput
            label="Full Name *"
            placeholder="e.g. Arjun Kumar"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Department"
            placeholder="Select department"
            value={form.department || null}
            onChange={(v) => setForm({ ...form, department: v })}
            data={deptList.map((d) => d.name)}
          />
          <AppInput
            label="Role / Designation"
            placeholder="e.g. Software Engineer"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <AppInput
            label="Joining Date *"
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />
          <Select
            label="Assigned Mentor"
            placeholder="Select mentor"
            value={form.mentor || null}
            onChange={(v) => setForm({ ...form, mentor: v })}
            data={employees.map((e) => e.name)}
          />
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowModal(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending} onClick={handleAddJoiner}>Add Joiner</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Onboarding;
