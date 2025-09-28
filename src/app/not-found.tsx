import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 text-center flex flex-col items-center justify-center min-h-[calc(100vh-14rem)]">
      <Compass className="h-24 w-24 text-primary/30 mb-8" />
      <h1 className="font-headline text-4xl md:text-6xl text-primary mb-4">404 - Lost in the Woods</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-lg">
        It seems you&apos;ve wandered off the beaten path. Don&apos;t worry, we can guide you back to camp.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
