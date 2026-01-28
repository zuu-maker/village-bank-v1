"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import Layout from "@/components/Layout";
import DataTable, { Column } from "@/components/DataTable";
import {
  useMembers,
  useTransactions,
  useLoans,
  useSettings,
} from "@/hooks/useDatabase";
import { Transaction, Loan, Member } from "@/utils/types";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getTransactionLabel,
  getTransactionColor,
  isIncomeTransaction,
  calculatePercentage,
  isOverdue,
} from "@/utils/helpers";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  PiggyBank,
  Users,
  Gift,
  HandCoins,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
} from "lucide-react";

interface MemberPageProps {
  params: {
    id: string;
  };
}

// Add this to handle static export with dynamic routes
export const dynamic = "force-dynamic";

export default function MemberPage() {
  const router = useRouter();
  const { members } = useMembers();
  const { transactions } = useTransactions();
  const { loans } = useLoans();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<"transactions" | "loans">(
    "transactions",
  );

  const params = useParams();

  // useEffect(() => {
  //   console.log(params);
  // }, []);

  // console.log(params);

  // Find the member
  const member = members.find((m) => m.id === params.id);

  if (!member) {
    return (
      <Layout title="Member Not Found">
        <div className="text-center py-12">
          <p className="text-forest-500">Member not found</p>
          <button
            onClick={() => router.push("/members")}
            className="mt-4 btn-primary"
          >
            Back to Members
          </button>
        </div>
      </Layout>
    );
  }

  // Filter member's data
  const memberTransactions = transactions.filter(
    (t) => t.memberId === member.id,
  );
  const memberLoans = loans.filter((l) => l.memberId === member.id);
  const activeLoans = memberLoans.filter((l) => l.status === "active");
  const totalBorrowed = memberLoans.reduce(
    (sum, l) => sum + l.principalAmount,
    0,
  );
  const totalRepaid = memberLoans.reduce((sum, l) => sum + l.amountPaid, 0);
  const outstandingBalance = activeLoans.reduce(
    (sum, l) => sum + (l.totalRepayment - l.amountPaid),
    0,
  );

  // Calculate loan eligibility
  const maxLoanAmount = member.totalSavings * settings.maxLoanMultiplier;
  const availableCredit = maxLoanAmount - outstandingBalance;

  // Transaction columns
  const transactionColumns: Column<Transaction>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-forest-500" />
          </div>
          <span className="text-sm font-medium text-forest-700">
            {formatDateTime(transaction.date)}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isIncomeTransaction(transaction.type)
                ? "bg-bank-100"
                : "bg-red-100"
            }`}
          >
            {isIncomeTransaction(transaction.type) ? (
              <ArrowUpRight className="w-4 h-4 text-bank-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
          </div>
          <span
            className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}
          >
            {getTransactionLabel(transaction.type)}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (transaction) => (
        <span
          className={`text-base font-bold ${
            isIncomeTransaction(transaction.type)
              ? "text-bank-600"
              : "text-red-600"
          }`}
        >
          {isIncomeTransaction(transaction.type) ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (transaction) => (
        <span className="text-sm text-forest-600">
          {transaction.description}
        </span>
      ),
    },
  ];

  // Loan columns
  const loanColumns: Column<Loan>[] = [
    {
      key: "requestDate",
      header: "Date",
      sortable: true,
      render: (loan) => (
        <span className="text-sm font-medium text-forest-700">
          {formatDate(loan.requestDate)}
        </span>
      ),
    },
    {
      key: "principalAmount",
      header: "Principal",
      sortable: true,
      render: (loan) => (
        <span className="text-base font-bold text-forest-900">
          {formatCurrency(loan.principalAmount)}
        </span>
      ),
    },
    {
      key: "interestRate",
      header: "Interest",
      render: (loan) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 font-bold text-sm rounded-lg">
            {loan.interestRate}%
          </span>
        </div>
      ),
    },
    {
      key: "totalRepayment",
      header: "Total Due",
      sortable: true,
      render: (loan) => (
        <span className="text-base font-bold text-amber-600">
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
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-bank-600 font-semibold">
                {formatCurrency(loan.amountPaid)}
              </span>
              <span className="text-forest-600 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-bank-500 to-bank-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-forest-500 mt-1 font-medium">
              {formatCurrency(remaining)} left
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
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
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-bank-100 text-bank-700 font-bold text-sm rounded-lg">
                <Clock className="w-3 h-3" />
                Active
              </span>
            ) : loan.status === "completed" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-700 font-bold text-sm rounded-lg">
                Pending
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Layout title={member.name}>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => router.push("/members")}
          className="inline-flex items-center gap-2 px-4 py-2 text-forest-600 hover:text-forest-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Members
        </button>

        {/* Profile Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 p-8 lg:p-10 shadow-2xl shadow-bank-500/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
            <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
            <div className="w-full h-full bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl">
                  <span className="text-4xl font-bold text-white">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>

                {/* Member Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-bank-100" />
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        member.status === "active"
                          ? "bg-green-500/20 text-white border border-white/30"
                          : "bg-red-500/20 text-white border border-white/30"
                      }`}
                    >
                      {member.status === "active"
                        ? "Active Member"
                        : "Inactive"}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    {member.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-bank-50">
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {member.phone}
                        </span>
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {member.address}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Joined {formatDate(member.joinDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {/* <button
                  onClick={() => {
                    // This would open an edit modal - implement as needed
                    alert("Edit member functionality - to be implemented");
                  }}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md text-bank-700 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </button> */}
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Savings */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PiggyBank className="w-6 h-6 text-bank-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-1">
              Total Savings
            </p>
            <p className="text-3xl font-bold text-bank-600">
              {formatCurrency(member.totalSavings)}
            </p>
            <p className="text-xs text-forest-500 mt-2">
              {member.totalShares} shares ×{" "}
              {formatCurrency(settings.sharePrice)}
            </p>
          </div>

          {/* Total Shares */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-1">
              Total Shares
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {member.totalShares}
            </p>
            <p className="text-xs text-forest-500 mt-2">
              Share value: {formatCurrency(settings.sharePrice)} each
            </p>
          </div>

          {/* Social & Birthday */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-1">
              Contributions
            </p>
            <div className="space-y-1">
              <p className="text-base font-bold text-blue-600">
                Social: {formatCurrency(member.socialContributions)}
              </p>
              <p className="text-base font-bold text-purple-600">
                Birthday: {formatCurrency(member.birthdayContributions)}
              </p>
            </div>
          </div>

          {/* Loan Stats */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HandCoins className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-1">
              Outstanding
            </p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(outstandingBalance)}
            </p>
            <p className="text-xs text-forest-500 mt-2">
              {activeLoans.length} active loan
              {activeLoans.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Loan Eligibility Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white p-6 border-2 border-amber-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-900">
                  Loan Eligibility
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold text-forest-600 mb-1">
                    Max Loan Amount
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(maxLoanAmount)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">
                    Based on savings × {settings.maxLoanMultiplier}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-600 mb-1">
                    Current Outstanding
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(outstandingBalance)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">
                    Amount still owed
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-600 mb-1">
                    Available Credit
                  </p>
                  <p className="text-2xl font-bold text-bank-600">
                    {formatCurrency(availableCredit)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">
                    Can borrow up to this amount
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
          <div className="flex border-b border-forest-100">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 px-6 py-4 font-bold transition-all duration-200 ${
                activeTab === "transactions"
                  ? "bg-bank-50 text-bank-700 border-b-2 border-bank-600"
                  : "text-forest-600 hover:bg-forest-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transactions ({memberTransactions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`flex-1 px-6 py-4 font-bold transition-all duration-200 ${
                activeTab === "loans"
                  ? "bg-amber-50 text-amber-700 border-b-2 border-amber-600"
                  : "text-forest-600 hover:bg-forest-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <HandCoins className="w-5 h-5" />
                Loans ({memberLoans.length})
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "transactions" ? (
              <DataTable
                columns={transactionColumns}
                data={
                  memberTransactions as unknown as Record<string, unknown>[]
                }
                keyExtractor={(item) => (item as unknown as Transaction).id}
                searchable
                searchPlaceholder="Search transactions..."
                searchKeys={["description", "type"]}
                emptyMessage="No transactions found for this member."
                pageSize={10}
              />
            ) : (
              <DataTable
                columns={loanColumns}
                data={memberLoans as unknown as Record<string, unknown>[]}
                keyExtractor={(item) => (item as unknown as Loan).id}
                searchable
                searchPlaceholder="Search loans..."
                searchKeys={["status"]}
                emptyMessage="No loans found for this member."
                pageSize={10}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
