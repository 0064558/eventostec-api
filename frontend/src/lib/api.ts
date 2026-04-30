import type {
  CreateCouponInput,
  CreateEventInput,
  EventDetails,
  EventFilters,
  EventSummary,
} from '../types/api';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  '';

interface RawEventDetails {
  id?: string;
  ID?: string;
  title: string;
  description: string;
  date: string;
  city: string;
  uf: string;
  imgUrl: string;
  eventUrl: string;
  coupons: Array<{
    code: string;
    discount: number;
    validUntil: string;
  }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const hasFormDataBody = init?.body instanceof FormData;

  if (!hasFormDataBody && init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Falha ao processar a requisição.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function hasActiveFilters(filters: EventFilters): boolean {
  return Boolean(
    filters.title || filters.city || filters.uf || filters.startDate || filters.endDate,
  );
}

function normalizeEventDetails(rawEvent: RawEventDetails): EventDetails {
  return {
    id: rawEvent.id ?? rawEvent.ID ?? '',
    title: rawEvent.title,
    description: rawEvent.description,
    date: rawEvent.date,
    city: rawEvent.city,
    uf: rawEvent.uf,
    imgUrl: rawEvent.imgUrl,
    eventUrl: rawEvent.eventUrl,
    coupons: rawEvent.coupons ?? [],
  };
}

export async function fetchEvents(
  page: number,
  size: number,
  filters: EventFilters,
): Promise<EventSummary[]> {
  if (!hasActiveFilters(filters)) {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    return request<EventSummary[]>(`/api/events?${query.toString()}`);
  }

  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.title) {
    query.set('title', filters.title);
  }
  if (filters.city) {
    query.set('city', filters.city);
  }
  if (filters.uf) {
    query.set('uf', filters.uf);
  }
  if (filters.startDate) {
    query.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    query.set('endDate', filters.endDate);
  }

  return request<EventSummary[]>(`/api/events/filter?${query.toString()}`);
}

export async function fetchEventDetails(eventId: string): Promise<EventDetails> {
  const response = await request<RawEventDetails>(`/api/events/${eventId}`);
  return normalizeEventDetails(response);
}

export async function createEvent(input: CreateEventInput): Promise<EventSummary> {
  const payload = new FormData();
  payload.append('title', input.title);
  payload.append('description', input.description ?? '');
  payload.append('date', String(input.date));
  payload.append('city', input.city);
  payload.append('uf', input.uf.toUpperCase());
  payload.append('remote', String(input.remote));
  payload.append('eventUrl', input.eventUrl);
  if (input.image) {
    payload.append('image', input.image);
  }

  return request<EventSummary>('/api/events', {
    method: 'POST',
    body: payload,
  });
}

export async function createCoupon(
  eventId: string,
  input: CreateCouponInput,
): Promise<void> {
  await request(`/events/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
