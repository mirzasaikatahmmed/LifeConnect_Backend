'use client';

import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const handleForgotPassword = (email: string) => {
    console.log('Forgot password request for:', email);
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <ForgotPasswordForm onSubmit={handleForgotPassword} />
    </div>
  );
}