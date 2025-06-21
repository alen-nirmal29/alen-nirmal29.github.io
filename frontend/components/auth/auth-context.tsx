"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { auth, User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  verifyToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const verifyToken = async (): Promise<boolean> => {
    try {
      const tokens = auth.getTokens()
      if (!tokens?.access) return false

      // Try to refresh token if needed
      try {
        await auth.refreshToken()
      } catch (error) {
        // Token refresh failed, user needs to login again
        auth.logout()
        return false
      }

      const currentUser = auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error("Token verification error:", error)
      auth.logout()
      return false
    }
  }

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = async () => {
      try {
        const isAuth = auth.isAuthenticated()
        if (isAuth) {
          const currentUser = auth.getUser()
          if (currentUser) {
            setUser(currentUser)
            setIsAuthenticated(true)
          } else {
            // Try to verify token
            await verifyToken()
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        auth.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    auth.logout()
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading, verifyToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
