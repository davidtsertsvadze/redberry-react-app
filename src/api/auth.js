const REDBERRY_API_BASE = 'https://api.redclass.redberryinternship.ge/api'

function getBaseUrl() {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '')
  if (envBase) return envBase
  if (import.meta.env.DEV) return '/api'
  return REDBERRY_API_BASE
}

/**
 * @param {unknown} json
 * @returns {{ message: string, fieldErrors: Record<string, string> }}
 */
export function parseAuthErrorResponse(json) {
  const message =
    typeof json?.message === 'string'
      ? json.message
      : 'Something went wrong. Please try again.'
  const rawErrors = json?.errors
  const fieldErrors = {}
  if (rawErrors && typeof rawErrors === 'object') {
    for (const key of Object.keys(rawErrors)) {
      const arr = rawErrors[key]
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        fieldErrors[key] = arr[0]
      }
    }
  }
  return { message, fieldErrors }
}

/**
 * @param {{ username: string, email: string, password: string, password_confirmation: string, avatar?: File | null }} payload
 */
export async function registerUser(payload) {
  const body = new FormData()
  body.append('username', payload.username)
  body.append('email', payload.email)
  body.append('password', payload.password)
  body.append('password_confirmation', payload.password_confirmation)
  if (payload.avatar) body.append('avatar', payload.avatar)

  const res = await fetch(`${getBaseUrl()}/register`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { message, fieldErrors } = parseAuthErrorResponse(json)
    const err = new Error(message)
    err.fieldErrors = fieldErrors
    err.status = res.status
    throw err
  }

  const data = json?.data
  if (!data?.token || !data?.user) {
    throw new Error('Unexpected response from server.')
  }
  return data
}

/**
 * @param {{ email: string, password: string }} credentials
 */
export async function loginUser(credentials) {
  const res = await fetch(`${getBaseUrl()}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { message, fieldErrors } = parseAuthErrorResponse(json)
    const err = new Error(message)
    err.fieldErrors = fieldErrors
    err.status = res.status
    throw err
  }

  const data = json?.data
  if (!data?.token || !data?.user) {
    throw new Error('Unexpected response from server.')
  }
  return data
}
