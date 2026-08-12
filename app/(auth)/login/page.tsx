import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — AI Font Generator',
  description: 'Access your AI Font Generator account.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-500 py-12">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
