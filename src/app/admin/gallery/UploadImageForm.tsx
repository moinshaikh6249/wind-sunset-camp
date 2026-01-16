
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDatabase, useStorage } from "@/firebase";
import { ref as dbRef, set, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
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
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  description: z.string().min(5, "Description is required."),
  imageHint: z.string().min(2, "Image hint is required (e.g., 'mountain lake')."),
  image: z.any().refine(file => file?.length == 1, "Image is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadImageForm() {
  const { toast } = useToast();
  const database = useDatabase();
  const storage = useStorage();
  const [isUploading, startUploadingTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      imageHint: "",
      image: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    form.reset();
    setImagePreview(null);
  }

  function onSubmit(values: FormValues) {
    if (!database || !storage) return;

    startUploadingTransition(async () => {
      try {
        const file: File = values.image[0];
        const newImageRef = storageRef(storage, `gallery/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(newImageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const newImageKey = push(dbRef(database, 'galleryImages')).key;
        if (!newImageKey) throw new Error("Could not generate a new key for the image.");

        const imageData = {
            id: newImageKey,
            description: values.description,
            imageHint: values.imageHint,
            imageUrl,
        };

        await set(dbRef(database, `galleryImages/${newImageKey}`), imageData);

        toast({
          title: "Image Uploaded",
          description: `The new image has been added to the gallery.`,
        });
        setOpen(false);
        resetForm();

      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  const isPending = isUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="mr-2 h-4 w-4" /> Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Image</DialogTitle>
          <DialogDescription>
            Add a new photo to the public camp gallery.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Image File</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {imagePreview && (
                    <div className="w-full relative">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <Image src={imagePreview} alt="Image preview" width={400} height={300} className="rounded-md object-contain" />
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
                {isUploading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload to Gallery'}
                </Button>
            </form>
            </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
