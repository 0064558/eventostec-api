import { Link } from 'react-router-dom';
import { formatDateOnly } from '../lib/date';
import type { EventSummary } from '../types/api';

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  const displayLocation =
    event.remote || !event.city
      ? 'Remoto'
      : `${event.city}${event.uf ? `, ${event.uf}` : ''}`;

  return (
    <article className="event-card">
      <div className="event-cover-wrapper">
        {event.imgUrl ? (
          <img className="event-cover" src={event.imgUrl} alt={event.title} />
        ) : (
          <div className="event-cover fallback-cover">
            <span>{event.remote ? 'Evento Online' : 'Evento Presencial'}</span>
          </div>
        )}
        <span className="event-badge">{event.remote ? 'Remoto' : 'Presencial'}</span>
      </div>

      <div className="event-card-content">
        <p className="event-date">{formatDateOnly(event.date)}</p>
        <h3>{event.title}</h3>
        <p className="event-location">{displayLocation}</p>
        <p className="event-description">{event.description || 'Sem descrição.'}</p>
      </div>

      <div className="event-card-actions">
        <Link className="button ghost" to={`/eventos/${event.id}`}>
          Ver detalhes
        </Link>
        <a className="button solid" href={event.eventUrl} target="_blank" rel="noreferrer">
          Abrir evento
        </a>
      </div>
    </article>
  );
}
