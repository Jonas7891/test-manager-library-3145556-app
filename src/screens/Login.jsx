import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Field } from '../ui/index.jsx';

// HU-01
export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <section className="hero">
        <h1>Manager Library</h1>
        <p>Catálogo, socios, préstamos y devoluciones de la biblioteca en un solo lugar.</p>
      </section>
      <form onSubmit={submit}>
        <div>
          <h2>Iniciar sesión</h2>
          <p className="muted">Entra con tu usuario para operar según tu rol.</p>
        </div>
        <Alert error={error} />
        <Field label="Usuario">
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
        </Field>
        <Field label="Contraseña">
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </Field>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
