import { useState, useEffect } from "react";
import {
  IconUser, IconMail, IconPhone, IconMapPin, IconEdit,
  IconCheck, IconX, IconCamera, IconShieldCheck,
  IconCalendar, IconId, IconDroplet, IconHeart, IconBriefcase,
  IconAlertCircle, IconFolder,
} from "@tabler/icons-react";
import {
  Group, Stack, Text, Badge, Avatar, Paper, Box,
  Progress, SimpleGrid, ThemeIcon, Select, Tabs,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppInput }       from "../../components/ui/AppInput";

import { useAuth }        from "../../hooks/useAuth";
import { useMyProfile, useUpdateMyProfile } from "../../queries/useSelfService";
import { useMyDocuments, useCreateDocument, useDeleteDocument } from "../../queries/useSelfService";
import { useToast }       from "../../components/ui/Toast";
import { COLORS }         from "../../theme/colors";

// ── Field component ───────────────────────────────────────────────────────────
const FIELD = ({ label, value, icon: Icon, editable, editKey, form, onChange, readOnly, type = "text", options }) => (
  <Stack gap={4}>
    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>{label}</Text>
    {editable && !readOnly ? (
      options ? (
        <Select value={form[editKey] ?? value ?? null} onChange={(v) => onChange(editKey, v)}
          data={options} size="sm" comboboxProps={{ withinPortal: true }} />
      ) : (
        <AppInput type={type} value={form[editKey] ?? value} onChange={(e) => onChange(editKey, e.target.value)} size="sm" />
      )
    ) : (
      <Group gap="sm" p="xs" wrap="nowrap"
        style={{ borderRadius: 8, background: readOnly ? "var(--mantine-color-gray-0)" : "var(--mantine-color-gray-1)", border: "1px solid transparent" }}>
        {Icon && <Icon size={15} color="#868e96" stroke={1.8} />}
        <Text size="sm" c={readOnly ? "dimmed" : undefined} style={{ flex: 1 }}>{value || "—"}</Text>
        {readOnly && <Badge size="xs" color="gray" variant="light" radius="xl" style={{ flexShrink: 0 }}>LOCKED</Badge>}
      </Group>
    )}
  </Stack>
);

const SecTitle = ({ icon: Icon, title, color = "blue" }) => (
  <Group gap="sm" mb="md" wrap="nowrap">
    <ThemeIcon size={32} color={color} variant="light" radius="md"><Icon size={16} stroke={2} /></ThemeIcon>
    <Text size="md" fw={700}>{title}</Text>
  </Group>
);

// ── Main Component ────────────────────────────────────────────────────────────
const MyProfile = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const { data: me }  = useMyProfile();
  const updateMut     = useUpdateMyProfile();
  const { data: docsRaw = [] } = useMyDocuments();
  const createDocMut  = useCreateDocument();
  const deleteDocMut  = useDeleteDocument();

  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [docFileName, setDocFileName] = useState("No file chosen");
  const [docForm, setDocForm]     = useState({ name: "", category: "Identity" });

  const [form, setForm] = useState({
    mobile: "", emergency: "", address: "",
    bloodGroup: "", maritalStatus: "", dob: "",
    pan: "", aadhaar: "", bank: "", ifsc: "",
    gender: "",
  });

  useEffect(() => {
    if (me) {
      setForm((f) => ({
        ...f,
        mobile:        me.phone        || "",
        address:       [me.address, me.city, me.state].filter(Boolean).join(", "),
        dob:           me.dob          ? me.dob.split("T")[0] : "",
        emergency:     me.emergencyContact || "",
        bloodGroup:    me.bloodGroup   || "",
        maritalStatus: me.maritalStatus || "",
        pan:           me.pan          || "",
        aadhaar:       me.aadhaar      || "",
        bank:          me.bankDetails  || "",
        gender:        me.gender       || "",
      }));
    }
  }, [me]);

  const emp = {
    employeeId:  me?.employeeId  || "—",
    name:        me?.name        || user?.name  || "Employee",
    email:       me?.email       || user?.email || "",
    department:  me?.department  || "—",
    designation: me?.designation || "—",
    joinDate:    me?.joinDate ? new Date(me.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    completionPct: 78,
  };

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({
        phone: form.mobile, address: form.address, dob: form.dob || null,
        emergencyContact: form.emergency, bloodGroup: form.bloodGroup,
        maritalStatus: form.maritalStatus, pan: form.pan, aadhaar: form.aadhaar,
        bankDetails: form.bank, gender: form.gender,
      });
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 2500);
      show("Profile updated successfully", "success");
    } catch {
      show("Failed to update profile", "error");
    }
  };

  const handleDocUpload = async () => {
    if (!docForm.name.trim()) return show("Enter document name", "error");
    try {
      await createDocMut.mutateAsync({
        name: docForm.name, category: docForm.category,
        fileUrl: `/files/${docForm.name.toLowerCase().replace(/\s+/g, "-")}`,
        fileSize: docFileName !== "No file chosen" ? docFileName : null,
      });
      show(`"${docForm.name}" uploaded`, "success");
      setDocForm({ name: "", category: "Identity" });
      setDocFileName("No file chosen");
    } catch { show("Failed to upload", "error"); }
  };

  const docs = docsRaw.map((d) => ({
    id:       d.id,
    name:     d.name,
    category: d.category || "Other",
    date:     (d.createdAt || "").split("T")[0],
    status:   d.expiryDate && new Date(d.expiryDate) < new Date() ? "Expired" : "Verified",
  }));

  const headerAction = (
    <Group gap="sm" wrap="nowrap">
      {saved && (
        <Group gap="xs" p="xs" style={{ background: "var(--mantine-color-green-0)", borderRadius: 8 }}>
          <IconCheck size={15} stroke={2.5} color={COLORS.success} />
          <Text size="sm" fw={600} c="green">Saved</Text>
        </Group>
      )}
      {(activeTab === "personal" || activeTab === "bank" || activeTab === "emergency") && (
        editing ? (
          <>
            <AppButton variant="default" leftSection={<IconX size={15} />} onClick={() => setEditing(false)}>Cancel</AppButton>
            <AppButton leftSection={<IconCheck size={15} />} onClick={handleSave} loading={updateMut.isPending}>Save Changes</AppButton>
          </>
        ) : (
          <AppButton leftSection={<IconEdit size={15} />} onClick={() => setEditing(true)}>Edit Profile</AppButton>
        )
      )}
    </Group>
  );

  return (
    <>
      <AppPageHeader title="My Profile" sub="View and manage your personal information" action={headerAction} />

      <Group align="flex-start" gap="md" wrap="nowrap" style={{ alignItems: "stretch" }}>
        {/* ── Left column ── */}
        <Stack gap="md" style={{ width: 260, flexShrink: 0 }}>
          <Paper withBorder radius="xl" p="md" style={{ textAlign: "center" }}>
            <Box style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <Avatar size={90} radius="xl" color="blue" variant="light"
                style={{ margin: "0 auto", border: `3px solid ${COLORS.primaryLight}` }}>
                <Text fw={700} style={{ fontSize: "2rem" }}>{emp.name.slice(0, 2).toUpperCase()}</Text>
              </Avatar>
              {editing && (
                <Box style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%",
                  background: COLORS.primary, border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
            </Box>
          </Paper>

          <AppSection title="">
            <SecTitle icon={IconBriefcase} title="Job Info" color="violet" />
            <Stack gap="xs">
              {[
                { label: "Employee ID", value: emp.employeeId  },
                { label: "Department",  value: emp.department  },
                { label: "Designation", value: emp.designation },
                { label: "Joined",      value: emp.joinDate    },
              ].map((r) => (
                <Group key={r.label} justify="space-between" pb="xs"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                  <Text size="xs" c="dimmed">{r.label}</Text>
                  <Text size="xs" fw={600}>{r.value}</Text>
                </Group>
              ))}
            </Stack>
          </AppSection>
        </Stack>

        {/* ── Right column with tabs ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="personal"  leftSection={<IconUser size={14} />}>Personal</Tabs.Tab>
              <Tabs.Tab value="employment" leftSection={<IconBriefcase size={14} />}>Employment</Tabs.Tab>
              <Tabs.Tab value="bank"       leftSection={<IconShieldCheck size={14} />}>Bank & ID</Tabs.Tab>
              <Tabs.Tab value="emergency"  leftSection={<IconAlertCircle size={14} />}>Emergency</Tabs.Tab>
              <Tabs.Tab value="documents"  leftSection={<IconFolder size={14} />}>Documents</Tabs.Tab>
            </Tabs.List>

            {/* ── Personal Tab ── */}
            <Tabs.Panel value="personal">
              <AppSection title="">
                <SecTitle icon={IconUser} title="Personal Information" color="blue" />
                <SimpleGrid cols={2} spacing="md">
                  <FIELD label="Full Name"      value={emp.name}           icon={IconUser}     editable={false} readOnly={true}    form={form} onChange={change} editKey="name"         />
                  <FIELD label="Email Address"  value={emp.email}          icon={IconMail}     editable={false} readOnly={true}    form={form} onChange={change} editKey="email"        />
                  <FIELD label="Mobile Number"  value={form.mobile}        icon={IconPhone}    editable={editing} readOnly={false} form={form} onChange={change} editKey="mobile"       />
                  <FIELD label="Date of Birth"  value={form.dob}           icon={IconCalendar} editable={editing} readOnly={false} form={form} onChange={change} editKey="dob"          type="date" />
                  <FIELD label="Gender"         value={form.gender}        icon={IconUser}     editable={editing} readOnly={false} form={form} onChange={change} editKey="gender"       options={["Male","Female","Other","Prefer not to say"]} />
                  <FIELD label="Blood Group"    value={form.bloodGroup}    icon={IconDroplet}  editable={editing} readOnly={false} form={form} onChange={change} editKey="bloodGroup"   options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} />
                  <FIELD label="Marital Status" value={form.maritalStatus} icon={IconHeart}    editable={editing} readOnly={false} form={form} onChange={change} editKey="maritalStatus" options={["Single","Married","Divorced","Widowed"]} />
                  <Box style={{ gridColumn: "1 / -1" }}>
                    <FIELD label="Address" value={form.address} icon={IconMapPin} editable={editing} readOnly={false} form={form} onChange={change} editKey="address" />
                  </Box>
                </SimpleGrid>
              </AppSection>
            </Tabs.Panel>

            {/* ── Employment Tab ── */}
            <Tabs.Panel value="employment">
              <AppSection title="">
                <SecTitle icon={IconBriefcase} title="Employment Information" color="violet" />
                <SimpleGrid cols={2} spacing="md">
                  {[
                    { label: "Employee ID",  value: emp.employeeId  },
                    { label: "Department",   value: emp.department  },
                    { label: "Designation",  value: emp.designation },
                    { label: "Date Joined",  value: emp.joinDate    },
                    { label: "Email",        value: emp.email       },
                  ].map((r) => (
                    <FIELD key={r.label} label={r.label} value={r.value} icon={IconBriefcase}
                      editable={false} readOnly={true} form={form} onChange={change} editKey={r.label} />
                  ))}
                </SimpleGrid>
                <Group gap="sm" mt="md" p="xs"
                  style={{ background: "var(--mantine-color-blue-0)", border: "1px solid var(--mantine-color-blue-2)", borderRadius: 8 }}>
                  <IconAlertCircle size={15} color={COLORS.primary} />
                  <Text size="xs" c="blue.7" fw={500}>Employment details can only be changed by HR. Contact HR to update.</Text>
                </Group>
              </AppSection>
            </Tabs.Panel>

            {/* ── Bank & ID Tab ── */}
            <Tabs.Panel value="bank">
              <AppSection title="">
                <SecTitle icon={IconShieldCheck} title="Bank & ID Information" color="green" />
                <SimpleGrid cols={2} spacing="md">
                  <FIELD label="PAN Number"    value={form.pan}    icon={IconId} editable={editing} readOnly={false} form={form} onChange={change} editKey="pan"    />
                  <FIELD label="Aadhaar Number"value={form.aadhaar}icon={IconId} editable={editing} readOnly={false} form={form} onChange={change} editKey="aadhaar"/>
                  <Box style={{ gridColumn: "1 / -1" }}>
                    <FIELD label="Bank Account Details" value={form.bank} icon={IconBriefcase} editable={editing} readOnly={false} form={form} onChange={change} editKey="bank" />
                  </Box>
                  <FIELD label="IFSC Code" value={form.ifsc} icon={IconId} editable={editing} readOnly={false} form={form} onChange={change} editKey="ifsc" />
                </SimpleGrid>
                {!editing && (
                  <Group gap="sm" mt="md" p="xs"
                    style={{ background: "var(--mantine-color-yellow-0)", border: "1px solid var(--mantine-color-yellow-2)", borderRadius: 8 }}>
                    <IconShieldCheck size={16} color={COLORS.warning} stroke={2} />
                    <Text size="xs" c="yellow.8" fw={500}>Sensitive fields are masked. Click Edit Profile to update.</Text>
                  </Group>
                )}
              </AppSection>
            </Tabs.Panel>

            {/* ── Emergency Contacts Tab ── */}
            <Tabs.Panel value="emergency">
              <AppSection title="">
                <SecTitle icon={IconAlertCircle} title="Emergency Contacts" color="red" />
                <Box mb="md">
                  <FIELD label="Primary Emergency Contact" value={form.emergency} icon={IconPhone}
                    editable={editing} readOnly={false} form={form} onChange={change} editKey="emergency" />
                </Box>
                <Group gap="sm" p="xs"
                  style={{ background: "var(--mantine-color-red-0)", border: "1px solid var(--mantine-color-red-2)", borderRadius: 8 }}>
                  <IconAlertCircle size={15} color={COLORS.danger} />
                  <Text size="xs" c="red.7" fw={500}>This contact will be reached in case of an emergency. Keep it up to date.</Text>
                </Group>
              </AppSection>
            </Tabs.Panel>

            {/* ── Documents Tab ── */}
            <Tabs.Panel value="documents">
              <AppSection title="">
                <Group justify="space-between" mb="md">
                  <SecTitle icon={IconFolder} title="My Documents" color="blue" />
                  <AppButton size="xs" leftSection={<IconCamera size={13} />} onClick={handleDocUpload} loading={createDocMut.isPending}>
                    Upload
                  </AppButton>
                </Group>

                {/* Upload form */}
                <SimpleGrid cols={2} spacing="sm" mb="md">
                  <AppInput label="Document Name" placeholder="e.g. Aadhaar Card" value={docForm.name}
                    onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))} size="sm" />
                  <AppInput type="select" label="Category" value={docForm.category}
                    onChange={(v) => setDocForm((f) => ({ ...f, category: v }))}
                    data={["Identity","Education","Employment","Financial","Other"]} size="sm" />
                </SimpleGrid>
                <Box mb="md">
                  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                    borderRadius: 10, border: "1.5px dashed var(--mantine-color-default-border)",
                    background: "var(--mantine-color-gray-0)", cursor: "pointer" }}>
                    <IconFolder size={16} color={COLORS.primary} stroke={2} />
                    <Text fz="sm" c="dimmed" style={{ flex: 1 }}>{docFileName}</Text>
                    <Text fz="xs" fw={600} c="blue" style={{ background: "var(--mantine-color-blue-0)", padding: "3px 10px", borderRadius: 20 }}>Browse</Text>
                    <input type="file" style={{ display: "none" }}
                      onChange={(e) => setDocFileName(e.target.files?.[0]?.name || "No file chosen")} />
                  </label>
                </Box>

                {/* Documents list */}
                {docs.length === 0 ? (
                  <Text ta="center" c="dimmed" fz="sm" py="xl">No documents uploaded yet</Text>
                ) : (
                  <Stack gap="xs">
                    {docs.map((d) => (
                      <Group key={d.id} justify="space-between" p="sm" wrap="nowrap"
                        style={{ borderRadius: 10, border: "1px solid var(--mantine-color-default-border)" }}>
                        <Group gap="sm" wrap="nowrap">
                          <ThemeIcon size={34} radius="md" color="blue" variant="light">
                            <IconFolder size={16} stroke={1.8} />
                          </ThemeIcon>
                          <Box>
                            <Text fz="sm" fw={600}>{d.name}</Text>
                            <Text fz="xs" c="dimmed">{d.category} · {d.date}</Text>
                          </Box>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <Badge size="xs" color={d.status === "Verified" ? "green" : "red"} variant="light">{d.status}</Badge>
                          {d.status !== "Verified" && (
                            <AppButton size="xs" variant="subtle" color="red"
                              onClick={() => deleteDocMut.mutate(d.id)}>
                              <IconX size={12} />
                            </AppButton>
                          )}
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                )}
              </AppSection>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Group>
    </>
  );
};

export default MyProfile;
