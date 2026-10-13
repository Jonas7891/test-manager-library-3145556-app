import { useDeferredValue, useEffect, useState } from 'react';
import { api, fetchCover } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useQuery } from '../lib/useQuery.js';
import { Alert, DataTable, Field, PageHeader, Pager, Panel } from '../ui/index.jsx';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 };

function Thumb({ book }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url;
    if (book.cover_key) fetchCover(book.id).then((u) => setSrc((url = u)));
    else setSrc(null);
    return () => url && URL.revokeObjectURL(url);
  }, [book.id, book.cover_key]);
  return src ? <img className="thumb" src={src} alt={`Portada de ${book.title}`} /> : <div className="thumb" />;
}

// HU-03 y HU-04
export default function Catalog() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({ q: '', category_id: '', page: 1 });
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const categories = useQuery(() => api('/categories'), []);
  const query = useDeferredValue(filters);
  const books = useQuery(() => api('/books', { query: { ...query, size: 10 } }), [query]);

  async function run(action, message) {
    setError(null);
    setNotice('');
    try {
      await action();
      setNotice(message);
      books.reload();
    } catch (e) {
      setError(e);
    }
  }

  function save(e) {
    e.preventDefault();
    const body = { ...form, total_copies: Number(form.total_copies) };
    if (editing) run(() => api(`/books/${editing}`, { method: 'PUT', body }), 'Libro actualizado.');
    else run(() => api('/books', { method: 'POST', body }), 'Libro creado.');
    setForm(EMPTY);
    setEditing(null);
  }

  function edit(b) {
    setEditing(b.id);
    setForm({ title: b.title, author: b.author, isbn: b.isbn, category_id: b.category.id, total_copies: b.total_copies });
  }

  function uploadCover(book, file) {
    const data = new FormData();
    data.append('file', file);
    data.append('_method', 'PUT'); // PHP solo lee multipart en POST (ADR-009)
    run(() => api(`/books/${book.id}/cover`, { method: 'POST', body: data }), 'Portada guardada.');
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const categoryOptions = categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>);
  const columns = ['', 'Título', 'Autor', 'ISBN', 'Categoría', 'Disponibles', ...(isAdmin ? ['Acciones'] : [])];

  return (
    <>
      <PageHeader title="Catálogo" description="Busca libros por título, autor o categoría y revisa los ejemplares disponibles." />
      <Alert error={error || books.error} success={notice} />

      {isAdmin ? (
        <Panel as="form" title={editing ? 'Editar libro' : 'Nuevo libro'} onSubmit={save}>
          <div className="grid">
            <Field label="Título"><input value={form.title} onChange={set('title')} required /></Field>
            <Field label="Autor"><input value={form.author} onChange={set('author')} required /></Field>
            <Field label="ISBN (13 dígitos)"><input value={form.isbn} onChange={set('isbn')} disabled={!!editing} required /></Field>
            <Field label="Categoría">
              <select value={form.category_id} onChange={set('category_id')} required>
                <option value="">Elige…</option>
                {categoryOptions}
              </select>
            </Field>
            <Field label="Ejemplares"><input type="number" min="1" value={form.total_copies} onChange={set('total_copies')} required /></Field>
            <div className="actions">
              <button className="btn" type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              {editing ? <button type="button" className="btn ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancelar</button> : null}
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="grid" style={{ marginBottom: 16 }}>
          <Field label="Buscar por título o autor">
            <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
          </Field>
          <Field label="Categoría">
            <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}>
              <option value="">Todas</option>
              {categoryOptions}
            </select>
          </Field>
        </div>
        <DataTable
          columns={columns}
          rows={books.data?.items}
          rowKey={(b) => b.id}
          empty="No hay libros que coincidan."
          renderRow={(b) => (
            <>
              <td><Thumb book={b} /></td>
              <td><strong>{b.title}</strong></td>
              <td>{b.author}</td>
              <td className="muted">{b.isbn}</td>
              <td><span className="pill">{b.category.name}</span></td>
              <td>{b.available_copies} / {b.total_copies}</td>
              {isAdmin ? (
                <td>
                  <div className="actions">
                    <button className="btn soft small" onClick={() => edit(b)}>Editar</button>
                    <label className="btn ghost small file-btn">
                      Portada
                      <input type="file" accept="image/png,image/jpeg" onChange={(e) => e.target.files[0] && uploadCover(b, e.target.files[0])} />
                    </label>
                    {b.cover_key ? <button className="btn ghost small" onClick={() => run(() => api(`/books/${b.id}/cover`, { method: 'DELETE' }), 'Portada quitada.')}>Quitar portada</button> : null}
                    <button className="btn danger small" onClick={() => confirm(`¿Dar de baja «${b.title}»?`) && run(() => api(`/books/${b.id}`, { method: 'DELETE' }), 'Libro dado de baja.')}>Baja</button>
                  </div>
                </td>
              ) : null}
            </>
          )}
        />
        {books.data ? <Pager {...books.data} onPage={(page) => setFilters({ ...filters, page })} /> : null}
      </Panel>
    </>
  );
}
