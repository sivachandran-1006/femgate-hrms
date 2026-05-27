import { useState, useEffect } from "react";
import {

  Routes,

  Route,

  Navigate,

} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Departments from "./pages/Departments";
import EmployeeModal from "./components/EmployeeModal";
import {

  fetchEmployeesAPI,

  addEmployeeAPI,

  updateEmployeeAPI,

  deleteEmployeeAPI,

} from "./services/employeeService";
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
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";





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
  const [
  employeePassword,
  setEmployeePassword,
] = useState("");
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

    "http://localhost:5000/attendance",

  
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

   const data =
  await fetchEmployeesAPI();

setEmployees(data);

  } catch (error) {

    console.log(error);

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "employee"
      );

      localStorage.removeItem(
        "role"
      );

      setIsLoggedIn(false);

      alert(
        "Session Expired. Login Again."
      );

    }

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

   await addEmployeeAPI({

  name: employeeName,

  department: department,

  email: employeeEmail,

  password: employeePassword,

  phone: employeePhone,

  role: employeeRole,

  joiningDate: joiningDate,

  salary: salary,

  reportingManager:
    reportingManager,

  status: "Present",

});
    setEmployeeName("");
setDepartment("");
setEmployeeEmail("");
setEmployeePassword("");
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

    alert(
      "Employee Deleted Successfully"
    );

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

    await updateEmployeeAPI(

  editingEmployee._id,

  {
    name: employeeName,

    department: department,

    email: employeeEmail,

    phone: employeePhone,

    role: employeeRole,

    joiningDate: joiningDate,

    salary: salary,

    status:
      editingEmployee.status,
  }

);
    fetchEmployees();

    setShowModal(false);

    setEditingEmployee(null);

    setEmployeeName("");
    setDepartment("");
    setEmployeeEmail("");
    setEmployeePhone("");
    setEmployeeRole("");
    setJoiningDate("");
    setSalary("");

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

  <div
  className={`min-h-screen flex ${
    darkMode
      ? "bg-slate-900 text-white"
      : "bg-slate-100"
  }`}
>

     <Sidebar

  activePage={activePage}

  setActivePage={
    setActivePage
  }

  userRole={userRole}

  logo={logo}

/>
 {/* MAIN */}
      
<div className="flex-1 p-8">

       <Header

  userRole={userRole}

  hasAccess={hasAccess}

  exportToExcel={
    exportToExcel
  }

  setEditingEmployee={
    setEditingEmployee
  }

  setEmployeeName={
    setEmployeeName
  }

  setDepartment={
    setDepartment
  }

  setShowModal={
    setShowModal
  }

  setDarkMode={
    setDarkMode
  }

  darkMode={darkMode}

  setIsLoggedIn={
    setIsLoggedIn
  }

/>
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

  <Dashboard
    employees={employees}
    leaves={leaveRequests}
  />

)}

{activePage === "employees" &&
hasAccess([
  "Super Admin",
  "Admin",
  "HR",
]) && (
  <Employees
  employees={employees}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  sortOrder={sortOrder}
  setSortOrder={setSortOrder}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
  filteredEmployees={filteredEmployees}
  setSelectedEmployee={
    setSelectedEmployee
  }
  editEmployee={editEmployee}
  deleteEmployee={deleteEmployee}
/>
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

{showModal && (

  <EmployeeModal

    showModal={showModal}
    setShowModal={setShowModal}

    employeeName={employeeName}
    setEmployeeName={setEmployeeName}

    department={department}
    setDepartment={setDepartment}

    employeeEmail={employeeEmail}
    setEmployeeEmail={setEmployeeEmail}

    employeePassword={
      employeePassword
    }
    setEmployeePassword={
      setEmployeePassword
    }

    employeePhone={employeePhone}
    setEmployeePhone={
      setEmployeePhone
    }

    employeeRole={employeeRole}
    setEmployeeRole={
      setEmployeeRole
    }

    joiningDate={joiningDate}
    setJoiningDate={
      setJoiningDate
    }

    salary={salary}
    setSalary={setSalary}

    reportingManager={
      reportingManager
    }
    setReportingManager={
      setReportingManager
    }

    employees={employees}

    editingEmployee={
      editingEmployee
    }

    addEmployee={addEmployee}

    updateEmployee={
      updateEmployee
    }

  />

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

  <Leave

    leaveRequests={
      leaveRequests
    }

    userRole={userRole}

    setShowLeaveModal={
      setShowLeaveModal
    }

  />

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


   








