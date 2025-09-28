import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors"
    >
      Sunset Camp
    </Link>
  );
}
