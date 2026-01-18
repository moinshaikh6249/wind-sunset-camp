
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";


interface UserSignupChartProps {
  data: { date: string; signups: number }[];
  isLoading: boolean;
}


export function UserSignupChart({ data, isLoading }: UserSignupChartProps) {
    const { theme } = useTheme();
    const [primaryColor, mutedColor] = useMemo(() => {
        if (typeof window === 'undefined') return ["#000000", "#999999"];
        const styles = getComputedStyle(document.documentElement);
        const primary = `hsl(${styles.getPropertyValue("--primary")})`;
        const muted = `hsl(${styles.getPropertyValue("--muted-foreground")})`;
        return [primary, muted];
    }, [theme]);

    if (isLoading) {
      return <Skeleton className="h-[250px] w-full shimmer-bg" />
    }
    
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <XAxis
          dataKey="date"
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
          allowDecimals={false}
        />
        <Tooltip 
             contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)'
            }}
        />
          <Bar dataKey="signups" fill={primaryColor} radius={[4, 4, 0, 0]} filter="url(#glow)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
