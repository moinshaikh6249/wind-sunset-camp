
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from './LoginForm';

export default function AdminLoginPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.replace('/admin/dashboard');
    }

    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth) {
    return null;
  }

  return (
    <div className="relative grid min-h-[100dvh] w-full place-items-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 hero-background" data-ai-hint="forest path" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl mb-4 text-white text-glow-white drop-shadow-lg">
            Admin Login
          </h1>
          <p className="text-gray-200">
            Enter your administrator credentials to access the dashboard.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
