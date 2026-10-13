import { useState } from 'react';
import { api } from '../api/client.js';
import { STATUS_LABEL, formatDate } from '../lib/format.js';
import { useQuery } from '../lib/useQuery.js';
import { Alert, DataTable, Field, PageHeader, Pager, Panel } from '../ui/index.jsx';

const COLUMNS = ['Libro', 'ISBN', 'Categoría', 'Vence', 'Devuelto', ''];

// HU-07 y HU-08: listar con filtros y devolver por línea.
export default function Loans() {
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
      <PageHeader title="Préstamos" description="Filtra por fecha o estado y registra la devolución de cada libro por separado." />
      <Alert error={error || loans.error} success={notice} />

      <Panel>
        <div className="grid">
          <Field label="Desde"><input type="date" value={filters.from} onChange={set('from')} /></Field>
          <Field label="Hasta"><input type="date" value={filters.to} onChange={set('to')} /></Field>
          <Field label="Estado">
            <select value={filters.status} onChange={set('status')}>
              <option value="">Todos</option>
              <option value="open">Abiertos</option>
              <option value="overdue">Vencidos</option>
              <option value="closed">Cerrados</option>
            </select>
          </Field>
        </div>
      </Panel>

      {loans.data?.items.length === 0 ? <Panel><p className="empty">No hay préstamos con esos filtros.</p></Panel> : null}
      {loans.data?.items.map((loan) => (
        <Panel key={loan.id}>
          <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="muted">Prestado el {formatDate(loan.loaned_at)}</span>
            <span className={`pill ${loan.status}`}>{STATUS_LABEL[loan.status]}</span>
          </div>
          <DataTable
            columns={COLUMNS}
            rows={loan.items}
            rowKey={(item) => item.id}
            renderRow={(item) => (
              <>
                <td><strong>{item.book_title}</strong></td>
                <td className="muted">{item.isbn}</td>
                <td>{item.category_name}</td>
                <td>{formatDate(item.due_at)}</td>
                <td>{formatDate(item.returned_at)}</td>
                <td>{item.returned_at ? null : <button className="btn small" onClick={() => giveBack(loan, item)}>Devolver</button>}</td>
              </>
            )}
          />
        </Panel>
      ))}
      {loans.data ? <Pager {...loans.data} onPage={(page) => setFilters({ ...filters, page })} /> : null}
    </>
  );
}
