"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronRight,
  User as UserIcon,
  Shield,
  Key,
  LogOut,
  Bell,
  Cpu,
} from "lucide-react";
import { useAuth } from "../ui/AuthProvider";
import SecurityIndicator from "../ui/SecurityIndicator";
import UserAvatar from "../ui/UserAvatar";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { RoleBadge } from "../ui/StatusBadge";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "System Overview";
    if (pathname === "/setter") return "Question Setter Control Center";
    if (pathname === "/setter/create") return "Create Question Paper";
    if (pathname === "/setter/papers") return "Author Question Papers";
    if (pathname === "/reviewer") return "Reviewer Evaluation Center";
    if (pathname === "/reviewer/queue") return "Question Paper Review Queue";
    if (pathname === "/reviewer/history") return "Reviewed Papers Archive";
    if (pathname === "/authority") return "Examination Authority Board";
    if (pathname === "/authority/approvals") return "Paper Approval Queue";
    if (pathname === "/authority/schedule") return "Examination Scheduling";
    if (pathname === "/exam-center") return "Examination Center Terminal";
    if (pathname === "/exam-center/today") return "Today's Examination Schedule";
    if (pathname === "/exam-center/release") return "Controlled Paper Release";
    if (pathname === "/exam-center/released") return "Released Papers Archive";
    if (pathname === "/admin") return "Institutional Security Control Center";
    if (pathname === "/admin/users") return "User Account Management";
    if (pathname === "/admin/audit") return "Institutional Audit Logs";
    if (pathname === "/admin/security") return "Security Events & Monitoring";
    if (pathname === "/papers") return "Examination Papers";
    if (pathname.startsWith("/papers/")) return "Question Paper Dossier";
    if (pathname.includes("/activity")) return "Institutional Activity Stream";
    return "Institutional Portal";
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link href="/dashboard" className="hover:text-slate-800">
                SC-QPMS
              </Link>
              {pathSegments.map((segment, idx) => (
                <React.Fragment key={segment + idx}>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="capitalize text-slate-700 font-semibold">
                    {segment.replace(/-/g, " ")}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Security Status Pill */}
          <SecurityIndicator />

          {/* User Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <UserAvatar name={user?.name} role={user?.role} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || "Session User"}
                </span>
                <span className="text-[10px] text-slate-500">{user?.role}</span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-lg py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900">{user?.name}</div>
                  <div className="text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1.5">
                    <RoleBadge role={user?.role || ""} />
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Profile Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSecurityModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Security & Device</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Institutional User Profile"
        subtitle="Identity and authorization verification details"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <UserAvatar name={user?.name} role={user?.role} size="lg" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{user?.name}</h4>
              <p className="text-slate-500">{user?.email}</p>
              <div className="mt-1">
                <RoleBadge role={user?.role || ""} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-slate-700">
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Account Status
              </span>
              <span className="font-semibold text-emerald-600">Active & Verified</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Auth Protocol
              </span>
              <span className="font-semibold text-slate-800">JWT HTTP-Only</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Last Access Time
              </span>
              <span className="text-slate-600">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Current Session"}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Account Created
              </span>
              <span className="text-slate-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setProfileModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Security & Device Modal */}
      <Modal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        title="Security & Device Authorization"
        subtitle="Cryptographic controls and authorized release device identifiers"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Key className="w-4 h-4 text-sky-400" /> AES-256-CBC Encryption Engine
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              All question papers are encrypted immediately upon creation using AES-256 with unique initialization vectors (IV) and SHA-256 integrity checksums.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-emerald-600" /> Authorized Examination Devices
            </div>
            <p className="text-slate-600 text-xs">
              Paper release is locked to certified hardware device identifiers configured in the institutional server:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-mono text-[11px] rounded text-slate-800">
                CENTER-001
              </span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-mono text-[11px] rounded text-slate-800">
                CENTER-002
              </span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-mono text-[11px] rounded text-slate-800">
                EXAM-DESK-ALPHA
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setSecurityModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
