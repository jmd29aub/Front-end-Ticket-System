export type UserRole = "client" | "support";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const BACKEND_BASE_URL = "http://localhost:8000";
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookieValue ? decodeURIComponent(cookieValue) : "";
}

async function getCsrfCookie() {
  const response = await fetch(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not initialize secure login.");
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  headers.set("Accept", "application/json");

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const xsrfToken = getCookie("XSRF-TOKEN");

    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

export async function apiJsonFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

  return apiFetch(path, {
    ...options,
    headers,
  });
}

export async function loginUser(email: string, password: string) {
  await getCsrfCookie();

  const response = await apiJsonFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = (await response.json()) as ApiResponse<AuthUser>;

  if (!response.ok || !result.data) {
    const validationErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";

    throw new Error(validationErrors || result.message || "Login failed.");
  }

  return result.data;
}

export async function getCurrentUser() {
  const response = await apiFetch("/me");

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as ApiResponse<AuthUser>;

  return result.data ?? null;
}

export async function logoutUser() {
  await apiJsonFetch("/logout", {
    method: "POST",
  });
}

export function getAuthHeaders() {
  return {
    Accept: "application/json",
  };
}

export function getJsonAuthHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}
