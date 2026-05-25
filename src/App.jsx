import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const [departments, setDepartments] = useState([
  "IT",
  "HR",
  "Management",
]);

const [departmentName, setDepartmentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] =
  useState({
    name: "",
    department: "",
    salary: "",
    status: "Present",
  });

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [salary, setSalary] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] =
  useState([]);
  const [sortOrder, setSortOrder] =
  useState("asc");
  
  
 const approveLeave = async (id) => {

  try {

    await axios.put(
      `http://localhost:5000/leaves/${id}`,
      {
        status: "Approved",
      }
    );

    fetchLeaves();

  } catch (error) {

    console.log(error);

  }

};

const rejectLeave = async (id) => {

  try {

    await axios.put(
      `http://localhost:5000/leaves/${id}`,
      {
        status: "Rejected",
      }
    );

    fetchLeaves();

  } catch (error) {

    console.log(error);

  }

};
  

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
  const chartData = [
  {
    name: "Present",
    value: employees.filter(
      (emp) => emp.status === "Present"
    ).length,
  },
  {
    name: "Leave",
    value: employees.filter(
      (emp) => emp.status === "Leave"
    ).length,
  },
];

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [leaveEmployee, setLeaveEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveDays, setLeaveDays] = useState("");

 // FETCH LEAVES
const fetchLeaves = async () => {

  try {

    const response =
      await axios.get(
        "http://localhost:5000/leaves"
      );

    setLeaveRequests(response.data);

  } catch (error) {

    console.log(error);

  }

};

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

  fetchLeaves();

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
        email: employeeEmail,
        phone: employeePhone,
        role: employeeRole,
        joiningDate: joiningDate,
        salary: salary,
        status: "Present",
      }
    );

    setEmployeeName("");
    setDepartment("");
    setEmployeeEmail("");
    setEmployeePhone("");
    setEmployeeRole("");
    setJoiningDate("");
    setSalary("");
    setEmployeeRole("");

setJoiningDate("");

setEmployeeEmail("");

setEmployeePhone("");
setShowModal(false);
setEditingEmployee(null);

    fetchEmployees();

    setShowModal(false);

  } catch (error) {

    console.log(error);

  }

};
const addDepartment = () => {

  if (
    departmentName.trim() === ""
  ) {

    alert(
      "Enter department name"
    );

    return;

  }

  setDepartments([
    ...departments,
    departmentName,
  ]);

  setDepartmentName("");

};


const deleteDepartment = (index) => {

  const updatedDepartments =
    [...departments];

  updatedDepartments.splice(index, 1);

  setDepartments(updatedDepartments);

};


  // DELETE EMPLOYEE
  const deleteEmployee = async (id) => {

    const confirmDelete =
  window.confirm(
    "Are you sure you want to delete this employee?"
  );

if (!confirmDelete) return;

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

    setEmployeeEmail(employee.email);

setEmployeePhone(employee.phone);

setEmployeeRole(employee.role);

setJoiningDate(employee.joiningDate);

setSalary(employee.salary);

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
  email: employeeEmail,
  phone: employeePhone,
  role: employeeRole,
  joiningDate: joiningDate,
  salary: salary,
  status: editingEmployee.status,
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

              <p
  className={`some classes ${
  darkMode
    ? "dark class"
    : "light class"
}`}
>
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
               onClick={async () => {

  try {

    const response =
      await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        }
      );

    setUserRole(
      response.data.role
    );

    setIsLoggedIn(true);

  } catch (error) {

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

              <p
  className={`some classes ${
  darkMode
    ? "dark class"
    : "light class"
}`}
>
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
<div className="w-72 bg-white shadow-xl p-6 flex flex-col">

  {/* LOGO */}
  <div className="flex flex-col items-center mb-10">

    <img
      src={logo}
      alt="logo"
      className="w-24 h-24 object-contain"
    />

  </div>

  {/* MENU */}
  <ul className="space-y-4 w-full">

    <li
      onClick={() =>
        setActivePage("dashboard")
      }
      className={`px-6 py-3 rounded-xl cursor-pointer transition ${
        activePage === "dashboard"
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-200"
      }`}
    >
      Dashboard
    </li>

    {userRole === "Admin" && (
      <li
        onClick={() =>
          setActivePage("employees")
        }
        className={`px-6 py-3 rounded-xl cursor-pointer transition ${
          activePage === "employees"
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        Employees
      </li>
    )}

    {userRole === "Admin" && (
      <li
        onClick={() =>
          setActivePage("departments")
        }
        className={`px-6 py-3 rounded-xl cursor-pointer transition ${
          activePage === "departments"
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        Departments
      </li>
    )}

    <li
      onClick={() =>
        setActivePage("attendance")
      }
      className={`px-6 py-3 rounded-xl cursor-pointer transition ${
        activePage === "attendance"
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-200"
      }`}
    >
      Attendance
    </li>

    <li
      onClick={() =>
        setActivePage("leave")
      }
      className={`px-6 py-3 rounded-xl cursor-pointer transition ${
        activePage === "leave"
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-200"
      }`}
    >
      Leave
    </li>

    {userRole === "Admin" && (
      <li
        onClick={() =>
          setActivePage("payroll")
        }
        className={`px-6 py-3 rounded-xl cursor-pointer transition ${
          activePage === "payroll"
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200"
        }`}
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
    {/* ANALYTICS */}
<div className="bg-white rounded-3xl shadow-xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-8">
    Employee Analytics
  </h2>

  <div className="h-80">

    <ResponsiveContainer width="100%" height="100%">

      <PieChart>

        <Pie
          data={chartData}
          dataKey="value"
          outerRadius={120}
          label
        >

          <Cell fill="#22c55e" />
          <Cell fill="#facc15" />

        </Pie>

        <Tooltip />

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>

  </div>

)}


       {/* EMPLOYEES PAGE */}
{activePage === "employees" &&
  userRole === "Admin" && (

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
      Status
    </th>

    <th className="text-left py-4">
      Action
    </th>

  </tr>

</thead>

      <tbody>
       {employees.filter((employee) =>
  employee.name
    .toLowerCase()
    .includes(
      searchTerm.toLowerCase()
    )
).length === 0 ? (

  <tr>

    <td
      colSpan="4"
      className="text-center py-10 text-gray-500"
    >
      No employees found
    </td>

  </tr>

) : 

  employees
    .filter((employee) =>
      employee.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .map((employee) => (

          <tr
            key={employee._id}
            className="border-b hover:bg-gray-50"
          >

           <td className="py-5">

  <button
    onClick={() =>
      setSelectedEmployee(employee)
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
{/* DEPARTMENTS PAGE */}
{activePage === "departments" &&
  userRole === "Admin" && (

  <div
    className={`rounded-3xl shadow-xl p-8 ${
      darkMode
        ? "bg-slate-800 text-white"
        : "bg-white text-black"
    }`}
  >

    <div className="flex justify-between items-center mb-8">

      <div>

        <div>

  <h2 className="text-4xl font-bold">
    Employees
  </h2>

  <p className="text-gray-500 mt-2">
    Total Employees: {employees.length}
  </p>

</div>

        <p
          className={`mt-2 ${
            darkMode
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          Manage company departments
        </p>

      </div>

    </div>

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left py-4">
            Department Name
          </th>

          <th className="text-left py-4">
            Total Employees
          </th>

          <th className="text-left py-4">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        <tr className="border-b">

          <td className="py-5 font-semibold">
            IT
          </td>

          <td className="py-5">
            3
          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
              Active
            </span>

          </td>

        </tr>

        <tr className="border-b">

          <td className="py-5 font-semibold">
            Engineering
          </td>

          <td className="py-5">
            1
          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
              Active
            </span>

          </td>

        </tr>

        <tr className="border-b">

          <td className="py-5 font-semibold">
            Management
          </td>

          <td className="py-5">
            1
          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
              Active
            </span>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

)}


{/* ATTENDANCE PAGE */}
{activePage === "attendance" && (

  <div className="space-y-8">

    {/* HEADER */}

    <div className={`rounded-3xl shadow-xl p-8 ${
  darkMode
    ? "bg-slate-800 text-white"
    : "bg-white text-black"
}`}
>
      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-4xl font-bold">
            Attendance
          </h2>

          <p className="text-gray-500 mt-2">
            Mark employee attendance and manage check-in/check-out.
          </p>

        </div>

      </div>

    </div>

    
    {/* ATTENDANCE TABLE */}

    <div className={`rounded-3xl shadow-xl p-8 ${
  darkMode
    ? "bg-slate-800 text-white"
    : "bg-white text-black"
}`}
>

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
              Action
            </th>

          </tr>

        </thead>

        <tbody>

         {
  employees
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

              <td className="py-5">

                <button
                  onClick={() =>
                    setSelectedEmployee(employee)
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
                  onClick={() =>
                    toggleStatus(employee)
                  }
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

  </div>

)}
{/* ADD EMPLOYEE MODAL */}
{showModal && (

  <div
  onClick={() =>
    setShowModal(false)
  }
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>

    <div
  onClick={(e) =>
    e.stopPropagation()
  }
  className="bg-white rounded-3xl p-8 w-full max-w-md"
>

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
        <input
  type="email"
  placeholder="Email"
  value={employeeEmail}
  onChange={(e) =>
    setEmployeeEmail(e.target.value)
  }
  className="w-full border p-3 rounded-xl"
/>

<input
  type="text"
  placeholder="Phone"
  value={employeePhone}
  onChange={(e) =>
    setEmployeePhone(e.target.value)
  }
  className="w-full border p-3 rounded-xl"
/>

<input
  type="text"
  placeholder="Role"
  value={employeeRole}
  onChange={(e) =>
    setEmployeeRole(e.target.value)
  }
  className="w-full border p-3 rounded-xl"
/>

<input
  type="date"
  value={joiningDate}
  onChange={(e) =>
    setJoiningDate(e.target.value)
  }
  className="w-full border p-3 rounded-xl"
/>

<input
  type="number"
  placeholder="Salary"
  value={salary}
  onChange={(e) =>
    setSalary(e.target.value)
  }
  className="w-full border p-3 rounded-xl"
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
{/* EMPLOYEE PROFILE MODAL */}
{selectedEmployee && (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-3xl font-bold">
          Employee Profile
        </h2>

        <button
          onClick={() =>
            setSelectedEmployee(null)
          }
          className="text-3xl text-gray-500"
        >
          ×
        </button>

      </div>

      <div className="space-y-5 text-lg">

        <div>
          <span className="font-bold">
            Name:
          </span>{" "}
          {selectedEmployee.name}
        </div>

        <div>
          <span className="font-bold">
            Department:
          </span>{" "}
          {selectedEmployee.department}
        </div>

        <div>
          <span className="font-bold">
            Email:
          </span>{" "}
          {selectedEmployee.email || "N/A"}
        </div>

        <div>
          <span className="font-bold">
            Phone:
          </span>{" "}
          {selectedEmployee.phone || "N/A"}
        </div>

        <div>
          <span className="font-bold">
            Role:
          </span>{" "}
          {selectedEmployee.role || "N/A"}
        </div>

        <div>
          <span className="font-bold">
            Joining Date:
          </span>{" "}
          {selectedEmployee.joiningDate || "N/A"}
        </div>

        <div>
          <span className="font-bold">
            Salary:
          </span>{" "}
          ₹{selectedEmployee.salary || 25000}
        </div>

        <div>
          <span className="font-bold">
            Status:
          </span>{" "}
          {selectedEmployee.status}
        </div>

      </div>

    </div>

  </div>

)}

  {/* LEAVE PAGE */}
{activePage === "leave" && (

  <div
  className={`rounded-3xl shadow-xl p-8 ${
    darkMode
      ? "bg-slate-800 text-white"
      : "bg-white text-black"
  }`}
>

  <h1 className="text-5xl font-bold mb-2">
    Leave Management
  </h1>

  <p className="text-gray-500 mb-10">
    Approve or reject employee leave requests
  </p>

  <table className="w-full">

    <thead>

      <tr className="border-b">

        <th className="text-left py-4">Employee</th>
        <th className="text-left py-4">Leave Type</th>
        <th className="text-left py-4">From</th>
        <th className="text-left py-4">To</th>
        <th className="text-left py-4">Reason</th>
        <th className="text-left py-4">Status</th>
        <th className="text-left py-4">Action</th>

      </tr>

    </thead>

    <tbody>

      {leaveRequests.map((leave) => (

        <tr
          key={leave.id}
          className="border-b"
        >

          <td className="py-5">
            {leave.employee}
          </td>

          <td className="py-5">
            {leave.leaveType}
          </td>

          <td className="py-5">
            {leave.from}
          </td>

          <td className="py-5">
            {leave.to}
          </td>

          <td className="py-5">
            {leave.reason}
          </td>

          <td className="py-5">
            {leave.status}
          </td>

          <td className="py-5">
            Action
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
)}
{/* PAYROLL PAGE */}
{activePage === "payroll" && (

  <div
    className={`rounded-3xl shadow-xl p-8 ${
      darkMode
        ? "bg-slate-800 text-white"
        : "bg-white text-black"
    }`}
  >

    <div className="flex justify-between items-center mb-8">

      <div>

        <h2 className="text-4xl font-bold">
          Payroll Management
        </h2>

        <p
          className={`mt-2 ${
            darkMode
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          Manage employee salaries and payroll
        </p>

      </div>

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
                disabled={
                  payrollStatus[employee._id] === "Paid"
                }
                className={`px-4 py-2 rounded-xl text-sm text-white ${
                  payrollStatus[employee._id] === "Paid"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {payrollStatus[employee._id] === "Paid"
                  ? "Paid"
                  : "Pay"}
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

)}

    </div>

  </div>

);

}