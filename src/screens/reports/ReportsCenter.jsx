import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Table, Modal, TextInput, Textarea,
  Select, SimpleGrid, ScrollArea, Center, Loader, Tabs, ActionIcon, Tooltip,
  Menu, Stepper, Checkbox, Switch, NumberInput, MultiSelect, SegmentedControl,
  ThemeIcon, Divider, Box, Progress, Grid, Collapse,
} from "@mantine/core";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconChartBar, IconReportAnalytics, IconPlus, IconSearch, IconDownload,
  IconTrash, IconEdit, IconCopy, IconShare, IconClock, IconStar, IconStarFilled,
  IconEye, IconPlayerPlay, IconArchive, IconBookmark, IconFileExport,
  IconFilter, IconArrowsSort, IconChartPie, IconChartLine, IconTable,
  IconLayoutGrid, IconSend, IconBell, IconSettings, IconRefresh,
  IconChevronDown, IconCircleCheck, IconUsers, IconCash, IconCalendarOff,
  IconPercentage, IconTicket, IconDeviceLaptop, IconFileCheck, IconUserPlus,
  IconUserCheck, IconGripVertical, IconX, IconCalendar,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const PIE_COLORS = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#14b8a6","#f97316","#64748b"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MODULES = [
  "Employee","Attendance","Leave","Payroll","Recruitment","Performance",
  "Learning","Travel","Expense","Assets","Documents","Visitors","Helpdesk",
  "Compliance","Custom Forms",
];

const MODULE_FIELDS = {
  Employee:    ["Employee ID","Name","Department","Branch","Designation","Status","Join Date","Gender","Email","Phone"],
  Attendance:  ["Employee ID","Name","Date","Check In","Check Out","Hours","Status","Branch","Department"],
  Leave:       ["Employee ID","Name","Leave Type","Start Date","End Date","Days","Status","Applied On","Approved By"],
  Payroll:     ["Employee ID","Name","Month","Basic","HRA","Allowances","Deductions","Net Pay","Status"],
  Recruitment: ["Job Title","Department","Candidate Name","Source","Stage","Status","Applied On","Interview Date"],
  Performance: ["Employee ID","Name","Review Period","Rating","Goals Met","Reviewer","Department","Score"],
  Learning:    ["Employee ID","Name","Course","Status","Enrolled On","Completed On","Score","Certificate"],
  Travel:      ["Employee ID","Name","Trip Purpose","From","To","Travel Date","Amount","Status"],
  Expense:     ["Employee ID","Name","Category","Amount","Date","Status","Approved By","Description"],
  Assets:      ["Asset ID","Name","Type","Assigned To","Department","Status","Assigned Date","Value"],
  Documents:   ["Employee ID","Name","Document Type","Expiry Date","Status","Uploaded On"],
  Visitors:    ["Visitor Name","Host","Purpose","Check In","Check Out","Status","Date"],
  Helpdesk:    ["Ticket ID","Subject","Category","Raised By","Assigned To","Priority","Status","Created","Resolved"],
  Compliance:  ["Policy","Department","Status","Due Date","Acknowledged By","Completion %"],
  "Custom Forms": ["Form Name","Submitted By","Department","Submission Date","Status"],
};

const TEMPLATES = [
  { name:"Employee Master",      module:"Employee",    description:"Complete employee roster with all details" },
  { name:"Attendance Summary",   module:"Attendance",  description:"Monthly attendance with present/absent/late counts" },
  { name:"Late Coming Report",   module:"Attendance",  description:"Employees arriving late by day and department" },
  { name:"Leave Balance",        module:"Leave",       description:"Current leave balance per employee and type" },
  { name:"Payroll Register",     module:"Payroll",     description:"Full payroll register for a given month" },
  { name:"Salary Revision",      module:"Payroll",     description:"Employees with salary changes and revision history" },
  { name:"Recruitment Pipeline", module:"Recruitment", description:"Active openings with candidate stage breakdown" },
  { name:"Performance Ratings",  module:"Performance", description:"Employee ratings by review cycle and department" },
  { name:"Training Completion",  module:"Learning",    description:"Course completion rates by employee and department" },
  { name:"Asset Register",       module:"Assets",      description:"All assets with assignment and value details" },
  { name:"Expense Report",       module:"Expense",     description:"Expense submissions by category and status" },
  { name:"Travel Report",        module:"Travel",      description:"Travel requests and costs by department" },
  { name:"Visitor Log",          module:"Visitors",    description:"All visitor entries with host and purpose" },
  { name:"Helpdesk Summary",     module:"Helpdesk",    description:"Ticket volume, resolution time and SLA stats" },
  { name:"Compliance Status",    module:"Compliance",  description:"Policy acknowledgement and compliance completion" },
  { name:"Custom Forms",         module:"Custom Forms",description:"Responses across all custom form submissions" },
];

const MOCK_LIBRARY = [
  { id:1,  name:"Employee Master",      module:"Employee",    category:"HR",        owner:"Siva",   lastRun:"2026-06-28", status:"Published" },
  { id:2,  name:"Monthly Attendance",   module:"Attendance",  category:"Ops",       owner:"Mani",   lastRun:"2026-06-27", status:"Published" },
  { id:3,  name:"Leave Balance FY26",   module:"Leave",       category:"HR",        owner:"Siva",   lastRun:"2026-06-25", status:"Published" },
  { id:4,  name:"Payroll Register Jun", module:"Payroll",     category:"Finance",   owner:"Siva",   lastRun:"2026-06-26", status:"Published" },
  { id:5,  name:"Recruitment Pipeline", module:"Recruitment", category:"HR",        owner:"Mani",   lastRun:"2026-06-20", status:"Draft"     },
  { id:6,  name:"Performance Q1 2026",  module:"Performance", category:"HR",        owner:"Siva",   lastRun:"2026-06-15", status:"Published" },
  { id:7,  name:"Training Completion",  module:"Learning",    category:"L&D",       owner:"Mani",   lastRun:"2026-06-22", status:"Published" },
  { id:8,  name:"Asset Register",       module:"Assets",      category:"Ops",       owner:"Siva",   lastRun:"2026-06-18", status:"Published" },
  { id:9,  name:"Helpdesk June",        module:"Helpdesk",    category:"Support",   owner:"Mani",   lastRun:"2026-06-24", status:"Published" },
  { id:10, name:"Visitor Log Q2",       module:"Visitors",    category:"Security",  owner:"Siva",   lastRun:"2026-06-23", status:"Published" },
];

const MOCK_SCHEDULED = [
  { id:1, name:"Payroll Register",    frequency:"Monthly",  nextRun:"2026-07-01", delivery:"Email",  status:"Active"   },
  { id:2, name:"Attendance Summary",  frequency:"Weekly",   nextRun:"2026-07-07", delivery:"Email",  status:"Active"   },
  { id:3, name:"Leave Balance",       frequency:"Monthly",  nextRun:"2026-07-01", delivery:"Download",status:"Active"  },
  { id:4, name:"Performance Ratings", frequency:"Quarterly",nextRun:"2026-09-01", delivery:"Email",  status:"Paused"   },
  { id:5, name:"Asset Register",      frequency:"Weekly",   nextRun:"2026-07-07", delivery:"Slack",  status:"Active"   },
];

const MOCK_SHARED = [
  { id:1, name:"Payroll Register Jun", sharedBy:"Siva", sharedWith:"Finance Team", permission:"View", lastViewed:"2026-06-28" },
  { id:2, name:"Employee Master",      sharedBy:"Mani", sharedWith:"HR Team",      permission:"View", lastViewed:"2026-06-27" },
  { id:3, name:"Recruitment Pipeline", sharedBy:"Siva", sharedWith:"Hiring Mgrs",  permission:"Edit", lastViewed:"2026-06-20" },
];

const MOCK_EXPORTS = [
  { id:1, name:"Payroll Register Jun", type:"PDF",  by:"Siva",  at:"2026-06-28 14:22", status:"Done"    },
  { id:2, name:"Attendance Summary",   type:"CSV",  by:"Mani",  at:"2026-06-27 09:10", status:"Done"    },
  { id:3, name:"Employee Master",      type:"Excel",by:"Siva",  at:"2026-06-26 16:45", status:"Done"    },
  { id:4, name:"Leave Balance FY26",   type:"PDF",  by:"Mani",  at:"2026-06-25 11:33", status:"Done"    },
  { id:5, name:"Helpdesk June",        type:"CSV",  by:"Siva",  at:"2026-06-24 08:50", status:"Done"    },
];

const STATUS_COLOR = { Published:"green", Draft:"yellow", Archived:"gray", Active:"green", Paused:"orange" };

export default function ReportsCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Report Builder"
        sub="Build, schedule and share custom reports across all HRMS modules"
        action={
          <Button leftSection={<IconPlus size={14} />} onClick={() => setActiveTab("create")}>
            Create Report
          </Button>
        }
      />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="dashboard"  leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="library"    leftSection={<IconReportAnalytics size={14} />}>Report Library</Tabs.Tab>
          <Tabs.Tab value="create"     leftSection={<IconPlus size={14} />}>Create Report</Tabs.Tab>
          <Tabs.Tab value="templates"  leftSection={<IconLayoutGrid size={14} />}>Templates</Tabs.Tab>
          <Tabs.Tab value="scheduled"  leftSection={<IconClock size={14} />}>Scheduled</Tabs.Tab>
          <Tabs.Tab value="shared"     leftSection={<IconShare size={14} />}>Shared</Tabs.Tab>
          <Tabs.Tab value="favorites"  leftSection={<IconStar size={14} />}>Favorites</Tabs.Tab>
          <Tabs.Tab value="exports"    leftSection={<IconFileExport size={14} />}>Export Center</Tabs.Tab>
          <Tabs.Tab value="settings"   leftSection={<IconSettings size={14} />}>Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="library"><LibraryTab /></Tabs.Panel>
        <Tabs.Panel value="create"><CreateReportTab onDone={() => setActiveTab("library")} /></Tabs.Panel>
        <Tabs.Panel value="templates"><TemplatesTab onUse={() => setActiveTab("create")} /></Tabs.Panel>
        <Tabs.Panel value="scheduled"><ScheduledTab /></Tabs.Panel>
        <Tabs.Panel value="shared"><SharedTab /></Tabs.Panel>
        <Tabs.Panel value="favorites"><FavoritesTab /></Tabs.Panel>
        <Tabs.Panel value="exports"><ExportCenterTab /></Tabs.Panel>
        <Tabs.Panel value="settings"><SettingsTab /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  if (isLoading) return <Center h={300}><Loader /></Center>;
  const c  = data?.cards  || {};
  const ch = data?.charts || {};

  const MOCK_GROWTH     = [{ month:"Jan",count:45 },{ month:"Feb",count:48 },{ month:"Mar",count:52 },{ month:"Apr",count:55 },{ month:"May",count:58 },{ month:"Jun",count:61 }];
  const MOCK_DEPTS      = [{ name:"Engineering",value:18 },{ name:"HR",value:8 },{ name:"Finance",value:6 },{ name:"Sales",value:12 },{ name:"Ops",value:9 },{ name:"Design",value:4 }];
  const MOCK_BRANCHES   = [{ name:"Chennai",value:28 },{ name:"Bangalore",value:18 },{ name:"Mumbai",value:12 },{ name:"Delhi",value:8 }];
  const MOCK_ASSETS     = [{ name:"Laptop",value:34 },{ name:"Monitor",value:28 },{ name:"Phone",value:15 },{ name:"Other",value:9 }];
  const MOCK_LEAVE      = [{ month:"Jan",days:22 },{ month:"Feb",days:18 },{ month:"Mar",days:30 },{ month:"Apr",days:25 },{ month:"May",days:20 },{ month:"Jun",days:28 }];
  const MOCK_ATTENDANCE = [{ month:"Jan",present:42,absent:3 },{ month:"Feb",present:44,absent:4 },{ month:"Mar",present:48,absent:4 },{ month:"Apr",present:50,absent:5 },{ month:"May",present:53,absent:5 },{ month:"Jun",present:58,absent:3 }];
  const MOCK_USAGE      = [{ name:"Employee",reports:18 },{ name:"Attendance",reports:14 },{ name:"Payroll",reports:12 },{ name:"Leave",reports:10 },{ name:"Helpdesk",reports:7 }];

  const growth   = ch.employeeGrowth?.length     ? ch.employeeGrowth     : MOCK_GROWTH;
  const depts    = ch.departmentHeadcount?.length ? ch.departmentHeadcount: MOCK_DEPTS;
  const branches = ch.branchDistribution?.length  ? ch.branchDistribution : MOCK_BRANCHES;
  const assets   = ch.assetDistribution?.length   ? ch.assetDistribution  : MOCK_ASSETS;
  const leave    = ch.leaveTrend?.length           ? ch.leaveTrend         : MOCK_LEAVE;
  const attend   = ch.attendanceTrend?.length      ? ch.attendanceTrend    : MOCK_ATTENDANCE;

  const KPI = [
    { icon:<IconUsers size={20}/>,       label:"Total Employees",   value: c.totalEmployees  ?? 61,   color:"blue"   },
    { icon:<IconUserCheck size={20}/>,   label:"Active",            value: c.activeEmployees ?? 58,   color:"green"  },
    { icon:<IconUserPlus size={20}/>,    label:"New Joiners",       value: c.newJoiners      ?? 4,    color:"teal"   },
    { icon:<IconCalendarOff size={20}/>, label:"On Leave Today",    value: c.onLeaveToday    ?? 3,    color:"yellow" },
    { icon:<IconPercentage size={20}/>,  label:"Attendance %",      value: `${c.attendancePct ?? 96}%`,color:"cyan"  },
    { icon:<IconCash size={20}/>,        label:"Payroll Cost",      value: inr(c.payrollCost ?? 2840000), color:"indigo" },
    { icon:<IconTicket size={20}/>,      label:"Open Tickets",      value: c.openTickets     ?? 7,    color:"orange" },
    { icon:<IconDeviceLaptop size={20}/>,label:"Assigned Assets",   value: c.assignedAssets  ?? 86,   color:"grape"  },
    { icon:<IconReportAnalytics size={20}/>, label:"Total Reports", value: 10,  color:"violet" },
    { icon:<IconFileCheck size={20}/>,   label:"Scheduled Reports", value: 5,   color:"pink"   },
  ];

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        {KPI.map(k => (
          <Paper key={k.label} withBorder p="md" radius="lg">
            <Group gap="sm" mb={4}>
              <ThemeIcon size={30} radius={8} variant="light" color={k.color}>{k.icon}</ThemeIcon>
              <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ flex:1, lineHeight:1.2 }}>{k.label}</Text>
            </Group>
            <Text fw={800} size="xl" c={k.color}>{k.value}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base:1, lg:2 }}>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Employee Growth Trend</Text>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growth}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize:11 }} /><YAxis allowDecimals={false} tick={{ fontSize:11 }} /><RTooltip /><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f633" name="Employees" /></AreaChart>
          </ResponsiveContainer>
        </Paper>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Department Headcount</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={depts}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize:10 }} interval={0} angle={-15} textAnchor="end" height={50} /><YAxis allowDecimals={false} tick={{ fontSize:11 }} /><RTooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base:1, sm:2, lg:3 }}>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Branch Distribution</Text>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={branches} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
              {branches.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie><RTooltip /></PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Leave Trend (Days)</Text>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leave}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize:11 }} /><YAxis allowDecimals={false} tick={{ fontSize:11 }} /><RTooltip /><Bar dataKey="days" fill="#f59e0b" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} mb="md">Module Report Usage</Text>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_USAGE} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize:11 }} /><YAxis dataKey="name" type="category" tick={{ fontSize:11 }} width={80} /><RTooltip /><Bar dataKey="reports" fill="#10b981" radius={[0,4,4,0]} /></BarChart>
          </ResponsiveContainer>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Attendance Trend</Text>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={attend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize:11 }} /><YAxis allowDecimals={false} tick={{ fontSize:11 }} /><RTooltip /><Legend /><Area type="monotone" dataKey="present" stroke="#10b981" fill="#10b98122" name="Present" /><Area type="monotone" dataKey="absent" stroke="#ef4444" fill="#ef444422" name="Absent" /></AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Stack>
  );
}

// ─── LIBRARY TAB ─────────────────────────────────────────────────────────────
function LibraryTab() {
  const toast = useToast();
  const { data: catalog = {} } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createSaved   = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const createExport  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const [search, setSearch]       = useState("");
  const [modFilter, setMod]       = useState("");
  const [statusF, setStatus]      = useState("");
  const [viewReport, setView]     = useState(null);
  const [runModule, setRunModule] = useState("");
  const [runReport, setRunReport] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: runData, isFetching } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const modules = Object.keys(catalog).length ? Object.keys(catalog) : MODULES;

  const filtered = MOCK_LIBRARY.filter(r =>
    (!search    || r.name.toLowerCase().includes(search.toLowerCase())) &&
    (!modFilter || r.module === modFilter) &&
    (!statusF   || r.status === statusF)
  );

  const handleSave = async (r) => {
    try {
      await createSaved.mutateAsync({ name: r.name, module: r.module, reportKey: r.name });
      toast.show("Saved to My Reports", "success");
    } catch { toast.show("Failed to save", "error"); }
  };

  // Generate data on-demand then export
  const fetchAndExport = async (r, format) => {
    setExporting(true);
    toast.show(`Generating ${r.name}…`, "info");
    try {
      const result = await generateReport(r.module, r.name);
      const rows = result?.rows ?? [];
      if (!rows.length) { toast.show("Report returned no data", "error"); return; }
      if (format === "CSV") {
        const h = Object.keys(rows[0]);
        const csv = [h.join(","), ...rows.map(row => h.map(k => `"${row[k] ?? ""}"`).join(","))].join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
        a.download = `${r.name.replace(/\s+/g,"_")}.csv`;
        a.click();
        toast.show("CSV downloaded", "success");
      } else if (format === "PDF") {
        const h = Object.keys(rows[0]);
        const w = window.open("","_blank");
        w.document.write(`<!doctype html><title>${r.name}</title><style>body{font-family:Arial;padding:20px;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}th{background:#f1f5f9;font-weight:600}</style><h2>${r.name}</h2><p style="color:#666;font-size:11px">Module: ${r.module} · ${rows.length} rows</p><table><thead><tr>${h.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${h.map(k=>`<td>${row[k]??""}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
        w.document.close(); w.print();
        toast.show("Opened print/PDF view", "info");
      }
      // log to export center
      createExport.mutateAsync({ reportName: r.name, exportType: format }).catch(() => {});
    } catch { toast.show("Failed to generate report", "error"); }
    finally { setExporting(false); }
  };

  const exportCsv = (rows, name) => {
    if (!rows?.length) { toast.show("No data — run the report first", "error"); return; }
    const h = Object.keys(rows[0]);
    const csv = [h.join(","), ...rows.map(r => h.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `${name.replace(/\s+/g,"_")}.csv`;
    a.click();
    createExport.mutateAsync({ reportName: name, exportType: "CSV" }).catch(() => {});
    toast.show("CSV downloaded", "success");
  };

  const exportPdf = (rows, name) => {
    if (!rows?.length) { toast.show("No data — run the report first", "error"); return; }
    const h = Object.keys(rows[0]);
    const w = window.open("","_blank");
    w.document.write(`<!doctype html><title>${name}</title><style>body{font-family:Arial;padding:20px;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}th{background:#f1f5f9;font-weight:600}</style><h2>${name}</h2><table><thead><tr>${h.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${h.map(k=>`<td>${r[k]??""}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    w.document.close(); w.print();
    createExport.mutateAsync({ reportName: name, exportType: "PDF" }).catch(() => {});
    toast.show("Opened print/PDF view", "info");
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="lg">
        <Group gap="sm" wrap="wrap">
          <TextInput placeholder="Search reports…" leftSection={<IconSearch size={14} />} value={search} onChange={e => setSearch(e.target.value)} radius="md" w={220} />
          <Select placeholder="Module" data={modules} value={modFilter} onChange={v => setMod(v ?? "")} clearable radius="md" w={160} />
          <Select placeholder="Status" data={["Published","Draft","Archived"]} value={statusF} onChange={v => setStatus(v ?? "")} clearable radius="md" w={140} />
          <Button variant="default" leftSection={<IconRefresh size={14} />} onClick={() => { setSearch(""); setMod(""); setStatus(""); }}>Reset</Button>
        </Group>
      </Paper>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {["Report Name","Module","Category","Owner","Last Run","Status","Actions"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={7}><AppEmptyState icon={<IconReportAnalytics size={22} />} message="No reports found" sub="Adjust filters or create a new report." /></Table.Td></Table.Tr>
              ) : filtered.map(r => (
                <Table.Tr key={r.id}>
                  <Table.Td><Text size="sm" fw={600}>{r.name}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color="blue" size="sm">{r.module}</Badge></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{r.category}</Text></Table.Td>
                  <Table.Td><Text size="sm">{r.owner}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{r.lastRun}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[r.status] || "gray"} size="sm">{r.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setView(r)}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Run Report"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => { setRunModule(r.module); setRunReport(r.name); setView(r); }}><IconPlayerPlay size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Save"><ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleSave(r)}><IconBookmark size={13} /></ActionIcon></Tooltip>
                      <Menu withinPortal position="bottom-end">
                        <Menu.Target><ActionIcon size="sm" variant="subtle"><IconChevronDown size={13} /></ActionIcon></Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconCopy size={13} />}>Duplicate</Menu.Item>
                          <Menu.Item leftSection={<IconShare size={13} />}>Share</Menu.Item>
                          <Menu.Item leftSection={<IconClock size={13} />}>Schedule</Menu.Item>
                          <Menu.Item leftSection={<IconDownload size={13} />} onClick={() => fetchAndExport(r, "CSV")}>Export CSV</Menu.Item>
                          <Menu.Item leftSection={<IconDownload size={13} />} onClick={() => fetchAndExport(r, "PDF")}>Export PDF</Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconArchive size={13} />} color="gray">Archive</Menu.Item>
                          <Menu.Item leftSection={<IconTrash size={13} />} color="red">Delete</Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Report Viewer Modal */}
      <Modal opened={!!viewReport} onClose={() => setView(null)} title={viewReport?.name} size="xl" radius="lg">
        {viewReport && (
          <Stack gap="md">
            <Group gap="sm" wrap="wrap">
              <Badge variant="light" color="blue">{viewReport.module}</Badge>
              <Badge variant="light" color={STATUS_COLOR[viewReport.status] || "gray"}>{viewReport.status}</Badge>
              <Text size="xs" c="dimmed" ml="auto">Last run: {viewReport.lastRun}</Text>
            </Group>
            <Group gap="sm">
              <Select label="Module" data={modules} value={runModule || viewReport.module} onChange={v => setRunModule(v ?? "")} w={180} radius="md" size="sm" />
              <Select label="Report" data={modules.map(m => m)} value={runReport || viewReport.name} onChange={v => setRunReport(v ?? "")} w={220} radius="md" size="sm" />
              <Button size="sm" leftSection={<IconPlayerPlay size={13} />} loading={isFetching} mt={22} onClick={() => { setRunModule(runModule || viewReport.module); setRunReport(runReport || viewReport.name); }}>
                Run
              </Button>
            </Group>
            {isFetching ? <Center h={100}><Loader size="sm" /></Center> : runData?.rows?.length ? (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">{runData.total} rows</Text>
                  <Group gap="xs">
                    <Button size="xs" variant="default" leftSection={<IconDownload size={12} />} onClick={() => exportCsv(runData.rows, viewReport.name)}>CSV</Button>
                    <Button size="xs" variant="default" leftSection={<IconDownload size={12} />} onClick={() => exportPdf(runData.rows, viewReport.name)}>PDF</Button>
                  </Group>
                </Group>
                <ScrollArea h={340}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>{Object.keys(runData.rows[0]).map(k => <Table.Th key={k}><Text size="xs" fw={600} tt="uppercase" c="dimmed">{k}</Text></Table.Th>)}</Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {runData.rows.slice(0,100).map((row, i) => (
                        <Table.Tr key={i}>{Object.values(row).map((v, j) => <Table.Td key={j}><Text size="sm">{String(v ?? "—")}</Text></Table.Td>)}</Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </>
            ) : <AppEmptyState icon={<IconReportAnalytics size={22} />} message="Run the report to see data" sub="Select module & report then click Run." />}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ─── CREATE REPORT (10-STEP WIZARD) ──────────────────────────────────────────
const BLANK_REPORT = {
  name:"", description:"", category:"", module:"Employee", visibility:"Private", tags:"",
  fields:[], filters:[], groupBy:"", sortBy:"", sortDir:"asc",
  visualization:"Table", exportFormats:["CSV","Excel"],
  sharing:"Private", schedule:"None",
};

function CreateReportTab({ onDone }) {
  const toast = useToast();
  const createSaved = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(BLANK_REPORT);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const availableFields = MODULE_FIELDS[form.module] || [];

  const handlePublish = async () => {
    try {
      await createSaved.mutateAsync({ name: form.name, module: form.module, reportKey: form.name, isShared: form.sharing !== "Private" });
      toast.show("Report published successfully", "success");
      setForm(BLANK_REPORT);
      setStep(0);
      onDone?.();
    } catch { toast.show("Failed to publish", "error"); }
  };

  const handleDraft = async () => {
    try {
      await createSaved.mutateAsync({ name: form.name || "Untitled", module: form.module, reportKey: form.name || "Untitled" });
      toast.show("Saved as draft", "info");
    } catch { toast.show("Failed to save", "error"); }
  };

  const STEPS = [
    "Basic Info", "Data Source", "Select Fields", "Filters",
    "Group & Sort", "Visualization", "Export Options",
    "Sharing", "Preview", "Publish",
  ];

  return (
    <Stack gap="lg">
      <Stepper active={step} onStepClick={setStep} size="sm" allowNextStepsSelect={false}>
        {STEPS.map((s, i) => <Stepper.Step key={i} label={s} />)}
      </Stepper>

      <Paper withBorder p="xl" radius="lg">
        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <Stack gap="md" maw={600}>
            <Text fw={700} size="lg">Basic Information</Text>
            <TextInput label="Report Name" placeholder="e.g. Monthly Attendance Summary" value={form.name} onChange={e => set("name", e.target.value)} required radius="md" />
            <Textarea label="Description" placeholder="What does this report show?" value={form.description} onChange={e => set("description", e.target.value)} minRows={2} radius="md" />
            <Select label="Category" data={["HR","Finance","Ops","Compliance","L&D","Sales","Support","Security","Custom"]} value={form.category} onChange={v => set("category", v)} radius="md" />
            <Select label="Visibility" data={["Private","Department","Company Wide","Public"]} value={form.visibility} onChange={v => set("visibility", v)} radius="md" />
            <TextInput label="Tags" placeholder="comma separated tags" value={form.tags} onChange={e => set("tags", e.target.value)} radius="md" />
          </Stack>
        )}

        {/* Step 1 — Data Source */}
        {step === 1 && (
          <Stack gap="md">
            <Text fw={700} size="lg">Select Data Source</Text>
            <Text size="sm" c="dimmed">Choose one or more HRMS modules as data sources for this report.</Text>
            <SimpleGrid cols={{ base:2, sm:3, lg:5 }}>
              {MODULES.map(m => (
                <Paper
                  key={m} withBorder p="md" radius="md"
                  style={{ cursor:"pointer", borderColor: form.module === m ? "var(--mantine-color-blue-5)" : undefined, background: form.module === m ? "var(--mantine-color-blue-0)" : undefined }}
                  onClick={() => { set("module", m); set("fields", []); }}
                >
                  <Group gap="xs">
                    {form.module === m && <IconCircleCheck size={14} color="var(--mantine-color-blue-6)" />}
                    <Text size="sm" fw={form.module === m ? 700 : 400}>{m}</Text>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Step 2 — Select Fields */}
        {step === 2 && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={700} size="lg">Select Fields — {form.module}</Text>
              <Group gap="xs">
                <Button size="xs" variant="default" onClick={() => set("fields", availableFields)}>Select All</Button>
                <Button size="xs" variant="default" onClick={() => set("fields", [])}>Clear</Button>
              </Group>
            </Group>
            <Text size="sm" c="dimmed">{form.fields.length} of {availableFields.length} fields selected</Text>
            <Progress value={(form.fields.length / availableFields.length) * 100} radius="xl" size="sm" mb="xs" />
            <SimpleGrid cols={{ base:2, sm:3, lg:4 }}>
              {availableFields.map(f => (
                <Paper key={f} withBorder p="sm" radius="md" style={{ cursor:"pointer" }}
                  onClick={() => set("fields", form.fields.includes(f) ? form.fields.filter(x => x !== f) : [...form.fields, f])}>
                  <Group gap="xs">
                    <IconGripVertical size={12} color="var(--mantine-color-dimmed)" />
                    <Checkbox
                      size="xs"
                      checked={form.fields.includes(f)}
                      readOnly
                      label={<Text size="sm">{f}</Text>}
                    />
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Step 3 — Filters */}
        {step === 3 && (
          <Stack gap="md" maw={680}>
            <Text fw={700} size="lg">Filters</Text>
            <Text size="sm" c="dimmed">Define conditions to narrow down the data.</Text>
            <SimpleGrid cols={2}>
              <Select label="Department" data={["All","Engineering","HR","Finance","Sales","Operations"]} defaultValue="All" radius="md" />
              <Select label="Branch" data={["All","Chennai","Bangalore","Mumbai","Delhi"]} defaultValue="All" radius="md" />
              <Select label="Designation" data={["All","Software Engineer","Manager","Analyst","Director"]} defaultValue="All" radius="md" />
              <Select label="Status" data={["All","Active","Inactive","On Leave","Probation"]} defaultValue="All" radius="md" />
            </SimpleGrid>
            <Group gap="md">
              <TextInput label="Date From" type="date" radius="md" style={{ flex:1 }} />
              <TextInput label="Date To" type="date" radius="md" style={{ flex:1 }} />
            </Group>
            <Divider label="Filter Logic" labelPosition="left" />
            <SegmentedControl
              data={[{ label:"Match ALL (AND)", value:"AND" }, { label:"Match ANY (OR)", value:"OR" }]}
              value="AND"
              radius="md"
            />
          </Stack>
        )}

        {/* Step 4 — Group & Sort */}
        {step === 4 && (
          <Stack gap="md" maw={520}>
            <Text fw={700} size="lg">Grouping & Sorting</Text>
            <Select label="Group By" data={["None","Department","Branch","Manager","Month","Year","Status","Gender"]} value={form.groupBy || "None"} onChange={v => set("groupBy", v || "")} radius="md" />
            <Select label="Sort By" data={availableFields.length ? availableFields : ["Name","Date","Amount"]} value={form.sortBy} onChange={v => set("sortBy", v)} searchable radius="md" />
            <SegmentedControl
              data={[{ label:"Ascending ↑", value:"asc" }, { label:"Descending ↓", value:"desc" }]}
              value={form.sortDir}
              onChange={v => set("sortDir", v)}
              radius="md"
            />
            <Divider label="Secondary Sort" labelPosition="left" />
            <Select label="Then Sort By" data={["None", ...(availableFields.length ? availableFields : ["Name","Date"])]} defaultValue="None" radius="md" />
          </Stack>
        )}

        {/* Step 5 — Visualization */}
        {step === 5 && (
          <Stack gap="md">
            <Text fw={700} size="lg">Visualization</Text>
            <Text size="sm" c="dimmed">Choose how to display the report data.</Text>
            <SimpleGrid cols={{ base:2, sm:3, lg:5 }}>
              {[
                { v:"Table",         icon:<IconTable size={22} /> },
                { v:"Bar Chart",     icon:<IconChartBar size={22} /> },
                { v:"Line Chart",    icon:<IconChartLine size={22} /> },
                { v:"Pie Chart",     icon:<IconChartPie size={22} /> },
                { v:"Area Chart",    icon:<IconChartLine size={22} /> },
                { v:"Summary Cards", icon:<IconLayoutGrid size={22} /> },
              ].map(({ v, icon }) => (
                <Paper key={v} withBorder p="lg" radius="md" style={{ cursor:"pointer", textAlign:"center", borderColor: form.visualization === v ? "var(--mantine-color-blue-5)" : undefined, background: form.visualization === v ? "var(--mantine-color-blue-0)" : undefined }}
                  onClick={() => set("visualization", v)}>
                  <ThemeIcon size={40} radius={10} variant="light" color={form.visualization === v ? "blue" : "gray"} mb="sm">{icon}</ThemeIcon>
                  <Text size="sm" fw={form.visualization === v ? 700 : 400}>{v}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Step 6 — Export */}
        {step === 6 && (
          <Stack gap="md" maw={480}>
            <Text fw={700} size="lg">Export Options</Text>
            <Text size="sm" c="dimmed">Choose which export formats to enable for this report.</Text>
            <Stack gap="sm">
              {["Excel","CSV","PDF","Print","Email","Scheduled Delivery"].map(fmt => (
                <Paper key={fmt} withBorder p="md" radius="md">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>{fmt}</Text>
                    <Switch
                      checked={form.exportFormats.includes(fmt)}
                      onChange={() => set("exportFormats", form.exportFormats.includes(fmt) ? form.exportFormats.filter(x => x !== fmt) : [...form.exportFormats, fmt])}
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Step 7 — Sharing */}
        {step === 7 && (
          <Stack gap="md" maw={520}>
            <Text fw={700} size="lg">Sharing & Permissions</Text>
            <SimpleGrid cols={1}>
              {[
                { v:"Private",      desc:"Only you can see this report" },
                { v:"Department",   desc:"Visible to your department" },
                { v:"Role Based",   desc:"Visible to selected roles" },
                { v:"Company Wide", desc:"All users in your company" },
                { v:"Public",       desc:"Anyone with the link" },
              ].map(({ v, desc }) => (
                <Paper key={v} withBorder p="md" radius="md" style={{ cursor:"pointer", borderColor: form.sharing === v ? "var(--mantine-color-blue-5)" : undefined, background: form.sharing === v ? "var(--mantine-color-blue-0)" : undefined }}
                  onClick={() => set("sharing", v)}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={600}>{v}</Text>
                      <Text size="xs" c="dimmed">{desc}</Text>
                    </div>
                    {form.sharing === v && <IconCircleCheck size={18} color="var(--mantine-color-blue-6)" />}
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Step 8 — Preview */}
        {step === 8 && (
          <Stack gap="md">
            <Text fw={700} size="lg">Preview</Text>
            <SegmentedControl data={["Desktop","Tablet","Mobile"]} defaultValue="Desktop" radius="md" w={300} />
            <Paper withBorder p="lg" radius="lg" bg="var(--mantine-color-gray-0)">
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text fw={700} size="lg">{form.name || "Untitled Report"}</Text>
                    <Text size="xs" c="dimmed">{form.description || "No description"}</Text>
                  </div>
                  <Group gap="xs">
                    <Badge variant="light" color="blue">{form.module}</Badge>
                    <Badge variant="light" color="gray">{form.visualization}</Badge>
                  </Group>
                </Group>
                <Divider />
                {form.fields.length > 0 ? (
                  <ScrollArea>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>{form.fields.map(f => <Table.Th key={f}><Text size="xs" fw={600} tt="uppercase" c="dimmed">{f}</Text></Table.Th>)}</Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {[1,2,3].map(i => (
                          <Table.Tr key={i}>
                            {form.fields.map(f => <Table.Td key={f}><Text size="sm" c="dimmed">Sample {f} {i}</Text></Table.Td>)}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                ) : <AppEmptyState icon={<IconTable size={22} />} message="No fields selected" sub="Go back to Step 3 to select fields." />}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* Step 9 — Publish */}
        {step === 9 && (
          <Stack gap="lg" maw={520}>
            <Text fw={700} size="lg">Publish Report</Text>
            <Paper withBorder p="lg" radius="lg">
              <Stack gap="xs">
                <Group justify="space-between"><Text size="sm" c="dimmed">Name</Text><Text size="sm" fw={600}>{form.name || "—"}</Text></Group>
                <Group justify="space-between"><Text size="sm" c="dimmed">Module</Text><Badge variant="light" color="blue" size="sm">{form.module}</Badge></Group>
                <Group justify="space-between"><Text size="sm" c="dimmed">Fields</Text><Text size="sm" fw={600}>{form.fields.length} selected</Text></Group>
                <Group justify="space-between"><Text size="sm" c="dimmed">Visualization</Text><Text size="sm" fw={600}>{form.visualization}</Text></Group>
                <Group justify="space-between"><Text size="sm" c="dimmed">Sharing</Text><Text size="sm" fw={600}>{form.sharing}</Text></Group>
                <Group justify="space-between"><Text size="sm" c="dimmed">Export Formats</Text><Text size="sm" fw={600}>{form.exportFormats.join(", ")}</Text></Group>
              </Stack>
            </Paper>
            <Group gap="sm">
              <Button variant="default" onClick={handleDraft} loading={createSaved.isPending}>Save Draft</Button>
              <Button onClick={handlePublish} loading={createSaved.isPending} leftSection={<IconCircleCheck size={14} />}>Publish Report</Button>
              <Button variant="subtle" color="red" onClick={() => { setForm(BLANK_REPORT); setStep(0); }}>Cancel</Button>
            </Group>
          </Stack>
        )}
      </Paper>

      {/* Nav buttons */}
      <Group justify="space-between">
        <Button variant="default" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Previous</Button>
        {step < 9
          ? <Button onClick={() => setStep(s => s + 1)}>Next →</Button>
          : null
        }
      </Group>
    </Stack>
  );
}

// ─── TEMPLATES TAB ───────────────────────────────────────────────────────────
function TemplatesTab({ onUse }) {
  const [search, setSearch] = useState("");
  const [modFilter, setMod] = useState("");

  const filtered = TEMPLATES.filter(t =>
    (!search    || t.name.toLowerCase().includes(search.toLowerCase())) &&
    (!modFilter || t.module === modFilter)
  );

  return (
    <Stack gap="md">
      <Group gap="sm">
        <TextInput placeholder="Search templates…" leftSection={<IconSearch size={14} />} value={search} onChange={e => setSearch(e.target.value)} radius="md" w={220} />
        <Select placeholder="Module" data={MODULES} value={modFilter} onChange={v => setMod(v ?? "")} clearable radius="md" w={160} />
      </Group>
      <SimpleGrid cols={{ base:1, sm:2, lg:3 }}>
        {filtered.map(t => (
          <Paper key={t.name} withBorder p="lg" radius="lg">
            <Group gap="xs" mb="sm">
              <ThemeIcon size={32} radius={8} variant="light" color="blue"><IconReportAnalytics size={16} /></ThemeIcon>
              <Badge variant="light" color="violet" size="sm">{t.module}</Badge>
            </Group>
            <Text fw={700} size="sm" mb={4}>{t.name}</Text>
            <Text size="xs" c="dimmed" mb="md">{t.description}</Text>
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={onUse} fullWidth>
              Use Template
            </Button>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// ─── SCHEDULED REPORTS TAB ───────────────────────────────────────────────────
function ScheduledTab() {
  const toast = useToast();
  const { data: rawSched = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createSched  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateSched  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteSched  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const schedules = Array.isArray(rawSched) ? rawSched : (rawSched.schedules ?? MOCK_SCHEDULED);
  const rows = schedules.length ? schedules : MOCK_SCHEDULED;

  const [schedModal, setSchedModal] = useState(false);
  const [form, setForm] = useState({ reportName:"", module:"Employee", frequency:"Weekly", deliveryMethod:"Email", deliveryTarget:"" });

  const handleSave = async () => {
    if (!form.reportName || !form.frequency) { toast.show("Report name and frequency required", "error"); return; }
    try {
      await createSched.mutateAsync(form);
      toast.show("Schedule saved", "success");
      setSchedModal(false);
      setForm({ reportName:"", module:"Employee", frequency:"Weekly", deliveryMethod:"Email", deliveryTarget:"" });
    } catch { toast.show("Failed to save schedule", "error"); }
  };

  const handleToggle = async (s) => {
    try {
      await updateSched.mutateAsync({ id: s.id, status: s.status === "Active" ? "Paused" : "Active" });
      toast.show(`Schedule ${s.status === "Active" ? "paused" : "resumed"}`, "info");
    } catch { toast.show("Failed", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSched.mutateAsync(id);
      toast.show("Schedule deleted", "success");
    } catch { toast.show("Failed to delete", "error"); }
  };

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={14} />} onClick={() => setSchedModal(true)}>Add Schedule</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {["Report Name","Frequency","Next Run","Delivery Method","Status","Actions"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr><Table.Td colSpan={6}><Center py="md"><Loader size="sm" /></Center></Table.Td></Table.Tr>
              ) : rows.map(s => (
                <Table.Tr key={s.id}>
                  <Table.Td><Text size="sm" fw={600}>{s.reportName ?? s.name}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color="blue" size="sm">{s.frequency}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{s.nextRunAt ? new Date(s.nextRunAt).toLocaleDateString("en-IN") : (s.nextRun ?? "—")}</Text></Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={s.deliveryMethod === "Email" || s.delivery === "Email" ? "green" : s.deliveryMethod === "Slack" || s.delivery === "Slack" ? "violet" : "blue"} size="sm">
                      {s.deliveryMethod ?? s.delivery}
                    </Badge>
                  </Table.Td>
                  <Table.Td><Badge variant="dot" color={STATUS_COLOR[s.status] || "gray"} size="sm">{s.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label={s.status === "Active" ? "Pause" : "Resume"}>
                        <ActionIcon size="sm" variant="subtle" color={s.status === "Active" ? "orange" : "green"} onClick={() => handleToggle(s)}><IconClock size={13} /></ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(s.id)} loading={deleteSched.isPending}><IconTrash size={13} /></ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={schedModal} onClose={() => setSchedModal(false)} title="Add Report Schedule" size="sm" radius="lg">
        <Stack gap="md">
          <TextInput label="Report Name" placeholder="e.g. Payroll Register" value={form.reportName} onChange={e => setForm(f => ({ ...f, reportName: e.target.value }))} radius="md" />
          <Select label="Module" data={MODULES} value={form.module} onChange={v => setForm(f => ({ ...f, module: v ?? "Employee" }))} radius="md" />
          <Select label="Frequency" data={["Daily","Weekly","Monthly","Quarterly","Yearly"]} value={form.frequency} onChange={v => setForm(f => ({ ...f, frequency: v ?? "Weekly" }))} radius="md" />
          <Select label="Delivery Method" data={["Email","Download","Notification","Microsoft Teams","Slack"]} value={form.deliveryMethod} onChange={v => setForm(f => ({ ...f, deliveryMethod: v ?? "Email" }))} radius="md" />
          {form.deliveryMethod === "Email" && (
            <TextInput label="Recipient Email" placeholder="email@company.com" value={form.deliveryTarget} onChange={e => setForm(f => ({ ...f, deliveryTarget: e.target.value }))} radius="md" />
          )}
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setSchedModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={createSched.isPending}>Save Schedule</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── SHARED REPORTS TAB ──────────────────────────────────────────────────────
function SharedTab() {
  const toast = useToast();
  const { data: rawShares = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const deleteShare  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const [viewing, setViewing]     = useState(null);
  const [runModule, setRunModule] = useState("");
  const [runReport, setRunReport] = useState("");
  const { data: runData, isFetching } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const shares = Array.isArray(rawShares) ? rawShares : (rawShares.shares ?? MOCK_SHARED);
  const rows   = shares.length ? shares : MOCK_SHARED;

  const handleView = (s) => {
    const name   = s.name ?? s.reportName ?? "";
    const module = s.module ?? "Employee";
    setViewing(s);
    setRunModule(module);
    setRunReport(name);
  };

  const handleRemove = async (id) => {
    try { await deleteShare.mutateAsync(id); toast.show("Share removed", "info"); }
    catch { toast.show("Failed to remove", "error"); }
  };

  const exportCsvFromView = () => {
    const dataRows = runData?.rows ?? [];
    if (!dataRows.length) { toast.show("No data to export", "error"); return; }
    const h = Object.keys(dataRows[0]);
    const csv = [h.join(","), ...dataRows.map(r => h.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `${(viewing?.name ?? "report").replace(/\s+/g,"_")}.csv`;
    a.click();
    toast.show("CSV downloaded", "success");
  };

  return (
    <Stack gap="md">
      {isLoading ? <Center h={200}><Loader /></Center> : rows.length === 0 ? (
        <AppEmptyState icon={<IconShare size={22} />} message="No shared reports" sub="Share a report from the library to see it here." />
      ) : (
        <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  {["Report Name","Shared By","Shared With","Permission","Last Viewed","Actions"].map(h => (
                    <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map(s => (
                  <Table.Tr key={s.id}>
                    <Table.Td><Text size="sm" fw={600}>{s.name ?? s.reportName}</Text></Table.Td>
                    <Table.Td><Text size="sm">{s.sharedBy ?? s.sharedByName}</Text></Table.Td>
                    <Table.Td><Text size="sm">{s.sharedWith}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={s.permission === "Edit" ? "orange" : "blue"} size="sm">{s.permission}</Badge></Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {(s.lastViewedAt || s.lastViewed) ? new Date(s.lastViewedAt ?? s.lastViewed).toLocaleDateString("en-IN") : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Tooltip label="View Report">
                          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleView(s)}>
                            <IconEye size={13} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Remove Share">
                          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleRemove(s.id)} loading={deleteShare.isPending}>
                            <IconX size={13} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}

      {/* Report Viewer Modal */}
      <Modal
        opened={!!viewing}
        onClose={() => { setViewing(null); setRunModule(""); setRunReport(""); }}
        title={viewing?.name ?? viewing?.reportName ?? "Report"}
        size="xl"
        radius="lg"
      >
        {viewing && (
          <Stack gap="md">
            <Group gap="sm" wrap="wrap">
              <Badge variant="light" color="blue">{viewing.module ?? "—"}</Badge>
              <Badge variant="light" color={viewing.permission === "Edit" ? "orange" : "blue"}>{viewing.permission} access</Badge>
              <Text size="xs" c="dimmed">Shared by: {viewing.sharedBy ?? viewing.sharedByName ?? "—"}</Text>
              <Text size="xs" c="dimmed">With: {viewing.sharedWith}</Text>
            </Group>

            {isFetching ? (
              <Center h={160}><Loader size="sm" /></Center>
            ) : runData?.rows?.length ? (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">{runData.total} rows</Text>
                  <Button size="xs" variant="default" leftSection={<IconDownload size={12} />} onClick={exportCsvFromView}>
                    Export CSV
                  </Button>
                </Group>
                <ScrollArea h={360}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        {Object.keys(runData.rows[0]).map(k => (
                          <Table.Th key={k}><Text size="xs" fw={600} tt="uppercase" c="dimmed">{k}</Text></Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {runData.rows.slice(0, 100).map((row, i) => (
                        <Table.Tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <Table.Td key={j}><Text size="sm">{String(v ?? "—")}</Text></Table.Td>
                          ))}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
                {runData.total > 100 && (
                  <Text size="xs" c="dimmed">Showing first 100 of {runData.total} rows.</Text>
                )}
              </>
            ) : (
              <AppEmptyState
                icon={<IconReportAnalytics size={22} />}
                message="No data available"
                sub="This report returned no rows for your company."
              />
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ─── FAVORITES TAB ───────────────────────────────────────────────────────────
function FavoritesTab() {
  const { data: saved = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const update = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const toast = useToast();

  const favorites = Array.isArray(saved) ? saved.filter(r => r.isFavorite) : [];

  const unfav = async (r) => {
    try { await update.mutateAsync({ id: r.id, isFavorite: false }); toast.show("Removed from favorites", "info"); }
    catch { toast.show("Failed", "error"); }
  };

  if (!favorites.length) return (
    <AppEmptyState icon={<IconStarFilled size={22} />} message="No favorite reports" sub="Star a report from the library to pin it here." />
  );

  return (
    <SimpleGrid cols={{ base:1, sm:2, lg:3 }}>
      {favorites.map(r => (
        <Paper key={r.id} withBorder p="lg" radius="lg">
          <Group justify="space-between" mb="sm">
            <Badge variant="light" color="blue" size="sm">{r.module}</Badge>
            <ActionIcon size="sm" variant="subtle" color="yellow" onClick={() => unfav(r)}><IconStarFilled size={14} /></ActionIcon>
          </Group>
          <Text fw={700} size="sm" mb={4}>{r.name}</Text>
          <Text size="xs" c="dimmed" mb="md">Last run: {r.lastRun || "Never"}</Text>
          <Button size="xs" variant="light" leftSection={<IconPlayerPlay size={12} />} fullWidth>Run Report</Button>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

// ─── EXPORT CENTER TAB ───────────────────────────────────────────────────────
function ExportCenterTab() {
  const toast = useToast();
  const { data: rawLogs = [], isLoading, refetch } = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const createExport = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [search, setSearch]   = useState("");
  const [rerunning, setRerun] = useState(null);

  const logs = Array.isArray(rawLogs) ? rawLogs : (rawLogs.logs ?? MOCK_EXPORTS);
  const rows = logs.length ? logs : MOCK_EXPORTS;

  const filtered = rows.filter(e =>
    !search || (e.reportName ?? e.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleReExport = async (e) => {
    const name   = e.reportName ?? e.name;
    const format = e.exportType ?? e.type ?? "CSV";
    const module = e.module ?? "Employee";
    setRerun(e.id ?? name);
    toast.show(`Re-generating ${name}…`, "info");
    try {
      const result = await generateReport(module, name);
      const dataRows = result?.rows ?? [];
      if (!dataRows.length) { toast.show("No data returned", "error"); return; }
      if (format === "PDF") {
        const h = Object.keys(dataRows[0]);
        const w = window.open("","_blank");
        w.document.write(`<!doctype html><title>${name}</title><style>body{font-family:Arial;padding:20px;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}th{background:#f1f5f9;font-weight:600}</style><h2>${name}</h2><table><thead><tr>${h.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${dataRows.map(r=>`<tr>${h.map(k=>`<td>${r[k]??""}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
        w.document.close(); w.print();
      } else {
        const h = Object.keys(dataRows[0]);
        const csv = [h.join(","), ...dataRows.map(r => h.map(k => `"${r[k]??""}" `).join(","))].join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
        a.download = `${name.replace(/\s+/g,"_")}.csv`;
        a.click();
      }
      await createExport.mutateAsync({ reportName: name, exportType: format });
      refetch();
      toast.show(`${name} downloaded`, "success");
    } catch { toast.show("Failed to re-export", "error"); }
    finally { setRerun(null); }
  };

  return (
    <Stack gap="md">
      <Group>
        <TextInput placeholder="Search exports…" leftSection={<IconSearch size={14} />} value={search} onChange={e => setSearch(e.target.value)} radius="md" w={240} />
        <Button variant="default" leftSection={<IconRefresh size={14} />} onClick={refetch}>Refresh</Button>
      </Group>
      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {["Report Name","Export Type","Requested By","Generated On","Status","Action"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr><Table.Td colSpan={6}><Center py="md"><Loader size="sm" /></Center></Table.Td></Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={6}>
                  <AppEmptyState icon={<IconFileExport size={22} />} message="No exports yet" sub="Export a report from the Report Library to see history here." />
                </Table.Td></Table.Tr>
              ) : filtered.map((e, i) => (
                <Table.Tr key={e.id ?? i}>
                  <Table.Td><Text size="sm" fw={600}>{e.reportName ?? e.name}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color="blue" size="sm">{e.exportType ?? e.type}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{e.requestedBy ?? e.by ?? "—"}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{e.createdAt ? new Date(e.createdAt).toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" }) : (e.at ?? "—")}</Text></Table.Td>
                  <Table.Td><Badge variant="dot" color="green" size="sm">{e.status ?? "Done"}</Badge></Table.Td>
                  <Table.Td>
                    <Tooltip label="Re-download">
                      <ActionIcon
                        size="sm" variant="light" color="blue"
                        loading={rerunning === (e.id ?? e.reportName ?? e.name)}
                        onClick={() => handleReExport(e)}
                      >
                        <IconDownload size={13} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────
function SettingsTab() {
  const toast = useToast();
  const { data: apiSettings } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const updateSettings = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const [settings, setSettings] = useState({
    defaultFormat: "Excel", timezone: "Asia/Kolkata", dateFormat: "DD/MM/YYYY",
    numberFormat: "1,00,000", currency: "INR", retentionDays: 90, maxRows: 10000,
  });

  // populate from API once loaded
  useState(() => {
    if (apiSettings) setSettings(s => ({ ...s, ...apiSettings }));
  });

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(settings);
      toast.show("Settings saved", "success");
    } catch { toast.show("Failed to save settings", "error"); }
  };

  return (
    <Stack gap="lg" maw={600}>
      <Text fw={700} size="lg">Report Settings</Text>
      <Paper withBorder p="lg" radius="lg">
        <Stack gap="md">
          <Select label="Default Export Format" data={["Excel","CSV","PDF"]} value={settings.defaultFormat} onChange={v => set("defaultFormat", v ?? "Excel")} radius="md" />
          <Select label="Timezone" data={["Asia/Kolkata","UTC","Asia/Dubai","America/New_York","Europe/London"]} value={settings.timezone} onChange={v => set("timezone", v ?? "Asia/Kolkata")} radius="md" />
          <Select label="Date Format" data={["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD","DD-MMM-YYYY"]} value={settings.dateFormat} onChange={v => set("dateFormat", v ?? "DD/MM/YYYY")} radius="md" />
          <Select label="Number Format" data={["1,00,000","1,000,000"]} value={settings.numberFormat} onChange={v => set("numberFormat", v ?? "1,00,000")} radius="md" />
          <Select label="Currency" data={["INR","USD","EUR","AED"]} value={settings.currency} onChange={v => set("currency", v ?? "INR")} radius="md" />
          <NumberInput label="Data Retention (Days)" value={settings.retentionDays} onChange={v => set("retentionDays", Number(v) || 90)} min={7} max={365} radius="md" />
          <NumberInput label="Maximum Rows Per Report" value={settings.maxRows} onChange={v => set("maxRows", Number(v) || 10000)} min={100} max={100000} step={1000} radius="md" />
        </Stack>
      </Paper>
      <Button onClick={handleSave} loading={updateSettings.isPending} leftSection={<IconCircleCheck size={14} />} w="fit-content">
        Save Settings
      </Button>
    </Stack>
  );
}
