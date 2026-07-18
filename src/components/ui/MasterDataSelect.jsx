import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Stack, Text, Loader, Group } from "@mantine/core";
import { IconAlertCircle, IconInbox } from "@tabler/icons-react";
import { AppButton } from "./AppButton";

/**
 * MasterDataSelect — the single reusable dropdown for every master-data lookup
 * in the app (Department, Branch, Designation, Employee/Manager, Shift, Holiday
 * Calendar, Payroll Group, Grade, Level, Job Role, Policy, Cost Center, Business
 * Unit, Project, Client, Vendor, Country/State/City, and any future CRUD form
 * that references another master record).
 *
 * Wraps a React Query result (already tenant-scoped + active-filtered server-side
 * by convention — pass params={{ status: "active" }} to the underlying query hook)
 * and renders the loading / error+retry / empty+CTA / populated states consistently,
 * on top of Mantine's Select (search, keyboard nav, type-ahead, scroll, clear —
 * all native to Select, no extra work needed).
 *
 * Usage:
 *   const { data, isLoading, isError, refetch } = useDepartments({ status: "Active" });
 *   <MasterDataSelect
 *     label="Department *"
 *     data={data}
 *     isLoading={isLoading}
 *     isError={isError}
 *     onRetry={refetch}
 *     getOptionValue={(d) => String(d.id)}
 *     getOptionLabel={(d) => d.name}
 *     value={form.departmentId}
 *     onChange={set("departmentId")}
 *     error={err.departmentId}
 *     emptyTitle="No departments found."
 *     emptyHint="Please create a department first."
 *     createHref="/departments"
 *     createLabel="Create Department"
 *   />
 */
export const MasterDataSelect = ({
  label,
  placeholder = "Select...",
  data = [],
  isLoading = false,
  isError = false,
  onRetry,
  getOptionValue = (item) => String(item.id),
  getOptionLabel = (item) => item.name,
  value,
  onChange,
  error,
  emptyTitle = "No records found.",
  emptyHint,
  createHref,
  createLabel = "Create New",
  clearable = true,
  searchable = true,
  ...props
}) => {
  const navigate = useNavigate();

  const options = useMemo(
    () => [...data]
      .map((item) => ({ value: getOptionValue(item), label: getOptionLabel(item) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [data, getOptionValue, getOptionLabel]
  );

  if (isLoading) {
    return (
      <Stack gap={4}>
        {label && <Text size="sm" fw={500}>{label}</Text>}
        <Group gap="xs" px="sm" py={8} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
          <Loader size="xs" />
          <Text size="sm" c="dimmed">Loading{label ? ` ${label.replace(/\s*\*$/, "").toLowerCase()}` : ""}...</Text>
        </Group>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack gap={4}>
        {label && <Text size="sm" fw={500}>{label}</Text>}
        <Group gap="xs" px="sm" py={8} style={{ border: "1px solid var(--mantine-color-red-3)", borderRadius: 8, background: "var(--mantine-color-red-0)" }} justify="space-between">
          <Group gap="xs">
            <IconAlertCircle size={16} color="var(--mantine-color-red-6)" />
            <Text size="sm" c="red.7">Unable to load. Please try again.</Text>
          </Group>
          {onRetry && <AppButton size="xs" variant="light" color="red" onClick={onRetry}>Retry</AppButton>}
        </Group>
      </Stack>
    );
  }

  if (options.length === 0) {
    return (
      <Stack gap={4}>
        {label && <Text size="sm" fw={500}>{label}</Text>}
        <Stack gap={6} px="sm" py={10} align="flex-start" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
          <Group gap="xs">
            <IconInbox size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">{emptyTitle}</Text>
          </Group>
          {emptyHint && <Text size="xs" c="dimmed">{emptyHint}</Text>}
          <Group gap="xs">
            {createHref && (
              <AppButton size="xs" variant="light" onClick={() => navigate(createHref)}>{createLabel}</AppButton>
            )}
            {onRetry && <AppButton size="xs" variant="subtle" onClick={onRetry}>Refresh</AppButton>}
          </Group>
        </Stack>
      </Stack>
    );
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={options}
      value={value}
      onChange={onChange}
      error={error}
      searchable={searchable}
      clearable={clearable}
      nothingFoundMessage="No matches"
      {...props}
    />
  );
};
