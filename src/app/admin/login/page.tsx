
import { AdminLoginForm } from './LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 hero-background" data-ai-hint="forest path" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
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
