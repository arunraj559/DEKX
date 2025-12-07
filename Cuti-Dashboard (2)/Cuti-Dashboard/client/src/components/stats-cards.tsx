import { DIVISIONS, LeaveRequest } from "@/lib/types";
import { motion } from "framer-motion";

interface StatsCardsProps {
  requests: LeaveRequest[];
  currentMonth: Date;
}

export function StatsCards({ requests, currentMonth }: StatsCardsProps) {
  // Calculate usage per division for the current month
  // For simplicity in this mockup, we just count approved leaves in the current month view
  // In a real app, we'd filter by the selected month properly
  
  const getUsage = (division: string) => {
    return requests.filter(r => 
      r.division === division && 
      r.status === 'APPROVED'
    ).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Object.values(DIVISIONS).map((div, index) => {
        const usage = getUsage(div.id);
        const isFull = usage >= div.limit;
        
        return (
          <motion.div
            key={div.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-6 border-2 rounded bg-black/50 backdrop-blur transition-all duration-300
              ${isFull 
                ? 'border-[var(--color-destructive)] shadow-[0_0_15px_rgba(255,0,85,0.4)]' 
                : 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]'
              }
            `}
          >
            <h3 className="text-xs font-bold tracking-widest text-[var(--color-primary)] uppercase mb-3 font-display">
              {div.label}
            </h3>
            <div className={`text-4xl font-black font-display mb-2 ${isFull ? 'text-[var(--color-destructive)]' : 'text-[var(--color-primary)]'}`}>
              {usage} <span className="text-lg text-muted-foreground">/ {div.limit}</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Slot Terpakai
            </div>
            
            {/* Corner decorations */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-primary)] rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-primary)] rounded-bl" />
          </motion.div>
        );
      })}
    </div>
  );
}
