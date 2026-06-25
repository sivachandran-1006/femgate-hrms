import { useState } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, Stack, Tabs, Box, Loader,
  Progress, ActionIcon, Menu, NumberInput, Select, Switch, Divider,
} from "@mantine/core";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconTarget, IconCircleCheck, IconClipboardList, IconStar, IconTrophy, IconTrendingUp,
  IconAlertTriangle, IconArrowUpRight, IconChartBar, IconClipboardCheck, IconReportAnalytics,
  IconAward, IconActivity, IconPlus, IconPencil, IconTrash, IconFileExport, IconDownload,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import { exportPerformance } from "../../api/performanceApi";
import {
  usePerformance, usePerfDashboard, usePerfAnalytics, useKpis, useReviews, usePips, useRecognitions,
  useCreateGoal, useGoalProgress, useCreateKpi, useUpdateKpi, useCreateReview,
  useCreateAppraisal, useAppraise, useCreatePip, useCreateRecognition,
} from "../../queries/usePerformance";

const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
const RATINGS = ["Outstanding", "Exceeds", "Meets", "NeedsImprovement", "Unsatisfactory"];
const GOAL_STATUS = { Draft: "gray", Active: "blue", "In Progress": "yellow", Completed: "green", Cancelled: "red" };

export default function PerformanceManagement({ darkMode }) {
  const { show: toast } = useToast();
  const doExport = async (fmt) => {
    try {
      const blob = await exportPerformance(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `performance.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };
  return (
    <>
      <AppPageHeader title="Performance Management" sub="Goals, KPIs, reviews, appraisals and recognition"
        action={
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("excel")}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("csv")}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("pdf")}>PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />
      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md" style={{ flexWrap: "wrap" }}>
          <Tabs.Tab value="dashboard"  leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="goals"      leftSection={<IconTarget size={15} />}>Goals &amp; KPIs</Tabs.Tab>
          <Tabs.Tab value="reviews"    leftSection={<IconClipboardCheck size={15} />}>Reviews</Tabs.Tab>
          <Tabs.Tab value="appraisals" leftSection={<IconReportAnalytics size={15} />}>Appraisals</Tabs.Tab>
          <Tabs.Tab value="pip"        leftSection={<IconActivity size={15} />}>PIP</Tabs.Tab>
          <Tabs.Tab value="recognition" leftSection={<IconAward size={15} />}>Recognition</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="goals"><GoalsTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="reviews"><ReviewsTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="appraisals"><AppraisalsTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="pip"><PipTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="recognition"><RecognitionTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data: dash } = usePerfDashboard();
  const { data: an } = usePerfAnalytics();
  const c = dash?.cards || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} mb="lg">
        <AppStatCard icon={<IconTarget size={20} />} label="Active Goals" value={c.activeGoals ?? 0} color="blue" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Completed" value={c.completedGoals ?? 0} color="green" />
        <AppStatCard icon={<IconClipboardList size={20} />} label="Pending Reviews" value={c.pendingReviews ?? 0} color="orange" />
        <AppStatCard icon={<IconClipboardCheck size={20} />} label="Done Reviews" value={c.completedReviews ?? 0} color="teal" />
        <AppStatCard icon={<IconStar size={20} />} label="Avg Rating" value={c.averageRating ?? 0} color="yellow" />
        <AppStatCard icon={<IconTrophy size={20} />} label="Top Performers" value={c.topPerformers ?? 0} color="grape" />
        <AppStatCard icon={<IconAlertTriangle size={20} />} label="Needs Improve" value={c.needsImprovement ?? 0} color="red" />
        <AppStatCard icon={<IconArrowUpRight size={20} />} label="Promotions" value={c.promotionRecommendations ?? 0} color="indigo" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Performance Distribution">
          {an?.performanceDistribution?.length ? (
            <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={an.performanceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{an.performanceDistribution.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          ) : <AppEmptyState message="No performance records available." py={60} />}
        </AppSection>
        <AppSection title="Department Performance">
          {an?.departmentPerformance?.length ? (
            <ResponsiveContainer width="100%" height={280}><BarChart data={an.departmentPerformance}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis domain={[0, 5]} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="avgRating" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Avg Rating" /></BarChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>
      <AppSection title="Goal Completion Trend">
        {an?.goalCompletionTrend?.length ? (
          <ResponsiveContainer width="100%" height={240}><LineChart data={an.goalCompletionTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Completed Goals" /></LineChart></ResponsiveContainer>
        ) : <AppEmptyState message="No data" py={50} />}
      </AppSection>
    </>
  );
}

function GoalsTab({ toast }) {
  const { data } = usePerformance();
  const { data: kpis = [] } = useKpis();
  const { data: employees = [] } = useFetchAllEmployees();
  const createGoal = useCreateGoal();
  const goalProgress = useGoalProgress();
  const createKpi = useCreateKpi();
  const updateKpi = useUpdateKpi();
  const goals = data?.goals || [];

  const [goalOpen, setGoalOpen] = useState(false);
  const [gForm, setGForm] = useState({ employee: "", goal: "", goalType: "Individual", priority: "Medium", weightage: 0, targetDate: "" });
  const [kpiOpen, setKpiOpen] = useState(false);
  const [kForm, setKForm] = useState({ employee: "", name: "", targetValue: 100, actualValue: 0, weightage: 0 });

  const saveGoal = async () => {
    if (!gForm.employee || !gForm.goal) { toast("Employee and goal are required", "error"); return; }
    try { await createGoal.mutateAsync(gForm); toast("Goal created", "success"); setGoalOpen(false); setGForm({ employee: "", goal: "", goalType: "Individual", priority: "Medium", weightage: 0, targetDate: "" }); }
    catch (e) { toast(e?.response?.data?.message || "Failed", "error"); }
  };
  const saveKpi = async () => {
    if (!kForm.employee || !kForm.name) { toast("Employee and KPI name are required", "error"); return; }
    try { await createKpi.mutateAsync(kForm); toast("KPI added", "success"); setKpiOpen(false); setKForm({ employee: "", name: "", targetValue: 100, actualValue: 0, weightage: 0 }); }
    catch { toast("Failed", "error"); }
  };
  const bumpProgress = async (g, delta) => { try { await goalProgress.mutateAsync({ id: g.id, progress: Math.min(100, Math.max(0, (g.progress || 0) + delta)) }); } catch { toast("Failed", "error"); } };
  const empData = employees.map((e) => ({ value: e.name, label: e.name }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection title="Goals" sub={`${goals.length}`} action={<AppButton size="xs" leftSection={<IconPlus size={14} />} onClick={() => setGoalOpen(true)}>Add Goal</AppButton>}>
          <Stack gap="sm">
            {goals.length === 0 ? <AppEmptyState message="No goals" py={40} />
              : goals.map((g) => (
                <Box key={g.id} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 10, padding: 12 }}>
                  <Group justify="space-between" mb={6}>
                    <div><Text size="sm" fw={600}>{g.goal}</Text><Text size="xs" c="dimmed">{g.employee} · {g.goalType} · {g.priority}{g.weightage ? ` · ${g.weightage}%` : ""}</Text></div>
                    <Badge variant="light" color={GOAL_STATUS[g.status] || "gray"} radius="sm">{g.status}</Badge>
                  </Group>
                  <Group gap="sm" wrap="nowrap">
                    <Progress value={g.progress || 0} style={{ flex: 1 }} color={(g.progress || 0) >= 100 ? "green" : "blue"} />
                    <Text size="xs" w={36} ta="right">{g.progress || 0}%</Text>
                    <ActionIcon size="sm" variant="light" onClick={() => bumpProgress(g, 10)} title="+10%"><IconPlus size={12} /></ActionIcon>
                  </Group>
                </Box>
              ))}
          </Stack>
        </AppSection>

        <AppSection title="KPIs" sub={`${kpis.length}`} action={<AppButton size="xs" leftSection={<IconPlus size={14} />} onClick={() => setKpiOpen(true)}>Add KPI</AppButton>}>
          <Stack gap="sm">
            {kpis.length === 0 ? <AppEmptyState message="No KPIs" py={40} />
              : kpis.map((k) => (
                <Box key={k.id} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 10, padding: 12 }}>
                  <Group justify="space-between" mb={6}>
                    <div><Text size="sm" fw={600}>{k.name}</Text><Text size="xs" c="dimmed">{k.employee} · {k.actualValue}/{k.targetValue}{k.weightage ? ` · ${k.weightage}%` : ""}</Text></div>
                    <Badge variant="light" color={k.achievement >= 100 ? "green" : k.achievement >= 60 ? "blue" : "orange"} radius="sm">{k.achievement}%</Badge>
                  </Group>
                  <Progress value={Math.min(100, k.achievement)} color={k.achievement >= 100 ? "green" : "blue"} />
                </Box>
              ))}
          </Stack>
        </AppSection>
      </SimpleGrid>

      <AppModal opened={goalOpen} onClose={() => setGoalOpen(false)} title="Add Goal" icon={<IconTarget size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Employee *" searchable data={empData} value={gForm.employee} onChange={(v) => setGForm({ ...gForm, employee: v })} />
            <AppInput type="select" label="Goal Type" data={["Individual", "Team", "Department", "Organization"]} value={gForm.goalType} onChange={(v) => setGForm({ ...gForm, goalType: v })} />
          </SimpleGrid>
          <AppInput label="Goal *" value={gForm.goal} onChange={(e) => setGForm({ ...gForm, goal: e.target.value })} />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput type="select" label="Priority" data={["Low", "Medium", "High"]} value={gForm.priority} onChange={(v) => setGForm({ ...gForm, priority: v })} />
            <NumberInput label="Weightage %" min={0} max={100} value={gForm.weightage} onChange={(v) => setGForm({ ...gForm, weightage: v })} />
            <AppInput type="date" label="Target Date" value={gForm.targetDate} onChange={(e) => setGForm({ ...gForm, targetDate: e.target.value })} />
          </SimpleGrid>
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setGoalOpen(false)}>Cancel</AppButton><AppButton loading={createGoal.isPending} onClick={saveGoal}>Save</AppButton></Group>
        </Stack>
      </AppModal>

      <AppModal opened={kpiOpen} onClose={() => setKpiOpen(false)} title="Add KPI" icon={<IconTrendingUp size={16} color="#10b981" />} iconColor="#10b981">
        <Stack gap="md">
          <AppInput type="select" label="Employee *" searchable data={empData} value={kForm.employee} onChange={(v) => setKForm({ ...kForm, employee: v })} />
          <AppInput label="KPI Name *" value={kForm.name} onChange={(e) => setKForm({ ...kForm, name: e.target.value })} />
          <SimpleGrid cols={3}>
            <NumberInput label="Target" value={kForm.targetValue} onChange={(v) => setKForm({ ...kForm, targetValue: v })} />
            <NumberInput label="Actual" value={kForm.actualValue} onChange={(v) => setKForm({ ...kForm, actualValue: v })} />
            <NumberInput label="Weightage %" value={kForm.weightage} onChange={(v) => setKForm({ ...kForm, weightage: v })} />
          </SimpleGrid>
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setKpiOpen(false)}>Cancel</AppButton><AppButton color="teal" loading={createKpi.isPending} onClick={saveKpi}>Save</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}

function ReviewsTab({ toast }) {
  const { data: reviews = [] } = useReviews();
  const { data: employees = [] } = useFetchAllEmployees();
  const createReview = useCreateReview();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", cycle: "Annual", reviewType: "ManagerReview", rating: "Meets", feedback: "", promotionRecommended: false, trainingRecommended: false });

  const save = async () => {
    if (!form.employee) { toast("Employee is required", "error"); return; }
    try { await createReview.mutateAsync(form); toast("Review submitted", "success"); setOpen(false); setForm({ employee: "", cycle: "Annual", reviewType: "ManagerReview", rating: "Meets", feedback: "", promotionRecommended: false, trainingRecommended: false }); }
    catch { toast("Failed", "error"); }
  };
  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>New Review</AppButton></Group>
      <AppSection noPadding title="Performance Reviews" sub={`${reviews.length}`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Cycle", "Type", "Rating", "Promotion", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {reviews.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No performance records available." /></Table.Td></Table.Tr>
                : reviews.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.employee}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{r.cycle}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{r.reviewType}</Text></Table.Td>
                    <Table.Td>{r.rating ? <Badge variant="light" color="yellow" radius="sm">{r.rating}</Badge> : "—"}</Table.Td>
                    <Table.Td>{r.promotionRecommended ? <Badge variant="light" color="green" radius="sm">Recommended</Badge> : <Text size="sm" c="dimmed">—</Text>}</Table.Td>
                    <Table.Td><Badge variant="light" color={r.status === "Approved" ? "green" : r.status === "Submitted" ? "blue" : "yellow"} radius="sm">{r.status}</Badge></Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <AppModal opened={open} onClose={() => setOpen(false)} title="New Performance Review" icon={<IconClipboardCheck size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Employee *" searchable data={employees.map((e) => ({ value: e.name, label: e.name }))} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} />
            <AppInput type="select" label="Cycle" data={["Monthly", "Quarterly", "HalfYearly", "Annual", "Custom"]} value={form.cycle} onChange={(v) => setForm({ ...form, cycle: v })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Review Type" data={["SelfReview", "ManagerReview", "PeerReview", "360Review", "HRReview"]} value={form.reviewType} onChange={(v) => setForm({ ...form, reviewType: v })} />
            <AppInput type="select" label="Rating *" data={RATINGS} value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </SimpleGrid>
          <AppInput type="textarea" label="Feedback" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
          <Group gap="xl">
            <Switch label="Recommend Promotion" checked={form.promotionRecommended} onChange={(e) => setForm({ ...form, promotionRecommended: e.currentTarget.checked })} />
            <Switch label="Recommend Training" checked={form.trainingRecommended} onChange={(e) => setForm({ ...form, trainingRecommended: e.currentTarget.checked })} />
          </Group>
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton><AppButton loading={createReview.isPending} onClick={save}>Submit Review</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}

function AppraisalsTab({ toast }) {
  const { data } = usePerformance();
  const { data: employees = [] } = useFetchAllEmployees();
  const createAppraisal = useCreateAppraisal();
  const appraise = useAppraise();
  const appraisals = data?.appraisals || [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", period: "", currentSalary: "", recommendedSalary: "", promotionRecommended: false });

  const save = async () => {
    if (!form.employee || !form.period) { toast("Employee and period required", "error"); return; }
    try {
      const created = await createAppraisal.mutateAsync({ employee: form.employee, period: form.period });
      if (form.currentSalary && form.recommendedSalary) await appraise.mutateAsync({ id: created.id, currentSalary: form.currentSalary, recommendedSalary: form.recommendedSalary, promotionRecommended: form.promotionRecommended });
      toast("Appraisal created", "success"); setOpen(false); setForm({ employee: "", period: "", currentSalary: "", recommendedSalary: "", promotionRecommended: false });
    } catch { toast("Failed", "error"); }
  };
  const release = async (a) => { try { await appraise.mutateAsync({ id: a.id, finalApproval: "Approved" }); toast("Appraisal released", "success"); } catch { toast("Failed", "error"); } };

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>New Appraisal</AppButton></Group>
      <AppSection noPadding title="Appraisals" sub={`${appraisals.length}`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Period", "Current", "Recommended", "Increment", "Promotion", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {appraisals.length === 0 ? <Table.Tr><Table.Td colSpan={8}><AppEmptyState message="No appraisals" /></Table.Td></Table.Tr>
                : appraisals.map((a) => (
                  <Table.Tr key={a.id}>
                    <Table.Td><Text size="sm" fw={600}>{a.employee}</Text></Table.Td>
                    <Table.Td>{a.period}</Table.Td>
                    <Table.Td>{a.currentSalary ? `₹${a.currentSalary.toLocaleString("en-IN")}` : "—"}</Table.Td>
                    <Table.Td>{a.recommendedSalary ? `₹${a.recommendedSalary.toLocaleString("en-IN")}` : "—"}</Table.Td>
                    <Table.Td>{a.incrementPercent != null ? <Badge variant="light" color="teal" radius="sm">{a.incrementPercent}%</Badge> : "—"}</Table.Td>
                    <Table.Td>{a.promotionRecommended ? <Badge variant="light" color="green" radius="sm">Yes</Badge> : <Text size="sm" c="dimmed">No</Text>}</Table.Td>
                    <Table.Td><Badge variant="light" color={a.status === "Released" ? "green" : "blue"} radius="sm">{a.status}</Badge></Table.Td>
                    <Table.Td>{a.status !== "Released" ? <AppButton size="xs" variant="light" color="green" onClick={() => release(a)}>Release</AppButton> : <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <AppModal opened={open} onClose={() => setOpen(false)} title="New Appraisal" icon={<IconReportAnalytics size={16} color="#6366f1" />} iconColor="#6366f1" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Employee *" searchable data={employees.map((e) => ({ value: e.name, label: e.name }))} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} />
            <AppInput label="Period *" placeholder="e.g. FY 2025-26" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput label="Current Salary (₹)" value={form.currentSalary} onChange={(v) => setForm({ ...form, currentSalary: v })} />
            <NumberInput label="Recommended Salary (₹)" value={form.recommendedSalary} onChange={(v) => setForm({ ...form, recommendedSalary: v })} />
          </SimpleGrid>
          <Switch label="Recommend Promotion" checked={form.promotionRecommended} onChange={(e) => setForm({ ...form, promotionRecommended: e.currentTarget.checked })} />
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton><AppButton color="indigo" loading={createAppraisal.isPending || appraise.isPending} onClick={save}>Save</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}

function PipTab({ toast }) {
  const { data: pips = [] } = usePips();
  const { data: employees = [] } = useFetchAllEmployees();
  const createPip = useCreatePip();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", reason: "", improvementGoals: "", expectedOutcome: "", managerComments: "", reviewDate: "" });
  const save = async () => {
    if (!form.employee) { toast("Employee is required", "error"); return; }
    try { await createPip.mutateAsync(form); toast("PIP created", "success"); setOpen(false); setForm({ employee: "", reason: "", improvementGoals: "", expectedOutcome: "", managerComments: "", reviewDate: "" }); }
    catch { toast("Failed", "error"); }
  };
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>New PIP</AppButton></Group>
      <AppSection noPadding title="Performance Improvement Plans" sub={`${pips.length}`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Reason", "Review Date", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {pips.length === 0 ? <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No improvement plans" /></Table.Td></Table.Tr>
                : pips.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td><Text size="sm" fw={600}>{p.employee}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{p.reason || "—"}</Text></Table.Td>
                    <Table.Td>{fmt(p.reviewDate)}</Table.Td>
                    <Table.Td><Badge variant="light" color={p.status === "Completed" ? "green" : p.status === "Closed" ? "gray" : "orange"} radius="sm">{p.status}</Badge></Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <AppModal opened={open} onClose={() => setOpen(false)} title="New PIP" icon={<IconActivity size={16} color="#f59e0b" />} iconColor="#f59e0b" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Employee *" searchable data={employees.map((e) => ({ value: e.name, label: e.name }))} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} />
            <AppInput type="date" label="Review Date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
          </SimpleGrid>
          <AppInput type="textarea" label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <AppInput type="textarea" label="Improvement Goals" value={form.improvementGoals} onChange={(e) => setForm({ ...form, improvementGoals: e.target.value })} />
          <AppInput type="textarea" label="Expected Outcome" value={form.expectedOutcome} onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })} />
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton><AppButton color="orange" loading={createPip.isPending} onClick={save}>Save</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}

function RecognitionTab({ toast }) {
  const { data: recognitions = [] } = useRecognitions();
  const { data: employees = [] } = useFetchAllEmployees();
  const createRec = useCreateRecognition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", type: "Spot Award", title: "", description: "", period: "" });
  const save = async () => {
    if (!form.employee) { toast("Employee is required", "error"); return; }
    try { await createRec.mutateAsync(form); toast("Recognition added", "success"); setOpen(false); setForm({ employee: "", type: "Spot Award", title: "", description: "", period: "" }); }
    catch { toast("Failed", "error"); }
  };
  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>Add Recognition</AppButton></Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {recognitions.length === 0 ? <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState message="No recognitions yet" py={60} /></Box>
          : recognitions.map((r) => (
            <Box key={r.id} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 12, padding: 16 }}>
              <Group gap="sm" mb={6}><IconAward size={22} color="#f59e0b" /><Badge variant="light" color="yellow" radius="sm">{r.type}</Badge></Group>
              <Text fw={700}>{r.employee}</Text>
              {r.title && <Text size="sm">{r.title}</Text>}
              {r.description && <Text size="xs" c="dimmed" mt={4}>{r.description}</Text>}
              {r.period && <Text size="xs" c="dimmed" mt={4}>{r.period}</Text>}
            </Box>
          ))}
      </SimpleGrid>
      <AppModal opened={open} onClose={() => setOpen(false)} title="Add Recognition" icon={<IconAward size={16} color="#f59e0b" />} iconColor="#f59e0b">
        <Stack gap="md">
          <AppInput type="select" label="Employee *" searchable data={employees.map((e) => ({ value: e.name, label: e.name }))} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} />
          <AppInput type="select" label="Type" data={["Employee Of The Month", "Spot Award", "Achievement Award", "Performance Award"]} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <AppInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <AppInput type="textarea" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <AppInput label="Period" placeholder="e.g. June 2026" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton><AppButton color="yellow" loading={createRec.isPending} onClick={save}>Save</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}
