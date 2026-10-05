import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  header,
  footer,
  title,
  subtitle,
  action,
  padding = "md",
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-3.5",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}
    >
      {(header || title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
