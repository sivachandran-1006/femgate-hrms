import { Stack, Group, Select } from "@mantine/core";
import { AppModal } from "./AppModal";
import { AppInput } from "./AppInput";
import { AppButton } from "./AppButton";

const ROLE_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "HR", label: "HR" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
];

const EmployeeModal = ({
  opened,
  onClose,
  employeeName,
  setEmployeeName,
  department,
  setDepartment,
  employeeEmail,
  setEmployeeEmail,
  employeePassword,
  setEmployeePassword,
  employeePhone,
  setEmployeePhone,
  employeeRole,
  setEmployeeRole,
  joiningDate,
  setJoiningDate,
  salary,
  setSalary,
  reportingManager,
  setReportingManager,
  employees,
  editingEmployee,
  addEmployee,
  updateEmployee,
}) => {
  const managerOptions = employees.map((e) => ({
    value: e.name,
    label: e.name,
  }));

  const handleSubmit = () => {
    if (editingEmployee) updateEmployee();
    else addEmployee();
  };

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={editingEmployee ? "Edit Employee" : "Add Employee"}
      size="lg"
    >
      <Stack gap="md">
        <AppInput
          label="Employee Name"
          placeholder="Full name"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          required
        />

        <AppInput
          label="Department"
          placeholder="e.g. IT, Finance"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <AppInput
          type="email"
          label="Email"
          placeholder="employee@company.com"
          value={employeeEmail}
          onChange={(e) => setEmployeeEmail(e.target.value)}
        />

        <AppInput
          type="password"
          label="Password"
          placeholder="••••••••"
          value={employeePassword}
          onChange={(e) => setEmployeePassword(e.target.value)}
        />

        <AppInput
          label="Phone"
          placeholder="+91 9876543210"
          value={employeePhone}
          onChange={(e) => setEmployeePhone(e.target.value)}
        />

        <Select
          label="Role"
          placeholder="Select role"
          data={ROLE_OPTIONS}
          value={employeeRole}
          onChange={setEmployeeRole}
        />

        <AppInput
          type="date"
          label="Joining Date"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
        />

        <AppInput
          type="number"
          label="Salary (₹)"
          placeholder="50000"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        <Select
          label="Reporting Manager"
          placeholder="Select manager"
          data={managerOptions}
          value={reportingManager}
          onChange={setReportingManager}
          clearable
        />

        <Group justify="flex-end" mt="sm">
          <AppButton variant="default" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit}>
            {editingEmployee ? "Update Employee" : "Add Employee"}
          </AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

export default EmployeeModal;
