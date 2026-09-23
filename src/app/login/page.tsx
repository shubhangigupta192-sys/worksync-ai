'use client';

import { useState } from 'react';
import { Brain, Shield, Users, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signIn } from '@/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (role: string) => {
    const normalizedRole = role.toLowerCase();
    document.cookie = `demo-session=${normalizedRole}; path=/; max-age=86400`;
    document.cookie = `demo-role=${normalizedRole}; path=/; max-age=86400`;
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      await signIn(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Glowing Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-indigo-950/80 to-purple-950/70" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Login Container */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in-up">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
              <Brain className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 bg-emerald-400 w-3 h-3 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </div>
          </div>
          
          <Badge className="mb-3 bg-indigo-500/15 text-indigo-300 border-indigo-400/30 hover:bg-indigo-500/20 text-xs px-3 py-1 font-medium">
            <Sparkles className="w-3 h-3 mr-1.5 text-amber-300" />
            Operations & Workforce Intelligence
          </Badge>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            WorkSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Next-Gen Frontline Task Coordination & Decision Support
          </p>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">Work Email</label>
            <input
              type="email"
              placeholder="admin@worksync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-600/25 transition-all duration-200 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <LogIn className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        {/* Instant Access Portal */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[11px] text-center text-slate-400 mb-3 uppercase tracking-wider font-semibold">
            Instant Access Portals
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="group p-3 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-left transition-all duration-200 flex flex-col items-center text-center"
            >
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 mb-2 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Admin / HR</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Full System</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('supervisor')}
              className="group p-3 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-left transition-all duration-200 flex flex-col items-center text-center"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Supervisor</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Task Board</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              className="group p-3 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/40 text-left transition-all duration-200 flex flex-col items-center text-center"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Member</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Frontline View</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 left-0 w-full text-center text-slate-500 text-xs font-medium">
        WorkSync Enterprise Suite • Human-in-the-Loop Decision Governance
      </div>
    </div>
  );
}
