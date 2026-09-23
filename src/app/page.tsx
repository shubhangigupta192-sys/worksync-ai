import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
  redirect('/dashboard');
}
