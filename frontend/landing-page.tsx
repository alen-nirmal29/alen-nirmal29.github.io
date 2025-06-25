"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Timer, CheckSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert("Please accept the Terms & Conditions to continue")
      return
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      alert("Please fill in all fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    try {
      // Split name into first_name and last_name
      const nameParts = formData.name.trim().split(' ', 2);
      const first_name = nameParts[0];
      const last_name = nameParts[1] || '';

      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: first_name,
          last_name: last_name,
          email: formData.email.trim(),
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || data.detail || "Registration failed. Please try again.");
        return;
      }
      
      // Store user data and tokens
      if (data.member && data.tokens) {
        localStorage.setItem("user", JSON.stringify(data.member));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
      }
      
      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed. Please try again.");
    }
  }

  const handleGoogleSignup = async () => {
    try {
      console.log("Initiating Google signup...")

      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate successful Google authentication
      const mockGoogleUser = {
        id: "google_" + Date.now(),
        email: "user@gmail.com",
        name: "John Doe",
        picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      }

      // Store user data and redirect to dashboard
      localStorage.setItem("user", JSON.stringify(mockGoogleUser))
      localStorage.setItem("isAuthenticated", "true")

      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Google signup error:", error)
      alert("Failed to sign up with Google. Please try again.")
    }
  }

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  React.useEffect(() => {
    // Fallback: check localStorage directly in case context is stale
    const isAuth = typeof window !== 'undefined' && localStorage.getItem("isAuthenticated") === "true";
    if (isAuth) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-blue-400">
      {/* Simplified Header - No Navigation */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <Timer className="h-6 w-6 text-white" />
            <CheckSquare className="h-5 w-5 text-white" />
            <span className="text-white font-bold text-xl">ATB Tracker</span>
          </div>
        </div>

        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        {/* Left Side - Form */}
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Let's Create Your
            <br />
            Account!
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter Your Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-3 rounded-full border-0 bg-white/90 backdrop-blur-sm placeholder:text-gray-500 text-gray-800 focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
                autocomplete="name"
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 rounded-full border-0 bg-white/90 backdrop-blur-sm placeholder:text-gray-500 text-gray-800 focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
                autocomplete="email"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-full border-0 bg-white/90 backdrop-blur-sm placeholder:text-gray-500 text-gray-800 focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
                autocomplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                suppressHydrationWarning
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-full border-0 bg-white/90 backdrop-blur-sm placeholder:text-gray-500 text-gray-800 focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
                autocomplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                suppressHydrationWarning
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                className="border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                suppressHydrationWarning
              />
              <label htmlFor="terms" className="text-white text-sm">
                I agree to the Terms & Conditions
              </label>
            </div>

            <Button
              type="submit"
              disabled={!formData.agreeToTerms}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              Sign Up
            </Button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="px-4 text-white text-sm">or</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-colors duration-200 flex items-center justify-center border border-gray-300"
              suppressHydrationWarning
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
              Sign up with Google
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="text-white hover:text-blue-200 text-sm underline"
                suppressHydrationWarning
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block w-1/2">
          <div className="flex justify-center">
            <Image
              src="/images/productivity-illustration.png"
              alt="Productivity Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}
