import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Clock,
  Calendar,
  Wallet,
  BarChart3,
} from "lucide-react";

import { COLORS } from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP } from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE } from "../../theme/sizes";

const FEATURES = [
  { icon: <Users size={ICON_SIZE.sm} />, label: "Employee Management" },
  { icon: <Clock size={ICON_SIZE.sm} />, label: "Attendance Tracking" },
  { icon: <Calendar size={ICON_SIZE.sm} />, label: "Leave Management" },
  { icon: <Wallet size={ICON_SIZE.sm} />, label: "Payroll Processing" },
  { icon: <BarChart3 size={ICON_SIZE.sm} />, label: "Analytics Dashboard" },
];

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("token", "hrms-token");
    setIsLoggedIn(true);
  };

  const inputStyle = {
    width: "100%",
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: PADDING.input,
    fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    background: COLORS.surfaceLight,
    color: COLORS.textLight,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.backgroundLight,
        display: "flex",
        fontFamily: FONT_FAMILY.base,
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
          color: COLORS.white,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: SPACING[10],
        }}
      >
        <h1
          style={{
            fontSize: FONT_SIZE["4xl"],
            fontWeight: FONT_WEIGHT.bold,
            marginBottom: GAP.xs,
            fontFamily: FONT_FAMILY.base,
          }}
        >
          MGate HRMS
        </h1>

        <p
          style={{
            fontSize: FONT_SIZE.lg,
            opacity: 0.9,
            marginBottom: SPACING[8],
            maxWidth: 450,
            lineHeight: 1.6,
            fontFamily: FONT_FAMILY.base,
          }}
        >
          Human Resource Management System for managing employees, attendance,
          leave requests and payroll operations from one centralized platform.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP.md,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.medium,
          }}
        >
          {FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: GAP.sm }}
            >
              {icon}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: SPACING[6],
        }}
      >
        <div
          style={{
            width: "100%",
            background: COLORS.surfaceLight,
            borderRadius: RADIUS["2xl"],
            padding: SPACING[6],
            boxShadow: SHADOW.card,
          }}
        >
          <h2
            style={{
              fontSize: FONT_SIZE["3xl"],
              fontWeight: FONT_WEIGHT.bold,
              color: COLORS.textLight,
              marginBottom: GAP.xs,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Welcome Back
          </h2>

          <p
            style={{
              color: COLORS.textMutedLight,
              marginBottom: SPACING[5],
              fontSize: FONT_SIZE.md,
              fontFamily: FONT_FAMILY.base,
            }}
          >
            Sign in to access your HRMS dashboard
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: SPACING[4] }}>
              <label
                style={{
                  display: "block",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: COLORS.gray600,
                  marginBottom: GAP.xs,
                  fontFamily: FONT_FAMILY.base,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={ICON_SIZE.sm}
                  color={COLORS.gray400}
                  style={{
                    position: "absolute",
                    left: SPACING[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: SPACING[8] }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: SPACING[5] }}>
              <label
                style={{
                  display: "block",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: COLORS.gray600,
                  marginBottom: GAP.xs,
                  fontFamily: FONT_FAMILY.base,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={ICON_SIZE.sm}
                  color={COLORS.gray400}
                  style={{
                    position: "absolute",
                    left: SPACING[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: SPACING[8], paddingRight: SPACING[8] }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: SPACING[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.gray400,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={ICON_SIZE.sm} /> : <Eye size={ICON_SIZE.sm} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                background: COLORS.primary,
                color: COLORS.white,
                border: "none",
                borderRadius: RADIUS.lg,
                padding: PADDING.btn,
                fontSize: FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.semibold,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </form>

          <div
            style={{
              marginTop: SPACING[5],
              textAlign: "center",
              color: COLORS.textMutedLight,
              fontSize: FONT_SIZE.sm,
              fontFamily: FONT_FAMILY.base,
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
