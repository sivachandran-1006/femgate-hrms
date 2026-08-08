import { useMemo, useState } from "react";
import {
  Stack, Group, Box, Text, Radio, Checkbox, SimpleGrid, Tabs, Badge,
  ScrollArea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconFileSpreadsheet, IconFilter, IconListCheck, IconSettings, IconLock,
} from "@tabler/icons-react";

import { AppModal } from "../../components/ui/AppModal";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { MasterDataSelect } from "../../components/ui/MasterDataSelect";
import { COLORS } from "../../theme/colors";

import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";
import { useBranches } from "../../queries/useBranches";
import {
  EXPORT_FIELD_GROUPS, DEFAULT_SELECTED_FIELDS,
  resolveExportColumns, buildExportRows, buildFileName, runExport,
} from "../../utils/employeeExport";

const STATUS_OPTIONS = ["Active", "Inactive", "Probation", "Notice Period", "Resigned", "Terminated"];
const EMPLOYMENT_TYPE_OPTIONS = ["Full-Time", "Contract", "Vendor", "Consultant", "Intern", "Freelancer"];
const DATE_FIELD_OPTIONS = ["Joining Date", "Last Updated", "Created Date", "Exit Date"];
const FORMAT_OPTIONS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv",  label: "CSV" },
  { value: "pdf",  label: "PDF (Summary Report)" },
];

export function ExportEmployeesModal({
  opened, onClose, employees = [], filteredEmployees = [], selectedEmployees = [],
  departments = [], deptFilter = "All",
}) {
  const { userRole } = useAuth();
  const can = usePermission();
  const canSeeSensitive = can("payroll.view_all");
  const { data: branches = [] } = useBranches();

  const [scope, setScope]                     = useState("filtered");
  const [statusFilter, setStatusFilter]       = useState(["Active"]);
  const [departmentId, setDepartmentId]       = useState(null);
  const [branchId, setBranchId]               = useState(null);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [dateField, setDateField]             = useState("Joining Date");
  const [dateFrom, setDateFrom]               = useState(null);
  const [dateTo, setDateTo]                   = useState(null);

  const [selectedFields, setSelectedFields] = useState(DEFAULT_SELECTED_FIELDS);

  const [format, setFormat]           = useState("xlsx");
  const [includeInactive, setIncludeInactive]   = useState(false);
  const [includeArchived, setIncludeArchived]   = useState(false);
  const [includeHidden, setIncludeHidden]       = useState(false);
  const [passwordProtect, setPasswordProtect]   = useState(false);
  const [compressZip, setCompressZip]           = useState(false);

  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState(null);

  const scopedEmployees = useMemo(() => {
    if (scope === "all") return employees;
    if (scope === "selected") return selectedEmployees;
    return filteredEmployees;
  }, [scope, employees, filteredEmployees, selectedEmployees]);

  const finalEmployees = useMemo(() => {
    return scopedEmployees.filter((e) => {
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(e.status);
      const matchDept   = !departmentId || String(e.departmentId ?? "") === departmentId || e.department === departmentId;
      const matchBranch = !branchId || String(e.branchId ?? "") === branchId || e.branch === branchId;
      const matchType    = employmentTypes.length === 0 || employmentTypes.includes(e.employmentType ?? e.type);
      return matchStatus && matchDept && matchBranch && matchType;
    });
  }, [scopedEmployees, statusFilter, departmentId, branchId, employmentTypes]);

  const availableFields = useMemo(
    () => EXPORT_FIELD_GROUPS.flatMap((g) => g.fields
      .filter((f) => canSeeSensitive || !f.sensitive)
      .map((f) => `${g.key}.${f.key}`)),
    [canSeeSensitive]
  );

  const effectiveSelectedFields = selectedFields.filter((k) => availableFields.includes(k));

  const toggleField = (fieldKey) => {
    setSelectedFields((cur) => cur.includes(fieldKey) ? cur.filter((k) => k !== fieldKey) : [...cur, fieldKey]);
  };
  const toggleGroup = (group, checked) => {
    const groupKeys = group.fields
      .filter((f) => canSeeSensitive || !f.sensitive)
      .map((f) => `${group.key}.${f.key}`);
    setSelectedFields((cur) => checked
      ? [...new Set([...cur, ...groupKeys])]
      : cur.filter((k) => !groupKeys.includes(k)));
  };

  const columns = useMemo(() => resolveExportColumns(effectiveSelectedFields), [effectiveSelectedFields]);
  const fileName = useMemo(() => buildFileName({ format, deptFilter: departmentId ? "Filtered" : deptFilter }), [format, departmentId, deptFilter]);

  const doReset = () => {
    setScope("filtered"); setStatusFilter(["Active"]); setDepartmentId(null); setBranchId(null);
    setEmploymentTypes([]); setDateField("Joining Date"); setDateFrom(null); setDateTo(null);
    setSelectedFields(DEFAULT_SELECTED_FIELDS); setFormat("xlsx");
    setIncludeInactive(false); setIncludeArchived(false); setIncludeHidden(false);
    setPasswordProtect(false); setCompressZip(false); setPreview(null);
  };

  const handleClose = () => { doReset(); onClose(); };

  const handlePreview = () => {
    const estimatedBytes = finalEmployees.length * columns.length * 18;
    setPreview({
      records: finalEmployees.length,
      columns: columns.length,
      sizeMb: (estimatedBytes / (1024 * 1024)).toFixed(1),
    });
  };

  const handleExport = async () => {
    if (finalEmployees.length === 0 || columns.length === 0) return;
    setExporting(true);
    try {
      const rows = buildExportRows(finalEmployees, columns);
      if (finalEmployees.length > 10000) {
        await new Promise((r) => setTimeout(r, 400));
      }
      runExport({ format, rows, fileName });
      handleClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppModal
      opened={opened}
      onClose={handleClose}
      title="Export Employees"
      subtitle={`${finalEmployees.length} employee${finalEmployees.length !== 1 ? "s" : ""} match current filters`}
      icon={<IconFileSpreadsheet size={16} color={COLORS.primary} />}
      iconColor={COLORS.primary}
      size="xl"
    >
      <Tabs defaultValue="filters">
        <Tabs.List mb="md">
          <Tabs.Tab value="filters" leftSection={<IconFilter size={14} />}>Filters</Tabs.Tab>
          <Tabs.Tab value="fields" leftSection={<IconListCheck size={14} />}>Fields</Tabs.Tab>
          <Tabs.Tab value="format" leftSection={<IconSettings size={14} />}>Format & Options</Tabs.Tab>
        </Tabs.List>

        <ScrollArea.Autosize mah={440} offsetScrollbars>
          {/* ── FILTERS TAB ── */}
          <Tabs.Panel value="filters">
            <Stack gap="lg" pr="xs">
              <Box>
                <Text size="sm" fw={600} mb="xs">Export Scope</Text>
                <Radio.Group value={scope} onChange={setScope}>
                  <Stack gap={6}>
                    <Radio value="all" label="Export All Employees" />
                    <Radio value="filtered" label="Export Filtered Employees" description="Uses the search/department/status filters applied on the Employees table" />
                    <Radio value="selected" label={`Export Selected Employees (${selectedEmployees.length})`} disabled={selectedEmployees.length === 0} />
                  </Stack>
                </Radio.Group>
              </Box>

              <Box>
                <Text size="sm" fw={600} mb="xs">Employee Status</Text>
                <Checkbox.Group value={statusFilter} onChange={setStatusFilter}>
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
                    {STATUS_OPTIONS.map((s) => <Checkbox key={s} value={s} label={s} />)}
                  </SimpleGrid>
                </Checkbox.Group>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {userRole === "SUPER_ADMIN" && (
                  <AppInput type="select" label="Company" data={["All Companies"]} defaultValue="All Companies" />
                )}
                <MasterDataSelect
                  label="Department" placeholder="All departments"
                  data={departments} getOptionValue={(d) => String(d.id ?? d._id)} getOptionLabel={(d) => d.name}
                  value={departmentId} onChange={setDepartmentId} clearable
                />
                <MasterDataSelect
                  label="Branch" placeholder="All branches"
                  data={branches} getOptionValue={(b) => String(b.id ?? b._id)} getOptionLabel={(b) => b.name}
                  value={branchId} onChange={setBranchId} clearable
                />
              </SimpleGrid>

              <Box>
                <Text size="sm" fw={600} mb="xs">Employment Type</Text>
                <Checkbox.Group value={employmentTypes} onChange={setEmploymentTypes}>
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
                    {EMPLOYMENT_TYPE_OPTIONS.map((t) => <Checkbox key={t} value={t} label={t} />)}
                  </SimpleGrid>
                </Checkbox.Group>
              </Box>

              <Box>
                <Text size="sm" fw={600} mb="xs">Date Filter</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <AppInput type="select" label="Date Field" data={DATE_FIELD_OPTIONS} value={dateField} onChange={setDateField} />
                  <DateInput label="From" value={dateFrom} onChange={setDateFrom} radius="md" clearable />
                  <DateInput label="To" value={dateTo} onChange={setDateTo} radius="md" clearable />
                </SimpleGrid>
              </Box>
            </Stack>
          </Tabs.Panel>

          {/* ── FIELDS TAB ── */}
          <Tabs.Panel value="fields">
            <Stack gap="lg" pr="xs">
              {EXPORT_FIELD_GROUPS.map((group) => {
                const visibleFields = group.fields.filter((f) => canSeeSensitive || !f.sensitive);
                if (visibleFields.length === 0) return null;
                const groupKeys = visibleFields.map((f) => `${group.key}.${f.key}`);
                const allChecked = groupKeys.every((k) => selectedFields.includes(k));
                const someChecked = groupKeys.some((k) => selectedFields.includes(k));
                return (
                  <Box key={group.key}>
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <Checkbox
                          label={<Text size="sm" fw={600}>{group.label}</Text>}
                          checked={allChecked}
                          indeterminate={!allChecked && someChecked}
                          onChange={(e) => toggleGroup(group, e.currentTarget.checked)}
                        />
                        {group.sensitive && (
                          <Badge size="xs" color="orange" variant="light" leftSection={<IconLock size={10} />}>
                            Permission based
                          </Badge>
                        )}
                      </Group>
                    </Group>
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs" pl="lg">
                      {visibleFields.map((f) => {
                        const key = `${group.key}.${f.key}`;
                        return (
                          <Checkbox key={key} value={key} label={f.label}
                            checked={selectedFields.includes(key)}
                            onChange={() => toggleField(key)} />
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                );
              })}
              {!canSeeSensitive && (
                <Text size="xs" c="dimmed">
                  Some payroll fields (Account Number, UAN, PF, ESI) are hidden — you don't have permission to export sensitive payroll data.
                </Text>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ── FORMAT & OPTIONS TAB ── */}
          <Tabs.Panel value="format">
            <Stack gap="lg" pr="xs">
              <Box>
                <Text size="sm" fw={600} mb="xs">Export Format</Text>
                <Radio.Group value={format} onChange={setFormat}>
                  <Group gap="lg">
                    {FORMAT_OPTIONS.map((f) => <Radio key={f.value} value={f.value} label={f.label} />)}
                  </Group>
                </Radio.Group>
              </Box>

              <AppInput label="File Name" value={fileName} readOnly w={360} />

              <Box>
                <Text size="sm" fw={600} mb="xs">Advanced Options</Text>
                <Stack gap={6}>
                  <Checkbox label="Include Inactive Employees" checked={includeInactive} onChange={(e) => setIncludeInactive(e.currentTarget.checked)} />
                  <Checkbox label="Include Archived Employees" checked={includeArchived} onChange={(e) => setIncludeArchived(e.currentTarget.checked)} />
                  <Checkbox label="Include Hidden Fields (Permission Based)" checked={includeHidden} onChange={(e) => setIncludeHidden(e.currentTarget.checked)} disabled={!canSeeSensitive} />
                  <Checkbox label="Password Protect File" checked={passwordProtect} onChange={(e) => setPasswordProtect(e.currentTarget.checked)} />
                  <Checkbox label="Compress ZIP (Large Exports)" checked={compressZip} onChange={(e) => setCompressZip(e.currentTarget.checked)} />
                </Stack>
              </Box>

              {preview && (
                <Box p="md" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8, background: "var(--mantine-color-gray-0)" }}>
                  <Text size="sm" fw={600} mb={6}>Records to Export</Text>
                  <Group gap="xl">
                    <Text size="sm">Employees : <Text span fw={700}>{preview.records.toLocaleString()}</Text></Text>
                    <Text size="sm">Columns : <Text span fw={700}>{preview.columns}</Text></Text>
                    <Text size="sm">Estimated Size : <Text span fw={700}>{preview.sizeMb} MB</Text></Text>
                  </Group>
                  {preview.records > 10000 && (
                    <Text size="xs" c="dimmed" mt={6}>
                      Large export — this will be processed in the background. You'll be notified when it's ready.
                    </Text>
                  )}
                </Box>
              )}
            </Stack>
          </Tabs.Panel>
        </ScrollArea.Autosize>
      </Tabs>

      <Group justify="space-between" mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
        <AppButton variant="default" color="gray" disabled={exporting} onClick={handleClose}>Cancel</AppButton>
        <Group gap="sm">
          <AppButton variant="light" disabled={exporting} onClick={handlePreview}>Preview Records</AppButton>
          <AppButton loading={exporting} disabled={finalEmployees.length === 0 || columns.length === 0} onClick={handleExport}>
            Export
          </AppButton>
        </Group>
      </Group>
    </AppModal>
  );
}
