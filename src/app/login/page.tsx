'use client';

import { useState } from 'react';
import { Brain, Shield, Users, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signIn } from '@/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (role: string) => {
    document.cookie = `demo-session=${role}; path=/; max-age=86400`;
    document.cookie = `demo-role=${role}; path=/; max-age=86400`;
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient-xy"></div>
      
      {/* CSS-only Floating Particles */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 animate-pulse-glow">
              <Brain className="w-12 h-12 text-purple-300" />
            </div>
          </div>
          <Badge className="mb-4 bg-purple-500/20 text-purple-200 border-purple-400/30 hover:bg-purple-500/30">
            Academic Research Prototype
          </Badge>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200 mb-2 tracking-tight">
            WorkSync AI
          </h1>
          <p className="text-sm text-indigo-200/80 font-medium">
            AI-Enabled Human Resource Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ease-in-out border border-white/10 hover:-translate-y-0.5"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <LogIn className="ml-2 w-5 h-5" />}
          </Button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-center text-white/50 mb-4 uppercase tracking-wider font-semibold">
            Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin('Admin')}
              className="bg-white/5 border-white/10 text-white hover:bg-white/20 hover:text-white transition-all flex flex-col items-center py-6 h-auto gap-2 hover:-translate-y-1"
            >
              <Shield className="w-5 h-5 text-purple-300" />
              <span className="text-xs">Admin</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin('Supervisor')}
              className="bg-white/5 border-white/10 text-white hover:bg-white/20 hover:text-white transition-all flex flex-col items-center py-6 h-auto gap-2 hover:-translate-y-1"
            >
              <Users className="w-5 h-5 text-blue-300" />
              <span className="text-xs">Supervisor</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin('Employee')}
              className="bg-white/5 border-white/10 text-white hover:bg-white/20 hover:text-white transition-all flex flex-col items-center py-6 h-auto gap-2 hover:-translate-y-1"
            >
              <Users className="w-5 h-5 text-indigo-300" />
              <span className="text-xs">Employee</span>
            </Button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-4 left-0 w-full text-center text-white/30 text-xs z-10 font-medium tracking-wide">
        Proof of Concept | Academic Research
      </div>

      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          animation: float 15s infinite ease-in-out;
        }
        .particle-1 { width: 120px; height: 120px; top: 10%; left: 10%; animation-delay: 0s; }
        .particle-2 { width: 200px; height: 200px; top: 65%; left: 80%; animation-delay: -3s; }
        .particle-3 { width: 80px; height: 80px; top: 40%; left: 60%; animation-delay: -7s; }
        .particle-4 { width: 150px; height: 150px; top: 80%; left: 15%; animation-delay: -11s; }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          50% { transform: translateY(-30px) scale(1.1) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(167, 139, 250, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.8)); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
