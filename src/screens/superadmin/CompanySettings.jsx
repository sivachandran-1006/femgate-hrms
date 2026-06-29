import { useState, useRef, useEffect } from "react";
import {
  Stack, TextInput, Select, Tabs, Paper, Button, Badge,
  Switch, ColorInput, Modal, Textarea, Text, Title, Group, Box,
  ActionIcon, Table, ThemeIcon, Divider, SimpleGrid,
  FileButton, Image,
} from "@mantine/core";
import {
  IconBuilding, IconPalette, IconMail, IconBell, IconUpload,
  IconDeviceFloppy, IconX, IconChevronRight,
  IconFileText, IconWorld,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanySettings, updateCompanySettings,
  uploadCompanyLogo, uploadCompanyFavicon,
  getEmailTemplates, updateEmailTemplate,
  getNotificationSettings, updateNotificationSettings,
} from "../../api/companyApi";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

// ── Static config only (no fake data) ────────────────────────────────────────
const INIT_COMPANY = {
  name: "", legalName: "", gstin: "", pan: "", cin: "",
  email: "", phone: "", website: "", address: "",
  city: "", state: "", pincode: "", country: "India",
  industry: "", employees: "", founded: "",
  timezone: "Asia/Kolkata", currency: "INR", dateFormat: "DD/MM/YYYY",
  fiscalYear: "April - March",
};

const INIT_BRANDING = {
  primaryColor: "#2563eb", accentColor: "#7c3aed",
  logoUrl: "", faviconUrl: "", emailHeader: "", tagline: "", footerText: "",
};

const VARIABLES = "{{employee_name}}  {{company_name}}  {{leave_type}}  {{from_date}}  {{to_date}}  {{month}}  {{year}}  {{name}}";

// ── Helpers ───────────────────────────────────────────────────────────────────
const sf = (label, key, state, set, opts) => (
  <Select key={key} label={label} value={state[key]} data={opts}
    onChange={v => set(p => ({ ...p, [key]: v }))} />
);

export default function CompanySettings() {
  const [company,  setCompany]  = useState(INIT_COMPANY);
  const [branding, setBranding] = useState(INIT_BRANDING);
  const [notifs,   setNotifs]   = useState([]);
  const [editTpl,  setEditTpl]  = useState(null);
  const [tab,      setTab]      = useState("profile");

  const logoRef    = useRef(null);
  const faviconRef = useRef(null);

  const toast = useToast();
  const notify = (msg, type = "success") => toast?.show(msg, type);

  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: settingsData } = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings });
  const { data: templatesData } = useQuery({ queryKey: ["email-templates"], queryFn: getEmailTemplates });
  const { data: notifsData } = useQuery({ queryKey: ["notif-settings"], queryFn: getNotificationSettings });

  useEffect(() => {
    const d = settingsData?.data;
    if (d?.profile) setCompany(p => ({ ...p, ...d.profile }));
    if (d?.branding) setBranding(p => ({ ...p, ...d.branding }));
  }, [settingsData]);

  useEffect(() => {
    const notifs = notifsData?.data?.notifications;
    if (notifs?.length) setNotifs(notifs);
  }, [notifsData]);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const settingsMutation = useMutation({
    mutationFn: (data) => updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      notify("Settings saved successfully");
    },
    onError: () => notify("Failed to save settings", "error"),
  });

  const logoMutation = useMutation({
    mutationFn: (file) => uploadCompanyLogo(file),
    onSuccess: (res) => {
      if (res?.url) setBranding(p => ({ ...p, logoUrl: res.url }));
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      notify("Logo uploaded successfully");
    },
    onError: () => notify("Failed to upload logo", "error"),
  });

  const faviconMutation = useMutation({
    mutationFn: (file) => uploadCompanyFavicon(file),
    onSuccess: (res) => {
      if (res?.url) setBranding(p => ({ ...p, faviconUrl: res.url }));
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      notify("Favicon uploaded successfully");
    },
    onError: () => notify("Failed to upload favicon", "error"),
  });

  const emailTplMutation = useMutation({
    mutationFn: ({ id, data }) => updateEmailTemplate(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      notify(`"${vars.label}" template saved`);
      setEditTpl(null);
    },
    onError: () => notify("Failed to save template", "error"),
  });

  const notifsMutation = useMutation({
    mutationFn: (data) => updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-settings"] });
      notify("Notification settings saved");
    },
    onError: () => notify("Failed to save notification settings", "error"),
  });

  // ── File handlers ─────────────────────────────────────────────────────────────
  const handleFile = (key, nameKey, _ref, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Please upload an image file", "error"); return; }
    setBranding(p => ({ ...p, [key]: URL.createObjectURL(file), [nameKey]: file.name }));
    if (key === "logoUrl") {
      logoMutation.mutate(file);
    } else {
      faviconMutation.mutate(file);
    }
  };

  const clearFile = (key, nameKey, ref) => {
    setBranding(p => ({ ...p, [key]: "", [nameKey]: "" }));
    if (ref.current) ref.current.value = "";
  };

  // ── Profile Tab ──────────────────────────────────────────────────────────────
  const ProfileTab = () => (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconBuilding size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Basic Information</Text>
            <Text size="xs" c="dimmed">Legal and contact details</Text>
          </div>
        </Group>
        <SimpleGrid cols={2} spacing="md">
          <TextInput label="Company Name"  value={company.name}       onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} />
          <TextInput label="Legal Name"    value={company.legalName}  onChange={e => setCompany(p => ({ ...p, legalName: e.target.value }))} />
          <TextInput label="GSTIN"         value={company.gstin}      onChange={e => setCompany(p => ({ ...p, gstin: e.target.value }))} />
          <TextInput label="PAN"           value={company.pan}        onChange={e => setCompany(p => ({ ...p, pan: e.target.value }))} />
          <TextInput label="CIN"           value={company.cin}        onChange={e => setCompany(p => ({ ...p, cin: e.target.value }))} />
          <TextInput label="Industry"      value={company.industry}   onChange={e => setCompany(p => ({ ...p, industry: e.target.value }))} />
          <TextInput label="Founded Year"  value={company.founded}    onChange={e => setCompany(p => ({ ...p, founded: e.target.value }))} />
          {sf("Company Size", "employees", company, setCompany, ["1-10","11-50","50-200","200-500","500-1000","1000+"])}
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconWorld size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Contact & Location</Text>
            <Text size="xs" c="dimmed">Registered address and contact info</Text>
          </div>
        </Group>
        <SimpleGrid cols={2} spacing="md">
          <TextInput label="Email"   value={company.email}   onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} />
          <TextInput label="Phone"   value={company.phone}   onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} />
          <TextInput label="Website" value={company.website} onChange={e => setCompany(p => ({ ...p, website: e.target.value }))} />
          <div />
          <TextInput label="Address" value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))} style={{ gridColumn: "span 2" }} />
          <TextInput label="City"    value={company.city}    onChange={e => setCompany(p => ({ ...p, city: e.target.value }))} />
          <TextInput label="State"   value={company.state}   onChange={e => setCompany(p => ({ ...p, state: e.target.value }))} />
          <TextInput label="Pincode" value={company.pincode} onChange={e => setCompany(p => ({ ...p, pincode: e.target.value }))} />
          <TextInput label="Country" value={company.country} onChange={e => setCompany(p => ({ ...p, country: e.target.value }))} />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconWorld size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Regional Settings</Text>
            <Text size="xs" c="dimmed">Timezone, currency and formats</Text>
          </div>
        </Group>
        <SimpleGrid cols={2} spacing="md">
          {sf("Timezone",    "timezone",   company, setCompany, ["Asia/Kolkata","Asia/Dubai","America/New_York","Europe/London","Asia/Singapore"])}
          {sf("Currency",    "currency",   company, setCompany, ["INR","USD","EUR","GBP","AED","SGD"])}
          {sf("Date Format", "dateFormat", company, setCompany, ["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"])}
          {sf("Fiscal Year", "fiscalYear", company, setCompany, ["April - March","January - December","October - September"])}
        </SimpleGrid>
      </Paper>

      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={14} />}
          loading={settingsMutation.isPending}
          onClick={() => settingsMutation.mutate({ profile: company, branding })}>
          Save Changes
        </Button>
      </Group>
    </Stack>
  );

  // ── Branding Tab ─────────────────────────────────────────────────────────────
  const UploadZone = ({ fileKey, nameKey, label, hint, fileRef }) => {
    const hasFile = !!branding[fileKey];
    return (
      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">{label}</Text>
        {hasFile ? (
          <Paper withBorder radius="md" p="sm">
            <Group gap="sm" wrap="nowrap">
              <Box w={fileKey === "logoUrl" ? 90 : 44} h={44} style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Image src={branding[fileKey]} alt={label} fit="contain" h={40} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>{branding[nameKey] || "Uploaded file"}</Text>
                <Text size="xs" c="dimmed">{hint}</Text>
              </Box>
              <Group gap="xs" wrap="nowrap">
                <FileButton accept="image/*" onChange={f => handleFile(fileKey, nameKey, fileRef, f)}>
                  {props => <Button {...props} size="xs" variant="default">Replace</Button>}
                </FileButton>
                <ActionIcon variant="light" color="red" onClick={() => clearFile(fileKey, nameKey, fileRef)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ) : (
          <FileButton accept="image/*" onChange={f => handleFile(fileKey, nameKey, fileRef, f)}>
            {props => (
              <Paper {...props} component="button" withBorder radius="md" p="xl"
                style={{ textAlign: "center", cursor: "pointer", borderStyle: "dashed", width: "100%", background: "transparent" }}>
                <Stack align="center" gap="xs">
                  <ThemeIcon variant="light" size="lg" radius="md"><IconUpload size={18} /></ThemeIcon>
                  <Text size="sm" fw={500}>Click to upload <Text span c="blue">or drag & drop</Text></Text>
                  <Text size="xs" c="dimmed">{hint}</Text>
                </Stack>
              </Paper>
            )}
          </FileButton>
        )}
      </Stack>
    );
  };

  const BrandingTab = () => (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconUpload size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Logo & Favicon</Text>
            <Text size="xs" c="dimmed">Upload your company logo and favicon</Text>
          </div>
        </Group>
        <SimpleGrid cols={2} spacing="lg">
          <UploadZone fileKey="logoUrl"    nameKey="logoName"    label="Company Logo" hint="Recommended: 200×60px · PNG, SVG, JPG" fileRef={logoRef}    />
          <UploadZone fileKey="faviconUrl" nameKey="faviconName" label="Favicon"      hint="Recommended: 32×32px · PNG, ICO"       fileRef={faviconRef} />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconPalette size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Brand Colors</Text>
            <Text size="xs" c="dimmed">Primary and accent colors used across the app</Text>
          </div>
        </Group>
        <SimpleGrid cols={2} spacing="md">
          <ColorInput label="Primary Color" value={branding.primaryColor} format="hex"
            onChange={v => setBranding(p => ({ ...p, primaryColor: v }))}
            swatches={["#2563eb","#7c3aed","#16a34a","#dc2626","#d97706","#0ea5e9","#ec4899","#0f172a"]} />
          <ColorInput label="Accent Color"  value={branding.accentColor}  format="hex"
            onChange={v => setBranding(p => ({ ...p, accentColor: v }))}
            swatches={["#7c3aed","#2563eb","#16a34a","#dc2626","#d97706","#0ea5e9","#ec4899","#0f172a"]} />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="md" p="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" radius="md"><IconFileText size={16} /></ThemeIcon>
          <div>
            <Text fw={600} size="sm">Brand Text</Text>
            <Text size="xs" c="dimmed">Tagline and footer used in emails and app</Text>
          </div>
        </Group>
        <Stack gap="md">
          <TextInput label="Email Header Text" value={branding.emailHeader} placeholder="e.g. MGate HRMS"
            onChange={e => setBranding(p => ({ ...p, emailHeader: e.target.value }))} />
          <TextInput label="Company Tagline"   value={branding.tagline}     placeholder="e.g. Empowering People. Enabling Growth."
            onChange={e => setBranding(p => ({ ...p, tagline: e.target.value }))} />
          <TextInput label="Email Footer Text" value={branding.footerText}  placeholder="e.g. © 2026 Company. All rights reserved."
            onChange={e => setBranding(p => ({ ...p, footerText: e.target.value }))} />
        </Stack>

        <Divider my="md" label="Email Preview" labelPosition="center" />
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          <Box p="sm" style={{ background: branding.primaryColor }}>
            <Group gap="sm">
              {branding.logoUrl
                ? <Image src={branding.logoUrl} h={28} fit="contain" />
                : <Text fw={700} size="sm" c="white">{branding.emailHeader}</Text>}
            </Group>
          </Box>
          <Box p="md" bg="var(--mantine-color-gray-0)">
            <Text size="xs" c="dimmed" fs="italic">Email body content goes here…</Text>
          </Box>
          <Box p="xs" bg="var(--mantine-color-gray-2)" style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">{branding.footerText}</Text>
          </Box>
        </Paper>
      </Paper>

      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={14} />}
          loading={settingsMutation.isPending}
          onClick={() => settingsMutation.mutate({ profile: company, branding })}>
          Save Branding
        </Button>
      </Group>
    </Stack>
  );

  // ── Email Templates Tab ───────────────────────────────────────────────────────
  const EmailTab = () => {
    const templates = templatesData?.data?.templates || [];
    return (
      <Stack gap="md">
        <div>
          <Text fw={600} size="sm">Email Templates</Text>
          <Text size="xs" c="dimmed">Customize automated emails. Use {"{{variable}}"} placeholders.</Text>
        </div>
        {templates.map(tpl => (
          <Paper key={tpl.id} withBorder radius="md" p="md">
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600}>{tpl.label}</Text>
                <Text size="xs" c="dimmed">Subject: {tpl.subject}</Text>
                <Text size="xs" c="dimmed" truncate>{tpl.body}</Text>
              </Stack>
              <Button size="xs" variant="default" rightSection={<IconChevronRight size={12} />}
                onClick={() => setEditTpl({ ...tpl })} style={{ flexShrink: 0 }}>
                Edit
              </Button>
            </Group>
          </Paper>
        ))}

        <Modal opened={!!editTpl} onClose={() => setEditTpl(null)} title={`Edit: ${editTpl?.label}`} size="lg" radius="md">
          {editTpl && (
            <Stack gap="md">
              <TextInput label="Subject" value={editTpl.subject}
                onChange={e => setEditTpl(p => ({ ...p, subject: e.target.value }))} />
              <Textarea label="Body" value={editTpl.body} rows={7} autosize minRows={5}
                onChange={e => setEditTpl(p => ({ ...p, body: e.target.value }))}
                styles={{ input: { fontFamily: "monospace", fontSize: 13 } }} />
              <Paper withBorder radius="sm" p="sm" bg="blue.0">
                <Text size="xs" fw={700} c="blue" mb={4}>AVAILABLE VARIABLES</Text>
                <Text size="xs" c="blue" style={{ fontFamily: "monospace" }}>{VARIABLES}</Text>
              </Paper>
              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={() => setEditTpl(null)}>Cancel</Button>
                <Button leftSection={<IconDeviceFloppy size={13} />}
                  loading={emailTplMutation.isPending}
                  onClick={() => emailTplMutation.mutate({
                    id: editTpl.id,
                    label: editTpl.label,
                    data: { subject: editTpl.subject, body: editTpl.body },
                  })}>
                  Save Template
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    );
  };

  // ── Notification Templates Tab ────────────────────────────────────────────────
  const NotifTab = () => (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm">Notification Templates</Text>
        <Text size="xs" c="dimmed">Control when and how notifications are sent to users.</Text>
      </div>
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {["Notification", "Channel", "Trigger", "Active"].map(h => (
                <Table.Th key={h}><Text size="xs" fw={700} tt="uppercase" c="dimmed">{h}</Text></Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {notifs.map(n => (
              <Table.Tr key={n.id}>
                <Table.Td><Text size="sm" fw={500}>{n.label}</Text></Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">{n.channel}</Badge>
                </Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{n.trigger}</Text></Table.Td>
                <Table.Td>
                  <Switch checked={n.active} size="sm"
                    onChange={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, active: !x.active } : x))} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={14} />}
          loading={notifsMutation.isPending}
          onClick={() => notifsMutation.mutate({ notifications: notifs })}>
          Save Settings
        </Button>
      </Group>
    </Stack>
  );

  // ── Root ──────────────────────────────────────────────────────────────────────
  return (
    <Stack gap="lg" p="lg">
      <AppPageHeader title="Company Settings" sub="Manage company profile, branding, and communication templates" />

      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="profile"  leftSection={<IconBuilding  size={14} />}>Company Profile</Tabs.Tab>
          <Tabs.Tab value="branding" leftSection={<IconPalette   size={14} />}>Branding</Tabs.Tab>
          <Tabs.Tab value="email"    leftSection={<IconMail      size={14} />}>Email Templates</Tabs.Tab>
          <Tabs.Tab value="notif"    leftSection={<IconBell      size={14} />}>Notification Templates</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">  <ProfileTab  /> </Tabs.Panel>
        <Tabs.Panel value="branding"> <BrandingTab /> </Tabs.Panel>
        <Tabs.Panel value="email">    <EmailTab    /> </Tabs.Panel>
        <Tabs.Panel value="notif">    <NotifTab    /> </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
