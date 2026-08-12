import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — AI Font Generator',
  description: 'Create your AI Font Generator account.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-500 py-12">Loading form...</div>}>
      <SignupForm />
    </Suspense>
  );
}
