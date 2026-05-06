import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { clearAuthToken, isAuthenticated, subscribeAuthChanges } from './lib/auth';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(isAuthenticated());

  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setIsAdmin(isAuthenticated());
    });
    return unsubscribe;
  }, []);

  function handleLogout() {
    clearAuthToken();
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="top-nav">
          <div className="brand">
            <span className="brand-badge" />
            <div>
              <p className="brand-title">EventosTec</p>
              <p className="brand-subtitle">API Client</p>
            </div>
          </div>
          <nav className="nav-links">
            <NavLink to="/" end>
              Eventos
            </NavLink>
            {isAdmin ? <NavLink to="/eventos/novo">Novo Evento</NavLink> : null}
            {isAdmin ? (
              <button type="button" className="button ghost" onClick={handleLogout}>
                Sair
              </button>
            ) : (
              <NavLink to="/admin/login">Admin</NavLink>
            )}
          </nav>
        </header>
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/eventos/novo" element={<CreateEventPage />} />
            <Route path="/eventos/:eventId" element={<EventDetailsPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
