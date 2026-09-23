/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UrlMethodPair } from '@inertiajs/core';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    BookOpen,
    Folder,
    LayoutDashboard,
    Users,
    ListCheck,
    Calendar,
    ShieldCheck,
    QrCode,
    Hospital,
    NotebookText,
    ShieldPlus,
    type LucideIcon,
    Paperclip,
    CalendarClock,
} from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { useCurrentUrl } from '@/hooks/use-current-url';

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();

    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const navigationItem: {
        name: string;
        icon: LucideIcon;
        href?: string | UrlMethodPair | undefined;
    }[] = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
        },
        {
            name: 'Attendance',
            icon: ListCheck,
            href: '/attendance',
        },
        {
            name: 'Events',
            icon: Calendar,
            href: '/events',
        },
        {
            name: 'Calendar of Activities',
            icon: CalendarClock,
            href: '/calendar-of-event',
        },
        {
            name: 'Facilities',
            icon: Hospital,
            href: '/facilities-management',
        },
        {
            name: 'Certificates',
            icon: ShieldCheck,
            href: '/certificates',
        },
        {
            name: 'Survey',
            icon: Paperclip,
            href: '/survey',
        },
        {
            name: 'Exams',
            icon: NotebookText,
            href: '/examsResults',
        },

        // ✅ ONLY SHOW IF ADMIN
        ...(role === 'Admin'
            ? [
                  {
                      name: 'Admin',
                      icon: ShieldPlus,
                      href: '/admin',
                  },
              ]
            : []),
    ];

    return (
        <Sidebar variant="inset">
            <div className="flex h-[10%] items-center justify-center">
                <img src="/images/wahIcon.png" className="h-auto w-14" />
                <h1 className="my-auto text-center text-3xl font-extrabold text-purple-800">
                    WAHEMS
                </h1>
            </div>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="flex flex-col">
                        {navigationItem.map((item) => (
                            <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href!)}
                                    tooltip={{ children: item.name }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
