import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MinimalBottomSheet() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-[844px] w-full max-w-[390px] mx-auto overflow-hidden bg-slate-950 font-sans selection:bg-purple-500/30">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-20%] w-[100%] h-[50%] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[80%] h-[60%] bg-teal-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Floating Brand Center-Upper */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-[20vh] h-[60%] pointer-events-none text-white">
        <div className="p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl mb-6">
          <GraduationCap className="w-12 h-12 text-purple-200" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-light tracking-tight text-white mb-2">Unibuddy</h1>
        <p className="text-sm font-medium text-white/50 tracking-widest uppercase">SRMAP ATTENDANCE</p>
      </div>

      {/* Glassmorphism Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/60 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] px-8 pt-6 pb-12 shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1 relative">
            <Input 
              type="text" 
              placeholder="Register Number" 
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl px-5 text-base focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all"
            />
          </div>

          <div className="space-y-1 relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl px-5 pr-12 text-base focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl text-base font-semibold mt-4 transition-transform active:scale-[0.98]">
            Login
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button variant="ghost" className="w-full h-12 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium mt-2">
            Continue without login
          </Button>

          <p className="text-center text-xs text-white/30 mt-6 max-w-[240px] mx-auto">
            By continuing, you agree to the University's privacy policy and terms of service.
          </p>
        </form>
      </div>
    </div>
  );
}
