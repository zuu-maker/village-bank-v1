"use client";
import React from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useDashboard, useMembers, useSettings } from "@/hooks/useDatabase";
import { formatCurrency } from "@/utils/helpers";
import {
  PiggyBank,
  Users,
  Gift,
  TrendingUp,
  ArrowRight,
  Info,
  Sparkles,
  Wallet,
  Award,
  CircleDollarSign,
} from "lucide-react";

export default function PotsPage() {
  const { potSummary, stats } = useDashboard();
  const { members } = useMembers();
  const { settings } = useSettings();

  const activeMembers = members.filter((m) => m.status === "active");
  const totalShares = members.reduce((sum, m) => sum + m.totalShares, 0);

  return (
    <Layout title="The Three Pots">
      <Head>
        <title>The Three Pots | Village Banking System</title>
      </Head>

      <div className="space-y-6 lg:space-y-8 animate-fade-in">
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
                    Fund Management System
                  </p>
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                  The Three Pots
                </h1>
                <p className="text-bank-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                  Track your village banking group's three core funds: Savings,
                  Social Welfare, and Birthday Celebrations.
                </p>
              </div>
              <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                <PiggyBank className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Total Overview in Header */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider mb-2">
                  Total Funds
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(potSummary.totalFunds)}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider mb-2">
                  Active Members
                </p>
                <p className="text-3xl font-bold text-white">
                  {activeMembers.length}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <p className="text-bank-100 text-sm font-semibold uppercase tracking-wider mb-2">
                  Total Shares
                </p>
                <p className="text-3xl font-bold text-white">{totalShares}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Three Pots Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Pot */}
          <div className="group rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="relative p-8 bg-gradient-to-br from-bank-500 to-bank-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <PiggyBank className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">
                      Savings Pot
                    </h2>
                    <p className="text-bank-100 text-sm font-medium">
                      Member Share Purchases
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-bank-100 text-sm mb-1 font-semibold uppercase tracking-wider">
                    Total Balance
                  </p>
                  <p className="text-4xl font-display font-bold">
                    {formatCurrency(potSummary.savingsPot)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Share Price
                </span>
                <span className="font-bold text-forest-900">
                  {formatCurrency(settings.sharePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Total Shares Issued
                </span>
                <span className="font-bold text-forest-900">{totalShares}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Average per Member
                </span>
                <span className="font-bold text-forest-900">
                  {activeMembers.length > 0
                    ? formatCurrency(
                        potSummary.savingsPot / activeMembers.length,
                      )
                    : formatCurrency(0)}
                </span>
              </div>

              <div className="pt-4 border-t border-forest-100">
                <div className="flex items-start gap-2 p-3 bg-bank-50 rounded-xl border border-bank-200">
                  <Info className="w-5 h-5 text-bank-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-bank-700 leading-relaxed">
                    <span className="font-bold">Refundable:</span> This pot is
                    distributed at cycle end based on shares owned by each
                    member.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Pot */}
          <div className="group rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="relative p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">
                      Social Pot
                    </h2>
                    <p className="text-blue-100 text-sm font-medium">
                      Welfare & Emergency Fund
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-blue-100 text-sm mb-1 font-semibold uppercase tracking-wider">
                    Total Balance
                  </p>
                  <p className="text-4xl font-display font-bold">
                    {formatCurrency(potSummary.socialPot)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Monthly Contribution
                </span>
                <span className="font-bold text-forest-900">
                  {formatCurrency(settings.socialContributionAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Total Contributors
                </span>
                <span className="font-bold text-forest-900">
                  {members.filter((m) => m.socialContributions > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Average per Member
                </span>
                <span className="font-bold text-forest-900">
                  {activeMembers.length > 0
                    ? formatCurrency(
                        potSummary.socialPot / activeMembers.length,
                      )
                    : formatCurrency(0)}
                </span>
              </div>

              <div className="pt-4 border-t border-forest-100">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 leading-relaxed">
                    <span className="font-bold">Non-refundable:</span> Used for
                    member emergencies, medical needs, and group welfare
                    activities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Birthday Pot */}
          <div className="group rounded-2xl bg-white border border-forest-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="relative p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">
                      Birthday Pot
                    </h2>
                    <p className="text-purple-100 text-sm font-medium">
                      Rotating Birthday Fund
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-purple-100 text-sm mb-1 font-semibold uppercase tracking-wider">
                    Total Balance
                  </p>
                  <p className="text-4xl font-display font-bold">
                    {formatCurrency(potSummary.birthdayPot)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Monthly Contribution
                </span>
                <span className="font-bold text-forest-900">
                  {formatCurrency(settings.birthdayContributionAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Total Contributors
                </span>
                <span className="font-bold text-forest-900">
                  {members.filter((m) => m.birthdayContributions > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest-50 rounded-xl">
                <span className="text-sm font-semibold text-forest-600">
                  Average Per Member
                </span>
                <span className="font-bold text-forest-900">
                  {formatCurrency(
                    settings.birthdayContributionAmount *
                      Math.max(0, activeMembers.length),
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-forest-100">
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-700 leading-relaxed">
                    <span className="font-bold">Rotating fund:</span> Each
                    member receives all contributions from others on their
                    birthday month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Breakdown Table */}
        <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
          <div className="p-6 bg-gradient-to-r from-forest-50 to-white border-b border-forest-100">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-bank-600" />
              <h3 className="text-xl font-bold text-forest-900">
                Member Contributions Breakdown
              </h3>
            </div>
            <p className="text-sm text-forest-600 mt-1">
              Detailed view of each member's contributions across all pots
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-forest-50 border-b border-forest-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Savings
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Social
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Birthday
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-50">
                {members
                  .filter((m) => m.status === "active")
                  .map((member, index) => (
                    <tr
                      key={member.id}
                      className="hover:bg-forest-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bank-500 to-bank-600 flex items-center justify-center text-white font-bold shadow-lg shadow-bank-500/25">
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
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 font-bold text-sm rounded-lg">
                          <Award className="w-3.5 h-3.5" />
                          {member.totalShares}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-bank-600 text-lg">
                        {formatCurrency(member.totalSavings)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                        {formatCurrency(member.socialContributions)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-purple-600 text-lg">
                        {formatCurrency(member.birthdayContributions)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-forest-900 text-lg">
                        {formatCurrency(
                          member.totalSavings +
                            member.socialContributions +
                            member.birthdayContributions,
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-forest-50 to-white border-t-2 border-forest-200">
                  <td className="px-6 py-4 font-bold text-forest-900 text-lg">
                    Totals
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-lg">
                      <Award className="w-4 h-4" />
                      {totalShares}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-bank-600 text-xl">
                    {formatCurrency(potSummary.savingsPot)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600 text-xl">
                    {formatCurrency(potSummary.socialPot)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-purple-600 text-xl">
                    {formatCurrency(potSummary.birthdayPot)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-forest-900 text-2xl">
                    {formatCurrency(potSummary.totalFunds)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
