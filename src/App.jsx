import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import MembersPage from './pages/MembersPage.jsx';
import NewLoanPage from './pages/NewLoanPage.jsx';
import LoansPage from './pages/LoansPage.jsx';
import OverduePage from './pages/OverduePage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// Menú por rol (spec §1): el admin ve todo; el bibliotecario no ve reporte ni usuarios.
const LINKS = [
  { to: '/books', label: 'Catálogo' },
  { to: '/members', label: 'Socios' },
  { to: '/loans/new', label: 'Prestar' },
  { to: '/loans', label: 'Préstamos', end: true },
  { to: '/overdue', label: 'Vencidos' },
  { to: '/report', label: 'Más prestados', admin: true },
  { to: '/users', label: 'Bibliotecarios', admin: true },
];

function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/books" replace />;
}

export default function App() {
  const { session, logout, isAdmin } = useAuth();
  if (!session) return <LoginPage />;

  return (
    <div className="layout">
      <header>
        <strong className="brand">Manager Library</strong>
        <nav>
          {LINKS.filter((l) => !l.admin || isAdmin).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <span className="who">
          {session.username} ({session.role === 'admin' ? 'administrador' : 'bibliotecario'})
          <button className="link" onClick={logout}>
            Salir
          </button>
        </span>
      </header>
      <main>
        <Routes>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/loans/new" element={<NewLoanPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/overdue" element={<OverduePage />} />
          <Route path="/report" element={<AdminOnly><ReportPage /></AdminOnly>} />
          <Route path="/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </main>
    </div>
  );
}
