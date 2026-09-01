"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Phone, Sparkles, Send, Clock, ShieldCheck } from "lucide-react";
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
import api from "@/lib/api";
import Image from "@/components/ui/safe-image";
import { Reveal, HeroReveal } from "@/components/animations/Reveal";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function ContactPageContent() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.post("/messages", {
        name: values.name,
        email: values.email,
        subject: "Website Contact Inquiry",
        message: `Phone: ${values.phone}\n\n${values.message}`,
      });

      toast({
        title: "Message Sent! 🎉",
        description: "Thank you for reaching out. Our campsite host will contact you shortly.",
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  }

  const contactCards = [
    {
      title: "WhatsApp Us",
      value: "+91 8080334787",
      icon: MessageCircle,
      href: "https://wa.me/918080334787",
      external: true,
      color: "text-emerald-500",
    },
    {
      title: "Phone Support",
      value: "+91 8080334787",
      icon: Phone,
      href: "tel:+918080334787",
      color: "text-amber-500",
    },
    {
      title: "Email Inquiry",
      value: "sameermore3010@gmail.com",
      icon: Mail,
      href: "mailto:sameermore3010@gmail.com",
      color: "text-sky-500",
    },
    {
      title: "Campsite Location",
      value: "Pawna Lake, Lonavala",
      icon: MapPin,
      href: "https://maps.google.com/?q=Pawna+Lake+Camping",
      external: true,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto py-12 md:py-16 px-4 max-w-7xl space-y-12">
        {/* HERO */}
        <HeroReveal className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Let's Plan Your Escape
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Have questions about campsite availability, group bookings, or activities? Reach out to our team anytime.
          </p>
        </HeroReveal>

        {/* CONTACT INFO CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="group overflow-hidden rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={card.href}
                    target={card.external ? "_blank" : undefined}
                    rel={card.external ? "noreferrer" : undefined}
                    className="text-xs text-muted-foreground hover:text-amber-500 font-medium transition-colors break-words"
                  >
                    {card.value}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* TWO-COLUMN EDITORIAL FORM & MAP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: EDITORIAL CAMPSITE CONTACT PANEL */}
          <div className="space-y-6">
            <Card className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/light-hero.png"
                  alt="Pawna Lake Campsite"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <Badge className="bg-emerald-500/20 text-white border-emerald-400/40 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Pawna Lakefront
                  </Badge>
                  <h3 className="font-headline text-3xl font-extrabold">Wind & Sunset Camp</h3>
                  <p className="text-xs text-white/80">Lonavala, Maharashtra 410401</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Located along the scenic banks of Pawna Lake, Wind & Sunset Camp offers private tents, lakeside bonfires, acoustic music, and home-style BBQ dinners.
                </p>
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Clock className="h-4 w-4 text-amber-500" /> Desk Hours: 24/7 Assistance
                  </div>
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp Response: Under 15 Minutes
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-xl text-foreground">Live Map Location</CardTitle>
                <CardDescription className="text-xs">Find us easily near Pawna Dam, Lonavala.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl overflow-hidden border border-border/40 h-[280px]">
                  <iframe
                    title="Pawna Lake Camping Map"
                    src="https://maps.google.com/maps?q=Pawna%20Lake%20Camping&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: LUXURY CONTACT FORM */}
          <Card className="border border-border/40 bg-card/90 dark:bg-card/70 backdrop-blur-xl shadow-2xl rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-3xl text-foreground">Send a Message</CardTitle>
              <CardDescription className="text-xs">
                Fill in your contact details below and our host will respond promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="text-xs rounded-xl" />
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} className="text-xs rounded-xl" />
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} className="text-xs rounded-xl" />
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Tell us your trip dates, group size, or special requirements..." {...field} className="text-xs rounded-2xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-glow text-xs font-bold rounded-2xl py-6" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
