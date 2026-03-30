
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
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function AdminLoginForm() {
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api.post('/admin/login', {
        email: values.email,
        password: values.password,
      });

      if (!response?.success || !response?.token) {
        throw new Error(response?.message || 'Login failed');
      }

      const admin = response.admin
        ? { ...response.admin, role: response.admin.role || 'admin' }
        : null;

      // Persist auth token for subsequent requests
      localStorage.setItem('adminToken', response.token);
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      if (!admin) {
        localStorage.removeItem('adminToken');
        throw new Error('Invalid admin response');
      }

      localStorage.setItem('user', JSON.stringify(admin));

      void refreshUser();

      toast({
        title: "Admin Login Successful!",
        description: "Welcome back, administrator!",
      });
      router.push("/admin/dashboard");
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401 || status === 400 || status === 404) {
        errorMessage = data?.message || 'Invalid email or password.';
      } else if (status === 500) {
        errorMessage = data?.message || 'Server error';
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
                      placeholder="admin@example.com"
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
              {form.formState.isSubmitting ? "Logging in..." : "Login as Admin"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not an admin?{" "}
          <Link href="/login" className="font-semibold text-custom-green hover:underline">
            User Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
