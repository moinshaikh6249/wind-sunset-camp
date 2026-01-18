
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Poppins, Pacifico } from 'next/font/google';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppContent } from "./AppContent";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '700'],
});

const pacifico = Pacifico({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
  weight: '400',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${pacifico.variable}`}>
      <head>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SidebarProvider defaultOpen={false}>
              <div className="flex flex-1">
                <AppSidebar />
                <AppContent>
                  {children}
                </AppContent>
              </div>
            </SidebarProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Wind & Sunset Camp | Adventure Under the Open Sky",
  description: "Your next adventure awaits at Wind & Sunset Camp. Join us for an unforgettable experience with nature. Explore our camps, view our gallery, and book your trip today.",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Wind & Sunset Camp | Adventure Under the Open Sky",
    description: "Join us at Wind & Sunset Camp for an adventure that renews your spirit. Explore our camps, view our gallery, and book your trip today.",
    url: "https://sunset-camp-demo.web.app", 
    siteName: "Wind & Sunset Camp",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1476610182048-b716b8518a2a?w=1200',
        width: 1200,
        height: 630,
        alt: 'A beautiful sunset over a lake at Wind & Sunset Camp.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wind & Sunset Camp | Adventure Under the Open Sky",
    description: "Join us at Wind & Sunset Camp for an adventure that renews your spirit.",
    images: ['https://images.unsplash.com/photo-1476610182048-b716b8518a2a?w=1200'],
  },
};
