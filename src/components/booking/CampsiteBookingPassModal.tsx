'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Tent,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildBookingWhatsappUrl } from '@/lib/whatsapp';

export interface BookingPassData {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  campName: string;
  numberOfPeople: number;
  totalPrice?: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: string;
  paidAt?: string;
  bookingDate?: string;
  createdAt?: string;
}

export interface CampPassDetails {
  date?: string;
  location?: string;
  imageUrl?: string;
}

interface CampsiteBookingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingPassData | null;
  campDetails?: CampPassDetails | null;
}

const statusConfig: Record<
  BookingPassData['status'],
  { label: string; icon: React.FC<any>; className: string }
> = {
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  },
  pending: {
    label: 'Pending Approval',
    icon: Clock,
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700',
  },
};

export const CampsiteBookingPassModal: React.FC<CampsiteBookingPassModalProps> = ({
  isOpen,
  onClose,
  booking,
  campDetails,
}) => {
  if (!booking) return null;

  const rawId = booking._id || booking.id || '000000';
  const bookingRef = `WSC-${rawId.slice(-6).toUpperCase()}`;
  const isPaid = booking.paymentStatus === 'paid';
  const currentStatus = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const handlePrint = () => {
    window.print();
  };

  const formattedBookingDate = booking.bookingDate || booking.createdAt
    ? format(new Date(booking.bookingDate || booking.createdAt || Date.now()), 'PPpp')
    : 'N/A';

  const formattedPaidAt = isPaid && booking.paidAt
    ? format(new Date(booking.paidAt), 'PPpp')
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background/95 dark:bg-card/95 backdrop-blur-xl border-amber-500/30 dark:border-amber-500/40 shadow-2xl rounded-3xl max-h-[92vh] flex flex-col no-print-dialog-wrapper">
        <DialogHeader className="sr-only">
          <DialogTitle>Campsite Booking Pass</DialogTitle>
          <DialogDescription>View and print your campsite booking pass</DialogDescription>
        </DialogHeader>

        {/* Modal Action Bar (Hidden during printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Tent className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm sm:text-base block leading-tight">
                Digital Campsite Pass
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {bookingRef}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md font-semibold text-xs gap-1.5 transition-all hover:scale-[1.02] h-9"
            >
              <a
                href={buildBookingWhatsappUrl({
                  name: booking.fullName,
                  campName: booking.campName,
                  numberOfPeople: booking.numberOfPeople,
                  campDate: campDetails?.date || 'To be confirmed',
                  phone: booking.phone,
                  bookingRef,
                  status: booking.status,
                  paymentStatus: booking.paymentStatus,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp Camp</span>
              </a>
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-md font-semibold text-xs gap-1.5 transition-all hover:scale-[1.02] h-9"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Pass</span>
            </Button>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Printable Pass Body (Apple Wallet Ticket Inspired) */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6 print-container" id="campsite-booking-pass-printable">
          {/* Header Hero Ticket Surface */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-amber-950 via-emerald-950 to-amber-900 text-amber-50 shadow-2xl border border-amber-500/30">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Tent className="w-48 h-48 text-amber-400" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-headline text-lg sm:text-xl font-bold tracking-wider">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  WIND & SUNSET CAMP PAWNA
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline">
                  {booking.campName}
                </h2>
                <p className="text-amber-200/90 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {campDetails?.location || 'Waterfront Campsite, Pawna Lake, Lonavala'}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/50 font-mono text-xs py-1.5 px-4 rounded-xl shadow-md">
                  {bookingRef}
                </Badge>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  Issued: {formattedBookingDate}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Guest Info & QR Check-in Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer / Guest Card */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card/80 p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border/40 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" /> Guest Information
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">ID: {rawId.slice(0, 8)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Primary Guest</span>
                  <span className="font-bold text-foreground text-base block">{booking.fullName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Total Reserved Guests</span>
                  <span className="font-bold text-foreground inline-flex items-center gap-1">
                    <Users className="h-4 w-4 text-amber-500" />
                    {booking.numberOfPeople} Person(s)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Email Address</span>
                  <span className="font-medium text-foreground truncate block font-mono text-xs">{booking.email}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Phone Number</span>
                  <span className="font-medium text-foreground block">{booking.phone}</span>
                </div>
              </div>
            </div>

            {/* Reception Express QR Code Section */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2 bg-white rounded-2xl shadow-md border border-amber-500/20">
                <svg className="w-24 h-24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="29" height="29" fill="white" />
                  <rect x="2" y="2" width="7" height="7" fill="#1e293b" />
                  <rect x="3" y="3" width="5" height="5" fill="white" />
                  <rect x="4" y="4" width="3" height="3" fill="#1e293b" />
                  <rect x="20" y="2" width="7" height="7" fill="#1e293b" />
                  <rect x="21" y="3" width="5" height="5" fill="white" />
                  <rect x="22" y="4" width="3" height="3" fill="#1e293b" />
                  <rect x="2" y="20" width="7" height="7" fill="#1e293b" />
                  <rect x="3" y="21" width="5" height="5" fill="white" />
                  <rect x="4" y="22" width="3" height="3" fill="#1e293b" />
                  <rect x="11" y="2" width="2" height="2" fill="#1e293b" />
                  <rect x="15" y="2" width="3" height="2" fill="#1e293b" />
                  <rect x="10" y="6" width="2" height="3" fill="#1e293b" />
                  <rect x="14" y="6" width="4" height="2" fill="#1e293b" />
                  <rect x="2" y="11" width="2" height="3" fill="#1e293b" />
                  <rect x="6" y="11" width="3" height="2" fill="#1e293b" />
                  <rect x="11" y="11" width="3" height="3" fill="#d97706" />
                  <rect x="16" y="11" width="2" height="4" fill="#1e293b" />
                  <rect x="20" y="11" width="3" height="2" fill="#1e293b" />
                  <rect x="25" y="11" width="2" height="3" fill="#1e293b" />
                  <rect x="10" y="16" width="4" height="2" fill="#1e293b" />
                  <rect x="16" y="17" width="3" height="3" fill="#d97706" />
                  <rect x="21" y="16" width="4" height="2" fill="#1e293b" />
                  <rect x="11" y="20" width="2" height="4" fill="#1e293b" />
                  <rect x="15" y="22" width="4" height="2" fill="#1e293b" />
                  <rect x="21" y="21" width="3" height="4" fill="#1e293b" />
                  <rect x="25" y="22" width="2" height="3" fill="#1e293b" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-300 block">
                  Express Check-In QR
                </span>
                <span className="text-[10px] text-muted-foreground block leading-tight">
                  Present at Pawna reception desk
                </span>
              </div>
            </div>
          </div>

          {/* Camp Reservation Details Card */}
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <Tent className="h-4 w-4" />
              Reservation & Schedule Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-0.5">Camp Name</span>
                <span className="font-headline font-bold text-base text-foreground block truncate">
                  {booking.campName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-0.5 inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" /> Location
                </span>
                <span className="font-medium text-foreground block">
                  {campDetails?.location || 'Pawna Lake Campsite'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-0.5 inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" /> Stay Date
                </span>
                <span className="font-semibold text-foreground block">
                  {campDetails?.date || 'Confirmed Reservation Date'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-0.5 inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-500" /> Guests
                </span>
                <span className="font-semibold text-foreground block">
                  {booking.numberOfPeople} Person(s)
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Receipt Summary Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card/90 to-amber-500/10 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Receipt Details
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Official Receipt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-1">Total Booking Amount</span>
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 inline-flex items-center">
                  <IndianRupee className="h-5 w-5 mr-0.5" />
                  {(booking.totalPrice ?? 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-1">Payment Method</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700 py-1 px-3 font-semibold">
                  Pay at Campsite
                </Badge>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold block mb-1">Payment Status</span>
                {isPaid ? (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 py-1 px-3 font-semibold inline-flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Paid — Cash Received
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700 py-1 px-3 font-semibold inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Pending — Pay at Campsite
                  </Badge>
                )}
              </div>
            </div>

            {/* Paid At Timestamp */}
            {isPaid && formattedPaidAt ? (
              <div className="pt-2 border-t border-amber-500/20 text-xs flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Cash Payment Verified & Processed
                </span>
                <span className="font-mono">Paid At: {formattedPaidAt}</span>
              </div>
            ) : null}
          </div>

          {/* Important Rules & Instructions */}
          <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">
              Campsite Entry Guidelines
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Present this Booking Pass (digital or printed) at Pawna basecamp check-in counter.</li>
              <li>Remaining amount must be settled in cash at check-in if payment status is Pending.</li>
              <li>Standard Check-in: 04:00 PM | Check-out: 11:00 AM.</li>
              <li>For urgent inquiries, contact Wind & Sunset Camp Operations: +91 98765 43210.</li>
            </ul>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
            <span>Wind & Sunset Camp — Official Booking Pass</span>
            <span className="font-mono">Reference: {bookingRef}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
