
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UploadImageForm } from './UploadImageForm';

// This is the shape of the data in our component, including the API response ID
type GalleryImage = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt?: string | Date;
}

function ImageCardSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    )
}

export default function GalleryPage() {
  const { toast } = useToast();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGalleryImages = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ success: boolean; images: any[] }>('/gallery');
      const mappedImages: GalleryImage[] = (data.images || []).map((img: any) => ({
        id: img._id || img.id,
        imageUrl: img.imageUrl || img.image || '/images/placeholder.jpg',
        description: img.description,
        imageHint: img.imageHint,
        createdAt: img.createdAt,
      }));
      setGalleryImages(mappedImages);
    } catch (error: any) {
      toast({
        title: "Failed to load gallery",
        description: error?.message || "Unable to fetch gallery images.",
        variant: "destructive",
      });
      setGalleryImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    if (!image || !image.id) {
      toast({
        title: "Deletion Failed",
        description: "Invalid image data. Cannot delete.",
        variant: "destructive",
      });
      console.error("Missing image id:", image);
      return;
    }

    setDeletingId(image.id);

    try {
      await api.delete(`/gallery/${image.id}`);
      toast({
        title: "Image Deleted",
        description: `The image has been permanently deleted.`,
      });
      await fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const renderGallery = () => {
    if (isLoading) {
      return [...Array(8)].map((_, i) => <ImageCardSkeleton key={i} />);
    }
    if (!galleryImages || galleryImages.length === 0) {
        return (
            <p className="col-span-full text-center text-muted-foreground">
                No images in the gallery yet. Use the "Add Image" button to upload.
            </p>
        );
    }
    return galleryImages.map((image) => (
       <Card key={image.id} className="group relative overflow-hidden rounded-2xl">
            <div className="w-full aspect-video relative">
                <Image
                  src={image?.imageUrl || "/images/placeholder.jpg"}
                    alt={image.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                 {deletingId === image.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <LoaderCircle className="h-8 w-8 animate-spin text-white" />
                    </div>
                 )}
            </div>
            <CardContent className="p-3">
                <p className="text-sm truncate text-muted-foreground" title={image.description}>{image.description}</p>
            </CardContent>
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={!!deletingId}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the image from the gallery. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                                onClick={() => handleDeleteImage(image)}
                                disabled={deletingId === image.id}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {deletingId === image.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : null}
                                {deletingId === image.id ? "Deleting..." : "Yes, delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
       </Card>
    ));
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Gallery</h1>
<UploadImageForm onSuccess={fetchGalleryImages} />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Manage Gallery</CardTitle>
          <CardDescription>
            Add, view, and delete images from your public gallery. Changes here will be reflected live for users.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {renderGallery()}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
