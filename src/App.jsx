import { useState, useEffect } from "react";
import axios from "axios";

export default function HRMSApp() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [employees, setEmployees] = useState([]);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const leaves = [
    {
      employee: "Priya",
      type: "Sick Leave",
      days: 2,
      status: "Approved",
    },
    {
      employee: "Arun Kumar",
      type: "Casual Leave",
      days: 1,
      status: "Pending",
    },
  ];

  // FETCH EMPLOYEES
  useEffect(() => {

    fetchEmployees();

  }, []);

  const fetchEmployees = async () => {

    const response =
      await axios.get(
        "http://localhost:5000/employees"
      );

    setEmployees(response.data);

  };

  // LOGIN PAGE
  if (!isLoggedIn) {

    return (

      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">

          <h1 className="text-4xl font-extrabold text-blue-700 text-center mb-8">
            MGate HRMS
          </h1>

          <div className="space-y-5">

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              onClick={() => {

                if (
                  email === "admin@mgatetech.com" &&
                  password === "admin123"
                ) {

                  setIsLoggedIn(true);

                } else {

                  alert("Invalid Email or Password");

                }

              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              Login
            </button>

          </div>

          <p className="text-center text-gray-500 mt-6">
            Demo Login:
            <br />
            admin@mgatetech.com
            <br />
            admin123
          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl rounded-r-3xl p-6">

        <h2 className="text-3xl font-extrabold text-blue-700 mb-10">
          MGate
        </h2>

        <ul className="space-y-4">

          <li className="bg-blue-600 text-white px-4 py-3 rounded-2xl font-semibold">
            Dashboard
          </li>

          <li className="hover:bg-gray-100 px-4 py-3 rounded-2xl">
            Employees
          </li>

          <li className="hover:bg-gray-100 px-4 py-3 rounded-2xl">
            Attendance
          </li>

          <li className="hover:bg-gray-100 px-4 py-3 rounded-2xl">
            Leave
          </li>

          <li className="hover:bg-gray-100 px-4 py-3 rounded-2xl">
            Payroll
          </li>

        </ul>

      </div>

      {/* Main */}
      <div className="flex-1 p-6">

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">

            <div>

              <h1 className="text-5xl font-extrabold text-blue-700">
                MGate HRMS
              </h1>

              <p className="text-gray-500 mt-2">
                Employee Management System
              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setEditingEmployee(null);

                  setEmployeeName("");
                  setDepartment("");

                  setShowModal(true);

                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-lg"
              >
                Add Employee
              </button>

              <button
                onClick={() => setIsLoggedIn(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg"
              >
                Logout
              </button>

            </div>

          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-lg font-semibold text-gray-600">
                Total Employees
              </h2>

              <p className="text-4xl font-bold mt-3">
                {employees.length}
              </p>

            </div>

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-lg font-semibold text-gray-600">
                Present Today
              </h2>

              <p className="text-4xl font-bold mt-3">
                110
              </p>

            </div>

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-lg font-semibold text-gray-600">
                Pending Leaves
              </h2>

              <p className="text-4xl font-bold mt-3">
                5
              </p>

            </div>

          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Employees */}
            <div className="bg-white rounded-2xl shadow p-6">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-bold">
                  Employees
                </h2>

                <input
                  type="text"
                  placeholder="Search employee"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="border rounded-xl px-4 py-2"
                />

              </div>

              <table className="w-full">

                <thead>

                  <tr className="text-left border-b">

                    <th className="pb-3">
                      Name
                    </th>

                    <th className="pb-3">
                      Department
                    </th>

                    <th className="pb-3">
                      Status
                    </th>

                    <th className="pb-3">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {employees
                    .filter((emp) =>
                      emp.name
                        .toLowerCase()
                        .includes(
                          searchTerm.toLowerCase()
                        )
                    )
                    .map((emp) => (

                      <tr
                        key={emp._id}
                        className="border-b"
                      >

                        <td className="py-4">
                          {emp.name}
                        </td>

                        <td>
                          {emp.department}
                        </td>

                        <td>

                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {emp.status}
                          </span>

                        </td>

                        <td className="py-3">

                          <button
                            onClick={async () => {

                              await axios.delete(
                                `http://localhost:5000/employees/${emp._id}`
                              );

                              fetchEmployees();

                            }}
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

            {/* Leave */}
            <div className="bg-white rounded-2xl shadow p-6">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-bold">
                  Leave Requests
                </h2>

                <button className="bg-slate-800 text-white px-4 py-2 rounded-xl">
                  View All
                </button>

              </div>

              <div className="space-y-4">

                {leaves.map((leave, index) => (

                  <div
                    key={index}
                    className="border rounded-2xl p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-semibold text-lg">
                          {leave.employee}
                        </h3>

                        <p className="text-gray-500">
                          {leave.type}
                        </p>

                      </div>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {leave.status}
                      </span>

                    </div>

                    <p className="mt-3 text-gray-600">
                      {leave.days} day(s)
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Add Employee
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 text-2xl"
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
                  setEmployeeName(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <button
                onClick={async () => {

                  await axios.post(
                    "http://localhost:5000/employees",
                    {
                      name: employeeName,
                      department: department,
                      status: "Present",
                    }
                  );

                  fetchEmployees();

                  setShowModal(false);

                  setEmployeeName("");
                  setDepartment("");

                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Save Employee
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}