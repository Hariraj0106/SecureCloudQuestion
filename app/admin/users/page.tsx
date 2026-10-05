"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  UserPlus,
  Search,
  Key,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Lock,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { RoleBadge } from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { IUser, UserRole } from "@/types/auth";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Question Setter" as UserRole,
  });
  const [creating, setCreating] = useState(false);

  // Reset Password Modal
  const [resetUser, setResetUser] = useState<IUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // Delete User Dialog
  const [deleteUser, setDeleteUser] = useState<IUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const url = new URL("/api/users", window.location.origin);
      if (roleFilter !== "ALL") url.searchParams.set("role", roleFilter);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
      } else {
        error(json.message || "Failed to load users");
      }
    } catch {
      error("Network error fetching user directory");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.name || !createData.email || !createData.password) {
      error("All fields are required.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to create user");
        return;
      }

      success(`User ${createData.name} (${createData.role}) created successfully.`);
      setIsCreateOpen(false);
      setCreateData({
        name: "",
        email: "",
        password: "",
        role: "Question Setter",
      });
      fetchUsers();
    } catch {
      error("Network error during user creation");
    } finally {
      setCreating(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (user: IUser) => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to toggle status");
        return;
      }
      success(`User ${user.email} is now ${!user.isActive ? "active" : "deactivated"}.`);
      fetchUsers();
    } catch {
      error("Failed to update user status");
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser || !newPassword) return;

    setResetting(true);
    try {
      const res = await fetch(`/api/users/${resetUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to reset password");
        return;
      }
      success(`Password reset for ${resetUser.email}.`);
      setResetUser(null);
      setNewPassword("");
    } catch {
      error("Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteUser._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to delete user");
        return;
      }
      success(`User account ${deleteUser.email} deleted.`);
      setDeleteUser(null);
      fetchUsers();
    } catch {
      error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Institutional User Account Governance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision, manage roles, and control clearance for Setters, Reviewers, Authorities, and Centers.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<UserPlus className="w-4 h-4 text-sky-400" />}
          >
            Provision User Account
          </Button>
        </div>

        {/* Directory Table */}
        <Card
          title="Institutional Directory"
          subtitle="Authorized personnel across all 5 operational roles"
          action={
            <div className="flex items-center gap-2">
              <div className="w-56">
                <Input
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  className="py-1 text-xs"
                />
              </div>
              <div className="w-44">
                <Select
                  options={[
                    { value: "ALL", label: "All Roles" },
                    { value: "Question Setter", label: "Question Setter" },
                    { value: "Reviewer", label: "Reviewer" },
                    { value: "Examination Authority", label: "Authority" },
                    { value: "Examination Center", label: "Exam Center" },
                    { value: "Admin", label: "Admin" },
                  ]}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="py-1 text-xs"
                />
              </div>
            </div>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading institutional directory..." />
          ) : users.length === 0 ? (
            <EmptyState
              title="No Users Found"
              description="No user records match the search or filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Last Access</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/75">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? "Deactivate Account" : "Activate Account"}
                            className={u.isActive ? "text-amber-600" : "text-emerald-600"}
                          >
                            {u.isActive ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Reset Password */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResetUser(u);
                              setNewPassword("");
                            }}
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5 text-slate-600" />
                          </Button>

                          {/* Delete Account */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteUser(u)}
                            title="Delete User"
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Provision User Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Provision Institutional User"
          subtitle="Assign role, institutional email, and secure credentials"
          maxWidth="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <Input
              label="Full Name"
              value={createData.name}
              onChange={(e) =>
                setCreateData({ ...createData, name: e.target.value })
              }
              placeholder="e.g., Dr. Jane Holloway"
              required
            />

            <Input
              label="Institutional Email"
              type="email"
              value={createData.email}
              onChange={(e) =>
                setCreateData({ ...createData, email: e.target.value })
              }
              placeholder="e.g., jholloway@sc-qpms.edu"
              required
            />

            <Select
              label="Institutional Role Clearance"
              options={[
                { value: "Question Setter", label: "Question Setter" },
                { value: "Reviewer", label: "Reviewer" },
                { value: "Examination Authority", label: "Examination Authority" },
                { value: "Examination Center", label: "Examination Center" },
                { value: "Admin", label: "Security Administrator" },
              ]}
              value={createData.role}
              onChange={(e) =>
                setCreateData({ ...createData, role: e.target.value as UserRole })
              }
              required
            />

            <Input
              label="Initial Password"
              type="password"
              value={createData.password}
              onChange={(e) =>
                setCreateData({ ...createData, password: e.target.value })
              }
              placeholder="Minimum 6 characters"
              required
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={creating}
                icon={<UserPlus className="w-4 h-4 text-sky-400" />}
              >
                Create Account
              </Button>
            </div>
          </form>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          isOpen={!!resetUser}
          onClose={() => setResetUser(null)}
          title={`Reset Password: ${resetUser?.name}`}
          subtitle={`Account: ${resetUser?.email}`}
          maxWidth="sm"
        >
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <Input
              label="New Secure Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetUser(null)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={resetting}
                icon={<Key className="w-4 h-4 text-sky-400" />}
              >
                Confirm Reset
              </Button>
            </div>
          </form>
        </Modal>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleConfirmDelete}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete the account for ${deleteUser?.name} (${deleteUser?.email})? This action will be logged in the security audit stream.`}
          confirmText="Delete Account"
          loading={deleting}
        />
      </div>
    </AppShell>
  );
}
