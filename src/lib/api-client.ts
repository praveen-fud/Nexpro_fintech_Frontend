import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, setAccessToken } from "./auth-token"

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

export const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
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

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>("/api/v1/auth/refresh", null, { withCredentials: true })
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

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !originalRequest.url?.includes("/auth/")) {
      originalRequest._retried = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        setAccessToken(newToken)
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
      setAccessToken(null)
    }

    const status = error.response?.status ?? 0
    const data = error.response?.data as Partial<ApiErrorPayload> | undefined

    if (!error.response) {
      throw new ApiError(0, { message: "Unable to reach Nexpro Fintech. Check your connection and try again." })
    }

    throw new ApiError(status, {
      message: data?.message ?? "Something went wrong while processing your request. Please try again.",
      code: data?.code,
      fieldErrors: data?.fieldErrors,
    })
  }
)
