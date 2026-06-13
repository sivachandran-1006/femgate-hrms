import { useState } from "react";
import { Modal, TextInput, Select, Group, Box, Text, Stepper, SimpleGrid, Badge } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import {
  IconUser, IconBriefcase, IconMail, IconPhone, IconCalendar,
  IconBuilding, IconCheck, IconSend, IconDeviceFloppy,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { fetchDesignations } from "../../api/designationApi";

const ROLES = ["EMPLOYEE", "HR", "ADMIN", "FINANCE", "IT_ADMIN", "SUPER_ADMIN"];
const EMP_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];

const field = (darkMode) => ({
  input: {
    background: darkMode ? "#0f172a" : "#f8fafc",
    borderColor: darkMode ? "#334155" : "#e2e8f0",
    color: darkMode ? "#f1f5f9" : "#0f172a",
  },
  label: { color: darkMode ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 12 },
});

const EmployeeModal = ({
  opened,
  onClose,
  editingEmployee,
  employees = [],
  onSave,
  onSaveAndInvite,
  darkMode = false,
}) => {
  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";

  const [active, setActive] = useState(0);
  const [form, setForm] = useState(() => editingEmployee ? {
    firstName:      editingEmployee.name?.split(" ")[0] || "",
    lastName:       editingEmployee.name?.split(" ").slice(1).join(" ") || "",
    email:          editingEmployee.email || "",
    phone:          editingEmployee.phone || "",
    department:     editingEmployee.department || "",
    designation:    editingEmployee.designation || "",
    designationId:  editingEmployee.designationId || "",
    branchId:       editingEmployee.branchId || "",
    reportingTo:    editingEmployee.reportingTo || "",
    joinDate:       editingEmployee.joinDate ? new Date(editingEmployee.joinDate) : null,
    employmentType: editingEmployee.employmentType || "Full-time",
    role:           editingEmployee.user?.role || "EMPLOYEE",
    salary:         editingEmployee.salary || "",
    status:         editingEmployee.status || "Active",
  } : {
    firstName: "", lastName: "", email: "", phone: "",
    department: "", designation: "", designationId: "",
    branchId: "", reportingTo: "", joinDate: null,
    employmentType: "Full-time", role: "EMPLOYEE", salary: "", status: "Active",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => fetchBranches().then(r => r.data?.data ?? r.data ?? []),
  });

  const { data: designations = [] } = useQuery({
    queryKey: ["designations"],
    queryFn: () => fetchDesignations().then(r => r.data?.data ?? r.data ?? []),
  });

  const depts = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const managers = employees.filter(e => e.status === "Active");

  const buildPayload = () => ({
    name:           `${form.firstName} ${form.lastName}`.trim(),
    email:          form.email,
    phone:          form.phone,
    department:     form.department,
    designation:    form.designation,
    designationId:  form.designationId ? parseInt(form.designationId) : null,
    branchId:       form.branchId ? parseInt(form.branchId) : null,
    reportingTo:    form.reportingTo ? parseInt(form.reportingTo) : null,
    joinDate:       form.joinDate?.toISOString() || new Date().toISOString(),
    employmentType: form.employmentType,
    salary:         parseFloat(form.salary) || 0,
    status:         form.status,
    role:           form.role,
  });

  const handleSave        = () => onSave?.(buildPayload());
  const handleSaveInvite  = () => onSaveAndInvite?.(buildPayload());

  const steps = ["Basic Info", "Job Details", "Review"];

  const isStep0Valid = form.firstName && form.email;
  const isStep1Valid = form.department && form.joinDate;

  return (
    <Modal
      opened={opened} onClose={onClose}
      title={editingEmployee ? "Edit Employee" : "Add Employee"}
      centered size="lg" radius="xl"
      styles={{
        header: { background: card, borderBottom: `1px solid ${border}` },
        body:   { background: card, paddingTop: 20 },
        title:  { color: text, fontWeight: 800, fontSize: 18 },
      }}
    >
      {/* Stepper */}
      <Box style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <Box key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {i < steps.length - 1 && (
              <Box style={{ position: "absolute", top: 14, left: "50%", width: "100%", height: 2, background: i < active ? "#3b82f6" : border, zIndex: 0 }} />
            )}
            <Box style={{
              width: 28, height: 28, borderRadius: "50%", zIndex: 1,
              background: i < active ? "#3b82f6" : i === active ? "#3b82f6" : border,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${i <= active ? "#3b82f6" : border}`,
            }}>
              {i < active
                ? <IconCheck size={14} color="#fff" stroke={2.5} />
                : <Text fz={12} fw={700} c={i === active ? "#fff" : sub}>{i + 1}</Text>
              }
            </Box>
            <Text fz={11} fw={600} c={i === active ? "#3b82f6" : sub} mt={4}>{s}</Text>
          </Box>
        ))}
      </Box>

      {/* Step 0 — Basic Info */}
      {active === 0 && (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SimpleGrid cols={2} spacing="sm">
            <TextInput label="First Name" placeholder="Ravi" required
              value={form.firstName} onChange={e => set("firstName", e.target.value)}
              leftSection={<IconUser size={15} stroke={1.8} />}
              styles={field(darkMode)} />
            <TextInput label="Last Name" placeholder="Kumar"
              value={form.lastName} onChange={e => set("lastName", e.target.value)}
              leftSection={<IconUser size={15} stroke={1.8} />}
              styles={field(darkMode)} />
          </SimpleGrid>
          <TextInput label="Official Email" placeholder="ravi@company.com" required
            value={form.email} onChange={e => set("email", e.target.value)}
            leftSection={<IconMail size={15} stroke={1.8} />}
            styles={field(darkMode)} />
          <TextInput label="Mobile Number" placeholder="+91 9876543210"
            value={form.phone} onChange={e => set("phone", e.target.value)}
            leftSection={<IconPhone size={15} stroke={1.8} />}
            styles={field(darkMode)} />
          <Select label="Role" value={form.role} onChange={v => set("role", v)}
            data={ROLES} styles={field(darkMode)} />
        </Box>
      )}

      {/* Step 1 — Job Details */}
      {active === 1 && (
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SimpleGrid cols={2} spacing="sm">
            <Select label="Department" placeholder="Select department"
              value={form.department} onChange={v => set("department", v)}
              data={depts.length ? depts : ["Engineering", "HR", "Finance", "Marketing", "Operations"]}
              searchable styles={field(darkMode)} />
            <Select label="Designation" placeholder="Select designation"
              value={form.designationId ? String(form.designationId) : null}
              onChange={v => {
                const d = designations.find(x => String(x.id) === v);
                set("designationId", v);
                set("designation", d?.name || "");
              }}
              data={designations.map(d => ({ value: String(d.id), label: d.name }))}
              searchable styles={field(darkMode)} />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="sm">
            <Select label="Branch" placeholder="Select branch"
              value={form.branchId ? String(form.branchId) : null}
              onChange={v => set("branchId", v)}
              data={branches.map(b => ({ value: String(b.id), label: b.name }))}
              searchable styles={field(darkMode)} />
            <Select label="Employment Type" value={form.employmentType} onChange={v => set("employmentType", v)}
              data={EMP_TYPES} styles={field(darkMode)} />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="sm">
            <DateInput label="Joining Date" placeholder="Pick date" required
              value={form.joinDate} onChange={v => set("joinDate", v)}
              leftSection={<IconCalendar size={15} stroke={1.8} />}
              styles={field(darkMode)} />
            <TextInput label="Salary (₹)" placeholder="50000"
              value={form.salary} onChange={e => set("salary", e.target.value)}
              styles={field(darkMode)} />
          </SimpleGrid>
          <Select label="Reporting Manager" placeholder="Select manager"
            value={form.reportingTo ? String(form.reportingTo) : null}
            onChange={v => set("reportingTo", v)}
            data={managers.map(e => ({ value: String(e.id), label: e.name }))}
            searchable clearable styles={field(darkMode)} />
        </Box>
      )}

      {/* Step 2 — Review */}
      {active === 2 && (
        <Box>
          <Box style={{ background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <Text fz="sm" fw={700} c={text} mb={12}>Employee Summary</Text>
            {[
              ["Name",            `${form.firstName} ${form.lastName}`],
              ["Email",           form.email],
              ["Phone",           form.phone || "—"],
              ["Department",      form.department || "—"],
              ["Designation",     form.designation || "—"],
              ["Branch",          branches.find(b => String(b.id) === String(form.branchId))?.name || "—"],
              ["Employment Type", form.employmentType],
              ["Joining Date",    form.joinDate?.toLocaleDateString("en-IN") || "—"],
              ["Role",            form.role],
              ["Salary",          form.salary ? `₹${Number(form.salary).toLocaleString("en-IN")}` : "—"],
            ].map(([k, v]) => (
              <Group key={k} justify="space-between" py={6} style={{ borderBottom: `1px solid ${border}` }}>
                <Text fz="xs" c={sub} fw={600}>{k}</Text>
                <Text fz="xs" c={text} fw={600}>{v}</Text>
              </Group>
            ))}
          </Box>
          {!editingEmployee && (
            <Box style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
              <Group gap={8}>
                <IconSend size={14} color="#3b82f6" stroke={2} />
                <Text fz="xs" c="#1d4ed8" fw={600}>
                  "Create & Send Invite" will send an activation email to {form.email}
                </Text>
              </Group>
            </Box>
          )}
        </Box>
      )}

      {/* Navigation Buttons */}
      <Group justify="space-between" mt="xl">
        <button
          onClick={() => active > 0 ? setActive(a => a - 1) : onClose()}
          style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, fontWeight: 600, cursor: "pointer" }}
        >
          {active === 0 ? "Cancel" : "Back"}
        </button>
        <Group gap={8}>
          {active < 2 ? (
            <button
              onClick={() => setActive(a => a + 1)}
              disabled={active === 0 ? !isStep0Valid : !isStep1Valid}
              style={{
                padding: "9px 24px", borderRadius: 8, border: "none",
                background: (active === 0 ? isStep0Valid : isStep1Valid) ? "#3b82f6" : "#94a3b8",
                color: "#fff", fontWeight: 600, cursor: "pointer",
              }}
            >
              Next
            </button>
          ) : (
            <>
              <button onClick={handleSave} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 8, border: `1px solid ${border}`,
                background: "transparent", color: text, fontWeight: 600, cursor: "pointer",
              }}>
                <IconDeviceFloppy size={15} stroke={2} />
                {editingEmployee ? "Update" : "Save Draft"}
              </button>
              {!editingEmployee && (
                <button onClick={handleSaveInvite} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 8, border: "none",
                  background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer",
                }}>
                  <IconSend size={15} stroke={2} />
                  Create & Send Invite
                </button>
              )}
            </>
          )}
        </Group>
      </Group>
    </Modal>
  );
};

export default EmployeeModal;
