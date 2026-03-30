"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { buildBookingWhatsappUrl } from "@/lib/whatsapp";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  campId: z.string({ required_error: "Please select a camp." }),
  numberOfPeople: z.coerce.number().min(1, "At least one person must be attending."),
});

type FormValues = z.infer<typeof formSchema>;

type Camp = {
    _id: string;
    id?: string;
    name: string;
  date?: string;
};

type UserProfile = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

function BookingFormComponent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialCamp = searchParams.get("campId") || searchParams.get("camp") || "";
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [upcomingCamps, setUpcomingCamps] = useState<Camp[]>([]);
  const [campsLoading, setCampsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.get('/auth/me');
          const userData = response.user || response;
          setUser(userData);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setCampsLoading(true);
        const response = await api.get('/camps');
        console.log("Camps API response:", response);

        const camps = Array.isArray(response)
          ? response
          : Array.isArray(response?.camps)
            ? response.camps
            : Array.isArray(response?.data)
              ? response.data
              : [];

        setUpcomingCamps(camps);
      } catch (error) {
        console.error('Failed to fetch camps:', error);
      } finally {
        setCampsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      campId: initialCamp,
      numberOfPeople: 1,
    },
  });

  useEffect(() => {
    if (user) {
      const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '';
      form.setValue('fullName', displayName);
      form.setValue('email', user.email || '');
      if (user.phone) {
        form.setValue('phone', user.phone);
      }
    }
  }, [user, form]);
  
  useEffect(() => {
    if (initialCamp) {
        form.setValue('campId', initialCamp);
    }
  }, [initialCamp, form]);

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a booking.",
        variant: "destructive",
      });
      return;
    }

    const camp = upcomingCamps.find(c => (c._id || c.id) === values.campId);
    if (!camp) {
      toast({ title: "Error", description: "Selected camp not found.", variant: "destructive" });
      return;
    }
      
    const bookingData = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      campId: values.campId,
      numberOfPeople: values.numberOfPeople,
    };

    try {
      const createBookingResponse = await api.post('/bookings', bookingData);
      const booking = createBookingResponse?.booking;

      if (!booking?._id) {
        throw new Error('Booking was created but booking ID is missing.');
      }

      const whatsappUrl = buildBookingWhatsappUrl({
        name: values.fullName,
        campName: camp.name,
        numberOfPeople: values.numberOfPeople,
        campDate: camp.date,
        phone: values.phone,
      });

      toast({
        title: 'Booking Confirmed',
        description: 'Booking confirmed. Please send the WhatsApp message to confirm your reservation.',
      });

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      router.push(
        `/booking-success?bookingId=${booking._id}&campName=${encodeURIComponent(camp.name)}&campDate=${encodeURIComponent(camp.date || 'To be confirmed')}&people=${values.numberOfPeople}&totalPrice=${encodeURIComponent(`₹${booking.totalPrice ?? 0}`)}&whatsappUrl=${encodeURIComponent(whatsappUrl)}`
      );

    } catch (error: any) {
      console.error("Booking creation failed:", error);
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || error.message || "An unexpected error occurred. Please check your permissions and try again.",
        variant: "destructive",
      });
    }
  }

  const isFormReady = !campsLoading;

  if (isUserLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const isReadonly = !!user;

  return (
    <Card>
       <CardHeader>
        <CardTitle className="font-headline text-2xl text-gradient">Booking Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Appleseed" {...field} readOnly={isReadonly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="jane@example.com" {...field} readOnly={isReadonly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your contact number" {...field} />
                  </FormControl>
                   <FormDescription>
                    We'll use this to contact you about your booking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="campId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which camp are you interested in?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a camp" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campsLoading ? (
                        <SelectItem value="loading" disabled>Loading camps...</SelectItem>
                      ) : upcomingCamps.length === 0 ? (
                        <SelectItem value="no-camps" disabled>No camps available</SelectItem>
                      ) : (
                        upcomingCamps.map((camp) => (
                          <SelectItem key={camp._id || camp.id} value={camp._id || camp.id || ''}>
                            {camp.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
              <p className="text-sm text-muted-foreground">Pay at Camp</p>
            </div>

            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of People</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting || !isFormReady}>
                {form.formState.isSubmitting
                  ? "Processing..."
                  : "Reserve Camp"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function BookingForm() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-96">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>}>
            <BookingFormComponent />
        </Suspense>
    )
}
