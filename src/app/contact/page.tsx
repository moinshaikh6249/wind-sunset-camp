import type { Metadata } from 'next';
import ContactPageContent from './ContactPageContent';

export const metadata: Metadata = {
  title: "Contact Wind & Sunset Camp – Pawna Lake Camping",
  description: "Contact Wind & Sunset Camp for bookings and inquiries. Call, WhatsApp or visit us near Pawna Lake, Lonavala for the best camping experience.",
  openGraph: {
    title: "Contact Wind & Sunset Camp – Pawna Lake Camping",
    description: "Contact Wind & Sunset Camp for bookings and inquiries. Call, WhatsApp or visit us near Pawna Lake, Lonavala for the best camping experience.",
  }
};

export default function ContactPage() {
  return <ContactPageContent />;
}
