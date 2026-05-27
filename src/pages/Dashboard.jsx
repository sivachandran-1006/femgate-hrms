const Dashboard = ({

  employees,

  leaves,

}) => {

  return (

    <>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-2xl text-gray-500">
            Total Employees
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            {employees.length}
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-2xl text-gray-500">
            Present Employees
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-4">

            {
              employees.filter(
                (employee) =>
                  employee.status ===
                  "Present"
              ).length
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-2xl text-gray-500">
            Employees On Leave
          </h2>

          <p className="text-4xl font-bold text-yellow-500 mt-4">

            {
              employees.filter(
                (employee) =>
                  employee.status ===
                  "Leave"
              ).length
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-2xl text-gray-500">
            Pending Leaves
          </h2>

          <p className="text-4xl font-bold text-red-500 mt-4">

            {
              leaves.filter(
                (leave) =>
                  leave.status ===
                  "Pending"
              ).length
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-2xl text-gray-500">
            Team Members
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            {employees.length}
          </p>

        </div>

      </div>

      {/* WELCOME */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

        <h2 className="text-5xl font-bold mb-4">
          Welcome to MGate HRMS
        </h2>

        <p className="text-lg text-gray-500 leading-relaxed">

          Manage employees,
          attendance, leave requests,
          payroll and company
          operations from one
          centralized dashboard.

        </p>

      </div>

    </>

  );

};

export default Dashboard;