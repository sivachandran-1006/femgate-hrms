import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Users, Clock, Calendar, Wallet, BarChart3 } from "lucide-react";

const Login = ({ setIsLoggedIn }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    localStorage.setItem("token", "hrms-token");

    setIsLoggedIn(true);
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      display: "flex",
      fontFamily: "'Segoe UI', sans-serif",
    }}
  >
    {/* LEFT PANEL */}
    <div
      style={{
        flex: 1,
        background:
          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
      }}
    >
      <h1
        style={{
          fontSize: 42,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        MGate Systems
      </h1>

      <p
        style={{
          fontSize: 18,
          opacity: 0.9,
          marginBottom: 50,
          maxWidth: 450,
          lineHeight: 1.6,
        }}
      >
        Human Resource Management System for managing
        employees, attendance, leave requests and payroll
        operations from one centralized platform.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={20} />
          Employee Management
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Clock size={20} />
          Attendance Tracking
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Calendar size={20} />
          Leave Management
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Wallet size={20} />
          Payroll Processing
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BarChart3 size={20} />
          Analytics Dashboard
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div
      style={{
        width: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
          Welcome Back
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: 32,
          }}
        >
          Sign in to access your HRMS dashboard
        </p>

        {/* KEEP YOUR EXISTING EMAIL FIELD */}

        {/* KEEP YOUR EXISTING PASSWORD FIELD */}

        {/* KEEP YOUR REMEMBER ME */}

        {/* KEEP YOUR LOGIN BUTTON */}

        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          © 2026 MGate Technologies
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;