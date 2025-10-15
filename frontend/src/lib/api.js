// src/lib/api.js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Generic fetch wrapper
export async function api(path, { method = "GET", body, token, headers } = {}) {
  const h = { ...(headers || {}) };

  // Only set JSON header when NOT sending FormData
  const isForm = body instanceof FormData;
  if (!isForm) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: h,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.msg || data.error || "Request failed");
  }
  return data;
}
