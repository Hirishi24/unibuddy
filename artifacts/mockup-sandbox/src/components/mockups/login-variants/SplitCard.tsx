import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SplitCard() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[844px] w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#faf9f6]">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-100/50 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-[342px] z-10 flex flex-col items-center">
        {/* Brand name above card */}
        <div className="mb-6 flex items-center gap-2 text-stone-500 font-medium tracking-wide">
          <GraduationCap className="w-5 h-5" />
          <span>Unibuddy</span>
        </div>

        {/* The Card */}
        <div className="w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-stone-800 mb-2">Welcome back</h1>
            <p className="text-sm text-stone-500">Sign in to your student account</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="registerNumber" className="text-stone-600 font-medium">Register Number</Label>
              <Input 
                id="registerNumber" 
                placeholder="e.g. AP21110010000" 
                className="h-12 bg-stone-50 border-transparent focus-visible:ring-stone-400 focus-visible:bg-white transition-colors rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-stone-600 font-medium">Password</Label>
                <a href="#" className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="h-12 bg-stone-50 border-transparent focus-visible:ring-stone-400 focus-visible:bg-white transition-colors rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-base mt-2 shadow-sm transition-all hover:shadow-md">
              Log In
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <Button variant="ghost" className="text-stone-500 hover:text-stone-800 hover:bg-stone-50 h-auto py-2 px-4 rounded-lg font-medium transition-colors">
              Continue without login
            </Button>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="mt-8 text-center text-xs text-stone-400 max-w-[260px] leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
