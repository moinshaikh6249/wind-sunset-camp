
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export type Activity = {
  user: {
    name: string;
    email: string;
    avatar: string | undefined;
    fallback: string;
  };
  action: string;
  target: string;
  timestamp: string;
};

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No recent activities found.</p>;
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt="Avatar" />
            <AvatarFallback>{activity.user.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user.name}
              <span className="text-muted-foreground font-normal"> {activity.action} </span> 
              {activity.target && <span className="font-semibold">{activity.target}</span>}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
