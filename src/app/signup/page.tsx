
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl text-custom-green mb-4">
            Create an Account
          </h1>
          <p className="text-muted-foreground">
            Join our community of adventurers today!
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
