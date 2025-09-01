'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegisterForm from './RegisterForm';

export default function RegisterContainer() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    console.log('Register attempt:', { email, password });
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Register</h1>
      <RegisterForm onSubmit={handleRegister} />
      {isLoading && <p>Creating account...</p>}
      <div>
        <Link href="/login">Already have an account? Sign in</Link>
      </div>
    </div>
  );
}