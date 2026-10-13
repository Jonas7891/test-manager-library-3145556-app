import { useState } from 'react';
import { api } from '../api/client.js';
import { Alert, DataTable, Field, PageHeader, Panel } from '../ui/index.jsx';

const today = new Date().toISOString().slice(0, 10);
const monthStart = today.slice(0, 8) + '01';

// HU-10 (admin only): one row per frozen book and category; no members or librarians.
export default function Report() {
  const [range, setRange] = useState({ from: monthStart, to: today });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function load(e) {
    e.preventDefault();
    setError(null);
    try {
      setReport(await api('/reports/most-borrowed', { query: range }));
    } catch (err) {
      setReport(null);
      setError(err);
    }
  }

  return (
    <>
      <PageHeader title="Libros más prestados" description="Ranking de préstamos en un rango de fechas, con el título y la categoría del momento del préstamo." />
      <Alert error={error} />
      <Panel as="form" onSubmit={load}>
        <div className="grid">
          <Field label="Desde"><input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} required /></Field>
          <Field label="Hasta"><input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} required /></Field>
          <div className="actions"><button className="btn" type="submit">Generar</button></div>
        </div>
      </Panel>
      {report ? (
        <Panel>
          <DataTable
            columns={['#', 'Libro', 'Categoría', 'Veces prestado']}
            rows={report.rows.map((r, i) => ({ ...r, rank: i + 1 }))}
            rowKey={(r) => `${r.book_id}-${r.book_title}-${r.category_name}`}
            empty="Sin préstamos en el rango."
            renderRow={(r) => (
              <>
                <td className="muted">{r.rank}</td>
                <td><strong>{r.book_title}</strong></td>
                <td><span className="pill">{r.category_name}</span></td>
                <td>{r.times_borrowed}</td>
              </>
            )}
          />
        </Panel>
      ) : null}
    </>
  );
}
