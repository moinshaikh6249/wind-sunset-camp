
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser, useStorage, useDatabase } from "@/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
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
  description: z.string().min(10, "Description is required."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  image: z.any().optional(),
}).refine(data => data.imageUrl || data.image, {
    message: "Either an image URL or an uploaded image is required.",
    path: ["imageUrl"], // Point error to imageUrl field
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

export function CampForm({ campToEdit, onFormSubmit }: CampFormProps) {
  const { toast } = useToast();
  const { user: adminUser } = useUser();
  const storage = useStorage();
  const database = useDatabase();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(campToEdit?.image?.imageUrl || null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campToEdit?.name || "",
      date: campToEdit?.date || "",
      location: campToEdit?.location || "",
      description: campToEdit?.description || "",
      imageUrl: campToEdit?.image?.imageUrl || "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (campToEdit) {
      form.reset({
        name: campToEdit.name,
        date: campToEdit.date,
        location: campToEdit.location,
        description: campToEdit.description,
        imageUrl: campToEdit.image?.imageUrl || "",
        image: undefined,
      });
      setImagePreview(campToEdit.image?.imageUrl);
    } else {
        form.reset({ name: "", date: "", location: "", description: "", imageUrl: "", image: undefined });
        setImagePreview(null);
    }
  }, [campToEdit, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("imageUrl", ""); // Clear URL if file is selected
    }
  };

  const imageUrlValue = form.watch("imageUrl");
    useEffect(() => {
        if(imageUrlValue && !form.getValues("image")){
            setImagePreview(imageUrlValue)
        }
    }, [imageUrlValue, form])

  function onSubmit(values: FormValues) {
    if (!adminUser || !storage || !database) {
        toast({
            title: "Error",
            description: "Admin user, storage, or database service is not available.",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      try {
        let finalImageUrl = campToEdit?.image?.imageUrl || values.imageUrl || "";
        let imageId = campToEdit?.image?.id || `img-${Date.now()}`;
        
        const newImageFile = values.image instanceof File ? values.image : null;

        if (newImageFile) {
           // If we are editing and there was a previous image stored in Firebase, delete it.
          if (campToEdit?.image?.imageUrl && campToEdit.image.imageUrl.includes('firebasestorage.googleapis.com')) {
            try {
              const oldImageRef = storageRef(storage, campToEdit.image.imageUrl);
              await deleteObject(oldImageRef);
            } catch (error: any) {
               // Ignore if object doesn't exist, but log other errors.
               if (error.code !== 'storage/object-not-found') {
                console.warn("Could not delete old image:", error.message);
              }
            }
          }
          
          // Upload the new image
          const newImageRef = storageRef(storage, `camps/${Date.now()}-${newImageFile.name}`);
          const snapshot = await uploadBytes(newImageRef, newImageFile);
          finalImageUrl = await getDownloadURL(snapshot.ref);
          imageId = newImageRef.fullPath;

        }

        if (!finalImageUrl) {
            toast({
                title: "Image Required",
                description: "You must either upload an image or provide an image URL.",
                variant: "destructive"
            });
            return;
        }

        const campId = campToEdit?.id || `camp-${Date.now()}`;

        const campData = {
          id: campId,
          name: values.name,
          date: values.date,
          location: values.location,
          description: values.description,
          image: {
            id: imageId,
            imageUrl: finalImageUrl,
            imageHint: newImageFile ? 'custom upload' : (campToEdit?.image?.imageHint || 'camp image'),
          }
        };

        const campRef = dbRef(database, `camps/${campId}`);
        await set(campRef, campData);

        toast({
          title: campToEdit ? "Camp Updated" : "Camp Added",
          description: `${values.name} has been successfully saved.`,
        });
        onFormSubmit();
      } catch (error: any)
      {
        console.error("Camp form submission error:", error);
        let description = error.message || "An unexpected error occurred.";
        if (error.code === 'storage/unauthorized') {
            description = "You do not have permission to upload files. Please check your Firebase Storage rules or use the Image URL field instead."
        }
        toast({
          title: "Operation Failed",
          description: description,
          variant: "destructive",
        });
      }
    });
  }

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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Describe the camp experience." {...field} /></FormControl>
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

        <div className="flex items-center gap-4">
            {imagePreview && <Image src={imagePreview} alt="Preview" width={64} height={64} className="rounded-md object-cover" />}
             <FormField
                control={form.control}
                name="image"
                render={() => (
                    <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Or Upload Image</FormLabel>
                    <FormControl>
                        <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                                <Camera className="mr-2 h-4 w-4" />
                                {imagePreview && form.getValues("image") ? 'Change' : 'Upload'}
                            </Button>
                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
       
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : (campToEdit ? 'Update Camp' : 'Add Camp')}
        </Button>
      </form>
    </Form>
  );
}

    