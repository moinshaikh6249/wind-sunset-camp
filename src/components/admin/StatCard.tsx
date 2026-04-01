
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
    glow: 'shadow-[0_12px_28px_-20px_rgba(34,197,94,0.75)] hover:shadow-[0_24px_46px_-24px_rgba(34,197,94,0.9)]',
    textGlow: '[text-shadow:0_0_16px_rgba(34,197,94,0.62)]',
    iconBg: 'bg-gradient-to-br from-green-400/20 to-green-600/10 ring-1 ring-green-400/25',
    iconColor: 'text-green-300',
    },
    blue: {
    glow: 'shadow-[0_12px_28px_-20px_rgba(59,130,246,0.75)] hover:shadow-[0_24px_46px_-24px_rgba(59,130,246,0.9)]',
    textGlow: '[text-shadow:0_0_16px_rgba(59,130,246,0.62)]',
    iconBg: 'bg-gradient-to-br from-blue-400/20 to-blue-600/10 ring-1 ring-blue-400/25',
    iconColor: 'text-blue-300',
    },
    purple: {
    glow: 'shadow-[0_12px_28px_-20px_rgba(168,85,247,0.75)] hover:shadow-[0_24px_46px_-24px_rgba(168,85,247,0.9)]',
    textGlow: '[text-shadow:0_0_16px_rgba(168,85,247,0.62)]',
    iconBg: 'bg-gradient-to-br from-purple-400/20 to-purple-600/10 ring-1 ring-purple-400/25',
    iconColor: 'text-purple-300',
    },
    orange: {
    glow: 'shadow-[0_12px_28px_-20px_rgba(249,115,22,0.78)] hover:shadow-[0_24px_46px_-24px_rgba(249,115,22,0.92)]',
    textGlow: '[text-shadow:0_0_16px_rgba(249,115,22,0.62)]',
    iconBg: 'bg-gradient-to-br from-orange-400/20 to-orange-600/10 ring-1 ring-orange-400/30',
    iconColor: 'text-orange-300',
    },
    default: {
    glow: 'shadow-[0_10px_20px_-16px_rgba(148,163,184,0.7)] hover:shadow-[0_18px_32px_-18px_rgba(148,163,184,0.8)]',
        textGlow: '',
    iconBg: 'bg-muted/60 ring-1 ring-white/10',
        iconColor: 'text-muted-foreground',
    }
};

export function StatCard({ title, value, icon: Icon, description, isLoading, color }: StatCardProps) {

    if (isLoading) {
      return (
        <Card className="glass-card rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24 shimmer-bg" />
            <Skeleton className="h-10 w-10 rounded-full shimmer-bg" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-20 mb-2 shimmer-bg" />
             <Skeleton className="h-3 w-40 shimmer-bg" />
          </CardContent>
        </Card>
      )
    }

    const styles = color ? colorConfig[color] : colorConfig.default;

    return (
        <Card className={cn(
        "relative overflow-hidden border border-white/10 bg-slate-900/55 transition-all duration-300 ease-out",
        "transform hover:scale-[1.03] hover:-translate-y-1.5",
        "glass-card rounded-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(34,197,94,0.08),transparent_35%,rgba(249,115,22,0.08))] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
            styles.glow
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <div className={cn("rounded-full p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]", styles.iconBg)}>
                 <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
                "text-4xl font-bold leading-tight",
                styles.textGlow
             )}>
                {value}
            </div>
            <p className="text-xs text-muted-foreground/70">{description}</p>
          </CardContent>
        </Card>
    )
}
