"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { useAuth } from "./auth-context"
import { signInWithGoogle } from "@/lib/firebase"
import { API_BASE } from "@/lib/auth"

interface GoogleAuthButtonProps {
  mode: 'signup' | 'login'
  onSuccess?: (userData: any) => void
  onError?: (error: string) => void
}

export function GoogleAuthButton({ mode, onSuccess, onError }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // Use Firebase Google authentication
      const { user: firebaseUser, idToken } = await signInWithGoogle()
      
      // Validate required fields
      if (!firebaseUser.uid || !firebaseUser.email || !firebaseUser.displayName) {
        throw new Error('Missing required user information from Google')
      }
      
      const requestData = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Unknown User',
        picture: firebaseUser.photoURL || null,
        mode, // 'signup' or 'login'
        email_verified: true
      }
      
      const requestUrl = `${API_BASE}/auth/google/`
      console.log('API_BASE:', API_BASE)
      console.log('Request URL:', requestUrl)
      console.log('Sending Google auth request with data:', requestData)
      console.log('Request method: POST')
      console.log('Request headers:', {
        'Content-Type': 'application/json',
      })
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('Google auth response status:', response.status)
      console.log('Google auth response headers:', Object.fromEntries(response.headers.entries()))

      // Read response body only once and handle all cases
      let responseData
      const responseText = await response.text()
      
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Raw response text:', responseText)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`)
        } else {
          throw new Error('Invalid JSON response from server')
        }
      }

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${responseText}`)
      }

      console.log('Google auth success data:', responseData)

      if (responseData.user && responseData.tokens) {
        // Store tokens and user data using auth library
        auth.setTokens(responseData.tokens)
        auth.setUser(responseData.user)
        localStorage.setItem('isAuthenticated', 'true')
        
        // Update auth context
        login(responseData.user)
        
        // Call the success callback with user data
        onSuccess?.(responseData.user)
      } else {
        throw new Error('Invalid response from server - missing user or tokens')
      }

    } catch (error: any) {
      console.error("Google auth error:", error)
      onError?.(error.message || "Google authentication failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleGoogleAuth()
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
          Signing in...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </div>
      )}
    </Button>
  )
}
