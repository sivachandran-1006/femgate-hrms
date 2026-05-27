
const Employees = ({
  employees,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  filteredEmployees,
  setSelectedEmployee,
  editEmployee,
  deleteEmployee,
}) => {

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">

      <div className="flex justify-between items-center mb-8">

  <h2 className="text-4xl font-bold">
    Employees
  </h2>

  <div className="flex gap-3">

    <input
      type="text"
      placeholder="Search employee..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
      className="border rounded-2xl px-4 py-3 w-72"
    />

    <button
      onClick={() =>
        setSortOrder(
          sortOrder === "asc"
            ? "desc"
            : "asc"
        )
      }
      className="bg-blue-600 text-white px-4 py-3 rounded-2xl"
    >
      Sort {sortOrder === "asc"
        ? "Z-A"
        : "A-Z"}
    </button>

    <select
      value={statusFilter}
      onChange={(e) =>
        setStatusFilter(
          e.target.value
        )
      }
      className="border rounded-2xl px-4 py-3"
    >

      <option value="All">
        All
      </option>

      <option value="Present">
        Present
      </option>

      <option value="Leave">
        Leave
      </option>

    </select>

  </div>

</div>

    
    <table className="w-full">

  <thead>

    <tr className="border-b">

      <th className="text-left py-4">
        Name
      </th>

      <th className="text-left py-4">
        Department
      </th>

      <th className="text-left py-4">
        Reporting Manager
      </th>

      <th className="text-left py-4">
        Status
      </th>

      <th className="text-left py-4">
        Salary
      </th>

      <th className="text-left py-4">
        Action
      </th>

    </tr>

  </thead>

  <tbody>

    {filteredEmployees
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(
              b.name
            )
          : b.name.localeCompare(
              a.name
            )
      )
      .map((employee) => (

        <tr
          key={employee._id}
          className="border-b hover:bg-gray-50"
        >

          <td className="py-5">

            <button
              onClick={() =>
                setSelectedEmployee(
                  employee
                )
              }
              className="font-semibold text-blue-600 hover:underline"
            >
              {employee.name}
            </button>

          </td>

          <td className="py-5">
            {employee.department}
          </td>

          <td className="py-5">
            {employee.reportingManager || "N/A"}
          </td>

          <td className="py-5">

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                employee.status ===
                "Present"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {employee.status}
            </span>

          </td>

          <td className="py-5 font-bold text-green-600">
            ₹{employee.salary || 25000}
          </td>

          <td className="py-5 flex gap-3">

            <button
              onClick={() =>
                editEmployee(employee)
              }
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl"
            >
              Edit
            </button>

            <button
              onClick={() =>
                deleteEmployee(
                  employee._id
                )
              }
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
            >
              Delete
            </button>

          </td>

        </tr>

      ))}

  </tbody>

</table>
</div>

 );

};

export default Employees;