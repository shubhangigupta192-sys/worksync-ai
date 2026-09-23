'use client';

import React, { useState } from 'react';
import { LogOut, Bell, ChevronDown, Menu, BrainCircuit } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { getGreeting } from '@/lib/utils';

interface HeaderProps {
  user: Profile;
  pageTitle?: string;
  onMenuClick?: () => void;
}

export function Header({ user, pageTitle, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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

  const roleLabel = user.role === 'admin' ? 'Admin / HR' : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between gap-2 px-3 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 min-w-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shrink-0">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground truncate">WorkSync AI</span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden lg:block min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground">{pageTitle || getGreeting()}</h2>
          <p className="text-base font-semibold text-foreground truncate">{user.full_name}</p>
        </div>

        <Badge variant="outline" className="hidden xl:flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Decision Engine Active
        </Badge>
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User menu */}
        <div className="relative flex items-center">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border rounded-lg hover:bg-accent/50 transition-colors py-1.5 pr-1"
            aria-label="Account menu"
          >
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarImage src="" alt={user.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{user.full_name}</span>
              <span className="text-xs text-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-50 p-1.5">
                <div className="px-3 py-2.5 md:hidden">
                  <div className="text-sm font-medium">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{roleLabel}</div>
                </div>
                <div className="h-px bg-border md:hidden" />
                <div className="px-3 py-2 text-[11px] text-muted-foreground md:hidden">{getGreeting()}</div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent hover:text-destructive transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
