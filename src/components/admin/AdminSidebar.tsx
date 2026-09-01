'use client';

import Link from "next/link";
import { Home, Settings, Users2, CalendarCheck, BarChart, Tent, GalleryVertical, Mail, Star, Images, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/camps", label: "Camps", icon: Tent },
];

const contentNavLinks = [
    { href: "/admin/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/admin/memories", label: "Customer Memories", icon: Images },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/messages", label: "Messages", icon: Mail },
];

const systemNavLinks = [
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    const renderLink = (href: string, label: string, Icon: React.ElementType, isDashboard = false) => {
        const isActive = isDashboard ? pathname === href : pathname.startsWith(href);
        return (
            <Link
                key={label}
                href={href}
                className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ios-press",
                    isActive
                        ? "bg-amber-500/10 text-amber-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-amber-500/20 dark:border-emerald-500/30 shadow-[0_4px_16px_-6px_rgba(234,179,8,0.2)] dark:shadow-[0_4px_16px_-6px_rgba(34,197,94,0.3)]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                {isActive && (
                    <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 rounded-r-full bg-amber-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(234,179,8,0.6)] dark:shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-amber-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <aside className="hidden border-r border-border/40 bg-card/65 backdrop-blur-xl dark:bg-card/40 md:block">
            <div className="flex h-full min-h-screen flex-col">
                {/* Brand Header */}
                <div className="flex h-16 items-center border-b border-border/40 px-6">
                    <Link href="/admin/dashboard" className="group flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-emerald-700 text-white shadow-md transition-all duration-300 group-hover:scale-105">
                            <Tent className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-headline font-bold text-sm tracking-wider text-foreground">WIND & SUNSET</span>
                            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Campsite Operations</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                    {/* Main Category */}
                    <div className="space-y-1.5">
                        <p className="px-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Main Operations</p>
                        <nav className="grid gap-1">
                            {mainNavLinks.map(({ href, label, icon }) => renderLink(href, label, icon, href === '/admin/dashboard'))}
                        </nav>
                    </div>

                    {/* Content Category */}
                    <div className="space-y-1.5">
                        <p className="px-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Content Management</p>
                        <nav className="grid gap-1">
                            {contentNavLinks.map(({ href, label, icon }) => renderLink(href, label, icon))}
                        </nav>
                    </div>

                    {/* System Category */}
                    <div className="space-y-1.5">
                        <p className="px-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">System & Reports</p>
                        <nav className="grid gap-1">
                            {systemNavLinks.map(({ href, label, icon }) => renderLink(href, label, icon))}
                        </nav>
                    </div>
                </div>

                {/* Footer Brand Info */}
                <div className="mt-auto border-t border-border/40 p-4">
                    <div className="rounded-xl border border-border/40 bg-muted/40 p-3 text-center backdrop-blur-md">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground">Wind & Sunset Camp</p>
                        <p className="text-[11px] text-muted-foreground">Admin Operations v2.0</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
