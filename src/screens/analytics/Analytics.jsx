import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IconTrendingUp as TrendingUp,
  IconTrendingDown as TrendingDown,
  IconUsers as Users,
  IconWallet as Wallet,
  IconCalendar as Calendar,
  IconAward as Award,
  IconTarget as Target,
  IconUserMinus as UserMinus,
  IconUserPlus as UserPlus,
  IconChartBar as BarChart2,
  IconStar as Star,
  IconClock as Clock,
} from "@tabler/icons-react";
import {
  Box, Stack, Group, Text, Paper, Badge, Tabs, SimpleGrid,
  Progress, Table, ThemeIcon, Avatar, Divider, ScrollArea,
} from "@mantine/core";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { useCandidates, useExits } from "../../queries/useHr";
import { topSlices } from "../dashboard/components/DashboardKit";
import { AppLoader }     from "../../components/ui/AppLoader";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

// ── Palette ───────────────────────────────────────────────────────────────────
const PALETTE = ["#6366f1","#8b5cf6","#22c55e","#f59e0b","#3b82f6","#f97316","#ef4444"];

// ── Mock fallback data (main_v1 UI-only demo branch) ──────────────────────────
const MOCK_EMPLOYEES = [
  { name:"Aarav Sharma",      department:"Engineering", salary:95000, gender:"Male",   age:29, tenure:2.4, score:88, status:"Present", joiningDate:"2023-04-12" },
  { name:"Diya Patel",        department:"Engineering", salary:102000,gender:"Female", age:33, tenure:3.8, score:91, status:"Present", joiningDate:"2021-11-02" },
  { name:"Vihaan Reddy",      department:"Engineering", salary:87000, gender:"Male",   age:26, tenure:1.2, score:76, status:"Leave",   joiningDate:"2024-06-19" },
  { name:"Ananya Iyer",       department:"Engineering", salary:110000,gender:"Female", age:37, tenure:5.1, score:94, status:"Present", joiningDate:"2020-02-27" },
  { name:"Kabir Nair",        department:"Engineering", salary:79000, gender:"Male",   age:24, tenure:0.7, score:71, status:"Present", joiningDate:"2025-09-08" },
  { name:"Saanvi Menon",      department:"Sales",       salary:68000, gender:"Female", age:31, tenure:2.9, score:82, status:"Present", joiningDate:"2022-12-15" },
  { name:"Arjun Verma",       department:"Sales",       salary:72000, gender:"Male",   age:35, tenure:4.3, score:79, status:"Leave",   joiningDate:"2021-03-21" },
  { name:"Ishita Kapoor",     department:"Sales",       salary:65000, gender:"Female", age:27, tenure:1.6, score:85, status:"Present", joiningDate:"2024-01-30" },
  { name:"Reyansh Gupta",     department:"Sales",       salary:70000, gender:"Male",   age:40, tenure:6.2, score:80, status:"Present", joiningDate:"2019-05-04" },
  { name:"Myra Joshi",        department:"Marketing",   salary:63000, gender:"Female", age:25, tenure:1.1, score:77, status:"Present", joiningDate:"2024-08-11" },
  { name:"Aditya Rao",        department:"Marketing",   salary:74000, gender:"Male",   age:32, tenure:3.4, score:83, status:"Present", joiningDate:"2022-05-16" },
  { name:"Kiara Desai",       department:"Marketing",   salary:69000, gender:"Female", age:29, tenure:2.0, score:90, status:"Leave",   joiningDate:"2023-07-22" },
  { name:"Vivaan Chawla",     department:"Finance",     salary:98000, gender:"Male",   age:38, tenure:5.6, score:86, status:"Present", joiningDate:"2020-09-14" },
  { name:"Anika Bhatt",       department:"Finance",     salary:93000, gender:"Female", age:34, tenure:4.0, score:88, status:"Present", joiningDate:"2021-10-05" },
  { name:"Rohan Malhotra",    department:"Finance",     salary:85000, gender:"Male",   age:28, tenure:1.8, score:74, status:"Present", joiningDate:"2023-11-27" },
  { name:"Navya Sinha",       department:"HR",          salary:71000, gender:"Female", age:41, tenure:7.3, score:92, status:"Present", joiningDate:"2018-06-03" },
  { name:"Aryan Kulkarni",    department:"HR",          salary:66000, gender:"Male",   age:26, tenure:1.4, score:78, status:"Leave",   joiningDate:"2024-03-18" },
  { name:"Pari Agarwal",      department:"HR",          salary:68000, gender:"Female", age:30, tenure:2.6, score:81, status:"Present", joiningDate:"2022-09-09" },
  { name:"Dhruv Singh",       department:"Operations",  salary:76000, gender:"Male",   age:36, tenure:4.7, score:84, status:"Present", joiningDate:"2020-12-01" },
  { name:"Riya Chatterjee",   department:"Operations",  salary:73000, gender:"Female", age:23, tenure:0.5, score:70, status:"Present", joiningDate:"2025-11-10" },
  { name:"Yash Thakur",       department:"Operations",  salary:80000, gender:"Male",   age:33, tenure:3.1, score:87, status:"Leave",   joiningDate:"2022-02-19" },
  { name:"Anaya Bose",        department:"Operations",  salary:77000, gender:"Female", age:39, tenure:5.9, score:89, status:"Present", joiningDate:"2019-08-25" },
  { name:"Vedant Mehta",      department:"Support",     salary:58000, gender:"Male",   age:22, tenure:0.3, score:68, status:"Present", joiningDate:"2026-01-14" },
  { name:"Ira Saxena",        department:"Support",     salary:60000, gender:"Female", age:27, tenure:1.9, score:75, status:"Present", joiningDate:"2023-06-30" },
  { name:"Shaurya Pillai",    department:"Support",     salary:61000, gender:"Male",   age:31, tenure:2.7, score:73, status:"Leave",   joiningDate:"2022-08-06" },
  { name:"Tara Krishnan",     department:"Design",      salary:82000, gender:"Female", age:28, tenure:1.5, score:90, status:"Present", joiningDate:"2023-09-17" },
  { name:"Ayaan Bansal",      department:"Design",      salary:84000, gender:"Male",   age:35, tenure:4.5, score:86, status:"Present", joiningDate:"2020-10-23" },
];

const MOCK_LEAVES = [
  { employee:"Aarav Sharma",   department:"Engineering", status:"Approved", days:2, type:"Casual",  startDate:"2026-05-04" },
  { employee:"Diya Patel",     department:"Engineering", status:"Approved", days:3, type:"Sick",    startDate:"2026-04-11" },
  { employee:"Vihaan Reddy",   department:"Engineering", status:"Pending",  days:1, type:"Casual",  startDate:"2026-07-02" },
  { employee:"Saanvi Menon",   department:"Sales",       status:"Approved", days:4, type:"Annual",  startDate:"2026-03-20" },
  { employee:"Arjun Verma",    department:"Sales",       status:"Approved", days:5, type:"Annual",  startDate:"2026-06-09" },
  { employee:"Myra Joshi",     department:"Marketing",   status:"Rejected", days:2, type:"Casual",  startDate:"2026-02-14" },
  { employee:"Kiara Desai",    department:"Marketing",   status:"Approved", days:3, type:"Sick",    startDate:"2026-05-28" },
  { employee:"Vivaan Chawla",  department:"Finance",     status:"Approved", days:6, type:"Annual",  startDate:"2026-01-22" },
  { employee:"Navya Sinha",    department:"HR",          status:"Approved", days:2, type:"Casual",  startDate:"2026-06-30" },
  { employee:"Dhruv Singh",    department:"Operations",  status:"Approved", days:3, type:"Sick",    startDate:"2026-04-05" },
];

// ── Shared chart tooltip ──────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper withBorder p="xs" radius="md" shadow="sm">
      <Text size="xs" fw={600} mb={4}>{label}</Text>
      {payload.map((p) => (
        <Text key={p.dataKey} size="xs" c={p.color}>
          {p.name}: <strong>{prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}{suffix}</strong>
        </Text>
      ))}
    </Paper>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <Paper withBorder radius="xl" p="md">
    <Group gap="md" wrap="nowrap">
      <ThemeIcon color={color} variant="light" size={46} radius="xl"><Icon size={22} /></ThemeIcon>
      <Box flex={1} miw={0}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Text size="xl" fw={800} lh={1} mt={2}>{value}</Text>
        {sub && <Text size="xs" c="dimmed" mt={1}>{sub}</Text>}
      </Box>
      {trend !== undefined && (
        <Group gap={3} wrap="nowrap">
          {trend >= 0 ? <TrendingUp size={13} color="var(--mantine-color-green-6)" /> : <TrendingDown size={13} color="var(--mantine-color-red-6)" />}
          <Text size="xs" fw={600} c={trend >= 0 ? "green" : "red"}>{Math.abs(trend)}%</Text>
        </Group>
      )}
    </Group>
  </Paper>
);

// ── Section title ─────────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, sub, color = "blue" }) => (
  <Group gap="sm" mb="sm">
    <ThemeIcon color={color} variant="light" size={34} radius="lg"><Icon size={16} /></ThemeIcon>
    <Box>
      <Text size="sm" fw={700}>{title}</Text>
      {sub && <Text size="xs" c="dimmed">{sub}</Text>}
    </Box>
  </Group>
);

// ── Progress bar row ──────────────────────────────────────────────────────────
const ProgressRow = ({ label, value, total, pct, color = "blue" }) => (
  <Box>
    <Group justify="space-between" mb={3}>
      <Text size="xs" fw={500}>{label}</Text>
      <Text size="xs" c="dimmed">{value !== undefined ? `${value} (${pct}%)` : `${pct}%`}</Text>
    </Group>
    <Progress value={pct} color={color} size="sm" radius="xl" />
  </Box>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const Analytics = ({ darkMode: dark = false }) => {
  const [tab, setTab] = useState("overview");

  const { data: rawEmployeesQ, isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: rawLeavesQ,    isLoading: loadLeave } = useFetchAllLeaves();
  const rawEmployees = rawEmployeesQ?.length ? rawEmployeesQ : MOCK_EMPLOYEES;
  const rawLeaves    = rawLeavesQ?.length    ? rawLeavesQ    : MOCK_LEAVES;
  const { data: candidates   = [] } = useCandidates();
  const { data: exits        = [] } = useExits();

  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const headcount = rawEmployees.length || 1;
  const ATTRITION = MONTH_LABELS.map((month, idx) => {
    const resigned = exits.filter((e) => {
      const d = new Date(e.lastWorkingDay);
      return d.getMonth() === idx && d.getFullYear() === new Date().getFullYear();
    }).length;
    return { month, resigned, rate: Math.round((resigned / headcount) * 1000) / 10 };
  });

  const stageCounts = {
    Applied:     candidates.length,
    Screened:    candidates.filter((c) => ["Screening","Interview","Selected"].includes(c.status)).length,
    Interviewed: candidates.filter((c) => ["Interview","Selected"].includes(c.status)).length,
    Offered:     candidates.filter((c) => c.status === "Selected").length,
    Hired:       candidates.filter((c) => c.status === "Selected").length,
  };
  const HIRING_FUNNEL = [
    { stage:"Applied",     value: stageCounts.Applied,     fill: "#a5b4fc" },
    { stage:"Screened",    value: stageCounts.Screened,    fill: "#6366f1" },
    { stage:"Interviewed", value: stageCounts.Interviewed, fill: "#8b5cf6" },
    { stage:"Offered",     value: stageCounts.Offered,     fill: "#f59e0b" },
    { stage:"Hired",       value: stageCounts.Hired,       fill: "#22c55e" },
  ];

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  const EMPLOYEES = rawEmployees.map((e) => ({
    name:    e.name,
    dept:    e.department,
    salary:  Number(e.salary) || 0,
    gender:  e.gender  || "Male",
    age:     Number(e.age)    || 28,
    tenure:  Number(e.tenure) || 1.0,
    score:   Number(e.score)  || 75,
    status:  e.status,
    joiningDate: e.joiningDate || "",
  }));

  const LEAVES = Array.isArray(rawLeaves) ? rawLeaves : (rawLeaves?.leaves ?? rawLeaves?.data ?? []);

  const total        = EMPLOYEES.length;
  const present      = EMPLOYEES.filter((e) => e.status === "Present").length;
  const onLeave      = EMPLOYEES.filter((e) => e.status === "Leave").length;
  const attendPct    = total > 0 ? Math.round((present / total) * 100) : 0;
  const totalPayroll = EMPLOYEES.reduce((s, e) => s + e.salary, 0);
  const avgAttrition = (ATTRITION.reduce((s, m) => s + m.rate, 0) / ATTRITION.length).toFixed(1);
  const ytdHires     = ATTRITION.reduce((s, m) => s + m.resigned, 0);

  const deptMap = {};
  EMPLOYEES.forEach((e) => { deptMap[e.dept] = (deptMap[e.dept] || 0) + 1; });
  const DEPT_DATA = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const SALARY_BY_DEPT = Object.keys(deptMap).map((dept) => {
    const emps = EMPLOYEES.filter((e) => e.dept === dept);
    return {
      dept,
      avg: Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length),
      max: Math.max(...emps.map((e) => e.salary)),
      min: Math.min(...emps.map((e) => e.salary)),
    };
  });

  const GENDER_DATA = [
    { name:"Male",   value: EMPLOYEES.filter((e) => e.gender === "Male").length,   fill: "#6366f1" },
    { name:"Female", value: EMPLOYEES.filter((e) => e.gender === "Female").length, fill: "#8b5cf6" },
  ];

  const ageBuckets = { "20–25":0, "26–30":0, "31–35":0, "36–40":0, "40+":0 };
  EMPLOYEES.forEach((e) => {
    if      (e.age <= 25) ageBuckets["20–25"]++;
    else if (e.age <= 30) ageBuckets["26–30"]++;
    else if (e.age <= 35) ageBuckets["31–35"]++;
    else if (e.age <= 40) ageBuckets["36–40"]++;
    else                  ageBuckets["40+"]++;
  });
  const AGE_DATA = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

  const tenureBuckets = { "<1yr":0, "1–2yr":0, "2–3yr":0, "3+yr":0 };
  EMPLOYEES.forEach((e) => {
    if      (e.tenure < 1) tenureBuckets["<1yr"]++;
    else if (e.tenure < 2) tenureBuckets["1–2yr"]++;
    else if (e.tenure < 3) tenureBuckets["2–3yr"]++;
    else                   tenureBuckets["3+yr"]++;
  });
  const TENURE_DATA = Object.entries(tenureBuckets).map(([name, value]) => ({ name, value }));

  const LEAVE_BY_DEPT = Object.keys(deptMap).map((dept) => {
    const deptLeaves = LEAVES.filter((l) => {
      const emp = EMPLOYEES.find((e) => e.name === l.employee);
      return emp && emp.dept === dept && l.status === "Approved";
    });
    const deptSize = deptMap[dept] || 1;
    const totalAlloc = deptSize * 18;
    const used = deptLeaves.reduce((s, l) => s + (Number(l.days) || 1), 0);
    const pct  = totalAlloc > 0 ? Math.round((used / totalAlloc) * 100) : 0;
    return { dept, total: totalAlloc, used, pct };
  });

  const TOP_PERFORMERS = EMPLOYEES
    .slice().sort((a, b) => b.score - a.score).slice(0, 5)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const axisTick = { fontSize: 11 };

  return (
    <Stack gap="lg">
      <AppPageHeader title="HR Analytics" sub="Comprehensive workforce intelligence" />

      {/* KPI Row */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <KpiCard icon={Users}      label="Total Employees"  value={total}               sub={`${Object.keys(deptMap).length} departments`}                     color="blue"   trend={5}  />
        <KpiCard icon={TrendingUp} label="Attendance Rate"  value={`${attendPct}%`}     sub={`${present} present today`}                                       color="green"  trend={2}  />
        <KpiCard icon={UserMinus}  label="Avg Attrition"    value={`${avgAttrition}%`}  sub="Monthly avg 2026"                                                 color="red"    trend={-8} />
        <KpiCard icon={Wallet}     label="Total Payroll"    value={`₹${(totalPayroll/100000).toFixed(1)}L`} sub={`Avg ₹${Math.round(totalPayroll/total).toLocaleString("en-IN")}`} color="violet" trend={4} />
      </SimpleGrid>

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          {[
            { value:"overview",     label:"Overview"    },
            { value:"attrition",    label:"Attrition"   },
            { value:"workforce",    label:"Workforce"   },
            { value:"compensation", label:"Salary"      },
            { value:"leave",        label:"Leave"       },
            { value:"hiring",       label:"Hiring"      },
            { value:"performers",   label:"Performers"  },
          ].map((t) => <Tabs.Tab key={t.value} value={t.value}>{t.label}</Tabs.Tab>)}
        </Tabs.List>

        {/* ── OVERVIEW ── */}
        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* Attrition trend mini */}
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={TrendingDown} title="Attrition Rate Trend" sub="Monthly % — 2026" color="red" />
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={ATTRITION}>
                    <defs>
                      <linearGradient id="attrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="month" tick={axisTick} />
                    <YAxis tick={axisTick} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Area type="monotone" dataKey="rate" name="Attrition" stroke="#ef4444" fill="url(#attrGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>

              {/* Gender diversity */}
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Users} title="Gender Diversity" sub={`${total} employees`} color="violet" />
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={GENDER_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={3}>
                      {GENDER_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <Group gap="md" justify="center" mt="xs">
                  {GENDER_DATA.map((d) => (
                    <Group key={d.name} gap="xs">
                      <Box w={8} h={8} style={{ borderRadius: "50%", background: d.fill, flexShrink: 0 }} />
                      <Text size="xs" c="dimmed">{d.name} <Text span fw={700} c="dark">{d.value}</Text></Text>
                    </Group>
                  ))}
                </Group>
              </Paper>

              {/* Dept headcount */}
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={BarChart2} title="Dept Headcount" color="blue" />
                <Stack gap={6}>
                  {DEPT_DATA.map((d, i) => {
                    const pct = Math.round((d.value / total) * 100);
                    return <ProgressRow key={d.name} label={d.name} value={d.value} pct={pct} color={["blue","violet","green","orange","teal","cyan","red"][i % 7]} />;
                  })}
                </Stack>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* Hiring funnel mini */}
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={UserPlus} title="Hiring Funnel" sub="Current pipeline" color="green" />
                <Stack gap={6}>
                  {HIRING_FUNNEL.map((s) => {
                    const pct = HIRING_FUNNEL[0].value > 0 ? Math.round((s.value / HIRING_FUNNEL[0].value) * 100) : 0;
                    return (
                      <Group key={s.stage} gap="sm" wrap="nowrap">
                        <Text size="xs" c="dimmed" w={72} style={{ flexShrink: 0 }}>{s.stage}</Text>
                        <Progress flex={1} value={pct} color="green" size="sm" radius="xl" />
                        <Text size="xs" fw={700} w={24} ta="right">{s.value}</Text>
                      </Group>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Leave utilization */}
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Calendar} title="Leave Utilization" sub="By department" color="yellow" />
                <Stack gap="sm">
                  {LEAVE_BY_DEPT.map((d) => (
                    <ProgressRow key={d.dept} label={d.dept} pct={d.pct}
                      color={d.pct > 65 ? "red" : d.pct > 45 ? "yellow" : "green"} />
                  ))}
                </Stack>
              </Paper>

              {/* Top performers mini */}
              <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
                <Box px="md" pt="md" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group gap="sm">
                    <ThemeIcon color="yellow" variant="light" size={32} radius="lg"><Award size={15} /></ThemeIcon>
                    <Text size="sm" fw={700}>Top Performers</Text>
                  </Group>
                </Box>
                <Stack gap={0}>
                  {TOP_PERFORMERS.map((e, i, arr) => (
                    <Group key={e.name} gap="sm" px="md" py="xs"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                      <Text size="xs" fw={700} c={["yellow","gray","orange"][i] ?? "dimmed"} w={16}>#{e.rank}</Text>
                      <Avatar size={28} radius="xl" color={["blue","violet","green","orange","teal"][i % 5]}>{e.name[0]}</Avatar>
                      <Box flex={1} miw={0}>
                        <Text size="xs" fw={600} truncate>{e.name}</Text>
                        <Text size="xs" c="dimmed">{e.dept}</Text>
                      </Box>
                      <Text size="xs" fw={700} c="green">{e.score}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── ATTRITION ── */}
        <Tabs.Panel value="attrition" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              {[
                { label:"YTD Resignations", value: ytdHires,            icon: UserMinus,   color:"red"    },
                { label:"Avg Monthly Rate", value:`${avgAttrition}%`,   icon: TrendingDown,color:"orange" },
                { label:"Peak Month",       value:"Jul 2.4%",           icon: Calendar,    color:"orange" },
                { label:"Low Month",        value:"May 0.5%",           icon: Target,      color:"green"  },
              ].map((k) => (
                <Paper key={k.label} withBorder p="md" radius="lg">
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon color={k.color} variant="light" size={44} radius="lg"><k.icon size={20} /></ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed">{k.label}</Text>
                      <Text size="lg" fw={700} c={k.color} lh={1} mt={2}>{k.value}</Text>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={TrendingDown} title="Monthly Attrition Rate" sub="Percentage of workforce that left each month" color="red" />
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ATTRITION}>
                    <defs>
                      <linearGradient id="attrFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.22}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="month" tick={axisTick} />
                    <YAxis tick={axisTick} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Area type="monotone" dataKey="rate" name="Attrition %" stroke="#ef4444" fill="url(#attrFull)" strokeWidth={2.5} dot={{ fill:"#ef4444", r:4 }} activeDot={{ r:6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={UserMinus} title="Resignations per Month" color="orange" />
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ATTRITION} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="month" tick={axisTick} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="resigned" name="Resigned" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── WORKFORCE ── */}
        <Tabs.Panel value="workforce" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={BarChart2} title="Headcount by Department" sub={`${total} total employees`} color="blue" />
                <Group gap="xl" wrap="nowrap" align="center">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={topSlices(DEPT_DATA, "value", 6)} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={46} paddingAngle={3}>
                        {topSlices(DEPT_DATA, "value", 6).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack gap="xs" flex={1}>
                    {DEPT_DATA.map((d, i) => (
                      <Group key={d.name} justify="space-between">
                        <Group gap="xs">
                          <Box w={10} h={10} style={{ borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                          <Text size="sm" c="dimmed">{d.name}</Text>
                        </Group>
                        <Text size="sm" fw={700}>{d.value}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Group>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Users} title="Gender Diversity" sub="Workforce composition" color="violet" />
                <Group gap="xl" wrap="nowrap" align="center">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={GENDER_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={46} paddingAngle={4}>
                        {GENDER_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack flex={1} gap="md">
                    {GENDER_DATA.map((d) => {
                      const pct = Math.round((d.value / total) * 100);
                      return (
                        <Box key={d.name}>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm" c="dimmed">{d.name}</Text>
                            <Text size="sm" fw={700}>{d.value} ({pct}%)</Text>
                          </Group>
                          <Progress value={pct} color={d.name === "Male" ? "indigo" : "violet"} size="md" radius="xl" />
                        </Box>
                      );
                    })}
                  </Stack>
                </Group>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Users} title="Age Distribution" sub="Employees by age group" color="cyan" />
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={AGE_DATA} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="name" tick={axisTick} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Employees" radius={[4,4,0,0]}>
                      {AGE_DATA.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Clock} title="Tenure Distribution" sub="Years of service" color="green" />
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={TENURE_DATA} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="name" tick={axisTick} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Employees" radius={[4,4,0,0]}>
                      {TENURE_DATA.map((_, i) => <Cell key={i} fill={["#ef4444","#f59e0b","#22c55e","#6366f1"][i] ?? "#3b82f6"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── COMPENSATION ── */}
        <Tabs.Panel value="compensation" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Wallet} title="Salary Heatmap by Department" sub="Min / Avg / Max per department" color="violet" />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={SALARY_BY_DEPT} barGap={4} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="dept" tick={axisTick} />
                    <YAxis tick={axisTick} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip prefix="₹" />} />
                    <Bar dataKey="min" name="Min" fill="#a5b4fc" radius={[4,4,0,0]} />
                    <Bar dataKey="avg" name="Avg" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="max" name="Max" fill="#8b5cf6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <Group gap="md" mt="sm">
                  {[["Min","#a5b4fc"],["Avg","#6366f1"],["Max","#8b5cf6"]].map(([l, c]) => (
                    <Group key={l} gap="xs">
                      <Box w={10} h={10} style={{ borderRadius: 2, background: c }} />
                      <Text size="xs" c="dimmed">{l}</Text>
                    </Group>
                  ))}
                </Group>
              </Paper>

              <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
                <Box px="md" pt="md" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group gap="sm">
                    <ThemeIcon color="violet" variant="light" size={32} radius="lg"><Wallet size={15} /></ThemeIcon>
                    <Text fw={700} size="sm">Salary Summary</Text>
                  </Group>
                </Box>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      {["Dept","Min","Avg","Max"].map((h) => <Table.Th key={h}>{h}</Table.Th>)}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {SALARY_BY_DEPT.map((d) => (
                      <Table.Tr key={d.dept}>
                        <Table.Td><Text size="sm" fw={600}>{d.dept}</Text></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed">₹{(d.min/1000).toFixed(0)}k</Text></Table.Td>
                        <Table.Td><Text size="sm" fw={700} c="indigo">₹{(d.avg/1000).toFixed(0)}k</Text></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed">₹{(d.max/1000).toFixed(0)}k</Text></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
              <Box px="lg" py="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Text fw={700} size="sm">Employee Salary Breakdown</Text>
              </Box>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {["Employee","Department","Salary","% of Dept Avg","Band"].map((h) => <Table.Th key={h}>{h}</Table.Th>)}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[...EMPLOYEES].sort((a, b) => b.salary - a.salary).map((e) => {
                      const deptAvg = SALARY_BY_DEPT.find(d => d.dept === e.dept)?.avg || 1;
                      const pct = Math.round((e.salary / deptAvg) * 100);
                      const band = e.salary >= 80000 ? { label:"Senior", color:"violet" } :
                                   e.salary >= 65000 ? { label:"Mid",    color:"blue"   } :
                                                       { label:"Junior", color:"green"  };
                      return (
                        <Table.Tr key={e.name}>
                          <Table.Td><Text size="sm" fw={600}>{e.name}</Text></Table.Td>
                          <Table.Td><Text size="sm" c="dimmed">{e.dept}</Text></Table.Td>
                          <Table.Td><Text size="sm" fw={700}>₹{e.salary.toLocaleString("en-IN")}</Text></Table.Td>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Progress flex={1} maw={80} value={Math.min(pct,100)} color={pct>100?"green":pct<90?"yellow":"blue"} size="xs" radius="xl" />
                              <Text size="xs" c="dimmed">{pct}%</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td><Badge size="xs" color={band.color} variant="light">{band.label}</Badge></Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* ── LEAVE ── */}
        <Tabs.Panel value="leave" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Calendar} title="Leave Utilization by Department" sub="Used vs Total days" color="yellow" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={LEAVE_BY_DEPT} barGap={4} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="dept" tick={axisTick} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="total" name="Total"  fill="var(--mantine-color-default-border)" radius={[4,4,0,0]} />
                    <Bar dataKey="used"  name="Used"   fill="#f59e0b"                              radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Target} title="Leave % Utilization" sub="Used vs allocated %" color="red" />
                <Stack gap="md" mt="xs">
                  {LEAVE_BY_DEPT.map((d) => (
                    <Box key={d.dept}>
                      <Group justify="space-between" mb={5}>
                        <Text size="sm" fw={600}>{d.dept}</Text>
                        <Text size="sm" fw={700} c={d.pct > 65 ? "red" : d.pct > 45 ? "yellow" : "green"}>{d.pct}%</Text>
                      </Group>
                      <Progress value={d.pct} color={d.pct > 65 ? "red" : d.pct > 45 ? "yellow" : "green"} size="md" radius="xl" />
                      <Text size="xs" c="dimmed" mt={3}>{d.used} of {d.total} days used</Text>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
              <Box px="lg" py="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <SectionTitle icon={Calendar} title="Department Leave Summary Table" color="blue" />
              </Box>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    {["Department","Total Days","Used","Remaining","Utilization","Status"].map((h) => <Table.Th key={h}>{h}</Table.Th>)}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {LEAVE_BY_DEPT.map((d) => {
                    const statusColor = d.pct > 65 ? "red" : d.pct > 45 ? "yellow" : "green";
                    const statusLabel = d.pct > 65 ? "High" : d.pct > 45 ? "Medium" : "Low";
                    return (
                      <Table.Tr key={d.dept}>
                        <Table.Td><Text size="sm" fw={600}>{d.dept}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{d.total}</Text></Table.Td>
                        <Table.Td><Text size="sm" fw={700} c="yellow">{d.used}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="green">{d.total - d.used}</Text></Table.Td>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Progress flex={1} maw={80} value={d.pct} color={statusColor} size="xs" radius="xl" />
                            <Text size="xs" c="dimmed">{d.pct}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Badge size="xs" color={statusColor} variant="light">{statusLabel}</Badge></Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* ── HIRING ── */}
        <Tabs.Panel value="hiring" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={UserPlus} title="Hiring Pipeline Funnel" sub="Current open positions" color="green" />
                <Stack gap="sm" mt="xs">
                  {HIRING_FUNNEL.map((s, i) => {
                    const pct = HIRING_FUNNEL[0].value > 0 ? Math.round((s.value / HIRING_FUNNEL[0].value) * 100) : 0;
                    const dropPct = i > 0 ? Math.round(((HIRING_FUNNEL[i-1].value - s.value) / (HIRING_FUNNEL[i-1].value || 1)) * 100) : 0;
                    return (
                      <Box key={s.stage}>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" fw={600}>{s.stage}</Text>
                          <Group gap="md">
                            {i > 0 && <Text size="xs" c="red">−{dropPct}% drop</Text>}
                            <Text size="sm" fw={700} style={{ color: s.fill }}>{s.value}</Text>
                          </Group>
                        </Group>
                        <Progress value={pct} size="xl" radius="sm" style={{ background: "var(--mantine-color-default-border)" }}
                          styles={{ section: { background: s.fill } }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Target} title="Conversion Rates" sub="Stage-to-stage efficiency" color="blue" />
                <Stack gap="md">
                  {[
                    { label:"Applied → Screened",     from:"Applied",     to:"Screened",    color:"indigo" },
                    { label:"Screened → Interviewed",  from:"Screened",    to:"Interviewed", color:"violet" },
                    { label:"Interviewed → Offered",   from:"Interviewed", to:"Offered",     color:"yellow" },
                    { label:"Offered → Hired",         from:"Offered",     to:"Hired",       color:"green"  },
                  ].map((row) => {
                    const from = HIRING_FUNNEL.find(s => s.stage === row.from)?.value || 1;
                    const to   = HIRING_FUNNEL.find(s => s.stage === row.to)?.value   || 0;
                    const pct  = Math.round((to / from) * 100);
                    return (
                      <Box key={row.label}>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" c="dimmed">{row.label}</Text>
                          <Text size="sm" fw={700} c={row.color}>{pct}%</Text>
                        </Group>
                        <Progress value={pct} color={row.color} size="sm" radius="xl" />
                      </Box>
                    );
                  })}
                  <Paper withBorder p="sm" radius="lg" bg="green.0">
                    <Text size="sm" c="green" fw={600}>
                      Overall Hire Rate: {Math.round((HIRING_FUNNEL[4].value / (HIRING_FUNNEL[0].value || 1)) * 100)}%
                    </Text>
                    <Text size="xs" c="green" mt={2}>{HIRING_FUNNEL[4].value} hired from {HIRING_FUNNEL[0].value} applicants</Text>
                  </Paper>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
              <Box px="lg" py="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Text fw={700} size="sm">Pipeline Stage Breakdown</Text>
              </Box>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    {["Stage","Candidates","% of Total","Drop from Previous","Conversion"].map((h) => <Table.Th key={h}>{h}</Table.Th>)}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {HIRING_FUNNEL.map((s, i, arr) => {
                    const totalPct = arr[0].value > 0 ? Math.round((s.value / arr[0].value) * 100) : 0;
                    const drop     = i > 0 ? arr[i-1].value - s.value : 0;
                    const dropPct  = i > 0 ? Math.round((drop / (arr[i-1].value || 1)) * 100) : 0;
                    return (
                      <Table.Tr key={s.stage}>
                        <Table.Td>
                          <Group gap="sm">
                            <Box w={10} h={10} style={{ borderRadius: "50%", background: s.fill, flexShrink: 0 }} />
                            <Text size="sm" fw={600}>{s.stage}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="md" fw={700} style={{ color: s.fill }}>{s.value}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{totalPct}%</Text></Table.Td>
                        <Table.Td><Text size="sm" c={i > 0 ? "red" : "dimmed"}>{i > 0 ? `−${drop} (${dropPct}%)` : "—"}</Text></Table.Td>
                        <Table.Td>
                          <Progress value={totalPct} size="xs" radius="xl" maw={100} style={{ color: s.fill }} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* ── PERFORMERS ── */}
        <Tabs.Panel value="performers" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              {TOP_PERFORMERS.slice(0, 3).map((e, i) => {
                const medals  = ["🥇","🥈","🥉"];
                const colors  = ["yellow","gray","orange"];
                return (
                  <Paper key={e.name} withBorder p="lg" radius="lg" ta="center"
                    style={{ borderWidth: i === 0 ? 2 : 1, borderColor: i === 0 ? "var(--mantine-color-yellow-4)" : undefined }}>
                    <Text size="2xl" mb="sm">{medals[i]}</Text>
                    <Avatar size={52} radius="xl" color={["blue","violet","green"][i % 3]} mx="auto" mb="sm">{e.name[0]}</Avatar>
                    <Text fw={700}>{e.name}</Text>
                    <Text size="xs" c="dimmed" mb="sm">{e.dept}</Text>
                    <Badge color={colors[i]} variant="light" leftSection={<Star size={10} />}>{e.score} pts</Badge>
                  </Paper>
                );
              })}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
                <Box px="lg" py="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Text fw={700} size="sm">Full Performance Leaderboard</Text>
                  <Text size="xs" c="dimmed">Ranked by performance score</Text>
                </Box>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {["Rank","Employee","Dept","Score","Grade"].map((h) => <Table.Th key={h}>{h}</Table.Th>)}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[...EMPLOYEES].sort((a, b) => b.score - a.score).map((e, i) => {
                      const grade = e.score >= 90 ? { label:"A+", color:"green"  } :
                                    e.score >= 80 ? { label:"A",  color:"blue"   } :
                                    e.score >= 70 ? { label:"B",  color:"yellow" } :
                                                    { label:"C",  color:"red"    };
                      return (
                        <Table.Tr key={e.name}>
                          <Table.Td>
                            <Text size="sm" fw={700} c={i < 3 ? ["yellow","gray","orange"][i] : "dimmed"}>
                              {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Avatar size={28} radius="xl" color={["blue","violet","green","orange","teal"][i % 5]}>{e.name[0]}</Avatar>
                              <Text size="sm" fw={500}>{e.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td><Text size="xs" c="dimmed">{e.dept}</Text></Table.Td>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Progress flex={1} maw={60} value={e.score} color={grade.color} size="xs" radius="xl" />
                              <Text size="sm" fw={700} c={grade.color}>{e.score}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td><Badge size="xs" color={grade.color} variant="light" fw={700}>{grade.label}</Badge></Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <SectionTitle icon={Award} title="Score Distribution" sub="Performance grade spread" color="yellow" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { grade:"A+ (90+)", count: EMPLOYEES.filter(e => e.score >= 90).length,              fill:"#22c55e" },
                    { grade:"A (80+)",  count: EMPLOYEES.filter(e => e.score >= 80 && e.score < 90).length, fill:"#6366f1" },
                    { grade:"B (70+)",  count: EMPLOYEES.filter(e => e.score >= 70 && e.score < 80).length, fill:"#f59e0b" },
                    { grade:"C (<70)",  count: EMPLOYEES.filter(e => e.score < 70).length,               fill:"#ef4444" },
                  ]} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Employees" radius={[4,4,0,0]}>
                      {["#22c55e","#6366f1","#f59e0b","#ef4444"].map((c, i) => <Cell key={i} fill={c} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <Divider my="md" />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">Avg Score by Dept</Text>
                <Stack gap={6}>
                  {Object.entries(
                    EMPLOYEES.reduce((acc, e) => {
                      if (!acc[e.dept]) acc[e.dept] = [];
                      acc[e.dept].push(e.score);
                      return acc;
                    }, {})
                  ).map(([dept, scores]) => {
                    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
                    return (
                      <Group key={dept} justify="space-between">
                        <Text size="xs" c="dimmed">{dept}</Text>
                        <Group gap="sm">
                          <Progress w={60} value={avg} color={avg >= 90 ? "green" : avg >= 80 ? "blue" : "yellow"} size="xs" radius="xl" />
                          <Text size="xs" fw={700} w={24}>{avg}</Text>
                        </Group>
                      </Group>
                    );
                  })}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default Analytics;
