
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl text-primary mb-4 text-gradient">
            User Login
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
