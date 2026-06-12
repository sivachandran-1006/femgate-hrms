import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_USERS } from "../../constants/mockUsers";
import { ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { COLORS } from "../../theme/colors";
import logo from "../../assets/images/logo.jpeg";
import {
  IconUsers, IconCalendarOff, IconCurrencyRupee,
  IconBriefcase, IconChartBar, IconBook,
  IconMail, IconLock, IconEye, IconEyeOff,
  IconShieldCheck, IconArrowRight, IconAlertCircle,
} from "@tabler/icons-react";

const C = COLORS;

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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
        .login-input { transition: border-color .2s, background .2s, box-shadow .2s; }
        .login-input:focus { border-color:${C.primary} !important; background:#fff !important; box-shadow:0 0 0 3px ${C.primaryLight}99 !important; outline:none !important; }
        .submit-btn { transition: transform .2s, box-shadow .2s, background .2s !important; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px) !important; box-shadow:0 10px 32px ${C.primary}88 !important; background:linear-gradient(135deg,${C.primary},${C.primaryHover}) !important; }
        .submit-btn:active:not(:disabled) { transform:translateY(0) !important; }
        .quick-btn { transition: border-color .15s, background .15s, transform .15s, box-shadow .15s; }
        .quick-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,.09); }
        .eye-btn { transition: opacity .2s, color .2s; }
        .eye-btn:hover { opacity:1 !important; color:${C.primary} !important; }
        .forgot-btn { transition: color .15s; }
        .forgot-btn:hover { color:${C.primaryHover} !important; text-decoration:underline; }
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

  const FEATURES = [
    { Icon: IconUsers,         text: "Employee Management"     },
    { Icon: IconCalendarOff,   text: "Attendance & Leave"       },
    { Icon: IconCurrencyRupee, text: "Payroll Processing"       },
    { Icon: IconBriefcase,     text: "Recruitment & Onboarding" },
    { Icon: IconChartBar,      text: "Analytics & Reports"      },
    { Icon: IconBook,          text: "Learning & Development"   },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Inter','Segoe UI',sans-serif", background:C.backgroundDark, overflow:"hidden" }}>

      {/* LEFT — Brand panel */}
      <div style={{
        flex:1, position:"relative", overflow:"hidden",
        background:`linear-gradient(145deg,${C.backgroundDark} 0%,#1e1b4b 55%,#0c1a3a 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"52px 64px",
      }}>

        {/* Glowing orbs */}
        <div style={{ position:"absolute", top:60, left:40, width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${C.purple}70 0%,transparent 70%)`, animation:"pulseOrb 5s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:80, right:30, width:270, height:270, borderRadius:"50%", background:`radial-gradient(circle,${C.info}50 0%,transparent 70%)`, animation:"pulseOrb 6s ease-in-out 1.5s infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"45%", right:"12%", width:190, height:190, borderRadius:"50%", background:`radial-gradient(circle,${C.primary}40 0%,transparent 70%)`, animation:"pulseOrb 7s ease-in-out 3s infinite", pointerEvents:"none" }} />

        {/* Floating rings */}
        <div style={{ position:"absolute", top:140, right:80, width:120, height:120, borderRadius:"50%", border:`1.5px solid ${C.purple}33`, animation:"floatY 4s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:160, left:80, width:80, height:80, borderRadius:"50%", border:`1.5px solid ${C.info}25`, animation:"floatY 5s ease-in-out 1s infinite", pointerEvents:"none" }} />

        {/* Grid overlay */}
        <div style={{ position:"absolute", inset:0, opacity:.03, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize:"44px 44px" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:14, zIndex:1, ...anim("fadeInLeft", 0) }}>
          <div style={{ width:48, height:48, borderRadius:13, background:`linear-gradient(135deg,${C.purple},${C.primary})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 28px ${C.purple}99` }}>
            <img src={logo} alt="MGate" style={{ width:28, height:28, objectFit:"contain", animation:"spinSlow 20s linear infinite" }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:18, fontWeight:800, color:"#fff" }}>MGate Systems</p>
            <p style={{ margin:0, fontSize:10, color:C.purple, letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:700 }}>Enterprise Platform</p>
          </div>
        </div>

        {/* Hero */}
        <div style={{ zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${C.purple}25`, border:`1px solid ${C.purple}55`, borderRadius:100, padding:"6px 16px", marginBottom:24, ...anim("fadeInLeft", .1) }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.purple, boxShadow:`0 0 8px ${C.purple}`, animation:"blinkDot 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize:11, color:"#c4b5fd", fontWeight:700, letterSpacing:"0.07em" }}>ENTERPRISE HRMS v2.0</span>
          </div>

          <h1 style={{ margin:"0 0 18px", fontSize:"3rem", fontWeight:900, lineHeight:1.1, color:"#fff", letterSpacing:"-1.5px", ...anim("fadeInLeft", .18) }}>
            Manage your<br />
            <span style={{ background:`linear-gradient(135deg,#818cf8,${C.info},${C.success})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200%", animation:"shimmer 3s linear infinite" }}>
              entire workforce
            </span>
          </h1>

          <p style={{ margin:"0 0 40px", fontSize:15, color:C.textMutedDark, lineHeight:1.85, maxWidth:400, ...anim("fadeInLeft", .25) }}>
            One powerful platform for HR, payroll, attendance, recruitment and analytics — built for modern enterprises.
          </p>

          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:52 }}>
            {FEATURES.map((f, i) => (
              <span key={f.text} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:100,
                background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                fontSize:12, fontWeight:500, color:C.textDark,
                ...anim("fadeInUp", .3 + i * .07),
              }}>
                <f.Icon size={14} stroke={1.8} /> {f.text}
              </span>
            ))}
          </div>

          <div style={{ display:"flex", gap:44, ...anim("fadeInUp", .72) }}>
            {[["10,000+","Employees"],["500+","Companies"],["99.9%","Uptime"]].map(([v, l]) => (
              <div key={l}>
                <p style={{ margin:0, fontSize:22, fontWeight:900, color:"#fff" }}>{v}</p>
                <p style={{ margin:0, fontSize:12, color:C.borderDark, fontWeight:500 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ margin:0, fontSize:11, color:C.surfaceDark, zIndex:1, ...anim("fadeInUp", .8) }}>© 2026 MGate Technologies · Enterprise HRMS Platform</p>
      </div>

      {/* RIGHT — Login form */}
      <div style={{
        width:500, background:C.surfaceLight,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"52px 52px", overflowY:"auto",
      }}>

        {/* Heading */}
        <div style={{ marginBottom:32, ...anim("fadeInRight", .05) }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.primaryMuted, border:`1px solid ${C.primaryLight}`, borderRadius:100, padding:"5px 14px", marginBottom:14 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.primary, animation:"blinkDot 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize:11, color:C.primary, fontWeight:700, letterSpacing:"0.08em" }}>SECURE LOGIN</span>
          </div>
          <h2 style={{ margin:"0 0 6px", fontSize:"1.9rem", fontWeight:900, color:C.textLight, letterSpacing:"-0.5px" }}>Welcome back</h2>
          <p style={{ margin:0, fontSize:14, color:C.textMutedLight }}>Sign in to your HRMS dashboard</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:10, background:C.dangerMuted, border:`1px solid #fca5a5`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.error, fontWeight:500, animation:"cardIn .35s ease both" }}>
            <IconAlertCircle size={16} style={{ flexShrink:0 }} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* Email */}
          <div style={{ ...anim("fadeInRight", .12) }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textLight, marginBottom:7 }}>Email Address</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex", color:C.secondary }}><IconMail size={17} stroke={1.8} /></span>
              <input
                className="login-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{ width:"100%", boxSizing:"border-box", height:50, paddingLeft:44, paddingRight:16, fontSize:14, fontFamily:"inherit", border:`1.5px solid ${C.borderLight}`, borderRadius:10, background:C.backgroundLight, color:C.textLight, outline:"none" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ ...anim("fadeInRight", .2) }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.textLight }}>Password</label>
              <button type="button" className="forgot-btn" style={{ fontSize:12, color:C.primary, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500, padding:0 }}>Forgot password?</button>
            </div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex", color:C.secondary }}><IconLock size={17} stroke={1.8} /></span>
              <input
                className="login-input"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ width:"100%", boxSizing:"border-box", height:50, paddingLeft:44, paddingRight:50, fontSize:14, fontFamily:"inherit", border:`1.5px solid ${C.borderLight}`, borderRadius:10, background:C.backgroundLight, color:C.textLight, outline:"none" }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass((v) => !v)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.secondary, opacity:.55, padding:0, display:"flex" }}
              >
                {showPass ? <IconEyeOff size={17} stroke={1.8} /> : <IconEye size={17} stroke={1.8} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="submit-btn"
            type="submit"
            disabled={loading}
            style={{
              width:"100%", height:52, marginTop:4,
              fontSize:15, fontFamily:"inherit", fontWeight:700,
              color:"#fff", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer",
              background:`linear-gradient(135deg,${C.primary} 0%,${C.primaryHover} 100%)`,
              boxShadow:`0 4px 18px ${C.primary}66`,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              opacity: loading ? .8 : 1,
              ...anim("fadeInUp", .28),
            }}
          >
            {loading
              ? <span style={{ width:18, height:18, border:`2.5px solid rgba(255,255,255,.3)`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />
              : <><span>Sign In to HRMS</span><IconArrowRight size={16} stroke={2.5} /></>
            }
          </button>
        </form>

        {/* Quick Login */}
        <div style={{ marginTop:36, ...anim("fadeInUp", .38) }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:C.borderLight }} />
            <span style={{ fontSize:11, fontWeight:700, color:C.secondary, letterSpacing:".1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Quick Login</span>
            <div style={{ flex:1, height:1, background:C.borderLight }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {MOCK_USERS.map((u, i) => {
              const rc = ROLE_COLORS[u.role] || { bg:C.backgroundLight, text:C.secondary };
              const rl = ROLE_LABELS[u.role]  || u.role;
              const selected = email === u.email;
              return (
                <button
                  key={u.email}
                  type="button"
                  className="quick-btn"
                  onClick={() => { setEmail(u.email); setPassword(u.password); setError(""); }}
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"10px 12px", borderRadius:10, cursor:"pointer",
                    background: selected ? rc.text + "12" : C.backgroundLight,
                    border:`1.5px solid ${selected ? rc.text : C.borderLight}`,
                    textAlign:"left",
                    animation:`cardIn .4s cubic-bezier(.22,.68,0,1.2) ${.42 + i * .06}s both`,
                  }}
                >
                  <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:rc.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:11, fontWeight:800, color:rc.text }}>{u.avatar}</span>
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.textLight, lineHeight:1.3 }}>{rl}</p>
                    <p style={{ margin:0, fontSize:10, color:C.secondary, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email.split("@")[0]} · {u.password}</p>
                  </div>
                  {selected && <IconShieldCheck size={14} color={rc.text} style={{ flexShrink:0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        <p style={{ margin:"28px 0 0", textAlign:"center", fontSize:11, color:C.borderLight, ...anim("fadeInUp", .72) }}>
          © 2026 MGate Technologies · Enterprise HRMS Platform
        </p>
      </div>
    </div>
  );
}
