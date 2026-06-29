import { useCallback } from "react";
import { Table, ScrollArea, Text, Checkbox, Group, ActionIcon, Tooltip, Box } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";

/**
 * AppTable — standard enterprise table
 *
 * Basic usage (existing, unchanged):
 *   <AppTable headers={["Name","Dept"]} data={rows} renderRow={(r) => <Table.Tr>...</Table.Tr>} />
 *
 * With sorting:
 *   <AppTable sortKey={sortKey} sortDir={sortDir} onSort={(k) => ...} headers={...} />
 *
 * With row selection + bulk actions:
 *   <AppTable selectable selectedIds={sel} onSelectChange={setSel}
 *     bulkActions={[{ label:"Delete", icon:IconTrash, color:"red", onClick:(ids) => ... }]}
 *   />
 */
export const AppTable = ({
  headers,         // string[] | { key, label, sortable? }[]
  data = [],
  renderRow,
  loading    = false,
  emptyText  = "No records found",
  emptyState,      // full custom empty-state node (overrides emptyText)
  stickyHeader = false,

  // sorting
  sortKey,
  sortDir,         // "asc" | "desc"
  onSort,          // (key: string) => void

  // row selection
  selectable   = false,
  selectedIds  = [],   // array of row ids
  onSelectChange,      // (ids[]) => void
  getRowId     = (row, i) => row?.id ?? row?._id ?? i,

  // bulk actions
  bulkActions  = [],  // { label, icon, color?, onClick(ids) }[]

  ...props
}) => {
  const allIds      = data.map((row, i) => getRowId(row, i));
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = !allSelected && allIds.some((id) => selectedIds.includes(id));

  const toggleAll = useCallback(() => {
    if (!onSelectChange) return;
    onSelectChange(allSelected ? [] : allIds);
  }, [allSelected, allIds, onSelectChange]);

  const toggleRow = useCallback((id) => {
    if (!onSelectChange) return;
    onSelectChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }, [selectedIds, onSelectChange]);

  const normalizeHeader = (h) =>
    typeof h === "string" ? { key: h, label: h, sortable: false } : h;

  const SortIcon = ({ col }) => {
    if (!col.sortable || !onSort) return null;
    if (sortKey === col.key) {
      return sortDir === "asc"
        ? <IconChevronUp size={13} style={{ marginLeft: 4, flexShrink: 0 }} />
        : <IconChevronDown size={13} style={{ marginLeft: 4, flexShrink: 0 }} />;
    }
    return <IconSelector size={13} style={{ marginLeft: 4, flexShrink: 0, opacity: 0.35 }} />;
  };

  return (
    <Box>
      {/* Bulk action bar — visible only when rows selected */}
      {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
        <Group
          gap="xs" px="md" py="xs" mb="xs"
          style={{
            background: "var(--mantine-color-violet-0)",
            border: "1px solid var(--mantine-color-violet-2)",
            borderRadius: "var(--mantine-radius-md)",
          }}
        >
          <Text fz="sm" fw={600} c="violet">{selectedIds.length} selected</Text>
          {bulkActions.map((a) => (
            <Tooltip key={a.label} label={a.label} withArrow>
              <ActionIcon
                variant="light"
                color={a.color || "violet"}
                size="sm"
                onClick={() => a.onClick(selectedIds)}
                aria-label={a.label}
              >
                {a.icon && <a.icon size={14} />}
              </ActionIcon>
            </Tooltip>
          ))}
          <ActionIcon variant="subtle" color="gray" size="sm" ml="auto"
            onClick={() => onSelectChange && onSelectChange([])} aria-label="Clear selection">
            ×
          </ActionIcon>
        </Group>
      )}

      <ScrollArea>
        <Table
          highlightOnHover
          withTableBorder={false}
          verticalSpacing="sm"
          horizontalSpacing="md"
          style={{ tableLayout: "auto" }}
          {...props}
        >
          <Table.Thead style={{ background: "var(--mantine-color-gray-0)", borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            <Table.Tr>
              {selectable && (
                <Table.Th style={{ width: 40, padding: "12px 16px" }}>
                  <Checkbox
                    size="sm"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </Table.Th>
              )}
              {headers.map((h, i) => {
                const col = normalizeHeader(h);
                return (
                  <Table.Th
                    key={i}
                    onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--mantine-color-dimmed)",
                      whiteSpace: "nowrap",
                      padding: "12px 16px",
                      cursor: col.sortable && onSort ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    <Group gap={0} wrap="nowrap" align="center">
                      {col.label}
                      <SortIcon col={col} />
                    </Group>
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td
                  colSpan={headers.length + (selectable ? 1 : 0)}
                  style={{ textAlign: "center", padding: 48 }}
                >
                  <Text c="dimmed" size="sm">Loading...</Text>
                </Table.Td>
              </Table.Tr>
            ) : data.length > 0 ? (
              data.map((item, index) => {
                const id       = getRowId(item, index);
                const isSelected = selectedIds.includes(id);
                const row      = renderRow(item, index);
                if (!selectable) return row;
                // inject checkbox cell into the rendered row
                return (
                  <Table.Tr
                    key={id}
                    style={{ background: isSelected ? "var(--mantine-color-violet-0)" : undefined }}
                  >
                    <Table.Td style={{ width: 40, padding: "10px 16px" }}>
                      <Checkbox size="sm" checked={isSelected} onChange={() => toggleRow(id)} aria-label={`Select row ${index + 1}`} />
                    </Table.Td>
                    {row?.props?.children}
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={headers.length + (selectable ? 1 : 0)}
                  style={{ textAlign: "center", padding: 48 }}
                >
                  {emptyState || <Text c="dimmed" size="sm">{emptyText}</Text>}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
};
