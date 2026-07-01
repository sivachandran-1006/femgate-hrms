import { useState } from "react";
import {
  Box, Stack, Group, Paper, Text, Badge, Button, ActionIcon, TextInput,
  Select, Tabs, SimpleGrid, Table, Modal, Textarea, NumberInput,
  ThemeIcon, Progress, Divider, ScrollArea, Tooltip, SegmentedControl,
  Switch, Accordion, Timeline, RingProgress, Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useToast } from "../../components/ui/Toast";
import {
  IconMail, IconTemplate, IconPlus, IconCategory, IconVariable,
  IconLayout, IconHistory, IconFile, IconSend, IconSettings,
  IconEye, IconEdit, IconCopy, IconRocket, IconArchive, IconTrash,
  IconSearch, IconChartBar, IconCheck, IconX, IconDeviceDesktop,
  IconDeviceTablet, IconDeviceMobile, IconSun, IconMoon, IconInbox,
  IconBrandGmail, IconArrowLeft, IconArrowRight, IconRefresh,
  IconDownload, IconUpload, IconBold, IconItalic, IconUnderline,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconLink,
  IconPhoto, IconTable, IconColumns, IconMinus, IconChevronDown,
  IconEyeOff, IconClock, IconCalendar,
} from "@tabler/icons-react";
import {
  useETDashboard, useTemplates, useEmailCategories, useEmailVariables,
  useEmailLayouts, useEmailHistory, useEmailSettings,
  useCreateTemplate, useUpdateTemplate, useDeleteTemplate,
  useDuplicateTemplate, usePublishTemplate, useArchiveTemplate,
  useSendTestEmail, useUpdateEmailSettings,
  useCreateCategory, useDeleteCategory,
} from "../../queries/useEmailTemplate";

// ── mock fallback data ────────────────────────────────────────────────────────
const MOCK_DASHBOARD = {
  totalTemplates: 48, published: 31, drafts: 12, sentToday: 247,
  failed: 3, scheduled: 8, categories: 18, mostUsed: "Welcome Email",
  monthlyData: [
    { month: "Jan", sent: 1800 }, { month: "Feb", sent: 2100 },
    { month: "Mar", sent: 1950 }, { month: "Apr", sent: 2400 },
    { month: "May", sent: 2800 }, { month: "Jun", sent: 3100 },
    { month: "Jul", sent: 2700 }, { month: "Aug", sent: 3300 },
    { month: "Sep", sent: 2950 }, { month: "Oct", sent: 3500 },
    { month: "Nov", sent: 3200 }, { month: "Dec", sent: 4100 },
  ],
  deliveryRate: 97.2, openRate: 42.8, clickRate: 18.5,
  bounceRate: 2.8,
};

const MOCK_TEMPLATES = [
  { id: 1, name: "Welcome Email",        category: "Onboarding",    version: "v2.1", status: "Published", createdBy: "HR Admin",   updatedOn: "2026-06-15" },
  { id: 2, name: "Leave Approval",       category: "Leave",         version: "v1.3", status: "Published", createdBy: "HR Admin",   updatedOn: "2026-06-10" },
  { id: 3, name: "Payroll Notification", category: "Payroll",       version: "v3.0", status: "Published", createdBy: "HR Admin",   updatedOn: "2026-06-01" },
  { id: 4, name: "Password Reset",       category: "System",        version: "v1.0", status: "Draft",     createdBy: "IT Admin",   updatedOn: "2026-05-28" },
  { id: 5, name: "Offer Letter",         category: "Recruitment",   version: "v2.0", status: "Published", createdBy: "Recruiter",  updatedOn: "2026-05-20" },
  { id: 6, name: "Birthday Wishes",      category: "Engagement",    version: "v1.1", status: "Draft",     createdBy: "HR Exec",    updatedOn: "2026-05-15" },
  { id: 7, name: "Training Reminder",    category: "Learning",      version: "v1.0", status: "Archived",  createdBy: "L&D Admin",  updatedOn: "2026-05-10" },
  { id: 8, name: "Performance Review",   category: "Performance",   version: "v1.2", status: "Published", createdBy: "HR Admin",   updatedOn: "2026-05-05" },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Employee Invitation", count: 3 },
  { id: 2, name: "Welcome Email",       count: 2 },
  { id: 3, name: "Password Reset",      count: 1 },
  { id: 4, name: "Offer Letter",        count: 4 },
  { id: 5, name: "Leave Approval",      count: 2 },
  { id: 6, name: "Payroll",             count: 3 },
  { id: 7, name: "Training",            count: 2 },
  { id: 8, name: "Performance Review",  count: 2 },
  { id: 9, name: "Birthday Wishes",     count: 1 },
  { id: 10, name: "Announcements",      count: 5 },
];

const VARIABLE_GROUPS = {
  Employee:    ["{{employee.name}}", "{{employee.id}}", "{{employee.department}}", "{{employee.designation}}", "{{employee.joiningDate}}", "{{employee.manager}}", "{{employee.email}}", "{{employee.phone}}"],
  Company:     ["{{company.name}}", "{{company.logo}}", "{{company.supportEmail}}", "{{company.supportPhone}}", "{{company.website}}"],
  Attendance:  ["{{attendance.date}}", "{{attendance.checkIn}}", "{{attendance.checkOut}}", "{{attendance.status}}"],
  Leave:       ["{{leave.type}}", "{{leave.startDate}}", "{{leave.endDate}}", "{{leave.days}}", "{{leave.status}}"],
  Payroll:     ["{{payroll.month}}", "{{payroll.grossSalary}}", "{{payroll.netSalary}}", "{{payroll.deductions}}"],
  Performance: ["{{performance.rating}}", "{{performance.reviewDate}}", "{{performance.reviewer}}"],
  Learning:    ["{{training.name}}", "{{training.date}}", "{{training.venue}}", "{{training.trainer}}"],
  Recruitment: ["{{offer.number}}", "{{interview.date}}", "{{interview.time}}", "{{interview.mode}}"],
};

const LAYOUTS = [
  { id: 1, name: "Corporate Layout",     desc: "Professional header, body, footer" },
  { id: 2, name: "Modern Layout",        desc: "Clean minimal with accent colors"  },
  { id: 3, name: "Minimal Layout",       desc: "Simple single-column design"       },
  { id: 4, name: "Executive Layout",     desc: "Formal tone with signature block"  },
  { id: 5, name: "Newsletter Layout",    desc: "Multi-section newsletter style"    },
  { id: 6, name: "Simple Layout",        desc: "Plain text-first approach"         },
  { id: 7, name: "Announcement Layout",  desc: "Bold hero + action button"         },
  { id: 8, name: "Responsive Layout",    desc: "Mobile-first fluid design"         },
];

const MOCK_HISTORY = [
  { id: "EML-001", template: "Welcome Email",    recipient: "john@co.com",  subject: "Welcome to MGate",    sentBy: "System",    sentDate: "2026-06-30 09:15", delivery: "Delivered", opened: "Yes" },
  { id: "EML-002", template: "Leave Approval",   recipient: "sara@co.com",  subject: "Leave Approved",      sentBy: "HR Admin",  sentDate: "2026-06-30 10:30", delivery: "Delivered", opened: "No"  },
  { id: "EML-003", template: "Payroll",          recipient: "all@co.com",   subject: "June Payslip Ready",  sentBy: "System",    sentDate: "2026-06-29 18:00", delivery: "Delivered", opened: "Yes" },
  { id: "EML-004", template: "Password Reset",   recipient: "raj@co.com",   subject: "Reset Your Password", sentBy: "System",    sentDate: "2026-06-29 14:20", delivery: "Failed",    opened: "No"  },
  { id: "EML-005", template: "Training Reminder",recipient: "team@co.com",  subject: "Training Tomorrow",   sentBy: "L&D Admin", sentDate: "2026-06-28 08:00", delivery: "Delivered", opened: "Yes" },
];

const STATUS_COLOR = { Published: "green", Draft: "yellow", Archived: "gray" };
const DELIVERY_COLOR = { Delivered: "green", Failed: "red", Pending: "yellow" };

// ── KPI Card ─────────────────────────────────────────────────────────────────
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

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: raw } = useETDashboard();
  const d = raw ?? MOCK_DASHBOARD;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KpiCard icon={IconTemplate}  label="Total Templates"   value={d.totalTemplates} color="blue"   />
        <KpiCard icon={IconRocket}    label="Published"         value={d.published}      color="green"  />
        <KpiCard icon={IconFile}      label="Drafts"            value={d.drafts}         color="yellow" />
        <KpiCard icon={IconSend}      label="Sent Today"        value={d.sentToday}      color="violet" />
        <KpiCard icon={IconX}         label="Failed Emails"     value={d.failed}         color="red"    />
        <KpiCard icon={IconClock}     label="Scheduled"         value={d.scheduled}      color="cyan"   />
        <KpiCard icon={IconCategory}  label="Categories"        value={d.categories}     color="orange" />
        <KpiCard icon={IconMail}      label="Most Used"         value={d.mostUsed}       color="pink"   sub="Template" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {/* Monthly chart */}
        <Paper withBorder radius="lg" p="lg">
          <Text fw={700} mb="md">Emails Sent by Month</Text>
          <Stack gap={6}>
            {d.monthlyData?.slice(-6).map((m) => {
              const max = Math.max(...(d.monthlyData?.map(x => x.sent) ?? [1]));
              return (
                <Group key={m.month} gap="sm">
                  <Text size="xs" c="dimmed" w={28}>{m.month}</Text>
                  <Box style={{ flex: 1 }}>
                    <Progress value={(m.sent / max) * 100} color="blue" radius="xl" size="md" />
                  </Box>
                  <Text size="xs" fw={600} w={40} ta="right">{m.sent}</Text>
                </Group>
              );
            })}
          </Stack>
        </Paper>

        {/* Rate cards */}
        <Paper withBorder radius="lg" p="lg">
          <Text fw={700} mb="md">Email Performance Rates</Text>
          <Stack gap="md">
            {[
              { label: "Delivery Success Rate", value: d.deliveryRate, color: "green" },
              { label: "Open Rate",              value: d.openRate,     color: "blue"  },
              { label: "Click Rate",             value: d.clickRate,    color: "violet"},
              { label: "Bounce Rate",            value: d.bounceRate,   color: "red"   },
            ].map(r => (
              <Box key={r.label}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">{r.label}</Text>
                  <Text size="sm" fw={700} c={r.color}>{r.value}%</Text>
                </Group>
                <Progress value={r.value} color={r.color} radius="xl" size="sm" />
              </Box>
            ))}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

// ── Template Library Tab ──────────────────────────────────────────────────────
function TemplateLibraryTab({ onEdit }) {
  const { show } = useToast();
  const [search, setSearch]   = useState("");
  const [catF,   setCatF]     = useState("");
  const [statusF,setStatusF]  = useState("");
  const [delId,  setDelId]    = useState(null);

  const { data: raw = [] }  = useTemplates({ search: search || undefined, category: catF || undefined, status: statusF || undefined });
  const templates            = raw.length ? raw : MOCK_TEMPLATES;

  const dupMut  = useDuplicateTemplate();
  const pubMut  = usePublishTemplate();
  const archMut = useArchiveTemplate();
  const delMut  = useDeleteTemplate();
  const [testOpen, { open: openTest, close: closeTest }] = useDisclosure(false);
  const [testId, setTestId] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const testMut = useSendTestEmail();

  const filtered = templates.filter(t =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search templates…" leftSection={<IconSearch size={15} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <Select placeholder="Category" data={["Onboarding","Leave","Payroll","Recruitment","System","Engagement","Learning","Performance"]} value={catF} onChange={setCatF} clearable w={160} />
        <Select placeholder="Status" data={["Published","Draft","Archived"]} value={statusF} onChange={setStatusF} clearable w={130} />
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
              {filtered.map(t => (
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
                      <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" loading={pubMut.isPending} onClick={() => pubMut.mutate(t.id, { onSuccess: () => show(`"${t.name}" published`), onError: () => show("Failed","error") })}><IconRocket size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="orange" loading={archMut.isPending} onClick={() => archMut.mutate(t.id, { onSuccess: () => show(`"${t.name}" archived`, "info"), onError: () => show("Failed","error") })}><IconArchive size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Test Email"><ActionIcon size="sm" variant="subtle" color="violet" onClick={() => { setTestId(t.id); openTest(); }}><IconSend size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDelId(t.id)}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Delete confirm */}
      <Modal opened={!!delId} onClose={() => setDelId(null)} title="Delete Template?" centered radius="lg" size="sm">
        <Text size="sm" c="dimmed" mb="lg">This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDelId(null)}>Cancel</Button>
          <Button color="red" loading={delMut.isPending} onClick={() => delMut.mutate(delId, { onSuccess: () => { show("Template deleted", "error"); setDelId(null); }, onError: () => show("Failed","error") })}>Delete</Button>
        </Group>
      </Modal>

      {/* Test email */}
      <Modal opened={testOpen} onClose={closeTest} title="Send Test Email" centered radius="lg" size="sm">
        <Stack gap="sm">
          <TextInput label="Recipient Email" placeholder="test@company.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={closeTest}>Cancel</Button>
            <Button leftSection={<IconSend size={14} />} loading={testMut.isPending} onClick={() => testMut.mutate({ id: testId, to: testEmail }, { onSuccess: () => { show("Test email sent!"); closeTest(); }, onError: () => show("Failed","error") })}>Send Test</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Create Template (7-step wizard) ──────────────────────────────────────────
function CreateTemplateTab({ editTemplate, onDone }) {
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: editTemplate?.name ?? "",
    description: "",
    category: editTemplate?.category ?? "",
    language: "English",
    version: "v1.0",
    status: "Draft",
    subject: "",
    bodyHtml: "<p>Dear {{employee.name}},</p><p>Your message here.</p>",
    previewDevice: "desktop",
    previewMode: "light",
    selectedLayout: null,
    testRecipient: "",
    testCc: "",
  });

  const createMut = useCreateTemplate();
  const updateMut = useUpdateTemplate();
  const testMut   = useSendTestEmail();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const STEPS = ["Basic Info", "Layout", "Variables", "Subject", "Preview", "Test Email", "Publish"];

  const handleSave = (publish = false) => {
    const payload = { ...form, status: publish ? "Published" : "Draft" };
    if (editTemplate) {
      updateMut.mutate({ id: editTemplate.id, ...payload }, {
        onSuccess: () => { show(publish ? "Template published!" : "Draft saved!"); onDone(); },
        onError:   () => show("Save failed", "error"),
      });
    } else {
      createMut.mutate(payload, {
        onSuccess: () => { show(publish ? "Template published!" : "Draft saved!"); onDone(); },
        onError:   () => show("Save failed", "error"),
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Step indicator */}
      <Paper withBorder radius="lg" p="md">
        <Group gap={0} wrap="nowrap">
          {STEPS.map((s, i) => (
            <Box key={s} style={{ flex: 1, textAlign: "center" }}>
              <Stack gap={4} align="center">
                <Box
                  style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < step ? "var(--mantine-color-green-6)" : i === step ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-2)", cursor: "pointer" }}
                  onClick={() => setStep(i)}
                >
                  {i < step
                    ? <IconCheck size={14} color="white" />
                    : <Text size="xs" fw={700} c={i === step ? "white" : "dimmed"}>{i + 1}</Text>
                  }
                </Box>
                <Text size="xs" fw={i === step ? 700 : 400} c={i === step ? "blue" : "dimmed"}>{s}</Text>
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
            <TextInput label="Template Name" placeholder="e.g. Welcome Email" value={form.name} onChange={e => set("name", e.target.value)} required />
            <Select label="Category" placeholder="Select category" data={["Employee Invitation","Welcome Email","Password Reset","Offer Letter","Leave Approval","Leave Rejection","Payroll Notification","Training Reminder","Performance Review","Birthday Wishes","Announcements","Custom"]} value={form.category} onChange={v => set("category", v)} />
            <Select label="Language" data={["English","Hindi","Tamil","Telugu"]} value={form.language} onChange={v => set("language", v)} />
            <TextInput label="Version" value={form.version} onChange={e => set("version", e.target.value)} />
            <Select label="Status" data={["Draft","Published"]} value={form.status} onChange={v => set("status", v)} />
          </SimpleGrid>
          <Textarea label="Description" placeholder="What is this template for?" value={form.description} onChange={e => set("description", e.target.value)} mt="md" minRows={3} />
        </Paper>
      )}

      {/* Step 1 — Layout Designer */}
      {step === 1 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Email Layout Designer</Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
            {LAYOUTS.map(l => (
              <Paper
                key={l.id} withBorder radius="md" p="md"
                style={{ cursor: "pointer", borderColor: form.selectedLayout === l.id ? "var(--mantine-color-blue-5)" : undefined, background: form.selectedLayout === l.id ? "var(--mantine-color-blue-0)" : undefined }}
                onClick={() => set("selectedLayout", l.id)}
              >
                <Stack gap={4} align="center">
                  <ThemeIcon size={36} radius="md" color={form.selectedLayout === l.id ? "blue" : "gray"} variant="light"><IconLayout size={18} /></ThemeIcon>
                  <Text size="sm" fw={600} ta="center">{l.name}</Text>
                  <Text size="xs" c="dimmed" ta="center">{l.desc}</Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          <Divider label="Email Builder Blocks" mb="md" />
          <Group gap="xs" wrap="wrap">
            {[
              { icon: IconPhoto,      label: "Image"     },
              { icon: IconMinus,      label: "Divider"   },
              { icon: IconTable,      label: "Table"     },
              { icon: IconColumns,    label: "Columns"   },
              { icon: IconLink,       label: "Button"    },
              { icon: IconAlignLeft,  label: "Text"      },
            ].map(b => (
              <Button key={b.label} variant="default" size="xs" leftSection={<b.icon size={13} />}>{b.label}</Button>
            ))}
          </Group>

          <Paper withBorder radius="md" p="lg" mt="lg" bg="gray.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" fw={600} c="dimmed">HEADER</Text>
                <ActionIcon size="xs" variant="subtle"><IconEdit size={12} /></ActionIcon>
              </Group>
              <Box style={{ background: "var(--mantine-color-blue-6)", borderRadius: 8, padding: "24px", textAlign: "center" }}>
                <Text c="white" fw={700}>Company Logo</Text>
              </Box>
              <Paper p="md" radius="md">
                <Box dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
              </Paper>
              <Paper p="sm" radius="md" bg="gray.1">
                <Text size="xs" c="dimmed" ta="center">© 2026 MGate Technologies · Unsubscribe · Privacy Policy</Text>
              </Paper>
            </Stack>
          </Paper>
        </Paper>
      )}

      {/* Step 2 — Variable Library */}
      {step === 2 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Variable Library</Text>
          <Accordion multiple variant="separated" radius="md">
            {Object.entries(VARIABLE_GROUPS).map(([group, vars]) => (
              <Accordion.Item key={group} value={group}>
                <Accordion.Control icon={<IconVariable size={16} />}>
                  <Text fw={600}>{group} Variables</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Group gap="xs" wrap="wrap">
                    {vars.map(v => (
                      <Badge
                        key={v} variant="outline" color="blue" size="md"
                        style={{ cursor: "pointer", fontFamily: "monospace" }}
                        onClick={() => { navigator.clipboard?.writeText(v); show(`Copied ${v}`, "info"); }}
                      >
                        {v}
                      </Badge>
                    ))}
                  </Group>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}

      {/* Step 3 — Subject Line */}
      {step === 3 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Subject Line</Text>
          <Stack gap="md">
            <TextInput
              label="Email Subject"
              placeholder="e.g. Welcome to {{company.name}}, {{employee.name}}!"
              value={form.subject}
              onChange={e => set("subject", e.target.value)}
              description={`${form.subject.length} characters`}
            />
            <Text size="sm" c="dimmed">Available variables:</Text>
            <Group gap="xs" wrap="wrap">
              {["{{employee.name}}", "{{company.name}}", "{{leave.type}}", "{{payroll.month}}"].map(v => (
                <Badge
                  key={v} variant="light" color="blue" size="sm"
                  style={{ cursor: "pointer", fontFamily: "monospace" }}
                  onClick={() => set("subject", form.subject + v)}
                >
                  {v}
                </Badge>
              ))}
            </Group>
            <Paper withBorder radius="md" p="md" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} mb={4}>PREVIEW</Text>
              <Text size="sm">{form.subject.replace("{{employee.name}}", "John Doe").replace("{{company.name}}", "MGate Technologies").replace("{{leave.type}}", "Annual Leave").replace("{{payroll.month}}", "June 2026") || "(no subject)"}</Text>
            </Paper>
          </Stack>
        </Paper>
      )}

      {/* Step 4 — Preview */}
      {step === 4 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Email Preview</Text>
          <Group gap="md" mb="lg" wrap="wrap">
            <SegmentedControl
              value={form.previewDevice}
              onChange={v => set("previewDevice", v)}
              data={[
                { label: <Group gap={4}><IconDeviceDesktop size={14} /><span>Desktop</span></Group>, value: "desktop" },
                { label: <Group gap={4}><IconDeviceTablet size={14} /><span>Tablet</span></Group>,  value: "tablet"  },
                { label: <Group gap={4}><IconDeviceMobile size={14} /><span>Mobile</span></Group>,  value: "mobile"  },
              ]}
            />
            <SegmentedControl
              value={form.previewMode}
              onChange={v => set("previewMode", v)}
              data={[
                { label: <Group gap={4}><IconSun size={14} /><span>Light</span></Group>,  value: "light" },
                { label: <Group gap={4}><IconMoon size={14} /><span>Dark</span></Group>,  value: "dark"  },
              ]}
            />
          </Group>
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <Paper
              withBorder radius="lg" p="xl"
              bg={form.previewMode === "dark" ? "dark.8" : "white"}
              style={{ width: form.previewDevice === "desktop" ? "100%" : form.previewDevice === "tablet" ? 600 : 375, maxWidth: "100%", transition: "width .3s" }}
            >
              <Stack gap="sm">
                <Box style={{ background: "var(--mantine-color-blue-6)", borderRadius: 8, padding: "24px", textAlign: "center" }}>
                  <Text c="white" fw={800} size="lg">MGate Technologies</Text>
                </Box>
                <Box p="md" dangerouslySetInnerHTML={{ __html: form.bodyHtml.replace("{{employee.name}}", "John Doe") }} />
                <Divider />
                <Text size="xs" c="dimmed" ta="center">© 2026 MGate Technologies</Text>
              </Stack>
            </Paper>
          </Box>
        </Paper>
      )}

      {/* Step 5 — Test Email */}
      {step === 5 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Send Test Email</Text>
          <Stack gap="md" maw={480}>
            <TextInput label="Recipient" placeholder="test@company.com" value={form.testRecipient} onChange={e => set("testRecipient", e.target.value)} />
            <TextInput label="CC (optional)" placeholder="cc@company.com" value={form.testCc} onChange={e => set("testCc", e.target.value)} />
            <Button
              leftSection={<IconSend size={15} />}
              loading={testMut.isPending}
              disabled={!form.testRecipient}
              onClick={() => testMut.mutate(
                { id: editTemplate?.id, to: form.testRecipient, cc: form.testCc || undefined, subject: form.subject, body: form.bodyHtml },
                { onSuccess: () => show("Test email sent!", "success"), onError: () => show("Failed to send test email", "error") }
              )}
            >
              Send Test Email
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Step 6 — Publish */}
      {step === 6 && (
        <Paper withBorder radius="lg" p="xl">
          <Text fw={700} size="lg" mb="lg">Review & Publish</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
            {[
              ["Template Name", form.name],
              ["Category",      form.category],
              ["Language",      form.language],
              ["Version",       form.version],
              ["Subject",       form.subject || "(not set)"],
              ["Layout",        LAYOUTS.find(l => l.id === form.selectedLayout)?.name ?? "None"],
            ].map(([k, v]) => (
              <Paper key={k} withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" fw={600}>{k}</Text>
                <Text size="sm" fw={600} mt={2}>{v}</Text>
              </Paper>
            ))}
          </SimpleGrid>
          <Group gap="sm">
            <Button variant="default" onClick={() => handleSave(false)} loading={createMut.isPending || updateMut.isPending}>Save Draft</Button>
            <Button color="green" leftSection={<IconRocket size={15} />} onClick={() => handleSave(true)} loading={createMut.isPending || updateMut.isPending}>Publish Template</Button>
            <Button variant="default" onClick={onDone}>Cancel</Button>
          </Group>
        </Paper>
      )}

      {/* Navigation */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconArrowLeft size={14} />} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Previous</Button>
        {step < STEPS.length - 1 && (
          <Button rightSection={<IconArrowRight size={14} />} onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>Next</Button>
        )}
      </Group>
    </Stack>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────────
function CategoriesTab() {
  const { show } = useToast();
  const { data: raw = [] } = useEmailCategories();
  const cats = raw.length ? raw : MOCK_CATEGORIES;
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const createCatMut = useCreateCategory();
  const deleteCatMut = useDeleteCategory();

  const handleAdd = () => {
    if (!name.trim()) return;
    createCatMut.mutate({ name: name.trim() }, {
      onSuccess: () => { show("Category added!", "success"); setName(""); close(); },
      onError:   () => show("Failed to add category", "error"),
    });
  };

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={15} />} onClick={open}>Add Category</Button>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        {cats.map(c => (
          <Paper key={c.id} withBorder radius="lg" p="lg">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text fw={700} size="sm">{c.name}</Text>
                <Text size="xs" c="dimmed">{c.count} templates</Text>
              </Stack>
              <Group gap={4}>
                <ThemeIcon size={36} radius="md" color="blue" variant="light"><IconCategory size={18} /></ThemeIcon>
                <ActionIcon
                  size="sm" variant="subtle" color="red"
                  loading={deleteCatMut.isPending && deleteCatMut.variables === c.id}
                  onClick={() => deleteCatMut.mutate(c.id, {
                    onSuccess: () => show("Category deleted", "info"),
                    onError:   () => show("Failed to delete", "error"),
                  })}
                >
                  <IconTrash size={13} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
      <Modal opened={opened} onClose={close} title="Add Category" centered radius="lg" size="sm">
        <Stack gap="sm">
          <TextInput label="Category Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button loading={createCatMut.isPending} onClick={handleAdd}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Variable Library Tab ──────────────────────────────────────────────────────
function VariableLibraryTab() {
  const { show } = useToast();
  const { data: raw } = useEmailVariables();
  const [search, setSearch] = useState("");

  return (
    <Stack gap="md">
      <TextInput placeholder="Search variables…" leftSection={<IconSearch size={15} />} value={search} onChange={e => setSearch(e.target.value)} maw={360} />
      <Accordion multiple variant="separated" radius="md">
        {Object.entries(VARIABLE_GROUPS).map(([group, vars]) => {
          const filtered = vars.filter(v => !search || v.toLowerCase().includes(search.toLowerCase()));
          if (!filtered.length) return null;
          return (
            <Accordion.Item key={group} value={group}>
              <Accordion.Control icon={<IconVariable size={16} />}>
                <Group gap="sm">
                  <Text fw={600}>{group}</Text>
                  <Badge variant="light" size="xs">{filtered.length}</Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                  {filtered.map(v => (
                    <Paper key={v} withBorder radius="md" p="sm" style={{ cursor: "pointer" }} onClick={() => { navigator.clipboard?.writeText(v); show(`Copied!`, "info"); }}>
                      <Group gap="xs" wrap="nowrap">
                        <IconCopy size={13} color="var(--mantine-color-blue-5)" />
                        <Text size="xs" style={{ fontFamily: "monospace" }}>{v}</Text>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
}

// ── Layout Library Tab ────────────────────────────────────────────────────────
function LayoutLibraryTab() {
  const { data: raw = [] } = useEmailLayouts();
  const layouts = raw.length ? raw : LAYOUTS;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {layouts.map(l => (
        <Paper key={l.id} withBorder radius="lg" p="xl">
          <Stack gap="md" align="center">
            <ThemeIcon size={56} radius="xl" color="blue" variant="light"><IconLayout size={28} /></ThemeIcon>
            <Stack gap={4} align="center">
              <Text fw={700} ta="center">{l.name}</Text>
              <Text size="xs" c="dimmed" ta="center">{l.desc}</Text>
            </Stack>
            <Button variant="light" size="xs" fullWidth>Use Layout</Button>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

// ── Email History Tab ─────────────────────────────────────────────────────────
function EmailHistoryTab() {
  const { data: raw = [] } = useEmailHistory();
  const history = raw.length ? raw : MOCK_HISTORY;
  const [search, setSearch] = useState("");

  const filtered = history.filter(e => !search || e.template.toLowerCase().includes(search.toLowerCase()) || e.recipient.includes(search));

  return (
    <Stack gap="md">
      <TextInput placeholder="Search by template or recipient…" leftSection={<IconSearch size={15} />} value={search} onChange={e => setSearch(e.target.value)} maw={360} />
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {["Email ID","Template","Recipient","Subject","Sent By","Sent Date","Delivery","Opened","Actions"].map(h => (
                  <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(e => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text size="xs" fw={600} style={{ fontFamily: "monospace" }}>{e.id}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.template}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{e.recipient}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.subject}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.sentBy}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{e.sentDate}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={DELIVERY_COLOR[e.delivery]} size="sm">{e.delivery}</Badge></Table.Td>
                  <Table.Td><Badge variant="dot" color={e.opened === "Yes" ? "green" : "gray"} size="sm">{e.opened}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="View"><ActionIcon size="sm" variant="subtle"><IconEye size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Resend"><ActionIcon size="sm" variant="subtle" color="blue"><IconRefresh size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Download"><ActionIcon size="sm" variant="subtle" color="green"><IconDownload size={13} /></ActionIcon></Tooltip>
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

// ── Draft / Published Tabs ────────────────────────────────────────────────────
function FilteredTemplatesTab({ status, onEdit }) {
  const { data: raw = [] } = useTemplates({ status });
  const templates = (raw.length ? raw : MOCK_TEMPLATES).filter(t => t.status === status);

  return (
    <Stack gap="md">
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
              <Button size="xs" variant="light" leftSection={<IconEdit size={12} />} onClick={() => onEdit(t)}>Edit</Button>
              <Button size="xs" variant="subtle" leftSection={<IconEye size={12} />}>Preview</Button>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// ── Version History Tab ───────────────────────────────────────────────────────
function VersionHistoryTab() {
  const MOCK_VERSIONS = [
    { version: "v3.0", createdBy: "HR Admin",  publishedDate: "2026-06-01", status: "Current"  },
    { version: "v2.1", createdBy: "HR Admin",  publishedDate: "2026-04-15", status: "Archived" },
    { version: "v2.0", createdBy: "IT Admin",  publishedDate: "2026-02-10", status: "Archived" },
    { version: "v1.0", createdBy: "HR Exec",   publishedDate: "2025-12-01", status: "Archived" },
  ];

  return (
    <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {["Version","Created By","Published Date","Status","Actions"].map(h => (
                <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {MOCK_VERSIONS.map(v => (
              <Table.Tr key={v.version}>
                <Table.Td><Badge variant="light" color="blue" size="sm">{v.version}</Badge></Table.Td>
                <Table.Td><Text size="sm">{v.createdBy}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{v.publishedDate}</Text></Table.Td>
                <Table.Td><Badge variant="dot" color={v.status === "Current" ? "green" : "gray"} size="sm">{v.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Button size="xs" variant="light" leftSection={<IconRefresh size={12} />} disabled={v.status === "Current"}>Restore</Button>
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

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
  const { show } = useToast();
  const { data: raw } = useEmailSettings();
  const updateMut = useUpdateEmailSettings();
  const [settings, setSettings] = useState({
    senderName: "MGate HRMS",
    senderEmail: "noreply@mgate.com",
    replyTo: "hr@mgate.com",
    defaultFooter: "© 2026 MGate Technologies. All rights reserved.",
    trackingPixel: true,
    maxAttachmentMb: 10,
    smtpProfile: "Default SMTP",
  });
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  return (
    <Stack gap="lg" maw={640}>
      <Paper withBorder radius="lg" p="xl">
        <Text fw={700} mb="lg">Sender Configuration</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput label="Default Sender Name" value={settings.senderName} onChange={e => set("senderName", e.target.value)} />
          <TextInput label="Default Sender Email" value={settings.senderEmail} onChange={e => set("senderEmail", e.target.value)} />
          <TextInput label="Reply-To Email" value={settings.replyTo} onChange={e => set("replyTo", e.target.value)} />
          <Select label="SMTP Profile" data={["Default SMTP","SendGrid","AWS SES","Mailgun"]} value={settings.smtpProfile} onChange={v => set("smtpProfile", v)} />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="lg" p="xl">
        <Text fw={700} mb="lg">Email Defaults</Text>
        <Stack gap="md">
          <Textarea label="Default Footer" value={settings.defaultFooter} onChange={e => set("defaultFooter", e.target.value)} minRows={2} />
          <NumberInput label="Max Attachment Size (MB)" value={settings.maxAttachmentMb} onChange={v => set("maxAttachmentMb", v)} min={1} max={25} />
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm" fw={500}>Tracking Pixel</Text>
              <Text size="xs" c="dimmed">Track email open rates</Text>
            </Stack>
            <Switch checked={settings.trackingPixel} onChange={e => set("trackingPixel", e.currentTarget.checked)} />
          </Group>
        </Stack>
      </Paper>

      <Button
        leftSection={<IconCheck size={15} />}
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmailTemplateBuilder({ darkMode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editTemplate, setEditTemplate] = useState(null);

  const TABS = [
    { value: "dashboard",   label: "Dashboard",          icon: IconChartBar   },
    { value: "library",     label: "Template Library",   icon: IconTemplate   },
    { value: "create",      label: "Create Template",    icon: IconPlus       },
    { value: "categories",  label: "Categories",         icon: IconCategory   },
    { value: "variables",   label: "Variable Library",   icon: IconVariable   },
    { value: "layouts",     label: "Layout Library",     icon: IconLayout     },
    { value: "history",     label: "Email History",      icon: IconHistory    },
    { value: "drafts",      label: "Draft Templates",    icon: IconFile       },
    { value: "published",   label: "Published",          icon: IconRocket     },
    { value: "versions",    label: "Version History",    icon: IconClock      },
    { value: "settings",    label: "Settings",           icon: IconSettings   },
  ];

  const handleEdit = (t) => { setEditTemplate(t); setActiveTab("create"); };
  const handleDone = () => { setEditTemplate(null); setActiveTab("library"); };

  return (
    <Stack gap="lg" p="xl">
      {/* Header */}
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Group gap="sm">
            <ThemeIcon size={40} radius="lg" color="blue" variant="light"><IconMail size={20} /></ThemeIcon>
            <Text fw={800} size="xl">Email Template Builder</Text>
          </Group>
          <Text size="sm" c="dimmed">Design, manage and send branded email templates</Text>
        </Stack>
        <Button leftSection={<IconPlus size={15} />} onClick={() => { setEditTemplate(null); setActiveTab("create"); }}>
          New Template
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
        <ScrollArea type="never">
          <Tabs.List mb="lg" style={{ flexWrap: "nowrap" }}>
            {TABS.map(t => (
              <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={14} />}>
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </ScrollArea>

        <Tabs.Panel value="dashboard">
          <DashboardTab />
        </Tabs.Panel>

        <Tabs.Panel value="library">
          <TemplateLibraryTab onEdit={handleEdit} />
        </Tabs.Panel>

        <Tabs.Panel value="create">
          <CreateTemplateTab editTemplate={editTemplate} onDone={handleDone} />
        </Tabs.Panel>

        <Tabs.Panel value="categories">
          <CategoriesTab />
        </Tabs.Panel>

        <Tabs.Panel value="variables">
          <VariableLibraryTab />
        </Tabs.Panel>

        <Tabs.Panel value="layouts">
          <LayoutLibraryTab />
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <EmailHistoryTab />
        </Tabs.Panel>

        <Tabs.Panel value="drafts">
          <FilteredTemplatesTab status="Draft" onEdit={handleEdit} />
        </Tabs.Panel>

        <Tabs.Panel value="published">
          <FilteredTemplatesTab status="Published" onEdit={handleEdit} />
        </Tabs.Panel>

        <Tabs.Panel value="versions">
          <VersionHistoryTab />
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <SettingsTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
