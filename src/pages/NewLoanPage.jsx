import { useDeferredValue, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, formatDate, useQuery } from '../components/Common.jsx';

// HU-06: un socio, de 1 a 3 libros distintos.
export default function NewLoanPage() {
  const [memberQ, setMemberQ] = useState('');
  const [bookQ, setBookQ] = useState('');
  const [member, setMember] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const memberSearch = useDeferredValue(memberQ);
  const bookSearch = useDeferredValue(bookQ);
  const members = useQuery(() => (memberSearch ? api('/members', { query: { q: memberSearch, size: 5 } }) : null), [memberSearch]);
  const books = useQuery(() => (bookSearch ? api('/books', { query: { q: bookSearch, size: 5 } }) : null), [bookSearch]);

  function add(book) {
    if (selected.length < 3 && !selected.some((b) => b.id === book.id)) setSelected([...selected, book]);
  }

  async function submit() {
    setError(null);
    try {
      const loan = await api('/loans', {
        method: 'POST',
        body: { member_id: member.id, items: selected.map((b) => ({ book_id: b.id })) },
      });
      setCreated(loan);
      setSelected([]);
      setMember(null);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <h2>Registrar préstamo</h2>
      <ErrorBanner error={error} />
      {created && (
        <div className="alert ok">
          Préstamo registrado. Vence el {formatDate(created.items[0].due_at)}:{' '}
          {created.items.map((i) => i.book_title).join(', ')}.
        </div>
      )}

      <div className="card">
        <h3>1. Socio {member && <span className="badge">{member.full_name} · {member.document_number}</span>}</h3>
        <label>Buscar socio por nombre o documento<input value={memberQ} onChange={(e) => setMemberQ(e.target.value)} /></label>
        {members.data?.items.map((m) => (
          <button key={m.id} className="secondary" onClick={() => setMember(m)} style={{ margin: 4 }}>
            {m.full_name} ({m.document_number})
          </button>
        ))}
      </div>

      <div className="card">
        <h3>2. Libros ({selected.length}/3)</h3>
        <label>Buscar libro por título o autor<input value={bookQ} onChange={(e) => setBookQ(e.target.value)} /></label>
        {books.data?.items.map((b) => (
          <button key={b.id} className="secondary" disabled={selected.length >= 3} onClick={() => add(b)} style={{ margin: 4 }}>
            {b.title} · {b.available_copies} disp.
          </button>
        ))}
        <ul>
          {selected.map((b) => (
            <li key={b.id}>
              {b.title} <button className="link" onClick={() => setSelected(selected.filter((s) => s.id !== b.id))}>Quitar</button>
            </li>
          ))}
        </ul>
      </div>

      <button disabled={!member || selected.length === 0} onClick={submit}>
        Registrar préstamo (vence a los 14 días)
      </button>
    </>
  );
}
