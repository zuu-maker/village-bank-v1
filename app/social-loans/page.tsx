"use client";
import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import { useSocialLoans, useMembers, useSettings } from "@/hooks/useDatabase";
import { SocialLoan } from "@/utils/types";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  isOverdue,
  calculatePercentage,
} from "@/utils/helpers";
import {
  Plus,
  Check,
  DollarSign,
  AlertTriangle,
  Heart,
  Users,
  TrendingUp,
  Wallet,
  Sparkles,
  HandHeart,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  Calendar,
} from "lucide-react";

export default function SocialLoansPage() {
  const {
    loans,
    createLoan,
    approveLoan,
    makePayment,
    checkEligibility,
    getSocialPotSummary,
  } = useSocialLoans();
  const { members } = useMembers();
  const { settings } = useSettings();

  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showSharesModal, setShowSharesModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<SocialLoan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [formData, setFormData] = useState({
    memberId: "",
    amount: 0,
    period: 30,
    interestRate: settings.defaultInterestRate,
    interestType: settings.defaultInterestType as "simple" | "compound",
  });

  const [welfareData, setWelfareData] = useState({
    amount: 0,
    description: "",
  });

  const [eligibilityResult, setEligibilityResult] = useState<ReturnType<
    typeof checkEligibility
  > | null>(null);

  const activeMembers = members.filter((m) => m.status === "active");
  const socialSummary = getSocialPotSummary();
  const activeLoans = loans.filter((l) => l.status === "active");
  const pendingLoans = loans.filter((l) => l.status === "pending");
  const overdueLoans = activeLoans.filter((l) => isOverdue(l.dueDate));

  const handleMemberChange = (memberId: string) => {
    setFormData({ ...formData, memberId });
    if (memberId) {
      setEligibilityResult(checkEligibility(memberId, formData.amount));
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData({ ...formData, amount });
    if (formData.memberId) {
      setEligibilityResult(checkEligibility(formData.memberId, amount));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibilityResult?.eligible) return;
    createLoan(
      formData.memberId,
      formData.amount,
      formData.period,
      formData.interestRate,
      formData.interestType,
    );
    setShowModal(false);
    resetForm();
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || paymentAmount <= 0) return;
    makePayment(selectedLoan.id, paymentAmount);
    setShowPaymentModal(false);
    setSelectedLoan(null);
    setPaymentAmount(0);
  };

  const resetForm = () => {
    setFormData({
      memberId: "",
      amount: 0,
      period: 30,
      interestRate: settings.defaultInterestRate,
      interestType: settings.defaultInterestType,
    });
    setEligibilityResult(null);
  };

  const columns: Column<SocialLoan>[] = [
    {
      key: "memberName",
      header: "Member",
      sortable: true,
      render: (loan) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
            {loan.memberName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-forest-900">{loan.memberName}</p>
            <p className="text-xs text-forest-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(loan.requestDate)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "principalAmount",
      header: "Principal",
      sortable: true,
      render: (loan) => (
        <span className="font-bold text-forest-900 text-lg">
          {formatCurrency(loan.principalAmount)}
        </span>
      ),
    },
    {
      key: "interestRate",
      header: "Interest",
      render: (loan) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg">
            {loan.interestRate}%
          </span>
          <p className="text-xs text-forest-500 mt-1 capitalize">
            {loan.interestType}
          </p>
        </div>
      ),
    },
    {
      key: "totalRepayment",
      header: "Total Due",
      sortable: true,
      render: (loan) => (
        <span className="font-bold text-blue-600 text-lg">
          {formatCurrency(loan.totalRepayment)}
        </span>
      ),
    },
    {
      key: "amountPaid",
      header: "Progress",
      render: (loan) => {
        const progress = calculatePercentage(
          loan.amountPaid,
          loan.totalRepayment,
        );
        const remaining = loan.totalRepayment - loan.amountPaid;
        return (
          <div className="w-40">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-bank-600 font-semibold">
                {formatCurrency(loan.amountPaid)}
              </span>
              <span className="text-forest-600 font-bold">{progress}%</span>
            </div>
            <div className="h-2.5 bg-forest-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-forest-500 mt-1.5 font-medium">
              {formatCurrency(remaining)} left
            </p>
          </div>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (loan) => {
        // change this please
        // const overdue = isOverdue(loan.dueDate) && loan.status === "active";
        const overdue = true && loan.status === "active";
        return (
          <div className="flex items-center gap-2">
            {overdue && (
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            )}
            <span
              className={`font-medium ${overdue ? "text-red-600" : "text-forest-700"}`}
            >
              {formatDate(loan.dueDate)}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (loan) => {
        const overdue = isOverdue(loan.dueDate) && loan.status === "active";
        return (
          <div>
            {overdue ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 font-bold text-sm rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            ) : loan.status === "active" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 font-bold text-sm rounded-lg">
                <Clock className="w-3 h-3" />
                Active
              </span>
            ) : loan.status === "paid" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 font-bold text-sm rounded-lg">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Social Loans | Village Banking System</title>
      </Head>
      <Layout title="Social Loans">
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 p-8 lg:p-10 shadow-2xl shadow-blue-500/20">
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
                    <Sparkles className="w-5 h-5 text-blue-100" />
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">
                      Social Welfare Fund
                    </p>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    Social Fund Loans
                  </h1>
                  <p className="text-blue-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                    Manage loans from the social welfare pot for member
                    emergencies and community support initiatives.
                  </p>
                </div>
                <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                  <HandHeart className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => setShowWelfareModal(true)}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span>Record Welfare Usage</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-blue-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span>New Social Loan</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Social Pot Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Contributions */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Total Contributions
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {formatCurrency(socialSummary.totalContributions)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Used for Welfare */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Used for Welfare
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {formatCurrency(socialSummary.totalUsedForWelfare)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>

            {/* Currently Loaned */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Currently Loaned
                  </p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {formatCurrency(socialSummary.totalLoanedOut)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Available to Loan */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Available to Loan
                  </p>
                  <p className="text-3xl font-bold text-bank-600 mt-2">
                    {formatCurrency(socialSummary.availableForLoans)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-bank-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Interest Earned Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 p-8 shadow-2xl shadow-bank-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-5 h-5 text-bank-100" />
                    <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider">
                      Interest Earned
                    </p>
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {formatCurrency(socialSummary.totalInterestEarned)}
                  </p>
                  <p className="text-bank-100 text-sm mt-1">
                    From social welfare loans
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider">
                      Available for Distribution
                    </p>
                    <TrendingUp className="w-5 h-5 text-bank-100" />
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {formatCurrency(socialSummary.availableForDistribution)}
                  </p>
                  <p className="text-bank-100 text-sm mt-1">
                    Can be shared at cycle end
                  </p>
                </div>
              </div>

              {/* Calculate Shares Button */}
              {socialSummary.availableForDistribution > 0 &&
                activeMembers.length > 0 && (
                  <div className="flex justify-center pt-4 border-t border-white/20">
                    <button
                      onClick={() => setShowSharesModal(true)}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-200"
                    >
                      <Users className="w-5 h-5" />
                      <span>Calculate Member Shares</span>
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Loans Table */}
          <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
              <h2 className="text-xl font-bold text-forest-900">
                All Social Loans
              </h2>
              <p className="text-sm text-forest-600 mt-1">
                Manage and track social welfare fund loans
              </p>
            </div>

            <DataTable
              columns={columns}
              data={loans as unknown as Record<string, unknown>[]}
              keyExtractor={(item) => (item as unknown as SocialLoan).id}
              searchable
              searchPlaceholder="Search by member name..."
              searchKeys={["memberName"]}
              emptyMessage="No social loans found. Create one to get started."
              pageSize={10}
              actions={(item) => {
                const loan = item as unknown as SocialLoan;
                return (
                  <div className="flex items-center gap-1">
                    {loan.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          approveLoan(loan.id);
                        }}
                        className="p-2.5 rounded-xl hover:bg-blue-100 transition-all duration-200 hover:scale-110 group"
                        title="Approve loan"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                      </button>
                    )}
                    {loan.status === "active" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLoan(loan);
                          setPaymentAmount(
                            loan.totalRepayment - loan.amountPaid,
                          );
                          setShowPaymentModal(true);
                        }}
                        className="p-2.5 rounded-xl hover:bg-blue-100 transition-all duration-200 hover:scale-110 group"
                        title="Record payment"
                      >
                        <DollarSign className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                      </button>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* New Social Loan Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title="New Social Loan Request"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Available funds notice */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Available in Social Pot
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(socialSummary.availableForLoans)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Select Member *
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
                required
              >
                <option value="">Choose a member...</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Loan Amount ({settings.currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                  min="0"
                  max={socialSummary.availableForLoans}
                  placeholder="Enter loan amount"
                  required
                />
              </div>
              {eligibilityResult && !eligibilityResult.eligible && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {eligibilityResult.reason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Repayment Period (Days) *
              </label>
              <input
                type="number"
                value={formData.period}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                min="1"
                placeholder="e.g. 30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interestRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 pr-10 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Interest Type
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestType: e.target.value as "simple" | "compound",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
                >
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>
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
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!eligibilityResult?.eligible}
              >
                Submit Request
              </button>
            </div>
          </form>
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedLoan(null);
            setPaymentAmount(0);
          }}
          title="Record Social Loan Payment"
        >
          {selectedLoan && (
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Loan Details
                </p>
                <p className="text-xl font-bold text-forest-900 mb-3">
                  {selectedLoan.memberName}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs text-forest-500 font-medium">
                      Outstanding
                    </p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {formatCurrency(
                        selectedLoan.totalRepayment - selectedLoan.amountPaid,
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs text-forest-500 font-medium">
                      Total Due
                    </p>
                    <p className="text-lg font-bold text-forest-900 mt-1">
                      {formatCurrency(selectedLoan.totalRepayment)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Payment Amount ({settings.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                    min="0"
                    max={selectedLoan.totalRepayment - selectedLoan.amountPaid}
                    step="0.01"
                    placeholder="Enter payment amount"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentAmount(
                        selectedLoan.totalRepayment - selectedLoan.amountPaid,
                      )
                    }
                    className="px-4 py-2 bg-bank-50 text-bank-700 font-semibold text-sm rounded-lg hover:bg-bank-100 border border-bank-200 transition-colors"
                  >
                    Full Amount
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentAmount(
                        (selectedLoan.totalRepayment -
                          selectedLoan.amountPaid) /
                          2,
                      )
                    }
                    className="px-4 py-2 bg-forest-50 text-forest-700 font-semibold text-sm rounded-lg hover:bg-forest-100 border border-forest-200 transition-colors"
                  >
                    Half Amount
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedLoan(null);
                    setPaymentAmount(0);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-semibold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={paymentAmount <= 0}
                >
                  Record Payment
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Welfare Usage Modal */}
        <Modal
          isOpen={showWelfareModal}
          onClose={() => setShowWelfareModal(false)}
          title="Record Welfare Usage"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // recordWelfareUsage(welfareData.amount, welfareData.description);
              setShowWelfareModal(false);
              setWelfareData({ amount: 0, description: "" });
            }}
            className="space-y-5"
          >
            <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 mb-1">
                    Welfare Fund Usage
                  </p>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Record money taken from social pot for emergencies such as
                    funerals, medical expenses, or other urgent member needs.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Amount ({settings.currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  value={welfareData.amount}
                  onChange={(e) =>
                    setWelfareData({
                      ...welfareData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Description *
              </label>
              <textarea
                value={welfareData.description}
                onChange={(e) =>
                  setWelfareData({
                    ...welfareData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 resize-none"
                rows={3}
                placeholder="e.g., Funeral assistance for John, Medical emergency for Mary"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWelfareModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Record Usage
              </button>
            </div>
          </form>
        </Modal>

        {/* Member Shares Distribution Modal */}
        <Modal
          isOpen={showSharesModal}
          onClose={() => setShowSharesModal(false)}
          title="Social Fund Distribution Calculator"
          size="xl"
        >
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bank-50 to-green-50 p-6 border-2 border-bank-200">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-bank-500 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h4 className="text-lg font-bold text-bank-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Distribution Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm font-semibold text-forest-600 mb-1">
                      Total Available
                    </p>
                    <p className="text-2xl font-bold text-bank-700">
                      {formatCurrency(socialSummary.availableForDistribution)}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm font-semibold text-forest-600 mb-1">
                      Active Members
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {activeMembers.length}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl col-span-2 md:col-span-1">
                    <p className="text-sm font-semibold text-forest-600 mb-1">
                      Share Per Member
                    </p>
                    <p className="text-2xl font-bold text-bank-700">
                      {formatCurrency(
                        socialSummary.availableForDistribution /
                          activeMembers.length,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">
                    Equal Distribution
                  </p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    The available interest earnings will be distributed equally
                    among all {activeMembers.length} active members. This amount
                    can be paid out at the end of the cycle.
                  </p>
                </div>
              </div>
            </div>

            {/* Member Distribution Table */}
            <div className="rounded-xl bg-white border border-forest-200 overflow-hidden">
              <div className="p-4 bg-forest-50 border-b border-forest-200">
                <h4 className="font-bold text-forest-900">
                  Individual Member Distributions
                </h4>
                <p className="text-sm text-forest-600 mt-0.5">
                  Breakdown by member
                </p>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-forest-100 border-b border-forest-200">
                      <th className="px-4 py-3 text-left font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Distribution Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {activeMembers.map((member) => {
                      const shareAmount =
                        socialSummary.availableForDistribution /
                        activeMembers.length;
                      return (
                        <tr key={member.id} className="hover:bg-forest-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bank-500 to-bank-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="font-semibold text-forest-900">
                                {member.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-lg font-bold text-bank-600">
                              {formatCurrency(shareAmount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-forest-50 font-bold border-t-2 border-forest-200">
                      <td className="px-4 py-3 text-forest-900">Total</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-lg text-bank-700">
                          {formatCurrency(
                            socialSummary.availableForDistribution,
                          )}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This is a calculation only. The actual
                  distribution should be done at cycle end through the Cycles
                  page. This amount represents interest earned from social
                  welfare loans.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSharesModal(false)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-semibold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </Layout>
    </>
  );
}
