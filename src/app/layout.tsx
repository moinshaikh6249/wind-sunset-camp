
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Poppins, Pacifico } from 'next/font/google';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppContent } from "./AppContent";
import { AuthProvider } from "@/context/AuthContext";
import { AnimationProvider } from "@/components/animations/AnimationProvider";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://sunset-camp-demo.web.app"),
  title: {
    default: "Wind & Sunset Camp – Best Camping Near Pawna Lake, Lonavala",
    template: `%s | Wind & Sunset Camp`,
  },
  description: "Experience luxury camping near Pawna Lake with Wind & Sunset Camp. Bonfire, tents, food & sunset views. Book your perfect getaway today.",
  keywords: ["pawna lake camping", "lonavala camping", "sunset camping", "tent stay pawna", "weekend camping near pune", "night camping lonavala"],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wind & Sunset Camp – Best Camping Near Pawna Lake, Lonavala",
    description: "Experience luxury camping near Pawna Lake with Wind & Sunset Camp. Bonfire, tents, food & sunset views. Book your perfect getaway today.",
    images: ['https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyfOclFDJ7lrz7J87beByt8hpTc9sap7JIxvwwLrAynzzbYKwjdKg5oBsMQ2n3xTR7yCHOHlg_NIU2DEwMGqQSDd5bQ4lyMXvQqcb222iB_Ncb8xXJLXGqc3X9hvvBcf3l4EdFNeZFkNgBM=w408-h306-k-no'],
  },
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Wind & Sunset Camp',
  image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyfOclFDJ7lrz7J87beByt8hpTc9sap7JIxvwwLrAynzzbYKwjdKg5oBsMQ2n3xTR7yCHOHlg_NIU2DEwMGqQSDd5bQ4lyMXvQqcb222iB_Ncb8xXJLXGqc3X9hvvBcf3l4EdFNeZFkNgBM=w408-h306-k-no',
  '@id': 'https://sunset-camp-demo.web.app',
  url: 'https://sunset-camp-demo.web.app',
  telephone: '8080334787',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Gevhande Jawan Shiv, Thankursai Ajivali Road, Pawana Nagar, Post',
    addressLocality: 'Gevhande Khadak',
    postalCode: '410506',
    addressRegion: 'MH',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 18.623101,
    longitude: 73.498934,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${pacifico.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <AnimationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="wind-sunset-theme"
            disableTransitionOnChange
          >
            <AuthProvider>
              <SidebarProvider defaultOpen={false}>
                <div className="flex min-h-screen w-full flex-1">
                  <AppSidebar />
                  <AppContent>
                    {children}
                  </AppContent>
                </div>
              </SidebarProvider>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
