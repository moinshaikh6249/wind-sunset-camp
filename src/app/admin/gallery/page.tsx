
'use client';

import { database, storage } from '@/lib/firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { ref, remove } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { useMemo, useTransition, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

type Image = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

type DbGalleryImages = {
  [id: string]: Image;
};


function ImageCardSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    )
}

export default function GalleryPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const galleryRef = useMemo(() => ref(database, 'galleryImages'), []);
  const [galleryData, isLoading] = useObjectVal<DbGalleryImages>(galleryRef);

  const galleryImages = useMemo(() => {
    if (!galleryData) return [];
    return Object.entries(galleryData).map(([id, imageData]) => ({
      ...imageData,
      id,
    }));
  }, [galleryData]);


  const handleDeleteImage = (image: Image) => {
    startTransition(async () => {
      try {
        // Delete from Realtime Database
        const imageDbRef = ref(database, `galleryImages/${image.id}`);
        await remove(imageDbRef);
        
        // Delete from Storage
        const imageStorageRef = storageRef(storage, image.imageUrl);
        await deleteObject(imageStorageRef);
        
        toast({
          title: "Image Deleted",
          description: `The image has been permanently deleted.`,
        });
      } catch (error: any) {
        toast({
          title: "Deletion Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const renderGallery = () => {
    if (isLoading) {
      return [...Array(6)].map((_, i) => <ImageCardSkeleton key={i} />);
    }
    if (galleryImages.length === 0) {
        return (
            <p className="col-span-full text-center text-muted-foreground">
                No images in the gallery yet.
            </p>
        );
    }
    return galleryImages.map((image) => (
       <Card key={image.id} className="group relative overflow-hidden">
            <Image
                src={image.imageUrl}
                alt={image.description}
                width={400}
                height={300}
                className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
            />
            <CardContent className="p-3">
                <p className="text-sm truncate text-muted-foreground">{image.description}</p>
            </CardContent>
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the image from the gallery and storage.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                                onClick={() => handleDeleteImage(image)}
                                disabled={isPending}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isPending ? "Deleting..." : "Yes, delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
       </Card>
    ));
  }


  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Gallery</h1>
         <UploadImageForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Gallery</CardTitle>
          <CardDescription>
            Upload, view, and delete images from your public gallery.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {renderGallery()}
            </div>
        </CardContent>
      </Card>
    </>
  );
}
