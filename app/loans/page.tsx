"use client";
import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import InterestCalculator from "@/components/InterestCalculator";
import DataTable, { Column } from "@/components/DataTable";
import { useLoans, useMembers, useSettings } from "@/hooks/useDatabase";
import { Loan } from "@/utils/types";
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
  X,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  Clock,
  Calculator,
  HandCoins,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  Circle,
  CircleAlert,
  Wallet,
  TrendingDown,
} from "lucide-react";
import { penaliseLoan } from "@/utils/database";

export default function LoansPage() {
  const {
    loans,
    createLoan,
    approveLoan,
    makePayment,
    rolloverLoan,
    checkEligibility,
    calculateInterest,
    penalise,
  } = useLoans();
  const { members } = useMembers();
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [fineAmount, setFineAmount] = useState(0);

  const [formData, setFormData] = useState({
    memberId: "",
    amount: 0,
    period: 90,
    interestRate: settings.defaultInterestRate,
    interestType: settings.defaultInterestType as
      | "normal_simple"
      | "custom_simple"
      | "compound",
  });
  const [eligibilityResult, setEligibilityResult] = useState<ReturnType<
    typeof checkEligibility
  > | null>(null);

  const activeMembers = members.filter((m) => m.status === "active");
  const activeLoans = loans.filter((l) => l.status === "active");
  const pendingLoans = loans.filter((l) => l.status === "pending");
  const overdueLoans = activeLoans.filter((l) => isOverdue(l.dueDate));
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + (l.totalRepayment - l.amountPaid),
    0,
  );

  // NEW STATS CALCULATIONS

  // Currently Loaned: Total amount still owed (principal + interest - payments made)
  const currentlyLoaned = activeLoans.reduce(
    (sum, l) => sum + (l.totalRepayment - l.amountPaid),
    0,
  );

  // Available to Loan: Calculate based on actual pot
  // Start with total savings pot
  const totalActiveMemberSavings = activeMembers.reduce(
    (sum, m) => sum + m.totalSavings,
    0,
  );

  // Add back all loan repayments that have been made
  const totalLoanRepayments = loans.reduce((sum, l) => sum + l.amountPaid, 0);

  // Subtract all loan disbursements (what we gave out)
  const totalLoanDisbursements = loans
    .filter((l) => l.status === "active" || l.status === "paid")
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const availableToLoan = Math.max(
    0,
    totalActiveMemberSavings + totalLoanRepayments - totalLoanDisbursements,
  );

  const handleMemberChange = (memberId: string) => {
    setFormData({ ...formData, memberId });
    if (memberId) {
      setEligibilityResult(checkEligibility(memberId, formData.amount));
    } else {
      setEligibilityResult(null);
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
    setFormData({
      memberId: "",
      amount: 0,
      period: 90,
      interestRate: settings.defaultInterestRate,
      interestType: settings.defaultInterestType,
    });
    setEligibilityResult(null);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || paymentAmount <= 0) return;
    makePayment(selectedLoan.id, paymentAmount);
    setShowPaymentModal(false);
    setSelectedLoan(null);
    setPaymentAmount(0);
  };

  const handleApprove = (loan: Loan) => {
    if (
      window.confirm(
        `Approve loan of ${formatCurrency(loan.principalAmount)} for ${loan.memberName}?`,
      )
    ) {
      approveLoan(loan.id);
    }
  };

  const handleRollover = (loan: Loan) => {
    if (
      window.confirm(
        `Rollover loan for ${loan.memberName}? The remaining balance will be carried over with new interest.`,
      )
    ) {
      rolloverLoan(loan.id);
    }
  };

  const handlePenalise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || fineAmount <= 0) return;
    penalise(selectedLoan.id, fineAmount);
    setShowFineModal(false);
    setSelectedLoan(null);
    setFineAmount(0);
  };

  const openPaymentModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.totalRepayment - loan.amountPaid);
    setShowPaymentModal(true);
  };

  const openFineModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowFineModal(true);
  };

  const interestPreview =
    formData.amount > 0
      ? calculateInterest(
          formData.amount,
          formData.interestRate,
          formData.interestType,
          Math.floor(formData.period / 30),
        )
      : null;

  const columns: Column<Loan>[] = [
    {
      key: "memberName",
      header: "Member",
      sortable: true,
      render: (loan) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/25">
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
        <span className="font-bold text-forest-900">
          {formatCurrency(loan.principalAmount)}
        </span>
      ),
    },
    {
      key: "interestRate",
      header: "Interest",
      render: (loan) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold text-sm rounded-lg">
            {loan.interestRate}%
          </span>
          <p className="text-xs text-forest-500 mt-1">{loan.interestType}</p>
        </div>
      ),
    },
    {
      key: "totalRepayment",
      header: "Total Due",
      sortable: true,
      render: (loan) => (
        <span className="font-bold text-amber-600 text-lg">
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
                className="h-full bg-gradient-to-r from-bank-500 to-bank-400 rounded-full transition-all duration-500"
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
        const overdue = isOverdue(loan.dueDate) && loan.status === "active";
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
      render: (loan) => (
        <div>
          <span className={`${getStatusColor(loan.status)} font-semibold`}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </span>
          {loan.rolloverCount > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
              R{loan.rolloverCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Loans | Village Banking System</title>
      </Head>
      <Layout title="Loans">
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 p-8 lg:p-10 shadow-2xl shadow-amber-500/20">
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
                    <Sparkles className="w-5 h-5 text-amber-100" />
                    <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">
                      Loan Management System
                    </p>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    Member Loans
                  </h1>
                  <p className="text-amber-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                    Issue loans to members, track repayments, and manage loan
                    lifecycle with automated interest calculations.
                  </p>
                </div>
                <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                  <HandCoins className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => setShowModal(true)}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-amber-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span>New Loan Request</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowCalculatorModal(true)}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <span>Interest Calculator</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Active Loans */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Active Loans
                  </p>
                  <p className="text-3xl font-bold text-forest-900 mt-2">
                    {activeLoans.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HandCoins className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Pending Approval */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {pendingLoans.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Overdue Loans */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Overdue
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {overdueLoans.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>

            {/* Total Outstanding */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Outstanding
                  </p>
                  <p className="text-2xl font-bold text-bank-600 mt-2">
                    {formatCurrency(totalOutstanding)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-7 h-7 text-bank-600" />
                </div>
              </div>
            </div>
          </div>

          {/* NEW STATS ROW - Currently Loaned & Available to Loan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {/* Currently Loaned */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Currently Loaned
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-purple-600 mt-2">
                    {formatCurrency(currentlyLoaned)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">
                    Total outstanding (principal + interest)
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Available to Loan */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Available to Loan
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-2">
                    {formatCurrency(availableToLoan)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">
                    Funds available for new loans
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Alert */}
          {overdueLoans.length > 0 && (
            <div className="relative rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border-l-4 border-red-500 shadow-lg animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900">
                    {overdueLoans.length} Overdue Loan
                    {overdueLoans.length > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {overdueLoans.map((l) => l.memberName).join(", ")} -
                    Consider rollover or recovery action immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loans Table */}
          <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
              <h2 className="text-xl font-bold text-forest-900">All Loans</h2>
              <p className="text-sm text-forest-500 mt-1">
                Manage loan requests, approvals, and repayments
              </p>
            </div>

            <DataTable
              columns={columns}
              data={loans as unknown as Record<string, unknown>[]}
              keyExtractor={(item) => (item as unknown as Loan).id}
              searchable
              searchPlaceholder="Search by member name..."
              searchKeys={["memberName"]}
              emptyMessage="No loans found. Create a new loan request to get started."
              pageSize={10}
              actions={(item) => {
                const loan = item as unknown as Loan;
                return (
                  <div className="flex items-center gap-1">
                    {loan.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(loan);
                        }}
                        className="p-2.5 rounded-xl hover:bg-bank-100 transition-all duration-200 hover:scale-110 group"
                        title="Approve loan"
                      >
                        <CheckCircle2 className="w-4 h-4 text-bank-600 group-hover:text-bank-700" />
                      </button>
                    )}
                    {loan.status === "active" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPaymentModal(loan);
                          }}
                          className="p-2.5 rounded-xl hover:bg-bank-100 transition-all duration-200 hover:scale-110 group"
                          title="Record payment"
                        >
                          <DollarSign className="w-4 h-4 text-bank-600 group-hover:text-bank-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFineModal(loan);
                          }}
                          className="p-2.5 rounded-xl hover:bg-red-100 transition-all duration-200 hover:scale-110 group"
                          title="Penalise Loan"
                        >
                          <CircleAlert className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                        </button>
                        {isOverdue(loan.dueDate) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollover(loan);
                            }}
                            className="p-2.5 rounded-xl hover:bg-amber-100 transition-all duration-200 hover:scale-110 group"
                            title="Rollover loan"
                          >
                            <RefreshCw className="w-4 h-4 text-amber-600 group-hover:text-amber-700" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* New Loan Request Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setFormData({
              memberId: "",
              amount: 0,
              period: 90,
              interestRate: settings.defaultInterestRate,
              interestType: settings.defaultInterestType,
            });
            setEligibilityResult(null);
          }}
          title="New Loan Request"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    {member.name} - Max:{" "}
                    {formatCurrency(
                      member.totalSavings * settings.maxLoanMultiplier,
                    )}
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
                  placeholder="Enter loan amount"
                  required
                />
              </div>
              {eligibilityResult && (
                <div
                  className={`mt-3 p-4 rounded-xl border-2 ${
                    eligibilityResult.eligible
                      ? "bg-bank-50 border-bank-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {eligibilityResult.eligible ? (
                    <p className="text-sm text-bank-700 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>
                        Eligible for loan up to{" "}
                        <span className="font-bold">
                          {formatCurrency(eligibilityResult.maxAmount)}
                        </span>
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 flex items-center gap-2 font-medium">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{eligibilityResult.reason}</span>
                    </p>
                  )}
                </div>
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
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Interest Rate (%) *
                </label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Interest Type *
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestType: e.target.value as
                        | "normal_simple"
                        | "custom_simple"
                        | "compound",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
                >
                  <option value="normal_simple">Normal Simple Interest</option>
                  <option value="custom_simple">Custom Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>
            </div>

            {interestPreview && formData.amount > 0 && (
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 border-2 border-amber-200">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                  <div className="w-full h-full bg-amber-500 rounded-full blur-2xl" />
                </div>
                <div className="relative">
                  <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Loan Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Principal
                      </p>
                      <p className="text-xl font-bold text-forest-900 mt-1">
                        {formatCurrency(interestPreview.principal)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Interest
                      </p>
                      <p className="text-xl font-bold text-amber-700 mt-1">
                        {formatCurrency(interestPreview.interest)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-xl border-2 border-amber-300">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Total Repayment
                      </p>
                      <p className="text-xl font-bold text-forest-900 mt-1">
                        {formatCurrency(interestPreview.total)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 text-center mt-4 font-medium">
                    Due in {formData.period} days • {formData.interestType}{" "}
                    interest
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    memberId: "",
                    amount: 0,
                    period: 90,
                    interestRate: settings.defaultInterestRate,
                    interestType: settings.defaultInterestType,
                  });
                  setEligibilityResult(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold hover:from-amber-700 hover:to-amber-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!eligibilityResult?.eligible}
              >
                Submit Loan Request
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
          title="Record Loan Payment"
        >
          {selectedLoan && (
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-forest-50 to-white rounded-xl border border-forest-200">
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-2">
                  Loan Details
                </p>
                <p className="text-xl font-bold text-forest-900 mb-3">
                  {selectedLoan.memberName}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-forest-100">
                    <p className="text-xs text-forest-500 font-medium">
                      Outstanding
                    </p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {formatCurrency(
                        selectedLoan.totalRepayment - selectedLoan.amountPaid,
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-forest-100">
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
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentAmount(
                        (selectedLoan.totalRepayment -
                          selectedLoan.amountPaid) /
                          4,
                      )
                    }
                    className="px-4 py-2 bg-forest-50 text-forest-700 font-semibold text-sm rounded-lg hover:bg-forest-100 border border-forest-200 transition-colors"
                  >
                    Quarter
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

        <Modal
          isOpen={showFineModal}
          onClose={() => {
            setShowFineModal(false);
            setSelectedLoan(null);
            setFineAmount(0);
          }}
          title="Apply Loan Penalty"
        >
          {selectedLoan && (
            <form onSubmit={handlePenalise} className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-forest-50 to-white rounded-xl border border-forest-200">
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-2">
                  Loan Details
                </p>
                <p className="text-xl font-bold text-forest-900 mb-3">
                  {selectedLoan.memberName}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-forest-100">
                    <p className="text-xs text-forest-500 font-medium">
                      Outstanding
                    </p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {formatCurrency(
                        selectedLoan.totalRepayment - selectedLoan.amountPaid,
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-forest-100">
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
                  Penalty Amount ({settings.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                    step="0.01"
                    placeholder="Enter payment amount"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFineModal(false);
                    setSelectedLoan(null);
                    setFineAmount(0);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold hover:from-amber-700 hover:to-amber-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={fineAmount <= 0}
                >
                  Fine Loan
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Calculator Modal */}
        <Modal
          isOpen={showCalculatorModal}
          onClose={() => setShowCalculatorModal(false)}
          title="Interest Calculator"
          size="xl"
        >
          <InterestCalculator showSchedule={true} />
        </Modal>
      </Layout>
    </>
  );
}
