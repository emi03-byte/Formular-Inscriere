import type { FormPayload } from '../types'

export type SavedChild = {
  id: number
  fullName: string
  age: number
}

export type SavedSubmission = {
  id: number
  parentFullName: string
  parentEmail: string
  parentPhone: string | null
  createdAt: string
  children: SavedChild[]
}

const ADMIN_TOKEN_KEY = 'adminToken'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function submitEnrollment(
  payload: FormPayload,
): Promise<{ id: number; createdAt: string }> {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Nu s-a putut salva înscrierea.')
  }
  return data
}

export async function fetchSubmissions(
  adminPassword: string,
): Promise<SavedSubmission[]> {
  const response = await fetch('/api/submissions', {
    headers: { Authorization: `Bearer ${adminPassword}` },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Nu s-au putut încărca înscrierile.')
  }
  return data
}
