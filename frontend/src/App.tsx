import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
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
            <NavLink to="/eventos/novo">Novo Evento</NavLink>
          </nav>
        </header>
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/eventos/novo" element={<CreateEventPage />} />
            <Route path="/eventos/:eventId" element={<EventDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
