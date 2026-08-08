import { useMemo, useState } from "react";
import {
  Stack, Group, Box, Text, Radio, Checkbox, SimpleGrid, Tabs, MultiSelect,
  ScrollArea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconFileExport, IconFilter, IconListCheck, IconSettings,
} from "@tabler/icons-react";

import { AppModal } from "../../components/ui/AppModal";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { MasterDataSelect } from "../../components/ui/MasterDataSelect";
import { COLORS } from "../../theme/colors";

import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";
import { useBranches } from "../../queries/useBranches";
import { useDepartments } from "../../queries/useDepartments";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  EXPORT_FIELD_GROUPS, DEFAULT_SELECTED_FIELDS,
  resolveExportColumns, buildExportRows, buildFileName, runExport,
} from "../../utils/attendanceExport";

const DATE_PRESETS = ["Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "Custom Date Range"];
const SHIFT_OPTIONS = ["General Shift", "Morning", "Evening", "Night", "Flexible"];
const STATUS_OPTIONS = [
  "Present", "Absent", "Half Day", "Leave", "Holiday", "Week Off",
  "Late", "Early Out", "Work From Home", "On Duty", "Missed Punch",
];
const FORMAT_OPTIONS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv",  label: "CSV" },
  { value: "pdf",  label: "PDF Summary" },
];

const presetRange = (preset) => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const startOfWeek = (d) => addDays(startOfDay(d), -d.getDay());

  switch (preset) {
    case "Today":      return [startOfDay(now), startOfDay(now)];
    case "Yesterday": { const y = addDays(startOfDay(now), -1); return [y, y]; }
    case "This Week":  return [startOfWeek(now), startOfDay(now)];
    case "Last Week": { const s = addDays(startOfWeek(now), -7); return [s, addDays(s, 6)]; }
    case "This Month": return [new Date(now.getFullYear(), now.getMonth(), 1), startOfDay(now)];
    case "Last Month": return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)];
    default: return [null, null];
  }
};

export function ExportAttendanceModal({
  opened, onClose, records = [], filteredRecords = [], selectedRecords = [],
}) {
  const { userRole } = useAuth();
  const can = usePermission();
  const canExportAll  = can("attendance.export_all");
  const canExportTeam = can("attendance.export_team");

  const { data: departments = [] } = useDepartments();
  const { data: branches = [] } = useBranches();
  const { data: employees = [] } = useFetchAllEmployees();

  const [scope, setScope] = useState(canExportAll ? "filtered" : canExportTeam ? "filtered" : "own");
  const [datePreset, setDatePreset] = useState("This Month");
  const [dateFrom, setDateFrom] = useState(() => presetRange("This Month")[0]);
  const [dateTo, setDateTo]     = useState(() => presetRange("This Month")[1]);

  const [departmentId, setDepartmentId] = useState(null);
  const [branchId, setBranchId]         = useState(null);
  const [employeeIds, setEmployeeIds]   = useState([]);
  const [shift, setShift]               = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);

  const [selectedFields, setSelectedFields] = useState(DEFAULT_SELECTED_FIELDS);
  const [format, setFormat] = useState("xlsx");
  const [includeWeekOff, setIncludeWeekOff]         = useState(true);
  const [includeHolidays, setIncludeHolidays]       = useState(true);
  const [includeLeave, setIncludeLeave]             = useState(true);
  const [includeOvertime, setIncludeOvertime]       = useState(true);
  const [includeGps, setIncludeGps]                 = useState(false);
  const [includeBiometric, setIncludeBiometric]     = useState(false);
  const [includeManualCorrections, setIncludeManualCorrections] = useState(true);
  const [includeAudit, setIncludeAudit]             = useState(false);

  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState(null);

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ value: String(e.id ?? e._id), label: `${e.name}${e.employeeCode ? ` (${e.employeeCode})` : ""}` })),
    [employees]
  );

  const scopedRecords = useMemo(() => {
    if (scope === "all") return records;
    if (scope === "selected") return selectedRecords;
    if (scope === "own") return records;
    return filteredRecords;
  }, [scope, records, filteredRecords, selectedRecords]);

  const finalRecords = useMemo(() => {
    return scopedRecords.filter((r) => {
      const d = r.date ? new Date(r.date) : null;
      const matchFrom = !dateFrom || !d || d >= dateFrom;
      const matchTo   = !dateTo || !d || d <= dateTo;
      const matchDept   = !departmentId || r.employee?.department === departmentId || String(r.employee?.departmentId ?? "") === departmentId;
      const matchBranch = !branchId || r.employee?.branch === branchId || String(r.employee?.branchId ?? "") === branchId;
      const matchEmp    = employeeIds.length === 0 || employeeIds.includes(String(r.employee?.id ?? r.employee?._id ?? ""));
      const matchShift  = !shift || r.shift === shift;
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(r.status);
      return matchFrom && matchTo && matchDept && matchBranch && matchEmp && matchShift && matchStatus;
    });
  }, [scopedRecords, dateFrom, dateTo, departmentId, branchId, employeeIds, shift, statusFilter]);

  const toggleField = (fieldKey) => {
    setSelectedFields((cur) => cur.includes(fieldKey) ? cur.filter((k) => k !== fieldKey) : [...cur, fieldKey]);
  };
  const toggleGroup = (group, checked) => {
    const groupKeys = group.fields.map((f) => `${group.key}.${f.key}`);
    setSelectedFields((cur) => checked
      ? [...new Set([...cur, ...groupKeys])]
      : cur.filter((k) => !groupKeys.includes(k)));
  };

  const columns = useMemo(() => resolveExportColumns(selectedFields), [selectedFields]);
  const fileName = useMemo(
    () => buildFileName({ format, scopeLabel: departmentId ? "Filtered" : datePreset }),
    [format, departmentId, datePreset]
  );

  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    if (preset !== "Custom Date Range") {
      const [from, to] = presetRange(preset);
      setDateFrom(from); setDateTo(to);
    }
  };

  const doReset = () => {
    setScope(canExportAll ? "filtered" : canExportTeam ? "filtered" : "own");
    setDatePreset("This Month");
    const [f, t] = presetRange("This Month");
    setDateFrom(f); setDateTo(t);
    setDepartmentId(null); setBranchId(null); setEmployeeIds([]); setShift(null); setStatusFilter([]);
    setSelectedFields(DEFAULT_SELECTED_FIELDS); setFormat("xlsx");
    setIncludeWeekOff(true); setIncludeHolidays(true); setIncludeLeave(true); setIncludeOvertime(true);
    setIncludeGps(false); setIncludeBiometric(false); setIncludeManualCorrections(true); setIncludeAudit(false);
    setPreview(null);
  };

  const handleClose = () => { doReset(); onClose(); };

  const handlePreview = () => {
    const uniqueEmployees = new Set(finalRecords.map((r) => r.employee?.employeeId ?? r.employee?.name)).size;
    const estimatedBytes = finalRecords.length * columns.length * 18;
    setPreview({
      employees: uniqueEmployees,
      records: finalRecords.length,
      columns: columns.length,
      sizeMb: (estimatedBytes / (1024 * 1024)).toFixed(1),
    });
  };

  const handleExport = async () => {
    if (finalRecords.length === 0 || columns.length === 0) return;
    setExporting(true);
    try {
      const rows = buildExportRows(finalRecords, columns);
      if (finalRecords.length > 50000) {
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
      title="Export Attendance"
      subtitle={`${finalRecords.length} record${finalRecords.length !== 1 ? "s" : ""} match current filters`}
      icon={<IconFileExport size={16} color={COLORS.primary} />}
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
                    {canExportAll && <Radio value="all" label="Export All Attendance Records" />}
                    <Radio value="filtered" label="Export Filtered Records" description="Uses the search/department/status filters applied on the Attendance List" />
                    <Radio value="selected" label={`Export Selected Employees (${selectedRecords.length})`} disabled={selectedRecords.length === 0} />
                    {!canExportTeam && <Radio value="own" label="Export My Attendance History" />}
                  </Stack>
                </Radio.Group>
              </Box>

              <Box>
                <Text size="sm" fw={600} mb="xs">Date Range</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <AppInput type="select" label="Attendance Date" data={DATE_PRESETS} value={datePreset} onChange={handleDatePreset} />
                  <DateInput label="From Date" value={dateFrom} onChange={setDateFrom} radius="md" clearable disabled={datePreset !== "Custom Date Range"} />
                  <DateInput label="To Date" value={dateTo} onChange={setDateTo} radius="md" clearable disabled={datePreset !== "Custom Date Range"} />
                </SimpleGrid>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {userRole === "SUPER_ADMIN" && (
                  <AppInput type="select" label="Company" data={["All Companies"]} defaultValue="All Companies" />
                )}
                <MasterDataSelect
                  label="Branch" placeholder="All branches"
                  data={branches} getOptionValue={(b) => String(b.id ?? b._id)} getOptionLabel={(b) => b.name}
                  value={branchId} onChange={setBranchId} clearable
                />
                <MasterDataSelect
                  label="Department" placeholder="All departments"
                  data={departments} getOptionValue={(d) => String(d.id ?? d._id)} getOptionLabel={(d) => d.name}
                  value={departmentId} onChange={setDepartmentId} clearable
                />
                <AppInput type="select" label="Shift" data={SHIFT_OPTIONS} value={shift} onChange={setShift} clearable />
              </SimpleGrid>

              <MultiSelect
                label="Employee" placeholder="Search by name, ID, or code"
                data={employeeOptions} searchable clearable radius="md"
                value={employeeIds} onChange={setEmployeeIds}
              />

              <Box>
                <Text size="sm" fw={600} mb="xs">Attendance Status</Text>
                <Checkbox.Group value={statusFilter} onChange={setStatusFilter}>
                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                    {STATUS_OPTIONS.map((s) => <Checkbox key={s} value={s} label={s} />)}
                  </SimpleGrid>
                </Checkbox.Group>
              </Box>
            </Stack>
          </Tabs.Panel>

          {/* ── FIELDS TAB ── */}
          <Tabs.Panel value="fields">
            <Stack gap="lg" pr="xs">
              {EXPORT_FIELD_GROUPS.map((group) => {
                const groupKeys = group.fields.map((f) => `${group.key}.${f.key}`);
                const allChecked = groupKeys.every((k) => selectedFields.includes(k));
                const someChecked = groupKeys.some((k) => selectedFields.includes(k));
                return (
                  <Box key={group.key}>
                    <Checkbox
                      label={<Text size="sm" fw={600}>{group.label}</Text>}
                      checked={allChecked}
                      indeterminate={!allChecked && someChecked}
                      onChange={(e) => toggleGroup(group, e.currentTarget.checked)}
                      mb="xs"
                    />
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs" pl="lg">
                      {group.fields.map((f) => {
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
                  <Checkbox label="Include Week Off" checked={includeWeekOff} onChange={(e) => setIncludeWeekOff(e.currentTarget.checked)} />
                  <Checkbox label="Include Holidays" checked={includeHolidays} onChange={(e) => setIncludeHolidays(e.currentTarget.checked)} />
                  <Checkbox label="Include Leave Records" checked={includeLeave} onChange={(e) => setIncludeLeave(e.currentTarget.checked)} />
                  <Checkbox label="Include Overtime" checked={includeOvertime} onChange={(e) => setIncludeOvertime(e.currentTarget.checked)} />
                  <Checkbox label="Include GPS Data" checked={includeGps} onChange={(e) => setIncludeGps(e.currentTarget.checked)} />
                  <Checkbox label="Include Biometric Logs" checked={includeBiometric} onChange={(e) => setIncludeBiometric(e.currentTarget.checked)} />
                  <Checkbox label="Include Manual Corrections" checked={includeManualCorrections} onChange={(e) => setIncludeManualCorrections(e.currentTarget.checked)} />
                  <Checkbox label="Include Audit Information" checked={includeAudit} onChange={(e) => setIncludeAudit(e.currentTarget.checked)} />
                </Stack>
              </Box>

              {preview && (
                <Box p="md" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8, background: "var(--mantine-color-gray-0)" }}>
                  <Text size="sm" fw={600} mb={6}>Records Found</Text>
                  <Group gap="xl">
                    <Text size="sm">Employees : <Text span fw={700}>{preview.employees.toLocaleString()}</Text></Text>
                    <Text size="sm">Attendance Records : <Text span fw={700}>{preview.records.toLocaleString()}</Text></Text>
                    <Text size="sm">Columns Selected : <Text span fw={700}>{preview.columns}</Text></Text>
                    <Text size="sm">Estimated File Size : <Text span fw={700}>{preview.sizeMb} MB</Text></Text>
                  </Group>
                  {preview.records > 50000 && (
                    <Text size="xs" c="dimmed" mt={6}>
                      Preparing Attendance Export... this will run in the background. You'll receive a notification once it's ready.
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
          <AppButton loading={exporting} disabled={finalRecords.length === 0 || columns.length === 0} onClick={handleExport}>
            Export
          </AppButton>
        </Group>
      </Group>
    </AppModal>
  );
}
