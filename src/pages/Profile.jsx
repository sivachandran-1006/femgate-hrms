import { useState } from "react";
const Profile = () => {

  const [activeTab, setActiveTab] =
    useState("Personal");

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 20,
          color: "#0f172a",
        }}
      >
        Employee Profile
      </h1>
      <div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  }}
>
  {[
    "Personal",
    "Job",
    "Leave",
    "Attendance",
    "Payroll",
    "Documents",
    "Assets",
  ].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        background:
          activeTab === tab
            ? "#2563eb"
            : "#e2e8f0",
        color:
          activeTab === tab
            ? "#fff"
            : "#334155",
      }}
    >
      {tab}
    </button>
  ))}
</div>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "#dbeafe",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div
  style={{
    marginTop: 20,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.08)",
  }}
>
  {activeTab === "Personal" && (
    <h3>Personal Information</h3>
  )}

  {activeTab === "Job" && (
    <h3>Job Information</h3>
  )}

  {activeTab === "Leave" && (
  <>
    <h3>Leave History</h3>

    <table
      style={{
        width: "100%",
        marginTop: 20,
      }}
    >
      <thead>
        <tr>
          <th>Leave Type</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Annual Leave</td>
          <td>10-Jun-2026</td>
          <td>12-Jun-2026</td>
          <td>Approved</td>
        </tr>

        <tr>
          <td>Sick Leave</td>
          <td>15-May-2026</td>
          <td>16-May-2026</td>
          <td>Approved</td>
        </tr>
      </tbody>
    </table>
  </>
)}

  {activeTab === "Attendance" && (
  <>
    <h3>Attendance History</h3>

    <table
      style={{
        width: "100%",
        marginTop: 20,
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: 10 }}>Date</th>
          <th style={{ textAlign: "left", padding: 10 }}>Check In</th>
          <th style={{ textAlign: "left", padding: 10 }}>Check Out</th>
          <th style={{ textAlign: "left", padding: 10 }}>Hours</th>
          <th style={{ textAlign: "left", padding: 10 }}>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style={{ padding: 10 }}>27-May-2026</td>
          <td style={{ padding: 10 }}>09:00 AM</td>
          <td style={{ padding: 10 }}>06:15 PM</td>
          <td style={{ padding: 10 }}>9h 15m</td>
          <td style={{ padding: 10 }}>Present</td>
        </tr>

        <tr>
          <td style={{ padding: 10 }}>26-May-2026</td>
          <td style={{ padding: 10 }}>09:10 AM</td>
          <td style={{ padding: 10 }}>06:00 PM</td>
          <td style={{ padding: 10 }}>8h 50m</td>
          <td style={{ padding: 10 }}>Present</td>
        </tr>

        <tr>
          <td style={{ padding: 10 }}>25-May-2026</td>
          <td style={{ padding: 10 }}>--</td>
          <td style={{ padding: 10 }}>--</td>
          <td style={{ padding: 10 }}>0h</td>
          <td style={{ padding: 10 }}>Leave</td>
        </tr>
      </tbody>
    </table>
  </>
)}

  {activeTab === "Payroll" && (
  <>
    <h3>Payroll History</h3>

    <table
      style={{
        width: "100%",
        marginTop: 20,
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: 10 }}>Month</th>
          <th style={{ textAlign: "left", padding: 10 }}>Basic Salary</th>
          <th style={{ textAlign: "left", padding: 10 }}>Deductions</th>
          <th style={{ textAlign: "left", padding: 10 }}>Net Salary</th>
          <th style={{ textAlign: "left", padding: 10 }}>Payslip</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style={{ padding: 10 }}>May 2026</td>
          <td style={{ padding: 10 }}>₹50,000</td>
          <td style={{ padding: 10 }}>₹2,000</td>
          <td style={{ padding: 10 }}>₹48,000</td>
          <td style={{ padding: 10 }}>
            <button
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)}

  {activeTab === "Documents" && (
  <>
    <h3>Employee Documents</h3>

    <table
      style={{
        width: "100%",
        marginTop: 20,
      }}
    >
      <tbody>
        <tr>
          <td>Aadhaar Card</td>
          <td>Uploaded</td>
        </tr>

        <tr>
          <td>PAN Card</td>
          <td>Uploaded</td>
        </tr>

        <tr>
          <td>Resume</td>
          <td>Uploaded</td>
        </tr>

        <tr>
          <td>Offer Letter</td>
          <td>Uploaded</td>
        </tr>
      </tbody>
    </table>

    <button
      style={{
        marginTop: 20,
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "10px 16px",
        cursor: "pointer",
      }}
    >
      Upload Document
    </button>
  </>
)}

  {activeTab === "Assets" && (
  <>
    <h3>Assigned Assets</h3>

    <table
      style={{
        width: "100%",
        marginTop: 20,
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: 10 }}>Asset</th>
          <th style={{ textAlign: "left", padding: 10 }}>Asset ID</th>
          <th style={{ textAlign: "left", padding: 10 }}>Assigned Date</th>
          <th style={{ textAlign: "left", padding: 10 }}>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style={{ padding: 10 }}>Laptop</td>
          <td style={{ padding: 10 }}>LT-001</td>
          <td style={{ padding: 10 }}>01-Jan-2026</td>
          <td style={{ padding: 10 }}>Assigned</td>
        </tr>

        <tr>
          <td style={{ padding: 10 }}>Monitor</td>
          <td style={{ padding: 10 }}>MN-101</td>
          <td style={{ padding: 10 }}>01-Jan-2026</td>
          <td style={{ padding: 10 }}>Assigned</td>
        </tr>

        <tr>
          <td style={{ padding: 10 }}>Mouse</td>
          <td style={{ padding: 10 }}>MS-201</td>
          <td style={{ padding: 10 }}>01-Jan-2026</td>
          <td style={{ padding: 10 }}>Assigned</td>
        </tr>
      </tbody>
    </table>

    <button
      style={{
        marginTop: 20,
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "10px 16px",
        cursor: "pointer",
      }}
    >
      Assign Asset
    </button>
  </>
)}
</div>



          <div>
            <h2 style={{ margin: 0 }}>Admin User</h2>
            <p style={{ color: "#64748b" }}>
              admin@mgatetech.com
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div>
            <strong>Employee ID</strong>
            <p>EMP001</p>
          </div>

          <div>
            <strong>Department</strong>
            <p>IT</p>
          </div>

          <div>
            <strong>Designation</strong>
            <p>System Engineer</p>
          </div>

          <div>
            <strong>Role</strong>
            <p>Admin</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>9876543210</p>
          </div>

          <div>
            <strong>Join Date</strong>
            <p>01/01/2026</p>
          </div>

          <div>
            <strong>Status</strong>
            <p>Present</p>
          </div>

          <div>
            <strong>Reporting Manager</strong>
            <p>CEO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;