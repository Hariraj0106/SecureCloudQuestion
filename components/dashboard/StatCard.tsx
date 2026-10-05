import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "sky" | "emerald" | "amber" | "purple" | "rose";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}) => {
  const iconColors = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          {title}
        </span>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>

      <div
        className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${iconColors[variant]}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
