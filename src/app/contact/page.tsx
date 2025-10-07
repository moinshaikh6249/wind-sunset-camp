
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, MapPin, Phone, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useUser, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, push, set, update } from "firebase/database";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type Message = {
  id: string;
  subject: string;
  timestamp: string;
  read: boolean;
};

export default function ContactPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const database = useDatabase();

  const userMessagesRef = useMemoFirebase(() => {
    if (!user) return null;
    return ref(database, `users/${user.uid}/messages`);
  }, [user, database]);

  const { data: messagesData, isLoading: messagesLoading } = useDatabaseValue<{[id: string]: Omit<Message, 'id'>}>(userMessagesRef);

  const sentMessages = useMemo(() => {
    if (!messagesData) return [];
    return Object.entries(messagesData)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messagesData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.displayName || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!database || !user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to send a message.",
            variant: "destructive",
        });
        return;
    }
    try {
        const messageId = push(ref(database)).key;
        if (!messageId) throw new Error("Could not create message ID.");

        const timestamp = new Date().toISOString();
        const messageData = {
          ...values,
          timestamp,
          read: false,
          userId: user.uid,
          messageId,
        };
        
        const updates: {[key: string]: any} = {};
        updates[`users/${user.uid}/messages/${messageId}`] = { 
            subject: values.subject, 
            timestamp,
            read: false,
        };
        updates[`adminMessages/${messageId}`] = messageData;

        await update(ref(database), updates);

        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you soon.",
        });
        form.reset({
            ...form.getValues(),
            subject: "",
            message: "",
        });
    } catch (error: any) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message || "There was a problem with your request. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isUserLoading) {
    return <div className="container text-center p-16">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container text-center p-16">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6">You need to be logged in to send and view messages.</p>
        <Button asChild>
          <Link href="/login?redirect=/contact">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-heading-color heading-shadow heading-underline mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions or ready to plan your next adventure? We&apos;d love to
            hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} readOnly />
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
                          <Input placeholder="you@example.com" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Question about the Summer Camp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Message</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Tell us more..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
          <div className="lg:col-span-3 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-accent mt-1"/>
                        <div>
                            <h4 className="font-semibold">Our Basecamp</h4>
                            <p className="text-muted-foreground">123 Adventure Lane, Wilderness, WY 82801</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-accent mt-1"/>
                        <div>
                            <h4 className="font-semibold">Email Us</h4>
                            <a href="mailto:hello@windsunsetcamp.com" className="text-muted-foreground hover:text-accent">hello@windsunsetcamp.com</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-accent mt-1"/>
                        <div>
                            <h4 className="font-semibold">Call Us</h4>
                            <p className="text-muted-foreground">7559155354</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Your Sent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    {messagesLoading ? (
                        <p>Loading messages...</p>
                    ) : sentMessages.length > 0 ? (
                        <ul className="space-y-3">
                            {sentMessages.map(msg => (
                                <li key={msg.id} className="border-b pb-3">
                                    <p className="font-semibold">{msg.subject}</p>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                                        <div className={cn("flex items-center gap-1.5", msg.read ? "text-green-600" : "text-amber-600")}>
                                            {msg.read ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                            {msg.read ? "Read" : "Sent"}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">You have not sent any messages yet.</p>
                    )}
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
