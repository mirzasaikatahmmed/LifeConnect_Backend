'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginContainer() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (email: string, password: string) => {
    setIsLoading(true);
    console.log('Login attempt:', { email, password });
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Login</h1>
      <LoginForm onSubmit={handleLogin} />
      {isLoading && <p>Signing in...</p>}
      <div>
        <Link href="/login/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
}