import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import { onSessionExpired, setAccessToken } from "@/lib/auth-token"
import type { User } from "@/types/domain"

interface LoginPayload {
  identifier: string
  password: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
  /** Drop the session locally (no API call) — used when another tab or the
   * server has already ended it. */
  endSession: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    try {
      const refreshRes = await apiClient.post<{ accessToken: string }>("/auth/refresh")
      setAccessToken(refreshRes.data.accessToken)
      const meRes = await apiClient.get<User>("/users/me")
      setUser(meRes.data)
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiClient.post<{ accessToken: string; user: User }>("/auth/login", payload)
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout")
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const endSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  // Server ended the session and a silent refresh could not rescue it.
  useEffect(() => onSessionExpired(endSession), [endSession])

  const refreshUser = useCallback(async () => {
    const meRes = await apiClient.get<User>("/users/me")
    setUser(meRes.data)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout, endSession, refreshUser }),
    [user, isLoading, login, logout, endSession, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
