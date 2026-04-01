"use client";
export const dynamic = "force-dynamic";
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="absolute inset-0 hero-background" data-ai-hint="pink sunset" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl mb-4 text-white text-glow-white drop-shadow-lg">
            Welcome Back
          </h1>
          <p className="text-gray-200">
            Choose your role and sign in from one secure login panel.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
