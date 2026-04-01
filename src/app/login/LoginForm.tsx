
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [loginMode, setLoginMode] = useState<"user" | "admin">("user");
  const redirect = searchParams.get("redirect") || "/";
  const message = searchParams.get("message");

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
    const userToken = localStorage.getItem("token") || localStorage.getItem("authToken");

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
        const response = await api.post('/admin/login', {
          email: values.email,
          password: values.password,
        });

        if (!response?.success || !response?.token) {
          throw new Error(response?.message || "Admin login failed");
        }

        const admin = response.admin
          ? { ...response.admin, role: response.admin.role || "admin" }
          : null;

        localStorage.setItem("adminToken", response.token);
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");

        if (!admin) {
          localStorage.removeItem("adminToken");
          throw new Error("Invalid admin response");
        }

        localStorage.setItem("user", JSON.stringify(admin));

        await refreshUser();

        toast({
          title: "Admin Login Successful!",
          description: "Welcome back, administrator.",
        });

        router.push("/admin/dashboard");
      } else {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        });

        if (!response?.success || !response?.token) {
          throw new Error(response?.message || "Login failed");
        }

        localStorage.setItem("token", response.token);
        localStorage.setItem("authToken", response.token);
        localStorage.removeItem("adminToken");
        const normalizedUser = response.user
          ? { ...response.user, role: response.user.role || "user" }
          : null;

        if (!normalizedUser) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          throw new Error("Invalid user response");
        }

        localStorage.setItem("user", JSON.stringify(normalizedUser));

        await refreshUser();

        toast({
          title: "Logged In Successfully!",
          description: "Welcome back!",
        });
        router.push(redirectTarget);
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401 || status === 400 || status === 404) {
        errorMessage = data?.message || 'Invalid email or password.';
      } else if (status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (status === 500) {
        errorMessage = data?.message || 'Server error. Please try again.';
      }

      toast({
        title: loginMode === "admin" ? "Admin Login Failed" : "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="border-white/30 bg-background/60 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.65)] backdrop-blur-md dark:border-white/10 dark:bg-background/80">
      <CardContent className="p-6">
        <div className="mb-5 rounded-xl border border-white/35 bg-white/60 p-1 dark:border-white/10 dark:bg-slate-900/50">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setLoginMode("user")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                loginMode === "user"
                  ? "bg-[#2f5d50] text-white shadow-[0_0_20px_rgba(47,93,80,0.45)]"
                  : "text-[#2f5d50] hover:bg-white/75 dark:text-slate-200 dark:hover:bg-slate-800/70"
              }`}
              aria-pressed={loginMode === "user"}
            >
              <span className="mr-1.5" aria-hidden="true">👤</span>
              User Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("admin")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                loginMode === "admin"
                  ? "bg-[#b45309] text-white shadow-[0_0_20px_rgba(180,83,9,0.4)]"
                  : "text-[#7c3d0a] hover:bg-white/75 dark:text-amber-200 dark:hover:bg-slate-800/70"
              }`}
              aria-pressed={loginMode === "admin"}
            >
              <span className="mr-1.5" aria-hidden="true">🛠️</span>
              Admin Login
            </button>
          </div>
        </div>

        {loginMode === "admin" ? (
          <p className="mb-4 text-center text-xs font-medium tracking-[0.08em] text-amber-700 dark:text-amber-300">
            Admin access restricted
          </p>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/30 dark:text-amber-200">
            {message}
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={loginMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={loginMode === "admin" ? "admin@example.com" : "you@example.com"}
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
                  {form.formState.isSubmitting
                    ? "Logging in..."
                    : loginMode === "admin"
                      ? "Admin Login"
                      : "Login"}
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>
        {loginMode === "user" ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-custom-green hover:underline">
              Sign up
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
