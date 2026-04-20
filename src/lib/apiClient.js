import { fetchAuthSession } from 'aws-amplify/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// Obtiene el idToken actual de Cognito para inyectarlo en cada request
async function getIdToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}

async function request(method, path, body) {
  const token = await getIdToken();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  // 401 → emitir evento global para que AuthContext fuerce el logout
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Sesión expirada. Por favor vuelve a iniciar sesión.');
  }

  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const errBody = await res.json();
      if (errBody.message) message = errBody.message;
    } catch { /* sin cuerpo JSON */ }
    throw new Error(message);
  }

  // 204 No Content no tiene cuerpo
  if (res.status === 204) return null;

  return res.json();
}

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPut = (path, body) => request('PUT', path, body);
export const apiDelete = (path) => request('DELETE', path);
