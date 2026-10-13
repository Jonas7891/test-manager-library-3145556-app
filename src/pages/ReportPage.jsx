import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner } from '../components/Common.jsx';

const today = new Date().toISOString().slice(0, 10);
const monthStart = today.slice(0, 8) + '01';

// HU-10 (solo admin): una fila por libro y categoría congelados; sin socios ni bibliotecarios.
export default function ReportPage() {
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
      <h2>Libros más prestados</h2>
      <ErrorBanner error={error} />
      <form className="card row" onSubmit={load}>
        <label>Desde<input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} required /></label>
        <label>Hasta<input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} required /></label>
        <button type="submit">Generar</button>
      </form>
      {report && (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>#</th><th>Libro</th><th>Categoría</th><th>Veces prestado</th></tr></thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={`${r.book_id}-${r.book_title}-${r.category_name}`}>
                  <td>{i + 1}</td>
                  <td>{r.book_title}</td>
                  <td>{r.category_name}</td>
                  <td>{r.times_borrowed}</td>
                </tr>
              ))}
              {report.rows.length === 0 && <tr><td colSpan="4" className="muted">Sin préstamos en el rango.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
