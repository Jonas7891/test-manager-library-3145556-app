import { Suspense, lazy } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
const BooksPage = lazy(() => import('./pages/BooksPage.jsx'));
const MembersPage = lazy(() => import('./pages/MembersPage.jsx'));
const NewLoanPage = lazy(() => import('./pages/NewLoanPage.jsx'));
const LoansPage = lazy(() => import('./pages/LoansPage.jsx'));
const OverduePage = lazy(() => import('./pages/OverduePage.jsx'));
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'));
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'));

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
const LINKS_BY_ROLE = { admin: LINKS, librarian: LINKS.filter((l) => !l.admin) };
const LOADING = <p className="muted">Cargando…</p>;

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
          {LINKS_BY_ROLE[isAdmin ? 'admin' : 'librarian'].map((l) => (
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
        <Suspense fallback={LOADING}>
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
        </Suspense>
      </main>
    </div>
  );
}
