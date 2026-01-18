'use client';

import Link from "next/link";
import { Home, Settings, Users2, CalendarCheck, BarChart, Tent, GalleryVertical, Mail, Star, Flame } from "lucide-react";
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

    const renderLink = (href: string, label: string, Icon: React.ElementType, isDashboard = false) => {
        const isActive = isDashboard ? pathname === href : pathname.startsWith(href);
        return (
            <Link
                key={label}
                href={href}
                className={cn(
                    "group relative flex items-center gap-4 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-300 ease-in-out",
                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary hover:shadow-[0_0_15px_-3px_hsl(var(--primary))]",
                    isActive && "font-semibold text-primary bg-gradient-to-r from-primary/10 to-transparent shadow-[0_0_18px_-4px_hsl(var(--primary))]"
                )}
            >
                {isActive && <div className="absolute left-[-0.5rem] lg:left-[-1rem] h-2/3 top-1/2 -translate-y-1/2 w-1.5 rounded-full bg-primary shadow-[0_0_12px_theme(colors.primary)]" />}
                <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{label}</span>
            </Link>
        );
    };


    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="group flex items-center gap-2 font-extrabold text-foreground">
                        <Flame className="h-6 w-6 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_6px_theme(colors.primary)]" />
                        <span className="text-lg tracking-tight text-glow-white transition-all duration-300">Sunset Camp</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="grid items-start gap-2 p-2 text-sm font-medium lg:p-4">
                        {navLinks.map(({ href, label, icon }) => renderLink(href, label, icon, href === '/admin/dashboard'))}
                    </nav>
                </div>
                <div className="mt-auto border-t p-2 lg:p-4">
                    <div className="mb-4 rounded-lg bg-background/40 p-3 text-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-foreground">Admin Panel</p>
                        <p className="text-xs text-muted-foreground">Wind & Sunset Camp</p>
                    </div>
                    {renderLink(settingsLink.href, settingsLink.label, settingsLink.icon)}
                </div>
            </div>
        </div>
    );
}
