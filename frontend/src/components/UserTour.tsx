import { useState, useEffect, useCallback } from "react";
import { GraduationCap, X, ChevronRight, ChevronLeft, Calendar, Shield, Zap, Lock, BarChart3, Pointer, Sparkles, Target, BookOpen, ArrowRight } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  anchorId?: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Unibuddy",
    description: "Your intelligent attendance companion. Let me show you everything in under 60 seconds — you'll love this.",
    icon: <img src="/favicon.png" alt="Unibuddy" className="w-7 h-7 rounded-md" />,
    gradient: "linear-gradient(135deg, hsl(230 85% 60%), hsl(265 75% 60%))",
    anchorId: "",
    tip: "This tour only shows once. You can always restart it from settings."
  },
  {
    title: "Academic Safety Score",
    description: "This card shows how many of your subjects are above 75%. Think of it as your attendance health at a glance.",
    icon: <Shield className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(152 60% 45%), hsl(170 50% 42%))",
    anchorId: "tour-summary-stats",
    tip: "Goal: Keep all subjects in the safe zone."
  },
  {
    title: "Live Class Tracker",
    description: "See your current or upcoming class with a live countdown timer. Mark yourself present or absent when the session ends.",
    icon: <Pointer className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(265 80% 58%), hsl(230 85% 55%))",
    anchorId: "tour-ongoing-class",
    tip: "Attendance buttons unlock only after the class ends — no cheating!"
  },
  {
    title: "Interactive Calendar",
    description: "Navigate to any date to mark past attendance or review your history. Colored dots show your daily performance.",
    icon: <Calendar className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(38 92% 50%), hsl(25 85% 48%))",
    anchorId: "tour-calendar",
    tip: "🟢 ≥75%  🔴 <75%  🟡 Holiday"
  },
  {
    title: "Course Breakdown Table",
    description: "Every subject listed with hours conducted, attended, missed, and your worst-case percentage. Click any row to dive deeper.",
    icon: <BookOpen className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(230 85% 60%), hsl(250 75% 58%))",
    anchorId: "tour-subject-breakdown",
    tip: "The 'Bunks Left' column is your best friend during exam season."
  },
  {
    title: "Deep Analytics",
    description: "Clicking a course row opens this modal with your live percentage, bunk estimation, OD/ML allowance, and semester projections.",
    icon: <BarChart3 className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(40 95% 55%), hsl(30 90% 50%))",
    anchorId: "tour-expand-row",
    tip: "The 'Need to Attend' number is your most important metric."
  },
  {
    title: "Smart Bunk Calculator",
    description: "We calculate exactly how many hours you can still miss while maintaining 75%. With and without OD/ML relaxation.",
    icon: <Zap className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(38 92% 50%), hsl(45 90% 52%))",
    anchorId: "tour-bunk-stats",
    tip: "Formula: Max bunks = floor(0.25 × Total) − Already missed"
  },
  {
    title: "You're All Set! 🎓",
    description: "Login with your SRM AP credentials to auto-sync your real portal data. Everything stays local and private — we never store your password.",
    icon: <Target className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, hsl(230 85% 60%), hsl(265 75% 60%))",
    anchorId: "",
    tip: "Pro tip: Bookmark this page and check it daily before class."
  }
];

export const UserTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem("is-guest") === "true";
    const hasSeenTour = localStorage.getItem("has-seen-tour") === "true";
    
    if (isGuest && !hasSeenTour) {
      setTimeout(() => setIsOpen(true), 800);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    
    const update = () => {
      if (step.anchorId) {
        const element = document.getElementById(step.anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setSpotlight({
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16
            });
          }, 350);
          return true;
        }
      }
      return false;
    };

    if (!update()) {
      const timer = setTimeout(update, 800);
      setSpotlight(null);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem("has-seen-tour", "true");
  }, []);

  const goToStep = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (direction === 'next') {
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(curr => curr + 1);
      } else {
        handleClose();
      }
    } else {
      if (currentStep > 0) {
        setCurrentStep(curr => curr - 1);
      }
    }
    
    setTimeout(() => setIsAnimating(false), 500);
  }, [currentStep, isAnimating, handleClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goToStep('next');
      if (e.key === 'ArrowLeft') goToStep('prev');
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, goToStep, handleClose]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const getClipPath = () => {
    if (!spotlight) return 'none';
    const { top: t, left: l, width: w, height: h } = spotlight;
    const r = l + w;
    const b = t + h;
    return `polygon(0% 0%, 0% 100%, ${l}px 100%, ${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px, ${l}px 100%, 100% 100%, 100% 0%)`;
  };

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none overflow-hidden">
      {/* Overlay with spotlight hole */}
      <div 
        className="absolute inset-0 transition-all duration-700 ease-out pointer-events-auto"
        style={{ 
          clipPath: getClipPath(),
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Spotlight ring glow */}
      {spotlight && (
        <div 
          className="absolute rounded-2xl pointer-events-none transition-all duration-700 ease-out"
          style={{
            top: spotlight.top - 2,
            left: spotlight.left - 2,
            width: spotlight.width + 4,
            height: spotlight.height + 4,
            border: '2px solid rgba(129,140,248,0.4)',
            boxShadow: '0 0 30px rgba(99,102,241,0.15), inset 0 0 30px rgba(99,102,241,0.05)',
          }}
        />
      )}

      {/* Tour Card */}
      <div 
        className="absolute pointer-events-auto w-full max-w-[380px]"
        style={spotlight ? {
          top: Math.min(window.innerHeight - 380, Math.max(20, spotlight.top + spotlight.height + 16)),
          left: Math.max(16, Math.min(window.innerWidth - 400, spotlight.left)),
          transition: 'all 0.7s cubic-bezier(0.34,1.26,0.64,1)',
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.7s cubic-bezier(0.34,1.26,0.64,1)',
        }}
      >
        <div style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 40px rgba(99,102,241,0.08)',
        }}>
          
          {/* Progress bar */}
          <div style={{ height: 3, background: 'hsl(var(--muted))' }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(230 85% 60%), hsl(265 75% 60%))',
              transition: 'width 0.6s cubic-bezier(0.34,1.26,0.64,1)',
              borderRadius: '0 2px 2px 0',
              boxShadow: '0 0 10px rgba(99,102,241,0.4)',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '24px 24px 20px' }}>
            
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: step.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.5s ease',
              }}>
                {step.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ 
                  fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))',
                  fontFamily: "'Inter', monospace",
                }}>
                  {currentStep + 1}/{TOUR_STEPS.length}
                </span>
                <button 
                  onClick={handleClose} 
                  style={{
                    background: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8, padding: 5,
                    color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h3 style={{ 
              fontSize: 20, fontWeight: 800, color: 'hsl(var(--foreground))', 
              marginBottom: 8, letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {step.title}
            </h3>

            {/* Description */}
            <p style={{ 
              fontSize: 13.5, color: 'hsl(var(--muted-foreground))', 
              lineHeight: 1.6, marginBottom: step.tip ? 12 : 20,
            }}>
              {step.description}
            </p>

            {/* Tip box */}
            {step.tip && (
              <div style={{
                background: 'hsl(var(--primary) / 0.08)',
                border: '1px solid hsl(var(--primary) / 0.18)',
                borderRadius: 10, padding: '8px 12px',
                marginBottom: 20,
                fontSize: 11.5, color: 'hsl(var(--primary))',
                fontWeight: 500, lineHeight: 1.5,
              }}>
                💡 {step.tip}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Back button */}
              <button 
                onClick={() => goToStep('prev')}
                style={{
                  visibility: currentStep === 0 ? 'hidden' : 'visible',
                  background: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10, padding: '8px 14px',
                  color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
              >
                <ChevronLeft size={14} /> Back
              </button>

              {/* Step dots */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: i === currentStep ? 16 : 4,
                    height: 4,
                    borderRadius: 99,
                    background: i === currentStep 
                      ? 'linear-gradient(90deg, hsl(230 85% 60%), hsl(265 75% 60%))' 
                      : i < currentStep 
                        ? 'hsl(var(--primary) / 0.3)' 
                        : 'hsl(var(--border))',
                    transition: 'all 0.4s cubic-bezier(0.34,1.26,0.64,1)',
                  }} />
                ))}
              </div>

              {/* Next button */}
              <button 
                onClick={() => goToStep('next')}
                style={{
                  background: 'linear-gradient(135deg, hsl(230 85% 58%), hsl(265 75% 58%))',
                  border: 'none',
                  borderRadius: 10, padding: '8px 18px',
                  color: 'white', cursor: 'pointer',
                  fontSize: 12, fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>Get Started</>
                ) : (
                  <>Next <ArrowRight size={13} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
