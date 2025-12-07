import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NeonCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

export function NeonCard({ title, children, className, variant = 'default' }: NeonCardProps) {
  const borderColor = 
    variant === 'danger' ? 'border-[var(--color-destructive)]' :
    variant === 'success' ? 'border-[var(--color-success)]' :
    'border-[var(--color-secondary)]';

  const shadowColor = 
    variant === 'danger' ? 'shadow-[0_0_15px_rgba(255,0,85,0.2)]' : 
    variant === 'success' ? 'shadow-[0_0_15px_rgba(0,255,127,0.2)]' :
    'shadow-[0_0_15px_rgba(255,0,128,0.2)]';

  return (
    <Card className={cn(
      "bg-[rgba(26,26,46,0.8)] border-2 backdrop-blur-sm relative overflow-hidden",
      borderColor,
      shadowColor,
      className
    )}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 pointer-events-none" />
      
      {title && (
        <CardHeader className="border-b-2 border-[var(--color-primary)] pb-4 mb-4 relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-widest text-[var(--color-primary)] uppercase drop-shadow-[0_0_10px_rgba(0,212,255,0.5)] font-display">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  );
}
