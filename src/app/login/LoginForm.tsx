
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      if (!response?.success || !response?.token) {
        throw new Error(response?.message || "Login failed");
      }

      // Store the token
      localStorage.setItem('token', response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      await refreshUser();

      toast({
        title: "Logged In Successfully!",
        description: "Welcome back!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401 || status === 400) {
        errorMessage = data?.message || 'Invalid email or password.';
      } else if (status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }

      toast({
        title: "Login Failed",
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full btn-glow"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-custom-green hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
