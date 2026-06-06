import { Group, Title, Text } from "@mantine/core";
import { IconFileSpreadsheet, IconPlus } from "@tabler/icons-react";
import { AppButton } from "../ui/AppButton";

const Header = ({
  exportToExcel,
  setEditingEmployee,
  setEmployeeName,
  setDepartment,
  setShowModal,
}) => {
  const handleAdd = () => {
    setEditingEmployee(null);
    setEmployeeName("");
    setDepartment("");
    setShowModal(true);
  };

  return (
    <Group justify="space-between" align="flex-start" mb="xl">
      <div>
        <Title order={2}>MGate Systems</Title>
        <Text c="dimmed" size="sm">Admin Portal</Text>
      </div>

      <Group gap="sm">
        <AppButton
          color="green"
          leftSection={<IconFileSpreadsheet size={18} />}
          onClick={exportToExcel}
        >
          Export Excel
        </AppButton>

        <AppButton
          leftSection={<IconPlus size={18} />}
          onClick={handleAdd}
        >
          Add Employee
        </AppButton>
      </Group>
    </Group>
  );
};

export default Header;
