
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
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
import { useTransition, useState, useEffect } from "react";
import { LoaderCircle, Camera } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(3, "Camp name is required."),
  date: z.string().min(3, "Date is required."),
  location: z.string().min(3, "Location is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  description: z.string().min(10, "Description is required."),
  activities: z.string().min(10, "Please list some activities."),
  imageUrl: z.string().url("An image URL is required.").min(1, "Image URL is required."),
});

type FormValues = z.infer<typeof formSchema>;

export type CampWithId = FormValues & {
  id: string;
  image: {
    id: string;
    imageUrl: string;
    imageHint: string;
  }
};

type CampFormProps = {
  campToEdit?: CampWithId | null;
  onFormSubmit: () => void;
};

const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        const urlObject = new URL(url);
        return /\.(jpg|jpeg|png|gif|webp)$/.test(urlObject.pathname);
    } catch (e) {
        return false;
    }
};


export function CampForm({ campToEdit, onFormSubmit }: CampFormProps) {
  const { toast } = useToast();
  const [adminUser] = useAuthState(auth);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(campToEdit?.image?.imageUrl || null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campToEdit?.name || "",
      date: campToEdit?.date || "",
      location: campToEdit?.location || "",
      price: campToEdit?.price || 0,
      description: campToEdit?.description || "",
      activities: campToEdit?.activities ? (Array.isArray(campToEdit.activities) ? campToEdit.activities.join(', ') : campToEdit.activities) : "",
      imageUrl: campToEdit?.image?.imageUrl || "",
    },
  });

  useEffect(() => {
    if (campToEdit) {
      form.reset({
        name: campToEdit.name,
        date: campToEdit.date,
        location: campToEdit.location,
        price: campToEdit.price,
        description: campToEdit.description,
        activities: Array.isArray(campToEdit.activities) ? campToEdit.activities.join(', ') : campToEdit.activities,
        imageUrl: campToEdit.image?.imageUrl || "",
      });
      setImagePreview(campToEdit.image?.imageUrl);
    } else {
        form.reset({ name: "", date: "", location: "", price: 0, description: "", activities: "", imageUrl: "" });
        setImagePreview(null);
    }
  }, [campToEdit, form]);


  const imageUrlValue = form.watch("imageUrl");
    useEffect(() => {
        if(imageUrlValue){
            setImagePreview(imageUrlValue)
        }
    }, [imageUrlValue])

  function onSubmit(values: FormValues) {
    if (!adminUser) {
        toast({
            title: "Error",
            description: "Admin user not available.",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      try {
        let finalImageUrl = values.imageUrl || "";
        let imageId = campToEdit?.image?.id || `img-${Date.now()}`;
        
        if (!finalImageUrl) {
            toast({
                title: "Image Required",
                description: "You must provide an image URL.",
                variant: "destructive"
            });
            return;
        }

        const campId = campToEdit?.id || `camp-${Date.now()}`;
        const activitiesArray = values.activities.split(',').map(s => s.trim()).filter(Boolean);

        const campData = {
          id: campId,
          name: values.name,
          date: values.date,
          location: values.location,
          price: values.price,
          description: values.description,
          activities: activitiesArray,
          image: {
            id: imageId,
            imageUrl: finalImageUrl,
            imageHint: campToEdit?.image?.imageHint || 'camp image',
          }
        };

        const campRef = doc(db, `camps/${campId}`);
        await setDoc(campRef, campData);

        toast({
          title: campToEdit ? "Camp Updated" : "Camp Added",
          description: `${values.name} has been successfully saved.`,
        });
        onFormSubmit();
      } catch (error: any)
      {
        console.error("Camp form submission error:", error);
        toast({
          title: "Operation Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  const showPreview = imagePreview && isValidImageUrl(imagePreview);
  const isSubmitting = isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Camp Name</FormLabel>
              <FormControl><Input placeholder="e.g., Summer Adventure Camp" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input placeholder="e.g., July 15-20, 2024" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="e.g., Whispering Pines Forest" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
          />

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                 <FormLabel>Description</FormLabel>
            </div>
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className="space-y-0">
                <FormControl><Textarea placeholder="Describe the camp experience." {...field} rows={4} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
            control={form.control}
            name="activities"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Activities (comma-separated)</FormLabel>
                <FormControl><Textarea placeholder="e.g., Hiking, Kayaking, Campfire Stories" {...field} rows={3}/></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showPreview && <Image src={imagePreview!} alt="Preview" width={64} height={64} className="rounded-md object-cover" />}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : (campToEdit ? 'Update Camp' : 'Add Camp')}
        </Button>
      </form>
    </Form>
  );
}
