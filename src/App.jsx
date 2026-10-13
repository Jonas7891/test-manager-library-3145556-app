import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import Shell from './ui/Shell.jsx';
import Login from './screens/Login.jsx';

const Catalog = lazy(() => import('./screens/Catalog.jsx'));
const Members = lazy(() => import('./screens/Members.jsx'));
const NewLoan = lazy(() => import('./screens/NewLoan.jsx'));
const Loans = lazy(() => import('./screens/Loans.jsx'));
const Overdue = lazy(() => import('./screens/Overdue.jsx'));
const Report = lazy(() => import('./screens/Report.jsx'));
const Librarians = lazy(() => import('./screens/Librarians.jsx'));

const LOADING = <p className="muted">Cargando…</p>;

function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/books" replace />;
}

export default function App() {
  const { session, logout, isAdmin } = useAuth();
  if (!session) return <Login />;

  return (
    <Shell session={session} isAdmin={isAdmin} onLogout={logout}>
      <Suspense fallback={LOADING}>
        <Routes>
          <Route path="/books" element={<Catalog />} />
          <Route path="/members" element={<Members />} />
          <Route path="/loans/new" element={<NewLoan />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/overdue" element={<Overdue />} />
          <Route path="/report" element={<AdminOnly><Report /></AdminOnly>} />
          <Route path="/users" element={<AdminOnly><Librarians /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
