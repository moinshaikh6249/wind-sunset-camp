
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useTheme } from "next-themes";
import { useMemo } from "react";

const data = [
  { date: "Mon", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Tue", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Wed", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Thu", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Fri", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Sat", signups: Math.floor(Math.random() * 20) + 5 },
  { date: "Sun", signups: Math.floor(Math.random() * 20) + 5 },
]

export function UserSignupChart() {
    const { theme } = useTheme();
    const [primaryColor, mutedColor] = useMemo(() => {
        if (typeof window === 'undefined') return ["#000000", "#999999"];
        const styles = getComputedStyle(document.documentElement);
        const primary = `hsl(${styles.getPropertyValue("--primary")})`;
        const muted = `hsl(${styles.getPropertyValue("--muted-foreground")})`;
        return [primary, muted];
    }, [theme]);
    
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
        />
        <Tooltip 
             contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))'
            }}
        />
          <Bar dataKey="signups" fill={primaryColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
