import { useDeferredValue, useState } from 'react';
import { api } from '../api/client.js';
import { formatDate } from '../lib/format.js';
import { useQuery } from '../lib/useQuery.js';
import { Alert, Field, PageHeader, Panel } from '../ui/index.jsx';

// HU-06: un socio, de 1 a 3 libros distintos.
export default function NewLoan() {
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

  const success = created
    ? `Préstamo registrado. Vence el ${formatDate(created.items[0].due_at)}: ${created.items.map((i) => i.book_title).join(', ')}.`
    : '';

  return (
    <>
      <PageHeader title="Registrar préstamo" description="Elige un socio y de 1 a 3 libros distintos. El préstamo vence a los 14 días." />
      <Alert error={error} success={success} />

      <Panel title={member ? `1. Socio: ${member.full_name} · ${member.document_number}` : '1. Socio'}>
        <Field label="Buscar socio por nombre o documento">
          <input value={memberQ} onChange={(e) => setMemberQ(e.target.value)} />
        </Field>
        <div className="chips">
          {members.data?.items.map((m) => (
            <button key={m.id} className={member?.id === m.id ? 'btn small' : 'btn soft small'} onClick={() => setMember(m)}>
              {m.full_name} ({m.document_number})
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`2. Libros (${selected.length}/3)`}>
        <Field label="Buscar libro por título o autor">
          <input value={bookQ} onChange={(e) => setBookQ(e.target.value)} />
        </Field>
        <div className="chips">
          {books.data?.items.map((b) => (
            <button key={b.id} className="btn soft small" disabled={selected.length >= 3} onClick={() => add(b)}>
              {b.title} · {b.available_copies} disp.
            </button>
          ))}
        </div>
        {selected.length > 0 ? (
          <ul>
            {selected.map((b) => (
              <li key={b.id}>
                {b.title} <button className="btn text" onClick={() => setSelected(selected.filter((s) => s.id !== b.id))}>Quitar</button>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <button className="btn" disabled={!member || selected.length === 0} onClick={submit}>
        Registrar préstamo (vence a los 14 días)
      </button>
    </>
  );
}
