import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from "./icons.jsx";

const getVisiblePages = (page, totalPages) =>
  Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

/**
 * Pie de tabla con rango de resultados, paginación completa e indicador de página.
 */
export const TablePagination = ({ page, totalPages: rawTotalPages, total, limit, itemLabel, onPageChange }) => {
  const totalPages = Math.max(1, rawTotalPages || 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="dt-footer">
      <span className="dt-footer-info">
        Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{total}</strong> {itemLabel}
      </span>

      <div className="pagination-controls">
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="Primera página"
        >
          <IconChevronsLeft />
        </button>
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <IconChevronLeft />
        </button>

        {getVisiblePages(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`page-btn${page === p ? " active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <IconChevronRight />
        </button>
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Última página"
        >
          <IconChevronsRight />
        </button>
      </div>

      <span className="dt-footer-page">
        Pág. <strong>{page}</strong> / {totalPages}
      </span>
    </div>
  );
};
