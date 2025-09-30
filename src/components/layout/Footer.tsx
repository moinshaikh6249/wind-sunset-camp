
import Link from "next/link";
import { Logo } from "@/components/Logo";

const navLinks = [
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/camps", label: "Camps" },
    { href: "/contact", label: "Contact" },
    { href: "/booking", label: "Book Now" },
  ];

export function Footer() {
  return (
    <footer className="bg-[#FFF9F2] dark:bg-[#1C2B24] border-t border-accent dark:border-primary">
      <div className="container py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col items-start">
            <Logo />
            <p className="mt-2 text-sm text-[#5C5C5C] dark:text-[#CFCFCF]">
              Your adventure starts here.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <h3 className="font-bold text-[#4A2E0F] dark:text-[#FFF5E6] mb-2">Navigate</h3>
              <ul className="space-y-2">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-[#FF7F32] dark:hover:text-green-400 transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#4A2E0F] dark:text-[#FFF5E6] mb-2">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-[#FF7F32] dark:hover:text-green-400 transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-[#FF7F32] dark:hover:text-green-400 transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">
            &copy; {new Date().getFullYear()} Wind & Sunset Camp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
