import { useState, useEffect } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Textarea, Modal, Table, Loader, Center, ColorInput, Select, Avatar,
} from "@mantine/core";
import {
  IconPalette, IconChartBar, IconMail, IconWorld, IconBrush, IconPhoto,
  IconDeviceFloppy, IconRocket, IconRotate, IconCheck, IconTrash, IconLogin2, IconBuildingStore,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import {
  useBrandSettings, useSaveBrandSettings, usePublishBrand, useResetBrand,
  useBrandDashboard, useEmailTemplates, useUpdateEmailTemplate,
  useVerifyDomain,
} from "../../queries/useBranding";

const THEMES = ["Light", "Dark", "System", "Corporate Blue", "Modern Green", "Purple", "Custom Theme"];
const FONTS = ["Inter", "Roboto", "Poppins", "Open Sans", "Lato", "Montserrat"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}><Icon size={18} color={`var(--mantine-color-${color}-6)`} /></Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ═══ Dashboard ═══
function DashboardTab() {
  const { data: d, isLoading } = useBrandDashboard();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      <Kpi label="Branded Tenants" value={dash.brandedTenants} icon={IconBuildingStore} color="blue" />
      <Kpi label="Custom Domains" value={dash.customDomains} icon={IconWorld} color="teal" />
      <Kpi label="Custom Logos" value={dash.customLogos} icon={IconPhoto} color="grape" />
      <Kpi label="Email Templates" value={dash.customEmailTemplates} icon={IconMail} color="orange" />
      <Kpi label="Login Pages" value={dash.customLoginPages} icon={IconLogin2} color="cyan" />
      <Kpi label="Brand Themes" value={dash.activeBrandThemes} icon={IconBrush} color="pink" />
      <Kpi label="Brand Assets" value={dash.assets} icon={IconPhoto} color="indigo" />
      <Kpi label="Brand Status" value={dash.brandStatus} icon={IconCheck} color={dash.brandStatus === "Published" ? "green" : "gray"} />
    </SimpleGrid>
  );
}

// ═══ Live preview panel (reflects unsaved form state) ═══
function LivePreview({ form }) {
  return (
    <Card withBorder radius="md" p={0} style={{ overflow: "hidden", position: "sticky", top: 8 }}>
      <Box p="xs" style={{ background: form.primaryColor, color: "#fff" }}>
        <Group gap="xs">
          <Avatar size={28} radius="md" style={{ background: "rgba(255,255,255,0.25)" }}>{(form.shortName || form.companyName || "MG").slice(0, 2).toUpperCase()}</Avatar>
          <Text fw={700} size="sm" c="white">{form.companyName || "Your Company"}</Text>
        </Group>
      </Box>
      <Group align="stretch" gap={0}>
        {/* mini sidebar */}
        <Box style={{ width: 90, background: form.sidebarColor, borderRight: "1px solid #e2e8f0", padding: 8 }}>
          {["Dashboard", "Employees", "Leave", "Payroll"].map((m, i) => (
            <Box key={m} mb={6} p={4} style={{ borderRadius: form.borderRadius / 2, background: i === 0 ? form.primaryColor + "22" : "transparent" }}>
              <Text size="9px" fw={i === 0 ? 700 : 500} c={i === 0 ? form.primaryColor : "dimmed"}>{m}</Text>
            </Box>
          ))}
        </Box>
        {/* mini content */}
        <Box style={{ flex: 1, padding: 10, background: "#f8fafc" }}>
          <Text size="xs" fw={700} mb={6}>{form.tagline || "Welcome back 👋"}</Text>
          <SimpleGrid cols={2} spacing={6} mb={8}>
            {[form.primaryColor, form.secondaryColor, form.accentColor, form.successColor].map((c, i) => (
              <Box key={i} style={{ height: 22, borderRadius: form.borderRadius / 2, background: c }} />
            ))}
          </SimpleGrid>
          <Button size="compact-xs" style={{ background: form.primaryColor, borderRadius: form.borderRadius / 2 }}>Primary Button</Button>
          <Button size="compact-xs" variant="outline" ml={6} style={{ borderColor: form.secondaryColor, color: form.secondaryColor, borderRadius: form.borderRadius / 2 }}>Secondary</Button>
        </Box>
      </Group>
      <Box p={6} style={{ borderTop: "1px solid #e2e8f0" }}><Text size="9px" c="dimmed" ta="center">Live preview · {form.theme} · {form.primaryFont}</Text></Box>
    </Card>
  );
}

// ═══ Branding (company + colors + live preview) ═══
function BrandingTab() {
  const { show } = useToast();
  const { data: settings, isLoading } = useBrandSettings();
  const save = useSaveBrandSettings();
  const publish = usePublishBrand();
  const reset = useResetBrand();
  const [form, setForm] = useState(null);

  useEffect(() => { if (settings && !form) setForm(settings); }, [settings]);
  if (isLoading || !form) return <Center h={200}><Loader /></Center>;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const doSave = async () => { await save.mutateAsync(form); show("Branding saved (draft)", "success"); };
  const doPublish = async () => { await save.mutateAsync(form); await publish.mutateAsync(); show("Branding published 🎉", "success"); };
  const doReset = async () => { const fresh = await reset.mutateAsync(); setForm(fresh); show("Reset to defaults", "info"); };

  return (
    <Group align="flex-start" gap="md" wrap="nowrap">
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Company</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <TextInput label="Company Name" value={form.companyName || ""} onChange={(e) => set("companyName", e.target.value)} />
            <TextInput label="Short Name" value={form.shortName || ""} onChange={(e) => set("shortName", e.target.value)} />
            <TextInput label="Tagline" value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
            <TextInput label="Website" value={form.website || ""} onChange={(e) => set("website", e.target.value)} />
            <TextInput label="Support Email" value={form.supportEmail || ""} onChange={(e) => set("supportEmail", e.target.value)} />
            <TextInput label="Support Phone" value={form.supportPhone || ""} onChange={(e) => set("supportPhone", e.target.value)} />
            <TextInput label="Logo URL" value={form.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} />
            <TextInput label="Favicon URL" value={form.faviconUrl || ""} onChange={(e) => set("faviconUrl", e.target.value)} />
          </SimpleGrid>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Colors</Text>
          <SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm">
            <ColorInput label="Primary" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
            <ColorInput label="Secondary" value={form.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
            <ColorInput label="Accent" value={form.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColorInput label="Success" value={form.successColor} onChange={(v) => set("successColor", v)} />
            <ColorInput label="Warning" value={form.warningColor} onChange={(v) => set("warningColor", v)} />
            <ColorInput label="Danger" value={form.dangerColor} onChange={(v) => set("dangerColor", v)} />
            <ColorInput label="Sidebar" value={form.sidebarColor} onChange={(v) => set("sidebarColor", v)} />
          </SimpleGrid>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Typography & Theme</Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
            <Select label="Primary Font" data={FONTS} value={form.primaryFont} onChange={(v) => set("primaryFont", v)} />
            <Select label="Theme" data={THEMES} value={form.theme} onChange={(v) => set("theme", v)} />
            <Select label="Border Radius" data={["4", "8", "12", "16", "20"]} value={String(form.borderRadius)} onChange={(v) => set("borderRadius", Number(v))} />
          </SimpleGrid>
        </Card>

        <Group justify="flex-end">
          <Button variant="default" leftSection={<IconRotate size={14} />} onClick={doReset} loading={reset.isPending}>Reset</Button>
          <Button variant="light" leftSection={<IconDeviceFloppy size={14} />} onClick={doSave} loading={save.isPending}>Save Draft</Button>
          <Button leftSection={<IconRocket size={14} />} onClick={doPublish} loading={publish.isPending}>Publish</Button>
        </Group>
      </Stack>

      <Box style={{ width: 320, flexShrink: 0 }} visibleFrom="md">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>Live Preview</Text>
        <LivePreview form={form} />
      </Box>
    </Group>
  );
}

// ═══ Login Page customization ═══
function LoginTab() {
  const { show } = useToast();
  const { data: settings, isLoading } = useBrandSettings();
  const save = useSaveBrandSettings();
  const [form, setForm] = useState(null);
  useEffect(() => { if (settings && !form) setForm(settings); }, [settings]);
  if (isLoading || !form) return <Center h={200}><Loader /></Center>;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Stack gap="md" maw={640}>
      <TextInput label="Welcome Message" value={form.loginWelcome || ""} onChange={(e) => set("loginWelcome", e.target.value)} placeholder="Welcome back" />
      <TextInput label="Company Slogan" value={form.loginSlogan || ""} onChange={(e) => set("loginSlogan", e.target.value)} placeholder="Manage your entire workforce" />
      <TextInput label="Background Image URL" value={form.loginBgUrl || ""} onChange={(e) => set("loginBgUrl", e.target.value)} />
      <Textarea label="Footer Text" minRows={2} value={form.loginFooter || ""} onChange={(e) => set("loginFooter", e.target.value)} />
      <Group justify="flex-end"><Button leftSection={<IconDeviceFloppy size={14} />} onClick={async () => { await save.mutateAsync(form); show("Login page saved", "success"); }} loading={save.isPending}>Save</Button></Group>
    </Stack>
  );
}

// ═══ Email Templates ═══
function EmailTab() {
  const { show } = useToast();
  const { data: templates = [], isLoading } = useEmailTemplates();
  const update = useUpdateEmailTemplate();
  const [edit, setEdit] = useState(null);
  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Template</Table.Th><Table.Th>Subject</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {templates.length === 0 && <Table.Tr><Table.Td colSpan={3}><AppEmptyState icon={<IconMail size={24} />} message="No email templates" /></Table.Td></Table.Tr>}
          {templates.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td fw={500}>{t.type}</Table.Td>
              <Table.Td><Text size="xs" c="dimmed">{t.subject}</Text></Table.Td>
              <Table.Td><Button size="compact-xs" variant="light" onClick={() => setEdit({ ...t })}>Edit</Button></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal opened={!!edit} onClose={() => setEdit(null)} title={`Edit: ${edit?.type || ""}`} size="lg">
        {edit && (
          <Stack gap="sm">
            <TextInput label="Subject" value={edit.subject || ""} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} />
            <Textarea label="Body" minRows={6} value={edit.body || ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })} description="Use {{name}} and {{company}} placeholders" />
            <Group justify="flex-end"><Button variant="default" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={async () => { await update.mutateAsync({ id: edit.id, subject: edit.subject, body: edit.body }); show("Template saved", "success"); setEdit(null); }} loading={update.isPending}>Save</Button></Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

// ═══ Custom Domain ═══
function DomainTab() {
  const { show } = useToast();
  const { data: settings, isLoading } = useBrandSettings();
  const verify = useVerifyDomain();
  const [domain, setDomain] = useState("");
  useEffect(() => { if (settings?.customDomain) setDomain(settings.customDomain); }, [settings]);
  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md" maw={560}>
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="xs">Custom Domain</Text>
        <Text size="sm" c="dimmed" mb="md">Point a domain like <b>hr.company.com</b> to HRPLUSE. After saving, add the shown DNS records at your registrar.</Text>
        <Group align="flex-end">
          <TextInput style={{ flex: 1 }} label="Domain" placeholder="hr.company.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <Button leftSection={<IconWorld size={14} />} loading={verify.isPending} onClick={async () => { try { const r = await verify.mutateAsync(domain); show("Domain verified", "success"); } catch (e) { show(e?.response?.data?.message || "Invalid domain", "error"); } }}>Verify</Button>
        </Group>
        {settings?.customDomain && (
          <Group mt="md" gap="xs">
            <Badge color="blue" variant="light">{settings.customDomain}</Badge>
            <Badge color={settings.sslStatus === "Active" ? "green" : "orange"} variant="light">SSL: {settings.sslStatus}</Badge>
          </Group>
        )}
      </Card>
      <Card withBorder radius="md" p="md" bg="gray.0">
        <Text size="xs" c="dimmed">Supported patterns: company.hrpluse.com · hr.company.com · people.company.com · hrms.company.com</Text>
      </Card>
    </Stack>
  );
}

// ═══ Main ═══
export default function BrandingManagement() {
  const { user } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  if (!canManage) return <AppEmptyState icon={<IconPalette size={24} />} message="Restricted" sub="White Label & Branding is available to Platform Owner / Admin only." />;

  return (
    <Box>
      <AppPageHeader title="White Label & Branding" sub="Customize logo, colors, login page, email templates & domain — with live preview" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="branding" leftSection={<IconPalette size={14} />}>Branding</Tabs.Tab>
          <Tabs.Tab value="login" leftSection={<IconLogin2 size={14} />}>Login Page</Tabs.Tab>
          <Tabs.Tab value="email" leftSection={<IconMail size={14} />}>Email Templates</Tabs.Tab>
          <Tabs.Tab value="domain" leftSection={<IconWorld size={14} />}>Custom Domain</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="branding"><BrandingTab /></Tabs.Panel>
        <Tabs.Panel value="login"><LoginTab /></Tabs.Panel>
        <Tabs.Panel value="email"><EmailTab /></Tabs.Panel>
        <Tabs.Panel value="domain"><DomainTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
