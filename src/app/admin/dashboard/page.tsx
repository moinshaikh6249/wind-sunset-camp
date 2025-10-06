'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CalendarCheck, Activity, UserPlus, BarChart3, LineChart } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { OverviewChart } from '@/components/admin/OverviewChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { UserSignupChart } from '@/components/admin/UserSignupChart';


export default function AdminDashboardPage() {
  const { user } = useUser();

  const displayName = user?.displayName || user?.email || 'Admin';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <h2 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}!</h2>
       <p className="text-muted-foreground">
          Here&apos;s a quick overview of your camp&apos;s performance.
        </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          description="+20.1% from last month"
        />
        <StatCard
          title="Active Bookings"
          value="+235"
          icon={CalendarCheck}
          description="+180.1% from last month"
        />
        <StatCard
          title="Total Users"
          value="+12,234"
          icon={Users}
          description="+19% from last month"
        />
         <StatCard
          title="New Signups (24h)"
          value="+57"
          icon={UserPlus}
          description="+2 since last hour"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-muted-foreground" />
              Bookings Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                User Signups
             </CardTitle>
            <CardDescription>
              You had 57 new signups in the last 7 days.
            </CardDescription>
          </CardHeader.
          <CardContent>
             <UserSignupChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                Recent Activity
             </CardTitle>
            <CardDescription>
              A feed of the latest activities across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
        {/* Placeholder for more content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Future Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>More widgets and data visualizations coming soon!</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
