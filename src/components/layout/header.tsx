'use client';

import React from 'react';
import { Menu, LogOut, BrainCircuit } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from './mobile-nav';

interface HeaderProps {
  user: Profile;
  pageTitle: string;
}

export function Header({ user, pageTitle }: HeaderProps) {
  const handleLogout = () => {
    // Logout logic
    console.log('Logout clicked');
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <div className="md:hidden mr-4">
          <MobileNav role={user.role} currentPath="/" />
        </div>
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-slate-800">{pageTitle}</h2>
          <Badge variant="secondary" className="hidden sm:flex items-center bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <BrainCircuit className="w-3 h-3 mr-1" />
            AI-Assisted
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-slate-900">{user.name}</span>
          <span className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</span>
        </div>
        
        <Avatar className="h-9 w-9 border border-slate-200">
          <AvatarImage src="" alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-slate-500 hover:text-slate-900 ml-2"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
