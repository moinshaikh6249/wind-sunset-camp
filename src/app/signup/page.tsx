
import { SignupForm } from './SignupForm';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Image
        src="https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwaW5rJTIwc3Vuc2V0fGVufDB8fHx8MTc1OTIxOTEzNXww&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Pink sunset background"
        fill
        className="object-cover"
        data-ai-hint="pink sunset"
      />
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
