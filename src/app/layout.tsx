
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
  metadataBase: new URL("https://sunset-camp-demo.web.app"),
  title: {
    default: "Wind & Sunset Camp – Best Camping Near Pawna Lake, Lonavala",
    template: `%s | Wind & Sunset Camp`,
  },
  description: "Experience luxury camping near Pawna Lake with Wind & Sunset Camp. Bonfire, tents, food & sunset views. Book your perfect getaway today.",
  keywords: ["pawna lake camping", "lonavala camping", "sunset camping", "tent stay pawna", "weekend camping near pune", "night camping lonavala"],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Wind & Sunset Camp – Best Camping Near Pawna Lake, Lonavala",
    description: "Experience luxury camping near Pawna Lake with Wind & Sunset Camp. Bonfire, tents, food & sunset views. Book your perfect getaway today.",
    url: "https://sunset-camp-demo.web.app",
    siteName: "Wind & Sunset Camp",
    images: [
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyfOclFDJ7lrz7J87beByt8hpTc9sap7JIxvwwLrAynzzbYKwjdKg5oBsMQ2n3xTR7yCHOHlg_NIU2DEwMGqQSDd5bQ4lyMXvQqcb222iB_Ncb8xXJLXGqc3X9hvvBcf3l4EdFNeZFkNgBM=w408-h306-k-no',
        width: 408,
        height: 306,
        alt: 'A view of the campsite at Wind & Sunset Camp',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wind & Sunset Camp – Best Camping Near Pawna Lake, Lonavala",
    description: "Experience luxury camping near Pawna Lake with Wind & Sunset Camp. Bonfire, tents, food & sunset views. Book your perfect getaway today.",
    images: ['https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyfOclFDJ7lrz7J87beByt8hpTc9sap7JIxvwwLrAynzzbYKwjdKg5oBsMQ2n3xTR7yCHOHlg_NIU2DEwMGqQSDd5bQ4lyMXvQqcb222iB_Ncb8xXJLXGqc3X9hvvBcf3l4EdFNeZFkNgBM=w408-h306-k-no'],
  },
};
