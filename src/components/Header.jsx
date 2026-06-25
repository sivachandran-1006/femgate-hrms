const Header = ({
  exportToExcel,
  setEditingEmployee,
  setEmployeeName,
  setDepartment,
  setShowModal,
}) => {

  return (

    <div className="flex justify-between items-center mb-10">

      {/* LEFT */}
      <div>

        <h1 className="text-5xl font-bold text-blue-600">
          MGate Systems
        </h1>

        <p className="text-gray-500 mt-1 text-lg">
          Admin Portal
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-sm transition-all"
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-sm transition-all"
        >
          Add Employee
        </button>

      </div>

    </div>

  );

};

export default Header;