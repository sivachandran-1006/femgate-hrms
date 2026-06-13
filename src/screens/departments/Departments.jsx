import { useState, useEffect } from "react";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon,
  Avatar, ScrollArea, Table, TextInput, Stack, Loader, Alert, Box, Button,
} from "@mantine/core";
import {
  IconBuildingCommunity, IconUsers, IconUserCheck, IconStack2,
  IconPlus, IconPencil, IconTrash, IconSearch, IconAlertCircle, IconAlertTriangle,
} from "@tabler/icons-react";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";
import { useToast }       from "../../components/ui/Toast";
import {
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
} from "../../queries/useDepartments";

const EMPTY_FORM = { name: "", headName: "", location: "" };

const DeptModal = ({ open, onClose, onSave, editData, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(editData
        ? { name: editData.name || "", headName: editData.headName || "", location: editData.location || "" }
        : EMPTY_FORM);
    }
  }, [open, editData]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <AppModal
      opened={open}
      onClose={onClose}
      title={editData ? "Edit Department" : "Add Department"}
      icon={<IconBuildingCommunity size={16} color="#3b82f6" />}
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
          value={form.headName}
          onChange={handleChange("headName")}
        />
        <AppInput
          label="Location"
          placeholder="e.g. Chennai HQ"
          value={form.location}
          onChange={handleChange("location")}
        />
        <Group justify="flex-end" gap="sm" mt="xs">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          <AppButton
            loading={saving}
            onClick={() => { if (form.name.trim()) onSave(form); }}
          >
            {editData ? "Save Changes" : "Add Department"}
          </AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

const Departments = () => {
  const { show: showToast } = useToast();
  const { data: departments = [], isLoading, isError } = useDepartments();

  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const deleteMut = useDeleteDepartment();

  const [searchTerm, setSearchTerm]     = useState("");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.headName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = departments.reduce((s, d) => s + (d.employeeCount || 0), 0);
  const uniqueHeads    = new Set(departments.map((d) => d.headName).filter(Boolean)).size;

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, ...form });
        showToast("Department updated", "success");
      } else {
        await createMut.mutateAsync(form);
        showToast("Department added", "success");
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save department", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch {
      showToast("Failed to delete department", "error");
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-") : "—";

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
              <IconBuildingCommunity size={16} />
            </Avatar>
            <Text size="sm" fw={600}>{dept.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">{dept.headName || "—"}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap={6} wrap="nowrap">
            <IconUsers size={14} />
            <Text size="sm" fw={500}>{dept.employeeCount || 0}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">{fmtDate(dept.createdAt)}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color="green" variant="light" radius="xl">Active</Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon
              variant="light" color="blue" size="sm" radius="md" title="Edit"
              onClick={() => { setEditTarget(dept); setModalOpen(true); }}
            >
              <IconPencil size={13} />
            </ActionIcon>
            <ActionIcon
              variant="light" color="red" size="sm" radius="md" title="Delete"
              onClick={() => setDeleteTarget(dept)}
            >
              <IconTrash size={13} />
            </ActionIcon>
          </Group>
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
            leftSection={<IconPlus size={16} />}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
          >
            Add Department
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard
          icon={<IconBuildingCommunity size={22} />}
          label="Total Departments"
          value={departments.length}
          color="blue"
        />
        <AppStatCard
          icon={<IconUsers size={22} />}
          label="Total Employees"
          value={totalEmployees}
          color="green"
        />
        <AppStatCard
          icon={<IconUserCheck size={22} />}
          label="Department Heads"
          value={uniqueHeads}
          color="violet"
        />
        <AppStatCard
          icon={<IconStack2 size={22} />}
          label="Active Teams"
          value={departments.length}
          color="blue"
        />
      </SimpleGrid>

      <AppSection mb="md" p="md">
        <TextInput
          placeholder="Search departments..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 340 }}
          radius="md"
          size="sm"
        />
      </AppSection>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}

      {isError && (
        <Alert icon={<IconAlertCircle size={16}/>} color="red" mb="md">
          Failed to load departments. Make sure the backend is running and you are logged in.
        </Alert>
      )}

      {!isLoading && !isError && (
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
      )}

      <DeptModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        editData={editTarget}
        saving={createMut.isPending || updateMut.isPending}
      />

      {/* Delete confirm */}
      <AppModal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Department"
        icon={<IconAlertTriangle size={16} color="#ef4444" />}
        iconColor="#ef4444"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete{" "}
            <Text span fw={700}>{deleteTarget?.name}</Text>?
            Employees in this department will not be removed.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} loading={deleteMut.isPending}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Departments;
