'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu,
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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface MobileNavProps {
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

export function MobileNav({ role, currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS[role] || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">AI-HR Prototype</h1>
            <p className="text-xs text-slate-500">AI-Enabled Workforce</p>
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
                onClick={() => setOpen(false)}
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
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Role</span>
              <Badge variant="outline" className="capitalize text-xs bg-white">
                {role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
