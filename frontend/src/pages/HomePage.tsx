import { useDeferredValue, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { fetchEvents } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import type { EventFilters } from '../types/api';

const PAGE_SIZE = 9;

const initialFilters: EventFilters = {
  title: '',
  city: '',
  uf: '',
  startDate: '',
  endDate: '',
};

export function HomePage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const deferredFilters = useDeferredValue(filters);
  const [, startTransition] = useTransition();
  const isAdmin = isAuthenticated();

  const eventsQuery = useQuery({
    queryKey: ['events', page, deferredFilters],
    queryFn: () => fetchEvents(page, PAGE_SIZE, deferredFilters),
  });

  const events = eventsQuery.data ?? [];

  function updateFilter(field: keyof EventFilters, value: string) {
    startTransition(() => {
      setPage(0);
      setFilters((currentFilters) => ({
        ...currentFilters,
        [field]: value,
      }));
    });
  }

  function clearFilters() {
    startTransition(() => {
      setPage(0);
      setFilters(initialFilters);
    });
  }

  return (
    <section className="home-page">
      <div className="hero-panel">
        <span className="eyebrow">✨ O que tem pra hoje?</span>
        <h1 className='typewriter-title'>Explore, conecte-se e viva a experiência.</h1>
        <p>
          Workshops, meetups ou festas: encontre eventos em qualquer lugar do país.
          Use nossos filtros inteligentes para navegar por datas e cidades, e aproveite cupons de desconto antes que acabem.
        </p>
        <div className="hero-actions">
          {isAdmin ? (
            <Link className="button solid" to="/eventos/novo">
              Cadastrar novo evento
            </Link>
          ) : null}
        </div>
        {!isAdmin ? (
          /*<p className="admin-cta">
            É um administrador?{' '}
            <Link to="/admin/login">Faça login para gerenciar eventos</Link>.
          </p>*/
          null
        ) : null}
      </div>

      <section className="filters-panel">
        <div className="filters-head">
          <h2>Filtros</h2>
          <button className="button ghost" type="button" onClick={clearFilters}>
            Limpar
          </button>
        </div>
        <div className="filters-grid">
          <label>
            Título
            <input
              value={filters.title}
              onChange={(event) => updateFilter('title', event.target.value)}
              placeholder="Ex: Summit, Workshop..."
            />
          </label>
          <label>
            Cidade
            <input
              value={filters.city}
              onChange={(event) => updateFilter('city', event.target.value)}
              placeholder="Ex: São Paulo"
            />
          </label>
          <label>
            UF
            <input
              value={filters.uf}
              onChange={(event) => updateFilter('uf', event.target.value.toUpperCase())}
              placeholder="Ex: SP"
              maxLength={2}
            />
          </label>
          <label>
            Data inicial
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
            />
          </label>
          <label>
            Data final
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter('endDate', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="events-section">
        <div className="events-head">
          <h2>Eventos</h2>
          <p>Página {page + 1}</p>
        </div>

        {eventsQuery.isLoading ? (
          <p className="status-card">Carregando eventos...</p>
        ) : null}

        {eventsQuery.isError ? (
          <p className="status-card error">
            Não foi possível carregar os eventos. Verifique a conexão com a API.
          </p>
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && events.length === 0 ? (
          <p className="status-card">Nenhum evento encontrado com os filtros atuais.</p>
        ) : null}

        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="pagination">
          <button
            type="button"
            className="button ghost"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
            disabled={page === 0 || eventsQuery.isFetching}
          >
            Anterior
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={events.length < PAGE_SIZE || eventsQuery.isFetching}
          >
            Próxima
          </button>
        </div>
      </section>


      <footer className="main-footer">
        <div className="footer-content">
          <div className="brand-minimal">
            <div className="brand-badge-small"></div>
            <span className="brand-title">EVNT</span>
          </div>

          <div className="footer-info">
            <p>
              © 2026 — Desenvolvido por Rodrigo Alexandre
              {!isAdmin && (
                <>
                  <span className="footer-separator"> </span>
                  <Link to="/admin/login" className="admin-link-discrete">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                      <path d="M 25 3 C 18.364481 3 13 8.3644809 13 15 L 13 20 L 9 20 C 7.3545455 20 6 21.354545 6 23 L 6 47 C 6 48.645455 7.3545455 50 9 50 L 41 50 C 42.645455 50 44 48.645455 44 47 L 44 23 C 44 21.354545 42.645455 20 41 20 L 37 20 L 37 15 C 37 8.3644809 31.635519 3 25 3 z M 25 5 C 30.564481 5 35 9.4355191 35 15 L 35 20 L 15 20 L 15 15 C 15 9.4355191 19.435519 5 25 5 z M 9 22 L 13.832031 22 A 1.0001 1.0001 0 0 0 14.158203 22 L 35.832031 22 A 1.0001 1.0001 0 0 0 36.158203 22 L 41 22 C 41.554545 22 42 22.445455 42 23 L 42 47 C 42 47.554545 41.554545 48 41 48 L 9 48 C 8.4454545 48 8 47.554545 8 47 L 8 23 C 8 22.445455 8.4454545 22 9 22 z M 25 30 C 23.3 30 22 31.3 22 33 C 22 33.9 22.4 34.699219 23 35.199219 L 23 38 C 23 39.1 23.9 40 25 40 C 26.1 40 27 39.1 27 38 L 27 35.199219 C 27.6 34.699219 28 33.9 28 33 C 28 31.3 26.7 30 25 30 z"></path>
                    </svg>
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </footer>
    </section>

  );

}
