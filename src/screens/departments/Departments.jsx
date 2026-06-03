import { useState } from "react";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon,
  Avatar, ScrollArea, Table, TextInput, Stack,
} from "@mantine/core";
import {
  Building2, Users, UserCheck, Layers, Plus, Edit2, Search,
} from "lucide-react";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";

const DEPARTMENTS_INITIAL = [
  { id: 1, name: "IT",         head: "Siva",   employees: 7, created: "01-Jan-2026", status: "Active" },
  { id: 2, name: "HR",         head: "Mani",   employees: 1, created: "01-Jan-2026", status: "Active" },
  { id: 3, name: "Finance",    head: "Safeer", employees: 1, created: "01-Jan-2026", status: "Active" },
  { id: 4, name: "Management", head: "Siva",   employees: 1, created: "01-Jan-2026", status: "Active" },
];

const DeptModal = ({ open, onClose, onSave, editData }) => {
  const [form, setForm] = useState(editData || { name: "", head: "", description: "" });

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <AppModal
      opened={open}
      onClose={onClose}
      title={editData ? "Edit Department" : "Add Department"}
      icon={<Building2 size={16} color="#3b82f6" />}
      iconColor="#3b82f6"
    >
      <Stack gap="md">
        <AppInput
          label="Department Name"
          placeholder="e.g. Engineering"
          value={form.name}
          onChange={handleChange("name")}
        />
        <AppInput
          label="Department Head"
          placeholder="e.g. John Smith"
          value={form.head}
          onChange={handleChange("head")}
        />
        <AppInput
          type="textarea"
          label="Description"
          placeholder="Brief description of this department..."
          value={form.description}
          onChange={handleChange("description")}
        />
        <Group justify="flex-end" gap="sm" mt="xs">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          <AppButton
            onClick={() => {
              if (form.name.trim() && form.head.trim()) {
                onSave(form);
                onClose();
              }
            }}
          >
            {editData ? "Save Changes" : "Add Department"}
          </AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

const Departments = () => {
  const [departments, setDepartments] = useState(DEPARTMENTS_INITIAL);
  const [searchTerm, setSearchTerm]   = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = departments.reduce((s, d) => s + d.employees, 0);
  const uniqueHeads    = new Set(departments.map((d) => d.head)).size;
  const activeTeams    = departments.filter((d) => d.status === "Active").length;

  const handleAddSave = (form) => {
    setDepartments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        head: form.head,
        employees: 0,
        created: new Date()
          .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          .replace(/ /g, "-"),
        status: "Active",
      },
    ]);
  };

  const handleEditSave = (form) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === editTarget.id ? { ...d, name: form.name, head: form.head } : d
      )
    );
    setEditTarget(null);
  };

  const rows = filtered.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={6}>
        <AppEmptyState message="No departments found." />
      </Table.Td>
    </Table.Tr>
  ) : (
    filtered.map((dept) => (
      <Table.Tr key={dept.id}>
        <Table.Td>
          <Group gap="sm" wrap="nowrap">
            <Avatar size={32} radius="md" color="blue" variant="light">
              <Building2 size={16} />
            </Avatar>
            <Text size="sm" fw={600}>{dept.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">{dept.head}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap={6} wrap="nowrap">
            <Users size={14} />
            <Text size="sm" fw={500}>{dept.employees}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">{dept.created}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color="green" variant="light" radius="xl">{dept.status}</Badge>
        </Table.Td>
        <Table.Td>
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            radius="md"
            onClick={() => { setEditTarget(dept); setModalOpen(true); }}
          >
            <Edit2 size={13} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    ))
  );

  return (
    <>
      <AppPageHeader
        title="Departments"
        sub="Manage company departments and teams"
        action={
          <AppButton
            leftSection={<Plus size={16} />}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
          >
            Add Department
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard
          icon={<Building2 size={22} />}
          label="Total Departments"
          value={departments.length}
          color="blue"
        />
        <AppStatCard
          icon={<Users size={22} />}
          label="Total Employees"
          value={totalEmployees}
          color="green"
        />
        <AppStatCard
          icon={<UserCheck size={22} />}
          label="Department Heads"
          value={uniqueHeads}
          color="violet"
        />
        <AppStatCard
          icon={<Layers size={22} />}
          label="Active Teams"
          value={activeTeams}
          color="blue"
        />
      </SimpleGrid>

      <AppSection mb="md" p="md">
        <TextInput
          placeholder="Search departments..."
          leftSection={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 340 }}
          radius="md"
          size="sm"
        />
      </AppSection>

      <AppSection
        noPadding
        title="All Departments"
        sub={`${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
      >
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                {["Department", "Head", "Employees", "Created", "Status", "Actions"].map((col) => (
                  <Table.Th key={col}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
                      {col}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <DeptModal
        open={modalOpen && !editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleAddSave}
        editData={null}
      />
      <DeptModal
        open={modalOpen && !!editTarget}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleEditSave}
        editData={editTarget}
      />
    </>
  );
};

export default Departments;
