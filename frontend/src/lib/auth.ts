const STORAGE_KEY = 'eventostec.admin.token';
const AUTH_EVENT = 'eventostec:auth';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function subscribeAuthChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(AUTH_EVENT, callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
  };
}
