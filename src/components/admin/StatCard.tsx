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
        shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]',
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500',
        borderColor: 'border-green-500/20'
    },
    blue: {
        shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-500/20'
    },
    purple: {
        shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        borderColor: 'border-purple-500/20'
    },
    orange: {
        shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        borderColor: 'border-orange-500/20'
    },
    default: {
        shadow: 'shadow-sm hover:shadow-md',
        iconBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
        borderColor: 'border-transparent'
    }
};

export function StatCard({ title, value, icon: Icon, description, isLoading, color }: StatCardProps) {

    if (isLoading) {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-9 w-20 mb-2" />
             <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      )
    }

    const styles = color ? colorConfig[color] : colorConfig.default;

    return (
        <Card className={cn(
            "transition-all duration-300 transform hover:scale-[1.03]",
            styles.shadow,
            styles.borderColor
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={cn("p-2 rounded-full", styles.iconBg)}>
                 <Icon className={cn("h-5 w-5", styles.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[34px] font-bold leading-tight">{value}</div>
            <p className="text-xs text-muted-foreground/80">{description}</p>
          </CardContent>
        </Card>
    )
}
