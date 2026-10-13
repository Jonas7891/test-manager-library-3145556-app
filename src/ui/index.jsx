// Reusable interface blocks (ADR-013).

export function PageHeader({ title, description, children }) {
  return (
    <header className="page-head">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
    </header>
  );
}

export function Panel({ title, children, as: Tag = 'section', ...rest }) {
  return (
    <Tag className="panel" {...rest}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </Tag>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}

export function Alert({ error, success }) {
  if (error) {
    return (
      <div className="alert error" role="alert">
        <strong>{error.message}</strong>
        {error.details?.length > 0 ? (
          <ul>
            {error.details.map((d, i) => (
              <li key={i}>
                {d.field}: {d.issue}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }
  return success ? <div className="alert ok">{success}</div> : null;
}

// Table with headers and an empty state.
export function DataTable({ columns, rows, rowKey, empty = 'Sin resultados.', renderRow }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length === 0 ? (
            <tr>
              <td className="empty" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            rows?.map((r) => <tr key={rowKey(r)}>{renderRow(r)}</tr>)
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ page, size, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pager">
      <button className="btn ghost small" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages} · {total} resultado(s)
      </span>
      <button className="btn ghost small" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
      </button>
    </div>
  );
}
