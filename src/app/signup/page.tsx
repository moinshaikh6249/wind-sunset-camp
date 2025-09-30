
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="absolute inset-0 hero-background" data-ai-hint="pink sunset" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl text-white text-glow-white mb-4 drop-shadow-lg">
            Create an Account
          </h1>
          <p className="text-gray-200">
            Join our community of adventurers today!
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
