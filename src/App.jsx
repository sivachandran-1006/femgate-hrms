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
import jsPDF from "jspdf";


export default function HRMSApp() {
  

  // LOGIN
  const [isLoggedIn, setIsLoggedIn]
  = useState(false);
  const [userRole, setUserRole] =
   useState("Admin");
  const [loggedInEmployee,
  setLoggedInEmployee] =
    useState(null);
  const [profileImage,
  setProfileImage] =
    useState("");
  

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
 

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [reportingManager,
  setReportingManager] =
    useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [salary, setSalary] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] =
   useState([]);
  const [leaveType, setLeaveType] =
   useState("");

  const [leaveFrom, setLeaveFrom] =
   useState("");

  const [leaveTo, setLeaveTo] =
   useState("");

  const [leaveReason, setLeaveReason] =
   useState("");
  const [sortOrder, setSortOrder] =
  useState("asc");
  const [statusFilter, setStatusFilter] =
  useState("All");
  const [leaveForm, setLeaveForm] =
  useState({
    employee: "",
    leaveType: "",
    from: "",
    to: "",
    reason: "",
  });
  const [checkInTime, setCheckInTime] =
   useState("");

  const [checkOutTime, setCheckOutTime] =
   useState("");
  const [notification, setNotification] =
   useState("");
   const [notificationType,
  setNotificationType] =
    useState("success");

const hasAccess = (
  allowedRoles
) => {

  return allowedRoles.includes(
    userRole
  );

};
  const [holidays] = useState([
  {
    name: "New Year",
    date: "2026-01-01",
  },
  {
    name: "Pongal",
    date: "2026-01-14",
  },
  {
    name: "Republic Day",
    date: "2026-01-26",
  },
]);


const [attendanceRecords, setAttendanceRecords] =
  useState([]);

const fetchAttendance = async () => {

  try {

    const response =
      await axios.get(
        "http://localhost:5000/attendance"
      );

    setAttendanceRecords(
      response.data
    );

  } catch (error) {

    console.log(error);

  }

};
  

  // LEAVE
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
  const [showProfile, setShowProfile] =
  useState(false);

  
  
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

  fetchAttendance();

}, []);
useEffect(() => {

  const token =
    localStorage.getItem(
      "token"
    );

  const role =
    localStorage.getItem(
      "role"
    );

  const employee =
    JSON.parse(
      localStorage.getItem(
        "employee"
      )
    );

  if (token) {

    setIsLoggedIn(true);

    setUserRole(role);

    setLoggedInEmployee(
      employee
    );
 setProfileImage(
  localStorage.getItem(
    "profileImage"
  ) || ""
);

  }

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

    password: password,

    phone: employeePhone,

    role: employeeRole,

    joiningDate: joiningDate,

    salary: salary,
    reportingManager:
  reportingManager, 

    status: "Present",
  }
);
    setEmployeeName("");
setDepartment("");
setEmployeeEmail("");
setPassword("");
setEmployeePhone("");
setEmployeeRole("");
setJoiningDate("");
setSalary("");
setReportingManager("");
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
const applyLeave = async () => {

  try {

    await axios.post(
      "http://localhost:5000/leaves",
      {
        ...leaveForm,
        status: "Pending",
      }
    );

    fetchLeaves();

    setLeaveForm({
      employee: "",
      leaveType: "",
      from: "",
      to: "",
      reason: "",
    });

    alert(
      "Leave Applied Successfully"
    );

  } catch (error) {

    console.log(error);

  }

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

  
  
  const downloadPayslip = (
  employee
) => {

  const doc = new jsPDF();

  // HEADER
  doc.setFillColor(37, 99, 235);

  doc.rect(0, 0, 220, 35, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFontSize(24);

  doc.text(
    "MGate HRMS Payslip",
    20,
    22
  );

  // RESET COLOR
  doc.setTextColor(0, 0, 0);

  // EMPLOYEE DETAILS
  doc.setFontSize(16);

  doc.text(
    `Employee Name: ${employee.name}`,
    20,
    60
  );

  doc.text(
    `Department: ${employee.department}`,
    20,
    80
  );

  doc.text(
    `Salary: ₹${employee.salary || 25000}`,
    20,
    100
  );

  doc.text(
    `Status: ${employee.status}`,
    20,
    120
  );

  // LINE
  doc.line(20, 135, 190, 135);

  // SALARY BREAKDOWN
  doc.setFontSize(18);

  doc.text(
    "Salary Breakdown",
    20,
    155
  );

  doc.setFontSize(14);

  doc.text(
    "Basic Salary",
    20,
    180
  );

  doc.text(
    `₹${employee.salary || 25000}`,
    150,
    180
  );

  doc.text(
    "HRA",
    20,
    200
  );

  doc.text(
    "₹5000",
    150,
    200
  );

  doc.text(
    "Bonus",
    20,
    220
  );

  doc.text(
    "₹2000",
    150,
    220
  );

  // FOOTER
  doc.setFontSize(10);

  doc.text(
    "Generated by MGate HRMS",
    20,
    280
  );

  doc.save(
    `${employee.name}-Payslip.pdf`
  );

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
const filteredEmployees =
  employees
    .filter((employee) => {

      const matchesSearch =
        employee.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "All"
          ? true
          : employee.status ===
            statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

const teamMembers =
  employees.filter(
    (employee) =>

      employee.reportingManager ===
      loggedInEmployee?.name
  );

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
              <div className="flex gap-4 mt-5">

  <div className="flex gap-3 mt-5 flex-wrap">

  {[
    "Super Admin",
    "Admin",
    "HR",
    "Manager",
    "Finance",
    "Employee",
  ].map((role) => (

    <button
      key={role}
      onClick={() =>
        setUserRole(role)
      }
      className={`px-5 py-2 rounded-xl ${
        userRole === role
          ? "bg-blue-600 text-white"
          : "bg-gray-200"
      }`}
    >
      {role}
    </button>

  ))}

</div>

  <button
    onClick={() =>
      setUserRole("Employee")
    }
    className={`px-5 py-2 rounded-xl ${
      userRole === "Employee"
        ? "bg-green-600 text-white"
        : "bg-gray-200"
    }`}
  >
    Employee
  </button>

</div>

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
    setLoggedInEmployee(
  response.data.employee
);
    localStorage.setItem(
  "token",
  response.data.token
);

localStorage.setItem(
  "role",
  response.data.role
);
localStorage.setItem(
  "employee",
  JSON.stringify(
    response.data.employee
  )
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
<div className="w-64 bg-white shadow-xl p-6 flex flex-col">

  {/* LOGO */}
  <div className="flex flex-col items-center mb-10">

    <img
      src={logo}
      alt="logo"
      className="w-24 h-24 object-contain"
    />

  </div>

  {/* MENU */}
  <ul className="space-y-2 w-full mt-6">

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

{[
  "Super Admin",
  "Admin",
  "Finance",
].includes(userRole) && (
  
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
<li
  onClick={() =>
    setActivePage("profile")
  }
  className={`px-5 py-3 rounded-xl text-lg cursor-pointer transition ${
    activePage === "profile"
      ? "bg-blue-600 text-white"
      : "hover:bg-blue-100 hover:text-blue-700"
  }`}
>
  My Profile
</li>


  {[
  "Super Admin",
  "Admin",
  "Finance",
].includes(userRole) && (

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
{[
  "Super Admin",
  "Admin",
  "Finance",
].includes(userRole) && (

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

  {hasAccess([
  "Super Admin",
  "Admin",
]) && (

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
    onClick={() => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "role"
  );

  setIsLoggedIn(false);

}}
     
    
    className="bg-red-500 text-white px-5 py-3 rounded-2xl"
  >
    Logout
  </button>

</div>
</div>
{notification && (

  <div
    className={`px-5 py-3 rounded-xl text-lgmb-6 shadow-lg text-white animate-pulse ${
      notificationType === "success"
        ? "bg-green-600"
        : notificationType === "error"
        ? "bg-red-600"
        : "bg-yellow-500"
    }`}
  >

    {notification}

  </div>

)}
       {/* DASHBOARD */}
{activePage === "dashboard" && (

  <div>

    {/* TOP CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

  {/* TOTAL */}
  <div className="bg-white rounded-3xl shadow-xl p-6">

    <h2 className="text-gray-500 text-lg">
      Total Employees
    </h2>

    <p className="text-5xl font-bold mt-4 text-blue-600">
      {employees.length}
    </p>

  </div>

  {/* PRESENT */}
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

  {/* LEAVE */}
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

  {/* PENDING */}
  <div className="bg-white rounded-3xl shadow-xl p-6">

    <h2 className="text-gray-500 text-lg">
      Pending Leaves
    </h2>

    <p className="text-5xl font-bold mt-4 text-red-500">

      {
        leaveRequests.filter(
          (leave) =>
            leave.status === "Pending"
        ).length
      }

    </p>

  </div>

  {/* TEAM MEMBERS */}
  {hasAccess([
    "Manager",
    "Admin",
    "Super Admin",
  ]) && (

    <div className="bg-white rounded-3xl shadow-xl p-6">

      <h2 className="text-gray-500 text-lg">
        Team Members
      </h2>

      <p className="text-5xl font-bold mt-4 text-blue-600">

        {teamMembers.length}

      </p>

    </div>

  )}

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
    {/* QUICK ACTIONS */}

<div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-8">

  <div
    onClick={() =>
      setActivePage("leave")
    }
    className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 transition"
  >
    <h3 className="font-bold">
      Apply Leave
    </h3>
  </div>

  <div
    onClick={() =>
      setActivePage("attendance")
    }
    className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 transition"
  >
    <h3 className="font-bold">
      My Attendance
    </h3>
  </div>

  <div
    onClick={() =>
      setActivePage("payroll")
    }
    className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 transition"
  >
    <h3 className="font-bold">
      Payslips
    </h3>
  </div>

  <div
  onClick={() =>
    setActivePage("holidays")
  }
  className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 transition"
>
    <h3 className="font-bold">
      Holidays
    </h3>
  </div>

  <div
  onClick={() =>
    setShowProfile(true)
  }
  className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 transition"
>
  <h3 className="font-bold">
    My Profile
  </h3>
</div>

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
hasAccess([
  "Super Admin",
  "Admin",
  "HR",
]) && (

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
    setStatusFilter(e.target.value)
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

  filteredEmployees
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
  {employee.reportingManager || "N/A"}
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
hasAccess([
  "Super Admin",
  "Admin",
  "HR",
]) && (

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
    Departments
  </h2>

  <p className="text-gray-500 mt-2">
    Total Employees: {employees.length}
  </p>
  

</div>
<div className="flex gap-4 mb-8">

  <input
    type="text"
    placeholder="Department Name"
    value={departmentName}
    onChange={(e) =>
      setDepartmentName(
        e.target.value
      )
    }
    className="border rounded-2xl px-4 py-3 w-72"
  />

  <button
    onClick={addDepartment}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl"
  >
    Add Department
  </button>

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
        Department
      </th>

      <th className="text-left py-4">
        Employees
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

    {departments.map(
      (dept, index) => (

        <tr
          key={index}
          className="border-b"
        >

          <td className="py-5 font-semibold">
            {dept}
          </td>

          <td className="py-5">

            {
              employees.filter(
                (emp) =>
                  emp.department === dept
              ).length
            }

          </td>

          <td className="py-5">

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">

              Active

            </span>

          </td>

          <td className="py-5">

            <button
              onClick={() =>
                deleteDepartment(index)
              }
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
            >
              Delete
            </button>

          </td>

        </tr>

      )
    )}

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

    {/* ATTENDANCE STATS */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <div className="bg-blue-100 rounded-3xl p-6">

    <h3 className="text-gray-600">
  Total Employees
</h3>

<p className="text-4xl font-bold text-blue-700 mt-3">
      {employees.length}
    </p>

  </div>

  <div className="bg-green-100 rounded-3xl p-6">

    <h3 className="text-gray-600">
      Present Employees
    </h3>
    

    <p className="text-4xl font-bold text-green-700 mt-3">
      {
        employees.filter(
          (emp) =>
            emp.status === "Present"
        ).length
      }
    </p>

  </div>

  <div className="bg-yellow-100 rounded-3xl p-6">

    <h3 className="text-gray-600">
      On Leave
    </h3>

    <p className="text-4xl font-bold text-yellow-700 mt-3">
      {
        employees.filter(
          (emp) =>
            emp.status === "Leave"
        ).length
      }
    </p>

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

               <div className="flex gap-3">

  <button

  disabled={
    attendanceRecords.some(
      (record) =>

        record.employee ===
          employee.name &&

        record.date ===
          new Date().toLocaleDateString()
    )
  }

  onClick={async () => {

    const now =
      new Date().toLocaleTimeString();

    const today =
      new Date().toLocaleDateString();

    setCheckInTime(now);

    const alreadyCheckedIn =
      attendanceRecords.find(
        (record) =>

          record.employee ===
            employee.name &&

          record.date === today
      );

    if (alreadyCheckedIn) {

      setNotification(
        "Already Checked In Today"
      );

      setTimeout(() => {

        setNotification("");

      }, 3000);

      return;

    }

    try {

      await axios.post(
        "http://localhost:5000/attendance",
        {
          employee:
            employee.name,

          department:
            employee.department,

          checkIn: now,

          checkOut: "-",

          date: today,

          status: "Present",
        }
      );

      fetchAttendance();

      setNotification(
        "Checked In Successfully"
      );

      setTimeout(() => {

        setNotification("");

      }, 3000);

    } catch (error) {

      console.log(error);

    }

  }}

  className={`px-4 py-2 rounded-xl text-white ${
    attendanceRecords.some(
      (record) =>

        record.employee ===
          employee.name &&

        record.date ===
          new Date().toLocaleDateString()
    )
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>

  {attendanceRecords.some(
    (record) =>

      record.employee ===
        employee.name &&

      record.date ===
        new Date().toLocaleDateString()
  )
    ? "Checked In"
    : "Check In"}

</button>
  <button
    onClick={async () => {

  const now =
    new Date().toLocaleTimeString();

  setCheckOutTime(now);

  try {

    const latestAttendance =
  attendanceRecords.find(
    (record) =>

      record.employee ===
        employee.name &&

      record.date ===
        new Date().toLocaleDateString()
  );

    await axios.put(

      `http://localhost:5000/attendance-checkout/${latestAttendance._id}`,

      {
        checkOut: now,
      }

    );

    fetchAttendance();

    setNotification(
      "Checked Out Successfully"
    );

    setTimeout(() => {

      setNotification("");

    }, 3000);

  } catch (error) {

    console.log(error);

  }

}}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
  >
    Check Out
  </button>

</div>
<div className="text-sm mt-2 text-gray-500">

  {checkInTime && (
    <p>
      In: {checkInTime}
    </p>
  )}

  {checkOutTime && (
    <p>
      Out: {checkOutTime}
    </p>
  )}

</div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>
      {/* ATTENDANCE HISTORY */}

<div className="bg-white rounded-3xl shadow-xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-6">
    Attendance History
  </h2>

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
          Date
        </th>

        <th className="text-left py-4">
          Check In
        </th>

        <th className="text-left py-4">
          Check Out
        </th>

        <th className="text-left py-4">
          Status
        </th>

      </tr>

    </thead>

    <tbody>

      {attendanceRecords.map(
        (record, index) => (

          <tr
            key={index}
            className="border-b"
          >

            <td className="py-5">
              {record.employee}
            </td>

            <td className="py-5">
              {record.department}
            </td>

            <td className="py-5">
              {record.date}
            </td>

            <td className="py-5">
              {record.checkIn}
            </td>

            <td className="py-5">
              {record.checkOut}
            </td>

            <td className="py-5">

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">

                {record.status}

              </span>

            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>
      

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
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
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

<select
  value={employeeRole}
  onChange={(e) =>
    setEmployeeRole(
      e.target.value
    )
  }
  className="w-full border p-3 rounded-xl"
>

  <option value="">
    Select Role
  </option>

  <option value="Super Admin">
    Super Admin
  </option>

  <option value="HR">
    HR
  </option>

  <option value="Manager">
    Manager
  </option>

  <option value="Team Lead">
    Team Lead
  </option>

  <option value="Finance">
    Finance
  </option>

  <option value="IT Admin">
    IT Admin
  </option>

  <option value="Employee">
    Employee
  </option>

</select>
<input
  type="text"
  placeholder="Reporting Manager"
  value={reportingManager}
  onChange={(e) =>
    setReportingManager(
      e.target.value
    )
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
{/* PROFILE PAGE */} 
{activePage === "profile" && (

  <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">

    <h2 className="text-4xl font-bold mb-8">
      My Profile
    </h2>

    <div className="space-y-6">

      <div>
        <p className="text-gray-500">
          Name
        </p>

        <h3 className="text-2xl font-bold">
          {loggedInEmployee?.name}
        </h3>
      </div>

      <div>
        <p className="text-gray-500">
          Email
        </p>

        <h3 className="text-xl">
          {loggedInEmployee?.email}
        </h3>
      </div>

      <div>
        <p className="text-gray-500">
          Department
        </p>

        <h3 className="text-xl">
          {loggedInEmployee?.department}
        </h3>
      </div>

      <div>
        <p className="text-gray-500">
          Role
        </p>

        <h3 className="text-xl">
          {loggedInEmployee?.role}
        </h3>
      </div>

      <div>
        <p className="text-gray-500">
          Reporting Manager
        </p>

        <h3 className="text-xl">
          {loggedInEmployee?.reportingManager || "N/A"}
        </h3>
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
  {userRole === "Employee" && (

  <button
    onClick={() =>
      setShowLeaveModal(true)
    }
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl mt-5"
  >
    Apply Leave
  </button>

)}

  <p className="text-gray-500 mb-10">
    {userRole === "Admin"
  ? "Approve or reject employee leave requests"
  : "Apply and track your leave requests"}
  </p>
 

{/* APPLY LEAVE FORM */}



  <table className="w-full">

    <thead>

  <tr className="border-b">

    <th className="text-left py-4">Employee</th>

    <th className="text-left py-4">Leave Type</th>

    <th className="text-left py-4">From</th>

    <th className="text-left py-4">To</th>

    <th className="text-left py-4">Reason</th>
    
    <th className="text-left py-4">
  Approval Stage
</th>

    <th className="text-left py-4">Status</th>

      </tr>

    </thead>

    <tbody>

     {leaveRequests.map((leave, index) => (

  <tr
    key={index}
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

  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">

    {leave.approvalStage}

  </span>

</td>

    <td className="py-5">

      <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">

        {leave.status}

      </span>

    </td>

    <td className="py-5">

      {userRole === "Admin" ? (

        <div className="flex gap-3">

          <button

  onClick={async () => {

    await axios.put(

      `http://localhost:5000/leave-status/${leave._id}`,

      {
        status: "Approved",
      }

    );

    setNotification(
      "Leave Approved Successfully"
    );

    setTimeout(() => {

      setNotification("");

    }, 3000);

    fetchLeaves();

  }}

  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
>

  Approve

</button>
         <button

  onClick={async () => {

    await axios.put(

      `http://localhost:5000/leave-status/${leave._id}`,

      {
        status: "Rejected",
      }

    );

    fetchLeaves();

  }}

  className="bg-red-600 text-white px-4 py-2 rounded-xl"
>

  Reject

</button>

        </div>

      ) : (

        <span className="text-gray-500">
          Waiting
        </span>

      )}

    </td>

  </tr>

))}
    </tbody>

  </table>

</div>
)}
{/* HOLIDAYS PAGE */}
{activePage === "holidays" && (

  <div className="bg-white rounded-3xl shadow-xl p-8">

    <h2 className="text-4xl font-bold mb-3">
      Holiday Calendar
    </h2>

    <p className="text-gray-500 mb-8">
      Company and public holidays
    </p>

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left py-4">
            Holiday
          </th>

          <th className="text-left py-4">
            Date
          </th>

        </tr>

      </thead>

      <tbody>

        {holidays.map((holiday, index) => (

          <tr
            key={index}
            className="border-b"
          >

            <td className="py-5 font-semibold">
              {holiday.name}
            </td>

            <td className="py-5">
              {holiday.date}
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
  Reporting Manager
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
  {employee.reportingManager}
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
  onClick={() =>
    downloadPayslip(employee)
  }
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
{/* MY PROFILE MODAL */}
{showProfile && (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-black">
          Employee Profile
        </h2>

        <button
          onClick={() =>
            setShowProfile(false)
          }
          className="text-red-500 text-xl"
        >
          ✕
        </button>

      </div>
      <div className="flex flex-col items-center">

  

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

  const file =
    e.target.files[0];

  if (file) {

    const reader =
      new FileReader();

    reader.onloadend = () => {

      setProfileImage(
        reader.result
      );

      localStorage.setItem(
        "profileImage",
        reader.result
      );

    };

    reader.readAsDataURL(file);

  }

}}
  />

</div>
<div className="flex justify-center mb-6">

  <img
    src={
      profileImage ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt="profile"
    className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
  />

</div>

      <div className="space-y-4 text-black">

        <div>

          <p className="text-gray-500">
            Name
          </p>

          <h3 className="font-bold">
  {loggedInEmployee?.name}
</h3>

        </div>

        <div>

          <p className="text-gray-500">
            Department
          </p>

          <h3 className="font-bold">
            {loggedInEmployee?.department}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">
            Role
          </p>

          <h3 className="font-bold">
            {loggedInEmployee?.role}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">
            Email
          </p>

          <h3 className="font-bold">
            {loggedInEmployee?.email}
          </h3>

        </div>

      </div>

    </div>

  </div>

)}


{/* LEAVE MODAL */}

{showLeaveModal && (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Apply Leave
        </h2>

        <button
          onClick={() =>
            setShowLeaveModal(false)
          }
          className="text-red-500 text-xl"
        >
          ✕
        </button>

      </div>

      <div className="space-y-5">

  <input
  type="text"
  placeholder="Leave Type"
  value={leaveType}
  onChange={(e) =>
    setLeaveType(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

        <input
  type="date"
  value={leaveFrom}
  onChange={(e) =>
    setLeaveFrom(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

        <input
  type="date"
  value={leaveTo}
  onChange={(e) =>
    setLeaveTo(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

       <textarea
  placeholder="Reason"
  value={leaveReason}
  onChange={(e) =>
    setLeaveReason(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3 h-32"
/>

        
  <button
  onClick={async () => {

    try {

  await axios.post(
    "http://localhost:5000/apply-leave",
    {
      employee:
  loggedInEmployee?.name,

      leaveType:
        leaveType,

      fromDate:
        leaveFrom,

      toDate:
        leaveTo,

      reason:
        leaveReason,
    }
  );

  alert(
    "Leave Applied Successfully"
  );

  fetchLeaves();

  setShowLeaveModal(false);

  setLeaveType("");
  setLeaveFrom("");
  setLeaveTo("");
  setLeaveReason("");

} catch (error) {

  console.log(error);

}
  }}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl"
>
  Submit Leave Request
</button>
    

      </div>

    </div>

  </div>

)}
    </div>
</div>

  );
}

   








