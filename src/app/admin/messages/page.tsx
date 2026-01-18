
'use client';

import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Trash2, Archive, ArchiveRestore, Circle, Inbox } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSearch } from '@/context/SearchProvider';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string | null;
};

function MessageSkeleton() {
  return (
    <div className="space-y-3">
       {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
            </div>
             <Skeleton className="h-4 w-1/5" />
        </div>
       ))}
    </div>
  )
}

export default function MessagesPage() {
  const { toast } = useToast();
  const { searchQuery } = useSearch();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const messagesRef = useMemo(() => collection(db, 'messages'), []);
  const [messagesSnapshot, isLoading] = useCollection(messagesRef);

  const messages = useMemo(() => {
    if (!messagesSnapshot) return [];
    return messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ContactMessage, 'id'>),
    })) as ContactMessage[];
  }, [messagesSnapshot]);

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages]);
  
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return sortedMessages;
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedMessages.filter(msg => 
        msg.name.toLowerCase().includes(lowercasedQuery) ||
        msg.email.toLowerCase().includes(lowercasedQuery) ||
        (msg.subject && msg.subject.toLowerCase().includes(lowercasedQuery)) ||
        msg.message.toLowerCase().includes(lowercasedQuery)
    );
  }, [sortedMessages, searchQuery]);

  const handleToggleRead = async (message: ContactMessage) => {
    console.log("Attempting to toggle read status for message object:", message);
    console.log("Message ID:", message.id);
    if (!message?.id) {
        toast({
            title: "Operation Failed",
            description: "Message ID is missing. Cannot update status.",
            variant: "destructive",
        });
        return;
    }
    try {
      const messageRef = doc(db, `messages/${message.id}`);
      await updateDoc(messageRef, { read: !message.read });

      toast({
        title: `Message marked as ${!message.read ? 'read' : 'unread'}`,
      });
      setSelectedMessage({...message, read: !message.read });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update message status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete message with ID:", id);
    console.log("Message object:", selectedMessage);
    if (!id) {
        toast({
            title: "Deletion Failed",
            description: "Message ID is missing. Cannot delete.",
            variant: "destructive",
        });
        return;
    }
    try {
      const messageRef = doc(db, `messages/${id}`);
      await deleteDoc(messageRef);
      toast({
        title: "Message Deleted",
        description: "The message has been removed from the inbox.",
      });
      setSelectedMessage(null); // Close the dialog
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
      </div>

      <Dialog onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>
              Messages submitted by users via the contact form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <MessageSkeleton />
            ) : filteredMessages.length > 0 ? (
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                    <DialogTrigger asChild key={message.id}>
                        <div 
                            onClick={() => {
                                setSelectedMessage(message);
                                if (!message.read) {
                                    handleToggleRead({ ...message, read: false });
                                }
                            }}
                            className={cn(
                                "flex items-center gap-4 w-full p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                                !message.read && "bg-muted/60"
                            )}
                        >
                            <Circle className={cn("h-2.5 w-2.5 flex-shrink-0", !message.read ? "text-accent fill-accent" : "text-muted-foreground/30")}/>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                     <p className={cn("font-semibold truncate", !message.read && "font-bold")}>{message.name}</p>
                                     <p className="text-xs text-muted-foreground truncate hidden sm:block">{message.email}</p>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                            </div>
                            <div className="text-xs text-muted-foreground text-right whitespace-nowrap ml-auto pl-4">
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </div>
                        </div>
                  </DialogTrigger>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Inbox is empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">New contact messages will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedMessage && (
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className={cn("text-xl", !selectedMessage.read && "font-extrabold")}>{selectedMessage.subject}</DialogTitle>
                    <DialogDescription>
                        From: {selectedMessage.name} ({selectedMessage.email})
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Received: {formatDistanceToNow(new Date(selectedMessage.timestamp), { addSuffix: true })}
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg max-h-80 overflow-y-auto">
                        <p className="whitespace-pre-wrap text-foreground">{selectedMessage.message}</p>
                    </div>
                </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggleRead(selectedMessage)}>
                        {selectedMessage.read ? <ArchiveRestore className="mr-2 h-4 w-4"/> : <Archive className="mr-2 h-4 w-4"/>}
                        Mark as {selectedMessage.read ? 'Unread' : 'Read'}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this message.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(selectedMessage.id)} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete it
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DialogContent>
        )}
      </Dialog>
    </>
  );
}
