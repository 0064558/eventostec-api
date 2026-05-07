import type {
  CreateCouponInput,
  CreateEventInput,
  EventDetails,
  EventFilters,
  EventSummary,
  LoginRequest,
  LoginResponse,
  UpdateEventInput,
} from '../types/api';
import { getAuthToken } from './auth';

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
    id: string;
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

function getAuthHeaders(): HeadersInit | undefined {
  const token = getAuthToken();
  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
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
  if (input.city) {
    payload.append('city', input.city);
  }
  if (input.uf) {
    payload.append('uf', input.uf.toUpperCase());
  }
  payload.append('remote', String(input.remote));
  payload.append('eventUrl', input.eventUrl);
  if (input.image) {
    payload.append('image', input.image);
  }

  return request<EventSummary>('/api/events', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders(),
  });
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
): Promise<EventSummary> {
  const payload = new FormData();
  payload.append('title', input.title);
  payload.append('description', input.description);
  payload.append('date', String(input.date));
  if (input.city) {
    payload.append('city', input.city);
  }
  if (input.uf) {
    payload.append('uf', input.uf.toUpperCase());
  }
  payload.append('remote', String(input.remote));
  payload.append('eventUrl', input.eventUrl);
  if (input.image) {
    payload.append('image', input.image);
  }
  if (typeof input.removeImage === 'boolean') {
    payload.append('removeImage', String(input.removeImage));
  }

  return request<EventSummary>(`/api/events/${eventId}`, {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders(),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  await request(`/api/events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function createCoupon(
  eventId: string,
  input: CreateCouponInput,
): Promise<void> {
  await request(`/events/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: getAuthHeaders(),
  });
}

export async function updateCoupon(
  eventId: string,
  couponId: string,
  input: CreateCouponInput,
): Promise<void> {
  await request(`/events/${eventId}/coupons/${couponId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    headers: getAuthHeaders(),
  });
}

export async function deleteCoupon(eventId: string, couponId: string): Promise<void> {
  await request(`/events/${eventId}/coupons/${couponId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function loginAdmin(input: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
