
'use client';

import api from '@/lib/api';
import { useMemo, useState, useTransition, useEffect } from 'react';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { adaptCamps } from '@/lib/adapters/campAdapter';

type DbCamp = {
    id: string;
    name: string;
  date?: string;
    location: string;
    description: string;
  imageUrl?: string;
  imageHint?: string;
  featured?: boolean;
  status?: 'active' | 'inactive';
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
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </TableCell>
        </TableRow>
    )
}

export default function CampsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { searchQuery } = useSearch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<CampWithId | null>(null);

  const [camps, setCamps] = useState<DbCamp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCamps = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/camps');
      const campList = Array.isArray(response)
        ? response
        : response?.camps || response?.data || [];
      const normalizedCamps = adaptCamps(campList).map((camp: any) => ({
        ...camp,
        id: camp._id || camp.id,
      }));
      setCamps(normalizedCamps);
    } catch (error) {
      console.error('Failed to fetch camps', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const filteredCamps = useMemo(() => {
    if (!camps) return [];
    if (!searchQuery) return camps;
    const lowercasedQuery = searchQuery.toLowerCase();
    return camps.filter(camp => 
      camp.name.toLowerCase().includes(lowercasedQuery) ||
      camp.location.toLowerCase().includes(lowercasedQuery)
    );
  }, [camps, searchQuery]);


  const handleDeleteCamp = (camp: CampWithId) => {
    startTransition(async () => {
      try {
        await api.delete(`/admin/camps/${camp.id}`);
        await fetchCamps();
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
    if (!filteredCamps || filteredCamps.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No camps found.
                </TableCell>
            </TableRow>
        );
    }
    return filteredCamps.map((camp) => {
      const imageUrl = isValidImageUrl(camp?.imageUrl)
        ? (camp.imageUrl as string)
            : '/images/placeholder.jpg';

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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEditCamp(camp as CampWithId)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                </div>
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
                         onClick={() => handleDeleteCamp(camp as CampWithId)}
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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
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
                <ScrollArea className="max-h-[70vh] p-4">
                  <CampForm campToEdit={editingCamp} onFormSubmit={() => {
                    setDialogOpen(false);
                    fetchCamps();
                  }} />
                </ScrollArea>
            </DialogContent>
         </Dialog>
      </div>

      <Card className="glass-card">
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
    </div>
  );
}
