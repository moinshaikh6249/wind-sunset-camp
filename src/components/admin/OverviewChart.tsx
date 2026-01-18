
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";

interface OverviewChartProps {
    data: { name: string; total: number }[];
    isLoading: boolean;
}


export function OverviewChart({ data, isLoading }: OverviewChartProps) {
    const { theme } = useTheme();

    const [primaryColor, mutedColor] = useMemo(() => {
        if (typeof window === 'undefined') return ["#000000", "#999999"];
        const styles = getComputedStyle(document.documentElement);
        const primary = `hsl(${styles.getPropertyValue("--primary")})`;
        const muted = `hsl(${styles.getPropertyValue("--muted-foreground")})`;
        return [primary, muted];
    }, [theme]);

    if (isLoading) {
        return <Skeleton className="h-[350px] w-full shimmer-bg" />
    }


  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <XAxis
          dataKey="name"
          stroke={mutedColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={mutedColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)'
            }}
            formatter={(value) => [value, 'Bookings']}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
        <Bar dataKey="total" fill={primaryColor} radius={[4, 4, 0, 0]} name="Bookings" filter="url(#glow)"/>
      </BarChart>
    </ResponsiveContainer>
  )
}
