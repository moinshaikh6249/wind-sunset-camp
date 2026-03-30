
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const nameParts = values.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const response = await api.post('/auth/signup', {
        firstName,
        lastName,
        email: values.email,
        phone: values.mobileNumber,
        password: values.password,
        confirmPassword: values.password,
      });

      // Store the token
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast({
        title: "Account Created!",
        description: "Welcome! Redirecting you to the dashboard...",
      });
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unexpected error occurred during sign up.";
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400 || status === 409) {
        errorMessage = data?.message || 'An account with this email already exists.';
      } else if (status === 422) {
        errorMessage = 'Please check your input and try again.';
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="bg-background/60 dark:bg-background/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="name"
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
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile No.</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="123-456-7890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please don't forget your password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full btn-glow"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-custom-green hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
