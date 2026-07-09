/**
 * Bite Sense — thin fetch wrapper.
 * Mirrors the original vanilla-JS api() helper exactly: same error shape
 * (throws Error(data.error || 'Something went wrong.')), same call signature.
 */
export async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
