import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_USERS } from "../../constants/mockUsers";
import { ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { COLORS } from "../../theme/colors";
import logo from "../../assets/images/logo.jpeg";
import {
  Box, Stack, Group, Text, Paper, TextInput, PasswordInput,
  Button, SimpleGrid, Divider, ThemeIcon,
} from "@mantine/core";
import {
  IconUsers, IconCalendarOff, IconCurrencyRupee,
  IconBriefcase, IconChartBar, IconBook,
  IconShieldCheck, IconArrowRight, IconAlertCircle,
} from "@tabler/icons-react";

const C = COLORS;

const QUICK_LOGIN_USERS = Object.values(
  MOCK_USERS.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = u;
    return acc;
  }, {})
);

const FEATURES = [
  { Icon: IconUsers,         text: "Employee Management"     },
  { Icon: IconCalendarOff,   text: "Attendance & Leave"       },
  { Icon: IconCurrencyRupee, text: "Payroll Processing"       },
  { Icon: IconBriefcase,     text: "Recruitment & Onboarding" },
  { Icon: IconChartBar,      text: "Analytics & Reports"      },
  { Icon: IconBook,          text: "Learning & Development"   },
];

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const id = "hrms-login-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.innerHTML = `
        @keyframes fadeInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(40px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInUp    { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseOrb    { 0%,100% { transform:scale(1); opacity:.55; } 50% { transform:scale(1.18); opacity:.9; } }
        @keyframes floatY      { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes blinkDot    { 0%,100% { opacity:1; } 50% { opacity:.25; } }
        @keyframes spinSlow    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes shimmer     { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
        @keyframes cardIn      { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin        { to { transform:rotate(360deg); } }
      `;
      document.head.appendChild(s);
    }
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      try { login(email, password); }
      catch (err) { setError(err.message || "Invalid email or password."); }
      finally { setLoading(false); }
    }, 500);
  };

  const anim = (name, delay = 0, dur = 0.55) =>
    mounted ? { animation: `${name} ${dur}s cubic-bezier(.22,.68,0,1.2) ${delay}s both` } : { opacity: 0 };

  return (
    <Box style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif", background: C.backgroundDark, overflow: "hidden" }}>

      {/* LEFT — Brand panel */}
      <Box style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: `linear-gradient(145deg,${C.backgroundDark} 0%,#1e1b4b 55%,#0c1a3a 100%)`,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "52px 64px",
      }}>
        {/* Decorative orbs — animations, no Mantine equivalent */}
        <div style={{ position: "absolute", top: 60, left: 40, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle,${C.purple}70 0%,transparent 70%)`, animation: "pulseOrb 5s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 80, right: 30, width: 270, height: 270, borderRadius: "50%", background: `radial-gradient(circle,${C.info}50 0%,transparent 70%)`, animation: "pulseOrb 6s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "45%", right: "12%", width: 190, height: 190, borderRadius: "50%", background: `radial-gradient(circle,${C.primary}40 0%,transparent 70%)`, animation: "pulseOrb 7s ease-in-out 3s infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 140, right: 80, width: 120, height: 120, borderRadius: "50%", border: `1.5px solid ${C.purple}33`, animation: "floatY 4s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 160, left: 80, width: 80, height: 80, borderRadius: "50%", border: `1.5px solid ${C.info}25`, animation: "floatY 5s ease-in-out 1s infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, opacity: .03, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />

        {/* Logo */}
        <Group gap={14} style={{ zIndex: 1, ...anim("fadeInLeft", 0) }}>
          <Box style={{ width: 48, height: 48, borderRadius: 13, background: `linear-gradient(135deg,${C.purple},${C.primary})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 28px ${C.purple}99` }}>
            <img src={logo} alt="MGate" style={{ width: 28, height: 28, objectFit: "contain", animation: "spinSlow 20s linear infinite" }} />
          </Box>
          <Stack gap={2}>
            <Text fw={800} size="lg" c="white">MGate Systems</Text>
            <Text size="xs" c={C.purple} style={{ letterSpacing: "0.18em", textTransform: "uppercase" }} fw={700}>Enterprise Platform</Text>
          </Stack>
        </Group>

        {/* Hero */}
        <Stack gap={0} style={{ zIndex: 1 }}>
          <Box style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.purple}25`, border: `1px solid ${C.purple}55`, borderRadius: 100, padding: "6px 16px", marginBottom: 24, width: "fit-content", ...anim("fadeInLeft", .1) }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.purple, boxShadow: `0 0 8px ${C.purple}`, animation: "blinkDot 1.8s ease-in-out infinite" }} />
            <Text size="xs" c="#c4b5fd" fw={700} style={{ letterSpacing: "0.07em" }}>ENTERPRISE HRMS v2.0</Text>
          </Box>

          <Box mb={18} style={anim("fadeInLeft", .18)}>
            <Text component="h1" style={{ margin: 0, fontSize: "3rem", fontWeight: 900, lineHeight: 1.1, color: "#fff", letterSpacing: "-1.5px" }}>
              Manage your<br />
              <span style={{ background: `linear-gradient(135deg,#818cf8,${C.info},${C.success})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200%", animation: "shimmer 3s linear infinite" }}>
                entire workforce
              </span>
            </Text>
          </Box>

          <Text size="sm" c={C.textMutedDark} mb={40} style={{ lineHeight: 1.85, maxWidth: 400, ...anim("fadeInLeft", .25) }}>
            One powerful platform for HR, payroll, attendance, recruitment and analytics — built for modern enterprises.
          </Text>

          <Group gap={10} mb={52} style={{ flexWrap: "wrap" }}>
            {FEATURES.map((f, i) => (
              <Box key={f.text} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 100,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                ...anim("fadeInUp", .3 + i * .07),
              }}>
                <f.Icon size={14} stroke={1.8} color={C.textDark} />
                <Text size="xs" fw={500} c={C.textDark}>{f.text}</Text>
              </Box>
            ))}
          </Group>

          <Group gap={44} style={anim("fadeInUp", .72)}>
            {[["10,000+", "Employees"], ["500+", "Companies"], ["99.9%", "Uptime"]].map(([v, l]) => (
              <Stack key={l} gap={2}>
                <Text fw={900} size="xl" c="white">{v}</Text>
                <Text size="xs" c={C.borderDark} fw={500}>{l}</Text>
              </Stack>
            ))}
          </Group>
        </Stack>

        <Text size="xs" c={C.surfaceDark} style={{ zIndex: 1, ...anim("fadeInUp", .8) }}>© 2026 MGate Technologies · Enterprise HRMS Platform</Text>
      </Box>

      {/* RIGHT — Login form */}
      <Box style={{ width: 500, background: C.surfaceLight, display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 52px", overflowY: "auto" }}>

        {/* Heading */}
        <Stack gap={0} mb={32} style={anim("fadeInRight", .05)}>
          <Box style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.primaryMuted, border: `1px solid ${C.primaryLight}`, borderRadius: 100, padding: "5px 14px", marginBottom: 14, width: "fit-content" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, animation: "blinkDot 1.8s ease-in-out infinite" }} />
            <Text size="xs" c={C.primary} fw={700} style={{ letterSpacing: "0.08em" }}>SECURE LOGIN</Text>
          </Box>
          <Text fw={900} style={{ fontSize: "1.9rem", letterSpacing: "-0.5px" }} c={C.textLight}>Welcome back</Text>
          <Text size="sm" c={C.textMutedLight}>Sign in to your HRMS dashboard</Text>
        </Stack>

        {/* Error banner */}
        {error && (
          <Paper withBorder p="sm" mb="md" radius="md" style={{ background: C.dangerMuted, borderColor: "#fca5a5", animation: "cardIn .35s ease both" }}>
            <Group gap="xs">
              <IconAlertCircle size={16} color={C.error} style={{ flexShrink: 0 }} />
              <Text size="sm" c={C.error} fw={500}>{error}</Text>
            </Group>
          </Paper>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack gap={18}>
            <Box style={anim("fadeInRight", .12)}>
              <TextInput
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 600, color: C.textLight, marginBottom: 7 } }}
              />
            </Box>

            <Box style={anim("fadeInRight", .2)}>
              <Group justify="space-between" mb={7}>
                <Text size="sm" fw={600} c={C.textLight}>Password</Text>
                <Text
                  size="xs" c={C.primary} fw={500}
                  style={{ cursor: "pointer" }}
                  component="button"
                  type="button"
                >Forgot password?</Text>
              </Group>
              <PasswordInput
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                size="md"
                radius="md"
              />
            </Box>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="md"
              radius="md"
              rightSection={<IconArrowRight size={16} stroke={2.5} />}
              style={{
                marginTop: 4,
                background: `linear-gradient(135deg,${C.primary} 0%,${C.primaryHover} 100%)`,
                boxShadow: `0 4px 18px ${C.primary}66`,
                ...anim("fadeInUp", .28),
              }}
            >
              Sign In to HRMS
            </Button>
          </Stack>
        </form>

        {/* Quick Login */}
        <Box mt={36} style={anim("fadeInUp", .38)}>
          <Divider
            label={<Text size="xs" fw={700} c={C.secondary} style={{ letterSpacing: ".1em", textTransform: "uppercase" }}>Quick Login</Text>}
            labelPosition="center"
            mb="md"
          />
          <SimpleGrid cols={2} spacing={8}>
            {QUICK_LOGIN_USERS.map((u, i) => {
              const rc = ROLE_COLORS[u.role] || { bg: C.backgroundLight, text: C.secondary };
              const rl = ROLE_LABELS[u.role] || u.role;
              const selected = email === u.email;
              return (
                <Paper
                  key={u.email}
                  component="button"
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); setError(""); }}
                  withBorder
                  radius="md"
                  p="xs"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: selected ? rc.text + "12" : C.backgroundLight,
                    borderColor: selected ? rc.text : C.borderLight,
                    cursor: "pointer", textAlign: "left",
                    animation: `cardIn .4s cubic-bezier(.22,.68,0,1.2) ${.42 + i * .06}s both`,
                  }}
                >
                  <ThemeIcon
                    size={34}
                    radius="md"
                    style={{ background: rc.bg, flexShrink: 0 }}
                  >
                    <Text size="xs" fw={800} c={rc.text}>{u.avatar}</Text>
                  </ThemeIcon>
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" fw={700} c={C.textLight} style={{ lineHeight: 1.3 }}>{rl}</Text>
                    <Text size="xs" c={C.secondary} style={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email.split("@")[0]} · {u.password}
                    </Text>
                  </Box>
                  {selected && <IconShieldCheck size={14} color={rc.text} style={{ flexShrink: 0 }} />}
                </Paper>
              );
            })}
          </SimpleGrid>
        </Box>

        <Text size="xs" c={C.borderLight} ta="center" mt={28} style={anim("fadeInUp", .72)}>
          © 2026 MGate Technologies · Enterprise HRMS Platform
        </Text>
      </Box>
    </Box>
  );
}
