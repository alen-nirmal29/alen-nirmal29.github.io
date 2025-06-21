"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated, 'isLoading =', isLoading);
    
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: Redirecting to', redirectTo);
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-300 to-blue-400">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
