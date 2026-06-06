const BASE_URL = '';

function getHeaders(includeAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('admin_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Request failed: ${res.status}`);
  }
  // Backend wraps all responses in { success, data, message }
  // Return the data property if it exists, otherwise the full response
  if (json && json.data !== undefined) {
    return json.data;
  }
  return json;
}

// ─── Site Content ────────────────────────────────────────
export async function fetchContent() {
  return request('/api/content');
}

export async function updateContent(data) {
  return request('/api/content', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

// ─── Events ──────────────────────────────────────────────
export async function fetchEvents() {
  return request('/api/events');
}

export async function updateEvents(data) {
  return request('/api/events', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function addEvent(data) {
  return request('/api/events', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id) {
  return request(`/api/events/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
}

// ─── Food Menu ───────────────────────────────────────────
export async function fetchMenu() {
  return request('/api/menu');
}

export async function updateMenu(data) {
  return request('/api/menu', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function addMenuItem(data) {
  return request('/api/menu', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id) {
  return request(`/api/menu/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
}

// ─── Media ───────────────────────────────────────────────
export async function fetchMedia() {
  return request('/api/media');
}

export async function updateMedia(data) {
  return request('/api/media', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function addMedia(data) {
  return request('/api/media', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteMedia(id) {
  return request(`/api/media/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
}

// ─── RSVP ────────────────────────────────────────────────
export async function submitRSVP(data) {
  return request('/api/rsvp', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export async function fetchRSVPs() {
  return request('/api/rsvp', {
    headers: getHeaders(true),
  });
}

export async function deleteRSVP(id) {
  return request(`/api/rsvp/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
}

export async function fetchRSVPStats() {
  return request('/api/rsvp/stats', {
    headers: getHeaders(true),
  });
}

// ─── Auth ────────────────────────────────────────────────
export async function adminLogin(password) {
  return request('/api/admin/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });
}

export async function verifyToken() {
  return request('/api/admin/verify', {
    headers: getHeaders(true),
  });
}

// ─── Gifts ───────────────────────────────────────────────
export async function fetchGifts() {
  return request('/api/gifts');
}

export async function addGift(data) {
  return request('/api/gifts', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function deleteGift(id) {
  return request(`/api/gifts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
}

// ─── Akshintalu ──────────────────────────────────────────
export async function incrementAkshintalu() {
  return request('/api/akshintalu', {
    method: 'POST',
    headers: getHeaders(),
  });
}

export async function getAkshintalu() {
  return request('/api/akshintalu');
}
