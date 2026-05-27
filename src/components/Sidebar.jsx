const Sidebar = ({

  activePage,

  setActivePage,

  userRole,

  logo,

}) => {

  return (

    <div className="w-56 min-h-screen bg-white shadow-xl p-6">

      {/* LOGO */}
      <div className="items-center mb-10">

        <img
          src={logo}
          alt="logo"
          className="w-24 h-24 object-contain"
        />

      </div>

      {/* MENU */}
      <ul className="space-y-3 mt-10">

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

        <li
          onClick={() =>
            setActivePage("profile")
          }
          className={`px-6 py-3 rounded-xl cursor-pointer transition ${
            activePage === "profile"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          My Profile
        </li>
        <li
  onClick={() =>
    setActivePage("leave")
  }
  className={`cursor-pointer px-6 py-4 rounded-2xl transition-all ${
    activePage === "leave"
      ? "bg-blue-600 text-white"
      : "text-black hover:bg-gray-200"
  }`}
>
  Leave
</li>

      </ul>

    </div>

  );

};

export default Sidebar;