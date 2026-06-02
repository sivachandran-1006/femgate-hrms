import React, { useState, useRef, useEffect } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, GAP } from "../../theme/spacing";
import { RADIUS, SHADOWS } from "../../theme/sizes";
import { getAvatarColor, getInitials } from "../../utils/helpers";

// ─── Org Data ────────────────────────────────────────────────────────────────

const ORG_DATA = {
  id: "ceo",
  name: "Siva",
  designation: "CEO",
  department: "Management",
  email: "siva@company.com",
  phone: "+91 98765 00001",
  joinDate: "2018-01-15",
  children: [
    {
      id: "hr-dir",
      name: "Big Kundi",
      designation: "HR Director",
      department: "HR",
      email: "bigkundi@company.com",
      phone: "+91 98765 00002",
      joinDate: "2019-03-10",
      children: [
        {
          id: "hr-exec",
          name: "Suriya",
          designation: "HR Executive",
          department: "HR",
          email: "suriya@company.com",
          phone: "+91 98765 00005",
          joinDate: "2021-06-01",
          children: [],
        },
        {
          id: "hr-coord",
          name: "P Santhosh",
          designation: "HR Coordinator",
          department: "HR",
          email: "psanthosh@company.com",
          phone: "+91 98765 00006",
          joinDate: "2022-01-20",
          children: [],
        },
      ],
    },
    {
      id: "eng-mgr",
      name: "Mani",
      designation: "Engineering Manager",
      department: "IT",
      email: "mani@company.com",
      phone: "+91 98765 00003",
      joinDate: "2019-07-22",
      children: [
        {
          id: "fe-dev",
          name: "Aravinth",
          designation: "Frontend Dev",
          department: "IT",
          email: "aravinth@company.com",
          phone: "+91 98765 00007",
          joinDate: "2021-09-15",
          children: [],
        },
        {
          id: "be-dev",
          name: "C Santhosh",
          designation: "Backend Dev",
          department: "IT",
          email: "csanthosh@company.com",
          phone: "+91 98765 00008",
          joinDate: "2021-11-01",
          children: [],
        },
        {
          id: "qa-eng",
          name: "Sabari",
          designation: "QA Engineer",
          department: "IT",
          email: "sabari@company.com",
          phone: "+91 98765 00009",
          joinDate: "2022-04-10",
          children: [],
        },
      ],
    },
    {
      id: "fin-mgr",
      name: "Safeer",
      designation: "Finance Manager",
      department: "Finance",
      email: "safeer@company.com",
      phone: "+91 98765 00004",
      joinDate: "2020-02-14",
      children: [],
    },
  ],
};

// ─── Department Badge Colors ─────────────────────────────────────────────────

const DEPT_COLORS = {
  Management: { bg: "#ede9fe", color: "#7c3aed" },
  HR: { bg: "#fce7f3", color: "#be185d" },
  IT: { bg: "#dbeafe", color: "#1d4ed8" },
  Finance: { bg: "#dcfce7", color: "#15803d" },
};

const getDeptColor = (dept) =>
  DEPT_COLORS[dept] || { bg: COLORS.gray100, color: COLORS.gray600 };

// ─── Flatten tree for search/filter ─────────────────────────────────────────

const flattenTree = (node, result = []) => {
  result.push(node);
  (node.children || []).forEach((child) => flattenTree(child, result));
  return result;
};

const getAllDepartments = (node) => {
  const all = flattenTree(node).map((n) => n.department);
  return ["All", ...Array.from(new Set(all))];
};

// ─── Popover ────────────────────────────────────────────────────────────────

function NodePopover({ node, darkMode, onClose, anchorRef }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  const popRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const deptColor = getDeptColor(node.department);

  const row = (label, value) => (
    <div
      key={label}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: GAP.sm,
        paddingBottom: GAP.xs,
        borderBottom: `1px solid ${th.border}`,
        marginBottom: GAP.xs,
      }}
    >
      <span
        style={{
          fontSize: FONT_SIZE.xs,
          color: th.subtext,
          fontWeight: FONT_WEIGHT.medium,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: FONT_SIZE.xs,
          color: th.text,
          fontWeight: FONT_WEIGHT.normal,
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div
      ref={popRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: th.cardBg,
        border: `1px solid ${th.border}`,
        borderRadius: RADIUS.lg,
        boxShadow: SHADOWS.lg,
        padding: `${SPACING.sm} ${SPACING.md}`,
        minWidth: 220,
        maxWidth: 260,
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 10,
          height: 10,
          background: th.cardBg,
          border: `1px solid ${th.border}`,
          borderBottom: "none",
          borderRight: "none",
        }}
      />
      <div
        style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.semibold,
          color: th.text,
          marginBottom: GAP.xs,
        }}
      >
        {node.name}
      </div>
      <div
        style={{
          display: "inline-block",
          fontSize: FONT_SIZE.xs,
          background: deptColor.bg,
          color: deptColor.color,
          borderRadius: RADIUS.full,
          padding: "2px 8px",
          fontWeight: FONT_WEIGHT.medium,
          marginBottom: GAP.sm,
        }}
      >
        {node.department}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {row("Email", node.email)}
        {row("Phone", node.phone)}
        {row("Joined", new Date(node.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: GAP.sm,
          }}
        >
          <span
            style={{
              fontSize: FONT_SIZE.xs,
              color: th.subtext,
              fontWeight: FONT_WEIGHT.medium,
            }}
          >
            Direct Reports
          </span>
          <span
            style={{
              fontSize: FONT_SIZE.xs,
              color: th.text,
              fontWeight: FONT_WEIGHT.semibold,
              background: COLORS.primaryMuted,
              color: COLORS.primary,
              borderRadius: RADIUS.full,
              padding: "1px 8px",
            }}
          >
            {(node.children || []).length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Node Card ───────────────────────────────────────────────────────────────

function NodeCard({ node, darkMode, searchQuery, deptFilter, isExpanded, onToggle }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  const [showPopover, setShowPopover] = useState(false);
  const cardRef = useRef(null);

  const avatarColor = getAvatarColor(node.name);
  const initials = getInitials(node.name);
  const deptColor = getDeptColor(node.department);

  const allNodes = flattenTree(node);
  const matchesSearch =
    !searchQuery ||
    allNodes.some(
      (n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const selfMatchesSearch =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.department.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesDept =
    deptFilter === "All" || node.department === deptFilter;

  if (!matchesSearch) return null;

  const isHighlighted = selfMatchesSearch && searchQuery;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Card */}
      <div
        ref={cardRef}
        onClick={() => setShowPopover((v) => !v)}
        style={{
          background: th.cardBg,
          border: `1.5px solid ${isHighlighted ? COLORS.primary : th.border}`,
          borderRadius: RADIUS.xl,
          padding: `${GAP.md}px ${GAP.lg}px`,
          cursor: "pointer",
          boxShadow: isHighlighted ? `0 0 0 3px ${COLORS.primaryLight}` : SHADOWS.sm,
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          minWidth: 160,
          maxWidth: 190,
          textAlign: "center",
          userSelect: "none",
          opacity: deptFilter !== "All" && !matchesDept ? 0.35 : 1,
          position: "relative",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.full,
            background: avatarColor.bg,
            color: avatarColor.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.bold,
            margin: "0 auto",
            marginBottom: GAP.sm,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.semibold,
            color: th.text,
            marginBottom: 2,
            lineHeight: 1.3,
          }}
        >
          {node.name}
        </div>

        {/* Designation */}
        <div
          style={{
            fontSize: FONT_SIZE.xs,
            color: th.subtext,
            marginBottom: GAP.sm,
            lineHeight: 1.3,
          }}
        >
          {node.designation}
        </div>

        {/* Dept Badge */}
        <div
          style={{
            display: "inline-block",
            fontSize: FONT_SIZE.xs,
            background: deptColor.bg,
            color: deptColor.color,
            borderRadius: RADIUS.full,
            padding: "2px 10px",
            fontWeight: FONT_WEIGHT.medium,
          }}
        >
          {node.department}
        </div>

        {/* Expand/collapse indicator */}
        {(node.children || []).length > 0 && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            style={{
              position: "absolute",
              bottom: -12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 22,
              height: 22,
              borderRadius: RADIUS.full,
              background: COLORS.primary,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: FONT_WEIGHT.bold,
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 10,
              boxShadow: SHADOWS.sm,
              userSelect: "none",
            }}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "−" : "+"}
          </div>
        )}
      </div>

      {/* Popover */}
      {showPopover && (
        <NodePopover
          node={node}
          darkMode={darkMode}
          onClose={() => setShowPopover(false)}
          anchorRef={cardRef}
        />
      )}
    </div>
  );
}

// ─── Tree Level ──────────────────────────────────────────────────────────────

function TreeNode({ node, darkMode, searchQuery, deptFilter, expandedNodes, onToggle, isRoot = false }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  const hasChildren = (node.children || []).length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const visibleChildren = (node.children || []).filter((child) => {
    const allNodes = flattenTree(child);
    return (
      !searchQuery ||
      allNodes.some(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Node card */}
      <NodeCard
        node={node}
        darkMode={darkMode}
        searchQuery={searchQuery}
        deptFilter={deptFilter}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {/* Children area */}
      {hasChildren && isExpanded && visibleChildren.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 0,
          }}
        >
          {/* Vertical stem down from card (to horizontal bar) */}
          <div
            style={{
              width: 2,
              height: 28,
              background: th.border,
              marginTop: 12,
              flexShrink: 0,
            }}
          />

          {/* Horizontal connector bar + children row */}
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
            {/* Horizontal bar */}
            {visibleChildren.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "calc(50% - 1px)",
                  /* We'll compute this with a trick — use the full container width minus first/last child half-widths.
                     Since we can't know exact widths at render, we use percentage overflow trick. */
                  width: "calc(100% - 190px)",
                  height: 2,
                  background: th.border,
                  transform: "translateX(calc(-50% + 0.5px))",
                  /* Ensure it spans from first child center to last child center */
                  left: 0,
                  right: 0,
                  margin: "0 auto",
                  zIndex: 0,
                }}
              />
            )}

            {/* Children */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: GAP.lg + GAP.md,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              {visibleChildren.map((child, idx) => (
                <div
                  key={child.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* Vertical drop from horizontal bar to child card */}
                  <div
                    style={{
                      width: 2,
                      height: 28,
                      background: th.border,
                      flexShrink: 0,
                    }}
                  />

                  <TreeNode
                    node={child}
                    darkMode={darkMode}
                    searchQuery={searchQuery}
                    deptFilter={deptFilter}
                    expandedNodes={expandedNodes}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Horizontal bar connector (overrides the broken width approach above) ────

function ConnectedChildren({ children, darkMode }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  const containerRef = useRef(null);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const childEls = Array.from(containerRef.current.children);
    if (childEls.length < 2) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const firstRect = childEls[0].getBoundingClientRect();
    const lastRect = childEls[childEls.length - 1].getBoundingClientRect();

    const firstCenter = firstRect.left + firstRect.width / 2 - containerRect.left;
    const lastCenter = lastRect.left + lastRect.width / 2 - containerRect.left;

    setBarStyle({
      left: firstCenter,
      width: lastCenter - firstCenter,
    });
  }, [children]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: GAP.lg + GAP.md,
        alignItems: "flex-start",
        position: "relative",
      }}
    >
      {/* Horizontal bar — positioned after measure */}
      {React.Children.count(children) > 1 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: barStyle.left,
            width: barStyle.width,
            height: 2,
            background: th.border,
            zIndex: 0,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Redesigned TreeNode using ConnectedChildren ─────────────────────────────

function TreeNodeV2({ node, darkMode, searchQuery, deptFilter, expandedNodes, onToggle }) {
  const th = darkMode ? COLORS.dark : COLORS.light;
  const hasChildren = (node.children || []).length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const visibleChildren = (node.children || []).filter((child) => {
    const allNodes = flattenTree(child);
    return (
      !searchQuery ||
      allNodes.some(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Node card */}
      <NodeCard
        node={node}
        darkMode={darkMode}
        searchQuery={searchQuery}
        deptFilter={deptFilter}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {/* Children */}
      {hasChildren && isExpanded && visibleChildren.length > 0 && (
        <>
          {/* Vertical stem down */}
          <div
            style={{
              width: 2,
              height: 28,
              background: th.border,
              marginTop: 12,
              flexShrink: 0,
              zIndex: 1,
            }}
          />

          <ConnectedChildren darkMode={darkMode}>
            {visibleChildren.map((child) => (
              <div
                key={child.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Drop line from horizontal bar */}
                <div
                  style={{
                    width: 2,
                    height: 28,
                    background: th.border,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                />
                <TreeNodeV2
                  node={child}
                  darkMode={darkMode}
                  searchQuery={searchQuery}
                  deptFilter={deptFilter}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                />
              </div>
            ))}
          </ConnectedChildren>
        </>
      )}
    </div>
  );
}

// ─── Main OrgChart Screen ────────────────────────────────────────────────────

export default function OrgChart({ darkMode = false }) {
  const th = darkMode ? COLORS.dark : COLORS.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [expandedNodes, setExpandedNodes] = useState(
    () => new Set(flattenTree(ORG_DATA).map((n) => n.id))
  );

  const departments = getAllDepartments(ORG_DATA);
  const allNodeIds = flattenTree(ORG_DATA).map((n) => n.id);
  const allExpanded = expandedNodes.size === allNodeIds.length;

  const handleToggle = (id) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (allExpanded) {
      setExpandedNodes(new Set());
    } else {
      setExpandedNodes(new Set(allNodeIds));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: th.pageBg,
        fontFamily: "'Inter', sans-serif",
        padding: `${SPACING.lg} ${SPACING.xl}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: GAP.md,
          marginBottom: SPACING.lg,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: FONT_SIZE.xl,
              fontWeight: FONT_WEIGHT.bold,
              color: th.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Organisation Chart
          </h1>
          <p
            style={{
              fontSize: FONT_SIZE.sm,
              color: th.subtext,
              margin: "4px 0 0",
            }}
          >
            Visual hierarchy of the company structure
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: GAP.md,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: th.subtext,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or role..."
              style={{
                height: 38,
                paddingLeft: 32,
                paddingRight: 12,
                fontSize: FONT_SIZE.sm,
                color: th.text,
                background: th.inputBg,
                border: `1px solid ${th.inputBorder}`,
                borderRadius: RADIUS.lg,
                outline: "none",
                width: 200,
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              fontSize: FONT_SIZE.sm,
              color: th.text,
              background: th.inputBg,
              border: `1px solid ${th.inputBorder}`,
              borderRadius: RADIUS.lg,
              outline: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Expand/Collapse toggle */}
          <button
            onClick={handleExpandAll}
            style={{
              height: 38,
              padding: "0 16px",
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              color: COLORS.primary,
              background: COLORS.primaryMuted,
              border: `1px solid ${COLORS.primaryLight}`,
              borderRadius: RADIUS.lg,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: GAP.md,
          flexWrap: "wrap",
          marginBottom: SPACING.lg,
          padding: `${GAP.sm}px ${GAP.md}px`,
          background: th.cardBg,
          border: `1px solid ${th.border}`,
          borderRadius: RADIUS.lg,
        }}
      >
        <span
          style={{
            fontSize: FONT_SIZE.xs,
            color: th.subtext,
            fontWeight: FONT_WEIGHT.medium,
          }}
        >
          Departments:
        </span>
        {Object.entries(DEPT_COLORS).map(([dept, colors]) => (
          <div
            key={dept}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: RADIUS.full,
                background: colors.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: FONT_SIZE.xs,
                color: th.subtext,
              }}
            >
              {dept}
            </span>
          </div>
        ))}
        <span
          style={{
            fontSize: FONT_SIZE.xs,
            color: th.subtext,
            marginLeft: "auto",
          }}
        >
          Click any card for details • Click +/− to expand/collapse
        </span>
      </div>

      {/* Chart area */}
      <div
        style={{
          background: th.cardBg,
          border: `1px solid ${th.border}`,
          borderRadius: RADIUS.xl,
          boxShadow: SHADOWS.sm,
          padding: `${SPACING.xl} ${SPACING.lg}`,
          overflowX: "auto",
          overflowY: "visible",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minWidth: "max-content",
            paddingBottom: SPACING.lg,
          }}
        >
          <TreeNodeV2
            node={ORG_DATA}
            darkMode={darkMode}
            searchQuery={searchQuery}
            deptFilter={deptFilter}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Footer count */}
      <div
        style={{
          marginTop: SPACING.md,
          textAlign: "center",
          fontSize: FONT_SIZE.xs,
          color: th.subtext,
        }}
      >
        {flattenTree(ORG_DATA).length} employees across{" "}
        {Object.keys(DEPT_COLORS).length} departments
      </div>
    </div>
  );
}
