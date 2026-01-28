"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  CreditCard,
  MoreVertical,
  Users,
  TrendingUp,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Alert from "@/components/Alert";
import { useMembers, useSettings } from "@/hooks/useDatabase";
import { Member } from "@/utils/types";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  isValidPhone,
  isValidNRC,
} from "@/utils/helpers";
import { useRouter } from "next/navigation";

export default function MembersPage() {
  const { members, loading, addMember, updateMember, deleteMember, refresh } =
    useMembers();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  let rouer = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nrc: "",
    phone: "",
    status: "active" as "active" | "suspended" | "left",
    joinDate: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      nrc: "",
      phone: "",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setEditingMember(null);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      nrc: member.nrc,
      phone: member.phone,
      status: member.status,
      joinDate: member.joinDate.split("T")[0],
    });
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.nrc.trim()) {
      errors.nrc = "NRC number is required";
    } else if (!isValidNRC(formData.nrc)) {
      errors.nrc = "Invalid NRC format (e.g., 123456/10/1)";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = "Invalid phone number";
    }

    if (!formData.joinDate) {
      errors.joinDate = "Join date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingMember) {
        updateMember(editingMember.id, {
          name: formData.name,
          nrc: formData.nrc,
          phone: formData.phone,
          status: formData.status,
          joinDate: formData.joinDate,
        });
        setAlert({ type: "success", message: "Member updated successfully!" });
      } else {
        addMember({
          name: formData.name,
          nrc: formData.nrc,
          phone: formData.phone,
          status: formData.status,
          joinDate: formData.joinDate,
        });
        setAlert({ type: "success", message: "Member added successfully!" });
      }

      setShowModal(false);
      resetForm();
      refresh();
    } catch (error) {
      setAlert({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleDelete = (member: Member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      deleteMember(member.id);
      setAlert({ type: "success", message: "Member deleted successfully!" });
      refresh();
    }
  };

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Member Name",
      sortable: true,
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-bank-500 to-bank-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-bank-500/25">
            {member.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-forest-900">{member.name}</p>
            <p className="text-xs text-forest-500 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {member.nrc}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (member) => (
        <div className="flex items-center gap-2 text-forest-700">
          <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
            <Phone className="w-4 h-4 text-forest-600" />
          </div>
          <span className="font-medium">{member.phone}</span>
        </div>
      ),
    },
    {
      key: "totalShares",
      header: "Shares",
      sortable: true,
      render: (member) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-sm rounded-lg">
            <Award className="w-3.5 h-3.5" />
            {member.totalShares}
          </span>
        </div>
      ),
    },
    {
      key: "totalSavings",
      header: "Total Savings",
      sortable: true,
      render: (member) => (
        <span className="font-bold text-bank-600 text-lg">
          {formatCurrency(member.totalSavings)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <span className={`${getStatusColor(member.status)} font-semibold`}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
      ),
    },
    {
      key: "joinDate",
      header: "Joined",
      sortable: true,
      render: (member) => (
        <div className="text-forest-600 font-medium">
          {formatDate(member.joinDate)}
        </div>
      ),
    },
  ];

  if (!mounted) {
    return (
      <Layout title="Members">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-bank-200 border-t-bank-600 rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-bank-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            />
          </div>
        </div>
      </Layout>
    );
  }

  const totalShares = members.reduce((sum, m) => sum + m.totalShares, 0);
  const activeMembers = members.filter((m) => m.status === "active").length;
  const totalSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);

  return (
    <Layout title="Members">
      <Head>
        <title>Members | Village Savings Bank</title>
      </Head>

      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 p-8 lg:p-10 shadow-2xl shadow-bank-500/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
            <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
            <div className="w-full h-full bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-bank-100" />
                  <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider">
                    Member Management
                  </p>
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                  Group Members
                </h1>
                <p className="text-bank-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                  Manage your village banking group members, track their
                  savings, and monitor contributions.
                </p>
              </div>
              <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Add Member Button */}
            <div className="mt-8">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-bank-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bank-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bank-600 to-bank-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <span>Add New Member</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Members */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-forest-900 mt-2">
                  {members.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-bank-600" />
              </div>
            </div>
          </div>

          {/* Active Members */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Active Members
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {activeMembers}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Shares */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Total Shares
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {totalShares}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Savings */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Total Savings
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
            <h2 className="text-xl font-bold text-forest-900">All Members</h2>
            <p className="text-sm text-forest-500 mt-1">
              Click on any member to view their details
            </p>
          </div>

          <DataTable
            columns={columns}
            data={members as unknown as Record<string, unknown>[]}
            keyExtractor={(item) => (item as unknown as Member).id}
            searchable
            searchPlaceholder="Search members by name, NRC, or phone..."
            searchKeys={["name", "nrc", "phone"]}
            emptyMessage="No members found. Add your first member to get started."
            onRowClick={(item) => setViewingMember(item as unknown as Member)}
            actions={(item) => {
              const member = item as unknown as Member;
              return (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingMember(member);
                    }}
                    className="p-2.5 rounded-xl hover:bg-forest-100 transition-all duration-200 hover:scale-110 group"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-forest-500 group-hover:text-forest-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(member);
                    }}
                    className="p-2.5 rounded-xl hover:bg-bank-100 transition-all duration-200 hover:scale-110 group"
                    title="Edit member"
                  >
                    <Edit2 className="w-4 h-4 text-bank-600 group-hover:text-bank-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member);
                    }}
                    className="p-2.5 rounded-xl hover:bg-red-100 transition-all duration-200 hover:scale-110 group"
                    title="Delete member"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700" />
                  </button>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingMember ? "Edit Member" : "Add New Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                formErrors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-forest-200 focus:border-bank-500 focus:ring-bank-500/20"
              } focus:ring-4 transition-all duration-200`}
              placeholder="Enter full name"
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {formErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              NRC Number
            </label>
            <input
              type="text"
              value={formData.nrc}
              onChange={(e) =>
                setFormData({ ...formData, nrc: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                formErrors.nrc
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-forest-200 focus:border-bank-500 focus:ring-bank-500/20"
              } focus:ring-4 transition-all duration-200`}
              placeholder="e.g., 123456/10/1"
            />
            {formErrors.nrc && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {formErrors.nrc}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                formErrors.phone
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-forest-200 focus:border-bank-500 focus:ring-bank-500/20"
              } focus:ring-4 transition-all duration-200`}
              placeholder="+260 97 1234567"
            />
            {formErrors.phone && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {formErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "suspended" | "left",
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="left">Left Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Join Date
            </label>
            <input
              type="date"
              value={formData.joinDate}
              onChange={(e) =>
                setFormData({ ...formData, joinDate: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                formErrors.joinDate
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-forest-200 focus:border-bank-500 focus:ring-bank-500/20"
              } focus:ring-4 transition-all duration-200`}
            />
            {formErrors.joinDate && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {formErrors.joinDate}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-semibold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {editingMember ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Member Modal */}
      <Modal
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        title="Member Details"
        size="lg"
      >
        {viewingMember && (
          <div className="space-y-6">
            {/* Member Header */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-bank-50 to-white border border-bank-200">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bank-500 to-bank-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-bank-500/30">
                {viewingMember.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-forest-900">
                  {viewingMember.name}
                </h3>
                <p className="text-forest-600 flex items-center gap-2 mt-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">{viewingMember.nrc}</span>
                </p>
              </div>
              <span
                className={`${getStatusColor(viewingMember.status)} text-sm font-bold`}
              >
                {viewingMember.status.charAt(0).toUpperCase() +
                  viewingMember.status.slice(1)}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-forest-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-forest-500 to-forest-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Phone
                </p>
                <p className="font-bold text-forest-900 mt-2 text-lg">
                  {viewingMember.phone}
                </p>
              </div>

              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Total Shares
                </p>
                <p className="font-bold text-purple-600 mt-2 text-2xl">
                  {viewingMember.totalShares}
                </p>
              </div>

              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-bank-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Total Savings
                </p>
                <p className="font-bold text-bank-600 mt-2 text-2xl">
                  {formatCurrency(viewingMember.totalSavings)}
                </p>
              </div>

              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Social Fund
                </p>
                <p className="font-bold text-blue-600 mt-2 text-xl">
                  {formatCurrency(viewingMember.socialContributions)}
                </p>
              </div>

              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                  Birthday Fund
                </p>
                <p className="font-bold text-purple-600 mt-2 text-xl">
                  {formatCurrency(viewingMember.birthdayContributions)}
                </p>
              </div>

              <div className="group relative rounded-xl bg-white p-5 border border-forest-100 hover:border-forest-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-forest-500 to-forest-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member Since
                </p>
                <p className="font-bold text-forest-900 mt-2 text-lg">
                  {formatDate(viewingMember.joinDate)}
                </p>
              </div>
            </div>

            {/* Loan Eligibility Card */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bank-500 via-bank-600 to-bank-500 p-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider">
                  Maximum Loan Eligible
                </p>
                <p className="text-4xl font-bold text-white mt-2">
                  {formatCurrency(
                    viewingMember.totalSavings * settings.maxLoanMultiplier,
                  )}
                </p>
                <p className="text-bank-100 text-sm mt-2">
                  Based on {settings.maxLoanMultiplier}x savings rule
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setViewingMember(null);
                  openEditModal(viewingMember);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit Member
              </button>
              <button
                onClick={() => {
                  setViewingMember(null);
                  rouer.push(`/members/${viewingMember.id}`);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-semibold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View More
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
