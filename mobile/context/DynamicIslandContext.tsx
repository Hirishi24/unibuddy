import React, { createContext, useContext, useRef, useCallback } from 'react';

export interface IslandNotification {
  icon: string;
  title: string;
  message: string;
  color?: string;
}

interface DynamicIslandContextValue {
  notify: (n: IslandNotification) => void;
  dismiss: () => void;
  subscribe: (listener: (n: IslandNotification | null) => void) => () => void;
}

const DynamicIslandContext = createContext<DynamicIslandContextValue | null>(null);

export function DynamicIslandProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Set<(n: IslandNotification | null) => void>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subscribe = useCallback((listener: (n: IslandNotification | null) => void) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const dismiss = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    listeners.current.forEach((l) => l(null));
  }, []);

  const notify = useCallback((n: IslandNotification) => {
    if (timer.current) clearTimeout(timer.current);
    listeners.current.forEach((l) => l(n));
    timer.current = setTimeout(() => {
      listeners.current.forEach((l) => l(null));
      timer.current = null;
    }, 5000);
  }, []);

  return (
    <DynamicIslandContext.Provider value={{ notify, dismiss, subscribe }}>
      {children}
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  const ctx = useContext(DynamicIslandContext);
  if (!ctx) throw new Error('useDynamicIsland must be used within DynamicIslandProvider');
  return ctx;
}
