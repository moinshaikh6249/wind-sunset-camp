
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useTransition, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  imageUrl: z.string().url("Please provide a valid image URL."),
  description: z.string().min(5, "Description is required."),
  imageHint: z.string().min(2, "Image hint is required (e.g., 'mountain lake')."),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadImageForm() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
      description: "",
      imageHint: "",
    },
  });

  const imageUrlValue = form.watch("imageUrl");

  const resetForm = () => {
    form.reset();
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await addDoc(collection(db, 'galleryImages'), {
          ...values,
          createdAt: serverTimestamp(),
        });

        toast({
          title: "Image Added",
          description: `The new image has been added to the gallery.`,
        });
        setOpen(false);
        resetForm();

      } catch (error: any) {
        toast({
          title: "Operation Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  const isPending = isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Image</DialogTitle>
          <DialogDescription>
            Add a new photo to the public camp gallery by providing its URL.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            {imageUrlValue && (
                <div className="w-full relative">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <Image src={imageUrlValue} alt="Image preview" width={400} height={300} className="rounded-md object-contain" />
                </div>
            )}
            
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea placeholder="A beautiful sunset over the lake..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="imageHint"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Image Hint</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., sunset lake" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        
            <Button type="submit" className="w-full" disabled={isPending}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add to Gallery'}
            </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
