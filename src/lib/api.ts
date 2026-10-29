/** Klien API Aksara — sambungkan ke server Express */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function getToken(): string | null {
  try {
    return sessionStorage.getItem('aksara_api_token')
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem('aksara_api_token', token)
    else sessionStorage.removeItem('aksara_api_token')
  } catch {
    /* ignore */
  }
}

type ApiOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (opts.auth !== false) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
  }
  return data as T
}

export type EmailLogItem = {
  id: string
  recipientEmail: string
  subject: string
  type: string
  status: string
  errorMessage?: string | null
  sentAt?: string | null
  createdAt: string
  body?: string
}
