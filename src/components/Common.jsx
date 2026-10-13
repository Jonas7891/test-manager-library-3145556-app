import { useCallback, useEffect, useRef, useState } from 'react';

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="alert error" role="alert">
      <strong>{error.message}</strong>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((d, i) => (
            <li key={i}>
              {d.field}: {d.issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Notice({ text }) {
  return text ? <div className="alert ok">{text}</div> : null;
}

export function Pagination({ page, size, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages} · {total} resultado(s)
      </span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
      </button>
    </div>
  );
}

// Carga una consulta de la API y expone datos, error y recarga.
export function useQuery(fn, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  const reload = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === latest.current) setData(result);
    } catch (e) {
      if (id === latest.current) setError(e);
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString('es-CO', { timeZone: 'UTC' }) + ' UTC' : '—';
}

export const STATUS_LABEL = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' };
