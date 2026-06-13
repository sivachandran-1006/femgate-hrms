import { useState } from "react";
import { Search, Plus, Pencil, Key, UserX, UserCheck, Trash2, User, Activity, ShieldCheck } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";
import { Badge, StatCard, PageHeader, TabBar, ModalShell, Toast, TableHead, Td, mkInputStyle, mkBtnPrimary, mkBtnGhost, mkCard } from "../../components/ui/AdminUI";

const ROLE_COLORS = {
  SUPER_ADMIN: { bg: "#fef3c7", text: "#d97706" },
  ADMIN:       { bg: "#dbeafe", text: "#2563eb" },
  HR:          { bg: "#f3e8ff", text: "#7c3aed" },
  MANAGER:     { bg: "#dcfce7", text: "#16a34a" },
  FINANCE:     { bg: "#fce7f3", text: "#be185d" },
  IT_ADMIN:    { bg: "#e0f2fe", text: "#0284c7" },
  EMPLOYEE:    { bg: "#f1f5f9", text: "#475569" },
};
const STATUS_COLORS = {
  Active:    { bg: "#dcfce7", text: "#16a34a" },
  Suspended: { bg: "#fee2e2", text: "#dc2626" },
  Pending:   { bg: "#fef3c7", text: "#d97706" },
};

const ROLES   = ["All","SUPER_ADMIN","ADMIN","HR","MANAGER","FINANCE","IT_ADMIN","EMPLOYEE"];
const STATUSES = ["All","Active","Suspended","Pending"];

const INIT_USERS = [
  { id:1,  name:"Super Admin",   email:"superadmin@mgatesystems.com", role:"SUPER_ADMIN", status:"Active",    lastLogin:"Just now", dept:"Management", phone:"+91 98765 00001", joined:"2020-01-01" },
  { id:2,  name:"Admin User",    email:"admin@mgatesystems.com",      role:"ADMIN",       status:"Active",    lastLogin:"2h ago",   dept:"IT",          phone:"+91 98765 00002", joined:"2020-03-15" },
  { id:3,  name:"HR Manager",    email:"hr@mgatesystems.com",         role:"HR",          status:"Active",    lastLogin:"1h ago",   dept:"HR",          phone:"+91 98765 00003", joined:"2021-06-01" },
  { id:4,  name:"Team Manager",  email:"manager@mgatesystems.com",    role:"MANAGER",     status:"Active",    lastLogin:"3h ago",   dept:"Engineering", phone:"+91 98765 00004", joined:"2021-09-10" },
  { id:5,  name:"Finance Admin", email:"finance@mgatesystems.com",    role:"FINANCE",     status:"Active",    lastLogin:"5h ago",   dept:"Finance",     phone:"+91 98765 00005", joined:"2021-12-01" },
  { id:6,  name:"IT Admin",      email:"itadmin@mgatesystems.com",    role:"IT_ADMIN",    status:"Active",    lastLogin:"30m ago",  dept:"IT",          phone:"+91 98765 00006", joined:"2022-02-14" },
  { id:7,  name:"John Employee", email:"employee@mgatesystems.com",   role:"EMPLOYEE",    status:"Active",    lastLogin:"1d ago",   dept:"Engineering", phone:"+91 98765 00007", joined:"2022-07-01" },
  { id:8,  name:"Priya Sharma",  email:"priya@mgatesystems.com",      role:"EMPLOYEE",    status:"Active",    lastLogin:"2d ago",   dept:"Design",      phone:"+91 98765 00008", joined:"2022-08-15" },
  { id:9,  name:"Arjun Kumar",   email:"arjun@mgatesystems.com",      role:"EMPLOYEE",    status:"Pending",   lastLogin:"Never",    dept:"Engineering", phone:"+91 98765 00009", joined:"2026-05-01" },
  { id:10, name:"Safeer Ahmed",  email:"safeer@mgatesystems.com",     role:"EMPLOYEE",    status:"Active",    lastLogin:"4h ago",   dept:"Sales",       phone:"+91 98765 00010", joined:"2023-03-01" },
  { id:11, name:"Mani Raj",      email:"mani@mgatesystems.com",       role:"EMPLOYEE",    status:"Suspended", lastLogin:"10d ago",  dept:"Marketing",   phone:"+91 98765 00011", joined:"2023-01-20" },
  { id:12, name:"Kavitha R",     email:"kavitha@mgatesystems.com",    role:"HR",          status:"Active",    lastLogin:"6h ago",   dept:"HR",          phone:"+91 98765 00012", joined:"2023-11-01" },
];

const USER_ACTIVITY = {
  1: [{ time:"Just now","action":"Logged in"}, {time:"1h ago","action":"Updated role permissions"}, {time:"Yesterday","action":"Added new user"}],
  2: [{ time:"2h ago","action":"Logged in"}, {time:"4h ago","action":"Approved payroll"}, {time:"Yesterday","action":"Edited employee record"}],
};

const TABS = [
  { id: "users",    label: "Users",          icon: User        },
  { id: "activity", label: "User Activity",  icon: Activity    },
  { id: "roles",    label: "Assign Roles",   icon: ShieldCheck },
];

export default function UserManagement({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const inp = mkInputStyle(surface);

  const [users, setUsers]             = useState(INIT_USERS);
  const [tab, setTab]                 = useState("users");
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd]         = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastState, setToastState]   = useState(null);
  const [newUser, setNewUser]         = useState({ name:"", email:"", role:"EMPLOYEE", password:"", confirmPassword:"" });

  const toast = (msg, type) => { setToastState({ msg, type }); setTimeout(() => setToastState(null), 3000); };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === "All" || u.role === roleFilter)
      && (statusFilter === "All" || u.status === statusFilter);
  });

  const handleAdd = () => {
    if (!newUser.name || !newUser.email || !newUser.password) { toast("Fill all required fields","error"); return; }
    if (newUser.password !== newUser.confirmPassword) { toast("Passwords do not match","error"); return; }
    setUsers(p => [...p, { id: p.length+1, ...newUser, status:"Active", lastLogin:"Never", dept:"", phone:"", joined: new Date().toISOString().slice(0,10) }]);
    setShowAdd(false);
    setNewUser({ name:"", email:"", role:"EMPLOYEE", password:"", confirmPassword:"" });
    toast(`User "${newUser.name}" created`);
  };

  const toggleStatus = id => setUsers(p => p.map(u => {
    if (u.id !== id) return u;
    const next = u.status === "Active" ? "Suspended" : "Active";
    toast(`User ${next === "Suspended" ? "suspended" : "activated"}`);
    return { ...u, status: next };
  }));

  const handleDelete = () => {
    setUsers(p => p.filter(u => u.id !== deleteTarget.id));
    toast(`"${deleteTarget.name}" deleted`, "error");
    setDeleteTarget(null);
  };

  const updateRole = (id, role) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
    toast("Role updated");
  };

  const stats = [
    { label:"Total Users",  value: users.length,                              sub:"registered accounts" },
    { label:"Active",       value: users.filter(u=>u.status==="Active").length, sub:"currently active"  },
    { label:"Admins",       value: users.filter(u=>["SUPER_ADMIN","ADMIN"].includes(u.role)).length, sub:"with admin access" },
    { label:"Suspended",    value: users.filter(u=>u.status==="Suspended").length, sub:"accounts suspended"},
  ];

  // ── Users tab ─────────────────────────────────────────────────────────────────
  const UsersTab = () => (
    <>
      <div style={{ ...mkCard(surface), overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${surface.border}`, display:"flex", gap:12, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={15} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:surface.subtext }} />
            <input style={{ ...inp, paddingLeft:32 }} placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select style={{ ...inp, width:"auto", minWidth:140 }} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
            {ROLES.map(r=><option key={r} value={r}>{r==="All"?"All Roles":r.replace("_"," ")}</option>)}
          </select>
          <select style={{ ...inp, width:"auto", minWidth:130 }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            {STATUSES.map(s=><option key={s} value={s}>{s==="All"?"All Status":s}</option>)}
          </select>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <TableHead cols={["User","Email","Role","Status","Last Login","Actions"]} surface={surface} />
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ background: i%2===0?"transparent":(darkMode?"#1e293b20":"#f8fafc") }}>
                  <Td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:RADIUS.full, background:ROLE_COLORS[u.role]?.bg||"#f1f5f9", color:ROLE_COLORS[u.role]?.text||"#475569", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:FONT_WEIGHT.bold, flexShrink:0 }}>
                        {u.name.slice(0,2).toUpperCase()}
                      </div>
                      <button onClick={()=>setProfileUser(u)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.medium, color:COLORS.primary, fontFamily:FONT_FAMILY.base, padding:0 }}>{u.name}</button>
                    </div>
                  </Td>
                  <Td style={{ color:surface.subtext }}>{u.email}</Td>
                  <Td><Badge bg={ROLE_COLORS[u.role]?.bg} text={ROLE_COLORS[u.role]?.text}>{u.role.replace("_"," ")}</Badge></Td>
                  <Td><Badge bg={STATUS_COLORS[u.status]?.bg} text={STATUS_COLORS[u.status]?.text}>{u.status}</Badge></Td>
                  <Td style={{ color:surface.subtext }}>{u.lastLogin}</Td>
                  <Td>
                    <div style={{ display:"flex", gap:6 }}>
                      {[
                        { icon:<Pencil size={13}/>, title:"Edit",  fn:()=>setProfileUser(u), color:surface.subtext },
                        { icon:<Key     size={13}/>, title:"Reset", fn:()=>toast(`Reset email sent to ${u.email}`), color:surface.subtext },
                        { icon: u.status==="Active" ? <UserX size={13}/> : <UserCheck size={13}/>, title: u.status==="Active"?"Suspend":"Activate", fn:()=>toggleStatus(u.id), color: u.status==="Active"?COLORS.warning:COLORS.success },
                        { icon:<Trash2  size={13}/>, title:"Delete",fn:()=>setDeleteTarget(u), color:COLORS.danger },
                      ].map(({icon,title,fn,color})=>(
                        <button key={title} title={title} onClick={fn} style={{ background:"transparent", border:`1px solid ${surface.border}`, borderRadius:RADIUS.md, padding:"5px 7px", cursor:"pointer", color, display:"flex", alignItems:"center" }}>{icon}</button>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div style={{ padding:40, textAlign:"center", color:surface.subtext, fontSize:FONT_SIZE.sm }}>No users found.</div>}
        </div>
      </div>
    </>
  );

  // ── Activity tab ──────────────────────────────────────────────────────────────
  const ActivityTab = () => (
    <div style={{ ...mkCard(surface), overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <TableHead cols={["User","Recent Activity","Status"]} surface={surface} />
        <tbody>
          {users.map((u,i)=>{
            const acts = USER_ACTIVITY[u.id] || [{ time: u.lastLogin, action:"Last session" }];
            return (
              <tr key={u.id} style={{ background: i%2===0?"transparent":(darkMode?"#1e293b20":"#f8fafc") }}>
                <Td>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:RADIUS.full, background:ROLE_COLORS[u.role]?.bg, color:ROLE_COLORS[u.role]?.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:FONT_WEIGHT.bold }}>
                      {u.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.text }}>{u.name}</p>
                      <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:surface.subtext }}>{u.role.replace("_"," ")}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {acts.map((a,j)=>(
                      <p key={j} style={{ margin:0, fontSize:FONT_SIZE.xs, color:surface.subtext }}>
                        <span style={{ color:surface.text, fontWeight:FONT_WEIGHT.medium }}>{a.action}</span> · {a.time}
                      </p>
                    ))}
                  </div>
                </Td>
                <Td><Badge bg={STATUS_COLORS[u.status]?.bg} text={STATUS_COLORS[u.status]?.text}>{u.status}</Badge></Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Assign Roles tab ──────────────────────────────────────────────────────────
  const RolesTab = () => (
    <div style={{ ...mkCard(surface), overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <TableHead cols={["User","Email","Current Role","Assign Role"]} surface={surface} />
        <tbody>
          {users.map((u,i)=>(
            <tr key={u.id} style={{ background: i%2===0?"transparent":(darkMode?"#1e293b20":"#f8fafc") }}>
              <Td>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:RADIUS.full, background:ROLE_COLORS[u.role]?.bg, color:ROLE_COLORS[u.role]?.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:FONT_WEIGHT.bold }}>
                    {u.name.slice(0,2).toUpperCase()}
                  </div>
                  <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.text }}>{u.name}</span>
                </div>
              </Td>
              <Td style={{ color:surface.subtext }}>{u.email}</Td>
              <Td><Badge bg={ROLE_COLORS[u.role]?.bg} text={ROLE_COLORS[u.role]?.text}>{u.role.replace("_"," ")}</Badge></Td>
              <Td>
                <select value={u.role} onChange={e=>updateRole(u.id,e.target.value)} style={{ ...inp, width:"auto", minWidth:160, padding:"6px 10px", cursor:"pointer" }}>
                  {ROLES.filter(r=>r!=="All").map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
                </select>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding:24, fontFamily:FONT_FAMILY.base, background:surface.pageBg, minHeight:"100vh", position:"relative" }}>
      {toastState && <Toast msg={toastState.msg} type={toastState.type} />}

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <PageHeader icon={User} title="User Management" sub="Manage system users, roles and access" surface={surface} />
        <button style={{ ...mkBtnPrimary(), marginTop:4 }} onClick={()=>setShowAdd(true)}><Plus size={14}/> Add User</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {stats.map(s=><StatCard key={s.label} {...s} surface={surface} />)}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} surface={surface} />

      {tab==="users"    && <UsersTab />}
      {tab==="activity" && <ActivityTab />}
      {tab==="roles"    && <RolesTab />}

      {/* Add User Modal */}
      {showAdd && (
        <ModalShell title="Add New User" onClose={()=>setShowAdd(false)} surface={surface}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[{l:"Full Name *",k:"name",t:"text"},{l:"Email *",k:"email",t:"email"},{l:"Password *",k:"password",t:"password"},{l:"Confirm Password *",k:"confirmPassword",t:"password"}].map(f=>(
              <div key={f.k}>
                <label style={{ display:"block", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext, marginBottom:5 }}>{f.l}</label>
                <input type={f.t} value={newUser[f.k]} onChange={e=>setNewUser(p=>({...p,[f.k]:e.target.value}))} style={inp} />
              </div>
            ))}
            <div>
              <label style={{ display:"block", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext, marginBottom:5 }}>Role *</label>
              <select value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))} style={inp}>
                {ROLES.filter(r=>r!=="All").map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
              <button onClick={()=>setShowAdd(false)} style={mkBtnGhost(surface)}>Cancel</button>
              <button onClick={handleAdd} style={mkBtnPrimary()}><Plus size={13}/> Create User</button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Profile / Edit Modal */}
      {profileUser && (
        <ModalShell title={`User Profile — ${profileUser.name}`} onClose={()=>setProfileUser(null)} surface={surface} maxWidth={520}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:`1px solid ${surface.border}` }}>
              <div style={{ width:56, height:56, borderRadius:RADIUS.full, background:ROLE_COLORS[profileUser.role]?.bg, color:ROLE_COLORS[profileUser.role]?.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:FONT_WEIGHT.bold }}>
                {profileUser.name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p style={{ margin:0, fontSize:FONT_SIZE.base, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>{profileUser.name}</p>
                <p style={{ margin:0, fontSize:FONT_SIZE.sm, color:surface.subtext }}>{profileUser.email}</p>
                <div style={{ display:"flex", gap:6, marginTop:4 }}>
                  <Badge bg={ROLE_COLORS[profileUser.role]?.bg} text={ROLE_COLORS[profileUser.role]?.text}>{profileUser.role.replace("_"," ")}</Badge>
                  <Badge bg={STATUS_COLORS[profileUser.status]?.bg} text={STATUS_COLORS[profileUser.status]?.text}>{profileUser.status}</Badge>
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { l:"Department", v:profileUser.dept||"—"  },
                { l:"Phone",      v:profileUser.phone||"—" },
                { l:"Joined",     v:profileUser.joined      },
                { l:"Last Login", v:profileUser.lastLogin   },
              ].map(({l,v})=>(
                <div key={l}>
                  <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:surface.subtext, fontWeight:FONT_WEIGHT.medium }}>{l.toUpperCase()}</p>
                  <p style={{ margin:"2px 0 0", fontSize:FONT_SIZE.sm, color:surface.text, fontWeight:FONT_WEIGHT.semibold }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4, borderTop:`1px solid ${surface.border}` }}>
              <button onClick={()=>setProfileUser(null)} style={mkBtnGhost(surface)}>Close</button>
              <button onClick={()=>{ toast(`Reset email sent to ${profileUser.email}`); setProfileUser(null); }} style={mkBtnPrimary()}><Key size={13}/> Reset Password</button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <ModalShell title="Delete User" onClose={()=>setDeleteTarget(null)} surface={surface} maxWidth={400}>
          <p style={{ margin:"0 0 20px", fontSize:FONT_SIZE.sm, color:surface.subtext }}>Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setDeleteTarget(null)} style={mkBtnGhost(surface)}>Cancel</button>
            <button onClick={handleDelete} style={{ ...mkBtnPrimary(), background:COLORS.danger }}>Delete</button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
