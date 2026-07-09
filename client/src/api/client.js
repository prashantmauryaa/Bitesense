/**
 * Bite Sense — thin fetch wrapper.
 * Mirrors the original vanilla-JS api() helper exactly: same error shape
 * (throws Error(data.error || 'Something went wrong.')), same call signature.
 *
 * In production, VITE_API_URL points at the Render backend (e.g.
 * https://bitesense-1.onrender.com). In development it is empty and
 * the Vite dev-server proxy handles /api/* forwarding.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
