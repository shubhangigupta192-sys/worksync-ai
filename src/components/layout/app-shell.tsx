'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Profile } from '@/lib/types';

interface AppShellProps {
  role: Profile['role'];
  user: Profile;
  children: React.ReactNode;
}

// Client shell that owns the mobile drawer state shared by the Header's
// hamburger button and the Sidebar's Sheet. Desktop keeps the fixed rail.
export function AppShell({ role, user, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar role={role} open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header user={user} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto overscroll-contain bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
