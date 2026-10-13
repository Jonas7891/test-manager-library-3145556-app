// Cliente HTTP de la API (api-contract.md). Traduce el cuerpo de error único a ApiError.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'Error inesperado. Intenta de nuevo.');
    this.status = status;
    this.code = body?.code ?? 'UNKNOWN';
    this.details = body?.details ?? [];
  }
}

let token = null;
let onUnauthorized = () => {};

export function setToken(value) {
  token = value;
}

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

export async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, { code: 'NETWORK', message: 'No se pudo conectar con la API.' });
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data);
  }
  return data;
}

export function coverUrl(bookId) {
  return `${BASE}/books/${bookId}/cover`;
}

// Las portadas exigen token: se descargan como blob para pintarlas.
export async function fetchCover(bookId) {
  const res = await fetch(coverUrl(bookId), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  return URL.createObjectURL(await res.blob());
}
