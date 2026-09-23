import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { AIChatbot } from '@/components/ai-chatbot';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';
import { cookies } from 'next/headers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkSync AI | AI-Assisted Workforce Coordination',
  description: 'Academic research prototype for AI-assisted HR and workforce coordination',
};

const DEMO_PROFILES: Record<string, Profile> = {
  admin: {
    id: 'demo-admin',
    email: 'admin@demo.com',
    full_name: 'HR Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  supervisor: {
    id: 'demo-supervisor',
    email: 'supervisor@demo.com',
    full_name: 'Site Supervisor',
    role: 'supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  employee: {
    id: 'demo-employee',
    email: 'employee@demo.com',
    full_name: 'Rajesh Kumar',
    role: 'employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile | null = null;

  try {
    const supabase = await createClient();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profile = data;
      }
    } else {
      // Demo mode — check for demo session cookie
      const cookieStore = await cookies();
      const demoRole = cookieStore.get('demo-role')?.value;
      if (demoRole && DEMO_PROFILES[demoRole]) {
        profile = DEMO_PROFILES[demoRole];
      }
    }
  } catch {
    // Check demo cookie as fallback
    try {
      const cookieStore = await cookies();
      const demoRole = cookieStore.get('demo-role')?.value;
      if (demoRole && DEMO_PROFILES[demoRole]) {
        profile = DEMO_PROFILES[demoRole];
      }
    } catch {
      // No profile available
    }
  }

  const isLoginPage = !profile;

  return (
    <html lang="en" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body className={cn(inter.className, 'antialiased')}>
        <ThemeProvider>
          {profile ? (
            <div className="flex h-screen">
              <Sidebar role={profile.role} />
              <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <Header user={profile} pageTitle="" />
                <main className="flex-1 overflow-y-auto bg-background p-6">
                  {children}
                </main>
              </div>
              <AIChatbot />
            </div>
          ) : (
            <main className="min-h-screen">
              {children}
            </main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
