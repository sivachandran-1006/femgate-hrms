import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./components/Attendance";
import Payroll from "./pages/Payroll";
import Leave from "./pages/Leave";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import EmployeeModal from "./components/EmployeeModal";

import {
  fetchEmployeesAPI,
  addEmployeeAPI,
  updateEmployeeAPI,
} from "./services/employeeService";

export default function HRMSApp() {

  // ── AUTH ──────────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn]             = useState(false);
  const [userRole, setUserRole]                 = useState("Admin");
  const [loggedInEmployee, setLoggedInEmployee] = useState(null);
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");

  // ── UI ────────────────────────────────────────────────────────────────────
  const [activePage, setActivePage]             = useState("dashboard");
  const [darkMode, setDarkMode]                 = useState(false);
  const [showModal, setShowModal]               = useState(false);
  const [showLeaveModal, setShowLeaveModal]     = useState(false);
  const [notification, setNotification]         = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ── EMPLOYEE FORM ─────────────────────────────────────────────────────────
  const [editingEmployee, setEditingEmployee]   = useState(null);
  const [employeeName, setEmployeeName]         = useState("");
  const [department, setDepartment]             = useState("");
  const [employeeEmail, setEmployeeEmail]       = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeePhone, setEmployeePhone]       = useState("");
  const [employeeRole, setEmployeeRole]         = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [joiningDate, setJoiningDate]           = useState("");
  const [salary, setSalary]                     = useState("");

  // ── MOCK DATA ─────────────────────────────────────────────────────────────
  const MOCK_EMPLOYEES = [
    { _id: "emp001", name: "Mani",        department: "IT",         designation: "Software Engineer",   email: "mani@mgatetech.com",       phone: "9876543210", role: "Software Engineer",   salary: "72000",  joiningDate: "2023-06-15", joinDate: "15/06/2023", status: "Present", reportingManager: "Siva" },
    { _id: "emp002", name: "Siva",        department: "Management", designation: "Engineering Manager", email: "siva@mgatetech.com",       phone: "9876543211", role: "Engineering Manager",  salary: "95000",  joiningDate: "2021-01-05", joinDate: "05/01/2021", status: "Present", reportingManager: "" },
    { _id: "emp003", name: "Santhosh",    department: "IT",         designation: "Backend Developer",   email: "santhosh@mgatetech.com",   phone: "9876543212", role: "Backend Developer",    salary: "69000",  joiningDate: "2023-08-30", joinDate: "30/08/2023", status: "Present", reportingManager: "Siva" },
    { _id: "emp004", name: "Safeer",      department: "Finance",    designation: "Finance Analyst",     email: "safeer@mgatetech.com",     phone: "9876543213", role: "Finance Analyst",      salary: "58000",  joiningDate: "2023-09-20", joinDate: "20/09/2023", status: "Leave",   reportingManager: "Suganthan" },
    { _id: "emp005", name: "Hari",        department: "IT",         designation: "Frontend Developer",  email: "hari@mgatetech.com",       phone: "9876543214", role: "Frontend Developer",   salary: "62000",  joiningDate: "2023-04-18", joinDate: "18/04/2023", status: "Present", reportingManager: "Siva" },
    { _id: "emp006", name: "Suriya",      department: "IT",         designation: "DevOps Engineer",     email: "suriya@mgatetech.com",     phone: "9876543215", role: "DevOps Engineer",      salary: "78000",  joiningDate: "2022-11-01", joinDate: "01/11/2022", status: "Present", reportingManager: "Siva" },
    { _id: "emp007", name: "Big Kundi",   department: "HR",         designation: "HR Manager",          email: "bigkundi@mgatetech.com",   phone: "9876543216", role: "HR Manager",           salary: "65000",  joiningDate: "2022-03-10", joinDate: "10/03/2022", status: "Present", reportingManager: "Suganthan" },
    { _id: "emp008", name: "Small Kundi", department: "HR",         designation: "Recruiter",           email: "smallkundi@mgatetech.com", phone: "9876543217", role: "Recruiter",            salary: "48000",  joiningDate: "2024-02-14", joinDate: "14/02/2024", status: "Present", reportingManager: "Big Kundi" },
    { _id: "emp009", name: "Suganthan",   department: "Management", designation: "Director",            email: "suganthan@mgatetech.com",  phone: "9876543218", role: "Director",             salary: "120000", joiningDate: "2020-06-01", joinDate: "01/06/2020", status: "Present", reportingManager: "" },
    { _id: "emp010", name: "Sabari",      department: "IT",         designation: "QA Engineer",         email: "sabari@mgatetech.com",     phone: "9876543219", role: "QA Engineer",          salary: "55000",  joiningDate: "2024-03-11", joinDate: "11/03/2024", status: "Present", reportingManager: "Siva" },
  ];

  const MOCK_LEAVES = [
    { _id: "lv001", employee: "Safeer",      leaveType: "Sick Leave",   fromDate: "2026-05-20", toDate: "2026-05-22", days: 3, reason: "Fever",           status: "Approved" },
    { _id: "lv002", employee: "Suriya",      leaveType: "Casual Leave", fromDate: "2026-05-28", toDate: "2026-05-28", days: 1, reason: "Personal work",   status: "Pending"  },
    { _id: "lv003", employee: "Small Kundi", leaveType: "Casual Leave", fromDate: "2026-06-02", toDate: "2026-06-03", days: 2, reason: "Family function", status: "Pending"  },
    { _id: "lv004", employee: "Hari",        leaveType: "Sick Leave",   fromDate: "2026-05-30", toDate: "2026-05-30", days: 1, reason: "Doctor visit",    status: "Pending"  },
    { _id: "lv005", employee: "Mani",        leaveType: "Annual Leave", fromDate: "2026-04-10", toDate: "2026-04-14", days: 5, reason: "Vacation",        status: "Approved" },
    { _id: "lv006", employee: "Santhosh",    leaveType: "Casual Leave", fromDate: "2026-03-15", toDate: "2026-03-15", days: 1, reason: "Personal",        status: "Rejected" },
    { _id: "lv007", employee: "Big Kundi",   leaveType: "Annual Leave", fromDate: "2026-05-05", toDate: "2026-05-07", days: 3, reason: "Travel",          status: "Approved" },
    { _id: "lv008", employee: "Suganthan",   leaveType: "Sick Leave",   fromDate: "2026-02-18", toDate: "2026-02-19", days: 2, reason: "Cold & flu",      status: "Approved" },
    { _id: "lv009", employee: "Sabari",      leaveType: "Casual Leave", fromDate: "2026-06-05", toDate: "2026-06-05", days: 1, reason: "Personal work",   status: "Pending"  },
  ];

  // ── DATA ──────────────────────────────────────────────────────────────────
  const [employees, setEmployees]                 = useState(MOCK_EMPLOYEES);
  const [leaveRequests, setLeaveRequests]         = useState(MOCK_LEAVES);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm]               = useState("");
  const [sortOrder, setSortOrder]                 = useState("asc");
  const [statusFilter, setStatusFilter]           = useState("All");
  const [departments, setDepartments]             = useState(["IT", "HR", "Management"]);
  const [departmentName, setDepartmentName]       = useState("");
  const [leaveType, setLeaveType]                 = useState("");
  const [leaveFrom, setLeaveFrom]                 = useState("");
  const [leaveTo, setLeaveTo]                     = useState("");
  const [leaveReason, setLeaveReason]             = useState("");

  const [holidays] = useState([
    { name: "New Year",     date: "2026-01-01" },
    { name: "Pongal",       date: "2026-01-14" },
    { name: "Republic Day", date: "2026-01-26" },
  ]);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const hasAccess = (roles) => roles.includes(userRole);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setEmployeeName(""); setDepartment(""); setEmployeeEmail("");
    setEmployeePassword(""); setEmployeePhone(""); setEmployeeRole("");
    setJoiningDate(""); setSalary(""); setReportingManager("");
  };

  const showNotif = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  // ── API ───────────────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      const data = await fetchEmployeesAPI();
      if (data && data.length > 0) setEmployees(data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear(); setIsLoggedIn(false);
        alert("Session Expired. Login Again.");
      }
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/leaves");
      if (res.data && res.data.length > 0) setLeaveRequests(res.data);
    } catch (e) { /* keep mock data */ }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/attendance");
      setAttendanceRecords(res.data);
    } catch (e) { /* keep mock data */ }
  };

  useEffect(() => {
    // fetchEmployees(); fetchLeaves(); fetchAttendance();
  }, []);

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const role     = localStorage.getItem("role");
    const employee = JSON.parse(localStorage.getItem("employee") || "null");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || "Admin");
      setLoggedInEmployee(employee);
    }
  }, []);

  // ── EMPLOYEE CRUD ─────────────────────────────────────────────────────────
  const addEmployee = () => {
    if (!employeeName.trim() || !department.trim()) {
      alert("Please fill all required fields");
      return;
    }
    const today = new Date();
    const formattedJoinDate = joiningDate
      ? joiningDate.split("-").reverse().join("/")
      : `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;

    const newEmployee = {
      _id: Date.now().toString(),
      name: employeeName,
      department,
      designation: employeeRole,
      email: employeeEmail,
      phone: employeePhone,
      role: employeeRole,
      joiningDate,
      joinDate: formattedJoinDate,
      salary,
      reportingManager,
      status: "Present",
    };
    setEmployees([...employees, newEmployee]);
    resetForm();
    setShowModal(false);
    setEditingEmployee(null);
    showNotif("Employee added successfully");
  };

  const updateEmployee = () => {
    const updatedEmployees = employees.map((emp) =>
      emp._id === editingEmployee._id
        ? {
            ...emp,
            name: employeeName,
            department,
            designation: employeeRole,
            email: employeeEmail,
            phone: employeePhone,
            role: employeeRole,
            joiningDate,
            joinDate: joiningDate ? joiningDate.split("-").reverse().join("/") : emp.joinDate,
            salary,
          }
        : emp
    );
    setEmployees(updatedEmployees);
    resetForm();
    setShowModal(false);
    setEditingEmployee(null);
    showNotif("Employee updated successfully");
  };

  const deleteEmployee = (id) => {
    if (!window.confirm("Delete this employee?")) return;
    setEmployees(employees.filter((emp) => emp._id !== id));
    showNotif("Employee deleted", "error");
  };

  const editEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeName(emp.name);
    setDepartment(emp.department);
    setEmployeeEmail(emp.email || "");
    setEmployeePhone(emp.phone || "");
    setEmployeeRole(emp.role || "");
    setJoiningDate(emp.joiningDate || "");
    setSalary(emp.salary || "");
    setReportingManager(emp.reportingManager || "");
    setShowModal(true);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "employees.xlsx");
  };

  const addDepartment = () => {
    if (!departmentName.trim()) { alert("Enter department name"); return; }
    setDepartments([...departments, departmentName]);
    setDepartmentName("");
  };

  const deleteDepartment = (index) => {
    const updated = [...departments];
    updated.splice(index, 1);
    setDepartments(updated);
  };

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: "100vh", background: "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", padding: 24,
      }}>
        <div style={{
          background: "#fff", borderRadius: 24,
          boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
          overflow: "hidden", width: "100%", maxWidth: 1000, minHeight: 620,
          display: "grid", gridTemplateColumns: "1.2fr 0.8fr",
        }}>
          {/* LEFT — form */}
          <div style={{ padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Welcome Back</h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>Sign in to access your HRMS dashboard</p>
            </div>

            {/* Role selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["Super Admin","Admin","HR","Manager","Finance","Employee"].map((role) => (
                <button key={role} onClick={() => setUserRole(role)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: userRole === role ? "#2563eb" : "#f1f5f9",
                  color: userRole === role ? "#fff" : "#0f172a",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>{role}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none" }} />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none" }} />
              <button onClick={() => {
                localStorage.setItem("token", "hrms-token");
                localStorage.setItem("role", userRole);
                setIsLoggedIn(true);
              }} style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: 12, padding: "15px", fontSize: 15,
                fontWeight: 700, cursor: "pointer", marginTop: 4,
              }}>Login to HRMS</button>
            </div>
          </div>

          {/* RIGHT — branding */}
          <div style={{
            background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
            color: "#fff", display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "60px 50px",
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>MGate HRMS</div>
            <p style={{ color: "#dbeafe", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
              Human Resource Management System for managing employees,
              attendance, leave requests and payroll from one platform.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, fontWeight: 500 }}>
              {["Employee Management","Attendance Tracking","Leave Management","Payroll Processing","Analytics Dashboard"].map(f => (
                <div key={f}>✓ {f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#f1f5f9", fontFamily: "'Inter', sans-serif",
    }}>

      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => { localStorage.clear(); setIsLoggedIn(false); }}
      />

      {/* MAIN CONTENT */}
      <div style={{
        marginLeft: 220, flex: 1, minHeight: "100vh",
        overflowY: "auto", backgroundColor: "#f1f5f9",
      }}>

        {/* NOTIFICATION */}
        {notification && (
          <div style={{
            position: "fixed", top: 20, right: 24, zIndex: 9999,
            padding: "12px 20px", borderRadius: 10,
            background: notificationType === "success" ? "#16a34a"
              : notificationType === "error" ? "#ef4444" : "#f59e0b",
            color: "#fff", fontSize: 14, fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}>{notification}</div>
        )}

        {/* PAGE CONTENT */}
        <div style={{ padding: "28px 32px" }}>

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <Dashboard
              employees={employees}
              leaves={leaveRequests}
            />
          )}

          {/* EMPLOYEES */}
          {activePage === "employees" && (
            hasAccess(["Super Admin", "Admin", "HR", "Manager", "Finance", "Employee"]) ?(
              <Employees
                employees={employees}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                filteredEmployees={filteredEmployees}
                setSelectedEmployee={setSelectedEmployee}
                editEmployee={editEmployee}
                deleteEmployee={deleteEmployee}
                onAddEmployee={() => { resetForm(); setEditingEmployee(null); setShowModal(true); }}
                onExportExcel={exportToExcel}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 16 }}>
                You don't have permission to view this page.
              </div>
            )
          )}

          {/* ATTENDANCE */}
          {activePage === "attendance" && <Attendance />}

          {/* LEAVE */}
          {activePage === "leave" && (
            <Leave
              leaveRequests={leaveRequests}
              userRole={userRole}
              setShowLeaveModal={setShowLeaveModal}
              fetchLeaves={fetchLeaves}
            />
          )}

          {/* PAYROLL */}
          {activePage === "payroll" && <Payroll />}

          {/* DEPARTMENTS */}
          {activePage === "departments" && hasAccess(["Super Admin","Admin","HR"]) && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Departments</h1>
                  <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Total: {employees.length} employees</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="text" placeholder="Department name" value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 16px", fontSize: 14, outline: "none" }} />
                  <button onClick={addDepartment} style={{
                    background: "#2563eb", color: "#fff", border: "none",
                    borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>Add</button>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      {["Department","Employees","Status","Action"].map(h => (
                        <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontSize: 13, fontWeight: 600, color: "#475569" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 0", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{dept}</td>
                        <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{employees.filter(e => e.department === dept).length}</td>
                        <td style={{ padding: "13px 0" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#16a34a" }}>Active</span>
                        </td>
                        <td style={{ padding: "13px 0" }}>
                          <button onClick={() => deleteDepartment(i)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOLIDAYS */}
          {activePage === "holidays" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Holiday Calendar</h1>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Company and public holidays</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      {["Holiday","Date"].map(h => (
                        <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontSize: 13, fontWeight: 600, color: "#475569" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 0", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{h.name}</td>
                        <td style={{ padding: "13px 0", fontSize: 14, color: "#64748b" }}>{h.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activePage === "profile" && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>My Profile</h1>
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", maxWidth: 480 }}>
                {[
                  ["Name", loggedInEmployee?.name],
                  ["Email", loggedInEmployee?.email],
                  ["Department", loggedInEmployee?.department],
                  ["Role", loggedInEmployee?.role],
                  ["Reporting Manager", loggedInEmployee?.reportingManager || "N/A"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === "analytics" && (
            <Analytics employees={employees} leaves={leaveRequests} />
          )}
          {activePage === "settings" && (
            <Settings />
          )}

        </div>
      </div>

      {/* ── EMPLOYEE MODAL ── */}
      {showModal && (
        <EmployeeModal
          showModal={showModal} setShowModal={setShowModal}
          employeeName={employeeName} setEmployeeName={setEmployeeName}
          department={department} setDepartment={setDepartment}
          employeeEmail={employeeEmail} setEmployeeEmail={setEmployeeEmail}
          employeePassword={employeePassword} setEmployeePassword={setEmployeePassword}
          employeePhone={employeePhone} setEmployeePhone={setEmployeePhone}
          employeeRole={employeeRole} setEmployeeRole={setEmployeeRole}
          joiningDate={joiningDate} setJoiningDate={setJoiningDate}
          salary={salary} setSalary={setSalary}
          reportingManager={reportingManager} setReportingManager={setReportingManager}
          employees={employees}
          editingEmployee={editingEmployee}
          addEmployee={addEmployee}
          updateEmployee={updateEmployee}
        />
      )}

      {/* ── EMPLOYEE PROFILE MODAL ── */}
      {selectedEmployee && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Employee Profile</h2>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Employee ID", `EMP00${selectedEmployee._id?.slice(-3)}`],
                ["Name", selectedEmployee.name],
                ["Department", selectedEmployee.department],
                ["Designation", selectedEmployee.designation || selectedEmployee.role],
                ["Email", selectedEmployee.email],
                ["Phone", selectedEmployee.phone],
                ["Salary", selectedEmployee.salary ? `₹${Number(selectedEmployee.salary).toLocaleString("en-IN")}` : "—"],
                ["Joining Date", selectedEmployee.joinDate || selectedEmployee.joiningDate],
                ["Status", selectedEmployee.status],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{val || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LEAVE APPLY MODAL ── */}
      {showLeaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Apply Leave</h2>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="text" placeholder="Leave Type" value={leaveType} onChange={e => setLeaveType(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none" }} />
              <input type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none" }} />
              <input type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none" }} />
              <textarea placeholder="Reason" value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none", height: 90, resize: "none" }} />
              <button onClick={() => {
                const newLeave = {
                  _id: Date.now().toString(),
                  employee: loggedInEmployee?.name || "Employee",
                  leaveType,
                  fromDate: leaveFrom,
                  toDate: leaveTo,
                  reason: leaveReason,
                  status: "Pending",
                };
                setLeaveRequests([...leaveRequests, newLeave]);
                setShowLeaveModal(false);
                setLeaveType(""); setLeaveFrom(""); setLeaveTo(""); setLeaveReason("");
                showNotif("Leave applied successfully");
              }} style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>Submit Leave Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
