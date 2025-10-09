
'use client';

import Link from "next/link";
import { Home, Settings, Users2, CalendarCheck, BarChart, Tent, GalleryVertical, Mail, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/camps", label: "Camps", icon: Tent },
    { href: "/admin/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
];

const settingsLink = { href: "/admin/settings", label: "Settings", icon: Settings };

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <TooltipProvider>
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <Tent className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Wind & Sunset Camp</span>
            </Link>
            {navLinks.map(({ href, label, icon: Icon }) => (
                <Tooltip key={label}>
                    <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8", 
                            pathname.startsWith(href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
            ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Link
                        href={settingsLink.href}
                         className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8", 
                            pathname.startsWith(settingsLink.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </nav>
        </aside>
        </TooltipProvider>
    );
}
