
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(3, "Camp name is required."),
  date: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Valid date is required."),
  location: z.string().min(3, "Location is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  description: z.string().min(10, "Description is required."),
  activities: z.string().min(10, "Please list some activities."),
  imageUrl: z.union([
    z.literal(""),
    z.string().url("Please provide a valid image URL."),
  ]),
  featured: z.enum(["true", "false"]).default("false"),
  status: z.enum(["active", "inactive"]).default("active"),
});

type FormValues = z.infer<typeof formSchema>;

export type CampWithId = {
  id: string;
  name: string;
  date?: string;
  location: string;
  price: number;
  description: string;
  activities?: string | string[];
  imageUrl?: string;
  imageHint?: string;
  featured?: boolean;
  status?: 'active' | 'inactive';
};

type CampFormProps = {
  campToEdit?: CampWithId | null;
  onFormSubmit: () => void;
};

const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
    new URL(url);
    return true;
    } catch (e) {
        return false;
    }
};


export function CampForm({ campToEdit, onFormSubmit }: CampFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(campToEdit?.imageUrl || null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campToEdit?.name || "",
      date: campToEdit?.date || "",
      location: campToEdit?.location || "",
      price: campToEdit?.price || 0,
      description: campToEdit?.description || "",
      activities: campToEdit?.activities ? (Array.isArray(campToEdit.activities) ? campToEdit.activities.join(', ') : campToEdit.activities) : "",
      imageUrl: campToEdit?.imageUrl || "",
      featured: campToEdit?.featured ? "true" : "false",
      status: campToEdit?.status || "active",
    },
  });

  const toDateInputValue = (value: string | undefined) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (campToEdit) {
      form.reset({
        name: campToEdit.name,
        date: toDateInputValue(campToEdit.date),
        location: campToEdit.location,
        price: campToEdit.price,
        description: campToEdit.description,
        activities: Array.isArray(campToEdit.activities) ? campToEdit.activities.join(', ') : campToEdit.activities,
        imageUrl: campToEdit.imageUrl || "",
        featured: campToEdit.featured ? "true" : "false",
        status: campToEdit.status || "active",
      });
      setImagePreview(campToEdit.imageUrl || null);
      setSelectedImageFile(null);
    } else {
        form.reset({ name: "", date: "", location: "", price: 0, description: "", activities: "", imageUrl: "", featured: "false", status: "active" });
        setImagePreview(null);
        setSelectedImageFile(null);
    }
  }, [campToEdit, form]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);


  const imageUrlValue = form.watch("imageUrl");
  useEffect(() => {
    if (imageUrlValue && isValidImageUrl(imageUrlValue)) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setImagePreview(imageUrlValue);
      return;
    }

    if (!imageUrlValue && !selectedImageFile) {
      setImagePreview(null);
    }
  }, [imageUrlValue, selectedImageFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImageFile(file);

    if (!file) {
      if (!imageUrlValue) {
        setImagePreview(null);
      }
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
    form.clearErrors('imageUrl');
  };

  const handleUrlChange = (value: string, onChange: (...event: any[]) => void) => {
    onChange(value);

    if (value.trim()) {
      setSelectedImageFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setImagePreview(value.trim());
      form.clearErrors('imageUrl');
      return;
    }

    if (!selectedImageFile) {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setSelectedImageFile(null);
    setImagePreview(null);
    form.setValue('imageUrl', '', { shouldDirty: true, shouldValidate: false });
    form.clearErrors('imageUrl');
  };

  const uploadSelectedImage = async () => {
    if (!selectedImageFile) {
      throw new Error('Please choose an image file first.');
    }

    const formData = new FormData();
    formData.append('image', selectedImageFile);

    setIsUploadingImage(true);
    try {
      const response = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response?.imageUrl || response?.data?.imageUrl;
      if (!uploadedUrl) {
        throw new Error('Image URL was not returned from server');
      }

      form.setValue('imageUrl', uploadedUrl, { shouldValidate: true, shouldDirty: true });
      form.clearErrors('imageUrl');
      setImagePreview(uploadedUrl);
      setSelectedImageFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      return uploadedUrl;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      await uploadSelectedImage();

      toast({
        title: 'Upload Complete',
        description: 'Image uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || error.message || 'Failed to upload image.',
        variant: 'destructive',
      });
    }
  };

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        if (!campToEdit?.id && !selectedImageFile && !values.imageUrl) {
          form.setError('imageUrl', {
            type: 'manual',
            message: 'Please upload an image or provide an image URL',
          });
          toast({
            title: "Image Required",
            description: "Please upload an image or provide an image URL.",
            variant: "destructive",
          });
          return;
        }

        form.clearErrors('imageUrl');

        let finalImageUrl = values.imageUrl || "";
        if (selectedImageFile) {
          finalImageUrl = await uploadSelectedImage();
        }

        const activitiesArray = values.activities.split(',').map((s) => s.trim()).filter(Boolean);

        const payload = {
          name: values.name,
          date: values.date,
          location: values.location,
          price: values.price,
          description: values.description,
          activities: activitiesArray,
          imageUrl: finalImageUrl,
          imageHint: campToEdit?.imageHint || 'camp image',
          featured: values.featured === 'true',
          status: values.status,
        };

        if (campToEdit?.id) {
          await api.put(`/admin/camps/${campToEdit.id}`, payload);
        } else {
          await api.post('/admin/camps', payload);
        }

        toast({
          title: campToEdit ? 'Camp Updated' : 'Camp Added',
          description: `${values.name} has been successfully saved.`,
        });
        onFormSubmit();
      } catch (error: any) {
        console.error('Camp form submission error:', error);
        toast({
          title: 'Operation Failed',
          description: error.response?.data?.message || error.message || 'An unexpected error occurred.',
          variant: 'destructive',
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
              <FormControl><Input type="date" {...field} /></FormControl>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Camp</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select featured status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camp status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
        
        <FormItem>
          <FormLabel>Camp Image</FormLabel>
          <input type="hidden" {...form.register('imageUrl')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-md border p-4">
              <p className="text-sm font-medium">Option 1: Upload Image</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleImageUpload}
                disabled={isUploadingImage || isSubmitting || !selectedImageFile}
              >
                {isUploadingImage ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>

            <div className="space-y-2 rounded-md border p-4">
              <p className="text-sm font-medium">Option 2: Image URL</p>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Paste image URL"
                        {...field}
                        onChange={(event) => {
                          handleUrlChange(event.target.value, field.onChange);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveImage}
              disabled={isSubmitting || (!selectedImageFile && !imageUrlValue && !imagePreview)}
            >
              Remove Image
            </Button>
          </div>
          {!imageUrlValue && !selectedImageFile && !campToEdit?.id && (
            <p className="text-sm text-muted-foreground">Upload an image or paste an image URL to continue.</p>
          )}
          {!imageUrlValue && !selectedImageFile && campToEdit?.id && (
            <p className="text-sm text-muted-foreground">You can upload a new image, paste an image URL, or remove the current image.</p>
          )}
          {form.formState.errors.imageUrl?.message && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.imageUrl?.message}</p>
          )}
        </FormItem>
        {showPreview && (
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <p className="text-sm font-medium">Image Preview</p>
            <div className="relative h-48 overflow-hidden rounded-lg">
              <Image src={imagePreview!} alt="Camp preview" fill className="object-cover" unoptimized />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : (campToEdit ? 'Update Camp' : 'Add Camp')}
        </Button>
      </form>
    </Form>
  );
}
