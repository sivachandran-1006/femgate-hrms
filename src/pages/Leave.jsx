const Leave = ({

  leaveRequests,

  userRole,

  setShowLeaveModal,

}) => {

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8">

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
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {leaveRequests.map((leave) => (

            <tr
              key={leave._id}
              className="border-b"
            >

              <td className="py-5">
                {leave.employee}
              </td>

              <td className="py-5">
                {leave.leaveType}
              </td>

              <td className="py-5">

                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">

                  {leave.status}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

};

export default Leave;