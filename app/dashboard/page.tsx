"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/components/ui/AuthProvider";
import SetterDashboard from "@/components/dashboard/SetterDashboard";
import ReviewerDashboard from "@/components/dashboard/ReviewerDashboard";
import AuthorityDashboard from "@/components/dashboard/AuthorityDashboard";
import ExamCenterDashboard from "@/components/dashboard/ExamCenterDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const renderRoleDashboard = () => {
    if (loading) {
      return <LoadingSpinner label="Authenticating institutional clearance..." />;
    }

    switch (user?.role) {
      case "Question Setter":
        return <SetterDashboard />;
      case "Reviewer":
        return <ReviewerDashboard />;
      case "Examination Authority":
        return <AuthorityDashboard />;
      case "Examination Center":
        return <ExamCenterDashboard />;
      case "Admin":
        return <AdminDashboard />;
      default:
        return <SetterDashboard />;
    }
  };

  return <AppShell>{renderRoleDashboard()}</AppShell>;
}
