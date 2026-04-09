import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  color?: "blue" | "green" | "red" | "amber" | "purple";
  className?: string;
}

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

export function StatCard({ label, value, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 flex items-start gap-4", className)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", COLOR_MAP[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trend.positive ? "text-emerald-600" : "text-red-500")}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
