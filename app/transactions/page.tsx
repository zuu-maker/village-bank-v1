"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import DataTable, { Column } from "@/components/DataTable";
import Alert from "@/components/Alert";
import { useTransactions, useMembers, useSettings } from "@/hooks/useDatabase";
import { Transaction, Member } from "@/utils/types";
import {
  formatCurrency,
  formatDateTime,
  getTransactionLabel,
  getTransactionColor,
  isIncomeTransaction,
} from "@/utils/helpers";

export default function TransactionsPage() {
  const { transactions, loading, addTransaction, refresh } = useTransactions();
  const { members } = useMembers();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTimeframe, setFilterTimeframe] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    memberId: "",
    type: "share_purchase" as Transaction["type"],
    amount: "",
    description: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeMembers = members.filter((m) => m.status === "active");

  const resetForm = () => {
    setFormData({
      memberId: "",
      type: "share_purchase",
      amount: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId || !formData.amount) {
      setAlert({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    const member = members.find((m) => m.id === formData.memberId);
    if (!member) {
      setAlert({ type: "error", message: "Selected member not found." });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setAlert({ type: "error", message: "Please enter a valid amount." });
      return;
    }

    // Validate share purchase amount
    if (
      formData.type === "share_purchase" &&
      amount % settings.sharePrice !== 0
    ) {
      setAlert({
        type: "error",
        message: `Share purchases must be multiples of ${settings.currency}${settings.sharePrice}`,
      });
      return;
    }

    try {
      addTransaction({
        memberId: formData.memberId,
        memberName: member.name,
        type: formData.type,
        amount,
        date: new Date().toISOString(),
        description:
          formData.description ||
          `${getTransactionLabel(formData.type)} by ${member.name}`,
      });

      setAlert({
        type: "success",
        message: "Transaction recorded successfully!",
      });
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

  // Filter by time frame
  const getTimeFrameFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterTimeframe) {
      case "today":
        return (t: Transaction) => new Date(t.date) >= today;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return (t: Transaction) => new Date(t.date) >= weekAgo;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return (t: Transaction) => new Date(t.date) >= monthAgo;
      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          return (t: Transaction) => {
            const date = new Date(t.date);
            return date >= start && date <= end;
          };
        }
        return () => true;
      default:
        return () => true;
    }
  };

  // Apply compound filters (type + timeframe)
  const filteredTransactions = transactions
    .filter((t) => filterType === "all" || t.type === filterType)
    .filter(getTimeFrameFilter());

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const columns: Column<Transaction>[] = [
    {
      key: "date",
      header: "Date & Time",
      sortable: true,
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-forest-500" />
          </div>
          <span className="text-forest-700 font-medium text-sm">
            {formatDateTime(transaction.date)}
          </span>
        </div>
      ),
    },
    {
      key: "memberName",
      header: "Member",
      sortable: true,
      render: (transaction) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bank-500 to-bank-600 flex items-center justify-center text-white font-bold shadow-lg shadow-bank-500/25">
            {transaction.memberName.charAt(0)}
          </div>
          <span className="font-semibold text-forest-900">
            {transaction.memberName}
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
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
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
          <span
            className={`font-semibold ${getTransactionColor(transaction.type)}`}
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
          className={`text-lg font-bold ${
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
        <span className="text-forest-600 text-sm">
          {transaction.description}
        </span>
      ),
    },
  ];

  // Calculate totals for filtered transactions
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (isIncomeTransaction(t.type)) {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

  if (!mounted) {
    return (
      <Layout title="Transactions">
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

  return (
    <Layout title="Transactions">
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600 p-8 lg:p-10 shadow-2xl shadow-purple-500/20">
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
                  <Sparkles className="w-5 h-5 text-purple-100" />
                  <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">
                    Financial Activities
                  </p>
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                  Transactions
                </h1>
                <p className="text-purple-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                  Record and track all financial activities including share
                  purchases, contributions, and loan repayments.
                </p>
              </div>
              <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* New Transaction Button */}
            <div className="mt-8">
              <button
                onClick={() => setShowModal(true)}
                className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-purple-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span>Record Transaction</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Total Income */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Total Income
                </p>
                <p className="text-3xl font-bold text-bank-600 mt-2">
                  {formatCurrency(totals.income)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-7 h-7 text-bank-600" />
              </div>
            </div>
          </div>

          {/* Total Outflow */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  Total Outflow
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(totals.expense)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownRight className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Net Balance
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {formatCurrency(totals.income - totals.expense)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-2xl bg-white p-6 border border-forest-100 space-y-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-forest-600" />
            <h3 className="text-lg font-bold text-forest-900">Filters</h3>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-3">
              Transaction Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "all"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterType("share_purchase")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "share_purchase"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Shares
              </button>
              <button
                onClick={() => setFilterType("social_contribution")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "social_contribution"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Social
              </button>
              <button
                onClick={() => setFilterType("birthday_contribution")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "birthday_contribution"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Birthday
              </button>
              <button
                onClick={() => setFilterType("loan_repayment")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "loan_repayment"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Loan Repayments
              </button>
              <button
                onClick={() => setFilterType("loan_disbursement")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterType === "loan_disbursement"
                    ? "bg-gradient-to-r from-bank-600 to-bank-500 text-white shadow-lg shadow-bank-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Disbursements
              </button>
            </div>
          </div>

          {/* Time Frame Filter */}
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Time Frame
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              <button
                onClick={() => {
                  setFilterTimeframe("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterTimeframe === "all"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => {
                  setFilterTimeframe("today");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterTimeframe === "today"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setFilterTimeframe("week");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterTimeframe === "week"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  setFilterTimeframe("month");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterTimeframe === "month"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setFilterTimeframe("custom")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filterTimeframe === "custom"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                Custom Range
              </button>
            </div>

            {/* Custom Date Range */}
            {filterTimeframe === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50 border border-purple-200">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {(filterType !== "all" || filterTimeframe !== "all") && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-forest-100">
              <span className="text-sm font-medium text-forest-600">
                Active filters:
              </span>
              {filterType !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-bank-100 text-bank-700 text-sm font-semibold rounded-lg">
                  {getTransactionLabel(filterType as Transaction["type"])}
                </span>
              )}
              {filterTimeframe !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  {filterTimeframe === "today" && "Today"}
                  {filterTimeframe === "week" && "Last 7 Days"}
                  {filterTimeframe === "month" && "Last 30 Days"}
                  {filterTimeframe === "custom" &&
                    customStartDate &&
                    customEndDate &&
                    `${customStartDate} to ${customEndDate}`}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterTimeframe("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between px-6 py-4 rounded-xl bg-forest-50 border border-forest-100">
          <p className="text-sm font-medium text-forest-700">
            Showing{" "}
            <span className="font-bold text-forest-900">
              {sortedTransactions.length}
            </span>{" "}
            transaction{sortedTransactions.length !== 1 ? "s" : ""}
            {filterType !== "all" &&
              ` of type "${getTransactionLabel(filterType as Transaction["type"])}"`}
            {filterTimeframe !== "all" && ` from selected time period`}
          </p>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-forest-100 bg-gradient-to-r from-forest-50 to-white">
            <h2 className="text-xl font-bold text-forest-900">
              Transaction History
            </h2>
            <p className="text-sm text-forest-500 mt-1">
              View and track all financial activities
            </p>
          </div>

          <DataTable
            columns={columns}
            data={sortedTransactions as unknown as Record<string, unknown>[]}
            keyExtractor={(item) => (item as unknown as Transaction).id}
            searchable
            searchPlaceholder="Search by member or description..."
            searchKeys={["memberName", "description"]}
            emptyMessage="No transactions found. Try adjusting your filters or record a new transaction."
            pageSize={15}
          />
        </div>
      </div>

      {/* New Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Record New Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Select Member *
            </label>
            <select
              value={formData.memberId}
              onChange={(e) =>
                setFormData({ ...formData, memberId: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
              required
            >
              <option value="">-- Select a member --</option>
              {activeMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Transaction Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as Transaction["type"],
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
            >
              <option value="share_purchase">Share Purchase</option>
              <option value="social_contribution">Social Contribution</option>
              <option value="birthday_contribution">
                Birthday Contribution
              </option>
              <option value="loan_repayment">Loan Repayment</option>
              <option value="fine">Fine</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Amount ({settings.currency}) *
              {formData.type === "share_purchase" && (
                <span className="font-normal text-forest-500 ml-2">
                  (1 share = {settings.currency}
                  {settings.sharePrice})
                </span>
              )}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
              placeholder={
                formData.type === "share_purchase"
                  ? `e.g., ${settings.sharePrice * 2} for 2 shares`
                  : "Enter amount"
              }
              min="0"
              step="0.01"
              required
            />
            {formData.type === "share_purchase" && formData.amount && (
              <p className="text-sm text-bank-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-bank-600" />
                Equals{" "}
                {Math.floor(
                  parseFloat(formData.amount) / settings.sharePrice,
                )}{" "}
                shares
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 resize-none"
              rows={3}
              placeholder="Add any notes about this transaction..."
            />
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
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-700 hover:to-purple-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Record Transaction
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
