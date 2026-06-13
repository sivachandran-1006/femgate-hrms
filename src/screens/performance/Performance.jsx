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
  IconPlus, IconEdit, IconTrash, IconX, IconCheck,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, Text, Badge, Avatar,
  ScrollArea, Table, Progress, Tabs, Modal, TextInput, Select, Textarea,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";

import { COLORS }               from "../../theme/colors";
import { getAvatarColor }       from "../../utils/helpers";
import { usePerformance }       from "../../queries/useHr";

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
      <span key={i} onClick={() => onChange?.(i)} style={{ cursor: onChange ? "pointer" : "default" }}>
        <Star size={13} fill={i <= value ? COLORS.warning : "none"} color={i <= value ? COLORS.warning : "#dee2e6"} />
      </span>
    ))}
  </Group>
);

const EMPTY_GOAL = { employee: "", goal: "", targetDate: "", progress: 0, status: "On Track" };
const EMPTY_APPRAISAL = { employee: "", reviewer: "", period: "", selfRating: 0, managerRating: 0, status: "Pending" };

const inp = (dark) => ({
  input: { background: dark ? "#0f172a" : "#f8fafc", borderColor: dark ? "#334155" : "#e2e8f0", color: dark ? "#f1f5f9" : "#0f172a" },
  label: { color: dark ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 12 },
});

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

  const { data: perfData } = usePerformance();
  const ratingDistribution    = perfData?.ratingDistribution    || [];
  const departmentPerformance = perfData?.departmentPerformance || [];
  const [goals, setGoals]         = useState(null);
  const [appraisals, setAppraisals] = useState(null);

  const goalsList = goals ?? (perfData?.goals || []).map(g => ({ ...g, targetDate: (g.targetDate||"").split("T")[0] }));
  const apprList  = appraisals ?? (perfData?.appraisals || []);

  const card   = dark ? "#1e293b" : "#ffffff";
  const border = dark ? "#334155" : "#e2e8f0";
  const text   = dark ? "#f1f5f9" : "#0f172a";
  const sub    = dark ? "#94a3b8" : "#64748b";

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Goal handlers
  const openAddGoal  = () => { setGoalForm(EMPTY_GOAL); setGoalModal("add"); };
  const openEditGoal = (g) => { setGoalForm({ ...g }); setGoalModal(g); };
  const saveGoal = () => {
    if (!goalForm.employee || !goalForm.goal) return;
    if (goalModal === "add") {
      setGoals([...goalsList, { ...goalForm, id: Date.now() }]);
    } else {
      setGoals(goalsList.map(g => g.id === goalModal.id ? { ...goalForm } : g));
    }
    setGoalModal(null); showSaved();
  };
  const confirmDeleteGoal = () => {
    setGoals(goalsList.filter(g => g.id !== deleteGoal.id));
    setDeleteGoal(null);
  };

  // Appraisal handlers
  const openAddAppr  = () => { setApprForm(EMPTY_APPRAISAL); setApprModal("add"); };
  const openEditAppr = (a) => { setApprForm({ ...a }); setApprModal(a); };
  const saveAppr = () => {
    if (!apprForm.employee || !apprForm.reviewer) return;
    if (apprModal === "add") {
      setAppraisals([...apprList, { ...apprForm, id: Date.now() }]);
    } else {
      setAppraisals(apprList.map(a => a.id === apprModal.id ? { ...apprForm } : a));
    }
    setApprModal(null); showSaved();
  };
  const confirmDeleteAppr = () => {
    setAppraisals(apprList.filter(a => a.id !== deleteAppr.id));
    setDeleteAppr(null);
  };

  const modalStyles = {
    header: { background: card, borderBottom: `1px solid ${border}` },
    body:   { background: card },
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
        <Group gap={6} mb="sm" style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10, padding: "8px 14px", display: "inline-flex" }}>
          <IconCheck size={14} color="#16a34a" stroke={2.5} />
          <Text fz="sm" c="#16a34a" fw={600}>Saved successfully</Text>
        </Group>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<PlayCircle size={22} />}   label="Active Reviews"           value={apprList.filter(a=>a.status==="Pending").length||"24"}    color="violet" />
        <AppStatCard icon={<CheckCircle size={22} />}  label="Completed Reviews"         value={apprList.filter(a=>a.status==="Reviewed"||a.status==="Completed").length||"61"}    color="green"  />
        <AppStatCard icon={<Star size={22} />}         label="Avg Rating"                value="4.1/5" color="yellow" />
        <AppStatCard icon={<Clock size={22} />}        label="Pending Self-Appraisals"   value={apprList.filter(a=>a.status==="Submitted").length||"9"}     color="red"    />
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
                  <CartesianGrid strokeDasharray="3 3" stroke={border} />
                  <XAxis dataKey="rating" tick={{ fill: sub, fontSize: 12 }} axisLine={{ stroke: border }} tickLine={false} />
                  <YAxis tick={{ fill: sub, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
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
                      <Table.Td><Text size="sm" fw={500} c={text}>{dept.department}</Text></Table.Td>
                      <Table.Td><Text size="sm" c={sub}>{dept.employees}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600} c={text}>{dept.avgRating}</Text></Table.Td>
                      <Table.Td style={{ minWidth: 120 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Progress value={Math.round((dept.avgRating/5)*100)} color={dept.avgRating>=4.2?"green":dept.avgRating>=4.0?"violet":"yellow"} radius="xl" size="sm" style={{ flex:1 }} />
                          <Text size="xs" fw={600} c={sub} w={32}>{Math.round((dept.avgRating/5)*100)}%</Text>
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
                    <Table.Tr><Table.Td colSpan={6}><Text ta="center" c="dimmed" py="xl">No goals yet. Click "Add Goal" to create one.</Text></Table.Td></Table.Tr>
                  ) : goalsList.map(goal => {
                    const av = getAvatarColor(goal.employee);
                    return (
                      <Table.Tr key={goal.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color }}>
                              <Text size="xs" fw={700}>{(goal.employee||"?").charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500} c={text}>{goal.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 260 }}><Text size="sm" c={text} lineClamp={1}>{goal.goal}</Text></Table.Td>
                        <Table.Td><Text size="sm" c={sub} style={{ whiteSpace:"nowrap" }}>{goal.targetDate||"—"}</Text></Table.Td>
                        <Table.Td style={{ minWidth: 140 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Progress value={Number(goal.progress)||0} color={progressColor(goal.status)} radius="xl" size="sm" style={{ flex:1 }} />
                            <Text size="xs" fw={600} c={sub} w={32}>{goal.progress}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Badge color={statusColor(goal.status)} variant="light" radius="xl">{goal.status}</Badge></Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <button onClick={() => openEditGoal(goal)} style={{ width:28, height:28, borderRadius:6, border:"none", background:"#eff6ff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <IconEdit size={13} color="#2563eb" />
                            </button>
                            <button onClick={() => setDeleteGoal(goal)} style={{ width:28, height:28, borderRadius:6, border:"none", background:"#fee2e2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <IconTrash size={13} color="#dc2626" />
                            </button>
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
                    <Table.Tr><Table.Td colSpan={7}><Text ta="center" c="dimmed" py="xl">No appraisals yet.</Text></Table.Td></Table.Tr>
                  ) : apprList.map(appr => {
                    const av = getAvatarColor(appr.employee);
                    return (
                      <Table.Tr key={appr.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color }}>
                              <Text size="xs" fw={700}>{(appr.employee||"?").charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500} c={text}>{appr.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Group gap={6} wrap="nowrap"><User size={13} color={sub}/><Text size="sm" c={sub}>{appr.reviewer}</Text></Group></Table.Td>
                        <Table.Td><Badge variant="outline" color="gray" radius="sm">{appr.period}</Badge></Table.Td>
                        <Table.Td><StarRating value={appr.selfRating} /></Table.Td>
                        <Table.Td><StarRating value={appr.managerRating} /></Table.Td>
                        <Table.Td><Badge color={statusColor(appr.status)} variant="light" radius="xl">{appr.status}</Badge></Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <button onClick={() => openEditAppr(appr)} style={{ width:28, height:28, borderRadius:6, border:"none", background:"#eff6ff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <IconEdit size={13} color="#2563eb" />
                            </button>
                            <button onClick={() => setDeleteAppr(appr)} style={{ width:28, height:28, borderRadius:6, border:"none", background:"#fee2e2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <IconTrash size={13} color="#dc2626" />
                            </button>
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
        centered radius="xl" size="md" styles={modalStyles}>
        <SimpleGrid cols={2} spacing="sm">
          <TextInput label="Employee Name" placeholder="e.g. John Doe" value={goalForm.employee}
            onChange={e => setGoalForm(f=>({...f, employee: e.target.value}))} styles={inp(dark)} />
          <TextInput type="date" label="Target Date" value={goalForm.targetDate}
            onChange={e => setGoalForm(f=>({...f, targetDate: e.target.value}))} styles={inp(dark)} />
        </SimpleGrid>
        <Textarea label="Goal Description" placeholder="Describe the goal..." mt="sm" rows={3}
          value={goalForm.goal} onChange={e => setGoalForm(f=>({...f, goal: e.target.value}))} styles={inp(dark)} />
        <SimpleGrid cols={2} spacing="sm" mt="sm">
          <TextInput type="number" label="Progress (%)" placeholder="0-100" value={goalForm.progress}
            onChange={e => setGoalForm(f=>({...f, progress: Math.min(100, Math.max(0, Number(e.target.value)))}))} styles={inp(dark)} />
          <Select label="Status" value={goalForm.status}
            onChange={v => setGoalForm(f=>({...f, status: v}))}
            data={["On Track","At Risk","Completed"]} styles={inp(dark)} />
        </SimpleGrid>
        <Group justify="flex-end" mt="lg" gap="sm">
          <button onClick={() => setGoalModal(null)} style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:sub, cursor:"pointer" }}>Cancel</button>
          <button onClick={saveGoal} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:600, cursor:"pointer" }}>
            {goalModal === "add" ? "Add Goal" : "Save Changes"}
          </button>
        </Group>
      </Modal>

      {/* ── Appraisal Add/Edit Modal ── */}
      <Modal opened={!!apprModal} onClose={() => setApprModal(null)}
        title={apprModal === "add" ? "Add Appraisal" : "Edit Appraisal"}
        centered radius="xl" size="md" styles={modalStyles}>
        <SimpleGrid cols={2} spacing="sm">
          <TextInput label="Employee Name" placeholder="e.g. John Doe" value={apprForm.employee}
            onChange={e => setApprForm(f=>({...f, employee: e.target.value}))} styles={inp(dark)} />
          <TextInput label="Reviewer" placeholder="e.g. Manager Name" value={apprForm.reviewer}
            onChange={e => setApprForm(f=>({...f, reviewer: e.target.value}))} styles={inp(dark)} />
          <TextInput label="Period" placeholder="e.g. Q1 2026" value={apprForm.period}
            onChange={e => setApprForm(f=>({...f, period: e.target.value}))} styles={inp(dark)} />
          <Select label="Status" value={apprForm.status}
            onChange={v => setApprForm(f=>({...f, status: v}))}
            data={["Pending","Submitted","Reviewed","Completed"]} styles={inp(dark)} />
        </SimpleGrid>
        <Group mt="sm" gap="xl">
          <div>
            <Text fz="xs" fw={600} c={sub} mb={4}>Self Rating</Text>
            <StarRating value={apprForm.selfRating} onChange={v => setApprForm(f=>({...f, selfRating: v}))} />
          </div>
          <div>
            <Text fz="xs" fw={600} c={sub} mb={4}>Manager Rating</Text>
            <StarRating value={apprForm.managerRating} onChange={v => setApprForm(f=>({...f, managerRating: v}))} />
          </div>
        </Group>
        <Group justify="flex-end" mt="lg" gap="sm">
          <button onClick={() => setApprModal(null)} style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:sub, cursor:"pointer" }}>Cancel</button>
          <button onClick={saveAppr} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:600, cursor:"pointer" }}>
            {apprModal === "add" ? "Add Appraisal" : "Save Changes"}
          </button>
        </Group>
      </Modal>

      {/* ── Delete Goal Confirm ── */}
      <Modal opened={!!deleteGoal} onClose={() => setDeleteGoal(null)} title="Delete Goal" centered radius="xl" size="sm" styles={modalStyles}>
        <Text fz="sm" c={sub} mb="lg">Are you sure you want to delete the goal for <strong>{deleteGoal?.employee}</strong>? This cannot be undone.</Text>
        <Group justify="flex-end" gap="sm">
          <button onClick={() => setDeleteGoal(null)} style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:sub, cursor:"pointer" }}>Cancel</button>
          <button onClick={confirmDeleteGoal} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:"pointer" }}>Delete</button>
        </Group>
      </Modal>

      {/* ── Delete Appraisal Confirm ── */}
      <Modal opened={!!deleteAppr} onClose={() => setDeleteAppr(null)} title="Delete Appraisal" centered radius="xl" size="sm" styles={modalStyles}>
        <Text fz="sm" c={sub} mb="lg">Delete appraisal for <strong>{deleteAppr?.employee}</strong>?</Text>
        <Group justify="flex-end" gap="sm">
          <button onClick={() => setDeleteAppr(null)} style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:sub, cursor:"pointer" }}>Cancel</button>
          <button onClick={confirmDeleteAppr} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:"pointer" }}>Delete</button>
        </Group>
      </Modal>
    </>
  );
}
