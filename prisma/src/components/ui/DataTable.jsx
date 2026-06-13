import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from "lucide-react";

// ── Theme tokens ────────────────────────────────────────────────────────────
import { COLORS }                                          from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }             from "../../theme/fonts";
import { SPACING, PADDING, GAP }                           from "../../theme/spacing";
import { RADIUS, SHADOW, TRANSITION }                      from "../../theme/sizes";

/**
 * DataTable — Reusable themed table with built-in pagination, sorting & empty state.
 *
 * Props:
 *  @param {Array}    columns     - Column definitions: [{ key, label, render?, width?, align?, sortable? }]
 *  @param {Array}    data        - Full filtered data (before pagination)
 *  @param {number}   [rowsPerPage=10] - Rows per page
 *  @param {boolean}  [darkMode=false]
 *  @param {string}   [emptyText="No records found"]  - Text when no rows
 *  @param {string}   [emptyIcon]       - Optional React node rendered above emptyText
 *  @param {Function} [onRowClick]      - (row, index) => void
 *  @param {string}   [rowKey="_id"]    - unique key field in each row
 *  @param {boolean}  [stickyHeader=false]
 *  @param {number}   [page]            - controlled page (optional)
 *  @param {Function} [onPageChange]    - controlled page setter (optional)
 */
const DataTable = ({
  columns = [],
  data = [],
  rowsPerPage = 10,
  darkMode = false,
  emptyText = "No records found",
  emptyIcon = null,
  onRowClick,
  rowKey = "_id",
  stickyHeader = false,
  page: controlledPage,
  onPageChange,
}) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  // ── Pagination ──────────────────────────────────────────────────────────
  const isControlled = controlledPage !== undefined;
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = isControlled ? controlledPage : internalPage;
  const setCurrentPage = isControlled ? onPageChange : setInternalPage;

  // ── Sorting ─────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    if (setCurrentPage) setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      // Handle numbers
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      // Handle strings
      va = String(va ?? "").toLowerCase();
      vb = String(vb ?? "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sortedData.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  // Page numbers to show (max 5 centered on current)
  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  // ── Styles ──────────────────────────────────────────────────────────────
  const styles = {
    wrapper: {
      width: "100%",
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: FONT_FAMILY.base,
    },
    thead: {
      borderBottom: `2px solid ${surface.border}`,
      ...(stickyHeader && {
        position: "sticky",
        top: 0,
        zIndex: 2,
        background: surface.cardBg,
      }),
    },
    th: (col) => ({
      textAlign: col.align || "left",
      padding: PADDING.tableHeader,
      fontSize: FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLORS.gray600,
      fontFamily: FONT_FAMILY.base,
      whiteSpace: "nowrap",
      cursor: col.sortable ? "pointer" : "default",
      userSelect: col.sortable ? "none" : "auto",
      ...(col.width && { width: col.width }),
      transition: TRANSITION.fast,
    }),
    thInner: {
      display: "inline-flex",
      alignItems: "center",
      gap: GAP.xs,
    },
    sortIcon: {
      opacity: 0.5,
      flexShrink: 0,
    },
    sortIconActive: {
      opacity: 1,
      color: COLORS.primary,
      flexShrink: 0,
    },
    row: {
      borderBottom: `1px solid ${surface.divider || surface.border}`,
      transition: TRANSITION.fast,
      cursor: onRowClick ? "pointer" : "default",
    },
    td: (col) => ({
      padding: PADDING.tableCell,
      fontSize: FONT_SIZE.base,
      color: surface.text,
      fontFamily: FONT_FAMILY.base,
      ...(col.align && { textAlign: col.align }),
    }),
    emptyCell: {
      textAlign: "center",
      padding: `${SPACING[12] || 48}px ${SPACING[4]}px`,
      color: COLORS.gray400,
      fontSize: FONT_SIZE.md,
      fontFamily: FONT_FAMILY.base,
    },
    paginationWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${surface.divider || surface.border}`,
      paddingTop: SPACING[4],
      marginTop: GAP.sm,
    },
    paginationInfo: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.gray400,
      fontFamily: FONT_FAMILY.base,
    },
    pageButtons: {
      display: "flex",
      gap: GAP.xs + 2,
      alignItems: "center",
    },
    pageBtn: (active, disabled) => ({
      width: 34,
      height: 34,
      borderRadius: RADIUS.md,
      border: active ? "none" : `1px solid ${COLORS.gray200 || surface.border}`,
      background: active ? COLORS.primary : surface.cardBg,
      color: active
        ? COLORS.white
        : disabled
          ? COLORS.gray300
          : COLORS.gray700,
      fontWeight: active ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
      fontFamily: FONT_FAMILY.base,
      fontSize: FONT_SIZE.base,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: TRANSITION.fast,
      outline: "none",
    }),
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={styles.th(col)}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span style={styles.thInner}>
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp size={14} style={styles.sortIconActive} />
                      ) : (
                        <ArrowDown size={14} style={styles.sortIconActive} />
                      )
                    ) : (
                      <ArrowUp size={14} style={styles.sortIcon} />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.emptyCell}>
                {emptyIcon && <div style={{ marginBottom: GAP.sm }}>{emptyIcon}</div>}
                {emptyText}
              </td>
            </tr>
          ) : (
            paginated.map((row, rowIdx) => (
              <tr
                key={row[rowKey] || rowIdx}
                style={styles.row}
                onClick={onRowClick ? () => onRowClick(row, rowIdx) : undefined}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = surface.rowHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {columns.map((col) => (
                  <td key={col.key} style={styles.td(col)}>
                    {col.render
                      ? col.render(row[col.key], row, rowIdx)
                      : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {sortedData.length > rowsPerPage && (
        <div style={styles.paginationWrapper}>
          <span style={styles.paginationInfo}>
            Showing {(safePage - 1) * rowsPerPage + 1}–
            {Math.min(safePage * rowsPerPage, sortedData.length)} of{" "}
            {sortedData.length}
          </span>

          <div style={styles.pageButtons}>
            {/* First page */}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                style={styles.pageBtn(false, safePage === 1)}
                aria-label="First page"
              >
                <ChevronsLeft size={16} />
              </button>
            )}

            {/* Prev */}
            <button
              onClick={() => setCurrentPage(Math.max(safePage - 1, 1))}
              disabled={safePage === 1}
              style={styles.pageBtn(false, safePage === 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={styles.pageBtn(p === safePage, false)}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(Math.min(safePage + 1, totalPages))}
              disabled={safePage >= totalPages}
              style={styles.pageBtn(false, safePage >= totalPages)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last page */}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                style={styles.pageBtn(false, safePage >= totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
