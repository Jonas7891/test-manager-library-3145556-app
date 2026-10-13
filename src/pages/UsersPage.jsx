import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Notice } from '../components/Common.jsx';

// HU-02 (solo admin): por la API solo se crean bibliotecarios.
export default function UsersPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setNotice('');
    try {
      const user = await api('/users', { method: 'POST', body: { ...form, role: 'librarian' } });
      setNotice(`Bibliotecario «${user.username}» creado.`);
      setForm({ username: '', password: '' });
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <h2>Dar de alta bibliotecario</h2>
      <ErrorBanner error={error} />
      <Notice text={notice} />
      <form className="card row" onSubmit={submit}>
        <label>Usuario<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        <button type="submit">Crear</button>
      </form>
    </>
  );
}
