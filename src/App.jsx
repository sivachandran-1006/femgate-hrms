import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function HRMSApp() {

  // LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI
  const [activePage, setActivePage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  // EMPLOYEE
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);

  // LEAVE
  const [leaves, setLeaves] = useState([
    {
      employee: "Priya",
      type: "Sick Leave",
      days: 2,
      status: "Pending",
    },
  ]);
  const [payrollStatus, setPayrollStatus] = useState({});

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [leaveEmployee, setLeaveEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveDays, setLeaveDays] = useState("");

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/employees"
      );

      setEmployees(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ADD EMPLOYEE
  const addEmployee = async () => {

    if (
      employeeName.trim() === "" ||
      department.trim() === ""
    ) {

      alert("Please fill all fields");

      return;

    }

    try {

      await axios.post(
        "http://localhost:5000/employees",
        {
          name: employeeName,
          department: department,
          status: "Present",
        }
      );

      fetchEmployees();

      setEmployeeName("");
      setDepartment("");

      setShowModal(false);

    } catch (error) {

      console.log(error);

    }
  };

  // DELETE EMPLOYEE
  const deleteEmployee = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/employees/${id}`
      );

      fetchEmployees();

    } catch (error) {

      console.log(error);

    }
  };

  // EDIT EMPLOYEE
  const editEmployee = (employee) => {

    setEditingEmployee(employee);

    setEmployeeName(employee.name);

    setDepartment(employee.department);

    setShowModal(true);

  };

  // UPDATE EMPLOYEE
  const updateEmployee = async () => {

    try {

      await axios.put(
        `http://localhost:5000/employees/${editingEmployee._id}`,
        {
          name: employeeName,
          department: department,
        }
      );

      fetchEmployees();

      setShowModal(false);

      setEditingEmployee(null);

      setEmployeeName("");
      setDepartment("");

    } catch (error) {

      console.log(error);

    }
  };

  // ATTENDANCE
  const toggleStatus = async (employee) => {

    try {

      const newStatus =
        employee.status === "Present"
          ? "Leave"
          : "Present";

      await axios.put(
        `http://localhost:5000/employees/${employee._id}`,
        {
          ...employee,
          status: newStatus,
        }
      );

      fetchEmployees();

    } catch (error) {

      console.log(error);

    }
  };

  // ADD LEAVE
  const addLeaveRequest = () => {

    if (
      leaveEmployee.trim() === "" ||
      leaveType.trim() === "" ||
      leaveDays.trim() === ""
    ) {

      alert("Please fill all fields");

      return;

    }

    const newLeave = {
      employee: leaveEmployee,
      type: leaveType,
      days: leaveDays,
      status: "Pending",
    };

    setLeaves([...leaves, newLeave]);

    setLeaveEmployee("");
    setLeaveType("");
    setLeaveDays("");

    setShowLeaveModal(false);

  };

  // UPDATE LEAVE STATUS
  const updateLeaveStatus = (
    index,
    newStatus
  ) => {

    const updatedLeaves = [...leaves];

    updatedLeaves[index].status = newStatus;

    setLeaves(updatedLeaves);

  };

  // PAY EMPLOYEE
  const payEmployee = (employeeId) => {
    setPayrollStatus((prev) => ({
      ...prev,
      [employeeId]: "Paid",
    }));
  };

  const exportToExcel = () => {

  const worksheet =
    XLSX.utils.json_to_sheet(employees);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Employees"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const data = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    }
  );

  saveAs(
    data,
    "employees.xlsx"
  );

};

  // LOGIN PAGE
  if (!isLoggedIn) {
   

    return (

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl grid grid-cols-1 md:grid-cols-2">

          {/* LEFT */}
          <div className="p-10 flex flex-col justify-center">

            <div className="flex flex-col items-center mb-10">

              <img
                src={logo}
                alt="logo"
                className="w-52 mb-4"
              />

              <p className="text-gray-500 text-lg">
                Employee Management System
              </p>

            </div>

            <div className="space-y-5">

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border rounded-xl px-5 py-4"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-xl px-5 py-4"
              />

              <button
                onClick={() => {

                  if (
                    email === "admin@mgatetech.com" &&
                    password === "admin123"
                  ) {

                    setUserRole("Admin");

                    setIsLoggedIn(true);

                  }

                  else if (
                    email === "employee@mgatetech.com" &&
                    password === "employee123"
                  ) {

                    setUserRole("Employee");

                    setIsLoggedIn(true);

                  }

                  else {

                    alert(
                      "Invalid Email or Password"
                    );

                  }

                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl"
              >
                Sign In
              </button>

            </div>

            <div className="mt-8">

              <p className="mb-4 text-gray-500">
                Demo Login
              </p>

              <div className="bg-gray-100 rounded-2xl p-4 mb-3">

                <p className="font-semibold">
                  admin@mgatetech.com
                </p>

                <p>admin123</p>

              </div>

              <div className="bg-gray-100 rounded-2xl p-4">

                <p className="font-semibold">
                  employee@mgatetech.com
                </p>

                <p>employee123</p>

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="bg-blue-600 text-white flex items-center justify-center">

            <div className="text-center p-10">

              <div className="text-7xl mb-6">
                👨‍💼
              </div>

              <h2 className="text-4xl font-bold mb-4">
                Welcome to MGate HRMS
              </h2>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // MAIN APP
  return (

    <div className={`min-h-screen flex ${
      darkMode
        ? "bg-slate-900 text-white"
        : "bg-slate-100"
    }`}>

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-xl p-6">

        <img
          src={logo}
          alt="logo"
          className="w-40 mx-auto mb-10"
        />

        <ul className="space-y-4">

          <li
            onClick={() =>
              setActivePage("dashboard")
            }
            className="cursor-pointer"
          >
            Dashboard
          </li>

          {userRole === "Admin" && (
            <li
              onClick={() =>
                setActivePage("employees")
              }
              className="cursor-pointer"
            >
              Employees
            </li>
          )}

          <li
            onClick={() =>
              setActivePage("attendance")
            }
            className="cursor-pointer"
          >
            Attendance
          </li>

          <li
            onClick={() =>
              setActivePage("leave")
            }
            className="cursor-pointer"
          >
            Leave
          </li>

          {userRole === "Admin" && (
            <li
              onClick={() =>
                setActivePage("payroll")
              }
              className="cursor-pointer"
            >
              Payroll
            </li>
          )}

        </ul>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-5xl font-bold text-blue-700">
              MGate HRMS
            </h1>

            <p>
              {userRole} Portal
            </p>

          </div>

         <div className="flex gap-3">

  {userRole === "Admin" && (

    <>
    
      <button
        onClick={exportToExcel}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl"
      >
        Export Excel
      </button>

      <button
        onClick={() => {
          setEditingEmployee(null);
          setEmployeeName("");
          setDepartment("");
          setShowModal(true);
        }}
        className="bg-blue-600 text-white px-5 py-3 rounded-2xl"
      >
        Add Employee
      </button>

    </>

  )}

  <button
    onClick={() =>
      setDarkMode(!darkMode)
    }
    className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
  >
    Dark
  </button>

  <button
    onClick={() =>
      setIsLoggedIn(false)
    }
    className="bg-red-500 text-white px-5 py-3 rounded-2xl"
  >
    Logout
  </button>

</div>
</div>

       {/* DASHBOARD */}
{activePage === "dashboard" && (

  <div>

    {/* TOP CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <h2 className="text-gray-500 text-lg">
          Total Employees
        </h2>

        <p className="text-5xl font-bold mt-4 text-blue-600">
          {employees.length}
        </p>

      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <h2 className="text-gray-500 text-lg">
          Present Employees
        </h2>

        <p className="text-5xl font-bold mt-4 text-green-600">
          {
            employees.filter(
              (emp) =>
                emp.status === "Present"
            ).length
          }
        </p>

      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <h2 className="text-gray-500 text-lg">
          Employees On Leave
        </h2>

        <p className="text-5xl font-bold mt-4 text-yellow-500">
          {
            employees.filter(
              (emp) =>
                emp.status === "Leave"
            ).length
          }
        </p>

      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <h2 className="text-gray-500 text-lg">
          Pending Leaves
        </h2>

        <p className="text-5xl font-bold mt-4 text-red-500">
          {
            leaves.filter(
              (leave) =>
                leave.status === "Pending"
            ).length
          }
        </p>

      </div>

    </div>

    {/* WELCOME */}
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <h2 className="text-4xl font-bold mb-4">
        Welcome to MGate HRMS
      </h2>

      <p className="text-gray-500 text-lg">
        Manage employees, attendance,
        leave requests, payroll and
        company operations from one
        centralized dashboard.
      </p>

    </div>

  </div>

)}
        {/* EMPLOYEES PAGE */}
{activePage === "employees" &&
  userRole === "Admin" && (

  <div className="bg-white rounded-3xl shadow-xl p-8">

    <div className="flex justify-between items-center mb-8">

      <h2 className="text-4xl font-bold">
        Employees
      </h2>

      <input
        type="text"
        placeholder="Search employee..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        className="border rounded-2xl px-4 py-3 w-72"
      />

    </div>

    <table className="w-full">

      <thead>

       <tr className="border-b">

  <th className="text-left py-4">
    Employee
  </th>

  <th className="text-left py-4">
    Department
  </th>

  <th className="text-left py-4">
    Status
  </th>

  <th className="text-left py-4">
    Salary
  </th>

  <th className="text-left py-4">
    Payroll Status
  </th>

  <th className="text-left py-4">
    Action
  </th>

</tr>
      </thead>

      <tbody>

        {employees
          .filter((employee) =>
            employee.name
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )
          )
          .map((employee) => (

          <tr
            key={employee._id}
            className="border-b hover:bg-gray-50"
          >

            <td className="py-5 font-semibold text-blue-600">
              {employee.name}
            </td>

            <td className="py-5">
              {employee.department}
            </td>

            <td className="py-5">

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  employee.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {employee.status}
              </span>

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
                  deleteEmployee(employee._id)
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
)}
{/* ATTENDANCE PAGE */}
{activePage === "attendance" && (
  <div className="bg-white rounded-3xl shadow-xl p-8">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-4xl font-bold">Attendance</h2>
        <p className="text-gray-500 mt-2">
          Mark employee attendance and switch status between Present and Leave.
        </p>
      </div>
    </div>

    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left py-4">Employee</th>
          <th className="text-left py-4">Department</th>
          <th className="text-left py-4">Status</th>
          <th className="text-left py-4">Action</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr
            key={employee._id}
            className="border-b hover:bg-gray-50"
          >
            <td className="py-5 font-semibold text-blue-600">
              {employee.name}
            </td>
            <td className="py-5">
              {employee.department}
            </td>
            <td className="py-5">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  employee.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {employee.status}
              </span>
            </td>
            <td className="py-5">
              <button
                onClick={() => toggleStatus(employee)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
              >
                {employee.status === "Present"
                  ? "Mark Leave"
                  : "Mark Present"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
{/* ADD EMPLOYEE MODAL */}
{showModal && (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-full max-w-md">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-3xl font-bold">
          Add Employee
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

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Employee Name"
          value={employeeName}
          onChange={(e) =>
            setEmployeeName(e.target.value)
          }
          className="w-full border rounded-2xl px-5 py-4"
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          className="w-full border rounded-2xl px-5 py-4"
        />

        <button
          onClick={
            editingEmployee
              ? updateEmployee
              : addEmployee
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl"
        >

          {editingEmployee
            ? "Update Employee"
            : "Save Employee"}

        </button>

      </div>

    </div>

  </div>

)}

{/* LEAVE PAGE */}
{activePage === "leave" && (

  <div className="bg-white rounded-3xl shadow-xl p-8">

    <div className="flex justify-between items-center mb-8">

      <h2 className="text-4xl font-bold">
        Leave Management
      </h2>

      <button
        onClick={() =>
          setShowLeaveModal(true)
        }
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl"
      >
        Apply Leave
      </button>

    </div>

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left py-4">
            Employee
          </th>

          <th className="text-left py-4">
            Leave Type
          </th>

          <th className="text-left py-4">
            Days
          </th>

          <th className="text-left py-4">
            Status
          </th>

          {userRole === "Admin" && (
            <th className="text-left py-4">
              Action
            </th>
          )}

        </tr>

      </thead>

      <tbody>

        {leaves.map((leave, index) => (

          <tr
            key={index}
            className="border-b hover:bg-gray-50"
          >

            <td className="py-5">
              {leave.employee}
            </td>

            <td className="py-5">
              {leave.type}
            </td>

            <td className="py-5">
              {leave.days}
            </td>

            <td className="py-5">

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  leave.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : leave.status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {leave.status}
              </span>

            </td>

            {userRole === "Admin" && (

              <td className="py-5 flex gap-3">

                <button
                  onClick={() =>
                    updateLeaveStatus(
                      index,
                      "Approved"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateLeaveStatus(
                      index,
                      "Rejected"
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Reject
                </button>

              </td>

            )}

          </tr>

        ))}

      </tbody>

    </table>

  </div>

)}
{/* PAYROLL PAGE */}
{activePage === "payroll" &&
 userRole === "Admin" && (

  <div className="space-y-8">

    {/* HEADER */}
    <div className="bg-white rounded-3xl shadow-xl p-8 flex justify-between items-center">

      <div>

        <h2 className="text-4xl font-bold">
          Payroll Management
        </h2>

        <p className="text-gray-500 mt-2">
          Manage employee salaries and payroll
        </p>

      </div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl"
      >
        Generate Payroll
      </button>

    </div>

    {/* PAYROLL TABLE */}
    <div className="bg-white rounded-3xl shadow-xl p-8">

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="text-left py-4">
              Employee
            </th>

            <th className="text-left py-4">
              Department
            </th>

            <th className="text-left py-4">
              Status
            </th>

            <th className="text-left py-4">
              Salary
            </th>

            <th className="text-left py-4">
              Payroll Status
            </th>

          <th className="text-left py-4">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {employees.map((employee) => (

            <tr
              key={employee._id}
              className="border-b hover:bg-gray-50"
            >

              <td className="py-5 font-semibold">
                {employee.name}
              </td>

              <td className="py-5">
                {employee.department}
              </td>

              <td className="py-5">

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    employee.status === "Present"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.status}
                </span>

              </td>

              <td className="py-5 font-bold text-green-600">
                ₹{employee.salary || 25000}
              </td>

              <td className="py-5">

                <span
  className={`px-4 py-2 rounded-full text-sm ${
    payrollStatus[employee._id] === "Paid"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700"
  }`}
>
  {payrollStatus[employee._id] || "Pending"}
</span>

              </td>
              <td className="py-5 flex gap-3">

<button
  onClick={() =>
    payEmployee(employee._id)
  }
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
>
  Pay
</button>

  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
  >
    Payslip
  </button>
  

</td>


            </tr>

          ))}

        </tbody>

      </table>

      </div>

  </div>

)}

      </div>
    </div>
  );
}