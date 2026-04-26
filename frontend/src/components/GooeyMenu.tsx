import React from "react";
import { cn } from "@/lib/cn-helper.ts";

interface GooeyMenuItem {
  key: string;
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}

interface GooeyMenuProps {
  data: GooeyMenuItem[];
  className?: string;
}

export const GooeyMenu = ({ data, className }: GooeyMenuProps) => {
  return (
    <div className={cn("flex flex-col gap-2 p-2 relative", className)}>
      {/* SVG Filter for Gooey Effect */}
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative z-10 space-y-1">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 hover:bg-muted group"
          >
            <span className={cn("text-xs text-muted-foreground font-medium", item.labelClass)}>
              {item.label}
            </span>
            <span className={cn("text-xs font-semibold text-foreground/80", item.valueClass)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
