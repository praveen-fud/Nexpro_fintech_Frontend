import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { flagSessionExpired, getAccessToken, notifySessionExpired, setAccessToken } from "./auth-token"

export interface ApiErrorPayload {
  message: string
  code?: string
  fieldErrors?: Record<string, string>
}

/** Normalized error thrown by the api client — never a raw Axios/HTTP error. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.status = status
    this.code = payload.code
    this.fieldErrors = payload.fieldErrors
  }
}

// In local dev the Vite proxy forwards /api/* to the backend, so a relative
// path works fine.  In production (Railway static site → separate backend
// service) VITE_API_URL must be set to the backend's public URL so the
// browser knows where to send requests.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1"

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required for the httpOnly refresh-token cookie
  timeout: 15_000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(`${API_BASE}/auth/refresh`, null, { withCredentials: true })
      .then((res) => res.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined

    // Credential endpoints never get a silent retry (a wrong password must not
    // trigger a refresh loop). /auth/heartbeat is a normal authenticated call.
    const isCredentialCall = /\/auth\/(login|refresh|logout|sign-up|verify-otp)/.test(originalRequest?.url ?? "")
    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isCredentialCall) {
      originalRequest._retried = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        setAccessToken(newToken)
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
      // The session is gone (idle timeout / absolute cap / revoked).
      flagSessionExpired()
      setAccessToken(null)
      notifySessionExpired()
    }

    const status = error.response?.status ?? 0
    const data = error.response?.data as Partial<ApiErrorPayload> | undefined

    if (!error.response) {
      throw new ApiError(0, { message: "Unable to reach Nexpro Paytech. Check your connection and try again." })
    }

    throw new ApiError(status, {
      message: data?.message ?? "Something went wrong while processing your request. Please try again.",
      code: data?.code,
      fieldErrors: data?.fieldErrors,
    })
  }
)
