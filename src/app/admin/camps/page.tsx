
'use client';

import { useDatabase, useMemoFirebase, useStorage, useUser } from '@/firebase';
import { useDatabaseValue } from '@/firebase/database/use-database-value';
import { ref, remove } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { useMemo, useState, useTransition } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from "@/components/ui/alert-dialog"
import { useSearch } from '@/context/SearchProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CampForm, type CampWithId } from './CampForm';
import Image from 'next/image';

type DbCamps = {
  [id: string]: {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    image: {
        id: string;
        imageUrl: string;
        imageHint: string;
    };
  }
};

const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        const parsedUrl = new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsedUrl.pathname);
    } catch (e) {
        return false;
    }
};


function CampTableRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <Skeleton className="h-4 w-[250px]" />
                </div>
            </TableCell>
             <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[200px]" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
        </TableRow>
    )
}

export default function CampsPage() {
  const database = useDatabase();
  const storage = useStorage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { searchQuery } = useSearch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<CampWithId | null>(null);

  const campsRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'camps');
  }, [database]);

  const { data: campsData, isLoading } = useDatabaseValue<DbCamps>(campsRef);

  const camps = useMemo(() => {
    if (!campsData) return [];
    return Object.values(campsData);
  }, [campsData]);

  const filteredCamps = useMemo(() => {
    if (!searchQuery) return camps;
    const lowercasedQuery = searchQuery.toLowerCase();
    return camps.filter(camp => 
      camp.name.toLowerCase().includes(lowercasedQuery) ||
      camp.location.toLowerCase().includes(lowercasedQuery)
    );
  }, [camps, searchQuery]);


  const handleDeleteCamp = (camp: CampWithId) => {
    if (!database) return;
    startTransition(async () => {
      try {
        const campDbRef = ref(database, `camps/${camp.id}`);
        await remove(campDbRef);

        if (camp.image?.imageUrl && camp.image.imageUrl.includes('firebasestorage.googleapis.com')) {
            try {
                const imageStorageRef = storageRef(storage, camp.image.imageUrl);
                await deleteObject(imageStorageRef);
            } catch (storageError: any) {
                // If the file doesn't exist in storage, we can ignore the error
                if (storageError.code !== 'storage/object-not-found') {
                     console.error(`Failed to delete image from storage: ${camp.image.imageUrl}`, storageError);
                }
            }
        }
        
        toast({
          title: "Camp Deleted",
          description: `${camp.name} has been permanently deleted.`,
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

  const handleAddCamp = () => {
    setEditingCamp(null);
    setDialogOpen(true);
  }

  const handleEditCamp = (camp: CampWithId) => {
    setEditingCamp(camp);
    setDialogOpen(true);
  }

  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(3)].map((_, i) => <CampTableRowSkeleton key={i} />);
    }
    if (filteredCamps.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No camps found.
                </TableCell>
            </TableRow>
        );
    }
    return filteredCamps.map((camp) => {
        const imageUrl = isValidImageUrl(camp.image?.imageUrl) 
            ? camp.image.imageUrl 
            : `https://picsum.photos/seed/${camp.id}/64/64`;

        return (
        <TableRow key={camp.id}>
            <TableCell className="font-medium">
                <div className="flex items-center gap-4">
                    <Image
                        src={imageUrl}
                        alt={camp.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                    />
                    <div className="font-semibold">{camp.name}</div>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {camp.date}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {camp.location}
            </TableCell>
            <TableCell>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditCamp(camp)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={e => e.preventDefault()}>Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the camp
                            <span className="font-semibold"> {camp.name} </span>
                             and all of its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                         className="bg-destructive hover:bg-destructive/90"
                         onClick={() => handleDeleteCamp(camp)}
                         disabled={isPending}
                        >
                        {isPending ? "Deleting..." : "Yes, delete camp"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </TableCell>
        </TableRow>
    )});
  }


  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Camps</h1>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddCamp}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Camp
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                 <DialogHeader>
                    <DialogTitle>{editingCamp ? "Edit Camp" : "Add New Camp"}</DialogTitle>
                    <DialogDescription>
                        {editingCamp ? "Update the details for this camp." : "Fill in the form to add a new camp to the database."}
                    </DialogDescription>
                </DialogHeader>
                <CampForm campToEdit={editingCamp} onFormSubmit={() => setDialogOpen(false)} />
            </DialogContent>
         </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Camps</CardTitle>
          <CardDescription>
            Manage all upcoming camps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camp Name</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
