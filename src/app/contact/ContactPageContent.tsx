"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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
        title: "Message Sent",
        description: "Our team will contact you shortly.",
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
      title: "WhatsApp",
      value: "+91 8080334787",
      icon: MessageCircle,
      href: "https://wa.me/918080334787",
      external: true,
    },
    {
      title: "Phone",
      value: "+91 8080334787",
      icon: Phone,
      href: "tel:+918080334787",
    },
    {
      title: "Email",
      value: "sameermore3010@gmail.com",
      icon: Mail,
      href: "mailto:sameermore3010@gmail.com",
    },
    {
      title: "Location",
      value: "Pawna Lake, Lonavala",
      icon: MapPin,
      href: "https://maps.google.com/?q=Pawna+Lake+Camping",
      external: true,
    },
  ];

  return (
    <div className="bg-background woody-texture-background">
      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-6xl mb-4 text-heading-color heading-shadow heading-underline">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg">
            Get in touch for booking help, camp details, or quick support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {contactCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="bg-card/80 dark:bg-card/70 rounded-2xl shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-heading-color">
                    <Icon className="h-5 w-5 text-accent" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={card.href}
                    target={card.external ? "_blank" : undefined}
                    rel={card.external ? "noreferrer" : undefined}
                    className="text-muted-foreground hover:text-accent transition-colors break-words"
                  >
                    {card.value}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mb-12">
          <Button asChild size="lg" className="btn-glow">
            <a href="https://wa.me/918080334787" target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat on WhatsApp
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card/80 dark:bg-card/70 rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-heading-color">Send Message</CardTitle>
              <CardDescription>Fill out the form and our team will get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 8080334787" {...field} />
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
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Write your message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-glow" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="bg-card/80 dark:bg-card/70 rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-heading-color">Pawna Lake Camping</CardTitle>
              <CardDescription>Find us easily on Google Maps.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-border h-[420px]">
                <iframe
                  title="Pawna Lake Camping Map"
                  src="https://maps.google.com/maps?q=Pawna%20Lake%20Camping&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
