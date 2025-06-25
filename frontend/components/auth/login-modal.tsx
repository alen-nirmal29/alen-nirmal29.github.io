"use client"

import type React from "react"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GoogleAuthButton } from "./google-auth"
import { auth } from "@/lib/auth"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  onClose: (e?: React.MouseEvent) => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { login } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    setError("")

    try {
      const result = await auth.login(formData)
      login(result.user)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (userData: any) => {
    login(userData)
    router.push("/dashboard")
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose(e)
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose(e)
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Log in</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Provide your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={isLoading}
                autocomplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <GoogleAuthButton
                mode="login"
                onSuccess={handleGoogleSuccess}
                onError={(error) => {
                  console.error("Google login error:", error)
                  setError("Google login failed. Please try again.")
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
