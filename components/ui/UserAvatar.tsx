import React from "react";

export interface UserAvatarProps {
  name?: string;
  role?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = "User",
  role,
  size = "md",
  className = "",
}) => {
  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizeStyles = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs font-semibold",
    lg: "w-10 h-10 text-sm font-bold",
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-slate-900 text-white select-none shrink-0 ring-1 ring-slate-200 ${sizeStyles[size]} ${className}`}
      title={`${name} (${role || "Institutional Member"})`}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
