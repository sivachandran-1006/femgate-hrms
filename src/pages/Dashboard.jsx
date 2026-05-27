import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

    const Dashboard = ({

  employees = [],

  leaves = [],

}) => {

  const chartData = [
    {
      name: "Present",
      value: employees.filter(
        (employee) =>
          employee.status ===
          "Present"
      ).length,
    },
    {
      name: "Leave",
      value: employees.filter(
        (employee) =>
          employee.status ===
          "Leave"
      ).length,
    },
  ];

  return (

    <>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">

        {/* TOTAL EMPLOYEES */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl text-gray-500 mb-8">
            Total Employees
          </h2>

          <p className="text-5xl font-bold text-blue-600">
            {employees.length}
          </p>

        </div>

        {/* PRESENT */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl text-gray-500 mb-8">
            Present Employees
          </h2>

          <p className="text-5xl font-bold text-green-600">

            {
              employees.filter(
                (employee) =>
                  employee.status ===
                  "Present"
              ).length
            }

          </p>

        </div>

        {/* ON LEAVE */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl text-gray-500 mb-8">
            Employees On Leave
          </h2>

          <p className="text-5xl font-bold text-yellow-500">

            {
              employees.filter(
                (employee) =>
                  employee.status ===
                  "Leave"
              ).length
            }

          </p>

        </div>

        {/* PENDING */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl text-gray-500 mb-8">
            Pending Leaves
          </h2>

          <p className="text-5xl font-bold text-red-500">

            {
              leaves.filter(
                (leave) =>
                  leave.status ===
                  "Pending"
              ).length
            }

          </p>

        </div>

        {/* TEAM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl text-gray-500 mb-8">
            Team Members
          </h2>

          <p className="text-5xl font-bold text-blue-600">
            {employees.length}
          </p>

        </div>

      </div>

            {/* WELCOME */}
      <div className="bg-white rounded-2xl shadow-lg p-10 mb-8">

        <h1 className="text-5xl font-bold mb-6">
          Welcome to MGate HRMS
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed">

          Manage employees, attendance,
          leave requests, payroll and
          company operations from one
          centralized dashboard.

        </p>

      </div>

      {/* EMPLOYEE ANALYTICS */}
      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-8">
          Employee Analytics
        </h2>

        <div className="h-80">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

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

    </>

  );

};

export default Dashboard;