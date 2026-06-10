import { useState, useEffect } from "react";
import {
  IconUser, IconMail, IconPhone, IconMapPin, IconEdit,
  IconCheck, IconX, IconCamera, IconShieldCheck,
  IconCalendar, IconId, IconDroplet, IconHeart, IconBriefcase,
} from "@tabler/icons-react";
import {
  Group, Stack, Text, Badge, Avatar, Paper, Box,
  Progress, SimpleGrid, ThemeIcon,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppInput }       from "../../components/ui/AppInput";

import { useAuth }        from "../../hooks/useAuth";
import { useMyProfile, useUpdateMyProfile } from "../../queries/useSelfService";
import { useToast }       from "../../components/ui/Toast";
import { COLORS }         from "../../theme/colors";

// ── Field component ───────────────────────────────────────────────────────────

const FIELD = ({ label, value, icon: Icon, editable, editKey, form, onChange, readOnly }) => {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
        {label}
      </Text>
      {editable && !readOnly ? (
        <AppInput
          value={form[editKey] ?? value}
          onChange={(e) => onChange(editKey, e.target.value)}
          size="sm"
        />
      ) : (
        <Group
          gap="sm"
          p="xs"
          style={{
            borderRadius: 8,
            background: readOnly ? "var(--mantine-color-gray-0)" : "var(--mantine-color-gray-1)",
            border: "1px solid transparent",
          }}
          wrap="nowrap"
        >
          {Icon && <Icon size={15} color="#868e96" stroke={1.8} />}
          <Text size="sm" c={readOnly ? "dimmed" : undefined} style={{ flex: 1 }}>{value || "—"}</Text>
          {readOnly && (
            <Badge size="xs" color="gray" variant="light" radius="xl" style={{ flexShrink: 0 }}>LOCKED</Badge>
          )}
        </Group>
      )}
    </Stack>
  );
};

// ── Section title ─────────────────────────────────────────────────────────────

const SecTitle = ({ icon: Icon, title, color = "blue" }) => (
  <Group gap="sm" mb="md" wrap="nowrap">
    <ThemeIcon size={32} color={color} variant="light" radius="md">
      <Icon size={16} stroke={2} />
    </ThemeIcon>
    <Text size="md" fw={700}>{title}</Text>
  </Group>
);

// ── Main Component ────────────────────────────────────────────────────────────

const MyProfile = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const { data: me }    = useMyProfile();
  const updateMut       = useUpdateMyProfile();

  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form, setForm] = useState({
    mobile:        "",
    emergency:     "+91 98765 00000",
    address:       "",
    bloodGroup:    "B+",
    dob:           "",
    maritalStatus: "Single",
    pan:           "ABCDE1234F",
    aadhaar:       "XXXX XXXX 1234",
    bank:          "HDFC Bank — AC: XXXX1234",
  });

  // Sync API data into the form once loaded
  useEffect(() => {
    if (me) {
      setForm((f) => ({
        ...f,
        mobile:  me.phone || "",
        address: [me.address, me.city, me.state].filter(Boolean).join(", "),
        dob:     me.dob ? me.dob.split("T")[0] : "",
      }));
    }
  }, [me]);

  const emp = {
    employeeId:    me?.employeeId || "—",
    name:          me?.name        || user?.name  || "Employee",
    email:         me?.email       || user?.email || "",
    department:    me?.department  || "—",
    designation:   me?.designation || "—",
    manager:       "Siva",
    joinDate:      me?.joinDate
      ? new Date(me.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    completionPct: 78,
  };

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({ phone: form.mobile, address: form.address });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
      show("Profile updated successfully", "success");
    } catch {
      show("Failed to update profile", "error");
    }
  };

  const headerAction = (
    <Group gap="sm" wrap="nowrap">
      {saved && (
        <Group gap="xs" p="xs" style={{ background: "var(--mantine-color-green-0)", borderRadius: 8 }}>
          <IconCheck size={15} stroke={2.5} color={COLORS.success} />
          <Text size="sm" fw={600} c="green">Saved successfully</Text>
        </Group>
      )}
      {editing ? (
        <>
          <AppButton variant="default" leftSection={<IconX size={15} />} onClick={() => setEditing(false)}>
            Cancel
          </AppButton>
          <AppButton leftSection={<IconCheck size={15} />} onClick={handleSave}>
            Save Changes
          </AppButton>
        </>
      ) : (
        <AppButton leftSection={<IconEdit size={15} />} onClick={() => setEditing(true)}>
          Edit Profile
        </AppButton>
      )}
    </Group>
  );

  return (
    <>
      <AppPageHeader
        title="My Profile"
        sub="View and manage your personal information"
        action={headerAction}
      />

      <Group align="flex-start" gap="md" wrap="nowrap" style={{ alignItems: "stretch" }}>
        {/* Left column */}
        <Stack gap="md" style={{ width: 300, flexShrink: 0 }}>
          {/* Avatar card */}
          <Paper withBorder radius="xl" p="md" style={{ textAlign: "center" }}>
            <Box style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <Avatar
                size={90}
                radius="xl"
                color="blue"
                variant="light"
                style={{ margin: "0 auto", border: `3px solid ${COLORS.primaryLight}` }}
              >
                <Text fw={700} style={{ fontSize: "2rem" }}>{emp.name.slice(0, 2).toUpperCase()}</Text>
              </Avatar>
              {editing && (
                <Box
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 28, height: 28, borderRadius: "50%",
                    background: COLORS.primary, border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <IconCamera size={13} color="#fff" stroke={2} />
                </Box>
              )}
            </Box>
            <Text size="md" fw={700}>{emp.name}</Text>
            <Text size="sm" c="dimmed" mt={3}>{emp.designation}</Text>
            <Badge color="blue" variant="light" radius="xl" mt="xs">{emp.department}</Badge>

            <Box mt="md" style={{ textAlign: "left" }}>
              <Group justify="space-between" mb={5}>
                <Text size="xs" c="dimmed">Profile Completion</Text>
                <Text size="xs" fw={700} c="blue">{emp.completionPct}%</Text>
              </Group>
              <Progress value={emp.completionPct} color="blue" radius="xl" size="sm" />
              <Text size="xs" c="dimmed" mt={5}>Add bank details to complete</Text>
            </Box>
          </Paper>

          {/* Job Info */}
          <AppSection title="">
            <SecTitle icon={IconBriefcase} title="Job Info" color="violet" />
            <Stack gap="xs">
              {[
                { label: "Employee ID", value: emp.employeeId  },
                { label: "Department",  value: emp.department  },
                { label: "Designation", value: emp.designation },
                { label: "Manager",     value: emp.manager     },
                { label: "Joined",      value: emp.joinDate    },
              ].map((r) => (
                <Group key={r.label} justify="space-between" pb="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                  <Text size="xs" c="dimmed">{r.label}</Text>
                  <Text size="xs" fw={600}>{r.value}</Text>
                </Group>
              ))}
            </Stack>
          </AppSection>
        </Stack>

        {/* Right column */}
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {/* Personal Info */}
          <AppSection title="">
            <SecTitle icon={IconUser} title="Personal Information" color="blue" />
            <SimpleGrid cols={2} spacing="md">
              <FIELD label="Full Name"       value={emp.name}           icon={IconUser}      editable={false} readOnly={true}    form={form} onChange={change} editKey="name"        />
              <FIELD label="Email Address"   value={emp.email}          icon={IconMail}      editable={false} readOnly={true}    form={form} onChange={change} editKey="email"       />
              <FIELD label="Mobile Number"   value={form.mobile}        icon={IconPhone}     editable={editing} readOnly={false} form={form} onChange={change} editKey="mobile"      />
              <FIELD label="Date of Birth"   value={form.dob}           icon={IconCalendar}  editable={editing} readOnly={false} form={form} onChange={change} editKey="dob"         />
              <FIELD label="Blood Group"     value={form.bloodGroup}    icon={IconDroplet}   editable={editing} readOnly={false} form={form} onChange={change} editKey="bloodGroup"  />
              <FIELD label="Marital Status"  value={form.maritalStatus} icon={IconHeart}     editable={editing} readOnly={false} form={form} onChange={change} editKey="maritalStatus" />
              <Box style={{ gridColumn: "1 / -1" }}>
                <FIELD label="Address" value={form.address} icon={IconMapPin} editable={editing} readOnly={false} form={form} onChange={change} editKey="address" />
              </Box>
              <FIELD label="Emergency Contact" value={form.emergency}   icon={IconPhone}     editable={editing} readOnly={false} form={form} onChange={change} editKey="emergency"   />
            </SimpleGrid>
          </AppSection>

          {/* ID & Bank Details */}
          <AppSection title="">
            <SecTitle icon={IconShieldCheck} title="ID & Bank Details" color="green" />
            <SimpleGrid cols={2} spacing="md">
              <FIELD label="PAN Number"    value={form.pan}     icon={IconId}       editable={editing} readOnly={false} form={form} onChange={change} editKey="pan"     />
              <FIELD label="Aadhaar Number"value={form.aadhaar} icon={IconId}       editable={editing} readOnly={false} form={form} onChange={change} editKey="aadhaar" />
              <Box style={{ gridColumn: "1 / -1" }}>
                <FIELD label="Bank Details" value={form.bank}  icon={IconBriefcase} editable={editing} readOnly={false} form={form} onChange={change} editKey="bank"    />
              </Box>
            </SimpleGrid>
            {!editing && (
              <Group
                gap="sm"
                mt="md"
                p="xs"
                style={{
                  background: "var(--mantine-color-yellow-0)",
                  border: "1px solid var(--mantine-color-yellow-2)",
                  borderRadius: 8,
                }}
                wrap="nowrap"
              >
                <IconShieldCheck size={16} color={COLORS.warning} stroke={2} />
                <Text size="xs" c="yellow.8" fw={500}>Sensitive fields are masked. Click Edit Profile to update.</Text>
              </Group>
            )}
          </AppSection>
        </Stack>
      </Group>
    </>
  );
};

export default MyProfile;
