"use client";
import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import {
  useCycles,
  useMembers,
  useSettings,
  useDashboard,
  useLoans,
} from "@/hooks/useDatabase";
import { formatCurrency, formatDate, getStatusColor } from "@/utils/helpers";
import {
  Plus,
  CalendarDays,
  TrendingUp,
  Users,
  Lock,
  Unlock,
  Award,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function CyclesPage() {
  const { cycles, activeCycle, createCycle, closeCycle } = useCycles();
  const { members } = useMembers();
  const { settings } = useSettings();
  const { stats, potSummary } = useDashboard();
  const { loans } = useLoans();
  const [showModal, setShowModal] = useState(false);
  const [showShareoutModal, setShowShareoutModal] = useState(false);
  const [distributionMethod, setDistributionMethod] = useState<"safe" | "full">(
    "safe",
  );

  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 10 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const activeMembers = members.filter((m) => m.status === "active");
  const totalShares = members.reduce((sum, m) => sum + m.totalShares, 0);

  // Calculate outstanding loans using the working formula
  const activeLoans = loans.filter((l) => l.status === "active");
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + (l.totalRepayment - l.amountPaid),
    0,
  );

  // Calculate available to loan using the working formula
  const totalActiveMemberSavings = activeMembers.reduce(
    (sum, m) => sum + m.totalSavings,
    0,
  );

  const totalLoanRepayments = loans.reduce((sum, l) => sum + l.amountPaid, 0);

  const totalLoanDisbursements = loans
    .filter(
      (l) =>
        (l.status === "active" || l.status === "paid") && l.rolloverCount === 0,
    )
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const availableCash = Math.max(
    0,
    totalActiveMemberSavings + totalLoanRepayments - totalLoanDisbursements,
  );

  const projectedTotalSavings = availableCash + totalOutstanding;

  const totalProfit = projectedTotalSavings - potSummary.savingsPot;
  // SAFE CALCULATION (RECOMMENDED)
  const safeProfit = Math.min(totalProfit, availableCash * 0.9); // Keep 10% buffer
  const safeDividendPerShare = totalShares > 0 ? safeProfit / totalShares : 0;

  // OPTIMISTIC CALCULATION (RISKY)
  const fullDividendPerShare = totalShares > 0 ? totalProfit / totalShares : 0;

  // Reserved profit (if using safe method)
  const reservedProfit = totalProfit - safeProfit;

  // Check if it's safe to close cycle
  const canSafelyClose = activeLoans.length === 0;
  const hasOutstandingLoans = activeLoans.length > 0;

  // Choose which dividend to use based on distribution method
  const dividendPerShare =
    distributionMethod === "safe" ? safeDividendPerShare : fullDividendPerShare;
  const distributingProfit =
    distributionMethod === "safe" ? safeProfit : totalProfit;

  // Calculate profit percentage
  const profitPercentage =
    potSummary.savingsPot > 0
      ? ((totalProfit / potSummary.savingsPot) * 100).toFixed(2)
      : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCycle(formData.name, formData.startDate, formData.endDate);
    setShowModal(false);
    setFormData({
      name: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 10 * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  };

  const handleCloseCycle = () => {
    if (!activeCycle) return;

    const confirmMessage =
      distributionMethod === "safe"
        ? `Close cycle with SAFE distribution?\n\nDistributing Now: ${formatCurrency(safeProfit)}\nReserved for Later: ${formatCurrency(reservedProfit)}\n\nThe reserved amount will be distributed when all loans are repaid.`
        : `Close cycle with FULL distribution?\n\n⚠️ WARNING: This assumes all ${activeLoans.length} loans will be repaid!\nDistributing: ${formatCurrency(totalProfit)}\n\nThis is RISKY if loans default!`;

    if (window.confirm(confirmMessage)) {
      closeCycle(activeCycle.id);
      setShowShareoutModal(false);
    }
  };

  return (
    <>
      <Layout title="Cycles">
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
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
                      Cycle Management System
                    </p>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    Financial Cycles
                  </h1>
                  <p className="text-purple-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                    Manage your village banking cycles, track progress, and
                    calculate member share-outs at cycle end.
                  </p>
                </div>
                <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                  <CalendarDays className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {activeCycle && (
                  <button
                    onClick={() => setShowShareoutModal(true)}
                    className="group relative inline-flex items-center gap-2.5 px-7 py-4 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
                  >
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <span>Calculate Share-out</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setShowModal(true)}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white/95 backdrop-blur-md text-purple-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!!activeCycle}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span>New Cycle</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Cycle or Empty State */}
          {activeCycle ? (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 p-8 shadow-2xl shadow-bank-500/20">
              <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
                <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Active Cycle
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl font-display font-bold text-white mb-6">
                  {activeCycle.name}
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-bank-100 text-xs font-semibold uppercase tracking-wider mb-2">
                      Start Date
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatDate(activeCycle.startDate)}
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-bank-100 text-xs font-semibold uppercase tracking-wider mb-2">
                      End Date
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatDate(activeCycle.endDate)}
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-bank-100 text-xs font-semibold uppercase tracking-wider mb-2">
                      Total Savings
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(potSummary.savingsPot)}
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-bank-100 text-xs font-semibold uppercase tracking-wider mb-2">
                      Total Shares
                    </p>
                    <p className="text-xl font-bold text-white">
                      {totalShares}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border-2 border-dashed border-forest-200 p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-forest-100 to-forest-50 flex items-center justify-center mb-4">
                <CalendarDays className="w-10 h-10 text-forest-400" />
              </div>
              <h3 className="text-xl font-bold text-forest-900 mb-2">
                No Active Cycle
              </h3>
              <p className="text-forest-600 mb-6 max-w-md mx-auto">
                Create a new cycle to start tracking your village banking period
                and member contributions.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-bank-600 to-bank-500 text-white font-bold rounded-xl hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create New Cycle
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Profit */}
            {/* <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-bank-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Total Profit
                  </p>
                  <p className="text-3xl font-bold text-bank-600 mt-2">
                    {formatCurrency(totalProfit)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bank-100 to-bank-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-bank-600" />
                </div>
              </div>
            </div>

     
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Dividend/Share
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {formatCurrency(safeDividendPerShare)}
                  </p>
                  <p className="text-xs text-forest-500 mt-1">Safe method</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div> */}

            {/* Active Members */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Active Members
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {activeMembers.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Cycles */}
            <div className="group relative rounded-2xl bg-white p-6 border border-forest-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
                    Total Cycles
                  </p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {cycles.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Cycle History Table */}
          <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
            <div className="p-6 bg-gradient-to-r from-forest-50 to-white border-b border-forest-100">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-forest-900">
                  Cycle History
                </h3>
              </div>
              <p className="text-sm text-forest-600 mt-1">
                View all past and current cycles with their financial summaries
              </p>
            </div>

            {cycles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-forest-50 flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-forest-300" />
                </div>
                <p className="text-forest-500 font-medium">No cycles found</p>
                <p className="text-sm text-forest-400 mt-1">
                  Create your first cycle to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-forest-50 border-b border-forest-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Cycle Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Total Savings
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Total Shares
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Dividend/Share
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-forest-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-50">
                    {cycles.map((cycle) => (
                      <tr
                        key={cycle.id}
                        className="hover:bg-forest-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-forest-900">
                            {cycle.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-forest-700 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{formatDate(cycle.startDate)}</span>
                            <span className="text-forest-400">→</span>
                            <span>{formatDate(cycle.endDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-bank-600 text-lg">
                          {formatCurrency(cycle.totalSavings)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-purple-600 text-lg">
                          {cycle.totalShares}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-bank-600 text-lg">
                          {cycle.dividendPerShare
                            ? formatCurrency(cycle.dividendPerShare)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {cycle.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bank-100 text-bank-700 font-bold text-sm rounded-lg">
                              <Unlock className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-100 text-forest-700 font-bold text-sm rounded-lg">
                              <Lock className="w-4 h-4" />
                              Closed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* New Cycle Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Cycle"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Cycle Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                placeholder="e.g., Cycle 2024 or January - December"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 leading-relaxed">
                  <span className="font-bold">Tip:</span> A typical village
                  banking cycle runs for 10-12 months. Members will contribute
                  regularly during this period.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-700 hover:to-purple-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Cycle
              </button>
            </div>
          </form>
        </Modal>

        {/* Share-out Calculator Modal */}
        <Modal
          isOpen={showShareoutModal}
          onClose={() => setShowShareoutModal(false)}
          title="Cycle Share-out Calculator"
          size="xl"
        >
          <div className="space-y-6">
            {/* Outstanding Loans Warning */}
            {hasOutstandingLoans && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border-l-4 border-red-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      ⚠️ Outstanding Loans Warning
                    </h3>
                    <p className="text-red-700 mb-2">
                      There are{" "}
                      <strong>{activeLoans.length} active loans</strong> with{" "}
                      <strong>{formatCurrency(totalOutstanding)}</strong> still
                      outstanding.
                    </p>
                    <p className="text-red-600 text-sm">
                      <strong>Recommendation:</strong> Traditional village
                      banking groups ONLY close cycles when all money is back in
                      the pot. Consider using the Safe Distribution method.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Method Selection */}
            {/* <div className="rounded-2xl bg-white p-6 border-2 border-forest-200">
              <h3 className="text-lg font-bold text-forest-900 mb-4">
                Select Distribution Method
              </h3>

              <div className="space-y-4">
                <div
                  onClick={() => setDistributionMethod("safe")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    distributionMethod === "safe"
                      ? "border-green-500 bg-green-50"
                      : "border-forest-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={distributionMethod === "safe"}
                      onChange={() => setDistributionMethod("safe")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-green-900">
                          Safe Distribution (Recommended)
                        </h4>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded font-bold">
                          SAFE
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Only distribute cash that's actually available. Protects
                        the group from loan defaults.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-white rounded border border-green-200">
                          <p className="text-xs text-green-600 font-medium">
                            Distribute Now
                          </p>
                          <p className="font-bold text-green-900 text-lg">
                            {formatCurrency(safeProfit)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {formatCurrency(safeDividendPerShare)} per share
                          </p>
                        </div>
                        {reservedProfit > 0 && (
                          <div className="p-3 bg-white rounded border border-amber-200">
                            <p className="text-xs text-amber-600 font-medium">
                              Reserved
                            </p>
                            <p className="font-bold text-amber-900 text-lg">
                              {formatCurrency(reservedProfit)}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Pay when loans return
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDistributionMethod("full")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    distributionMethod === "full"
                      ? "border-red-500 bg-red-50"
                      : "border-forest-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={distributionMethod === "full"}
                      onChange={() => setDistributionMethod("full")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-red-900">
                          Full Distribution (Risky)
                        </h4>
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-bold">
                          RISKY
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Distribute all profit assuming all loans will be paid
                        back.
                        <strong> Dangerous if loans default!</strong>
                      </p>
                      <div className="p-3 bg-white rounded border border-red-200">
                        <p className="text-xs text-red-600 font-medium">
                          Full Distribution
                        </p>
                        <p className="font-bold text-red-900 text-lg">
                          {formatCurrency(totalProfit)}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {formatCurrency(fullDividendPerShare)} per share
                        </p>
                      </div>
                      {hasOutstandingLoans && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          ⚠️ Warning: You only have{" "}
                          {formatCurrency(availableCash)} available, but trying
                          to distribute {formatCurrency(totalProfit)}!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Summary Card */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bank-50 to-bank-100/50 p-6 border-2 border-bank-200">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-bank-500 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h4 className="text-lg font-bold text-bank-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Share-out Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl border border-bank-200">
                    <p className="text-xs font-semibold text-bank-600 uppercase">
                      Projected Total Profit
                    </p>
                    <p className="text-xl font-bold text-bank-700">
                      {formatCurrency(totalProfit)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-forest-200">
                    <p className="text-xs font-semibold text-forest-600 uppercase">
                      Total Shares
                    </p>
                    <p className="text-xl font-bold text-forest-700">
                      {totalShares}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600 uppercase">
                      Outstanding
                    </p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatCurrency(totalOutstanding)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase">
                      Projected Profit Percentage
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {profitPercentage}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-xl border-2 border-bank-300">
                    <p className="text-sm font-semibold text-forest-600 mb-2">
                      Projected Total Savings
                    </p>
                    <p className="text-4xl font-bold text-bank-700">
                      {formatCurrency(projectedTotalSavings)}
                    </p>
                    {/* <p className="text-xs text-forest-500 mt-2 font-medium">
                      Distributing: {formatCurrency(distributingProfit)} of{" "}
                      {formatCurrency(totalProfit)} total profit
                    </p> */}
                  </div>

                  <div className="p-5 bg-white rounded-xl border-2 border-bank-300">
                    <p className="text-sm font-semibold text-forest-600 mb-2">
                      Available Cash
                    </p>
                    <p className="text-4xl font-bold text-green-700">
                      {formatCurrency(availableCash)}
                    </p>
                    {/* <p className="text-xs text-forest-500 mt-2 font-medium">
                      Formula: ({formatCurrency(totalProfit)} ÷{" "}
                      {formatCurrency(potSummary.savingsPot)}) × 100
                    </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Member Payouts Table */}
            <div className="rounded-xl bg-white border border-forest-200 overflow-hidden">
              <div className="p-4 bg-forest-50 border-b border-forest-200">
                <h4 className="font-bold text-forest-900">
                  Projected Member Payouts
                </h4>
                <p className="text-sm text-forest-600 mt-0.5">
                  Individual share-out calculation (Formula: Projected Total
                  Savings / Member Share)
                </p>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-forest-100 border-b border-forest-200">
                      <th className="px-4 py-3 text-left font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Shares
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Savings
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Dividend
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Total Payout
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {activeMembers.map((member) => {
                      const dividend = member.totalShares * dividendPerShare;
                      const totalPayout = member.totalSavings + dividend;
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
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 font-bold rounded">
                              {member.totalShares}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-bank-600">
                            {formatCurrency(member.totalSavings)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-purple-600">
                            {formatCurrency(dividend)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-forest-900 text-base">
                            {formatCurrency(totalPayout)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-forest-50 font-bold border-t-2 border-forest-200">
                      <td className="px-4 py-3 text-forest-900">Totals</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 font-bold rounded">
                          {totalShares}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-bank-600">
                        {formatCurrency(potSummary.savingsPot)}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600">
                        {formatCurrency(distributingProfit)}
                      </td>
                      <td className="px-4 py-3 text-right text-forest-900 text-lg">
                        {formatCurrency(
                          potSummary.savingsPot + distributingProfit,
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* //memebr cash avaliable payout */}
            {/* <div className="rounded-xl bg-white border border-forest-200 overflow-hidden">
              <div className="p-4 bg-forest-50 border-b border-forest-200">
                <h4 className="font-bold text-forest-900">
                  Member Payouts From Available Cash
                </h4>
                <p className="text-sm text-forest-600 mt-0.5">
                  Individual share-out calculation (Formula: Available Cash /
                  Member Share)
                </p>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-forest-100 border-b border-forest-200">
                      <th className="px-4 py-3 text-left font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Shares
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Savings
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Dividend
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-forest-700 uppercase text-xs tracking-wider">
                        Total Payout
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {activeMembers.map((member) => {
                      const payout =
                        (member.totalShares / totalShares) * availableCash;
                      const dividend = payout - member.totalSavings;

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
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 font-bold rounded">
                              {member.totalShares}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-bank-600">
                            {formatCurrency(member.totalSavings)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-purple-600">
                            {formatCurrency(dividend)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-forest-900 text-base">
                            {formatCurrency(payout)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-forest-50 font-bold border-t-2 border-forest-200">
                      <td className="px-4 py-3 text-forest-900">Totals</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 font-bold rounded">
                          {totalShares}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-bank-600">
                        {formatCurrency(potSummary.savingsPot)}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600">
                        {formatCurrency(availableCash - potSummary.savingsPot)}
                      </td>
                      <td className="px-4 py-3 text-right text-forest-900 text-lg">
                        {formatCurrency(availableCash)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div> */}

            {/* Educational Note */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Best Practice:</strong> ONLY close cycles when all
                loans are fully repaid.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowShareoutModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCycle}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
                `}
              >
                Share-out (locks Cycle) <Lock className="w-5 h-5 inline mr-2" />
              </button>
            </div>
          </div>
        </Modal>
      </Layout>
    </>
  );
}
