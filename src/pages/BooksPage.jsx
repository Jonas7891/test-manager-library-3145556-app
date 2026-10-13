import { useDeferredValue, useEffect, useState } from 'react';
import { api, fetchCover } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ErrorBanner, Notice, Pagination, useQuery } from '../components/Common.jsx';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 };

function Cover({ book }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url;
    if (book.cover_key) fetchCover(book.id).then((u) => setSrc((url = u)));
    else setSrc(null);
    return () => url && URL.revokeObjectURL(url);
  }, [book.id, book.cover_key]);
  return src ? <img className="cover" src={src} alt={`Portada de ${book.title}`} /> : <div className="cover" />;
}

// HU-03 y HU-04
export default function BooksPage() {
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
    if (editing) {
      run(() => api(`/books/${editing}`, { method: 'PUT', body }), 'Libro actualizado.');
    } else {
      run(() => api('/books', { method: 'POST', body }), 'Libro creado.');
    }
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
    data.append('_method', 'PUT'); // PHP solo lee multipart en POST (H-17)
    run(() => api(`/books/${book.id}/cover`, { method: 'POST', body: data }), 'Portada guardada.');
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h2>Catálogo</h2>
      <ErrorBanner error={error || books.error} />
      <Notice text={notice} />

      {isAdmin && (
        <form className="card" onSubmit={save}>
          <h3>{editing ? 'Editar libro' : 'Nuevo libro'}</h3>
          <div className="row">
            <label>Título<input value={form.title} onChange={set('title')} required /></label>
            <label>Autor<input value={form.author} onChange={set('author')} required /></label>
            <label>ISBN (13 dígitos)<input value={form.isbn} onChange={set('isbn')} disabled={!!editing} required /></label>
            <label>
              Categoría
              <select value={form.category_id} onChange={set('category_id')} required>
                <option value="">Elige…</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Ejemplares<input type="number" min="1" value={form.total_copies} onChange={set('total_copies')} required /></label>
            <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
            {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancelar</button>}
          </div>
        </form>
      )}

      <div className="card">
        <div className="row">
          <label>Buscar por título o autor<input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} /></label>
          <label>
            Categoría
            <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}>
              <option value="">Todas</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th></th><th>Título</th><th>Autor</th><th>ISBN</th><th>Categoría</th><th>Disponibles</th>{isAdmin && <th>Acciones</th>}</tr>
            </thead>
            <tbody>
              {books.data?.items.map((b) => (
                <tr key={b.id}>
                  <td><Cover book={b} /></td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.category.name}</td>
                  <td>{b.available_copies} / {b.total_copies}</td>
                  {isAdmin && (
                    <td>
                      <button className="secondary" onClick={() => edit(b)}>Editar</button>{' '}
                      <label className="secondary">
                        Portada
                        <input type="file" accept="image/png,image/jpeg" onChange={(e) => e.target.files[0] && uploadCover(b, e.target.files[0])} />
                      </label>
                      {b.cover_key && <button className="secondary" onClick={() => run(() => api(`/books/${b.id}/cover`, { method: 'DELETE' }), 'Portada quitada.')}>Quitar portada</button>}{' '}
                      <button className="danger" onClick={() => confirm(`¿Dar de baja «${b.title}»?`) && run(() => api(`/books/${b.id}`, { method: 'DELETE' }), 'Libro dado de baja.')}>Baja</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {books.data && <Pagination {...books.data} onPage={(page) => setFilters({ ...filters, page })} />}
      </div>
    </>
  );
}
