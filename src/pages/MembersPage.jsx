import { useDeferredValue, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Notice, Pagination, useQuery } from '../components/Common.jsx';

// HU-05: los socios se crean y se consultan; no se eliminan.
export default function MembersPage() {
  const [filters, setFilters] = useState({ q: '', page: 1 });
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const query = useDeferredValue(filters);
  const members = useQuery(() => api('/members', { query: { ...query, size: 10 } }), [query]);

  async function create(e) {
    e.preventDefault();
    setError(null);
    setNotice('');
    try {
      await api('/members', { method: 'POST', body: form });
      setForm({ full_name: '', document_number: '' });
      setNotice('Socio creado.');
      members.reload();
    } catch (err) {
      setError(err);
    }
  }

  async function show(id) {
    try {
      setDetail(await api(`/members/${id}`));
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <h2>Socios</h2>
      <ErrorBanner error={error || members.error} />
      <Notice text={notice} />
      <form className="card row" onSubmit={create}>
        <label>Nombre completo<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></label>
        <label>Documento<input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required /></label>
        <button type="submit">Crear socio</button>
      </form>

      {detail && (
        <div className="card">
          <strong>{detail.full_name}</strong> · documento {detail.document_number} · <strong>{detail.active_loans}</strong> libro(s) sin devolver (máximo 3)
          <button className="link" onClick={() => setDetail(null)}>Cerrar</button>
        </div>
      )}

      <div className="card">
        <label>Buscar por nombre o documento<input value={filters.q} onChange={(e) => setFilters({ q: e.target.value, page: 1 })} /></label>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Documento</th><th></th></tr></thead>
            <tbody>
              {members.data?.items.map((m) => (
                <tr key={m.id}>
                  <td>{m.full_name}</td>
                  <td>{m.document_number}</td>
                  <td><button className="secondary" onClick={() => show(m.id)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.data && <Pagination {...members.data} onPage={(page) => setFilters({ ...filters, page })} />}
      </div>
    </>
  );
}
