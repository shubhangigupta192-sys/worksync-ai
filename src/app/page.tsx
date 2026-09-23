import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function Home() {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) redirect('/dashboard');
      else redirect('/login');
    }
  } catch {
    // Demo mode
  }

  const cookieStore = await cookies();
  const demoSession = cookieStore.get('demo-session')?.value;
  if (demoSession) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
