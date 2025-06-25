"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/google-auth";
import { API_BASE } from "@/lib/auth";

export default function RegisterPage() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Client-only rendering to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!formData.agreeToTerms) {
      setError("Please accept the Terms & Conditions to continue");
      setLoading(false);
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Split name into first_name and last_name
      const nameParts = formData.name.trim().split(' ', 2);
      const first_name = nameParts[0];
      const last_name = nameParts[1] || '';

      const response = await fetch(`${API_BASE}/users/members/`, {
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
        setError(data.error || data.detail || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      
      setSuccess(true);
      
      // Store user data and tokens
      if (data.member && data.tokens) {
        localStorage.setItem("user", JSON.stringify(data.member));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
      }
      
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-blue-400 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-blue-400 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter Your Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autocomplete="name"
            />
          </div>

          <div>
            <Input
              type="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autocomplete="email"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
              autocomplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
              autocomplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleChange("agreeToTerms", !!checked)}
              className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the Terms & Conditions
            </label>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Registration successful! Redirecting...</div>}

          <Button
            type="submit"
            disabled={!formData.agreeToTerms || loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <GoogleAuthButton
            mode="signup"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Log in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 