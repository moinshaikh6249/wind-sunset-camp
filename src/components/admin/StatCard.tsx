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
        shadow: 'shadow-[0_0_18px_rgba(34,197,94,0.25)] hover:shadow-[0_0_28px_rgba(34,197,94,0.4)]',
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500',
    },
    blue: {
        shadow: 'shadow-[0_0_18px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.4)]',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
    },
    purple: {
        shadow: 'shadow-[0_0_18px_rgba(168,85,247,0.25)] hover:shadow-[0_0_28px_rgba(168,85,247,0.4)]',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
    },
    orange: {
        shadow: 'shadow-[0_0_18px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
    },
    default: {
        shadow: 'shadow-sm hover:shadow-md',
        iconBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
    }
};

export function StatCard({ title, value, icon: Icon, description, isLoading, color }: StatCardProps) {

    if (isLoading) {
      return (
        <Card className="glass-card">
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
            "transition-all duration-300 ease-out transform hover:scale-[1.03] hover:-translate-y-1.5",
            "glass-card",
            styles.shadow
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={cn("p-3 rounded-full", styles.iconBg)}>
                 <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold leading-tight">{value}</div>
            <p className="text-xs text-muted-foreground/70">{description}</p>
          </CardContent>
        </Card>
    )
}

    