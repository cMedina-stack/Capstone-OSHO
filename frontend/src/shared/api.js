import { clearSession } from "./session";
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && url !== "/api/auth/login") clearSession();
  return response;
}
