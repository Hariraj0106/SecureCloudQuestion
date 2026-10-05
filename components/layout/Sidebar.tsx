"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  Files,
  Activity,
  CheckSquare,
  Clock,
  Calendar,
  KeyRound,
  FileCheck2,
  Users,
  AlertOctagon,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
  Layers,
} from "lucide-react";
import { useAuth } from "../ui/AuthProvider";
import { UserRole } from "@/types/auth";
import UserAvatar from "../ui/UserAvatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const getRoleNavigation = (role?: UserRole): NavItem[] => {
  switch (role) {
    case "Question Setter":
      return [
        { label: "Dashboard", href: "/setter", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Create Paper", href: "/setter/create", icon: <FilePlus className="w-4 h-4" /> },
        { label: "My Papers", href: "/setter/papers", icon: <Files className="w-4 h-4" /> },
        { label: "Activity", href: "/setter/activity", icon: <Activity className="w-4 h-4" /> },
      ];

    case "Reviewer":
      return [
        { label: "Dashboard", href: "/reviewer", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Review Queue", href: "/reviewer/queue", icon: <CheckSquare className="w-4 h-4" /> },
        { label: "Reviewed Papers", href: "/reviewer/history", icon: <FileCheck2 className="w-4 h-4" /> },
        { label: "Activity", href: "/reviewer/activity", icon: <Activity className="w-4 h-4" /> },
      ];

    case "Examination Authority":
      return [
        { label: "Dashboard", href: "/authority", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Approval Queue", href: "/authority/approvals", icon: <CheckSquare className="w-4 h-4" /> },
        { label: "Schedule Exams", href: "/authority/schedule", icon: <Calendar className="w-4 h-4" /> },
        { label: "Exam Papers", href: "/papers", icon: <Files className="w-4 h-4" /> },
        { label: "Activity", href: "/authority/activity", icon: <Activity className="w-4 h-4" /> },
      ];

    case "Examination Center":
      return [
        { label: "Dashboard", href: "/exam-center", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Today's Exams", href: "/exam-center/today", icon: <Clock className="w-4 h-4" /> },
        { label: "Release Papers", href: "/exam-center/release", icon: <KeyRound className="w-4 h-4" /> },
        { label: "Released Papers", href: "/exam-center/released", icon: <FileCheck2 className="w-4 h-4" /> },
        { label: "Activity", href: "/exam-center/activity", icon: <Activity className="w-4 h-4" /> },
      ];

    case "Admin":
      return [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
        { label: "All Question Papers", href: "/papers", icon: <Files className="w-4 h-4" /> },
        { label: "Audit Logs", href: "/admin/audit", icon: <ScrollText className="w-4 h-4" /> },
        { label: "Security Events", href: "/admin/security", icon: <AlertOctagon className="w-4 h-4" /> },
        { label: "System Activity", href: "/admin/activity", icon: <Activity className="w-4 h-4" /> },
      ];

    default:
      return [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Question Papers", href: "/papers", icon: <Files className="w-4 h-4" /> },
        { label: "Activity", href: "/activity", icon: <Activity className="w-4 h-4" /> },
      ];
  }
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = getRoleNavigation(user?.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm text-white tracking-wider">
                  SC-QPMS
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Secure Examination System
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Role Tag */}
        {!isCollapsed && user && (
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Role Access Level
            </div>
            <div className="text-xs font-bold text-sky-400 mt-0.5 truncate">
              {user.role}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/setter" &&
                item.href !== "/reviewer" &&
                item.href !== "/authority" &&
                item.href !== "/exam-center" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-sky-600/15 text-sky-400 border border-sky-500/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 shrink-0">
          {!isCollapsed && user && (
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <UserAvatar name={user.name} role={user.role} size="sm" />
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
