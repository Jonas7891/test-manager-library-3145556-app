import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Notice, Pagination, STATUS_LABEL, formatDate, useQuery } from '../components/Common.jsx';

// HU-07 y HU-08: listar con filtros y devolver por línea.
export default function LoansPage() {
  const [filters, setFilters] = useState({ from: '', to: '', status: '', page: 1 });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const loans = useQuery(() => api('/loans', { query: { ...filters, size: 10 } }), [filters]);

  async function giveBack(loan, item) {
    setError(null);
    setNotice('');
    try {
      await api(`/loans/${loan.id}/items/${item.id}/return`, { method: 'POST' });
      setNotice(`Devuelto: ${item.book_title}.`);
      loans.reload();
    } catch (err) {
      setError(err);
    }
  }

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value, page: 1 });

  return (
    <>
      <h2>Préstamos</h2>
      <ErrorBanner error={error || loans.error} />
      <Notice text={notice} />
      <div className="card row">
        <label>Desde<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>Hasta<input type="date" value={filters.to} onChange={set('to')} /></label>
        <label>
          Estado
          <select value={filters.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="open">Abiertos</option>
            <option value="overdue">Vencidos</option>
            <option value="closed">Cerrados</option>
          </select>
        </label>
      </div>

      {loans.data?.items.map((loan) => (
        <div className="card" key={loan.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>Prestado el {formatDate(loan.loaned_at)}</span>
            <span className={`badge ${loan.status}`}>{STATUS_LABEL[loan.status]}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Libro</th><th>ISBN</th><th>Categoría</th><th>Vence</th><th>Devuelto</th><th></th></tr></thead>
              <tbody>
                {loan.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.book_title}</td>
                    <td>{item.isbn}</td>
                    <td>{item.category_name}</td>
                    <td>{formatDate(item.due_at)}</td>
                    <td>{formatDate(item.returned_at)}</td>
                    <td>{!item.returned_at && <button onClick={() => giveBack(loan, item)}>Devolver</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {loans.data && <Pagination {...loans.data} onPage={(page) => setFilters({ ...filters, page })} />}
    </>
  );
}
