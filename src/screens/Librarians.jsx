import { useState } from 'react';
import { api } from '../api/client.js';
import { Alert, Field, PageHeader, Panel } from '../ui/index.jsx';

const EMPTY = { username: '', password: '' };

// HU-02 (admin only): the API only creates librarians.
export default function Librarians() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setNotice('');
    try {
      const user = await api('/users', { method: 'POST', body: { ...form, role: 'librarian' } });
      setNotice(`Bibliotecario «${user.username}» creado.`);
      setForm(EMPTY);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <PageHeader title="Dar de alta bibliotecario" description="Los bibliotecarios registran préstamos y devoluciones. Los administradores no se crean desde aquí." />
      <Alert error={error} success={notice} />
      <Panel as="form" onSubmit={submit}>
        <div className="grid">
          <Field label="Usuario"><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></Field>
          <Field label="Contraseña"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>
          <div className="actions"><button className="btn" type="submit">Crear</button></div>
        </div>
      </Panel>
    </>
  );
}
