
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDatabase, useStorage } from "@/firebase";
import { ref as dbRef, set, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
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
  image: z.any().optional(),
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
  const database = useDatabase();
  const storage = useStorage();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(campToEdit?.image?.imageUrl || null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campToEdit?.name || "",
      date: campToEdit?.date || "",
      location: campToEdit?.location || "",
      description: campToEdit?.description || "",
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
      });
      setImagePreview(campToEdit.image?.imageUrl);
    } else {
        form.reset({ name: "", date: "", location: "", description: "" });
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
    }
  };

  function onSubmit(values: FormValues) {
    if (!database) return;

    startTransition(async () => {
      try {
        let imageUrl = campToEdit?.image?.imageUrl || "";
        let imageHint = campToEdit?.image?.imageHint || "camping";
        let imageId = campToEdit?.image?.id || `img-${Date.now()}`;

        if (values.image) {
          const file: File = values.image;
          const newImageRef = storageRef(storage, `camps/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(newImageRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
          imageHint = "custom upload";
        }

        const campId = campToEdit?.id || push(dbRef(database, 'camps')).key;
        if (!campId) {
            throw new Error("Failed to generate a new camp ID.");
        }

        const campData = {
          ...values,
          id: campId,
          image: {
            id: imageId,
            imageUrl,
            imageHint,
          }
        };

        // Use set() for both creating and updating for simplicity and reliability
        await set(dbRef(database, `camps/${campId}`), campData);

        toast({
          title: campToEdit ? "Camp Updated" : "Camp Added",
          description: `${values.name} has been successfully saved.`,
        });
        onFormSubmit();
      } catch (error: any) {
        toast({
          title: "Operation Failed",
          description: error.message || "An unexpected error occurred. You may not have the required permissions.",
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Camp Image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                    {imagePreview && <Image src={imagePreview} alt="Preview" width={64} height={64} className="rounded-md object-cover" />}
                    <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                        <Camera className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Change' : 'Upload'} Image
                    </Button>
                    <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : (campToEdit ? 'Update Camp' : 'Add Camp')}
        </Button>
      </form>
    </Form>
  );
}
