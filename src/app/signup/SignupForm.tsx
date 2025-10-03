
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useDatabase, useStorage } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  profilePicture: z.instanceof(File).optional(),
});

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const database = useDatabase();
  const storage = useStorage();
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      password: "",
      profilePicture: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("profilePicture", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      let photoURL = "";
      if (values.profilePicture) {
        const file = values.profilePicture;
        const filePath = `profile-pictures/${user.uid}/${file.name}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, file);
        photoURL = await getDownloadURL(uploadResult.ref);
      }
      
      await updateProfile(user, { 
        displayName: values.name,
        photoURL: photoURL,
       });

      const nameParts = values.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const userProfile = {
        firstName,
        lastName,
        email: values.email,
        phone: values.mobileNumber,
        photoURL,
      };

      const userRef = dbRef(database, `users/${user.uid}`);
      await set(userRef, userProfile);
      
      const historyRef = dbRef(database, `users/${user.uid}/history`);
      await set(dbRef(database, `users/${user.uid}/history/${Date.now()}`), {
        type: 'signup',
        description: 'Account created',
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Account Created!",
        description: "You have been successfully signed up and logged in.",
      });

      router.push('/dashboard');

    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during sign up.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. It must be at least 6 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'storage/unauthorized':
          errorMessage = 'You do not have permission to upload files. Please check storage rules.';
          break;
      }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="bg-background/60 dark:bg-background/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="profilePicture" className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Choose Profile Picture
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="profilePicture"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Appleseed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile No.</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="123-456-7890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full btn-glow"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-custom-green hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

    