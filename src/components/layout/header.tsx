'use client';

import React from 'react';
import { LogOut, BrainCircuit, Bell } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { getGreeting } from '@/lib/utils';

interface HeaderProps {
  user: Profile;
  pageTitle: string;
}

export function Header({ user, pageTitle }: HeaderProps) {
  const handleLogout = () => {
    // Clear demo cookies and redirect to login
    document.cookie = 'demo-session=; path=/; max-age=0';
    document.cookie = 'demo-role=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const initials = user.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">{getGreeting()}</h2>
          <p className="text-base font-semibold text-foreground">{user.full_name}</p>
        </div>
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Decision Engine Active
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src="" alt={user.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium leading-tight">{user.full_name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive ml-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
