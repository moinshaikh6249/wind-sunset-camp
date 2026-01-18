"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, MapPin, Phone, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
    <title>WhatsApp</title>
    <path d="M12.04 2.016c-5.523 0-9.98 4.457-9.98 9.98 0 1.758.457 3.454 1.316 4.932L2.016 22l5.22-1.359a9.932 9.932 0 0 0 4.804 1.228h.004c5.523 0 9.98-4.457 9.98-9.98 0-5.523-4.457-9.98-9.98-9.98zm0 18.27c-1.61 0-3.14-.39-4.52-1.124l-.324-.192-3.354.876.89-3.276-.21-.34c-.8-1.38-1.22-2.98-1.22-4.632 0-4.594 3.73-8.324 8.328-8.324 4.594 0 8.324 3.73 8.324 8.324 0 4.598-3.73 8.328-8.324 8.328zm4.52-6.148c-.246-.123-1.453-.717-1.68-.8-.227-.082-.39-.123-.557.123-.164.246-.633.795-.777.96-.144.164-.29.184-.533.062-.246-.123-1.04-.383-1.98-1.22-.732-.656-1.22-1.47-1.36-1.714-.144-.246-.012-.38.11-.504.11-.11.246-.29.37-.432.12-.144.16-.246.24-.41.08-.164.04-.305-.02-.432-.06-.123-.557-1.34-.76-1.836-.2-.48-.407-.414-.557-.422-.14-.008-.305-.008-.47-.008-.164 0-.432.062-.656.305-.227.246-.875.855-.875 2.082 0 1.227.898 2.414 1.02 2.58.12.164 1.754 2.674 4.254 3.754.596.258 1.064.414 1.422.527.596.184 1.14.16 1.565.098.47-.07 1.453-.596 1.66-1.168.207-.572.207-1.06.144-1.168-.06-.105-.227-.165-.47-.29z"/>
  </svg>
);


export default function ContactPageContent() {
  const { toast } = useToast();
  const [user, isUserLoading] = useAuthState(auth);

  const userMessagesRef = useMemo(() => {
    if (!user) return null;
    return collection(db, `users/${user.uid}/messages`);
  }, [user]);

  const [messagesData, messagesLoading] = useCollectionData<Omit<Message, 'id'>>(userMessagesRef, { idField: 'id' });

  const sentMessages = useMemo(() => {
    if (!messagesData) return [];
    return [...messagesData]
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
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to send a message.",
            variant: "destructive",
        });
        return;
    }
    try {
        const timestamp = new Date().toISOString();
        const batch = writeBatch(db);
        
        const adminMessageRef = doc(collection(db, 'adminMessages'));
        batch.set(adminMessageRef, {
            ...values,
            timestamp,
            read: false,
            userId: user.uid,
            messageId: adminMessageRef.id,
        });

        const userMessageRef = doc(db, `users/${user.uid}/messages/${adminMessageRef.id}`);
        batch.set(userMessageRef, {
            subject: values.subject, 
            timestamp,
            read: false,
        });

        await batch.commit();

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

  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="font-headline text-4xl md:text-6xl text-heading-color heading-shadow heading-underline mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions or ready to plan your next adventure? We&apos;d love to
            hear from you. Use the form or contact us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Form and Messages */}
          <div className="space-y-8">
             <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                         {isUserLoading ? "Loading..." : (user ? "Fill out the form and we'll get back to you." : "Please log in to send a message.")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isUserLoading ? (
                        <div className="h-64 flex items-center justify-center">Loading form...</div>
                    ) : user ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl><Input placeholder="Question about the Summer Camp" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="message" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Message</FormLabel>
                                        <FormControl><Textarea rows={6} placeholder="Tell us more..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                         <div className="text-center p-8 border-2 border-dashed rounded-lg">
                             <p className="text-muted-foreground mb-4">You need an account to send messages.</p>
                             <Button asChild><Link href="/login?redirect=/contact">Login or Sign Up</Link></Button>
                         </div>
                    )}
                </CardContent>
            </Card>

             {user && (
                 <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Sent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {messagesLoading ? (
                            <p>Loading messages...</p>
                        ) : sentMessages.length > 0 ? (
                            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {sentMessages.map(msg => (
                                    <li key={msg.id} className="border-b pb-3 last:border-b-0">
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
             )}
          </div>

          {/* Right Column: Contact Info & Map */}
          <div className="space-y-8">
             <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <CardTitle>Direct Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-accent mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Call Us</h4>
                            <a href="tel:8080334787" className="text-muted-foreground hover:text-accent transition-colors">8080334787</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0"><WhatsAppIcon /></div>
                        <div>
                            <h4 className="font-semibold">WhatsApp</h4>
                            <a href="https://wa.me/918080334787" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">Chat with us</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-accent mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Email Us</h4>
                            <a href="mailto:sameermore3010@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">sameermore3010@gmail.com</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Clock className="h-6 w-6 text-accent mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Working Hours</h4>
                            <p className="text-muted-foreground">Open 24 Hours for Bookings & Support</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                         <Button asChild className="flex-1"><a href="tel:8080334787"><Phone className="mr-2"/>Call Now</a></Button>
                         <Button asChild variant="secondary" className="flex-1 bg-green-500 hover:bg-green-600 text-white"><a href="https://wa.me/918080334787" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> <span className="ml-2">Chat on WhatsApp</span></a></Button>
                    </div>
                </CardContent>
             </Card>

              <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <CardTitle>Our Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-accent mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Wind and Sunset Camping</h4>
                            <p className="text-muted-foreground">Gevhande Jawan Shiv, Thankursai Ajivali Road, Pawana Nagar, Post, Gevhande Khadak, Maharashtra 410506</p>
                        </div>
                    </div>
                    <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-accent/20 dark:border-primary/20 shadow-inner">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.351347313835!2d73.4989340752148!3d18.62310108257858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2a1380900f6ff%3A0x4d32a933224b174!2sWind%20and%20Sunset%20Camping%20Near%20Pawana%20Lake!5e0!3m2!1sen!2sin!4v1700000000000"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Wind and Sunset Camping Location"
                        ></iframe>
                    </div>
                    <Button asChild className="w-full">
                         <a href="https://maps.app.goo.gl/wUXEvEwvFkzxGz627" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/> Get Directions
                        </a>
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
