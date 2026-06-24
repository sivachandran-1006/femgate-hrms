import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, SimpleGrid, TextInput, Select, Progress } from "@mantine/core";
import {
  IconUser, IconPhone, IconCheck, IconAlertCircle,
  IconBuildingBank, IconFileText, IconShieldCheck, IconUserCircle,
} from "@tabler/icons-react";
import { fetchMyEmployee, updateMyProfile } from "../../api/approvalsApi";
import { useCreateDocument } from "../../queries/useSelfService";
import { useToast } from "../../components/ui/Toast";

const STEPS = [
  { id: "personal",   label: "Personal Info",     icon: IconUser,          pct: 20 },
  { id: "emergency",  label: "Emergency Contact", icon: IconPhone,         pct: 20 },
  { id: "bank",       label: "Bank Information",  icon: IconBuildingBank,  pct: 20 },
  { id: "govt",       label: "Govt IDs",          icon: IconShieldCheck,   pct: 20 },
  { id: "docs",       label: "Documents",         icon: IconFileText,      pct: 20 },
];

const inp = (dark) => ({
  input: { background: dark ? "#0f172a" : "#f8fafc", borderColor: dark ? "#334155" : "#e2e8f0", color: dark ? "#f1f5f9" : "#0f172a" },
  label: { color: dark ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 12 },
});

export default function SelfOnboarding({ darkMode }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const { data: emp } = useQuery({
    queryKey: ["my-employee"],
    queryFn: () => fetchMyEmployee().then(r => r.data?.data ?? r.data),
  });

  const [personal, setPersonal] = useState({
    dob: "", gender: "", maritalStatus: "", bloodGroup: "",
    nationality: "", address: "", city: "", state: "", country: "India", postalCode: "",
  });
  const [emergency, setEmergency] = useState({ name: "", relationship: "", phone: "", address: "" });
  const [bank, setBank] = useState({ bankName: "", accountHolder: "", accountNumber: "", ifsc: "", upi: "" });
  const [govt, setGovt] = useState({ pan: "", aadhaar: "", passport: "", uan: "", esi: "", drivingLicense: "" });
  const [uploadedDocs, setUploadedDocs] = useState({});   // { docName: { fileName } }
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const { show } = useToast();
  const createDoc = useCreateDocument();

  const saveMut = useMutation({
    mutationFn: (data) => updateMyProfile(data),
    onSuccess: () => { qc.invalidateQueries(["my-employee"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const handleDocUpload = async (docName, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { show("File exceeds 5MB limit", "error"); return; }
    setUploadingDoc(docName);
    try {
      await createDoc.mutateAsync({
        name: `${docName} — ${emp?.name || "Me"}`,
        category: "Onboarding",
        docType: docName,
        fileUrl: `/files/onboarding/${docName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        fileSize: file.size,
        mimeType: file.type,
      });
      setUploadedDocs((p) => ({ ...p, [docName]: { fileName: file.name } }));
      show(`${docName} uploaded`, "success");
    } catch (e) {
      show(e?.response?.data?.message || `Failed to upload ${docName}`, "error");
    } finally {
      setUploadingDoc(null);
    }
  };

  const completion = emp?.profileCompletion || 0;

  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";
  const page   = darkMode ? "#0f172a" : "#f1f5f9";

  const handleSave = () => {
    const payload = {
      ...personal,
      emergencyContact: JSON.stringify(emergency),
      bankDetails:      JSON.stringify(bank),
      ...govt,
    };
    saveMut.mutate(payload);
  };

  return (
    <Box style={{ background: page, minHeight: "100vh", padding: 0 }}>
      {/* Header */}
      <Box style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "32px 32px 20px", marginBottom: 0 }}>
        <Group justify="space-between" wrap="wrap" gap="md">
          <Box>
            <Text fz="xl" fw={800} c="#fff">Complete Your Profile</Text>
            <Text fz="sm" c="rgba(255,255,255,0.75)" mt={2}>
              Welcome, {emp?.name || "Employee"}! Complete your profile to get started.
            </Text>
          </Box>
          <Box style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "14px 20px", minWidth: 180 }}>
            <Text fz="xs" c="rgba(255,255,255,0.8)" fw={600} mb={6}>Profile Completion</Text>
            <Group gap={10} align="center">
              <Text fz="2rem" fw={900} c="#fff" lh={1}>{completion}%</Text>
              <Box style={{ flex: 1 }}>
                <Progress value={completion} color={completion >= 80 ? "green" : "blue"} size={8} radius="xl" />
              </Box>
            </Group>
          </Box>
        </Group>

        {/* Step tabs */}
        <Box style={{ display: "flex", gap: 8, marginTop: 24, overflowX: "auto", paddingBottom: 4 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = completion >= (i + 1) * 20;
            const active = step === i;
            return (
              <button key={s.id} onClick={() => setStep(i)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                borderRadius: 10, border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.3)"}`,
                background: active ? "#fff" : "rgba(255,255,255,0.1)",
                color: active ? "#1d4ed8" : "#fff", fontWeight: 600, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {done ? <IconCheck size={14} stroke={2.5} /> : <Icon size={14} stroke={1.8} />}
                {s.label}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{s.pct}%</span>
              </button>
            );
          })}
        </Box>
      </Box>

      <Box style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Box style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, padding: 28 }}>

          {/* Step 0 — Personal Info */}
          {step === 0 && (
            <Box>
              <Text fw={700} fz="lg" c={text} mb={20}>Personal Information</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput type="date" label="Date of Birth" value={personal.dob}
                  onChange={e => setPersonal(p => ({ ...p, dob: e.target.value }))} styles={inp(darkMode)} />
                <Select label="Gender" value={personal.gender}
                  onChange={v => setPersonal(p => ({ ...p, gender: v }))}
                  data={["Male","Female","Non-binary","Prefer not to say"]} styles={inp(darkMode)} />
                <Select label="Marital Status" value={personal.maritalStatus}
                  onChange={v => setPersonal(p => ({ ...p, maritalStatus: v }))}
                  data={["Single","Married","Divorced","Widowed"]} styles={inp(darkMode)} />
                <Select label="Blood Group" value={personal.bloodGroup}
                  onChange={v => setPersonal(p => ({ ...p, bloodGroup: v }))}
                  data={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} styles={inp(darkMode)} />
                <TextInput label="Nationality" placeholder="Indian" value={personal.nationality}
                  onChange={e => setPersonal(p => ({ ...p, nationality: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Postal Code" placeholder="600001" value={personal.postalCode}
                  onChange={e => setPersonal(p => ({ ...p, postalCode: e.target.value }))} styles={inp(darkMode)} />
              </SimpleGrid>
              <TextInput label="Address" placeholder="123, Street Name" mt="md" value={personal.address}
                onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} styles={inp(darkMode)} />
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
                <TextInput label="City" placeholder="Chennai" value={personal.city}
                  onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="State" placeholder="Tamil Nadu" value={personal.state}
                  onChange={e => setPersonal(p => ({ ...p, state: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Country" placeholder="India" value={personal.country}
                  onChange={e => setPersonal(p => ({ ...p, country: e.target.value }))} styles={inp(darkMode)} />
              </SimpleGrid>
            </Box>
          )}

          {/* Step 1 — Emergency Contact */}
          {step === 1 && (
            <Box>
              <Text fw={700} fz="lg" c={text} mb={20}>Emergency Contact</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="Contact Name" placeholder="Full name" value={emergency.name}
                  onChange={e => setEmergency(p => ({ ...p, name: e.target.value }))} styles={inp(darkMode)} />
                <Select label="Relationship" value={emergency.relationship}
                  onChange={v => setEmergency(p => ({ ...p, relationship: v }))}
                  data={["Father","Mother","Spouse","Sibling","Friend","Other"]} styles={inp(darkMode)} />
                <TextInput label="Mobile Number" placeholder="+91 9876543210" value={emergency.phone}
                  onChange={e => setEmergency(p => ({ ...p, phone: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Address" placeholder="Home address" value={emergency.address}
                  onChange={e => setEmergency(p => ({ ...p, address: e.target.value }))} styles={inp(darkMode)} />
              </SimpleGrid>
            </Box>
          )}

          {/* Step 2 — Bank Info */}
          {step === 2 && (
            <Box>
              <Text fw={700} fz="lg" c={text} mb={20}>Bank Information</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="Bank Name" placeholder="State Bank of India" value={bank.bankName}
                  onChange={e => setBank(p => ({ ...p, bankName: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Account Holder Name" placeholder="Full name" value={bank.accountHolder}
                  onChange={e => setBank(p => ({ ...p, accountHolder: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Account Number" placeholder="00000000000" value={bank.accountNumber}
                  onChange={e => setBank(p => ({ ...p, accountNumber: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="IFSC Code" placeholder="SBIN0000123" value={bank.ifsc}
                  onChange={e => setBank(p => ({ ...p, ifsc: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="UPI ID" placeholder="name@upi" value={bank.upi}
                  onChange={e => setBank(p => ({ ...p, upi: e.target.value }))} styles={inp(darkMode)} />
              </SimpleGrid>
            </Box>
          )}

          {/* Step 3 — Govt IDs */}
          {step === 3 && (
            <Box>
              <Text fw={700} fz="lg" c={text} mb={20}>Government Information</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="PAN Number" placeholder="ABCDE1234F" value={govt.pan}
                  onChange={e => setGovt(p => ({ ...p, pan: e.target.value.toUpperCase() }))} styles={inp(darkMode)} />
                <TextInput label="Aadhaar Number" placeholder="0000 0000 0000" value={govt.aadhaar}
                  onChange={e => setGovt(p => ({ ...p, aadhaar: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Passport Number" placeholder="A1234567" value={govt.passport}
                  onChange={e => setGovt(p => ({ ...p, passport: e.target.value.toUpperCase() }))} styles={inp(darkMode)} />
                <TextInput label="UAN (PF)" placeholder="100000000000" value={govt.uan}
                  onChange={e => setGovt(p => ({ ...p, uan: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="ESI Number" placeholder="ESI number" value={govt.esi}
                  onChange={e => setGovt(p => ({ ...p, esi: e.target.value }))} styles={inp(darkMode)} />
                <TextInput label="Driving License" placeholder="TN0120230000001" value={govt.drivingLicense}
                  onChange={e => setGovt(p => ({ ...p, drivingLicense: e.target.value.toUpperCase() }))} styles={inp(darkMode)} />
              </SimpleGrid>
            </Box>
          )}

          {/* Step 4 — Documents */}
          {step === 4 && (
            <Box>
              <Text fw={700} fz="lg" c={text} mb={20}>Document Uploads</Text>
              <Text fz="sm" c={sub} mb={16}>Upload your documents below. Supported: PDF, JPG, PNG (max 5MB each)</Text>
              {[
                "Profile Photo","PAN Copy","Aadhaar Copy","Passport",
                "Resume","Education Certificates","Experience Certificates",
                "Offer Letter","Relieving Letter",
              ].map((doc) => (
                <Group key={doc} justify="space-between" align="center"
                  style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${uploadedDocs[doc] ? "#86efac" : border}`, marginBottom: 8, background: uploadedDocs[doc] ? "#f0fdf4" : "transparent" }}>
                  <Group gap={10}>
                    <IconFileText size={16} color={uploadedDocs[doc] ? "#16a34a" : sub} stroke={1.8} />
                    <Box>
                      <Text fz="sm" c={text} fw={500}>{doc}</Text>
                      {uploadedDocs[doc] && <Text fz="xs" c="#16a34a">{uploadedDocs[doc].fileName}</Text>}
                    </Box>
                  </Group>
                  {uploadedDocs[doc] ? (
                    <Group gap={6}>
                      <IconCheck size={14} color="#16a34a" stroke={2.5} />
                      <Text fz="xs" fw={600} c="#16a34a">Uploaded</Text>
                    </Group>
                  ) : (
                    <label style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid ${border}`,
                      background: "transparent", color: sub, fontSize: 12, fontWeight: 600,
                      cursor: uploadingDoc === doc ? "wait" : "pointer", opacity: uploadingDoc === doc ? 0.6 : 1,
                    }}>
                      {uploadingDoc === doc ? "Uploading…" : "Upload"}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
                        disabled={uploadingDoc === doc}
                        onChange={(e) => handleDocUpload(doc, e.target.files?.[0])} />
                    </label>
                  )}
                </Group>
              ))}
              <Box style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", border: "1px solid #bfdbfe", marginTop: 16 }}>
                <Group gap={8}>
                  <IconAlertCircle size={14} color="#2563eb" stroke={2} />
                  <Text fz="xs" c="#1d4ed8">Uploaded documents are sent to HR for verification. Max 5MB each (PDF, JPG, PNG).</Text>
                </Group>
              </Box>
            </Box>
          )}

          {/* Navigation */}
          <Group justify="space-between" mt="xl">
            <button onClick={() => step > 0 && setStep(s => s - 1)} style={{
              padding: "9px 20px", borderRadius: 8, border: `1px solid ${border}`,
              background: "transparent", color: sub, fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer",
              opacity: step === 0 ? 0.4 : 1,
            }}>Back</button>
            <Group gap={10}>
              <button onClick={handleSave} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: saveMut.isPending ? "#94a3b8" : "#3b82f6",
                color: "#fff", fontWeight: 600, cursor: "pointer",
              }}>
                {saved ? <><IconCheck size={14} stroke={2.5} /> Saved!</> : saveMut.isPending ? "Saving..." : "Save & Continue"}
              </button>
              {step < STEPS.length - 1 && (
                <button onClick={() => setStep(s => s + 1)} style={{
                  padding: "9px 20px", borderRadius: 8, border: `1px solid ${border}`,
                  background: "transparent", color: text, fontWeight: 600, cursor: "pointer",
                }}>Next</button>
              )}
            </Group>
          </Group>
        </Box>

        {/* Completion tracker */}
        <Box style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, padding: 24, marginTop: 16 }}>
          <Text fw={700} fz="sm" c={text} mb={16}>Profile Completion Tracker</Text>
          <Box style={{ display: "flex", gap: 8 }}>
            {STEPS.map((s, i) => {
              const done = completion >= (i + 1) * 20;
              return (
                <Box key={s.id} style={{ flex: 1, textAlign: "center" }}>
                  <Box style={{
                    height: 6, borderRadius: 3, marginBottom: 6,
                    background: done ? "#22c55e" : i === step ? "#3b82f6" : border,
                  }} />
                  <Text fz={10} c={done ? "#22c55e" : i === step ? "#3b82f6" : sub} fw={600}>{s.pct}%</Text>
                </Box>
              );
            })}
          </Box>
          <Group justify="flex-end" mt={8}>
            <Text fz="sm" fw={700} c={completion >= 100 ? "#22c55e" : text}>{completion}% Complete</Text>
          </Group>
        </Box>
      </Box>
    </Box>
  );
}
