import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  IconTarget as Target,
  IconStar as Star,
  IconClipboardList as ClipboardList,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconPlayerPlayFilled as PlayCircle,
  IconTrendingUp as TrendingUp,
  IconUser as User,
  IconPlus, IconEdit, IconTrash, IconCheck,
} from "@tabler/icons-react";
import {
  Group, Stack, SimpleGrid, Text, Badge, Avatar, Box, Paper,
  ScrollArea, Table, Progress, Tabs, Modal, TextInput, Select, Textarea,
  ActionIcon,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";

import { COLORS }               from "../../theme/colors";
import { getAvatarColor }       from "../../utils/helpers";
import { usePerformance }       from "../../queries/useHr";
import {
  useCreateGoal, useUpdateGoal, useDeleteGoal,
  useCreateAppraisal, useUpdateAppraisal, useDeleteAppraisal,
} from "../../queries/usePerformance";
import { useToast } from "../../components/ui/Toast";

const statusColor = (s) =>
  s === "Completed" || s === "Reviewed" ? "green" :
  s === "At Risk" ? "orange" :
  s === "On Track" ? "blue" :
  s === "Submitted" ? "cyan" : "gray";

const progressColor = (s) =>
  s === "Completed" ? "green" : s === "At Risk" ? "orange" : "violet";

const StarRating = ({ value, onChange }) => (
  <Group gap={2} wrap="nowrap">
    {[1,2,3,4,5].map(i => (
      <Box
        key={i}
        component="span"
        onClick={() => onChange?.(i)}
        style={{ cursor: onChange ? "pointer" : "default", display: "inline-flex" }}
      >
        <Star size={13} fill={i <= value ? COLORS.warning : "none"} color={i <= value ? COLORS.warning : "#dee2e6"} />
      </Box>
    ))}
  </Group>
);

const EMPTY_GOAL = { employee: "", goal: "", targetDate: "", progress: 0, status: "On Track" };
const EMPTY_APPRAISAL = { employee: "", reviewer: "", period: "", selfRating: 0, managerRating: 0, status: "Pending" };

export default function Performance({ darkMode: dark }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Goal modal
  const [goalModal, setGoalModal]   = useState(null); // null | "add" | goal object
  const [goalForm, setGoalForm]     = useState(EMPTY_GOAL);
  const [deleteGoal, setDeleteGoal] = useState(null);

  // Appraisal modal
  const [apprModal, setApprModal]   = useState(null);
  const [apprForm, setApprForm]     = useState(EMPTY_APPRAISAL);
  const [deleteAppr, setDeleteAppr] = useState(null);

  const [saved, setSaved] = useState(false);

  const { show } = useToast();
  const { data: perfData } = usePerformance();
  const ratingDistribution    = perfData?.ratingDistribution    || [];
  const departmentPerformance = perfData?.departmentPerformance || [];
  const [goals, setGoals]         = useState(null);
  const [appraisals, setAppraisals] = useState(null);

  const goalsList = goals ?? (perfData?.goals || []).map(g => ({ ...g, targetDate: (g.targetDate||"").split("T")[0] }));
  const apprList  = appraisals ?? (perfData?.appraisals || []);

  // Mutations
  const createGoalMutation  = useCreateGoal();
  const updateGoalMutation  = useUpdateGoal();
  const deleteGoalMutation  = useDeleteGoal();
  const createApprMutation  = useCreateAppraisal();
  const updateApprMutation  = useUpdateAppraisal();
  const deleteApprMutation  = useDeleteAppraisal();

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Goal handlers
  const openAddGoal  = () => { setGoalForm(EMPTY_GOAL); setGoalModal("add"); };
  const openEditGoal = (g) => { setGoalForm({ ...g }); setGoalModal(g); };
  const saveGoal = async () => {
    if (!goalForm.employee || !goalForm.goal) return;
    try {
      if (goalModal === "add") {
        const created = await createGoalMutation.mutateAsync(goalForm);
        // optimistic fallback
        setGoals([...goalsList, { ...goalForm, id: created?.id || Date.now() }]);
      } else {
        await updateGoalMutation.mutateAsync({ id: goalModal.id, ...goalForm });
        setGoals(goalsList.map(g => g.id === goalModal.id ? { ...goalForm, id: goalModal.id } : g));
      }
      setGoalModal(null); showSaved();
    } catch (e) {
      show(e.message || "Failed to save goal", "error");
    }
  };
  const confirmDeleteGoal = async () => {
    try {
      await deleteGoalMutation.mutateAsync(deleteGoal.id);
      setGoals(goalsList.filter(g => g.id !== deleteGoal.id));
      setDeleteGoal(null);
    } catch (e) {
      show(e.message || "Failed to delete goal", "error");
    }
  };

  // Appraisal handlers
  const openAddAppr  = () => { setApprForm(EMPTY_APPRAISAL); setApprModal("add"); };
  const openEditAppr = (a) => { setApprForm({ ...a }); setApprModal(a); };
  const saveAppr = async () => {
    if (!apprForm.employee || !apprForm.reviewer) return;
    try {
      if (apprModal === "add") {
        const created = await createApprMutation.mutateAsync(apprForm);
        setAppraisals([...apprList, { ...apprForm, id: created?.id || Date.now() }]);
      } else {
        await updateApprMutation.mutateAsync({ id: apprModal.id, ...apprForm });
        setAppraisals(apprList.map(a => a.id === apprModal.id ? { ...apprForm, id: apprModal.id } : a));
      }
      setApprModal(null); showSaved();
    } catch (e) {
      show(e.message || "Failed to save appraisal", "error");
    }
  };
  const confirmDeleteAppr = async () => {
    try {
      await deleteApprMutation.mutateAsync(deleteAppr.id);
      setAppraisals(apprList.filter(a => a.id !== deleteAppr.id));
      setDeleteAppr(null);
    } catch (e) {
      show(e.message || "Failed to delete appraisal", "error");
    }
  };

  return (
    <>
      <AppPageHeader
        title="Performance Management"
        sub="Track goals, appraisals, and employee performance ratings"
        action={
          <AppButton leftSection={<PlayCircle size={16} />} color="violet" onClick={openAddAppr}>
            Start Review Cycle
          </AppButton>
        }
      />

      {saved && (
        <Paper withBorder={false} p="xs" radius="md" mb="sm" bg="var(--mantine-color-green-0)"
          style={{ border: "1px solid var(--mantine-color-green-3)", display: "inline-flex" }}>
          <Group gap={6}>
            <IconCheck size={14} color="var(--mantine-color-green-7)" stroke={2.5} />
            <Text fz="sm" c="green.7" fw={600}>Saved successfully</Text>
          </Group>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<PlayCircle size={22} />}   label="Active Reviews"           value={apprList.filter(a=>a.status==="Pending").length}    color="violet" />
        <AppStatCard icon={<CheckCircle size={22} />}  label="Completed Reviews"         value={apprList.filter(a=>a.status==="Reviewed"||a.status==="Completed").length}    color="green"  />
        <AppStatCard icon={<Star size={22} />}         label="Avg Rating"                value="4.1/5" color="yellow" />
        <AppStatCard icon={<Clock size={22} />}        label="Pending Self-Appraisals"   value={apprList.filter(a=>a.status==="Submitted").length}     color="red"    />
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="goals">Goals ({goalsList.length})</Tabs.Tab>
          <Tabs.Tab value="appraisals">Appraisals ({apprList.length})</Tabs.Tab>
        </Tabs.List>

        {/* ── OVERVIEW ── */}
        <Tabs.Panel value="overview">
          <Group align="flex-start" grow gap="lg">
            <AppSection title="Rating Distribution" icon={<TrendingUp size={18} color={COLORS.purple} />}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ratingDistribution} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-3)" />
                  <XAxis dataKey="rating" tick={{ fill: "var(--mantine-color-dimmed)", fontSize: 12 }} axisLine={{ stroke: "var(--mantine-color-gray-3)" }} tickLine={false} />
                  <YAxis tick={{ fill: "var(--mantine-color-dimmed)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" name="Employees" fill={COLORS.purple} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </AppSection>

            <AppSection title="Department Performance" icon={<Target size={18} color={COLORS.purple} />} noPadding>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Department","Employees","Avg Rating","Score"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {departmentPerformance.map(dept => (
                    <Table.Tr key={dept.department}>
                      <Table.Td><Text size="sm" fw={500}>{dept.department}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{dept.employees}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{dept.avgRating}</Text></Table.Td>
                      <Table.Td style={{ minWidth: 120 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Progress value={Math.round((dept.avgRating/5)*100)} color={dept.avgRating>=4.2?"green":dept.avgRating>=4.0?"violet":"yellow"} radius="xl" size="sm" style={{ flex:1 }} />
                          <Text size="xs" fw={600} c="dimmed" w={32}>{Math.round((dept.avgRating/5)*100)}%</Text>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </AppSection>
          </Group>
        </Tabs.Panel>

        {/* ── GOALS ── */}
        <Tabs.Panel value="goals">
          <AppSection noPadding title="Employee Goals" icon={<Target size={18} color={COLORS.purple} />}
            action={<AppButton leftSection={<IconPlus size={14}/>} size="xs" color="violet" onClick={openAddGoal}>Add Goal</AppButton>}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee","Goal","Target Date","Progress","Status","Actions"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {goalsList.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<Target size={24} />} message="No goals yet" sub='Click "Add Goal" to create one.' /></Table.Td></Table.Tr>
                  ) : goalsList.map(goal => {
                    const av = getAvatarColor(goal.employee);
                    return (
                      <Table.Tr key={goal.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color }}>
                              <Text size="xs" fw={700}>{(goal.employee||"?").charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500}>{goal.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 260 }}><Text size="sm" lineClamp={1}>{goal.goal}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed" style={{ whiteSpace:"nowrap" }}>{goal.targetDate||"—"}</Text></Table.Td>
                        <Table.Td style={{ minWidth: 140 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Progress value={Number(goal.progress)||0} color={progressColor(goal.status)} radius="xl" size="sm" style={{ flex:1 }} />
                            <Text size="xs" fw={600} c="dimmed" w={32}>{goal.progress}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Badge color={statusColor(goal.status)} variant="light" radius="xl">{goal.status}</Badge></Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <ActionIcon size="sm" variant="light" color="blue" radius="md" onClick={() => openEditGoal(goal)}>
                              <IconEdit size={13} />
                            </ActionIcon>
                            <ActionIcon size="sm" variant="light" color="red" radius="md" onClick={() => setDeleteGoal(goal)}>
                              <IconTrash size={13} />
                            </ActionIcon>
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

        {/* ── APPRAISALS ── */}
        <Tabs.Panel value="appraisals">
          <AppSection noPadding title="Appraisals" icon={<ClipboardList size={18} color={COLORS.purple} />}
            action={<AppButton leftSection={<IconPlus size={14}/>} size="xs" color="violet" onClick={openAddAppr}>Add Appraisal</AppButton>}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee","Reviewer","Period","Self Rating","Mgr Rating","Status","Actions"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {apprList.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={7}><AppEmptyState icon={<Star size={24} />} message="No appraisals yet" sub='Click "Add Appraisal" to create one.' /></Table.Td></Table.Tr>
                  ) : apprList.map(appr => {
                    const av = getAvatarColor(appr.employee);
                    return (
                      <Table.Tr key={appr.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color }}>
                              <Text size="xs" fw={700}>{(appr.employee||"?").charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500}>{appr.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Group gap={6} wrap="nowrap"><User size={13} color="var(--mantine-color-dimmed)"/><Text size="sm" c="dimmed">{appr.reviewer}</Text></Group></Table.Td>
                        <Table.Td><Badge variant="outline" color="gray" radius="sm">{appr.period}</Badge></Table.Td>
                        <Table.Td><StarRating value={appr.selfRating} /></Table.Td>
                        <Table.Td><StarRating value={appr.managerRating} /></Table.Td>
                        <Table.Td><Badge color={statusColor(appr.status)} variant="light" radius="xl">{appr.status}</Badge></Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <ActionIcon size="sm" variant="light" color="blue" radius="md" onClick={() => openEditAppr(appr)}>
                              <IconEdit size={13} />
                            </ActionIcon>
                            <ActionIcon size="sm" variant="light" color="red" radius="md" onClick={() => setDeleteAppr(appr)}>
                              <IconTrash size={13} />
                            </ActionIcon>
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

      {/* ── Goal Add/Edit Modal ── */}
      <Modal opened={!!goalModal} onClose={() => setGoalModal(null)}
        title={goalModal === "add" ? "Add Goal" : "Edit Goal"}
        centered radius="xl" size="md">
        <Stack gap="sm">
          <SimpleGrid cols={2} spacing="sm">
            <TextInput label="Employee Name" placeholder="e.g. John Doe" value={goalForm.employee}
              onChange={e => setGoalForm(f=>({...f, employee: e.target.value}))} />
            <TextInput type="date" label="Target Date" value={goalForm.targetDate}
              onChange={e => setGoalForm(f=>({...f, targetDate: e.target.value}))} />
          </SimpleGrid>
          <Textarea label="Goal Description" placeholder="Describe the goal..." rows={3}
            value={goalForm.goal} onChange={e => setGoalForm(f=>({...f, goal: e.target.value}))} />
          <SimpleGrid cols={2} spacing="sm">
            <TextInput type="number" label="Progress (%)" placeholder="0-100" value={goalForm.progress}
              onChange={e => setGoalForm(f=>({...f, progress: Math.min(100, Math.max(0, Number(e.target.value)))}))} />
            <Select label="Status" value={goalForm.status}
              onChange={v => setGoalForm(f=>({...f, status: v}))}
              data={["On Track","At Risk","Completed"]} />
          </SimpleGrid>
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setGoalModal(null)}>Cancel</AppButton>
            <AppButton color="violet" onClick={saveGoal}>
              {goalModal === "add" ? "Add Goal" : "Save Changes"}
            </AppButton>
          </Group>
        </Stack>
      </Modal>

      {/* ── Appraisal Add/Edit Modal ── */}
      <Modal opened={!!apprModal} onClose={() => setApprModal(null)}
        title={apprModal === "add" ? "Add Appraisal" : "Edit Appraisal"}
        centered radius="xl" size="md">
        <Stack gap="sm">
          <SimpleGrid cols={2} spacing="sm">
            <TextInput label="Employee Name" placeholder="e.g. John Doe" value={apprForm.employee}
              onChange={e => setApprForm(f=>({...f, employee: e.target.value}))} />
            <TextInput label="Reviewer" placeholder="e.g. Manager Name" value={apprForm.reviewer}
              onChange={e => setApprForm(f=>({...f, reviewer: e.target.value}))} />
            <TextInput label="Period" placeholder="e.g. Q1 2026" value={apprForm.period}
              onChange={e => setApprForm(f=>({...f, period: e.target.value}))} />
            <Select label="Status" value={apprForm.status}
              onChange={v => setApprForm(f=>({...f, status: v}))}
              data={["Pending","Submitted","Reviewed","Completed"]} />
          </SimpleGrid>
          <Group gap="xl">
            <Stack gap={4}>
              <Text fz="xs" fw={600} c="dimmed">Self Rating</Text>
              <StarRating value={apprForm.selfRating} onChange={v => setApprForm(f=>({...f, selfRating: v}))} />
            </Stack>
            <Stack gap={4}>
              <Text fz="xs" fw={600} c="dimmed">Manager Rating</Text>
              <StarRating value={apprForm.managerRating} onChange={v => setApprForm(f=>({...f, managerRating: v}))} />
            </Stack>
          </Group>
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setApprModal(null)}>Cancel</AppButton>
            <AppButton color="violet" onClick={saveAppr}>
              {apprModal === "add" ? "Add Appraisal" : "Save Changes"}
            </AppButton>
          </Group>
        </Stack>
      </Modal>

      {/* ── Delete Goal Confirm ── */}
      <Modal opened={!!deleteGoal} onClose={() => setDeleteGoal(null)} title="Delete Goal" centered radius="xl" size="sm">
        <Text fz="sm" c="dimmed" mb="lg">Are you sure you want to delete the goal for <strong>{deleteGoal?.employee}</strong>? This cannot be undone.</Text>
        <Group justify="flex-end" gap="sm">
          <AppButton variant="default" onClick={() => setDeleteGoal(null)}>Cancel</AppButton>
          <AppButton color="red" onClick={confirmDeleteGoal}>Delete</AppButton>
        </Group>
      </Modal>

      {/* ── Delete Appraisal Confirm ── */}
      <Modal opened={!!deleteAppr} onClose={() => setDeleteAppr(null)} title="Delete Appraisal" centered radius="xl" size="sm">
        <Text fz="sm" c="dimmed" mb="lg">Delete appraisal for <strong>{deleteAppr?.employee}</strong>?</Text>
        <Group justify="flex-end" gap="sm">
          <AppButton variant="default" onClick={() => setDeleteAppr(null)}>Cancel</AppButton>
          <AppButton color="red" onClick={confirmDeleteAppr}>Delete</AppButton>
        </Group>
      </Modal>
    </>
  );
}
