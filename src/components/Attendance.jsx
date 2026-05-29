import axios from "axios";
import { useEffect, useState } from "react";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("http://localhost:5000/attendance");
      setAttendance(response.data);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const handleCheckIn = async () => {
    try {
      await axios.post("http://localhost:5000/attendance", {
        employee: "Suganthan", department: "IT",
        checkIn: new Date().toLocaleTimeString(),
        checkOut: "", date: new Date().toLocaleDateString(), status: "Present",
      });
      fetchAttendance();
    } catch (error) { console.log(error); }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.put(`http://localhost:5000/attendance-checkout/${id}`, {
        checkOut: new Date().toLocaleTimeString(),
      });
      fetchAttendance();
    } catch (error) { console.log(error); }
  };

  const total      = attendance.length;
  const present    = attendance.filter((a) => a.status === "Present").length;
  const absent     = attendance.filter((a) => a.status === "Absent").length;
  const checkedOut = attendance.filter((a) => a.checkOut).length;
  const filteredAttendance = attendance.filter((item) => {
  const matchesSearch =
    item.employee?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDepartment =
    departmentFilter === "All"
      ? true
      : item.department === departmentFilter;

  return matchesSearch && matchesDepartment;
});

  const cards = [
    { label: "Total Records", value: total,      color: "#2563eb", bg: "#eff6ff",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: "Present",       value: present,    color: "#16a34a", bg: "#f0fdf4",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: "Absent",        value: absent,     color: "#ef4444", bg: "#fff1f2",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg> },
    { label: "Checked Out",   value: checkedOut, color: "#f97316", bg: "#fff7ed",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ];
  const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "--";

  try {
    const start = new Date(`1970-01-01 ${checkIn}`);
    const end = new Date(`1970-01-01 ${checkOut}`);

    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${mins}m`;
  } catch {
    return "--";
  }
};


  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>Attendance</h1>
        <button onClick={handleCheckIn} style={{
          backgroundColor: "#16a34a", color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 18px", fontSize: 14,
          fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Check In
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 14, padding: "18px 16px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 500 }}>{c.label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>This Month</p>
            </div>
          </div>
        ))}
      </div>
      {/* SEARCH + FILTER */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  }}
>
  <input
  type="text"
  placeholder="Search employee..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: 320,
      height: 52,
      border: "1px solid #dbe4ee",
      borderRadius: 12,
      padding: "0 18px",
      fontSize: 14,
      outline: "none",
    }}
  />

  <div style={{ display: "flex", gap: 12 }}>
    
     <select
  value={departmentFilter}
  onChange={(e) => setDepartmentFilter(e.target.value)}
  style={{
    height: 52,
    borderRadius: 12,
    border: "1px solid #dbe4ee",
    padding: "0 16px",
    fontSize: 14,
  }}
>
  <option value="All">All Departments</option>
  <option value="IT">IT</option>
  <option value="HR">HR</option>
  <option value="Finance">Finance</option>

      <option>IT</option>
      <option>HR</option>
      <option>Finance</option>
    </select>

    <select
      style={{
        height: 52,
        borderRadius: 12,
        border: "1px solid #dbe4ee",
        padding: "0 16px",
        fontSize: 14,
      }}
    >
      <option>All Status</option>
      <option>Present</option>
      <option>Absent</option>
      <option>Late</option>
    </select>
  </div>
</div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Attendance Records</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              {["Employee","Department","Check In","Check Out","Working Hours","Status","Action"].map(h => (
                <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontSize: 13, fontWeight: 600, color: "#475569" }}>{h}</th>
              ))}
            </tr>
          </thead>
         <tbody>
  {filteredAttendance.length === 0 ? (
    <tr>
      <td
        colSpan="7"
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#94a3b8",
        }}
      >
        No attendance records found
      </td>
    </tr>
  ) : (
    filteredAttendance.map((item) => (
                      <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 0" }}>
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
      {item.employee?.charAt(0)}
    </div>

    <span style={{ fontWeight: 600 }}>
      {item.employee}
    </span>
  </div>
</td>
                <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{item.department}</td>
                <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{item.checkIn}</td>
                <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{item.checkOut || "—"}</td>
                <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>
  {calculateHours(item.checkIn, item.checkOut)}
</td>
                <td style={{ padding: "13px 0" }}>
                  <span style={{
                    display: "inline-block", padding: "4px 12px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background:
  item.status === "Present"
    ? "#dcfce7"
    : item.status === "Late"
    ? "#fef3c7"
    : item.status === "Leave"
    ? "#dbeafe"
    : "#fee2e2",

color:
  item.status === "Present"
    ? "#15803d"
    : item.status === "Late"
    ? "#d97706"
    : item.status === "Leave"
    ? "#2563eb"
    : "#b91c1c",
                  }}>{item.status}</span>
                </td>
                <td style={{ padding: "13px 0" }}>
                  <button disabled={!!item.checkOut} onClick={() => handleCheckOut(item._id)} style={{
                    background: item.checkOut ? "#94a3b8" : "#ef4444",
                    color: "#fff", border: "none", borderRadius: 6,
                    padding: "6px 12px", fontSize: 12, fontWeight: 600,
                    cursor: item.checkOut ? "not-allowed" : "pointer",
                  }}>Check Out</button>
                </td>
              </tr>
                        ))
          )}
</tbody>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Showing 1 to {total} of {total} entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["‹","1","›"].map((btn,i) => (
              <button key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                border: i===1 ? "none" : "1px solid #e2e8f0",
                background: i===1 ? "#2563eb" : "#fff",
                color: i===1 ? "#fff" : "#64748b",
                fontWeight: i===1 ? 700 : 400,
                fontSize: i===1 ? 14 : 16,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>{btn}</button>
            ))}
          </div>
        </div>
        </table>
      </div>
    </div>


  );

  
};

export default Attendance;
