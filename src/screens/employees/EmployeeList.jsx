import { useState, useMemo } from "react";
import {
  IconSearch, IconFileSpreadsheet, IconPlus,
  IconPencil, IconTrash, IconUsers, IconUserCheck,
  IconUserMinus, IconUserPlus, IconBriefcase,
  IconChevronUp, IconChevronDown,
} from "@tabler/icons-react";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { AppButton }            from "../../components/ui/AppButton";
import { AppLoader }            from "../../components/ui/AppLoader";

import { COLORS }                            from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }     from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE, TRANSITION } from "../../theme/sizes";
import { getAvatarColor, getInitials }       from "../../utils/helpers";

const DEPT_COLORS = {
  IT:         { bg: COLORS.primaryMuted,  text: COLORS.primary  },
  Finance:    { bg: COLORS.successLight,  text: COLORS.success  },
  HR:         { bg: COLORS.purpleMuted,   text: COLORS.purple   },
  Management: { bg: COLORS.warningLight,  text: COLORS.warning  },
  Marketing:  { bg: COLORS.infoLight,     text: COLORS.info     },
};

const STATUS_STYLE = {
  Present: { bg: COLORS.successLight, color: COLORS.success, dot: COLORS.success },
  Leave:   { bg: COLORS.warningLight, color: COLORS.warning, dot: COLORS.warning },
  Absent:  { bg: COLORS.dangerMuted,  color: COLORS.danger,  dot: COLORS.danger  },
};

const ROWS_PER_PAGE = 8;

const StatCard = ({ icon: Icon, label, value, color, bg, trend, dark }) => (
  <div style={{
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    borderRadius: RADIUS["2xl"],
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    boxShadow:    SHADOW.card,
    padding:      `${SPACING[5]}px ${SPACING[5]}px`,
    display:      "flex",
    alignItems:   "center",
    gap:          GAP.lg,
    flex:         1,
    minWidth:     180,
  }}>
    <div style={{
      width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg,
      borderRadius: RADIUS.xl, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={ICON_SIZE.lg} color={color} stroke={1.8} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight, fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium }}>{label}</p>
      <p style={{ margin: `${GAP.xs / 2}px 0 0`, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: dark ? COLORS.dark.text : COLORS.textLight, fontFamily: FONT_FAMILY.base, lineHeight: 1 }}>{value}</p>
    </div>
    {trend !== undefined && (
      <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: trend >= 0 ? COLORS.success : COLORS.danger, flexShrink: 0 }}>
        {trend >= 0 ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const EmployeeList = ({ darkMode: dark = false }) => {
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [currentPage, setCurrentPage]   = useState(1);
  const [sortKey, setSortKey]           = useState("name");
  const [sortDir, setSortDir]           = useState("asc");

  const { data: employees = [], isLoading, isError } = useFetchAllEmployees();

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const departments = useMemo(() => ["All", ...new Set(employees.map((e) => e.department).filter(Boolean))], [employees]);

  const filtered = useMemo(() => {
    let list = employees.filter((e) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || (e.name || "").toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q) || (e.designation || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      const matchDept   = deptFilter   === "All" || e.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
    list = [...list].sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (sortKey === "salary") { va = Number(va); vb = Number(vb); return sortDir === "asc" ? va - vb : vb - va; }
      va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [employees, searchTerm, statusFilter, deptFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const totalCount = employees.length;
  const presentCount = employees.filter((e) => e.status === "Present").length;
  const leaveCount   = employees.filter((e) => e.status === "Leave").length;
  const newJoiners   = employees.filter((e) => (e.joiningDate || "").startsWith("2024")).length;
  const deptCount    = new Set(employees.map((e) => e.department)).size;

  // Theme shortcuts
  const cardBg     = dark ? COLORS.dark.cardBg    : COLORS.surfaceLight;
  const border     = dark ? COLORS.dark.border    : COLORS.borderLight;
  const text       = dark ? COLORS.dark.text      : COLORS.textLight;
  const subtext    = dark ? COLORS.dark.subtext   : COLORS.textMutedLight;
  const inputBg    = dark ? COLORS.dark.inputBg   : COLORS.gray50;
  const theadBg    = dark ? COLORS.dark.theadBg   : COLORS.gray50;
  const rowHover   = dark ? COLORS.dark.rowHover  : COLORS.gray50;
  const btnBg      = dark ? COLORS.dark.cardBg    : COLORS.gray50;
  const btnColor   = dark ? COLORS.dark.subtext   : COLORS.gray700;
  const btnBorder  = dark ? COLORS.dark.border    : COLORS.borderLight;

  const SortIcon = ({ col: c }) => {
    if (sortKey !== c) return <IconChevronUp size={12} style={{ opacity: 0.25 }} />;
    return sortDir === "asc" ? <IconChevronUp size={12} style={{ color: COLORS.primary }} /> : <IconChevronDown size={12} style={{ color: COLORS.primary }} />;
  };

  const thStyle = () => ({
    padding:       PADDING.tableHeader,
    textAlign:     "left",
    fontSize:      FONT_SIZE.xs,
    fontWeight:    FONT_WEIGHT.semibold,
    color:         subtext,
    fontFamily:    FONT_FAMILY.base,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    whiteSpace:    "nowrap",
    cursor:        "pointer",
    userSelect:    "none",
    background:    theadBg,
    borderBottom:  `2px solid ${border}`,
  });

  if (isLoading) return <AppLoader fullScreen />;
  if (isError) return <p style={{ color: COLORS.danger, fontFamily: FONT_FAMILY.base }}>Failed to load employees.</p>;

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[6], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: text }}>
            Employees
          </h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: subtext }}>
            {totalCount} team members across {deptCount} departments
          </p>
        </div>
        <div style={{ display: "flex", gap: GAP.sm }}>
          <AppButton variant="default" leftSection={<IconFileSpreadsheet size={16} />} size="sm">
            Export Excel
          </AppButton>
          <AppButton leftSection={<IconPlus size={16} />} size="sm">
            Add Employee
          </AppButton>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: GAP.md, marginBottom: SPACING[6], flexWrap: "wrap" }}>
        <StatCard dark={dark} icon={IconUsers}     label="Total Employees" value={totalCount}   color={COLORS.primary} bg={COLORS.primaryMuted} trend={5}  />
        <StatCard dark={dark} icon={IconUserCheck} label="Present Today"   value={presentCount} color={COLORS.success} bg={COLORS.successLight} trend={2}  />
        <StatCard dark={dark} icon={IconUserMinus} label="On Leave"        value={leaveCount}   color={COLORS.warning} bg={COLORS.warningLight} trend={-1} />
        <StatCard dark={dark} icon={IconUserPlus}  label="New Joiners"     value={newJoiners}   color={COLORS.purple}  bg={COLORS.purpleMuted}  trend={8}  />
        <StatCard dark={dark} icon={IconBriefcase} label="Departments"     value={deptCount}    color={COLORS.info}    bg={COLORS.infoLight}               />
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${border}`, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <IconSearch size={16} color={subtext} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Search by name, email or role…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%", boxSizing: "border-box",
                border: `1px solid ${border}`, borderRadius: RADIUS.lg,
                padding: `${GAP.sm}px ${GAP.md}px ${GAP.sm}px ${SPACING[8]}px`,
                fontSize: FONT_SIZE.base, fontFamily: FONT_FAMILY.base,
                background: inputBg, color: text, outline: "none",
              }}
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            style={{ border: `1px solid ${border}`, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px`, fontSize: FONT_SIZE.base, fontFamily: FONT_FAMILY.base, background: inputBg, color: text, outline: "none", cursor: "pointer" }}
          >
            {departments.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ border: `1px solid ${border}`, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px`, fontSize: FONT_SIZE.base, fontFamily: FONT_FAMILY.base, background: inputBg, color: text, outline: "none", cursor: "pointer" }}
          >
            {["All", "Present", "Leave", "Absent"].map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>

          <span style={{ fontSize: FONT_SIZE.sm, color: subtext, marginLeft: "auto", fontFamily: FONT_FAMILY.base }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr>
                {[
                  { key: "name",        label: "Employee"    },
                  { key: "department",  label: "Department"  },
                  { key: "designation", label: "Designation" },
                  { key: "salary",      label: "Salary"      },
                  { key: "status",      label: "Status"      },
                  { key: "joinDate",    label: "Joined"      },
                  { key: "_actions",    label: "Actions"     },
                ].map(({ key, label }) => (
                  <th key={key} style={thStyle(key)} onClick={key !== "_actions" ? () => handleSort(key) : undefined}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {label}
                      {key !== "_actions" && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: `${SPACING[12]}px`, color: subtext, fontSize: FONT_SIZE.md }}>
                    No employees match your filters
                  </td>
                </tr>
              ) : paginated.map((emp) => {
                const av     = getAvatarColor(emp.name);
                const status = STATUS_STYLE[emp.status] || STATUS_STYLE.Present;
                const dept   = DEPT_COLORS[emp.department] || { bg: COLORS.gray200, text: COLORS.gray700 };
                return (
                  <tr
                    key={emp._id}
                    style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast, background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ width: LAYOUT.avatar, height: LAYOUT.avatar, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: text }}>{emp.name}</p>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext }}>{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-block", padding: `3px ${GAP.sm + 2}px`, borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: dept.bg, color: dept.text }}>
                        {emp.department}
                      </span>
                    </td>

                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: subtext }}>{emp.designation}</td>

                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: text }}>
                      ₹{Number(emp.salary).toLocaleString("en-IN")}
                    </td>

                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: `4px ${GAP.sm + 2}px`, borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: status.bg, color: status.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        {emp.status}
                      </span>
                    </td>

                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: subtext, whiteSpace: "nowrap" }}>{emp.joinDate}</td>

                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", gap: GAP.xs }}>
                        <button
                          style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: `1px solid ${btnBorder}`, background: btnBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: btnColor, transition: TRANSITION.fast }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.primaryMuted; e.currentTarget.style.color = COLORS.primary; e.currentTarget.style.borderColor = COLORS.primary; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = btnColor; e.currentTarget.style.borderColor = btnBorder; }}
                        >
                          <IconPencil size={14} />
                        </button>
                        <button
                          style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: `1px solid ${btnBorder}`, background: btnBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: btnColor, transition: TRANSITION.fast }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.dangerMuted; e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.borderColor = COLORS.danger; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = btnColor; e.currentTarget.style.borderColor = btnBorder; }}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px ${SPACING[5]}px`, borderTop: `1px solid ${border}` }}>
            <span style={{ fontSize: FONT_SIZE.sm, color: subtext, fontFamily: FONT_FAMILY.base }}>
              Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: GAP.xs }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{ padding: `${GAP.xs}px ${GAP.md}px`, borderRadius: RADIUS.md, border: `1px solid ${border}`, background: currentPage === 1 ? inputBg : cardBg, color: currentPage === 1 ? subtext : text, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              >Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: p === currentPage ? "none" : `1px solid ${border}`, background: p === currentPage ? COLORS.primary : cardBg, color: p === currentPage ? COLORS.white : text, fontWeight: p === currentPage ? FONT_WEIGHT.bold : FONT_WEIGHT.normal, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ padding: `${GAP.xs}px ${GAP.md}px`, borderRadius: RADIUS.md, border: `1px solid ${border}`, background: currentPage === totalPages ? inputBg : cardBg, color: currentPage === totalPages ? subtext : text, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
