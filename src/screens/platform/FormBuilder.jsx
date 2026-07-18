import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Tooltip,
  Paper, Grid, ThemeIcon, ScrollArea, Divider, Switch,
  Stepper, SegmentedControl, NumberInput, MultiSelect,
  Center, Checkbox, Radio,
} from "@mantine/core";
import {
  IconForms, IconPlus, IconSearch, IconPencil, IconTrash, IconEye,
  IconCopy, IconRocket, IconDownload, IconArchive, IconCheck,
  IconChartBar, IconClock,
  IconArrowUpRight, IconArrowDownRight,
  IconTemplate, IconSettings, IconList, IconHistory,
  IconUsers, IconCalendar,
  IconClipboard,
  IconDragDrop, IconDeviceDesktop, IconDeviceTablet,
  IconDeviceMobile, IconPhoto, IconSignature, IconToggleLeft,
  IconLetterCase, IconNumbers, IconCurrencyDollar, IconAt, IconPhone,
  IconCalendarEvent, IconAlignLeft, IconChevronDown, IconCheckbox,
  IconCircleDot, IconUpload, IconUser, IconBuilding, IconBriefcase,
  IconGripVertical, IconMinus, IconTextSize,
  IconTypography,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ["HR","IT","Finance","Travel","Assets","Payroll","Administration","Custom"];
const STATUSES   = ["Published","Draft","Archived"];
const STATUS_COLOR = { Published:"green", Draft:"orange", Archived:"gray" };

const FIELD_LIBRARY = [
  { group:"Text",      fields:[
    { type:"text",      label:"Single Line Text",    icon:IconLetterCase,      color:"blue"   },
    { type:"textarea",  label:"Multi Line Text",     icon:IconAlignLeft,       color:"blue"   },
    { type:"number",    label:"Number",              icon:IconNumbers,         color:"indigo" },
    { type:"currency",  label:"Currency",            icon:IconCurrencyDollar,  color:"green"  },
    { type:"email",     label:"Email",               icon:IconAt,              color:"teal"   },
    { type:"phone",     label:"Phone",               icon:IconPhone,           color:"cyan"   },
    { type:"richtext",  label:"Rich Text",           icon:IconTypography,      color:"violet" },
  ]},
  { group:"Date/Time", fields:[
    { type:"date",      label:"Date",                icon:IconCalendar,        color:"orange" },
    { type:"time",      label:"Time",                icon:IconClock,           color:"orange" },
    { type:"datetime",  label:"Date & Time",         icon:IconCalendarEvent,   color:"orange" },
  ]},
  { group:"Selection", fields:[
    { type:"dropdown",  label:"Dropdown",            icon:IconChevronDown,     color:"grape"  },
    { type:"multiselect",label:"Multi Select",       icon:IconList,            color:"grape"  },
    { type:"checkbox",  label:"Checkbox",            icon:IconCheckbox,        color:"teal"   },
    { type:"radio",     label:"Radio Button",        icon:IconCircleDot,       color:"teal"   },
    { type:"toggle",    label:"Toggle",              icon:IconToggleLeft,      color:"green"  },
  ]},
  { group:"Upload",    fields:[
    { type:"file",      label:"File Upload",         icon:IconUpload,          color:"red"    },
    { type:"image",     label:"Image Upload",        icon:IconPhoto,           color:"red"    },
    { type:"signature", label:"Signature",           icon:IconSignature,       color:"pink"   },
  ]},
  { group:"Lookup",    fields:[
    { type:"employee",  label:"Employee Lookup",     icon:IconUser,            color:"blue"   },
    { type:"department",label:"Department Lookup",   icon:IconBuilding,        color:"blue"   },
    { type:"designation",label:"Designation Lookup", icon:IconBriefcase,       color:"blue"   },
    { type:"manager",   label:"Manager Lookup",      icon:IconUsers,           color:"blue"   },
  ]},
  { group:"Layout",    fields:[
    { type:"heading",   label:"Heading",             icon:IconTextSize,        color:"gray"   },
    { type:"paragraph", label:"Paragraph",           icon:IconAlignLeft,       color:"gray"   },
    { type:"divider",   label:"Divider",             icon:IconMinus,           color:"gray"   },
  ]},
];

const ALL_FIELDS = FIELD_LIBRARY.flatMap(g => g.fields);

const FORM_COLORS = ["blue","green","violet","orange","teal","red","cyan","pink","grape","indigo"];
const FORM_ICONS  = ["📋","📝","📊","🗂️","✅","⚡","🔔","💼","🎯","📌"];

const MOCK_FORMS = [
  { id:1, name:"Leave Extension Request",   category:"HR",      createdBy:"Priya Nair",   responses:148, status:"Published", updatedAt:"2026-06-28", color:"blue",   icon:"📋" },
  { id:2, name:"Travel Expense Claim",      category:"Finance", createdBy:"Kavya Iyer",   responses:94,  status:"Published", updatedAt:"2026-06-26", color:"green",  icon:"✈️" },
  { id:3, name:"Asset Requisition",         category:"Assets",  createdBy:"Dev Nair",     responses:52,  status:"Published", updatedAt:"2026-06-24", color:"orange", icon:"💻" },
  { id:4, name:"IT Support Request",        category:"IT",      createdBy:"Arun Sharma",  responses:201, status:"Published", updatedAt:"2026-06-22", color:"violet", icon:"🔧" },
  { id:5, name:"Training Feedback Form",    category:"HR",      createdBy:"Meera Reddy",  responses:76,  status:"Published", updatedAt:"2026-06-20", color:"teal",   icon:"📝" },
  { id:6, name:"Payroll Discrepancy",       category:"Payroll", createdBy:"Raj Kumar",    responses:31,  status:"Published", updatedAt:"2026-06-18", color:"red",    icon:"💰" },
  { id:7, name:"New Employee Survey",       category:"HR",      createdBy:"Priya Nair",   responses:0,   status:"Draft",    updatedAt:"2026-06-15", color:"cyan",   icon:"🎯" },
  { id:8, name:"Vendor Onboarding Form",    category:"Administration", createdBy:"Admin", responses:0,   status:"Draft",    updatedAt:"2026-06-12", color:"grape",  icon:"📌" },
];

const MOCK_RESPONSES = [
  { id:"FR-2041", employee:"Asha Kumar",   form:"Leave Extension Request",  submitted:"2026-06-28 09:15", status:"Approved",  approver:"Priya Nair"  },
  { id:"FR-2040", employee:"Siva Raj",     form:"Travel Expense Claim",     submitted:"2026-06-28 08:00", status:"Pending",   approver:"—"           },
  { id:"FR-2039", employee:"Meera Iyer",   form:"IT Support Request",        submitted:"2026-06-27 14:20", status:"Approved",  approver:"Arun Sharma" },
  { id:"FR-2038", employee:"Dev Kumar",    form:"Asset Requisition",         submitted:"2026-06-27 11:00", status:"Rejected",  approver:"Dev Nair"    },
  { id:"FR-2037", employee:"Raj Sharma",   form:"Payroll Discrepancy",       submitted:"2026-06-26 09:30", status:"Under Review",approver:"Kavya Iyer" },
  { id:"FR-2036", employee:"Kavya Nair",   form:"Training Feedback Form",    submitted:"2026-06-25 10:00", status:"Approved",  approver:"Meera Reddy" },
];

const RESP_COLOR = { Approved:"green", Pending:"orange", Rejected:"red", "Under Review":"blue" };

const TEMPLATES = [
  { id:1, icon:"📋", color:"blue",   name:"Leave Application",       cat:"HR",      fields:8,  desc:"Standard leave request with type, date range, reason" },
  { id:2, icon:"✈️", color:"teal",   name:"Travel Request",           cat:"Travel",  fields:10, desc:"Travel booking + per diem + hotel request" },
  { id:3, icon:"💰", color:"green",  name:"Expense Reimbursement",    cat:"Finance", fields:9,  desc:"Expense claim with receipt upload and categories" },
  { id:4, icon:"💻", color:"violet", name:"IT Asset Request",         cat:"IT",      fields:7,  desc:"Hardware/software request with justification" },
  { id:5, icon:"🎯", color:"orange", name:"Performance Review",       cat:"HR",      fields:12, desc:"360-degree review with ratings and comments" },
  { id:6, icon:"🔔", color:"red",    name:"Grievance Form",           cat:"HR",      fields:6,  desc:"Confidential complaint and grievance submission" },
  { id:7, icon:"📌", color:"grape",  name:"New Employee Survey",      cat:"HR",      fields:15, desc:"Day-1 experience survey for all new joiners" },
  { id:8, icon:"🗂️", color:"indigo", name:"Exit Interview",          cat:"HR",      fields:10, desc:"Exit questionnaire covering all separation aspects" },
  { id:9, icon:"⚙️", color:"gray",   name:"Custom Blank",            cat:"Custom",  fields:0,  desc:"Start from scratch with a fully blank canvas" },
];

// ── Analytics mock ────────────────────────────────────────────────────────────

const MONTHLY_RESP = [
  { month:"Jan", responses:120 }, { month:"Feb", responses:145 },
  { month:"Mar", responses:98  }, { month:"Apr", responses:178 },
  { month:"May", responses:201 }, { month:"Jun", responses:167 },
];
const DAILY_TREND = [
  { day:"Mon", submissions:42 }, { day:"Tue", submissions:58 },
  { day:"Wed", submissions:51 }, { day:"Thu", submissions:67 },
  { day:"Fri", submissions:73 }, { day:"Sat", submissions:12 },
  { day:"Sun", submissions:8  },
];
const CAT_PIE = [
  { name:"HR",             value:40, color:"#228be6" },
  { name:"IT",             value:25, color:"#7950f2" },
  { name:"Finance",        value:18, color:"#40c057" },
  { name:"Travel",         value:10, color:"#fab005" },
  { name:"Other",          value:7,  color:"#94a3b8" },
];
const TOP_FORMS = [
  { name:"IT Support Request",    responses:201 },
  { name:"Leave Extension Req",   responses:148 },
  { name:"Training Feedback",     responses:76  },
  { name:"Travel Expense Claim",  responses:94  },
  { name:"Asset Requisition",     responses:52  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, change, icon: Icon, color }) {
  const up = change >= 0;
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={6}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing:"0.04em" }}>{label}</Text>
        <ThemeIcon size={32} radius={8} variant="light" color={color}><Icon size={16} /></ThemeIcon>
      </Group>
      <Text fw={800} size="xl" mb={2}>{value}</Text>
      {change !== undefined && (
        <Group gap={4}>
          {up ? <IconArrowUpRight size={13} color="var(--mantine-color-green-6)" /> : <IconArrowDownRight size={13} color="var(--mantine-color-red-6)" />}
          <Text size="xs" c={up?"green":"red"}>{Math.abs(change)}%</Text>
          <Text size="xs" c="dimmed">vs last month</Text>
        </Group>
      )}
    </Card>
  );
}

// ── 1. Dashboard ──────────────────────────────────────────────────────────────

function DashboardTab() {
  const { data: kpis } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const published = kpis?.published ?? MOCK_FORMS.filter(f => f.status==="Published").length;
  const draft     = kpis?.draft     ?? MOCK_FORMS.filter(f => f.status==="Draft").length;
  const total     = kpis?.total     ?? MOCK_FORMS.length;
  const totalResp = kpis?.totalResponses ?? MOCK_FORMS.reduce((s, f) => s + f.responses, 0);
  const todayResp = kpis?.todayResponses ?? 42;
  const pending   = kpis?.pending   ?? 14;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base:2, sm:4 }} spacing="md">
        <KpiCard label="Total Forms"       value={total}     change={12}  icon={IconForms}       color="blue"   />
        <KpiCard label="Published"         value={published} change={8}   icon={IconRocket}      color="green"  />
        <KpiCard label="Drafts"            value={draft}     change={-2}  icon={IconPencil}      color="orange" />
        <KpiCard label="Total Responses"   value={totalResp} change={21}  icon={IconClipboard}   color="violet" />
        <KpiCard label="Today's Responses" value={todayResp}          change={5}   icon={IconCalendar}    color="teal"   />
        <KpiCard label="Pending Approval"  value={pending}           change={-3}  icon={IconClock}       color="yellow" />
        <KpiCard label="Archived"          value={3}                 change={0}   icon={IconArchive}     color="gray"   />
        <KpiCard label="Active Templates"  value={TEMPLATES.length}  change={0}   icon={IconTemplate}    color="cyan"   />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base:12, md:8 }}>
          <Paper withBorder p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Monthly Responses</Text>
              <Badge variant="light" color="blue">Last 6 months</Badge>
            </Group>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MONTHLY_RESP}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
                <XAxis dataKey="month" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:11 }} />
                <RTooltip />
                <Area type="monotone" dataKey="responses" stroke="var(--mantine-color-blue-5)" fill="var(--mantine-color-blue-1)" name="Responses" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base:12, md:4 }}>
          <Paper withBorder p="lg" radius="lg" h="100%">
            <Text fw={600} mb="md">Forms by Category</Text>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={CAT_PIE} dataKey="value" outerRadius={65} innerRadius={30} paddingAngle={2}>
                  {CAT_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Stack gap={4} mt="xs">
              {CAT_PIE.map(c => (
                <Group key={c.name} justify="space-between">
                  <Group gap={6}><Box w={8} h={8} style={{ borderRadius:"50%", background:c.color }} /><Text size="xs">{c.name}</Text></Group>
                  <Text size="xs" c="dimmed">{c.value}%</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base:12, md:6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Daily Submission Trend</Text>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={DAILY_TREND} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
                <XAxis dataKey="day" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:11 }} />
                <RTooltip />
                <Bar dataKey="submissions" fill="var(--mantine-color-violet-5)" radius={[4,4,0,0]} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base:12, md:6 }}>
          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="sm">Most Used Forms</Text>
            <Stack gap="xs">
              {TOP_FORMS.map((f, i) => (
                <Group key={f.name} justify="space-between">
                  <Group gap={8}>
                    <Text size="xs" c="dimmed" w={16}>{i+1}.</Text>
                    <Text size="sm" lineClamp={1} style={{ maxWidth:200 }}>{f.name}</Text>
                  </Group>
                  <Badge size="xs" variant="light" color="blue">{f.responses}</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ── 2. My Forms (list) ────────────────────────────────────────────────────────

function MyFormsTab({ onCreate }) {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [catF,   setCatF]   = useState("");
  const [statF,  setStatF]  = useState("");
  const [viewForm, setViewForm] = useState(null);
  const { data: rawForms = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const forms = rawForms.length ? rawForms : MOCK_FORMS;
  const deleteMut    = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const publishMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const archiveMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const duplicateMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const filtered = forms.filter(f => {
    const q = search.toLowerCase();
    return (!q || f.name.toLowerCase().includes(q) || f.createdBy.toLowerCase().includes(q))
      && (!catF  || f.category === catF)
      && (!statF || f.status   === statF);
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <TextInput placeholder="Search forms…" leftSection={<IconSearch size={14} />}
            value={search} onChange={e => setSearch(e.currentTarget.value)} w={240} radius="md" />
          <Select placeholder="Category" data={CATEGORIES} value={catF} onChange={setCatF} clearable w={150} radius="md" />
          <Select placeholder="Status"   data={STATUSES}   value={statF} onChange={setStatF} clearable w={130} radius="md" />
        </Group>
        <Button leftSection={<IconPlus size={14} />} onClick={onCreate}>New Form</Button>
      </Group>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Form Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Created By</Table.Th>
                <Table.Th>Responses</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Last Updated</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(f => (
                <Table.Tr key={f.id}>
                  <Table.Td>
                    <Group gap={8}>
                      <Text size="lg">{f.icon}</Text>
                      <Text size="sm" fw={500}>{f.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="blue">{f.category}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{f.createdBy}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4}><IconClipboard size={12} color="var(--mantine-color-dimmed)" /><Text size="xs">{f.responses.toLocaleString()}</Text></Group>
                  </Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[f.status]} variant="light">{f.status}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{f.updatedAt}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={3} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => setViewForm(f)}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={onCreate}><IconPencil size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" loading={duplicateMut.isPending} onClick={() => duplicateMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" duplicated`, "success"), onError: () => show("Duplicate failed","error") })}><IconCopy size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" loading={publishMut.isPending} onClick={() => publishMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" published`, "success"), onError: () => show("Publish failed","error") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" loading={archiveMut.isPending} onClick={() => archiveMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" archived`, "info"), onError: () => show("Archive failed","error") })}><IconArchive size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" deleted`, "error"), onError: () => show("Delete failed","error") })}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {filtered.length === 0 && <AppEmptyState icon={<IconForms size={22} />} message="No forms found" sub="Try adjusting your filters or create a new form." py={40} />}
      </Paper>

      <Modal opened={!!viewForm} onClose={() => setViewForm(null)} title="Form Details" size="md" radius="lg">
        {viewForm && (
          <Stack gap="sm">
            <Group gap="sm">
              <Text size="2xl">{viewForm.icon}</Text>
              <Stack gap={2}><Text fw={700}>{viewForm.name}</Text><Text size="xs" c="dimmed">{viewForm.category}</Text></Stack>
            </Group>
            <Divider />
            {[["Status",viewForm.status],["Created By",viewForm.createdBy],["Responses",viewForm.responses.toLocaleString()],["Last Updated",viewForm.updatedAt]].map(([k,v]) => (
              <Group key={k} justify="space-between" py={4} style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                <Text size="sm" c="dimmed">{k}</Text>
                <Text size="sm" fw={500}>{v}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 3. Create Form (5-step wizard with canvas) ────────────────────────────────

function CreateFormTab() {
  const { show } = useToast();
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState({ name:"", description:"", category:"", icon:"📋", color:"blue" });
  const [canvasFields, setCanvas] = useState([
    { id:1, type:"text",     label:"Full Name",    required:true  },
    { id:2, type:"email",    label:"Email Address",required:true  },
    { id:3, type:"dropdown", label:"Department",   required:false },
    { id:4, type:"textarea", label:"Description",  required:false },
  ]);
  const [selectedFid, setFid]     = useState(null);
  const [preview, setPreview]     = useState("desktop");

  const f = k => v => setForm(p => ({ ...p, [k]:v }));
  const STEPS = ["Basic Info","Form Designer","Validation","Workflow","Preview & Publish"];

  const addField = (fieldType) => {
    const meta = ALL_FIELDS.find(x => x.type === fieldType);
    if (!meta) return;
    const newF = { id: Date.now(), type: fieldType, label: meta.label, required: false, placeholder: "" };
    setCanvas(prev => [...prev, newF]);
    setFid(newF.id);
  };

  const removeField = (id) => {
    setCanvas(prev => prev.filter(x => x.id !== id));
    if (selectedFid === id) setFid(null);
  };

  const selectedField = canvasFields.find(x => x.id === selectedFid);

  const createFormMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const handlePublish = () => {
    createFormMut.mutate({ ...form, status: "published", fields: canvasFields }, {
      onSuccess: () => {
        show(`"${form.name || "Form"}" published successfully`, "success");
        setStep(0);
        setForm({ name:"", description:"", category:"", icon:"📋", color:"blue" });
        setCanvas([]);
      },
      onError: () => show("Publish failed","error"),
    });
  };

  // Preview widths
  const PREVIEW_WIDTH = { desktop:"100%", tablet:"600px", mobile:"375px" };

  return (
    <Stack gap="md">
      <Stepper active={step} onStepClick={setStep} size="sm" mb="md" breakpoint="sm">
        {STEPS.map((s, i) => <Stepper.Step key={i} label={s} />)}
      </Stepper>

      {/* Step 0 – Basic Info */}
      {step === 0 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="lg">Basic Information</Text>
          <Grid>
            <Grid.Col span={{ base:12, md:7 }}>
              <Stack gap="sm">
                <TextInput label="Form Name *" placeholder="e.g. Leave Extension Request"
                  value={form.name} onChange={e => f("name")(e.target.value)} radius="md" />
                <Textarea label="Description" placeholder="What this form is used for…"
                  minRows={3} value={form.description} onChange={e => f("description")(e.target.value)} radius="md" />
                <Select label="Category *" data={CATEGORIES} value={form.category} onChange={f("category")} radius="md" />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base:12, md:5 }}>
              <Stack gap="sm">
                <Stack gap={6}>
                  <Text size="sm" fw={500}>Form Icon</Text>
                  <Group gap="xs" wrap="wrap">
                    {FORM_ICONS.map(ic => (
                      <Paper key={ic} withBorder p={8} radius="md" style={{ cursor:"pointer", fontSize:20,
                        border: form.icon===ic ? "2px solid var(--mantine-color-blue-5)" : undefined,
                        background: form.icon===ic ? "var(--mantine-color-blue-0)" : undefined,
                      }} onClick={() => f("icon")(ic)}>{ic}</Paper>
                    ))}
                  </Group>
                </Stack>
                <Stack gap={6}>
                  <Text size="sm" fw={500}>Form Color</Text>
                  <Group gap="xs" wrap="wrap">
                    {FORM_COLORS.map(c => (
                      <Box key={c} w={26} h={26} radius="xl" style={{ borderRadius:"50%", cursor:"pointer",
                        background:`var(--mantine-color-${c}-5)`,
                        outline: form.color===c ? `2.5px solid var(--mantine-color-${c}-7)` : "2px solid transparent",
                        outlineOffset: 2,
                      }} onClick={() => f("color")(c)} />
                    ))}
                  </Group>
                </Stack>
                {/* Preview chip */}
                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Group gap="sm">
                    <ThemeIcon size={40} radius={10} variant="light" color={form.color || "blue"}>
                      <Text size="xl">{form.icon}</Text>
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text size="sm" fw={600}>{form.name || "Form Name"}</Text>
                      <Text size="xs" c="dimmed">{form.category || "Category"}</Text>
                    </Stack>
                  </Group>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {/* Step 1 – Drag & Drop Designer */}
      {step === 1 && (
        <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
          <Group p="sm" style={{ borderBottom:"1px solid var(--mantine-color-default-border)", background:"var(--mantine-color-gray-0)" }} justify="space-between">
            <Group gap="xs">
              <Text size="sm" fw={600}>Form Designer</Text>
              <Badge size="xs" variant="light" color="blue">{canvasFields.length} fields</Badge>
            </Group>
            <Group gap="xs">
              <Badge size="xs" variant="outline">{form.name || "Untitled Form"}</Badge>
              <Button size="xs" variant="light" onClick={() => show("Preview opened","info")}>Preview</Button>
            </Group>
          </Group>

          <Group align="flex-start" gap={0} style={{ minHeight:440 }}>
            {/* Left – Field Library */}
            <ScrollArea style={{ width:200, borderRight:"1px solid var(--mantine-color-default-border)", height:440 }} p="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing:"0.06em" }}>Field Library</Text>
              {FIELD_LIBRARY.map(group => (
                <Box key={group.group} mb="sm">
                  <Text size="xs" fw={600} c="dimmed" mb={4}>{group.group}</Text>
                  <Stack gap={3}>
                    {group.fields.map(field => {
                      const Icon = field.icon;
                      return (
                        <Paper key={field.type} withBorder p={6} radius="sm" style={{ cursor:"pointer" }}
                          onClick={() => addField(field.type)}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--mantine-color-gray-0)"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}>
                          <Group gap={6} wrap="nowrap">
                            <ThemeIcon size={20} radius={4} variant="light" color={field.color}><Icon size={10} /></ThemeIcon>
                            <Text size="xs" lineClamp={1}>{field.label}</Text>
                          </Group>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </ScrollArea>

            {/* Center – Canvas */}
            <ScrollArea style={{ flex:1, height:440, background:"var(--mantine-color-gray-0)" }} p="md">
              {canvasFields.length === 0 ? (
                <Center h={350}>
                  <Stack align="center" gap="xs">
                    <ThemeIcon size={48} radius={12} variant="light" color="gray"><IconDragDrop size={24} /></ThemeIcon>
                    <Text size="sm" c="dimmed">Click a field from the library to add it here</Text>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="sm" maw={540} mx="auto">
                  {canvasFields.map((field, i) => {
                    const meta = ALL_FIELDS.find(x => x.type === field.type);
                    const Icon = meta?.icon || IconForms;
                    const sel  = selectedFid === field.id;
                    return (
                      <Paper key={field.id} withBorder p="sm" radius="md"
                        onClick={() => setFid(sel ? null : field.id)}
                        style={{
                          cursor:"pointer",
                          border: sel ? "1.5px solid var(--mantine-color-blue-5)" : undefined,
                          background: sel ? "var(--mantine-color-blue-0)" : "var(--mantine-color-default)",
                        }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap={8} wrap="nowrap">
                            <ActionIcon size="sm" variant="subtle" style={{ cursor:"grab" }} onClick={e => e.stopPropagation()}>
                              <IconGripVertical size={12} />
                            </ActionIcon>
                            <ThemeIcon size={22} radius={5} variant="light" color={meta?.color || "blue"}><Icon size={11} /></ThemeIcon>
                            <Stack gap={0}>
                              <Group gap={4}>
                                <Text size="sm" fw={500}>{field.label}</Text>
                                {field.required && <Badge size="xs" color="red" variant="filled" p="0 4px">*</Badge>}
                              </Group>
                              <Text size="xs" c="dimmed">{meta?.label}</Text>
                            </Stack>
                          </Group>
                          <Group gap={3} wrap="nowrap">
                            {sel && (
                              <>
                                <Tooltip label="Move up"><ActionIcon size="xs" variant="subtle" onClick={e => { e.stopPropagation(); setCanvas(p => { const a=[...p]; if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];} return a; }); }}><Text size={10}>↑</Text></ActionIcon></Tooltip>
                                <Tooltip label="Move down"><ActionIcon size="xs" variant="subtle" onClick={e => { e.stopPropagation(); setCanvas(p => { const a=[...p]; if(i<a.length-1){[a[i],a[i+1]]=[a[i+1],a[i]];} return a; }); }}><Text size={10}>↓</Text></ActionIcon></Tooltip>
                              </>
                            )}
                            <Tooltip label="Remove"><ActionIcon size="xs" variant="subtle" color="red" onClick={e => { e.stopPropagation(); removeField(field.id); }}><IconTrash size={11} /></ActionIcon></Tooltip>
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </ScrollArea>

            {/* Right – Field Properties */}
            <Box style={{ width:220, borderLeft:"1px solid var(--mantine-color-default-border)", height:440 }}>
              <ScrollArea h={440} p="sm">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" style={{ letterSpacing:"0.06em" }}>
                  {selectedField ? "Field Properties" : "Properties"}
                </Text>
                {selectedField ? (
                  <Stack gap="xs">
                    <TextInput size="xs" label="Field Label" defaultValue={selectedField.label} radius="sm" />
                    <TextInput size="xs" label="Placeholder" placeholder="Enter placeholder…" radius="sm" />
                    <TextInput size="xs" label="Help Text" placeholder="Help text shown below…" radius="sm" />
                    <TextInput size="xs" label="Default Value" placeholder="Default…" radius="sm" />
                    <Divider label="Validation" labelPosition="center" />
                    <Switch size="xs" label="Required" defaultChecked={selectedField.required} />
                    <Switch size="xs" label="Read Only" />
                    <Switch size="xs" label="Hidden" />
                    {(selectedField.type==="text"||selectedField.type==="textarea") && (
                      <>
                        <NumberInput size="xs" label="Min Length" placeholder="0" radius="sm" min={0} />
                        <NumberInput size="xs" label="Max Length" placeholder="255" radius="sm" min={1} />
                        <TextInput  size="xs" label="Regex Pattern" placeholder="^[a-z]+$" radius="sm" />
                      </>
                    )}
                    <Divider label="Visibility" labelPosition="center" />
                    <Select size="xs" label="Show when" data={["Always","Field equals","Field not empty","Custom Rule"]} defaultValue="Always" radius="sm" />
                  </Stack>
                ) : (
                  <Text size="xs" c="dimmed">Click a field on the canvas to configure its properties.</Text>
                )}
              </ScrollArea>
            </Box>
          </Group>
        </Paper>
      )}

      {/* Step 2 – Validation Rules */}
      {step === 2 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Validation Rules</Text>
          <Text c="dimmed" size="sm" mb="lg">Set validation, conditional visibility, and field rules across the form.</Text>
          <Stack gap="sm">
            {canvasFields.filter(x => !["heading","paragraph","divider"].includes(x.type)).map(field => {
              const meta = ALL_FIELDS.find(x => x.type === field.type);
              const Icon = meta?.icon || IconForms;
              return (
                <Paper key={field.id} withBorder p="md" radius="md">
                  <Group justify="space-between" wrap="wrap" gap="sm">
                    <Group gap="xs">
                      <ThemeIcon size={22} radius={5} variant="light" color={meta?.color||"blue"}><Icon size={11} /></ThemeIcon>
                      <Text size="sm" fw={500}>{field.label}</Text>
                      <Badge size="xs" variant="outline">{meta?.label}</Badge>
                    </Group>
                    <Group gap="sm" wrap="wrap">
                      <Switch size="xs" label="Required" defaultChecked={field.required} />
                      <Switch size="xs" label="Read Only" />
                      <Switch size="xs" label="Hidden" />
                      <Switch size="xs" label="Conditional" />
                    </Group>
                  </Group>
                </Paper>
              );
            })}
            {canvasFields.filter(x => !["heading","paragraph","divider"].includes(x.type)).length === 0 && (
              <AppEmptyState icon={<IconForms size={22} />} message="No fields to configure" sub="Add fields in the Form Designer step first." py={40} />
            )}
          </Stack>
        </Paper>
      )}

      {/* Step 3 – Workflow */}
      {step === 3 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Workflow Configuration</Text>
          <Text c="dimmed" size="sm" mb="lg">Set up approval workflow and notification rules for this form.</Text>
          <Grid>
            <Grid.Col span={{ base:12, md:6 }}>
              <Stack gap="sm">
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between" mb="sm"><Text fw={600} size="sm">Approval Settings</Text><Switch size="sm" defaultChecked label="Require Approval" /></Group>
                  <Stack gap="xs">
                    <Select size="sm" label="Level 1 Approver" data={["Reporting Manager","Department Head","HR Admin","Custom User"]} defaultValue="Reporting Manager" radius="md" />
                    <Select size="sm" label="Level 2 Approver" data={["None","HR Admin","Finance Head","Super Admin"]} defaultValue="None" radius="md" />
                    <Switch size="xs" label="Parallel Approval" />
                    <Switch size="xs" label="Auto Approve after 3 days" />
                  </Stack>
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Text fw={600} size="sm" mb="sm">Auto Actions</Text>
                  <Stack gap="xs">
                    <Switch size="xs" label="Auto Assign to HR" />
                    <Switch size="xs" label="Auto Close after 30 days" />
                    <Switch size="xs" label="Send to Workflow Engine" />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base:12, md:6 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Text fw={600} size="sm" mb="sm">Notification Rules</Text>
                <Stack gap="xs">
                  {[
                    { event:"On Submit",       channels:["Email","In-App"] },
                    { event:"On Approve",      channels:["Email","SMS"] },
                    { event:"On Reject",       channels:["Email"] },
                    { event:"On Pending",      channels:["Email","In-App"] },
                    { event:"Escalation",      channels:["Email","Teams"] },
                  ].map(ev => (
                    <Group key={ev.event} justify="space-between" wrap="wrap" gap={4}>
                      <Text size="xs">{ev.event}</Text>
                      <Group gap={4}>
                        {ev.channels.map(c => <Badge key={c} size="xs" variant="light" color="blue">{c}</Badge>)}
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {/* Step 4 – Preview & Publish */}
      {step === 4 && (
        <Paper withBorder p="xl" radius="lg">
          <Text fw={700} size="lg" mb="xs">Preview & Publish</Text>
          <Grid>
            <Grid.Col span={{ base:12, md:8 }}>
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text fw={600} size="sm">Form Preview</Text>
                  <SegmentedControl size="xs" value={preview} onChange={setPreview}
                    data={[
                      { label:<Group gap={4} wrap="nowrap"><IconDeviceDesktop size={13} /><Text size="xs">Desktop</Text></Group>, value:"desktop" },
                      { label:<Group gap={4} wrap="nowrap"><IconDeviceTablet  size={13} /><Text size="xs">Tablet</Text></Group>,  value:"tablet"  },
                      { label:<Group gap={4} wrap="nowrap"><IconDeviceMobile  size={13} /><Text size="xs">Mobile</Text></Group>,  value:"mobile"  },
                    ]} />
                </Group>
                <Group justify="center">
                  <Paper withBorder p="lg" radius="lg"
                    style={{ width:PREVIEW_WIDTH[preview], maxWidth:"100%", transition:"width 0.2s", background:"var(--mantine-color-default)" }}>
                    {/* Form header */}
                    <Group gap="sm" mb="lg">
                      <ThemeIcon size={40} radius={10} variant="light" color={form.color || "blue"}>
                        <Text size="xl">{form.icon}</Text>
                      </ThemeIcon>
                      <Stack gap={2}>
                        <Text fw={700}>{form.name || "Untitled Form"}</Text>
                        <Text size="xs" c="dimmed">{form.description || "No description"}</Text>
                      </Stack>
                    </Group>
                    <Divider mb="md" />
                    {/* Render fields */}
                    <Stack gap="sm">
                      {canvasFields.map(field => {
                        const meta = ALL_FIELDS.find(x => x.type === field.type);
                        if (field.type === "divider")   return <Divider key={field.id} />;
                        if (field.type === "heading")   return <Text key={field.id} fw={700} size="lg">{field.label}</Text>;
                        if (field.type === "paragraph") return <Text key={field.id} size="sm" c="dimmed">{field.label}</Text>;
                        if (field.type === "textarea")  return <Textarea key={field.id} label={field.label} placeholder={`Enter ${field.label.toLowerCase()}…`} minRows={3} radius="md" readOnly />;
                        if (field.type === "dropdown")  return <Select key={field.id} label={field.label} placeholder={`Select ${field.label.toLowerCase()}…`} data={["Option 1","Option 2"]} radius="md" readOnly />;
                        if (field.type === "checkbox")  return <Checkbox key={field.id} label={field.label} readOnly />;
                        if (field.type === "radio")     return <Radio key={field.id} label={field.label} readOnly />;
                        if (field.type === "toggle")    return <Switch key={field.id} label={field.label} readOnly />;
                        if (field.type === "signature") return <Paper key={field.id} withBorder p="md" radius="md" style={{ minHeight:60, background:"var(--mantine-color-gray-0)" }}><Text size="xs" c="dimmed">Signature field — {field.label}</Text></Paper>;
                        if (["file","image"].includes(field.type)) return <Paper key={field.id} withBorder p="md" radius="md" style={{ minHeight:50, background:"var(--mantine-color-gray-0)" }}><Text size="xs" c="dimmed">{field.label} — upload area</Text></Paper>;
                        return <TextInput key={field.id} label={field.label} placeholder={`Enter ${field.label.toLowerCase()}…`}
                          type={field.type === "email" ? "email" : field.type === "number" || field.type === "currency" ? "number" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
                          required={field.required} radius="md" readOnly />;
                      })}
                    </Stack>
                    {canvasFields.length > 0 && (
                      <Group mt="lg" justify="flex-end" gap="sm">
                        <Button variant="default" size="sm">Cancel</Button>
                        <Button size="sm">Submit</Button>
                      </Group>
                    )}
                  </Paper>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base:12, md:4 }}>
              <Stack gap="sm">
                <Paper withBorder p="md" radius="md">
                  <Text fw={600} size="sm" mb="sm">Form Summary</Text>
                  <Stack gap="xs">
                    {[["Name",form.name||"—"],["Category",form.category||"—"],["Fields",canvasFields.length],["Required Fields",canvasFields.filter(x=>x.required).length],["Color",form.color||"—"]].map(([k,v]) => (
                      <Group key={k} justify="space-between" py={3} style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                        <Text size="xs" c="dimmed">{k}</Text>
                        <Text size="xs" fw={500}>{v}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
                <Paper withBorder p="md" radius="md" style={{ background:"var(--mantine-color-green-0)", border:"1.5px solid var(--mantine-color-green-3)" }}>
                  <Group gap="xs" mb={4}><IconCheck size={15} color="var(--mantine-color-green-6)" /><Text size="sm" fw={600} c="green">Ready to Publish</Text></Group>
                  <Text size="xs" c="dimmed">This form will be active and available to users immediately after publishing.</Text>
                </Paper>
                <Button fullWidth size="md" leftSection={<IconRocket size={16} />} color="green" loading={createFormMut.isPending} onClick={handlePublish}>Publish Form</Button>
                <Button fullWidth variant="outline" loading={createFormMut.isPending} onClick={() => createFormMut.mutate({ ...form, status: "draft", fields: canvasFields }, { onSuccess: () => show("Saved as draft","success"), onError: () => show("Failed","error") })}>Save as Draft</Button>
                <Button fullWidth variant="default" onClick={() => { setStep(0); setForm({ name:"", description:"", category:"", icon:"📋", color:"blue" }); setCanvas([]); }}>Cancel</Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      <Group justify="space-between" mt="md">
        <Button variant="default" disabled={step===0} onClick={() => setStep(s => s-1)}>Back</Button>
        {step < 4 && <Button disabled={step===0 && !form.name.trim()} onClick={() => setStep(s => s+1)}>Next</Button>}
      </Group>
    </Stack>
  );
}

// ── 4. Templates ──────────────────────────────────────────────────────────────

function FormTemplatesTab({ onCreate }) {
  const { show } = useToast();
  const [viewTpl, setViewTpl] = useState(null);
  const [catF,    setCatF]    = useState("All");
  const cats = ["All", ...CATEGORIES];
  const filtered = TEMPLATES.filter(t => catF === "All" || t.cat === catF);

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        {cats.map(c => (
          <Button key={c} size="xs" variant={catF===c?"filled":"default"} onClick={() => setCatF(c)}>{c}</Button>
        ))}
      </Group>
      <SimpleGrid cols={{ base:1, sm:2, md:3 }} spacing="md">
        {filtered.map(t => (
          <Paper key={t.id} withBorder p="lg" radius="lg">
            <Group gap="xs" mb="xs">
              <Text size="2xl">{t.icon}</Text>
              <Stack gap={2}>
                <Text fw={700} size="sm">{t.name}</Text>
                <Badge size="xs" variant="light" color="blue">{t.cat}</Badge>
              </Stack>
            </Group>
            <Text size="xs" c="dimmed" mb="sm">{t.desc}</Text>
            {t.fields > 0 && <Badge size="xs" variant="outline" mb="md">{t.fields} fields</Badge>}
            <Group gap="xs">
              <Button size="xs" variant="light" leftSection={<IconEye size={11} />} onClick={() => setViewTpl(t)}>Preview</Button>
              <Button size="xs" color={t.color} leftSection={<IconPlus size={11} />}
                onClick={() => { onCreate(); show(`"${t.name}" template loaded`, "success"); }}>Use</Button>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Modal opened={!!viewTpl} onClose={() => setViewTpl(null)} title={`Template: ${viewTpl?.name||""}`} size="sm" radius="lg">
        {viewTpl && (
          <Stack gap="sm">
            <Group gap="xs"><Text size="2xl">{viewTpl.icon}</Text><Stack gap={2}><Text fw={700}>{viewTpl.name}</Text><Text size="xs" c="dimmed">{viewTpl.desc}</Text></Stack></Group>
            <Divider />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Typical Fields ({viewTpl.fields})</Text>
            {["Employee Name","Email","Department","Date","Description","Attachments"].slice(0, Math.min(viewTpl.fields, 6)).map((n,i) => (
              <Group key={i} gap="xs"><IconCheck size={13} color="var(--mantine-color-green-6)" /><Text size="sm">{n}</Text></Group>
            ))}
            <Button fullWidth mt="sm" onClick={() => { setViewTpl(null); onCreate(); show(`"${viewTpl.name}" loaded`,"success"); }}>Use This Template</Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 5/6. Published / Draft filtered list ─────────────────────────────────────

function FilteredFormsTab({ status, emptyMsg, onCreate }) {
  const { show } = useToast();
  const [editForm, setEditForm] = useState(null);
  const list = MOCK_FORMS.filter(f => f.status === status);
  const deleteMut    = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const publishMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const archiveMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const duplicateMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Form Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Created By</Table.Th>
              {status === "Published" && <Table.Th>Responses</Table.Th>}
              <Table.Th>Last Updated</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {list.map(f => (
              <Table.Tr key={f.id}>
                <Table.Td><Group gap={8}><Text>{f.icon}</Text><Text size="sm" fw={500}>{f.name}</Text></Group></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color="blue">{f.category}</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{f.createdBy}</Text></Table.Td>
                {status === "Published" && <Table.Td><Text size="xs">{f.responses.toLocaleString()}</Text></Table.Td>}
                <Table.Td><Text size="xs" c="dimmed">{f.updatedAt}</Text></Table.Td>
                <Table.Td>
                  <Group gap={3}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => setEditForm(f)}><IconPencil size={13} /></ActionIcon></Tooltip>
                    <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" loading={duplicateMut.isPending} onClick={() => duplicateMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" duplicated`, "success"), onError: () => show("Duplicate failed","error") })}><IconCopy size={13} /></ActionIcon></Tooltip>
                    {status === "Draft"
                      ? <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" loading={publishMut.isPending} onClick={() => publishMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" published`, "success"), onError: () => show("Publish failed","error") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      : <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" loading={archiveMut.isPending} onClick={() => archiveMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" archived`, "info"), onError: () => show("Archive failed","error") })}><IconArchive size={13} /></ActionIcon></Tooltip>}
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(f.id, { onSuccess: () => show(`"${f.name}" deleted`, "success"), onError: () => show("Delete failed","error") })}><IconTrash size={13} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {list.length === 0 && <AppEmptyState icon={<IconForms size={22} />} message={emptyMsg} py={40} />}
      </Paper>

      <Modal opened={!!editForm} onClose={() => setEditForm(null)} title="Edit Form" size="sm" radius="lg">
        {editForm && (
          <Stack gap="sm">
            <TextInput label="Form Name" defaultValue={editForm.name} radius="md" />
            <Select label="Category" data={CATEGORIES} defaultValue={editForm.category} radius="md" />
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setEditForm(null)}>Cancel</Button>
              <Button onClick={() => { setEditForm(null); show("Form updated","success"); }}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 7. Form Responses ─────────────────────────────────────────────────────────

function FormResponsesTab() {
  const { show } = useToast();
  const [viewResp, setViewResp] = useState(null);
  const [respTab,  setRespTab]  = useState("overview");
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("");
  const [deptF,   setDeptF]     = useState("");
  const { data: rawResponses = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const responses = rawResponses.length ? rawResponses : MOCK_RESPONSES;
  const filtered = responses.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.id?.toLowerCase().includes(q) || r.employee?.toLowerCase().includes(q) || r.form?.toLowerCase().includes(q))
      && (!statusF || r.status === statusF)
      && (!deptF || r.department === deptF);
  });

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search by ID, employee, form…" leftSection={<IconSearch size={14} />} w={280} radius="md" value={search} onChange={e => setSearch(e.currentTarget.value)} />
        <Select placeholder="Status"     data={["Approved","Pending","Rejected","Under Review"]} clearable w={150} radius="md" value={statusF} onChange={setStatusF} />
        <Select placeholder="Department" data={["Engineering","HR","Finance","Operations"]}      clearable w={160} radius="md" value={deptF} onChange={setDeptF} />
      </Group>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Response ID</Table.Th>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Form</Table.Th>
                <Table.Th>Submitted On</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Approver</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(r => (
                <Table.Tr key={r.id}>
                  <Table.Td><Text size="xs" ff="monospace" fw={600}>{r.id}</Text></Table.Td>
                  <Table.Td><Text size="sm">{r.employee}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500} lineClamp={1}>{r.form}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{r.submitted}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={RESP_COLOR[r.status]} variant="light">{r.status}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{r.approver}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={3}>
                      <Tooltip label="View Details"><ActionIcon size="sm" variant="subtle" onClick={() => { setViewResp(r); setRespTab("overview"); }}><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Download"><ActionIcon size="sm" variant="subtle" onClick={() => show("Downloading response...","info")}><IconDownload size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Approve"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => { Promise.resolve({ data: {} }).then(() => show("Approved","success")).catch(() => show("Approve failed","error")); }}><IconCheck size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={!!viewResp} onClose={() => setViewResp(null)} title={`Response: ${viewResp?.id||""}`} size="lg" radius="lg">
        {viewResp && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Stack gap={2}><Text fw={700}>{viewResp.form}</Text><Text size="xs" c="dimmed">{viewResp.employee} · {viewResp.submitted}</Text></Stack>
              <Badge color={RESP_COLOR[viewResp.status]} variant="light">{viewResp.status}</Badge>
            </Group>
            <Tabs value={respTab} onChange={setRespTab}>
              <Tabs.List mb="sm">
                {["overview","attachments","approvals","comments","timeline","audit"].map(t => (
                  <Tabs.Tab key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</Tabs.Tab>
                ))}
              </Tabs.List>
              <Tabs.Panel value="overview">
                <Stack gap="xs">
                  {[["Response ID",viewResp.id],["Employee",viewResp.employee],["Form",viewResp.form],["Submitted",viewResp.submitted],["Approver",viewResp.approver]].map(([k,v]) => (
                    <Group key={k} justify="space-between" py={4} style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                      <Text size="sm" c="dimmed">{k}</Text><Text size="sm" fw={500}>{v}</Text>
                    </Group>
                  ))}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="attachments"><AppEmptyState icon={<IconUpload size={20} />} message="No attachments" py={40} /></Tabs.Panel>
              <Tabs.Panel value="approvals">
                <Stack gap="xs">
                  {[
                    { level:"Level 1", approver:"Reporting Manager", status:"Approved", time:"2026-06-28 10:00" },
                    { level:"Level 2", approver:"HR Admin",           status:viewResp.status==="Pending"?"Pending":"Approved", time:viewResp.status==="Pending"?"—":"2026-06-28 11:30" },
                  ].map(a => (
                    <Group key={a.level} justify="space-between">
                      <Group gap="xs"><Badge size="xs" variant="light" color="blue">{a.level}</Badge><Text size="sm">{a.approver}</Text></Group>
                      <Group gap="xs"><Badge size="xs" color={a.status==="Approved"?"green":a.status==="Pending"?"orange":"red"} variant="light">{a.status}</Badge><Text size="xs" c="dimmed">{a.time}</Text></Group>
                    </Group>
                  ))}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="comments"><AppEmptyState icon={<IconClipboard size={20} />} message="No comments yet" py={40} /></Tabs.Panel>
              <Tabs.Panel value="timeline">
                <Stack gap="xs">
                  {["Submitted","Notified Manager","Manager Approved","Sent to HR","Completed"].map((ev, i) => (
                    <Group key={ev} gap="sm">
                      <ThemeIcon size={22} radius="xl" variant="light" color={i<3?"green":"gray"}>{i<3?<IconCheck size={11}/>:<IconClock size={11}/>}</ThemeIcon>
                      <Text size="sm">{ev}</Text>
                    </Group>
                  ))}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="audit">
                <Stack gap="xs">
                  {[["Submitted","Asha Kumar","2026-06-28 09:15"],["Viewed","Priya Nair","2026-06-28 09:30"],["Approved","Priya Nair","2026-06-28 10:00"]].map(([ev,by,t]) => (
                    <Group key={ev+t} justify="space-between">
                      <Group gap="xs"><IconHistory size={12} /><Text size="sm">{ev}</Text></Group>
                      <Group gap="xs"><Text size="xs" c="dimmed">{by}</Text><Text size="xs" c="dimmed">{t}</Text></Group>
                    </Group>
                  ))}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ── 8. Settings ───────────────────────────────────────────────────────────────

function FormSettingsTab() {
  const { show } = useToast();
  const saveSettingsMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [categories, setCategories] = useState([...CATEGORIES]);
  const [newCat, setNewCat] = useState("");
  return (
    <Stack gap="md" maw={640}>
      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Default Approval</Text>
        <Stack gap="sm">
          <Select label="Default Approver" data={["Reporting Manager","Department Head","HR Admin","Super Admin"]} defaultValue="Reporting Manager" radius="md" />
          <Switch label="Require approval for all forms by default" defaultChecked />
          <Switch label="Send reminder after 2 days of no action" defaultChecked />
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Default Notifications</Text>
        <Stack gap="sm">
          <MultiSelect label="On Submission" data={["Email","SMS","Push Notification","In-App","Teams","Slack"]} defaultValue={["Email","In-App"]} radius="md" />
          <MultiSelect label="On Approval"   data={["Email","SMS","Push Notification","In-App","Teams","Slack"]} defaultValue={["Email"]}           radius="md" />
          <MultiSelect label="On Rejection"  data={["Email","SMS","Push Notification","In-App","Teams","Slack"]} defaultValue={["Email","SMS"]}      radius="md" />
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Retention Policy</Text>
        <Stack gap="sm">
          <Select label="Delete responses after" data={["30 Days","90 Days","180 Days","1 Year","2 Years","Never"]} defaultValue="1 Year" radius="md" />
          <Select label="Archive forms after"    data={["6 Months","1 Year","2 Years","Never"]}                     defaultValue="1 Year" radius="md" />
          <Switch label="Auto-archive closed forms" defaultChecked />
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Form Number Format</Text>
        <Stack gap="sm">
          <TextInput label="Prefix"       placeholder="FR-"       defaultValue="FR-"  radius="md" />
          <TextInput label="Starting No." placeholder="1000"      defaultValue="1000" radius="md" />
          <Select    label="Format"       data={["FR-0001","FORM-2026-0001","Custom"]} defaultValue="FR-0001" radius="md" />
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} mb="md">Custom Categories</Text>
        <Group gap="xs" mb="sm" wrap="wrap">
          {categories.map(c => <Badge key={c} size="sm" variant="light" color="blue" style={{ cursor:"pointer" }} onClick={() => setCategories(prev => prev.filter(x => x !== c))}>{c} ×</Badge>)}
        </Group>
        <Group gap="sm">
          <TextInput placeholder="New category…" radius="md" style={{ flex:1 }} value={newCat} onChange={e => setNewCat(e.currentTarget.value)} />
          <Button size="sm" variant="light" leftSection={<IconPlus size={13} />} disabled={!newCat.trim()} onClick={() => { if (newCat.trim() && !categories.includes(newCat.trim())) { setCategories(prev => [...prev, newCat.trim()]); setNewCat(""); } }}>Add</Button>
        </Group>
      </Paper>

      <Button w={160} loading={saveSettingsMut.isPending} onClick={() => saveSettingsMut.mutate({ categories }, { onSuccess: () => show("Settings saved","success"), onError: () => show("Failed","error") })}>Save Settings</Button>
    </Stack>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function FormBuilder({ darkMode }) {
  const [tab, setTab] = useState("dashboard");
  const goCreate = () => setTab("create");

  return (
    <Box>
      <AppPageHeader
        title="No-Code Form Builder"
        sub="Create, publish, and track custom forms across all HRPLUSE modules — no code required"
        action={<Button leftSection={<IconPlus size={14} />} onClick={goCreate}>New Form</Button>}
      />

      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List mb="md" style={{ flexWrap:"wrap" }}>
          <Tabs.Tab value="dashboard"  leftSection={<IconChartBar   size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="forms"      leftSection={<IconList       size={14} />}>My Forms</Tabs.Tab>
          <Tabs.Tab value="templates"  leftSection={<IconTemplate   size={14} />}>Templates</Tabs.Tab>
          <Tabs.Tab value="create"     leftSection={<IconPlus       size={14} />}>Create Form</Tabs.Tab>
          <Tabs.Tab value="published"  leftSection={<IconRocket     size={14} />}>Published</Tabs.Tab>
          <Tabs.Tab value="drafts"     leftSection={<IconPencil     size={14} />}>Drafts</Tabs.Tab>
          <Tabs.Tab value="responses"  leftSection={<IconClipboard  size={14} />}>Responses</Tabs.Tab>
          <Tabs.Tab value="settings"   leftSection={<IconSettings   size={14} />}>Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"> <DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="forms">     <MyFormsTab onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="templates"> <FormTemplatesTab onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="create">    <CreateFormTab /></Tabs.Panel>
        <Tabs.Panel value="published"> <FilteredFormsTab status="Published" emptyMsg="No published forms" onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="drafts">    <FilteredFormsTab status="Draft"     emptyMsg="No draft forms"     onCreate={goCreate} /></Tabs.Panel>
        <Tabs.Panel value="responses"> <FormResponsesTab /></Tabs.Panel>
        <Tabs.Panel value="settings">  <FormSettingsTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
