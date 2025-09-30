
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle, Wand2 } from "lucide-react";

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
  campName: z.string({ required_error: "Please select a camp." }),
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

  const [isSuggesting, startSuggestionTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      campName: initialCamp,
      numberOfPeople: 1,
    },
  });

  const watchedCampName = form.watch("campName");
  const debouncedCampName = useDebounce(watchedCampName, 500);

  useEffect(() => {
    if (debouncedCampName) {
      startSuggestionTransition(async () => {
        const partialForm = { campName: debouncedCampName };
        const suggestions = await getCompletionSuggestions(partialForm);
        
        // The AI might suggest other fields based on the camp name
        // For this app, we're keeping it here for simple, but this is where you'd handle it.
        // e.g., if (suggestions.startDate) form.setValue('startDate', suggestions.startDate);
      });
    }
  }, [debouncedCampName, form]);

  async function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Booking Submitted!",
      description: `We've received your booking for ${values.campName}. Check your email for confirmation.`,
    });
    form.reset();
  }

  const handleSuggestion = () => {
    startSuggestionTransition(async () => {
        const partialForm: Record<string, string> = {};
        const currentValues = form.getValues();
        if(currentValues.campName) partialForm.campName = currentValues.campName;
        if(currentValues.email) partialForm.email = currentValues.email;
        if(currentValues.fullName) partialForm.fullName = currentValues.fullName;

        const suggestions = await getCompletionSuggestions(partialForm);

        for (const [key, value] of Object.entries(suggestions)) {
            if (key in form.getValues()) {
                form.setValue(key as keyof FormValues, value as any);
            }
        }
    });
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
                    <Input placeholder="Jane Appleseed" {...field} />
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
                    <Input placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="campName"
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
                        <SelectItem key={camp.id} value={camp.name}>
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
              <Button type="button" variant="outline" className="w-full btn-glow" onClick={handleSuggestion} disabled={isSuggesting}>
                {isSuggesting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Form Completion
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
