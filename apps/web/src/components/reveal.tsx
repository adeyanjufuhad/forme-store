"use client";
import type { ReactNode } from "react";
import AnimatedContent from "./reactbits/AnimatedContent";
import { useMotionPreference } from "./motion-provider";
export function Reveal({
  children,
  className,
  stagger = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const { paused, reduced } = useMotionPreference();
  if (paused || reduced) return <div className={className}>{children}</div>;
  return (
    <AnimatedContent
      distance={48}
      duration={0.85}
      initialOpacity={0.15}
      stagger={stagger}
      threshold={0.05}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
