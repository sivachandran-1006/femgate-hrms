import { useState } from "react";
import { Search, FileSpreadsheet, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

const Employees = ({
  employees = [],
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  filteredEmployees = [],
  setSelectedEmployee,
  editEmployee,
  deleteEmployee,
  onAddEmployee,
  onExportExcel,
}) => {

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showAddModal, setShowAddModal] = useState(false);

  const sorted = [...filteredEmployees].sort((a, b) =>
    sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const inputStyle = {
  width: "100%",
  height: 52,
  border: "1px solid #dbe4ee",
  borderRadius: 12,
  padding: "0 16px",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
  outline: "none",
};
const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

  return (
   <div
  style={{
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    maxWidth: 1320,
    margin: "0 auto",
  }}
>

      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
            Employees
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Manage and view employee details</p>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={onExportExcel}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#16a34a", color: "#fff",
              border: "none", borderRadius: 10,
              padding: "11px 20px", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 10,
              padding: "11px 20px", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* SEARCH + SORT + FILTER ROW */}
{/* EMPLOYEE STATS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 28,
  }}
>
      <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 16,
      border: "1px solid #e2e8f0",
    }}
  >
    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
      Total Employees
    </p>
    <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>
      {employees.length}
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 16,
      border: "1px solid #e2e8f0",
    }}
  >
    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
      Present Today
    </p>
    <h2 style={{ margin: "8px 0 0", fontSize: 28, color: "#22c55e" }}>
      {employees.filter(e => e.status === "Present").length}
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 16,
      border: "1px solid #e2e8f0",
    }}
  >
    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
      On Leave
    </p>
    <h2 style={{ margin: "8px 0 0", fontSize: 28, color: "#f59e0b" }}>
      {employees.filter(e => e.status === "Leave").length}
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 16,
      border: "1px solid #e2e8f0",
    }}
  >
    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
      New Joiners
    </p>
    <h2 style={{ margin: "8px 0 0", fontSize: 28, color: "#2563eb" }}>
      1
    </h2>
  </div>
</div>


{/* SEARCH + SORT + FILTER */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  }}
>

        {/* SEARCH */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
           style={{
  border: "1px solid #dbe4ee",
  borderRadius: 12,
  padding: "0 18px 0 46px",
  fontSize: 14,
  fontWeight: 500,
  color: "#0f172a",
  width: 260,
  height: 52,
  outline: "none",
  background: "#ffffff",
  boxSizing: "border-box",
}}
          />
        </div>

      {/* SORT BUTTON */}
<button
  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #dbe4ee",
    borderRadius: 12,
    padding: "0 18px",
    minWidth: 120,
    height: 52,
    justifyContent: "space-between",
    fontSize: 14,
    fontWeight: 600,
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
  }}
>
  Sort {sortOrder === "asc" ? "Z-A" : "A-Z"}
  <ChevronsUpDown size={14} color="#64748b" />
</button>

        {/* STATUS FILTER */}
<select
  value={statusFilter}
  onChange={(e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }}
  style={{
    border: "1px solid #dbe4ee",
    borderRadius: 12,
    padding: "0 18px",
    width: 140,
    height: 52,
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    background: "#fff",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
  }}
>
  <option value="All">All</option>
  <option value="Present">Present</option>
  <option value="Leave">Leave</option>
</select>
</div>
     {/* TABLE CARD */}
<div
  style={{
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
    padding: "0 32px 28px",
    width: "100%",
  }}
>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
              {[
  "Employee ID",
  "Employee Name",
  "Department",
  "Designation",
  "Status",
  "Join Date",
  "Action",
].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left", padding: "20px 12px 16px",
                    fontSize: 14, fontWeight: 700, color: "#0f172a",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
                  No employees found.
                </td>
              </tr>
            ) : (
  paginated.map((employee) => (
    <tr
  key={employee._id}
  style={{
    borderBottom: "1px solid #f1f5f9",
  }}
>
  {/* EMPLOYEE ID */}
  <td style={{ padding: "18px 12px" }}>
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#2563eb",
      }}
    >
      EMP{String(
        employees.findIndex((e) => e._id === employee._id) + 1
      ).padStart(3, "0")}
    </span>
  </td>

  {/* EMPLOYEE NAME */}
  <td style={{ padding: "18px 12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#dbeafe",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {employee.name?.charAt(0)}
      </div>

      <div>
        <div
          style={{
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {employee.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          {employee.email}
        </div>
      </div>
    </div>
  </td>

  {/* DEPARTMENT */}
  <td
    style={{
      padding: "18px 12px",
      color: "#334155",
      fontWeight: 500,
    }}
  >
    {employee.department}
  </td>

  {/* DESIGNATION */}
  <td
    style={{
      padding: "18px 12px",
      color: "#334155",
      fontWeight: 500,
    }}
  >
    {employee.designation || "System Engineer"}
  </td>

  {/* STATUS */}
  <td style={{ padding: "18px 12px" }}>
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background:
          employee.status === "Present"
            ? "#dcfce7"
            : "#fef3c7",
        color:
          employee.status === "Present"
            ? "#16a34a"
            : "#d97706",
      }}
    >
      {employee.status}
    </span>
  </td>

  {/* JOIN DATE */}
  <td
    style={{
      padding: "18px 12px",
      color: "#64748b",
      fontSize: 14,
    }}
  >
    {employee.joinDate || "29/05/2026"}
  </td>

  {/* ACTIONS */}
  <td style={{ padding: "18px 12px" }}>
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={() => editEmployee(employee)}
        style={{
          border: "none",
          background: "#f8fafc",
          width: 38,
          height: 38,
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        <Pencil size={15} />
      </button>

      <button
        onClick={() => deleteEmployee(employee._id)}
        style={{
          border: "none",
          background: "#fef2f2",
          width: 38,
          height: 38,
          borderRadius: 10,
          cursor: "pointer",
          color: "#ef4444",
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  </td>
</tr>
  ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20, marginTop: 4,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, sorted.length)} of {sorted.length} entries
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid #e2e8f0", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                color: currentPage === 1 ? "#cbd5e1" : "#334155",
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: "none",
                  background: page === currentPage ? "#2563eb" : "#fff",
                  color: page === currentPage ? "#fff" : "#334155",
                  fontWeight: page === currentPage ? 700 : 500,
                  fontSize: 14, cursor: "pointer",
                  border: page === currentPage ? "none" : "1px solid #e2e8f0",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid #e2e8f0", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                color: currentPage === totalPages ? "#cbd5e1" : "#334155",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    
    {showAddModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 20,
    }}
  >
    <div
      style={{
        background: "#fff",
        width: "1200px",
        maxWidth: "95vw",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(15,23,42,0.18)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "24px 36px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Add new employee
        </h2>

        <button
          onClick={() => setShowAddModal(false)}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            border: "1px solid #dbe4ee",
            background: "#fff",
            cursor: "pointer",
            fontSize: 22,
          }}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div style={{ padding: "36px" }}>

        {/* PERSONAL DETAILS */}
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          Personal Details
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div>
            <label style={labelStyle}>First Name *</label>
            <input placeholder="Enter first name" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Last Name *</label>
            <input placeholder="Enter last name" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input placeholder="work@company.com" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <input placeholder="+91 XXXXX XXXXX" style={inputStyle} />
          </div>
        </div>

        {/* WORK DETAILS */}
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          Work Details
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div>
            <label style={labelStyle}>Department *</label>

            <select style={inputStyle}>
              <option>Select dept</option>
              <option>HR</option>
              <option>IT</option>
              <option>Finance</option>
              <option>Operations</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Designation *</label>
            <input placeholder="Enter role" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Join Date *</label>
            <input type="date" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Salary (₹)</label>
            <input placeholder="0.00" style={inputStyle} />
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <button
            onClick={() => setShowAddModal(false)}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              border: "1px solid #dbe4ee",
              background: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save Employee
          </button>
        </div>

      </div>
    </div>
  </div>
)}
</div>

    
  );
};

export default Employees;
