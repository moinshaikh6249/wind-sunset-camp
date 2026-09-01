"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AvailabilityStatus = "available" | "limited" | "fully_booked" | "error" | "loading" | null;

interface AvailabilityIndicatorProps {
  status: AvailabilityStatus;
  remaining?: number | null;
  capacity?: number | null;
  onRetry?: () => void;
  className?: string;
}

export function AvailabilityIndicator({
  status,
  remaining = null,
  capacity = null,
  onRetry,
  className,
}: AvailabilityIndicatorProps) {
  if (status === "loading") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3.5 rounded-2xl border border-border/40 bg-muted/30 backdrop-blur-md animate-pulse",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="h-3 w-3 rounded-full bg-amber-500/50 animate-ping" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-28 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted/60 rounded" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 backdrop-blur-md",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center space-x-2.5 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Unable to check live availability</span>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (status === "fully_booked") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300 backdrop-blur-md",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="font-bold text-xs text-rose-800 dark:text-rose-300">Fully Booked</div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80">0 spots remaining — Select another date</div>
        </div>
      </div>
    );
  }

  if (status === "limited") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 backdrop-blur-md",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="font-bold text-xs text-amber-800 dark:text-amber-300">Limited Spots Available</div>
          <div className="text-[11px] text-amber-700/90 dark:text-amber-400/90 font-medium">
            {remaining !== null ? `${remaining} spot${remaining === 1 ? "" : "s"} remaining` : "Hurry, few spots remaining!"}
          </div>
        </div>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 backdrop-blur-md",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-400/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
        <div>
          <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Spots Available</div>
          <div className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 font-medium">
            {remaining !== null ? `${remaining} spot${remaining === 1 ? "" : "s"} open` : "Open for booking"}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
