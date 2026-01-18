'use client';

import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { subDays, format, parseISO } from 'date-fns';
import { Package, Users, CalendarClock, DollarSign, FileText, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

type Booking = {
  bookingDate: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  status?: 'Approved' | 'Pending' | 'Canceled';
  userId: string;
};

type HistoryItem = {
  type: string;
  timestamp: string;
};

type DbUser = {
  bookings?: { [bookingId: string]: Booking };
  history?: { [historyId: string]: HistoryItem };
};

const COLORS = {
  Approved: 'hsl(var(--chart-2))', 
  Pending: 'hsl(var(--chart-4))',
  Canceled: 'hsl(var(--chart-1))',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export default function ReportsPage() {
  const { theme } = useTheme();

  const [usersData, isLoading] = useCollectionData<DbUser>(collection(db, 'users'));
  
  const [primaryColor, mutedColor] = useMemo(() => {
        if (typeof window === 'undefined') return ["#000000", "#999999"];
        const styles = getComputedStyle(document.documentElement);
        const primary = `hsl(${styles.getPropertyValue("--primary")})`;
        const muted = `hsl(${styles.getPropertyValue("--muted-foreground")})`;
        return [primary, muted];
  }, [theme]);


  const reportData = useMemo(() => {
    if (!usersData) {
      return {
        bookingsByCamp: [],
        bookingStatusDistribution: [],
        userGrowth: [],
      };
    }

    const bookingsByCamp: { [key: string]: number } = {};
    const bookingStatusCount = { Approved: 0, Pending: 0, Canceled: 0 };
    const signupCounts: { [key: string]: number } = {};

    usersData.forEach(user => {
      if (user.bookings) {
        Object.values(user.bookings).forEach(booking => {
          bookingsByCamp[booking.campName] = (bookingsByCamp[booking.campName] || 0) + 1;
          const status = booking.status || 'Pending';
          if (status in bookingStatusCount) {
            bookingStatusCount[status]++;
          }
        });
      }

      if (user.history) {
        Object.values(user.history).forEach(item => {
          if (item.type === 'signup') {
            const date = format(parseISO(item.timestamp), 'yyyy-MM-dd');
            signupCounts[date] = (signupCounts[date] || 0) + 1;
          }
        });
      }
    });

    const bookingsByCampArray = Object.entries(bookingsByCamp)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const bookingStatusDistribution = Object.entries(bookingStatusCount)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    const today = new Date();
    const userGrowth = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(today, 29 - i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      return {
        date: format(date, 'MMM d'),
        signups: signupCounts[formattedDate] || 0,
      };
    });

    return { bookingsByCamp: bookingsByCampArray, bookingStatusDistribution, userGrowth };
  }, [usersData]);

  const hasData = useMemo(() => 
    reportData.bookingsByCamp.length > 0 ||
    reportData.bookingStatusDistribution.length > 0 ||
    reportData.userGrowth.some(d => d.signups > 0),
  [reportData]);
  
  const ChartSkeletons = () => (
     <>
        <Card className="glass-card">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 shimmer-bg" />
                <Skeleton className="h-4 w-1/2 shimmer-bg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full shimmer-bg" />
            </CardContent>
        </Card>
        <Card className="glass-card">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 shimmer-bg" />
                <Skeleton className="h-4 w-1/2 shimmer-bg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full shimmer-bg" />
            </CardContent>
        </Card>
        <Card className="glass-card md:col-span-2 lg:col-span-1">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 shimmer-bg" />
                <Skeleton className="h-4 w-1/2 shimmer-bg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full shimmer-bg" />
            </CardContent>
        </Card>
     </>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center text-center p-10 bg-muted/30 rounded-2xl border-2 border-dashed">
        <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4"/>
        <h3 className="text-xl font-semibold">Waiting for activity…</h3>
        <p className="text-muted-foreground mt-2">Your analytics will grow as users start booking.</p>
    </div>
  )

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <h1 className="text-3xl font-bold tracking-tight text-heading-color animate-text-glow">Reports & Analytics</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <ChartSkeletons /> : !hasData ? <EmptyState /> : (
            <>
                <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="text-muted-foreground"/> Most Popular Camps</CardTitle>
                    <CardDescription>Number of bookings per camp.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reportData.bookingsByCamp} layout="vertical" margin={{ left: 25 }}>
                        <XAxis type="number" stroke={mutedColor} fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke={mutedColor} fontSize={12} width={100} tick={{ fill: mutedColor }} />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--muted))' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                            }}
                         />
                        <Bar dataKey="count" fill={primaryColor} radius={[0, 4, 4, 0]} name="Bookings" />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarClock className="text-muted-foreground"/> Booking Status</CardTitle>
                    <CardDescription>Distribution of booking statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                            data={reportData.bookingStatusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            >
                            {reportData.bookingStatusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                            ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                <Card className="glass-card md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LineChartIcon className="text-muted-foreground"/> User Growth</CardTitle>
                    <CardDescription>New signups over the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={reportData.userGrowth}>
                        <XAxis dataKey="date" stroke={mutedColor} fontSize={12} />
                        <YAxis stroke={mutedColor} fontSize={12} allowDecimals={false} />
                        <Tooltip 
                             contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                            }}
                        />
                        <Line type="monotone" dataKey="signups" name="Signups" stroke={primaryColor} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
            </>
        )}
      </div>
    </div>
  );
}
