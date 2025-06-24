'use client';

import React, { useState } from 'react';
import LoginModal from '@/components/login-modal';
import { useAuth } from '@/components/auth/auth-context';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (isAuthenticated) {
    return null;
  }

  return (
    <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  );
} 