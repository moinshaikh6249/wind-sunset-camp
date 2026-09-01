'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Mail,
  Trash2,
  Archive,
  ArchiveRestore,
  Circle,
  Inbox,
  CheckCheck,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSearch } from '@/context/SearchProvider';

type ContactMessage = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string | null;
};

const getMessageId = (message?: Partial<ContactMessage> | null) => message?._id || message?.id || '';

function MessageSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border border-border/40 bg-muted/10">
          <Skeleton className="h-4.5 w-4.5 rounded-md" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-4 w-1/5" />
        </div>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const { toast } = useToast();
  const { searchQuery } = useSearch();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Multi-select & Bulk actions state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ success: boolean; messages: Array<Partial<ContactMessage>> }>('/admin/messages');
      const rawList = data.messages || (data as any).data || [];
      const normalized = (Array.isArray(rawList) ? rawList : [])
        .map((message) => {
          const messageId = getMessageId(message);
          if (!messageId) return null;

          return {
            _id: messageId,
            id: messageId,
            name: String(message.name || 'Unknown'),
            email: String(message.email || ''),
            subject: String(message.subject || 'No subject'),
            message: String(message.message || ''),
            timestamp: String((message as any).timestamp || new Date().toISOString()),
            read: Boolean(message.read),
            userId: (message.userId as string) || null,
          } as ContactMessage;
        })
        .filter((message): message is ContactMessage => Boolean(message));

      setMessages(normalized);
    } catch (error: any) {
      toast({
        title: 'Failed to load messages',
        description: error?.message || 'Unable to fetch messages.',
        variant: 'destructive',
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return sortedMessages;
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedMessages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(lowercasedQuery) ||
        msg.email.toLowerCase().includes(lowercasedQuery) ||
        (msg.subject && msg.subject.toLowerCase().includes(lowercasedQuery)) ||
        msg.message.toLowerCase().includes(lowercasedQuery)
    );
  }, [sortedMessages, searchQuery]);

  // Clean up selectedIds when filtered list changes (remove IDs no longer present)
  const visibleIdsSet = useMemo(() => {
    return new Set(filteredMessages.map((m) => getMessageId(m)));
  }, [filteredMessages]);

  const validSelectedIds = useMemo(() => {
    return Array.from(selectedIds).filter((id) => visibleIdsSet.has(id));
  }, [selectedIds, visibleIdsSet]);

  const selectedCount = validSelectedIds.length;

  // Select all control state
  const selectAllState: boolean | 'indeterminate' = useMemo(() => {
    if (filteredMessages.length === 0 || selectedCount === 0) return false;
    if (selectedCount === filteredMessages.length) return true;
    return 'indeterminate';
  }, [filteredMessages.length, selectedCount]);

  const handleToggleSelectAll = () => {
    if (selectAllState === true) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => getMessageId(m))));
    }
  };

  const handleToggleSelectMessage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk actions
  const selectedMessagesList = useMemo(() => {
    const idsSet = new Set(validSelectedIds);
    return filteredMessages.filter((m) => idsSet.has(getMessageId(m)));
  }, [filteredMessages, validSelectedIds]);

  const hasUnreadInSelection = useMemo(() => {
    return selectedMessagesList.some((m) => !m.read);
  }, [selectedMessagesList]);

  const handleBulkMarkAsRead = async () => {
    if (validSelectedIds.length === 0 || isBulkActionLoading) return;

    setIsBulkActionLoading(true);
    try {
      try {
        await api.put('/admin/messages/bulk-read', {
          ids: validSelectedIds,
          read: true,
        });
      } catch (bulkErr) {
        await Promise.all(
          validSelectedIds.map((id) =>
            api.put(`/admin/messages/${id}/read`, { messageId: id, read: true })
          )
        );
      }

      toast({
        title: 'Messages Updated',
        description: `${validSelectedIds.length} ${
          validSelectedIds.length === 1 ? 'message' : 'messages'
        } marked as read.`,
      });

      setSelectedIds(new Set());
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error?.message || 'Failed to mark selected messages as read.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkMarkAsUnread = async () => {
    if (validSelectedIds.length === 0 || isBulkActionLoading) return;

    setIsBulkActionLoading(true);
    try {
      try {
        await api.put('/admin/messages/bulk-read', {
          ids: validSelectedIds,
          read: false,
        });
      } catch (bulkErr) {
        await Promise.all(
          validSelectedIds.map((id) =>
            api.put(`/admin/messages/${id}/read`, { messageId: id, read: false })
          )
        );
      }

      toast({
        title: 'Messages Updated',
        description: `${validSelectedIds.length} ${
          validSelectedIds.length === 1 ? 'message' : 'messages'
        } marked as unread.`,
      });

      setSelectedIds(new Set());
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error?.message || 'Failed to mark selected messages as unread.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (validSelectedIds.length === 0 || isBulkActionLoading) return;

    setIsBulkActionLoading(true);
    try {
      try {
        await api.delete('/admin/messages/bulk-delete', {
          data: { ids: validSelectedIds },
        });
      } catch (bulkErr) {
        await Promise.all(validSelectedIds.map((id) => api.delete(`/admin/messages/${id}`)));
      }

      toast({
        title: 'Messages Deleted',
        description: `${validSelectedIds.length} ${
          validSelectedIds.length === 1 ? 'message' : 'messages'
        } deleted.`,
      });

      setSelectedIds(new Set());
      setIsBulkDeleteDialogOpen(false);
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete selected messages.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Single message actions
  const handleToggleRead = async (message: ContactMessage) => {
    const messageId = getMessageId(message);
    if (!messageId) {
      toast({
        title: 'Operation Failed',
        description: 'Message ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.put(`/admin/messages/${messageId}/read`, {
        messageId,
        read: !message.read,
      });
      toast({
        title: `Message marked as ${message.read ? 'unread' : 'read'}`,
      });
      setSelectedMessage({ ...message, _id: messageId, id: messageId, read: !message.read });
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not update message status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({
        title: 'Deletion Failed',
        description: 'Message ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.delete(`/admin/messages/${id}`);
      toast({
        title: 'Message Deleted',
        description: 'The message has been removed from the inbox.',
      });
      setSelectedMessage(null);
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'An error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenMessage = (message: ContactMessage) => {
    const normalizedMessage = {
      ...message,
      _id: getMessageId(message),
      id: getMessageId(message),
    };

    setSelectedMessage(normalizedMessage);

    if (!normalizedMessage.read) {
      handleToggleRead(normalizedMessage);
    }
  };

  return (
    <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-slide-in">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl font-headline text-foreground">
              Inbox
            </h1>
            <p className="text-xs text-muted-foreground">
              Read, organize, and manage guest contact inquiries.
            </p>
          </div>
        </div>

        <Card className="glass-card border border-border/40 bg-card/65 dark:bg-card/45 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Contact Messages</CardTitle>
                <CardDescription className="text-xs">
                  Direct contact form submissions from website visitors.
                </CardDescription>
              </div>

              {/* Select All Bar (when messages exist) */}
              {!isLoading && filteredMessages.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    id="select-all-messages"
                    checked={selectAllState}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="Select all visible messages"
                  />
                  <label
                    htmlFor="select-all-messages"
                    className="cursor-pointer font-medium select-none text-foreground"
                  >
                    Select All ({filteredMessages.length})
                  </label>
                </div>
              )}
            </div>

            {/* Floating/Sticky Bulk Action Toolbar */}
            {selectedCount > 0 && (
              <div className="mt-4 animate-fade-slide-in rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:border-emerald-500/40 dark:bg-emerald-500/10 p-3 shadow-lg backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 items-center justify-center rounded-full bg-amber-500/20 px-2.5 text-xs font-bold text-amber-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {selectedCount} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBulkActionLoading || !hasUnreadInSelection}
                      onClick={handleBulkMarkAsRead}
                      className="h-8.5 rounded-xl border-amber-500/30 bg-background/80 text-xs font-semibold hover:bg-amber-500/20 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20"
                    >
                      {isBulkActionLoading ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-emerald-400" />
                      )}
                      Mark as Read
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBulkActionLoading}
                      onClick={handleBulkMarkAsUnread}
                      className="h-8.5 rounded-xl border-amber-500/30 bg-background/80 text-xs font-semibold hover:bg-amber-500/20 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20"
                    >
                      <Circle className="mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-emerald-400" />
                      Mark as Unread
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isBulkActionLoading}
                      onClick={() => setIsBulkDeleteDialogOpen(true)}
                      className="h-8.5 rounded-xl text-xs font-semibold shadow-sm"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isBulkActionLoading}
                      onClick={handleClearSelection}
                      className="h-8.5 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <MessageSkeleton />
            ) : filteredMessages.length > 0 ? (
              <div className="space-y-2">
                {filteredMessages.map((message) => {
                  const messageId = getMessageId(message);
                  const isSelected = selectedIds.has(messageId);

                  return (
                    <div
                      key={messageId}
                      onClick={() => handleOpenMessage(message)}
                      className={cn(
                        'group flex items-center gap-3 w-full p-3 sm:p-3.5 rounded-2xl border border-border/40 bg-muted/20 cursor-pointer transition-all duration-200 hover:border-amber-500/40 dark:hover:border-emerald-500/40 hover:shadow-md',
                        !message.read && 'bg-amber-500/10 dark:bg-emerald-500/10 border-amber-500/30 dark:border-emerald-500/30',
                        isSelected && 'border-amber-500/60 dark:border-emerald-500/60 bg-amber-500/15 dark:bg-emerald-500/15 shadow-sm ring-1 ring-amber-500/30 dark:ring-emerald-500/30'
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center p-1"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectMessage(messageId)}
                          aria-label={`Select message from ${message.name}`}
                          className="h-4.5 w-4.5"
                        />
                      </div>

                      {/* Read/Unread status dot */}
                      <Circle
                        className={cn(
                          'h-2.5 w-2.5 flex-shrink-0 transition-colors',
                          !message.read
                            ? 'text-amber-600 dark:text-emerald-400 fill-amber-600 dark:fill-emerald-400'
                            : 'text-muted-foreground/30'
                        )}
                        aria-hidden
                      />

                      {/* Content preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p
                            className={cn(
                              'text-xs font-semibold truncate text-foreground',
                              !message.read && 'font-extrabold'
                            )}
                          >
                            {message.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate hidden sm:block font-mono">
                            {message.email}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-[11px] text-muted-foreground text-right whitespace-nowrap ml-auto pl-2 sm:pl-4">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border/40">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-base font-bold text-foreground">No messages yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">Guest contact inquiries will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedCount} {selectedCount === 1 ? 'message' : 'messages'}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently remove the selected {selectedCount === 1 ? 'message' : 'messages'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBulkActionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleBulkDelete();
                }}
                disabled={isBulkActionLoading}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                {isBulkActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Messages'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Single Message Detail Dialog */}
        {selectedMessage && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn('text-xl', !selectedMessage.read && 'font-extrabold')}>
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription>
                From: {selectedMessage.name} ({selectedMessage.email})
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Received: {formatDistanceToNow(new Date(selectedMessage.timestamp), { addSuffix: true })}
              </p>
              <div className="p-4 bg-muted/50 rounded-xl max-h-80 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleRead({ ...selectedMessage, _id: selectedMessage._id })}
                className="rounded-xl"
              >
                {selectedMessage.read ? (
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Mark as {selectedMessage.read ? 'Unread' : 'Read'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="rounded-xl">
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
                    <AlertDialogAction
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Yes, delete it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}

