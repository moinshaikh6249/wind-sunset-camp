
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle, Wand2 } from "lucide-react";
import { useUser, useDatabase } from "@/firebase";
import { useRouter } from "next/navigation";
import { ref, push, set } from "firebase/database";


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
import { upcomingCamps } from "@/lib/mock-data";
import { getCompletionSuggestions } from "./actions";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  campId: z.string({ required_error: "Please select a camp." }),
  numberOfPeople: z.coerce.number().min(1, "At least one person must be attending."),
});

type FormValues = z.infer<typeof formSchema>;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function BookingFormComponent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialCamp = searchParams.get("camp") || "";
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const database = useDatabase();

  const [isSuggesting, startSuggestionTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      campId: initialCamp,
      numberOfPeople: 1,
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to book a camp.",
        variant: "destructive",
      });
      router.push('/login');
    } else if (user) {
      form.setValue('fullName', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [user, isUserLoading, router, toast, form]);


  const watchedCampId = form.watch("campId");
  const debouncedCampId = useDebounce(watchedCampId, 500);

  useEffect(() => {
    if (debouncedCampId) {
      const camp = upcomingCamps.find(c => c.id === debouncedCampId);
      if (camp) {
        startSuggestionTransition(async () => {
            const partialForm = { campName: camp.name };
            await getCompletionSuggestions(partialForm);
        });
      }
    }
  }, [debouncedCampId]);

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to submit a booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const camp = upcomingCamps.find(c => c.id === values.campId);
      if (!camp) {
        throw new Error("Selected camp not found.");
      }
      
      const bookingData = {
        userId: user.uid,
        campId: values.campId,
        campName: camp.name,
        numberOfPeople: values.numberOfPeople,
        bookingDate: new Date().toISOString(),
      };

      // Get a reference to the user's bookings list
      const bookingsRef = ref(database, `users/${user.uid}/bookings`);
      // Create a new child with a unique key
      const newBookingRef = push(bookingsRef);
      // Set the data for the new booking
      await set(newBookingRef, bookingData);

      const historyRef = ref(database, `users/${user.uid}/history`);
      const newHistoryRef = push(historyRef);
      await set(newHistoryRef, {
        type: 'booking',
        description: `Booked ${camp.name}`,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Booking Submitted!",
        description: `We've received your booking for ${camp.name}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }
  

  const handleSuggestion = () => {
    startSuggestionTransition(async () => {
        const partialForm: Record<string, string> = {};
        const currentValues = form.getValues();

        const camp = upcomingCamps.find(c => c.id === currentValues.campId);
        if(camp) partialForm.campName = camp.name;

        if(currentValues.email) partialForm.email = currentValues.email;
        if(currentValues.fullName) partialForm.fullName = currentValues.fullName;

        const suggestions = await getCompletionSuggestions(partialForm);

        for (const [key, value] of Object.entries(suggestions)) {
            if (key in form.getValues() && key !== 'campId' && key !== 'campName') {
                form.setValue(key as keyof FormValues, value as any);
            }
        }
    });
  }

  if (isUserLoading || !user) {
    return (
        <div className="flex justify-center items-center h-96">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Appleseed" {...field} readOnly />
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
                    <Input placeholder="jane@example.com" {...field} readOnly />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a camp" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {upcomingCamps.map((camp) => (
                        <SelectItem key={camp.id} value={camp.id}>
                          {camp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a camp to see AI suggestions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button type="button" variant="outline" className="w-full" onClick={handleSuggestion} disabled={isSuggesting}>
                {isSuggesting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Details
              </Button>
              <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Booking"}
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
        <Suspense fallback={<div>Loading form...</div>}>
            <BookingFormComponent />
        </Suspense>
    )
}
