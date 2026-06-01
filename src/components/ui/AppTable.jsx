import { Table } from "@mantine/core";

export const AppTable = ({ headers, data, renderRow, ...props }) => {
  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders {...props}>
      <Table.Thead>
        <Table.Tr>
          {headers.map((h, i) => (
            <Table.Th key={i}>{h}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data?.length > 0 ? (
          data.map((item, index) => renderRow(item, index))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={headers.length} align="center">
              No records found
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
};
