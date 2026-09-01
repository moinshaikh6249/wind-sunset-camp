
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    isLoading: boolean;
    color?: 'green' | 'blue' | 'purple' | 'orange';
}

const colorConfig = {
    green: {
        glow: 'shadow-[0_8px_24px_-12px_rgba(34,197,94,0.3)] hover:shadow-[0_16px_36px_-16px_rgba(34,197,94,0.45)]',
        textGlow: 'text-emerald-800 dark:text-emerald-300',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30',
        iconColor: 'text-emerald-700 dark:text-emerald-400',
    },
    orange: {
        glow: 'shadow-[0_8px_24px_-12px_rgba(245,158,11,0.35)] hover:shadow-[0_16px_36px_-16px_rgba(245,158,11,0.5)]',
        textGlow: 'text-amber-800 dark:text-amber-300',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30',
        iconColor: 'text-amber-700 dark:text-amber-400',
    },
    blue: {
        glow: 'shadow-[0_8px_24px_-12px_rgba(14,165,233,0.3)] hover:shadow-[0_16px_36px_-16px_rgba(14,165,233,0.45)]',
        textGlow: 'text-sky-800 dark:text-sky-300',
        iconBg: 'bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30',
        iconColor: 'text-sky-700 dark:text-sky-400',
    },
    purple: {
        glow: 'shadow-[0_8px_24px_-12px_rgba(168,85,247,0.3)] hover:shadow-[0_16px_36px_-16px_rgba(168,85,247,0.45)]',
        textGlow: 'text-purple-800 dark:text-purple-300',
        iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30',
        iconColor: 'text-purple-700 dark:text-purple-400',
    },
    default: {
        glow: 'shadow-[0_8px_24px_-12px_rgba(148,163,184,0.3)] hover:shadow-[0_16px_36px_-16px_rgba(148,163,184,0.45)]',
        textGlow: 'text-foreground',
        iconBg: 'bg-muted border border-border/40',
        iconColor: 'text-muted-foreground',
    }
};

export function StatCard({ title, value, icon: Icon, description, isLoading, color }: StatCardProps) {
    if (isLoading) {
      return (
        <Card className="glass-card rounded-2xl p-5 border border-border/40 bg-card/65 dark:bg-card/45">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            <Skeleton className="h-9 w-9 rounded-xl shimmer-bg" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
             <Skeleton className="h-8 w-20 mb-2 shimmer-bg" />
             <Skeleton className="h-3 w-36 shimmer-bg" />
          </CardContent>
        </Card>
      );
    }

    const styles = color ? colorConfig[color] : colorConfig.default;

    return (
        <Card className={cn(
            "relative overflow-hidden glass-card rounded-2xl p-5 border border-border/40 bg-card/65 dark:bg-card/45 transition-all duration-300 ease-out ios-press hover:-translate-y-1",
            styles.glow
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110", styles.iconBg)}>
                 <Icon className={cn("h-5 w-5", styles.iconColor)} />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className={cn(
                "text-3xl font-extrabold tracking-tight font-headline",
                styles.textGlow
             )}>
                {value}
            </div>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">{description}</p>
          </CardContent>
        </Card>
    );
}
