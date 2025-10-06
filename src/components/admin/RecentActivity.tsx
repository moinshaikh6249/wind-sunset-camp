
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    action: "created a new booking for",
    target: "Mountain Explorer",
    value: "+$250.00",
    avatar: "/avatars/01.png",
    fallback: "OM",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    action: "cancelled a booking for",
    target: "Summer Adventure Camp",
    value: "-$150.00",
    avatar: "/avatars/02.png",
    fallback: "JL",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    action: "signed up as a new user",
    target: "",
    value: "",
    avatar: "/avatars/03.png",
    fallback: "IN",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    action: "updated their profile",
    target: "",
    value: "",
    avatar: "/avatars/04.png",
    fallback: "WK",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    action: "created a new booking for",
    target: "Coastal Survival",
    value: "+$350.00",
    avatar: "/avatars/05.png",
    fallback: "SD",
  },
];


export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.avatar} alt="Avatar" />
            <AvatarFallback>{activity.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}
              <span className="text-muted-foreground"> {activity.action} </span> 
              {activity.target && <span className="font-semibold">{activity.target}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{activity.email}</p>
          </div>
          <div className="ml-auto font-medium">{activity.value}</div>
        </div>
      ))}
    </div>
  )
}
