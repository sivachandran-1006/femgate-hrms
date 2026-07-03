import { useState } from "react";
import {
  Box, Stack, Group, Paper, Text, Badge, Button, ActionIcon, TextInput,
  Select, Tabs, SimpleGrid, Table, Modal, Textarea, ScrollArea,
  ThemeIcon, Progress, Divider, Tooltip, SegmentedControl, Switch,
  Accordion, NumberInput, Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useToast } from "../../components/ui/Toast";
import {
  IconFileText, IconPlus, IconCategory, IconVariable, IconHistory,
  IconFile, IconSettings, IconEye, IconEdit, IconCopy, IconRocket,
  IconArchive, IconTrash, IconSearch, IconChartBar, IconCheck, IconX,
  IconArrowLeft, IconArrowRight, IconDownload, IconPrinter,
  IconMail, IconShare, IconBold, IconItalic, IconUnderline,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconLink,
  IconPhoto, IconTable, IconDeviceDesktop, IconDeviceTablet,
  IconDeviceMobile, IconLayoutList, IconPdf, IconRefresh,
  IconClock, IconFileCheck, IconAlertTriangle, IconBuilding,
  IconUser, IconBriefcase, IconCalendar, IconCurrencyRupee,
} from "@tabler/icons-react";
import {
  useLTDashboard, useLetterTemplates, useLTCategories, useLTVariables,
  useGeneratedDocuments, useLTSettings,
  useCreateLetterTemplate, useUpdateLetterTemplate, useDeleteLetterTemplate,
  useDuplicateLetterTemplate, usePublishLetterTemplate, useArchiveLetterTemplate,
  useGenerateDocument, useUpdateLTSettings,
} from "../../queries/useLetterTemplate";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_DASHBOARD = {
  total: 32, published: 21, drafts: 8, generated: 1284,
  usedToday: 47, pendingApproval: 3, archived: 5, mostUsed: "Offer Letter",
  byCategory: [
    { name: "Offer Letter", count: 245 }, { name: "Experience Letter", count: 198 },
    { name: "Appointment", count: 156 },  { name: "Relieving Letter", count: 134 },
    { name: "Salary Revision", count: 89 },{ name: "Warning Letter", count: 62 },
  ],
  monthly: [
    { month: "Jan", count: 88 }, { month: "Feb", count: 102 },
    { month: "Mar", count: 95 }, { month: "Apr", count: 118 },
    { month: "May", count: 134 },{ month: "Jun", count: 147 },
  ],
};

const MOCK_TEMPLATES = [
  { id: 1, name: "Offer Letter",         category: "Recruitment",   version: "v3.0", status: "Published", createdBy: "HR Admin",  updatedOn: "2026-06-20" },
  { id: 2, name: "Appointment Letter",   category: "Onboarding",    version: "v2.1", status: "Published", createdBy: "HR Admin",  updatedOn: "2026-06-15" },
  { id: 3, name: "Experience Letter",    category: "Exit",          version: "v1.5", status: "Published", createdBy: "HR Admin",  updatedOn: "2026-06-10" },
  { id: 4, name: "Salary Revision",      category: "Compensation",  version: "v2.0", status: "Published", createdBy: "Finance",   updatedOn: "2026-06-05" },
  { id: 5, name: "Warning Letter",       category: "Disciplinary",  version: "v1.2", status: "Published", createdBy: "HR Admin",  updatedOn: "2026-05-28" },
  { id: 6, name: "Transfer Letter",      category: "Operations",    version: "v1.0", status: "Draft",     createdBy: "HR Exec",   updatedOn: "2026-05-20" },
  { id: 7, name: "Promotion Letter",     category: "Career",        version: "v1.1", status: "Draft",     createdBy: "HR Admin",  updatedOn: "2026-05-15" },
  { id: 8, name: "Relieving Letter",     category: "Exit",          version: "v2.2", status: "Published", createdBy: "HR Admin",  updatedOn: "2026-05-10" },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Offer Letter",          count: 2 }, { id: 2, name: "Appointment Letter", count: 1 },
  { id: 3, name: "Confirmation Letter",   count: 1 }, { id: 4, name: "Promotion Letter",   count: 2 },
  { id: 5, name: "Transfer Letter",       count: 1 }, { id: 6, name: "Salary Revision",    count: 2 },
  { id: 7, name: "Warning Letter",        count: 1 }, { id: 8, name: "Appreciation Letter",count: 1 },
  { id: 9, name: "Experience Letter",     count: 2 }, { id: 10, name: "Relieving Letter",  count: 2 },
  { id: 11, name: "NOC Certificate",      count: 1 }, { id: 12, name: "Training Certificate", count: 1 },
];

const VARIABLE_GROUPS = {
  Employee:    ["{{employee.name}}", "{{employee.id}}", "{{employee.department}}", "{{employee.designation}}", "{{employee.joiningDate}}", "{{employee.manager}}", "{{employee.branch}}", "{{employee.location}}", "{{employee.salary}}", "{{employee.email}}", "{{employee.phone}}"],
  Company:     ["{{company.name}}", "{{company.address}}", "{{company.logo}}", "{{company.website}}", "{{company.supportEmail}}"],
  Policy:      ["{{doc.date}}", "{{doc.time}}", "{{doc.number}}", "{{doc.generatedBy}}", "{{doc.approvalDate}}"],
  Payroll:     ["{{payroll.grossSalary}}", "{{payroll.netSalary}}", "{{payroll.ctc}}", "{{payroll.deductions}}"],
  Attendance:  ["{{attendance.present}}", "{{attendance.absent}}", "{{attendance.leaveDays}}"],
  Leave:       ["{{leave.type}}", "{{leave.startDate}}", "{{leave.endDate}}", "{{leave.days}}"],
  Performance: ["{{performance.rating}}", "{{performance.year}}", "{{performance.reviewer}}"],
};

const MOCK_GENERATED = [
  { id: "DOC-2026-001", employee: "Ravi Kumar",    template: "Offer Letter",    generatedBy: "HR Admin",  date: "2026-06-30", status: "Active"   },
  { id: "DOC-2026-002", employee: "Priya Sharma",  template: "Appointment",     generatedBy: "HR Admin",  date: "2026-06-29", status: "Active"   },
  { id: "DOC-2026-003", employee: "Arjun Nair",    template: "Experience Letter",generatedBy: "HR Exec",  date: "2026-06-28", status: "Archived" },
  { id: "DOC-2026-004", employee: "Sneha Patel",   template: "Salary Revision", generatedBy: "Finance",   date: "2026-06-27", status: "Active"   },
  { id: "DOC-2026-005", employee: "Kiran Raj",     template: "Warning Letter",  generatedBy: "HR Admin",  date: "2026-06-26", status: "Active"   },
];

const STATUS_COLOR = { Published: "green", Draft: "yellow", Archived: "gray" };
const DOC_STATUS_COLOR = { Active: "green", Archived: "gray", Revoked: "red" };

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color = "blue", sub }) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Group gap="md">
        <ThemeIcon size={48} radius="lg" color={color} variant="light">
          <Icon size={22} />
        </ThemeIcon>
        <Stack gap={2} style={{ flex: 1 }}>
          <Text size="xs" c="dimmed" fw={500}>{label}</Text>
          <Text fw={800} size="xl">{value}</Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
      </Group>
    </Paper>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: raw } = useLTDashboard();
  const d = raw ?? MOCK_DASHBOARD;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KpiCard icon={IconFileText}    label="Total Templates"      value={d.total}           color="blue"   />
        <KpiCard icon={IconRocket}      label="Published"            value={d.published}       color="green"  />
        <KpiCard icon={IconFile}        label="Drafts"               value={d.drafts}          color="yellow" />
        <KpiCard icon={IconFileCheck}   label="Generated Documents"  value={d.generated}       color="violet" />
        <KpiCard icon={IconClock}       label="Used Today"           value={d.usedToday}       color="cyan"   />
        <KpiCard icon={IconAlertTriangle} label="Pending Approval"   value={d.pendingApproval} color="orange" />
        <KpiCard icon={IconArchive}     label="Archived"             value={d.archived}        color="gray"   />
        <KpiCard icon={IconFileText}    label="Most Used"            value={d.mostUsed}        color="pink"   sub="Template" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder radius="lg" p="lg">
          <Text fw={700} mb="md">Templates by Category</Text>
          <Stack gap={8}>
            {d.byCategory?.map(c => {
              const max = Math.max(...(d.byCategory?.map(x => x.count) ?? [1]));
              return (
                <Group key={c.name} gap="sm">
                  <Text size="xs" c="dimmed" style={{ minWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</Text>
                  <Box style={{ flex: 1 }}><Progress value={(c.count / max) * 100} color="blue" radius="xl" size="md" /></Box>
                  <Text size="xs" fw={600} w={36} ta="right">{c.count}</Text>
                </Group>
              );
            })}
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p="lg">
          <Text fw={700} mb="md">Monthly Generated Letters</Text>
          <Stack gap={8}>
            {d.monthly?.map(m => {
              const max = Math.max(...(d.monthly?.map(x => x.count) ?? [1]));
              return (
                <Group key={m.month} gap="sm">
                  <Text size="xs" c="dimmed" w={32}>{m.month}</Text>
                  <Box style={{ flex: 1 }}><Progress value={(m.count / max) * 100} color="violet" radius="xl" size="md" /></Box>
                  <Text size="xs" fw={600} w={36} ta="right">{m.count}</Text>
                </Group>
              );
            })}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

// ── Template Library ──────────────────────────────────────────────────────────
function TemplateLibraryTab({ onEdit, onGenerate }) {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [catF, setCatF]     = useState("");
  const [statusF, setStatusF] = useState("");
  const [delId, setDelId]   = useState(null);

  const { data: raw = [] } = useLetterTemplates({ search: search || undefined, category: catF || undefined, status: statusF || undefined });
  const templates = raw.length ? raw : MOCK_TEMPLATES;

  const dupMut  = useDuplicateLetterTemplate();
  const pubMut  = usePublishLetterTemplate();
  const archMut = useArchiveLetterTemplate();
  const delMut  = useDeleteLetterTemplate();

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search templates…" leftSection={<IconSearch size={15} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <Select placeholder="Category" data={["Recruitment","Onboarding","Exit","Compensation","Disciplinary","Operations","Career"]} value={catF} onChange={setCatF} clearable w={160} />
        <Select placeholder="Status"   data={["Published","Draft","Archived"]} value={statusF} onChange={setStatusF} clearable w={130} />
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {["Template Name","Category","Version","Status","Created By","Updated On","Actions"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {templates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
                <Table.Tr key={t.id}>
                  <Table.Td><Text size="sm" fw={600}>{t.name}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color="blue" size="sm">{t.category}</Badge></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{t.version}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[t.status]} size="sm">{t.status}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{t.createdBy}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{t.updatedOn}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => onEdit(t)}><IconEdit size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Duplicate"><ActionIcon size="sm" variant="subtle" loading={dupMut.isPending} onClick={() => dupMut.mutate(t.id, { onSuccess: () => show(`"${t.name}" duplicated`), onError: () => show("Failed","error") })}><IconCopy size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" loading={pubMut.isPending} onClick={() => pubMut.mutate(t.id, { onSuccess: () => show(`Published`), onError: () => show("Failed","error") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" loading={archMut.isPending} onClick={() => archMut.mutate(t.id, { onSuccess: () => show("Archived","info"), onError: () => show("Failed","error") })}><IconArchive size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Generate Document"><ActionIcon size="sm" variant="subtle" color="violet" onClick={() => onGenerate(t)}><IconFileCheck size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(t.id)}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Delete Template?" centered radius="lg" size="sm">
        <Text size="sm" c="dimmed" mb="lg">This cannot be undone. All generated documents using this template will remain.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={delMut.isPending} onClick={() => delMut.mutate(delId, { onSuccess: () => { show("Deleted","error"); setDelId(null); }, onError: () => show("Failed","error") })}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ── Create Template (7-step wizard) ──────────────────────────────────────────
function CreateTemplateTab({ editTemplate, onDone }) {
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name:         editTemplate?.name     ?? "",
    description:  "",
    category:     editTemplate?.category ?? "",
    docType:      "Letter",
    department:   "",
    version:      "v1.0",
    status:       "Draft",
    bodyHtml:     `<p>Dear {{employee.name}},</p>\n<p>We are pleased to inform you that...</p>\n<p>Regards,<br/>HR Department<br/>{{company.name}}</p>`,
    watermark:    "",
    pageNumbers:  true,
    previewDevice:"desktop",
    selectedConditions: [],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const createMut = useCreateLetterTemplate();
  const updateMut = useUpdateLetterTemplate();

  const STEPS = ["Basic Info", "Designer", "Variables", "Conditions", "Approval", "Preview", "Publish"];

  const handleSave = (publish = false) => {
    const payload = { ...form, status: publish ? "Published" : "Draft" };
    const mut = editTemplate ? updateMut : createMut;
    const data = editTemplate ? { id: editTemplate.id, ...payload } : payload;
    mut.mutate(data, {
      onSuccess: () => { show(publish ? "Template published!" : "Draft saved!"); onDone(); },
      onError:   () => show("Save failed", "error"),
    });
  };

  return (
    <Stack gap="lg">
      {/* Progress stepper */}
      <Paper withBorder radius="lg" p="md">
        <Group gap={0} wrap="nowrap">
          {STEPS.map((s, i) => (
            <Box key={s} style={{ flex: 1, textAlign: "center" }}>
              <Stack gap={4} align="center">
                <Box
                  onClick={() => setStep(i)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < step ? "var(--mantine-color-green-6)" : i === step ? "var(--mantine-color-violet-6)" : "var(--mantine-color-gray-2)",
                  }}
                >
                  {i < step
                    ? <IconCheck size={14} color="white" />
                    : <Text size="xs" fw={700} c={i === step ? "white" : "dimmed"}>{i + 1}</Text>
                  }
                </Box>
                <Text size="xs" fw={i === step ? 700 : 400} c={i === step ? "violet" : "dimmed"}>{s}</Text>
              </Stack>
            </Box>
          ))}
        </Group>
      </Paper>

      {/* Step 0 — Basic Info */}
      {step === 0 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Basic Information</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput label="Template Name" placeholder="e.g. Offer Letter" value={form.name} onChange={e => set("name", e.target.value)} required />
            <Select label="Category" data={["Offer Letter","Appointment Letter","Confirmation Letter","Promotion Letter","Transfer Letter","Salary Revision","Warning Letter","Experience Letter","Relieving Letter","NOC","Training Certificate","Custom"]} value={form.category} onChange={v => set("category", v)} />
            <Select label="Document Type" data={["Letter","Certificate","Notice","Agreement","Policy","Other"]} value={form.docType} onChange={v => set("docType", v)} />
            <Select label="Department" data={["All Departments","HR","Finance","Engineering","Sales","Operations","Marketing"]} value={form.department} onChange={v => set("department", v)} />
            <TextInput label="Version" value={form.version} onChange={e => set("version", e.target.value)} />
            <Select label="Status" data={["Draft","Published"]} value={form.status} onChange={v => set("status", v)} />
          </SimpleGrid>
          <Textarea label="Description" placeholder="What is this template for?" value={form.description} onChange={e => set("description", e.target.value)} mt="md" minRows={3} />
        </Paper>
      )}

      {/* Step 1 — Template Designer */}
      {step === 1 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Template Designer</Text>

          {/* Toolbar */}
          <Paper withBorder radius="md" p="xs" mb="md" bg="gray.0">
            <Group gap="xs" wrap="wrap">
              {[IconBold, IconItalic, IconUnderline].map((Icon, i) => (
                <ActionIcon key={i} variant="subtle" size="sm"><Icon size={14} /></ActionIcon>
              ))}
              <Divider orientation="vertical" />
              {[IconAlignLeft, IconAlignCenter, IconAlignRight].map((Icon, i) => (
                <ActionIcon key={i} variant="subtle" size="sm"><Icon size={14} /></ActionIcon>
              ))}
              <Divider orientation="vertical" />
              {[
                { Icon: IconLink,  label: "Link"       },
                { Icon: IconPhoto, label: "Image"      },
                { Icon: IconTable, label: "Table"      },
              ].map(b => (
                <Button key={b.label} variant="subtle" size="xs" leftSection={<b.Icon size={12} />}>{b.label}</Button>
              ))}
            </Group>
          </Paper>

          {/* Page preview */}
          <Box style={{ display: "flex", gap: 16 }}>
            {/* Blocks panel */}
            <Stack gap="xs" style={{ minWidth: 140 }}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">Blocks</Text>
              {[
                { icon: IconBuilding,       label: "Header"     },
                { icon: IconFileText,       label: "Body"       },
                { icon: IconAlignLeft,      label: "Footer"     },
                { icon: IconPhoto,          label: "Logo"       },
                { icon: IconLayoutList,     label: "Signature"  },
                { icon: IconCheck,          label: "QR Code"    },
                { icon: IconTable,          label: "Table"      },
              ].map(b => (
                <Paper key={b.label} withBorder radius="sm" p="xs" style={{ cursor: "pointer" }}>
                  <Group gap="xs">
                    <b.icon size={13} />
                    <Text size="xs">{b.label}</Text>
                  </Group>
                </Paper>
              ))}
            </Stack>

            {/* A4 canvas */}
            <Box style={{ flex: 1 }}>
              <Paper
                withBorder radius="md" p={0}
                style={{ minHeight: 520, background: "white", position: "relative", overflow: "hidden" }}
              >
                {form.watermark && (
                  <Text
                    size="xl" fw={900} c="gray.2"
                    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: 48, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}
                  >
                    {form.watermark}
                  </Text>
                )}
                <Stack gap={0}>
                  {/* Header */}
                  <Box p="md" style={{ borderBottom: "2px solid var(--mantine-color-violet-5)" }}>
                    <Group justify="space-between">
                      <Stack gap={2}>
                        <Text fw={800} size="md">{company.name}</Text>
                        <Text size="xs" c="dimmed">{company.address}</Text>
                      </Stack>
                      <Box style={{ width: 60, height: 40, background: "var(--mantine-color-gray-2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Text size="xs" c="dimmed">LOGO</Text>
                      </Box>
                    </Group>
                  </Box>
                  {/* Body */}
                  <Box p="xl">
                    <Text size="xs" c="dimmed" mb="sm">{"Ref: DOC-2026-XXX | Date: {{doc.date}}"}</Text>
                    <Text fw={700} size="sm" mb="md">{"To,\n{{employee.name}}\n{{employee.designation}}\n{{employee.department}}"}</Text>
                    <Textarea
                      value={form.bodyHtml}
                      onChange={e => set("bodyHtml", e.target.value)}
                      minRows={8}
                      styles={{ input: { fontFamily: "serif", fontSize: 13, lineHeight: 1.8 } }}
                    />
                  </Box>
                  {/* Footer */}
                  <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Authorized Signatory</Text>
                      {form.pageNumbers && <Text size="xs" c="dimmed">Page 1 of 1</Text>}
                    </Group>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Page settings */}
            <Stack gap="xs" style={{ minWidth: 160 }}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">Page Settings</Text>
              <Select label="Paper Size" data={["A4","Letter","Legal"]} defaultValue="A4" size="xs" />
              <Select label="Font" data={["Arial","Times New Roman","Calibri","Georgia"]} defaultValue="Arial" size="xs" />
              <Group justify="space-between">
                <Text size="xs">Page Numbers</Text>
                <Switch size="xs" checked={form.pageNumbers} onChange={e => set("pageNumbers", e.currentTarget.checked)} />
              </Group>
              <TextInput label="Watermark" placeholder="CONFIDENTIAL" size="xs" value={form.watermark} onChange={e => set("watermark", e.target.value)} />
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Step 2 — Variable Library */}
      {step === 2 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Variable Library</Text>
          <Text size="sm" c="dimmed" mb="lg">Click any variable to copy it. Paste into the template body to insert dynamic values.</Text>
          <Accordion multiple variant="separated" radius="md">
            {Object.entries(VARIABLE_GROUPS).map(([group, vars]) => (
              <Accordion.Item key={group} value={group}>
                <Accordion.Control icon={<IconVariable size={16} />}>
                  <Text fw={600}>{group}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                    {vars.map(v => (
                      <Paper
                        key={v} withBorder radius="md" p="sm"
                        style={{ cursor: "pointer" }}
                        onClick={() => { navigator.clipboard?.writeText(v); show("Copied!", "info"); }}
                      >
                        <Group gap="xs" wrap="nowrap">
                          <IconCopy size={12} color="var(--mantine-color-violet-5)" />
                          <Text size="xs" style={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</Text>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}

      {/* Step 3 — Conditions */}
      {step === 3 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Conditional Sections</Text>
          <Text size="sm" c="dimmed" mb="lg">Show or hide sections of the template based on employee attributes.</Text>
          <Stack gap="md">
            {[
              { label: "Show probation clause if",     field: "employmentType", condition: "equals", value: "Probation"       },
              { label: "Show relocation allowance if", field: "location",       condition: "not_equals", value: "Head Office" },
            ].map((c, i) => (
              <Paper key={i} withBorder radius="md" p="md">
                <Group gap="sm" wrap="wrap">
                  <Text size="sm" fw={600} style={{ minWidth: 200 }}>{c.label}</Text>
                  <Select data={["department","designation","employmentType","salaryBand","location","customField"]} defaultValue={c.field} size="xs" w={150} />
                  <Select data={["equals","not_equals","contains","greater_than","less_than"]} defaultValue={c.condition} size="xs" w={130} />
                  <TextInput defaultValue={c.value} size="xs" w={120} />
                  <ActionIcon variant="subtle" color="red" size="sm"><IconTrash size={13} /></ActionIcon>
                </Group>
              </Paper>
            ))}
            <Button variant="light" size="xs" leftSection={<IconPlus size={13} />} w="fit-content">Add Condition</Button>
          </Stack>
        </Paper>
      )}

      {/* Step 4 — Approval Workflow */}
      {step === 4 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Approval Workflow</Text>
          <Group gap="md" wrap="wrap" mb="xl">
            {["Draft","Review","Approve","Publish","Reject","Archive"].map((s, i) => (
              <Paper key={s} withBorder radius="lg" p="md" style={{ minWidth: 120, textAlign: "center" }}>
                <Stack gap="xs" align="center">
                  <ThemeIcon size={36} radius="xl" color={i < 3 ? "violet" : i === 3 ? "green" : "red"} variant="light">
                    {i === 4 ? <IconX size={16} /> : i === 5 ? <IconArchive size={16} /> : <IconCheck size={16} />}
                  </ThemeIcon>
                  <Text size="sm" fw={600}>{s}</Text>
                </Stack>
              </Paper>
            ))}
          </Group>
          <Paper withBorder radius="md" p="md" bg="blue.0">
            <Group gap="sm">
              <IconCheck size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">Templates require HR Admin approval before publishing to employees.</Text>
            </Group>
          </Paper>
        </Paper>
      )}

      {/* Step 5 — Preview */}
      {step === 5 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Preview</Text>
          <Group gap="md" mb="lg">
            <SegmentedControl
              value={form.previewDevice}
              onChange={v => set("previewDevice", v)}
              data={[
                { label: <Group gap={4}><IconDeviceDesktop size={14} /><span>Desktop</span></Group>, value: "desktop" },
                { label: <Group gap={4}><IconDeviceTablet size={14} /><span>Tablet</span></Group>,  value: "tablet"  },
                { label: <Group gap={4}><IconDeviceMobile size={14} /><span>Mobile</span></Group>,  value: "mobile"  },
                { label: <Group gap={4}><IconPdf size={14} /><span>PDF</span></Group>,              value: "pdf"     },
                { label: <Group gap={4}><IconPrinter size={14} /><span>Print</span></Group>,        value: "print"   },
              ]}
            />
          </Group>
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <Paper
              withBorder radius="lg"
              style={{
                width: form.previewDevice === "desktop" ? "100%" : form.previewDevice === "tablet" ? 600 : form.previewDevice === "mobile" ? 375 : "100%",
                maxWidth: "100%", transition: "width .3s",
                background: form.previewDevice === "pdf" ? "#f8f9fa" : "white",
              }}
            >
              <Stack gap={0}>
                <Box p="lg" style={{ borderBottom: "2px solid var(--mantine-color-violet-5)" }}>
                  <Group justify="space-between">
                    <Stack gap={2}>
                      <Text fw={800}>MGate Technologies</Text>
                      <Text size="xs" c="dimmed">123 Business Park, Mumbai 400001</Text>
                    </Stack>
                    <Box style={{ width: 60, height: 40, background: "var(--mantine-color-gray-2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Text size="xs" c="dimmed">LOGO</Text>
                    </Box>
                  </Group>
                </Box>
                <Box p="xl">
                  <Text size="xs" c="dimmed" mb="sm">Ref: DOC-2026-001 | Date: 2026-07-01</Text>
                  <Text fw={700} size="sm" mb="md">To,<br />John Doe<br />Software Engineer<br />Engineering</Text>
                  <Text size="sm" style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                    {form.bodyHtml
                      .replace("{{employee.name}}", "John Doe")
                      .replace("{{company.name}}", "MGate Technologies")}
                  </Text>
                </Box>
                <Box p="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Authorized Signatory</Text>
                    <Text size="xs" c="dimmed">Page 1 of 1</Text>
                  </Group>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Paper>
      )}

      {/* Step 6 — Publish */}
      {step === 6 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Review & Publish</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
            {[
              ["Template Name", form.name         || "(not set)"],
              ["Category",      form.category     || "(not set)"],
              ["Document Type", form.docType                    ],
              ["Department",    form.department   || "All"      ],
              ["Version",       form.version                    ],
              ["Status",        form.status                     ],
            ].map(([k, v]) => (
              <Paper key={k} withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" fw={600}>{k}</Text>
                <Text size="sm" fw={600} mt={2}>{v}</Text>
              </Paper>
            ))}
          </SimpleGrid>
          <Group gap="sm">
            <Button variant="default" loading={createMut.isPending || updateMut.isPending} onClick={() => handleSave(false)}>Save Draft</Button>
            <Button color="violet" leftSection={<IconRocket size={15} />} loading={createMut.isPending || updateMut.isPending} onClick={() => handleSave(true)}>Publish Template</Button>
            <Button variant="subtle" onClick={onDone}>Cancel</Button>
          </Group>
        </Paper>
      )}

      {/* Nav */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconArrowLeft size={14} />} disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Previous</Button>
        {step < STEPS.length - 1 && (
          <Button rightSection={<IconArrowRight size={14} />} color="violet" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>Next</Button>
        )}
      </Group>
    </Stack>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoriesTab() {
  const { show } = useToast();
  const { data: raw = [] } = useLTCategories();
  const cats = raw.length ? raw : MOCK_CATEGORIES;
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={15} />} onClick={open}>Add Category</Button>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        {cats.map(c => (
          <Paper key={c.id} withBorder radius="lg" p="lg">
            <Group justify="space-between">
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</Text>
                <Text size="xs" c="dimmed">{c.count} templates</Text>
              </Stack>
              <ThemeIcon size={36} radius="md" color="violet" variant="light"><IconCategory size={18} /></ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
      <Modal opened={opened} onClose={close} title="Add Category" centered radius="lg" size="sm">
        <Stack gap="sm">
          <TextInput label="Category Name" value={name} onChange={e => setName(e.target.value)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={() => { show("Category added!"); setName(""); close(); }}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Generated Documents ───────────────────────────────────────────────────────
function GeneratedDocumentsTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const { data: raw = [] } = useGeneratedDocuments();
  const docs = raw.length ? raw : MOCK_GENERATED;

  return (
    <Stack gap="md">
      <TextInput placeholder="Search by employee or template…" leftSection={<IconSearch size={15} />} value={search} onChange={e => setSearch(e.target.value)} maw={360} />
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {["Document #","Employee","Template","Generated By","Date","Status","Actions"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {docs.filter(d => !search || d.employee.toLowerCase().includes(search.toLowerCase()) || d.template.toLowerCase().includes(search.toLowerCase())).map(d => (
                <Table.Tr key={d.id}>
                  <Table.Td><Text size="xs" fw={600} style={{ fontFamily: "monospace" }}>{d.id}</Text></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Avatar size={28} radius="xl" color="violet">{d.employee[0]}</Avatar>
                      <Text size="sm">{d.employee}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text size="sm">{d.template}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{d.generatedBy}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{d.date}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={DOC_STATUS_COLOR[d.status]} size="sm">{d.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle"><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Download PDF"><ActionIcon size="sm" variant="subtle" color="blue"><IconDownload size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Print"><ActionIcon size="sm" variant="subtle" color="gray"><IconPrinter size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Email"><ActionIcon size="sm" variant="subtle" color="violet" onClick={() => show("Email sent!", "info")}><IconMail size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange"><IconArchive size={13} /></ActionIcon></Tooltip>
                    </Group>
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

// ── Draft / Published ─────────────────────────────────────────────────────────
function FilteredTemplatesTab({ status, onEdit }) {
  const { data: raw = [] } = useLetterTemplates({ status });
  const templates = (raw.length ? raw : MOCK_TEMPLATES).filter(t => t.status === status);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {templates.map(t => (
        <Paper key={t.id} withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="sm">
            <Badge variant="light" color={STATUS_COLOR[t.status]} size="sm">{t.status}</Badge>
            <Text size="xs" c="dimmed">{t.version}</Text>
          </Group>
          <Text fw={700} mb={4}>{t.name}</Text>
          <Text size="xs" c="dimmed" mb="md">{t.category} · {t.updatedOn}</Text>
          <Group gap="xs">
            <Button size="xs" variant="light" color="violet" leftSection={<IconEdit size={12} />} onClick={() => onEdit(t)}>Edit</Button>
            <Button size="xs" variant="subtle" leftSection={<IconEye size={12} />}>Preview</Button>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

// ── Version History ───────────────────────────────────────────────────────────
function VersionHistoryTab() {
  const VERSIONS = [
    { version: "v3.0", createdBy: "HR Admin",  created: "2026-06-20", published: "2026-06-21", status: "Current"  },
    { version: "v2.1", createdBy: "HR Admin",  created: "2026-04-10", published: "2026-04-11", status: "Archived" },
    { version: "v2.0", createdBy: "HR Exec",   created: "2026-02-05", published: "2026-02-06", status: "Archived" },
    { version: "v1.0", createdBy: "HR Admin",  created: "2025-11-01", published: "2025-11-02", status: "Archived" },
  ];

  return (
    <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {["Version","Created By","Created Date","Published Date","Status","Actions"].map(h => (
                <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {VERSIONS.map(v => (
              <Table.Tr key={v.version}>
                <Table.Td><Badge variant="light" color="violet" size="sm">{v.version}</Badge></Table.Td>
                <Table.Td><Text size="sm">{v.createdBy}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{v.created}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{v.published}</Text></Table.Td>
                <Table.Td><Badge variant="dot" color={v.status === "Current" ? "green" : "gray"} size="sm">{v.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Button size="xs" variant="light" color="violet" leftSection={<IconRefresh size={12} />} disabled={v.status === "Current"}>Restore</Button>
                    <Button size="xs" variant="subtle" leftSection={<IconEye size={12} />}>Compare</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsTab() {
  const { show } = useToast();
  const { data: raw } = useLTSettings();
  const updateMut = useUpdateLTSettings();
  const [settings, setSettings] = useState({
    paperSize: "A4", font: "Arial", marginTop: 25, marginBottom: 25,
    marginLeft: 30, marginRight: 30, pageNumbers: true,
    watermark: "", signature: true,
    docNumberFormat: "DOC-{YEAR}-{SEQ}",
    retentionYears: 7,
  });
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  return (
    <Stack gap="lg" maw={640}>
      <Paper withBorder radius="lg" p="xl">
        <Text fw={700} mb="lg">Document Defaults</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select label="Default Paper Size" data={["A4","Letter","Legal"]} value={settings.paperSize} onChange={v => set("paperSize", v)} />
          <Select label="Default Font" data={["Arial","Times New Roman","Calibri","Georgia","Helvetica"]} value={settings.font} onChange={v => set("font", v)} />
          <NumberInput label="Margin Top (mm)" value={settings.marginTop} onChange={v => set("marginTop", v)} min={10} max={50} />
          <NumberInput label="Margin Bottom (mm)" value={settings.marginBottom} onChange={v => set("marginBottom", v)} min={10} max={50} />
          <NumberInput label="Margin Left (mm)" value={settings.marginLeft} onChange={v => set("marginLeft", v)} min={15} max={50} />
          <NumberInput label="Margin Right (mm)" value={settings.marginRight} onChange={v => set("marginRight", v)} min={15} max={50} />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="lg" p="xl">
        <Text fw={700} mb="lg">Document Features</Text>
        <Stack gap="md">
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm" fw={500}>Page Numbers</Text>
              <Text size="xs" c="dimmed">Auto-insert page numbers in footer</Text>
            </Stack>
            <Switch checked={settings.pageNumbers} onChange={e => set("pageNumbers", e.currentTarget.checked)} />
          </Group>
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm" fw={500}>Digital Signature</Text>
              <Text size="xs" c="dimmed">Include signature block</Text>
            </Stack>
            <Switch checked={settings.signature} onChange={e => set("signature", e.currentTarget.checked)} />
          </Group>
          <TextInput label="Watermark Text" placeholder="e.g. CONFIDENTIAL" value={settings.watermark} onChange={e => set("watermark", e.target.value)} />
          <TextInput label="Document Number Format" value={settings.docNumberFormat} onChange={e => set("docNumberFormat", e.target.value)} description="Use {YEAR}, {MONTH}, {SEQ} as placeholders" />
          <NumberInput label="Retention Period (years)" value={settings.retentionYears} onChange={v => set("retentionYears", v)} min={1} max={30} />
        </Stack>
      </Paper>

      <Button
        leftSection={<IconCheck size={15} />}
        color="violet"
        loading={updateMut.isPending}
        onClick={() => updateMut.mutate(settings, {
          onSuccess: () => show("Settings saved!"),
          onError:   () => show("Save failed", "error"),
        })}
        w="fit-content"
      >
        Save Settings
      </Button>
    </Stack>
  );
}

// ── Generate Document Modal ───────────────────────────────────────────────────
function GenerateDocModal({ template, opened, onClose }) {
  const { show } = useToast();
  const generateMut = useGenerateDocument();
  const [employeeId, setEmployeeId] = useState("");

  return (
    <Modal opened={opened} onClose={onClose} title={`Generate: ${template?.name ?? ""}`} centered radius="lg" size="md">
      <Stack gap="sm">
        <Paper withBorder radius="md" p="md" bg="violet.0">
          <Group gap="sm">
            <IconFileCheck size={16} color="var(--mantine-color-violet-6)" />
            <Text size="sm">This will generate a PDF document with the employee's data merged in.</Text>
          </Group>
        </Paper>
        <TextInput label="Employee ID or Name" placeholder="Search employee…" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
        <Select label="Document Date" data={["Today (2026-07-01)"]} defaultValue="Today (2026-07-01)" />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            color="violet" leftSection={<IconFileCheck size={14} />}
            loading={generateMut.isPending}
            onClick={() => generateMut.mutate({ id: template?.id, employeeId }, {
              onSuccess: () => { show("Document generated!"); onClose(); },
              onError:   () => show("Generation failed", "error"),
            })}
          >
            Generate PDF
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LetterTemplateBuilder({ darkMode }) {
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [editTemplate, setEditTemplate] = useState(null);
  const [genTemplate, setGenTemplate]   = useState(null);
  const [genOpened, { open: openGen, close: closeGen }] = useDisclosure(false);

  const TABS = [
    { value: "dashboard",  label: "Dashboard",          icon: IconChartBar  },
    { value: "library",    label: "Template Library",   icon: IconFileText  },
    { value: "create",     label: "Create Template",    icon: IconPlus      },
    { value: "categories", label: "Categories",         icon: IconCategory  },
    { value: "variables",  label: "Variable Library",   icon: IconVariable  },
    { value: "generated",  label: "Generated Documents",icon: IconFileCheck },
    { value: "drafts",     label: "Draft Templates",    icon: IconFile      },
    { value: "published",  label: "Published",          icon: IconRocket    },
    { value: "versions",   label: "Version History",    icon: IconHistory   },
    { value: "settings",   label: "Settings",           icon: IconSettings  },
  ];

  const handleEdit = (t) => { setEditTemplate(t); setActiveTab("create"); };
  const handleDone = () => { setEditTemplate(null); setActiveTab("library"); };
  const handleGenerate = (t) => { setGenTemplate(t); openGen(); };

  return (
    <Stack gap="lg" p="xl">
      {/* Header */}
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Group gap="sm">
            <ThemeIcon size={40} radius="lg" color="violet" variant="light"><IconFileText size={20} /></ThemeIcon>
            <Text fw={800} size="xl">Letter Template Builder</Text>
          </Group>
          <Text size="sm" c="dimmed">Create and manage dynamic HR document templates</Text>
        </Stack>
        <Button color="violet" leftSection={<IconPlus size={15} />} onClick={() => { setEditTemplate(null); setActiveTab("create"); }}>
          New Template
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
        <ScrollArea type="never">
          <Tabs.List mb="lg" style={{ flexWrap: "nowrap" }}>
            {TABS.map(t => (
              <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={14} />}>{t.label}</Tabs.Tab>
            ))}
          </Tabs.List>
        </ScrollArea>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="library"><TemplateLibraryTab onEdit={handleEdit} onGenerate={handleGenerate} /></Tabs.Panel>
        <Tabs.Panel value="create"><CreateTemplateTab editTemplate={editTemplate} onDone={handleDone} /></Tabs.Panel>
        <Tabs.Panel value="categories"><CategoriesTab /></Tabs.Panel>
        <Tabs.Panel value="variables">
          <Stack gap="md">
            <Text size="sm" c="dimmed">Browse all available variables for your templates.</Text>
            <Accordion multiple variant="separated" radius="md">
              {Object.entries(VARIABLE_GROUPS).map(([group, vars]) => (
                <Accordion.Item key={group} value={group}>
                  <Accordion.Control icon={<IconVariable size={16} />}><Text fw={600}>{group}</Text></Accordion.Control>
                  <Accordion.Panel>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                      {vars.map(v => (
                        <Paper key={v} withBorder radius="md" p="sm" style={{ cursor: "pointer" }}>
                          <Text size="xs" style={{ fontFamily: "monospace" }}>{v}</Text>
                        </Paper>
                      ))}
                    </SimpleGrid>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="generated"><GeneratedDocumentsTab /></Tabs.Panel>
        <Tabs.Panel value="drafts"><FilteredTemplatesTab status="Draft" onEdit={handleEdit} /></Tabs.Panel>
        <Tabs.Panel value="published"><FilteredTemplatesTab status="Published" onEdit={handleEdit} /></Tabs.Panel>
        <Tabs.Panel value="versions"><VersionHistoryTab /></Tabs.Panel>
        <Tabs.Panel value="settings"><SettingsTab /></Tabs.Panel>
      </Tabs>

      <GenerateDocModal template={genTemplate} opened={genOpened} onClose={closeGen} />
    </Stack>
  );
}
