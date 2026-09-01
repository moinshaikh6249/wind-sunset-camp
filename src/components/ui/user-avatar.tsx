"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    name?: string;
    email?: string;
    photoURL?: string;
    avatarUrl?: string;
  } | null;
  src?: string;
  fallbackText?: string;
  className?: string;
  sizeClassName?: string;
}

export function UserAvatar({
  user,
  src,
  fallbackText,
  className,
  sizeClassName = "h-10 w-10",
}: UserAvatarProps) {
  const photo = src || user?.photoURL || user?.avatarUrl;

  const getInitials = () => {
    if (fallbackText) return fallbackText.slice(0, 2).toUpperCase();

    const firstName = user?.firstName?.trim() || "";
    const lastName = user?.lastName?.trim() || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "WS";
  };

  return (
    <Avatar
      className={cn(
        sizeClassName,
        "relative overflow-hidden border border-border/50 shadow-sm ring-2 ring-amber-500/20 dark:ring-emerald-500/20 transition-all duration-300",
        className
      )}
    >
      {photo ? (
        <AvatarImage
          src={photo}
          alt={user?.displayName || user?.email || "User Avatar"}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-amber-500 via-emerald-600 to-emerald-800 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-inner">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
