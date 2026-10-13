import { NavLink } from 'react-router-dom';

// Menu per role (spec §1): the admin sees everything; the librarian sees neither the report nor users.
const LINKS = [
  { to: '/books', label: 'Catálogo', icon: '📚' },
  { to: '/members', label: 'Socios', icon: '🪪' },
  { to: '/loans/new', label: 'Prestar', icon: '➕' },
  { to: '/loans', label: 'Préstamos', icon: '🔁', end: true },
  { to: '/overdue', label: 'Vencidos', icon: '⏰' },
  { to: '/report', label: 'Más prestados', icon: '📈', admin: true },
  { to: '/users', label: 'Bibliotecarios', icon: '👤', admin: true },
];
const LINKS_BY_ROLE = { admin: LINKS, librarian: LINKS.filter((l) => !l.admin) };

export default function Shell({ session, isAdmin, onLogout, children }) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">
          Manager Library
          <small>Préstamos de la biblioteca</small>
        </div>
        <nav>
          {LINKS_BY_ROLE[isAdmin ? 'admin' : 'librarian'].map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <strong>{session.username}</strong>
          {isAdmin ? 'administrador' : 'bibliotecario'}
          <div>
            <button className="btn text" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
