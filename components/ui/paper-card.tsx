import { ReactNode } from "react";
import { FloralCorners } from "@/components/wedding";

export function PaperCard({
  children,
  florals = true,
  className = "",
}: {
  children: ReactNode;
  florals?: boolean;
  className?: string;
}) {
  return (
    <section className={`paper-card w-theme-container ${className}`.trim()}>
      {florals && <FloralCorners />}
      {children}
    </section>
  );
}
