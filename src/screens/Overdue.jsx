import { useState } from 'react';
import { api } from '../api/client.js';
import { formatDate } from '../lib/format.js';
import { useQuery } from '../lib/useQuery.js';
import { Alert, DataTable, PageHeader, Pager, Panel } from '../ui/index.jsx';

// HU-09: más días de retraso primero.
export default function Overdue() {
  const [page, setPage] = useState(1);
  const overdue = useQuery(() => api('/loans/overdue', { query: { page, size: 20 } }), [page]);

  return (
    <>
      <PageHeader title="Libros vencidos" description="Libros sin devolver cuya fecha de vencimiento ya pasó, con más días de retraso primero." />
      <Alert error={overdue.error} />
      <Panel>
        <DataTable
          columns={['Libro', 'Socio', 'Vencía', 'Días de retraso']}
          rows={overdue.data?.items}
          rowKey={(r) => r.item_id}
          empty="No hay libros vencidos."
          renderRow={(r) => (
            <>
              <td><strong>{r.book_title}</strong></td>
              <td>{r.member_name}</td>
              <td>{formatDate(r.due_at)}</td>
              <td><span className="pill overdue">{r.days_late}</span></td>
            </>
          )}
        />
        {overdue.data ? <Pager {...overdue.data} onPage={setPage} /> : null}
      </Panel>
    </>
  );
}
