import React, { useState } from "react";
import { GraduationCap, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import "./_group.css";

export function StackedHero() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[844px] w-full max-w-[390px] mx-auto bg-slate-950 flex flex-col relative overflow-hidden font-sans select-none shadow-2xl rounded-[40px] border-[8px] border-slate-900">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-indigo-900/80 via-blue-900/40 to-slate-950/0 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Top Hero Section (45%) */}
      <div className="h-[45%] w-full flex flex-col items-center justify-center relative z-10 animate-fade-in">
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-glow" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl transform rotate-[-10deg] border border-white/20 backdrop-blur-sm">
            <GraduationCap className="w-12 h-12 text-white transform rotate-[10deg]" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
               <div className="w-full h-full animate-shimmer" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Unibuddy
          </h1>
          <p className="text-indigo-200 mt-2 font-medium text-sm max-w-[240px] opacity-80">
            Your academic journey, beautifully tracked.
          </p>
        </div>
      </div>

      {/* Bottom Card Section (55%) */}
      <div className="h-[55%] w-full bg-white rounded-t-[40px] px-8 pt-10 pb-8 flex flex-col justify-between relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.2)] animate-slide-up">
        
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />

        <div className="space-y-6">
          <div className="space-y-1.5 opacity-0 animate-fade-in delay-200">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your SRMAP account</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2 opacity-0 animate-fade-in delay-300">
              <Label htmlFor="registerNumber" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Register Number
              </Label>
              <Input 
                id="registerNumber"
                type="text" 
                placeholder="AP21110010..."
                className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-2 focus-visible:border-transparent rounded-xl px-4 text-base font-medium placeholder:text-slate-400 transition-all duration-200"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2 opacity-0 animate-fade-in delay-400">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-2 focus-visible:border-transparent rounded-xl pl-4 pr-12 text-base font-medium placeholder:text-slate-400 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-14 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98] group opacity-0 animate-fade-in delay-500 flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        <div className="space-y-4 opacity-0 animate-fade-in delay-[600ms]">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full h-12 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
          >
            Continue without login
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure university connection</span>
          </div>
        </div>

      </div>
    </div>
  );
}