'use client';

import React, { useState } from 'react';
import LoginModal from '@/components/login-modal';

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  );
} 