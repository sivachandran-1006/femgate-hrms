import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_USERS } from "../../constants/mockUsers";
import { ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { SPACING, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOWS } from "../../theme/sizes";
import logo from "../../assets/images/logo.png";

const FEATURES = [
  "Employee Management",
  "Attendance & Leave",
  "Payroll Processing",
  "Recruitment & Onboarding",
  "Analytics & Reports",
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (mockUser) => {
    setEmail(mockUser.email);
    setPassword(mockUser.password);
    setError("");
  };

  const inputBase = {
    width: "100%",
    boxSizing: "border-box",
    padding: PADDING.input,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.main,
    border: "1.5px solid " + COLORS.borderLight,
    borderRadius: RADIUS.md,
    background: COLORS.gray50,
    color: COLORS.textLight,
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING[6],
        background: COLORS.backgroundLight,
        fontFamily: FONT_FAMILY.main,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1040,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: RADIUS.xl,
          overflow: "hidden",
          boxShadow: SHADOWS.card,
          background: COLORS.surfaceLight,
        }}
      >
        {/* ── LEFT PANEL: Branding ── */}
        <div
          style={{
            background:
              "linear-gradient(145deg, " +
              COLORS.primary +
              " 0%, " +
              COLORS.primaryHover +
              " 100%)",
            color: COLORS.white,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: PADDING.modal + "px " + SPACING[10] + "px",
          }}
        >
          {/* Logo + App Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[3],
              marginBottom: SPACING[8],
            }}
          >
            <img
              src={logo}
              alt="MGate"
              style={{
                width: 52,
                height: 52,
                borderRadius: RADIUS.lg,
                background: COLORS.white,
                padding: SPACING[1],
                objectFit: "contain",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: FONT_SIZE.xl,
                  fontWeight: FONT_WEIGHT.bold,
                  color: COLORS.white,
                  lineHeight: 1.2,
                }}
              >
                MGate HRMS
              </div>
              <div
                style={{
                  fontSize: FONT_SIZE.xs,
                  color: COLORS.primaryLight,
                  fontWeight: FONT_WEIGHT.semibold,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Technologies
              </div>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: FONT_SIZE["2xl"],
              fontWeight: FONT_WEIGHT.bold,
              color: COLORS.white,
              lineHeight: 1.3,
              marginBottom: SPACING[4],
            }}
          >
            Enterprise HR
            <br />
            Made Simple
          </div>

          <p
            style={{
              fontSize: FONT_SIZE.sm,
              color: COLORS.primaryLight,
              lineHeight: 1.85,
              marginBottom: SPACING[8],
              opacity: 0.92,
            }}
          >
            Manage employees, attendance, leave, payroll and more from one
            powerful platform built for modern organizations.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: SPACING[3] }}>
            {FEATURES.map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[3],
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: COLORS.white,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: RADIUS.full,
                    background: COLORS.success,
                    flexShrink: 0,
                    fontSize: FONT_SIZE.xs,
                    color: COLORS.white,
                    fontWeight: FONT_WEIGHT.bold,
                  }}
                >
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: Login Form ── */}
        <div
          style={{
            background: COLORS.surfaceLight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: PADDING.modal + "px " + SPACING[10] + "px",
            overflowY: "auto",
            maxHeight: "95vh",
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: SPACING[6] }}>
            <h1
              style={{
                fontSize: FONT_SIZE["2xl"],
                fontWeight: FONT_WEIGHT.bold,
                color: COLORS.textLight,
                margin: 0,
                marginBottom: SPACING[1],
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: FONT_SIZE.sm,
                color: COLORS.textMutedLight,
                margin: 0,
              }}
            >
              Sign in to access your MGate HRMS dashboard
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: COLORS.dangerMuted,
                border: "1px solid " + COLORS.dangerLight,
                borderRadius: RADIUS.md,
                padding: SPACING[3] + "px " + SPACING[4] + "px",
                marginBottom: SPACING[4],
                fontSize: FONT_SIZE.sm,
                color: COLORS.danger,
                fontWeight: FONT_WEIGHT.medium,
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: SPACING[4] }}
          >
            {/* Email field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: COLORS.textLight,
                  marginBottom: SPACING[1],
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.borderLight)}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: COLORS.textLight,
                  marginBottom: SPACING[1],
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.borderLight)}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: PADDING.btn,
                fontSize: FONT_SIZE.md,
                fontFamily: FONT_FAMILY.main,
                fontWeight: FONT_WEIGHT.semibold,
                color: COLORS.white,
                background: loading ? COLORS.gray400 : COLORS.primary,
                border: "none",
                borderRadius: RADIUS.md,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
                marginTop: SPACING[2],
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = COLORS.primaryHover;
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = COLORS.primary;
              }}
            >
              {loading ? "Signing in..." : "Login to HRMS"}
            </button>
          </form>

          {/* ── Test Accounts Panel ── */}
          <div
            style={{
              marginTop: SPACING[6],
              borderTop: "1px solid " + COLORS.borderLight,
              paddingTop: SPACING[5],
            }}
          >
            <div
              style={{
                fontSize: FONT_SIZE.xs,
                fontWeight: FONT_WEIGHT.semibold,
                color: COLORS.textMutedLight,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: SPACING[3],
              }}
            >
              Dev — Test Accounts (click to fill)
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: SPACING[2],
              }}
            >
              {MOCK_USERS.map((mockUser) => {
                const roleColor = ROLE_COLORS[mockUser.role] || {
                  bg: COLORS.gray100,
                  text: COLORS.secondary,
                };
                const roleLabel = ROLE_LABELS[mockUser.role] || mockUser.role;
                return (
                  <button
                    key={mockUser.email}
                    type="button"
                    onClick={() => fillCredentials(mockUser)}
                    title={mockUser.email + " / " + mockUser.password}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 2,
                      padding: SPACING[2] + "px " + SPACING[3] + "px",
                      background: roleColor.bg,
                      border: "1.5px solid " + roleColor.text + "33",
                      borderRadius: RADIUS.md,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      minWidth: 110,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = roleColor.text;
                      e.currentTarget.style.boxShadow = SHADOWS.sm;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = roleColor.text + "33";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span
                      style={{
                        fontSize: FONT_SIZE.xs,
                        fontWeight: FONT_WEIGHT.semibold,
                        color: roleColor.text,
                      }}
                    >
                      {roleLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: COLORS.textMutedLight,
                        fontFamily: "monospace",
                        lineHeight: 1.4,
                      }}
                    >
                      {mockUser.email.split("@")[0]}
                      <br />
                      pw: {mockUser.password}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
