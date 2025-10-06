
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    isLoading: boolean;
}

export function StatCard({ title, value, icon: Icon, description, isLoading }: StatCardProps) {

    if (isLoading) {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-8 w-32 mb-2" />
             <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      )
    }

    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
    )
}
