const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || 'Something went wrong. Please try again.');
  return data;
}

export const apiOrigin = API_ORIGIN.replace(/\/api$/, '');
