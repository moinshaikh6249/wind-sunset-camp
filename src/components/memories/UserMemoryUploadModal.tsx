'use client';

import { useState, type FormEvent } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { uploadUserMemory } from '@/lib/memoriesApi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type UserMemoryUploadModalProps = {
  onSuccess?: () => void | Promise<void>;
};

export function UserMemoryUploadModal({ onSuccess }: UserMemoryUploadModalProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setImageFile(null);
    setCaption('');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!imageFile) {
      toast({
        title: 'Upload Photo is required',
        description: 'Please select an image before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption.trim());

      await uploadUserMemory(formData);

      toast({
        title: 'Success',
        description: 'Memory submitted for approval.',
      });

      handleClose();

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || 'Unable to submit memory. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Share Your Camp Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Camp Memory</DialogTitle>
          <DialogDescription>Upload your camping photo and add a short caption.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memory-image">Upload Photo</Label>
            <Input
              id="memory-image"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory-caption">Caption</Label>
            <Textarea
              id="memory-caption"
              placeholder="Bonfire night with friends"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
