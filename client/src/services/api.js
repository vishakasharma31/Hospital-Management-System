/**
 * API Service layer with role-aware headers and fallback datasets
 */

const API_BASE = '/api';

export const fetchWithAuth = async (endpoint, options = {}, user) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (user) {
    headers['X-Demo-Role'] = user.role;
    headers['X-Demo-UserId'] = user.id;
    headers['X-Demo-Username'] = user.username;
    headers['X-Demo-Name'] = user.name;
  }

  const token = localStorage.getItem('mis_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
};
