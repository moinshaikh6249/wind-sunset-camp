
import type { Metadata } from 'next';
import ContactPageContent from './ContactPageContent';

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Wind & Sunset Camp for bookings and inquiries. Call, WhatsApp or visit us near Pawna Lake, Lonavala for the best camping experience.",
  openGraph: {
    title: "Contact Us | Wind & Sunset Camp",
    description: "Contact Wind & Sunset Camp for bookings and inquiries. Call, WhatsApp or visit us near Pawna Lake, Lonavala for the best camping experience.",
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
