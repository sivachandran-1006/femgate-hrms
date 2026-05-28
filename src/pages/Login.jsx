import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
} from "lucide-react";

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
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 430,
          background: "#ffffff",
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <Building2 size={28} />
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            HRMS
          </h1>
        </div>

        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: 35 }}>
          <h2
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 10,
            }}
          >
            Welcome back
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: 16,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Manage employees, payroll, attendance
            <br />
            and company operations efficiently
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "#334155",
                letterSpacing: 1,
              }}
            >
              EMAIL ADDRESS
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #dbeafe",
                borderRadius: 12,
                padding: "0 14px",
                height: 56,
                background: "#ffffff",
              }}
            >
              <Mail size={20} color="#64748b" />

              <input
                type="email"
                placeholder="name@company.com"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  marginLeft: 12,
                  fontSize: 15,
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  letterSpacing: 1,
                }}
              >
                PASSWORD
              </label>

              <span
                style={{
                  color: "#2563eb",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot Password?
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #dbeafe",
                borderRadius: 12,
                padding: "0 14px",
                height: 56,
                background: "#ffffff",
              }}
            >
              <Lock size={20} color="#64748b" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  marginLeft: 12,
                  fontSize: 15,
                  background: "transparent",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748b" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </button>
            </div>
          </div>

          {/* OPTIONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                color: "#334155",
              }}
            >
              <input type="checkbox" />
              Remember me
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#dcfce7",
                color: "#15803d",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={14} />
              SECURE
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              height: 56,
              border: "none",
              borderRadius: 12,
              background: "#2563eb",
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 4px 12px rgba(37,99,235,0.25)",
              marginBottom: 28,
            }}
          >
            Login to Dashboard →
          </button>
        </form>

        {/* DIVIDER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e2e8f0",
            }}
          />

          <span
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            OR CONTINUE WITH
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e2e8f0",
            }}
          />
        </div>

        {/* SOCIAL */}
        <div
          style={{
            display: "flex",
            gap: 14,
          }}
        >
          <button
            style={{
              flex: 1,
              height: 50,
              border: "1px solid #dbeafe",
              borderRadius: 12,
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Google
          </button>

          <button
            style={{
              flex: 1,
              height: 50,
              border: "1px solid #dbeafe",
              borderRadius: 12,
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            SSO
          </button>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontSize: 15,
            color: "#64748b",
          }}
        >
          New to HRMS?{" "}
          <span
            style={{
              color: "#2563eb",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;