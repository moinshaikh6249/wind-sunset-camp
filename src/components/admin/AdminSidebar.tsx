'use client';

import Link from "next/link";
import { Home, Settings, Users2, CalendarCheck, BarChart, Tent, GalleryVertical, Mail, Star, Flame, Images } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/camps", label: "Camps", icon: Tent },
    { href: "/admin/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/admin/memories", label: "Customer Memories", icon: Images },
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
                    "hover:bg-gradient-to-r hover:from-emerald-500/16 hover:via-emerald-500/8 hover:to-orange-500/6 hover:text-emerald-200 hover:shadow-[0_0_24px_-8px_rgba(34,197,94,0.75)]",
                    isActive && "font-semibold text-emerald-200 bg-gradient-to-r from-emerald-500/20 via-emerald-500/8 to-orange-500/10 shadow-[0_0_26px_-8px_rgba(34,197,94,0.95)]"
                )}
            >
                {isActive && <div className="absolute left-[-0.5rem] top-1/2 h-2/3 w-1.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 to-orange-400 shadow-[0_0_16px_rgba(34,197,94,0.95)] lg:left-[-1rem]" />}
                <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{label}</span>
            </Link>
        );
    };


    return (
        <div className="hidden border-r border-white/10 bg-slate-950/45 backdrop-blur-xl md:block">
            <div className="flex h-full min-h-screen flex-col">
                <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="group flex items-center gap-2 font-extrabold text-foreground">
                        <Flame className="h-6 w-6 text-emerald-300 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]" />
                        <span className="text-lg tracking-tight text-glow-white transition-all duration-300">Sunset Camp</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="grid items-start gap-2 p-2 text-sm font-medium lg:p-4">
                        {navLinks.map(({ href, label, icon }) => renderLink(href, label, icon, href === '/admin/dashboard'))}
                    </nav>
                </div>
                <div className="mt-auto border-t border-white/10 p-2 lg:p-4">
                    <div className="mb-4 rounded-lg border border-white/10 bg-slate-900/50 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <p className="text-sm font-bold uppercase tracking-wider text-foreground">Admin Panel</p>
                        <p className="text-xs text-muted-foreground">Wind & Sunset Camp</p>
                    </div>
                    {renderLink(settingsLink.href, settingsLink.label, settingsLink.icon)}
                </div>
            </div>
        </div>
    );
}
