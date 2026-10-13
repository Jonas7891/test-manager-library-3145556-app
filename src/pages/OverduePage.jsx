import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Pagination, formatDate, useQuery } from '../components/Common.jsx';

// HU-09: más días de retraso primero.
export default function OverduePage() {
  const [page, setPage] = useState(1);
  const overdue = useQuery(() => api('/loans/overdue', { query: { page, size: 20 } }), [page]);

  return (
    <>
      <h2>Libros vencidos</h2>
      <ErrorBanner error={overdue.error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Libro</th><th>Socio</th><th>Vencía</th><th>Días de retraso</th></tr></thead>
          <tbody>
            {overdue.data?.items.map((r) => (
              <tr key={r.item_id}>
                <td>{r.book_title}</td>
                <td>{r.member_name}</td>
                <td>{formatDate(r.due_at)}</td>
                <td><span className="badge overdue">{r.days_late}</span></td>
              </tr>
            ))}
            {overdue.data?.items.length === 0 && <tr><td colSpan="4" className="muted">No hay libros vencidos.</td></tr>}
          </tbody>
        </table>
        {overdue.data && <Pagination {...overdue.data} onPage={setPage} />}
      </div>
    </>
  );
}
