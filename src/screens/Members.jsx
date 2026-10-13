import { useDeferredValue, useState } from 'react';
import { api } from '../api/client.js';
import { useQuery } from '../lib/useQuery.js';
import { Alert, DataTable, Field, PageHeader, Pager, Panel } from '../ui/index.jsx';

const EMPTY = { full_name: '', document_number: '' };

// HU-05: members are created and looked up; they are never deleted.
export default function Members() {
  const [filters, setFilters] = useState({ q: '', page: 1 });
  const [form, setForm] = useState(EMPTY);
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
      setForm(EMPTY);
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
      <PageHeader title="Socios" description="Personas que piden libros prestados. Se registran con su documento, que es único." />
      <Alert error={error || members.error} success={notice} />

      <Panel as="form" title="Nuevo socio" onSubmit={create}>
        <div className="grid">
          <Field label="Nombre completo"><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></Field>
          <Field label="Documento"><input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required /></Field>
          <div className="actions"><button className="btn" type="submit">Crear socio</button></div>
        </div>
      </Panel>

      {detail ? (
        <Panel title={detail.full_name}>
          <p className="muted">
            Documento {detail.document_number} · <strong>{detail.active_loans}</strong> libro(s) sin devolver (máximo 3)
          </p>
          <button className="btn ghost small" onClick={() => setDetail(null)}>Cerrar</button>
        </Panel>
      ) : null}

      <Panel>
        <div className="grid" style={{ marginBottom: 16 }}>
          <Field label="Buscar por nombre o documento">
            <input value={filters.q} onChange={(e) => setFilters({ q: e.target.value, page: 1 })} />
          </Field>
        </div>
        <DataTable
          columns={['Nombre', 'Documento', '']}
          rows={members.data?.items}
          rowKey={(m) => m.id}
          empty="No hay socios que coincidan."
          renderRow={(m) => (
            <>
              <td><strong>{m.full_name}</strong></td>
              <td className="muted">{m.document_number}</td>
              <td><button className="btn soft small" onClick={() => show(m.id)}>Ver</button></td>
            </>
          )}
        />
        {members.data ? <Pager {...members.data} onPage={(page) => setFilters({ ...filters, page })} /> : null}
      </Panel>
    </>
  );
}
