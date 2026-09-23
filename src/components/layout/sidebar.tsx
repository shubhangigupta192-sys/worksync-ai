'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Brain,
  ShieldCheck,
  ScrollText,
  Lock,
  GraduationCap,
  Settings,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { NAV_ITEMS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: UserRole;
  currentPath?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Brain,
  ShieldCheck,
  ScrollText,
  Lock,
  GraduationCap,
  Settings,
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  return (
    <div className="flex flex-col w-64 h-full fixed left-0 top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">WorkSync AI</h1>
            <p className="text-[11px] text-sidebar-foreground/50">Workforce Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-indigo-500/10'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">Role</span>
            <Badge variant="outline" className="capitalize text-[10px] bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
              {role === 'admin' ? 'Admin / HR' : role}
            </Badge>
          </div>
          <div className="text-center bg-sidebar-accent/50 rounded-lg p-2 border border-sidebar-border/50">
            <p className="text-[10px] font-semibold text-sidebar-foreground/60">Prototype v1.0</p>
            <p className="text-[9px] text-sidebar-foreground/40 mt-0.5">Academic Research</p>
          </div>
        </div>
      </div>
    </div>
  );
}
