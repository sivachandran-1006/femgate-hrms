import { useState } from "react";
import {
  UserPlus, Users, CheckSquare, Clock, TrendingUp,
  FileText, Monitor, Mail, BookOpen, Shield, Calendar,
  Check, X, Plus, Briefcase, ArrowUpRight, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  Group, SimpleGrid, Stack, Text, Badge, Avatar,
  ScrollArea, Table, Progress, Tabs, Paper, Box,
  ActionIcon,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";

import { COLORS }         from "../../theme/colors";
import { getAvatarColor } from "../../utils/helpers";

// ── Data ─────────────────────────────────────────────────────────────────────

const TASK_DEFS = [
  { key: "documentCollection", label: "Document Collection", icon: FileText,  color: COLORS.primary },
  { key: "itAssetSetup",       label: "IT Asset Setup",      icon: Monitor,   color: COLORS.purple  },
  { key: "emailCreation",      label: "Email Creation",      icon: Mail,      color: COLORS.info    },
  { key: "trainingAssignment", label: "Training Assignment", icon: BookOpen,  color: COLORS.warning },
  { key: "policyAcceptance",   label: "Policy Acceptance",   icon: Shield,    color: COLORS.success },
];

const MOCK_EMPLOYEES = [
  { id: 1, name: "Arjun Kumar",   department: "IT",      role: "Software Engineer",  joiningDate: "2026-06-03", mentor: "Siva",      tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: true,  trainingAssignment: false, policyAcceptance: false } },
  { id: 2, name: "Priya Sharma",  department: "HR",      role: "HR Executive",        joiningDate: "2026-06-05", mentor: "Big Kundi", tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: false, trainingAssignment: false, policyAcceptance: false } },
  { id: 3, name: "Karthik Raj",   department: "Finance", role: "Finance Analyst",     joiningDate: "2026-06-10", mentor: "Safeer",    tasks: { documentCollection: true,  itAssetSetup: false, emailCreation: false, trainingAssignment: false, policyAcceptance: false } },
  { id: 4, name: "Divya Nair",    department: "IT",      role: "Frontend Developer",  joiningDate: "2026-05-28", mentor: "Siva",      tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: true,  trainingAssignment: true,  policyAcceptance: true  } },
];

const UPCOMING_JOINERS = [
  { id: 1, name: "Rohit Menon",    department: "Marketing",  role: "Marketing Analyst",  joiningDate: "2026-06-12", offerAccepted: true  },
  { id: 2, name: "Sneha Pillai",   department: "Operations", role: "Operations Manager", joiningDate: "2026-06-15", offerAccepted: true  },
  { id: 3, name: "Arun Nair",      department: "IT",         role: "DevOps Engineer",    joiningDate: "2026-06-20", offerAccepted: false },
  { id: 4, name: "Meera Krishnan", department: "Finance",    role: "Senior Accountant",  joiningDate: "2026-06-25", offerAccepted: true  },
];

const DEPT_COLORS = {
  IT:         { color: "blue"   },
  HR:         { color: "violet" },
  Finance:    { color: "green"  },
  Management: { color: "yellow" },
  Marketing:  { color: "cyan"   },
  Operations: { color: "orange" },
};

const initials    = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const getProgress = (tasks) => {
  const v = Object.values(tasks);
  return Math.round((v.filter(Boolean).length / v.length) * 100);
};
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysFrom = (dateStr) => Math.ceil((new Date(dateStr) - new Date("2026-06-01")) / 86400000);

// ── Component ─────────────────────────────────────────────────────────────────

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [expanded, setExpanded]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: "", department: "", role: "", joiningDate: "", mentor: "" });

  const completedCount = MOCK_EMPLOYEES.filter((e) => getProgress(e.tasks) === 100).length;
  const pendingTasks   = MOCK_EMPLOYEES.reduce((s, e) => s + Object.values(e.tasks).filter((v) => !v).length, 0);
  const doneTasks      = MOCK_EMPLOYEES.reduce((s, e) => s + Object.values(e.tasks).filter(Boolean).length, 0);
  const avgProgress    = Math.round(MOCK_EMPLOYEES.reduce((s, e) => s + getProgress(e.tasks), 0) / MOCK_EMPLOYEES.length);

  return (
    <>
      <AppPageHeader
        title="Onboarding"
        sub="Manage and track new joiner onboarding progress"
        action={
          <AppButton leftSection={<UserPlus size={16} />} onClick={() => setShowModal(true)}>
            Add New Joiner
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<Users size={22} />}       label="Active Onboardings"  value={MOCK_EMPLOYEES.length} sub={`${completedCount} completed`}      color="blue"   />
        <AppStatCard icon={<Clock size={22} />}       label="Pending Tasks"       value={pendingTasks}          sub="across all joiners"                  color="yellow" />
        <AppStatCard icon={<CheckSquare size={22} />} label="Completed Tasks"     value={doneTasks}             sub={`${doneTasks + pendingTasks} total`} color="green"  />
        <AppStatCard icon={<TrendingUp size={22} />}  label="Avg Completion Rate" value={`${avgProgress}%`}     sub="this onboarding cycle"               color="violet" />
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="active">Active ({MOCK_EMPLOYEES.length})</Tabs.Tab>
          <Tabs.Tab value="upcoming">Upcoming ({UPCOMING_JOINERS.length})</Tabs.Tab>
          <Tabs.Tab value="checklist">Task Checklist</Tabs.Tab>
        </Tabs.List>

        {/* ── ACTIVE ONBOARDINGS ── */}
        <Tabs.Panel value="active">
          <Group align="flex-start" gap="lg" wrap="nowrap" style={{ alignItems: "stretch" }}>
            {/* Employee Cards */}
            <Stack gap="md" style={{ flex: "1.6 1 0", minWidth: 0 }}>
              {MOCK_EMPLOYEES.map((emp) => {
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
                            <Badge color={deptColor} variant="light" radius="xl" size="xs">{emp.department}</Badge>
                          </Group>
                          <Text size="xs" c="dimmed">{emp.role}</Text>
                          <Group gap="md" mt={4}>
                            <Group gap={4} wrap="nowrap">
                              <Calendar size={11} />
                              <Text size="xs" c="dimmed">{fmtDate(emp.joiningDate)}</Text>
                            </Group>
                            <Group gap={4} wrap="nowrap">
                              <Briefcase size={11} />
                              <Text size="xs" c="dimmed">Mentor: {emp.mentor}</Text>
                            </Group>
                          </Group>
                        </Box>
                        <Badge
                          color={isComplete ? "green" : "yellow"}
                          variant="light"
                          radius="xl"
                          style={{ flexShrink: 0 }}
                        >
                          {isComplete ? "✓ Completed" : "In Progress"}
                        </Badge>
                      </Group>

                      {/* Progress bar */}
                      <Box mb="md">
                        <Group justify="space-between" mb={6}>
                          <Text size="xs" c="dimmed">{completed} of {TASK_DEFS.length} tasks done</Text>
                          <Text size="xs" fw={700} c={isComplete ? "green" : "blue"}>{progress}%</Text>
                        </Group>
                        <Progress
                          value={progress}
                          color={isComplete ? "green" : "blue"}
                          radius="xl"
                          size="sm"
                        />
                      </Box>

                      {/* Task pills */}
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
                              leftSection={done ? <Check size={10} strokeWidth={2.5} /> : <Icon size={10} color={color} />}
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
                        leftSection={isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
                                  background: done ? "var(--mantine-color-green-0)" : "var(--mantine-color-gray-0)",
                                  border: `1px solid ${done ? "var(--mantine-color-green-2)" : "var(--mantine-color-gray-2)"}`,
                                }}
                                wrap="nowrap"
                              >
                                <Avatar size={32} radius="md" color={done ? "green" : "gray"} variant="light" style={{ flexShrink: 0 }}>
                                  <Icon size={15} color={done ? COLORS.success : color} />
                                </Avatar>
                                <Text size="sm" fw={500} c={done ? "green" : undefined} style={{ flex: 1 }}>{label}</Text>
                                <Avatar size={22} radius="xl" color={done ? "green" : "gray"} variant={done ? "filled" : "light"}>
                                  {done ? <Check size={12} color="#fff" strokeWidth={2.5} /> : <X size={10} />}
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
              {/* Summary gradient card */}
              <Paper radius="xl" p="md" style={{ background: `linear-gradient(135deg,${COLORS.primary},${COLORS.primaryHover})`, color: "#fff" }}>
                <Text size="xs" fw={600} mb="md" style={{ opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em" }}>Summary</Text>
                {[
                  { label: "Active Onboardings", value: MOCK_EMPLOYEES.length },
                  { label: "Fully Completed",     value: completedCount        },
                  { label: "In Progress",          value: MOCK_EMPLOYEES.length - completedCount },
                  { label: "Pre-joining",          value: UPCOMING_JOINERS.length },
                  { label: "Avg Completion",       value: `${avgProgress}%`     },
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

              {/* Upcoming Joiners preview */}
              <AppSection
                noPadding
                title="Upcoming Joiners"
                action={
                  <AppButton variant="subtle" size="xs" rightSection={<ArrowUpRight size={12} />} onClick={() => setActiveTab("upcoming")}>
                    View all
                  </AppButton>
                }
              >
                {UPCOMING_JOINERS.slice(0, 3).map((j, i, arr) => {
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

              {/* Onboarding Timeline */}
              <AppSection title="Onboarding Timeline">
                <Stack gap="xs">
                  {[
                    { label: "Offer Accepted",     done: true,  color: "green"  },
                    { label: "Documents Submitted", done: true,  color: "green"  },
                    { label: "IT Setup Complete",   done: true,  color: "green"  },
                    { label: "Training Assigned",   done: false, color: "yellow" },
                    { label: "Policy Sign-off",     done: false, color: "gray"   },
                    { label: "Onboarding Complete", done: false, color: "gray"   },
                  ].map(({ label, done, color }, i, arr) => (
                    <Group key={label} gap="md" align="flex-start" wrap="nowrap">
                      <Stack gap={0} align="center" style={{ flexShrink: 0 }}>
                        <Avatar size={22} radius="xl" color={done ? "green" : "gray"} variant={done ? "filled" : "light"}>
                          {done ? <Check size={12} color="#fff" strokeWidth={2.5} /> : <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mantine-color-gray-4)" }} />}
                        </Avatar>
                        {i < arr.length - 1 && (
                          <Box style={{ width: 2, height: 16, background: done ? "#86efac" : "var(--mantine-color-gray-3)", margin: "2px 0" }} />
                        )}
                      </Stack>
                      <Text size="xs" mt={2} c={done ? undefined : "dimmed"} fw={done ? 500 : 400}>{label}</Text>
                    </Group>
                  ))}
                </Stack>
              </AppSection>
            </Stack>
          </Group>
        </Tabs.Panel>

        {/* ── UPCOMING JOINERS ── */}
        <Tabs.Panel value="upcoming">
          <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md">
            {UPCOMING_JOINERS.map((j) => {
              const av         = getAvatarColor(j.name);
              const deptColor  = DEPT_COLORS[j.department]?.color || "gray";
              const days       = daysFrom(j.joiningDate);
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
                          <Briefcase size={13} />
                          <Text size="xs" c="dimmed" fw={500}>Department</Text>
                        </Group>
                        <Badge color={deptColor} variant="light" radius="xl" size="xs">{j.department}</Badge>
                      </Paper>
                      <Paper withBorder radius="md" p="xs">
                        <Group gap={5} mb={2} wrap="nowrap">
                          <Calendar size={13} />
                          <Text size="xs" c="dimmed" fw={500}>Joining</Text>
                        </Group>
                        <Text size="xs" fw={600}>{fmtDate(j.joiningDate)}</Text>
                      </Paper>
                    </SimpleGrid>

                    <Group justify="space-between" align="center">
                      <Text size="xs" c="dimmed">Joining in</Text>
                      <Badge
                        color={days <= 7 ? "yellow" : days <= 14 ? "blue" : "green"}
                        variant="light"
                        radius="xl"
                      >
                        {days} day{days !== 1 ? "s" : ""}
                      </Badge>
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
                  {MOCK_EMPLOYEES.map((emp) => {
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
                          <Badge color={deptColor} variant="light" radius="xl" size="xs">{emp.department}</Badge>
                        </Table.Td>
                        {TASK_DEFS.map(({ key }) => (
                          <Table.Td key={key} style={{ textAlign: "center" }}>
                            <Avatar
                              size={24}
                              radius="xl"
                              color={emp.tasks[key] ? "green" : "gray"}
                              variant={emp.tasks[key] ? "filled" : "light"}
                              style={{ margin: "0 auto" }}
                            >
                              {emp.tasks[key]
                                ? <Check size={13} color="#fff" strokeWidth={2.5} />
                                : <X size={11} />
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
        icon={<UserPlus size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        <Stack gap="md">
          {[
            { label: "Full Name *",           key: "name",        type: "text", ph: "e.g. Arjun Kumar"       },
            { label: "Department",            key: "department",  type: "text", ph: "e.g. IT, HR, Finance"   },
            { label: "Role / Designation",    key: "role",        type: "text", ph: "e.g. Software Engineer" },
            { label: "Joining Date *",        key: "joiningDate", type: "date", ph: ""                       },
            { label: "Assigned Mentor",       key: "mentor",      type: "text", ph: "e.g. Siva"              },
          ].map(({ label, key, type, ph }) => (
            <AppInput
              key={key}
              label={label}
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowModal(false)}>Cancel</AppButton>
            <AppButton onClick={() => setShowModal(false)}>Add Joiner</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Onboarding;
