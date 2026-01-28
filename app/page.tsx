"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import {
  useDashboard,
  useLoans,
  useTransactions,
  useSettings,
} from "../hooks/useDatabase";
import {
  formatCurrency,
  formatDate,
  getTransactionLabel,
  isIncomeTransaction,
} from "../utils/helpers";
import { Transaction, Loan } from "@/utils/types";

export default function Dashboard() {
  const { stats, potSummary, loading, refresh } = useDashboard();
  const { loans } = useLoans();
  const { transactions } = useTransactions();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Dashboard">
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

  const overdueLoans = loans.filter(
    (l) => l.status === "active" && new Date(l.dueDate) < new Date(),
  );

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingDueLoans = loans
    .filter((l) => l.status === "active")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 3);

  return (
    <Layout title="Dashboard">
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-bank-700 via-bank-600 to-bank-500 p-8 lg:p-10 shadow-2xl shadow-bank-500/20">
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
                <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider mb-2">
                  Welcome back to
                </p>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                  {settings.bankName}
                </h1>
                <p className="text-bank-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                  Manage your village savings group with ease. Track
                  contributions, loans, and share dividends all in one place.
                </p>
              </div>
              <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Improved Button Group */}
            <div className="flex flex-wrap gap-4 mt-8">
              {/* Primary Button - View Members */}
              <Link
                href="/members"
                className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-bank-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bank-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bank-600 to-bank-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span>View Members</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </div>
              </Link>

              {/* Secondary Button - New Transaction */}
              <Link
                href="/transactions"
                className="group relative inline-flex items-center gap-2.5 px-7 py-4 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span>New Transaction</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            subtitle={`${stats.activeMembers} active members`}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Total Savings"
            value={formatCurrency(stats.totalSavings)}
            subtitle="All members combined"
            icon={Wallet}
            trend={{ value: 12.5, isPositive: true }}
            color="blue"
          />
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            subtitle={`${formatCurrency(loans.filter((l) => l.status === "active").reduce((sum, l) => sum + (l.totalRepayment - l.amountPaid), 0))} outstanding`}
            icon={HandCoins}
            color="amber"
          />
          <StatCard
            title="Interest Earned"
            value={formatCurrency(stats.totalInterestEarned)}
            subtitle="This cycle"
            icon={TrendingUp}
            trend={{ value: 8.3, isPositive: true }}
            color="purple"
          />
        </div>

        {/* Three Pots Summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl lg:text-2xl font-display font-bold text-forest-900">
              The Three Pots
            </h2>
            <Link
              href="/pots"
              className="text-sm font-semibold text-bank-600 hover:text-bank-700 flex items-center gap-1 group"
            >
              View details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Savings Pot */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl" />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PiggyBank className="w-6 h-6 text-bank-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                      Savings Pot
                    </p>
                    <p className="text-2xl font-bold text-forest-900 mt-1">
                      {formatCurrency(potSummary.savingsPot)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-forest-500 font-medium">Progress</span>
                  <span className="text-forest-700 font-semibold">
                    {Math.round(
                      (potSummary.savingsPot / (potSummary.totalFunds || 1)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bank-500 to-bank-400 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min((potSummary.savingsPot / (potSummary.totalFunds || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-forest-500 mt-4 font-medium">
                Member share contributions
              </p>
            </div>

            {/* Social Pot */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl" />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                      Social Pot
                    </p>
                    <p className="text-2xl font-bold text-forest-900 mt-1">
                      {formatCurrency(potSummary.socialPot)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-forest-500 font-medium">Progress</span>
                  <span className="text-forest-700 font-semibold">
                    {Math.round(
                      (potSummary.socialPot / (potSummary.totalFunds || 1)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min((potSummary.socialPot / (potSummary.totalFunds || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-forest-500 mt-4 font-medium">
                Emergency & social fund
              </p>
            </div>

            {/* Birthday Pot */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl" />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                      Birthday Pot
                    </p>
                    <p className="text-2xl font-bold text-forest-900 mt-1">
                      {formatCurrency(potSummary.birthdayPot)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-forest-500 font-medium">Progress</span>
                  <span className="text-forest-700 font-semibold">
                    {Math.round(
                      (potSummary.birthdayPot / (potSummary.totalFunds || 1)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min((potSummary.birthdayPot / (potSummary.totalFunds || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-forest-500 mt-4 font-medium">
                Rotating birthday contributions
              </p>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {overdueLoans.length > 0 && (
          <div className="relative rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border-l-4 border-red-500 shadow-lg animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-red-900">
                      Overdue Loans Alert
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {overdueLoans.length} loan
                      {overdueLoans.length > 1 ? "s are" : " is"} past due date.
                      Please review and take action immediately.
                    </p>
                  </div>
                  <Link
                    href="/loans"
                    className="text-sm font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 whitespace-nowrap"
                  >
                    Review loans
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {overdueLoans.slice(0, 3).map((loan) => (
                    <span
                      key={loan.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {loan.memberName}
                    </span>
                  ))}
                  {overdueLoans.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                      +{overdueLoans.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-forest-900">
                  Recent Transactions
                </h3>
                <Link
                  href="/transactions"
                  className="text-sm font-semibold text-bank-600 hover:text-bank-700 flex items-center gap-1 group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-forest-50">
              {recentTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-forest-50 flex items-center justify-center mb-4">
                    <Wallet className="w-8 h-8 text-forest-300" />
                  </div>
                  <p className="text-forest-500 font-medium">
                    No transactions yet
                  </p>
                  <p className="text-sm text-forest-400 mt-1">
                    Start by adding your first transaction
                  </p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-forest-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isIncomeTransaction(transaction.type)
                              ? "bg-gradient-to-br from-bank-100 to-bank-50"
                              : "bg-gradient-to-br from-red-100 to-red-50"
                          }`}
                        >
                          {isIncomeTransaction(transaction.type) ? (
                            <ArrowUpRight className="w-5 h-5 text-bank-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-forest-900 truncate">
                            {transaction.memberName}
                          </p>
                          <p className="text-sm text-forest-500">
                            {getTransactionLabel(transaction.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={`text-lg font-bold ${
                            isIncomeTransaction(transaction.type)
                              ? "text-bank-600"
                              : "text-red-600"
                          }`}
                        >
                          {isIncomeTransaction(transaction.type) ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-forest-400 font-medium">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Loan Due Dates */}
          <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-forest-900">
                  Upcoming Loan Due Dates
                </h3>
                <Link
                  href="/loans"
                  className="text-sm font-semibold text-bank-600 hover:text-bank-700 flex items-center gap-1 group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-forest-50">
              {upcomingDueLoans.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-forest-50 flex items-center justify-center mb-4">
                    <HandCoins className="w-8 h-8 text-forest-300" />
                  </div>
                  <p className="text-forest-500 font-medium">No active loans</p>
                  <p className="text-sm text-forest-400 mt-1">
                    All loans have been repaid
                  </p>
                </div>
              ) : (
                upcomingDueLoans.map((loan: Loan) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(loan.dueDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isOverdue = daysUntilDue < 0;

                  return (
                    <div
                      key={loan.id}
                      className="p-4 hover:bg-forest-50/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-forest-900">
                            {loan.memberName}
                          </p>
                          <p className="text-sm text-forest-500 mt-0.5">
                            Outstanding:{" "}
                            <span className="font-semibold text-forest-700">
                              {formatCurrency(
                                loan.totalRepayment - loan.amountPaid,
                              )}
                            </span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                              isOverdue
                                ? "bg-red-100 text-red-700"
                                : daysUntilDue <= 7
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {isOverdue
                              ? `${Math.abs(daysUntilDue)}d overdue`
                              : daysUntilDue === 0
                                ? "Due today"
                                : `${daysUntilDue}d left`}
                          </span>
                          <p className="text-xs text-forest-400 mt-1.5 font-medium">
                            {formatDate(loan.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
