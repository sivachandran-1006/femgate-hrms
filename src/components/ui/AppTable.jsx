import { Table, ScrollArea, Text } from "@mantine/core";

export const AppTable = ({
  headers,
  data,
  renderRow,
  loading   = false,
  emptyText = "No records found",
  stickyHeader = false,
  ...props
}) => {
  return (
    <ScrollArea>
      <Table
        striped
        highlightOnHover
        withTableBorder={false}
        verticalSpacing="sm"
        horizontalSpacing="md"
        style={{ tableLayout: "auto" }}
        {...props}
      >
        <Table.Thead
          style={{
            background:  "#f8fafc",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <Table.Tr>
            {headers.map((h, i) => (
              <Table.Th
                key={i}
                style={{
                  fontSize:      11,
                  fontWeight:    700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color:         "#64748b",
                  whiteSpace:    "nowrap",
                  padding:       "12px 16px",
                }}
              >
                {h}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={headers.length} style={{ textAlign: "center", padding: 40 }}>
                <Text c="dimmed" size="sm">Loading...</Text>
              </Table.Td>
            </Table.Tr>
          ) : data?.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={headers.length} style={{ textAlign: "center", padding: 48 }}>
                <Text c="dimmed" size="sm">{emptyText}</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};
