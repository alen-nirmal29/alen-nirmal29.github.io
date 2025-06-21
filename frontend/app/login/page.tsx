"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/auth/login-modal"

export default function LoginPage() {
  const [showLoginModal, setShowLoginModal] = useState(true)
  const router = useRouter()

  const handleCloseModal = () => {
    // If user closes the modal, redirect to home page
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {showLoginModal && (
        <LoginModal 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
} 