'use client';

import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[50px] w-full rounded-lg" />
      <Skeleton className="h-[50px] w-full rounded-lg" />
      <Skeleton className="h-[50px] w-full rounded-lg" />
    </div>
  )
}

export default function MessagesPage() {
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  // Read from the single, top-level 'messages' collection
  const messagesRef = useMemo(() => collection(db, 'messages'), []);
  const [messages, isLoading] = useCollectionData<ContactMessage>(messagesRef, { idField: 'id' });

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
    try {
      const messageRef = doc(db, `messages/${message.id}`);
      await updateDoc(messageRef, { read: !message.read });

      toast({
        title: `Message marked as ${!message.read ? 'read' : 'unread'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update message status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const messageRef = doc(db, `messages/${id}`);
      await deleteDoc(messageRef);
      toast({
        title: "Message Deleted",
        description: "The message has been removed from the inbox.",
      });
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
            <Accordion type="multiple" className="w-full">
              {filteredMessages.map((message) => (
                <AccordionItem value={message.id} key={message.id}>
                  <AccordionTrigger 
                    className={cn(
                        "hover:no-underline font-medium p-4 rounded-lg hover:bg-muted/50",
                        !message.read && "font-bold"
                     )}
                    >
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex flex-col items-start gap-1 text-sm text-left">
                            <div className="font-semibold">{message.name}</div>
                            <div className="text-xs text-muted-foreground">{message.email}</div>
                        </div>
                        <p className="flex-1 text-left px-4 truncate">{message.subject}</p>
                        <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-muted/20 rounded-b-lg">
                    <p className="mb-6 whitespace-pre-wrap">{message.message}</p>
                    <div className="flex justify-end gap-2">
                       <Button variant="outline" size="sm" onClick={() => handleToggleRead(message)}>
                        {message.read ? <ArchiveRestore className="mr-2 h-4 w-4"/> : <Archive className="mr-2 h-4 w-4"/>}
                        Mark as {message.read ? 'Unread' : 'Read'}
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
                            <AlertDialogAction onClick={() => handleDelete(message.id)} className="bg-destructive hover:bg-destructive/90">
                              Yes, delete it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-16">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Messages</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your inbox is currently empty.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
