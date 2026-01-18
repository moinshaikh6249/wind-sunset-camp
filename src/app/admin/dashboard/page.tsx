'use client';

import { auth, db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, Activity, UserPlus, LineChart, BarChart3, UserCheck } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { OverviewChart } from '@/components/admin/OverviewChart';
import { RecentActivity, type Activity as ActivityType } from '@/components/admin/RecentActivity';
import { UserSignupChart } from '@/components/admin/UserSignupChart';
import { useMemo } from 'react';
import { subDays, format, getMonth } from 'date-fns';

type DbUser = {
  firstName: string;
  lastName?: string;
  email: string;
  photoURL?: string;
  history?: { [key: string]: { type: string; description: string; timestamp: string } };
  bookings?: { [key: string]: { campName: string; bookingDate: string } };
};

export default function AdminDashboardPage() {
  const [user] = useAuthState(auth);
  
  const [usersData, isLoading] = useCollectionData<DbUser>(collection(db, 'users'));

  const stats = useMemo(() => {
    if (!usersData) {
      return {
        totalUsers: 0,
        activeBookings: 0,
        activeUsers: 0,
        newSignups24h: 0,
        signupChartData: [],
        bookingsChartData: [],
        recentActivities: [],
      };
    }

    const usersArray = usersData;
    const totalUsers = usersArray.length;
    
    let activeBookings = 0;
    let activeUsers = 0;
    const now = new Date();
    const twentyFourHoursAgo = subDays(now, 1);
    let newSignups24h = 0;
    
    const signupCounts = Array(7).fill(0).map((_, i) => ({
      date: format(subDays(now, i), 'EEE'),
      signups: 0,
    })).reverse();

    const bookingCounts = Array(12).fill(0).map((_, i) => ({
      name: format(new Date(now.getFullYear(), i), 'MMM'),
      total: 0,
    }));

    const recentActivities: ActivityType[] = [];

    for (const userData of usersArray) {
      if (userData.bookings) {
        const bookingCount = Object.keys(userData.bookings).length;
        if (bookingCount > 0) {
            activeUsers++;
            activeBookings += bookingCount;
        }

        Object.values(userData.bookings).forEach(booking => {
            const month = getMonth(new Date(booking.bookingDate));
            if (bookingCounts[month]) {
                bookingCounts[month].total++;
            }
        });
      }

      if (userData.history) {
        Object.values(userData.history).forEach(activity => {
          const activityDate = new Date(activity.timestamp);
          // Recent Activities
          if(recentActivities.length < 5) {
            recentActivities.push({
              user: {
                name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
                email: userData.email,
                avatar: userData.photoURL,
                fallback: (userData.firstName || 'U').charAt(0),
              },
              action: activity.type === 'signup' ? 'signed up' : `booked a camp`,
              target: activity.type === 'booking' ? activity.description.replace('Booked ', '') : '',
              timestamp: activity.timestamp,
            });
          }

          // New Signups (24h)
          if (activity.type === 'signup' && activityDate > twentyFourHoursAgo) {
            newSignups24h++;
          }
          
          // Signup Chart Data (Last 7 days)
          for (let i = 0; i < 7; i++) {
            const day = subDays(now, i);
            if (format(activityDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && activity.type === 'signup') {
               const dayIndex = 6-i;
               if(signupCounts[dayIndex]) signupCounts[dayIndex].signups++;
            }
          }
        });
      }
    }

    recentActivities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


    return {
      totalUsers,
      activeBookings,
      activeUsers,
      newSignups24h,
      signupChartData: signupCounts,
      bookingsChartData: bookingCounts,
      recentActivities: recentActivities.slice(0,5),
    };
  }, [usersData]);


  const displayName = user?.displayName || user?.email || 'Admin';

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
       <div className="animate-fade-slide-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-3xl font-bold tracking-tight text-heading-color animate-text-glow">Welcome back, {displayName}!</h2>
        <p className="text-muted-foreground mt-2">
            Here&apos;s a quick overview of your camp&apos;s performance.
        </p>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-slide-in" style={{ animationDelay: '200ms' }}>
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings.toLocaleString()}
          icon={CalendarCheck}
          description="Total number of bookings"
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Total registered users"
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={UserCheck}
          description="Users with at least one booking"
          isLoading={isLoading}
          color="purple"
        />
         <StatCard
          title="New Signups (24h)"
          value={`+${stats.newSignups24h}`}
          icon={UserPlus}
          description="New users in the last 24 hours"
          isLoading={isLoading}
          color="orange"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-slide-in" style={{ animationDelay: '300ms' }}>
        <Card className="lg:col-span-4 glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-muted-foreground" />
              Bookings Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={stats.bookingsChartData} isLoading={isLoading} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 glass-card">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                User Signups
             </CardTitle>
            <CardDescription>
              New user signups in the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <UserSignupChart data={stats.signupChartData} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-slide-in" style={{ animationDelay: '400ms' }}>
        <Card className="lg:col-span-4 glass-card">
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
            <RecentActivity activities={stats.recentActivities} isLoading={isLoading} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 glass-card">
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
