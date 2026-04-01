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
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loginMode, setLoginMode] = useState<"user" | "admin">("user");

  // ✅ SAFE URL PARAMS FIX
  let redirect = "/";
  let message: string | null = null;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    redirect = params.get("redirect") || "/";
    message = params.get("message");
  }

  const redirectTarget = redirect.startsWith("/") ? redirect : "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (adminToken) {
      router.replace("/admin/dashboard");
      return;
    }

    if (userToken) {
      router.replace(redirectTarget);
    }
  }, [router, redirectTarget]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (loginMode === "admin") {
        const adminRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        });

        const adminText = await adminRes.text();
        let response: any = {};
        try {
          response = adminText ? JSON.parse(adminText) : {};
        } catch {
          response = { error: 'Invalid JSON response' };
        }

        if (!adminRes.ok || !response?.token) {
          throw new Error(response?.message || response?.error || 'Invalid email or password');
        }

        localStorage.setItem("adminToken", response.token);
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");

        localStorage.setItem("user", JSON.stringify(response.admin));

        await refreshUser();

        toast({
          title: "Admin Login Successful!",
        });

        router.push("/admin/dashboard");
      } else {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        });

        const loginText = await loginRes.text();
        let response: any = {};
        try {
          response = loginText ? JSON.parse(loginText) : {};
        } catch {
          response = { error: 'Invalid JSON response' };
        }

        if (!loginRes.ok || !response?.token) {
          throw new Error(response?.message || response?.error || 'Invalid email or password');
        }

        localStorage.setItem("token", response.token);
        localStorage.setItem("authToken", response.token);
        localStorage.removeItem("adminToken");

        localStorage.setItem("user", JSON.stringify(response.user));

        await refreshUser();

        toast({
          title: "Logged In Successfully!",
        });

        router.push(redirectTarget);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setLoginMode("user")}>User</button>
          <button onClick={() => setLoginMode("admin")}>Admin</button>
        </div>

        {message && <p className="mb-2 text-sm">{message}</p>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={loginMode}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {loginMode === "admin" ? "Admin Login" : "Login"}
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>

        <p className="mt-4 text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}