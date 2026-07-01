import { useState, useEffect } from "react";
import {
  IconBell, IconBuilding, IconShield, IconDeviceFloppy,
  IconPalette, IconAlertTriangle, IconLoader2,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Stack, Group, Text, Paper, SimpleGrid,
  TextInput, Select, Button, UnstyledButton,
} from "@mantine/core";
import { COLORS }    from "../../theme/colors";
import { RADIUS, TRANSITION, ICON_SIZE, ICON_STROKE } from "../../theme/sizes";
import { useToast }  from "../../components/ui/Toast";
import {
  getCompanySettings, updateCompanySettings,
  getNotificationSettings, updateNotificationSettings,
} from "../../api/companyApi";
import { getSecuritySettings, updateSecuritySettings } from "../../api/securityApi";

const MOCK_COMPANY_DATA = {
  profile: {
    name:     "Mgate Technologies",
    email:    "hr@mgate.com",
    timezone: "Asia/Kolkata",
    currency: "INR",
  },
  branding: {
    primaryColor: "#2563eb",
  },
};

const MOCK_NOTIF_DATA = {
  notifications: [
    { id: "email_global",       active: true  },
    { id: "leave_apply",        active: true  },
    { id: "payroll_run",        active: true  },
    { id: "attendance_summary", active: false },
  ],
};

const MOCK_SECURITY_DATA = {
  mfaEnabled:         false,
  sessionTimeout:     "30",
  ipWhitelistEnabled: false,
  auditLogging:       true,
};

// The 4 page toggles map to notification-setting rows in the DB
const NOTIF_DEFS = [
  { id: "email_global",       label: "Email Notifications", sub: "Receive system emails for key events",       channel: "Email",          trigger: "Global email switch" },
  { id: "leave_apply",        label: "Leave Alerts",        sub: "Notify when a leave is applied or approved", channel: "In-App + Email", trigger: "When employee applies leave" },
  { id: "payroll_run",        label: "Payroll Alerts",      sub: "Notify on payroll run completion",           channel: "In-App",         trigger: "When payroll is generated" },
  { id: "attendance_summary", label: "Attendance Alerts",   sub: "Daily attendance summary emails",            channel: "Email",          trigger: "Daily attendance digest" },
];

const Toggle = ({ checked, onChange }) => (
  <UnstyledButton
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 26, borderRadius: RADIUS.full,
      background: checked ? COLORS.primary : COLORS.gray300,
      cursor: "pointer", padding: 3,
      display: "flex", alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      transition: TRANSITION, flexShrink: 0,
    }}
  >
    <Box style={{ width: 18, height: 18, borderRadius: RADIUS.full, background: COLORS.white, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
  </UnstyledButton>
);

const ToggleRow = ({ label, sub, checked, onChange, isLast }) => (
  <Group
    justify="space-between"
    align="center"
    py="sm"
    style={{ borderBottom: isLast ? "none" : "1px solid var(--mantine-color-default-border)" }}
  >
    <Box>
      <Text fw={500}>{label}</Text>
      {sub && <Text size="sm" c="dimmed" mt={2}>{sub}</Text>}
    </Box>
    <Toggle checked={checked} onChange={onChange} />
  </Group>
);

const SectionCard = ({ children, dangerBorder = false }) => (
  <Paper
    radius="xl"
    withBorder
    shadow="sm"
    p="lg"
    mb="md"
    style={dangerBorder ? { borderColor: COLORS.dangerMuted } : undefined}
  >
    {children}
  </Paper>
);

const SectionTitle = ({ icon: Icon, iconColor, children, color }) => (
  <Group gap="xs" mb="md">
    <Icon size={ICON_SIZE.sm} color={iconColor} stroke={ICON_STROKE.normal} />
    <Text size="lg" fw={700} c={color}>{children}</Text>
  </Group>
);

const Settings = ({ darkMode = false }) => {
  const { show } = useToast();
  const queryClient = useQueryClient();

  // ── Server data ──
  const { data: companyDataRaw }  = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings,      select: (r) => r?.data ?? r });
  const { data: notifDataRaw }    = useQuery({ queryKey: ["notif-settings"],   queryFn: getNotificationSettings, select: (r) => r?.data ?? r });
  const { data: securityDataRaw } = useQuery({ queryKey: ["security-settings"],queryFn: getSecuritySettings,     select: (r) => r?.data ?? r });

  const companyData  = companyDataRaw  ?? MOCK_COMPANY_DATA;
  const notifData    = notifDataRaw    ?? MOCK_NOTIF_DATA;
  const securityData = securityDataRaw ?? MOCK_SECURITY_DATA;

  // ── Local form state ──
  const [companyName, setCompanyName] = useState("");
  const [hrEmail, setHrEmail]         = useState("");
  const [timezone, setTimezone]       = useState("Asia/Kolkata");
  const [currency, setCurrency]       = useState("INR");
  const [language, setLanguage]       = useState(localStorage.getItem("hrms-language") || "English");

  const [toggles, setToggles] = useState({ email_global: true, leave_apply: true, payroll_run: true, attendance_summary: true });

  const [twoFactor, setTwoFactor]           = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordExpiry, setPasswordExpiry] = useState(localStorage.getItem("hrms-password-expiry") || "90");

  // Sync from server once loaded
  useEffect(() => {
    const p = companyData?.profile;
    if (p) {
      setCompanyName(p.name || "");
      setHrEmail(p.email || "");
      setTimezone(p.timezone || "Asia/Kolkata");
      setCurrency(p.currency || "INR");
    }
  }, [companyData]);

  useEffect(() => {
    const rows = notifData?.notifications;
    if (rows) {
      setToggles((prev) => {
        const next = { ...prev };
        for (const def of NOTIF_DEFS) {
          const row = rows.find((r) => r.id === def.id);
          if (row) next[def.id] = row.active;
        }
        return next;
      });
    }
  }, [notifData]);

  useEffect(() => {
    if (securityData) {
      setTwoFactor(!!securityData.mfaEnabled);
      setSessionTimeout(String(securityData.sessionTimeout || "30"));
    }
  }, [securityData]);

  // ── Save ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateCompanySettings({
        profile: { name: companyName, email: hrEmail, timezone, currency },
      });
      await updateNotificationSettings({
        notifications: NOTIF_DEFS.map((d) => ({ ...d, active: toggles[d.id] })),
      });
      await updateSecuritySettings({
        mfaEnabled:         twoFactor,
        sessionTimeout,
        // echo back unrelated security flags so they are not clobbered
        ipWhitelistEnabled: securityData?.ipWhitelistEnabled ?? false,
        auditLogging:       securityData?.auditLogging ?? false,
      });
      localStorage.setItem("hrms-language", language);
      localStorage.setItem("hrms-password-expiry", passwordExpiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      queryClient.invalidateQueries({ queryKey: ["notif-settings"] });
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      show("Settings saved", "success");
    },
    onError: () => show("Failed to save settings", "error"),
  });

  const [saved, setSaved] = useState(false);
  const handleSave = () => saveMutation.mutate();

  const setToggle = (id) => (v) => setToggles((t) => ({ ...t, [id]: v }));

  return (
    <Box maw={820}>
      {/* Page Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Stack gap={4}>
          <Text size="2xl" fw={700}>Settings</Text>
          <Text c="dimmed">Configure your HRMS preferences</Text>
        </Stack>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          color={saved ? "green" : "blue"}
          leftSection={
            saveMutation.isPending
              ? <IconLoader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              : <IconDeviceFloppy size={16} stroke={2} />
          }
          loading={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </Group>

      {/* Company Information */}
      <SectionCard>
        <SectionTitle icon={IconBuilding} iconColor={COLORS.primary}>
          Company Information
        </SectionTitle>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="sm">
          <TextInput
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
          />
          <TextInput
            label="HR Email"
            type="email"
            value={hrEmail}
            onChange={(e) => setHrEmail(e.target.value)}
            placeholder="hr@company.com"
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="sm">
          <Select
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            data={[
              { value: "Asia/Kolkata",      label: "Asia/Kolkata (IST)" },
              { value: "UTC",               label: "UTC" },
              { value: "America/New_York",  label: "America/New_York (EST)" },
              { value: "Europe/London",     label: "Europe/London (GMT)" },
              { value: "Asia/Singapore",    label: "Asia/Singapore (SGT)" },
              { value: "Australia/Sydney",  label: "Australia/Sydney (AEST)" },
            ]}
          />
          <Select
            label="Currency"
            value={currency}
            onChange={setCurrency}
            data={[
              { value: "INR", label: "INR — Indian Rupee (₹)" },
              { value: "USD", label: "USD — US Dollar ($)" },
              { value: "EUR", label: "EUR — Euro (€)" },
              { value: "GBP", label: "GBP — British Pound (£)" },
              { value: "SGD", label: "SGD — Singapore Dollar (S$)" },
              { value: "AUD", label: "AUD — Australian Dollar (A$)" },
            ]}
          />
        </SimpleGrid>
        <Box style={{ maxWidth: "calc(50% - 8px)" }}>
          <Select
            label="Language"
            value={language}
            onChange={setLanguage}
            data={["English","Tamil","Hindi","Telugu","Kannada"]}
          />
        </Box>
      </SectionCard>

      {/* Notifications */}
      <SectionCard>
        <SectionTitle icon={IconBell} iconColor={COLORS.warning}>
          Notifications
        </SectionTitle>
        {NOTIF_DEFS.map((d, i) => (
          <ToggleRow
            key={d.id}
            label={d.label}
            sub={d.sub}
            checked={toggles[d.id]}
            onChange={setToggle(d.id)}
            isLast={i === NOTIF_DEFS.length - 1}
          />
        ))}
      </SectionCard>

      {/* Security */}
      <SectionCard>
        <SectionTitle icon={IconShield} iconColor={COLORS.danger}>
          Security
        </SectionTitle>
        <ToggleRow
          label="Two-Factor Authentication"
          sub="Require OTP on every login"
          checked={twoFactor}
          onChange={setTwoFactor}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
          <Select
            label="Session Timeout (minutes)"
            value={sessionTimeout}
            onChange={setSessionTimeout}
            data={[
              { value: "15",  label: "15 min" },
              { value: "30",  label: "30 min" },
              { value: "60",  label: "60 min" },
              { value: "120", label: "120 min" },
            ]}
          />
          <Select
            label="Password Expiry (days)"
            value={passwordExpiry}
            onChange={setPasswordExpiry}
            data={["30","60","90","180","Never"]}
          />
        </SimpleGrid>
      </SectionCard>

      {/* Appearance */}
      <SectionCard>
        <SectionTitle icon={IconPalette} iconColor={COLORS.purple}>
          Appearance
        </SectionTitle>
        {/* Dark Mode row */}
        <Group
          justify="space-between"
          align="center"
          py="sm"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Box>
            <Text fw={500}>Dark Mode</Text>
            <Text size="sm" c="dimmed" mt={2}>Controlled by the sidebar toggle</Text>
          </Box>
          {/* read-only toggle — cursor not-allowed, no functional onChange */}
          <Box
            style={{
              width: 44, height: 26, borderRadius: RADIUS.full,
              background: darkMode ? COLORS.primary : COLORS.gray300,
              display: "flex", alignItems: "center",
              justifyContent: darkMode ? "flex-end" : "flex-start",
              padding: 3, opacity: 0.6, cursor: "not-allowed", flexShrink: 0,
            }}
          >
            <Box style={{ width: 18, height: 18, borderRadius: RADIUS.full, background: COLORS.white, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </Box>
        </Group>
        {/* Primary Color row */}
        <Group justify="space-between" align="center" py="sm">
          <Box>
            <Text fw={500}>Primary Color</Text>
            <Text size="sm" c="dimmed" mt={2}>Set in Company Settings → Branding</Text>
          </Box>
          <Group gap="xs">
            <Box
              style={{
                width: 26, height: 26, borderRadius: RADIUS.full,
                background: companyData?.branding?.primaryColor || COLORS.primary,
                border: "2px solid var(--mantine-color-default-border)", flexShrink: 0,
              }}
            />
            <Text size="sm" fw={500} c="dimmed" ff="monospace">
              {companyData?.branding?.primaryColor || "#2563eb"}
            </Text>
          </Group>
        </Group>
      </SectionCard>

      {/* Danger Zone */}
      <SectionCard dangerBorder>
        <SectionTitle icon={IconAlertTriangle} iconColor={COLORS.danger} color="red">
          Danger Zone
        </SectionTitle>
        <Group justify="space-between" align="center">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500}>Reset All Settings</Text>
            <Text size="sm" c="dimmed" mt={2}>
              Restore all settings to factory defaults and save. This action cannot be undone.
            </Text>
          </Box>
          <Button
            color="red"
            variant="light"
            ml="xl"
            style={{ flexShrink: 0 }}
            onClick={() => {
              if (window.confirm("Reset all settings to factory defaults?")) {
                setTimezone("Asia/Kolkata");
                setCurrency("INR");
                setLanguage("English");
                setToggles({ email_global: true, leave_apply: true, payroll_run: true, attendance_summary: true });
                setTwoFactor(false);
                setSessionTimeout("30");
                setPasswordExpiry("90");
                show("Defaults restored — click Save Changes to apply", "info");
              }
            }}
          >
            Reset All Settings
          </Button>
        </Group>
      </SectionCard>
    </Box>
  );
};

export default Settings;
