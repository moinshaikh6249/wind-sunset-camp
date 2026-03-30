
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from '@/lib/api';
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
import { useTransition, useState, useEffect } from "react";
import { LoaderCircle, Upload, ImageOff } from "lucide-react";
import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";

type UploadImageFormProps = {
  onSuccess?: () => void | Promise<void>;
};

const formSchema = z.object({
  imageUrl: z.string().min(1, "Please provide a valid image URL."),
  description: z.string().min(5, "Description is required."),
  imageHint: z.string().min(2, "Image hint is required (e.g., 'mountain lake')."),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadImageForm(props: UploadImageFormProps) {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
      description: "",
      imageHint: "",
    },
  });

  const imageUrlValue = form.watch("imageUrl");

  useEffect(() => {
    if (imageUrlValue) {
        setPreviewError(false);
    }
  }, [imageUrlValue]);


  const resetForm = () => {
    form.reset();
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await api.post('/gallery', {
          imageUrl: values.imageUrl,
          description: values.description,
          imageHint: values.imageHint,
        });

        toast({
          title: "Image Added",
          description: `The new image has been added to the gallery.`,
        });
        setOpen(false);
        resetForm();

        if (props.onSuccess) {
          await props.onSuccess();
        }
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Image to Gallery</DialogTitle>
          <DialogDescription>
            Add a new photo to the public gallery by providing its URL and a description.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] p-4 -mx-6">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
              <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                      <Input placeholder="https://... or data:image/..." {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
              {imageUrlValue && (
                  <div className="w-full relative space-y-2">
                      <p className="text-sm font-medium">Preview:</p>
                      {previewError ? (
                        <div className="flex items-center justify-center h-[200px] w-full bg-muted rounded-md text-muted-foreground text-sm">
                           <ImageOff className="h-6 w-6 mr-2"/>
                           Invalid image URL or preview not available.
                        </div>
                      ) : (
                        <div className="relative w-full h-[200px] rounded-md border overflow-hidden">
                            <Image
                                src={imageUrlValue}
                                alt="Image preview"
                                fill
                                unoptimized
                                className="object-cover"
                                onError={() => setPreviewError(true)}
                            />
                        </div>
                      )}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
