import React, { createContext, useContext, useRef, useCallback } from 'react';

export interface IslandNotification {
  icon: string;
  title: string;
  message: string;
  color?: string;
}

interface DynamicIslandContextValue {
  notify: (n: IslandNotification) => void;
  subscribe: (listener: (n: IslandNotification | null) => void) => () => void;
}

const DynamicIslandContext = createContext<DynamicIslandContextValue | null>(null);

export function DynamicIslandProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Set<(n: IslandNotification | null) => void>>(new Set());

  const subscribe = useCallback((listener: (n: IslandNotification | null) => void) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const notify = useCallback((n: IslandNotification) => {
    listeners.current.forEach((l) => l(n));
    setTimeout(() => {
      listeners.current.forEach((l) => l(null));
    }, 3200);
  }, []);

  return (
    <DynamicIslandContext.Provider value={{ notify, subscribe }}>
      {children}
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  const ctx = useContext(DynamicIslandContext);
  if (!ctx) throw new Error('useDynamicIsland must be used within DynamicIslandProvider');
  return ctx;
}
