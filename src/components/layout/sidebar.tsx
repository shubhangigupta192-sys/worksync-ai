'use client';

import React from 'react';
import Link from 'next/link';
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
  Settings 
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { NAV_ITEMS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: UserRole;
  currentPath: string;
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

export function Sidebar({ role, currentPath }: SidebarProps) {
  const items = NAV_ITEMS[role] || [];

  return (
    <div className="flex flex-col w-64 h-full fixed left-0 top-0 bg-white border-r border-slate-200">
      <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-slate-900">AI-HR Prototype</h1>
          <p className="text-xs text-slate-500">AI-Enabled Workforce Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Role</span>
            <Badge variant="outline" className="capitalize text-xs bg-white">
              {role.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-center bg-slate-200/50 rounded p-2 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600">Prototype v1.0</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Academic Research Prototype</p>
          </div>
        </div>
      </div>
    </div>
  );
}
