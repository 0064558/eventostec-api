import { useDeferredValue, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { fetchEvents } from '../lib/api';
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
  const [isPending, startTransition] = useTransition();

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
        <p className="eyebrow">Comunidade tech em movimento</p>
        <h1>Descubra eventos, workshops e meetups sem perder o ritmo.</h1>
        <p>
          Navegue por eventos futuros, filtre por local e data, e acompanhe os
          cupons disponíveis em tempo real.
        </p>
        <div className="hero-actions">
          <Link className="button solid" to="/eventos/novo">
            Cadastrar novo evento
          </Link>
          <span className="hero-status">
            {isPending ? 'Atualizando filtros...' : 'Filtros ativos em tempo real'}
          </span>
        </div>
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
              placeholder="Ex: Java, AWS, React"
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
    </section>
  );
}
