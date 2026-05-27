const Header = ({

  userRole,

  hasAccess,

  exportToExcel,

  setEditingEmployee,

  setEmployeeName,

  setDepartment,

  setShowModal,

  setDarkMode,

  darkMode,

  setIsLoggedIn,

}) => {

  return (

    <div className="flex justify-between items-center mb-12">

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

                setEditingEmployee(
                  null
                );

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
            setDarkMode(
              !darkMode
            )
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

  );

};

export default Header;