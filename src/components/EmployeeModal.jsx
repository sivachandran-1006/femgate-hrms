const EmployeeModal = ({

  setShowModal,

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

  return (

    <div
      onClick={() =>
        setShowModal(false)
      }
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">

            {editingEmployee
              ? "Edit Employee"
              : "Add Employee"}

          </h2>

          <button
            onClick={() =>
              setShowModal(false)
            }
            className="text-3xl text-gray-500"
          >
            ×
          </button>

        </div>
        <div className="space-y-4">

  <input
    type="text"
    placeholder="Employee Name"
    value={employeeName}
    onChange={(e) =>
      setEmployeeName(
        e.target.value
      )
    }
    className="w-full border border-gray-300 rounded-2xl px-4 py-3"
  />

  <input
    type="text"
    placeholder="Department"
    value={department}
    onChange={(e) =>
      setDepartment(
        e.target.value
      )
    }
    className="w-full border rounded-2xl px-5 py-4"
  />

  <input
    type="email"
    placeholder="Email"
    value={employeeEmail}
    onChange={(e) =>
      setEmployeeEmail(
        e.target.value
      )
    }
    className="w-full border rounded-2xl px-5 py-4"
  />

  <input
    type="password"
    placeholder="Password"
    value={employeePassword}
    onChange={(e) =>
      setEmployeePassword(
        e.target.value
      )
    }
    className="w-full border rounded-2xl px-5 py-4"
  />

  <input
    type="text"
    placeholder="Phone"
    value={employeePhone}
    onChange={(e) =>
      setEmployeePhone(
        e.target.value
      )
    }
    className="w-full border rounded-2xl px-5 py-4"
  />
  <select
  value={employeeRole}
  onChange={(e) =>
    setEmployeeRole(
      e.target.value
    )
  }
  className="w-full border rounded-2xl px-5 py-4"
>

  <option value="">
    Select Role
  </option>

  <option value="Employee">
    Employee
  </option>

  <option value="HR">
    HR
  </option>

  <option value="Admin">
    Admin
  </option>

  <option value="Manager">
    Manager
  </option>

</select>

<input
  type="date"
  value={joiningDate}
  onChange={(e) =>
    setJoiningDate(
      e.target.value
    )
  }
  className="w-full border rounded-2xl px-5 py-4"
/>

<input
  type="number"
  placeholder="Salary"
  value={salary}
  onChange={(e) =>
    setSalary(
      e.target.value
    )
  }
  className="w-full border rounded-2xl px-5 py-4"
/>

<select
  value={reportingManager}
  onChange={(e) =>
    setReportingManager(
      e.target.value
    )
  }
  className="w-full border rounded-2xl px-5 py-4"
>

  <option value="">
    Reporting Manager
  </option>

  {employees.map((employee) => (

    <option
      key={employee._id}
      value={employee.name}
    >
      {employee.name}
    </option>

  ))}

</select>
<button

  onClick={() =>

    editingEmployee
      ? updateEmployee()
      : addEmployee()

  }

  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold"

>

  {editingEmployee
    ? "Update Employee"
    : "Add Employee"}

</button>

</div>

      </div>

    </div>
    

  );

};

export default EmployeeModal;