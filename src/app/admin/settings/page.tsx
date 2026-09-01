
'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Laptop } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl font-headline text-foreground">Admin Settings</h1>
        <p className="text-xs text-muted-foreground">Manage administrative preferences, visual appearance, and dashboard theme.</p>
      </div>

      <Card className="glass-card border border-border/40 bg-card/65 dark:bg-card/45 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold">Appearance & Theme</CardTitle>
          <CardDescription className="text-xs">
            Choose between Light (Sunset Golden Hour) and Dark (Starry Lakeside Night) theme modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Dashboard Theme</h3>
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
              className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/40 bg-muted/20 p-5 hover:bg-muted/40 cursor-pointer transition-all peer-data-[state=checked]:border-amber-500 dark:peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-amber-500/10 dark:peer-data-[state=checked]:bg-emerald-500/10"
                >
                  <Sun className="mb-2 h-6 w-6 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">Light Mode</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Golden Hour</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/40 bg-muted/20 p-5 hover:bg-muted/40 cursor-pointer transition-all peer-data-[state=checked]:border-amber-500 dark:peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-amber-500/10 dark:peer-data-[state=checked]:bg-emerald-500/10"
                >
                  <Moon className="mb-2 h-6 w-6 text-emerald-400" />
                  <span className="text-xs font-bold text-foreground">Dark Mode</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Starry Night</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-border/40 bg-muted/20 p-5 hover:bg-muted/40 cursor-pointer transition-all peer-data-[state=checked]:border-amber-500 dark:peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-amber-500/10 dark:peer-data-[state=checked]:bg-emerald-500/10"
                >
                  <Laptop className="mb-2 h-6 w-6 text-sky-400" />
                  <span className="text-xs font-bold text-foreground">System</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Auto Match</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
