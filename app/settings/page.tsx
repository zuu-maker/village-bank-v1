"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useSettings } from "@/hooks/useDatabase";
import { Settings } from "@/utils/types";
import { formatCurrency } from "@/utils/helpers";
import {
  Save,
  RotateCcw,
  DollarSign,
  Percent,
  Clock,
  AlertCircle,
  Check,
  Sparkles,
  Settings2,
  TrendingUp,
  Users,
  Gift,
  HandCoins,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to default values?")) {
      setFormData(settings);
    }
  };

  return (
    <>
      <Head>
        <title>Settings | Village Banking System</title>
      </Head>

      <Layout title="Settings">
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-forest-600 via-forest-500 to-forest-600 p-8 lg:p-10 shadow-2xl shadow-forest-500/20">
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
                    <Sparkles className="w-5 h-5 text-forest-100" />
                    <p className="text-forest-100 text-sm font-semibold uppercase tracking-wider">
                      Configuration Center
                    </p>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    System Settings
                  </h1>
                  <p className="text-forest-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                    Configure your village banking system parameters including
                    contributions, loans, interest rates, and penalties.
                  </p>
                </div>
                <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                  <Settings2 className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {saved && (
            <div className="relative rounded-2xl bg-gradient-to-r from-bank-50 to-green-50 p-5 border-2 border-bank-300 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bank-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-bank-900">Success!</p>
                  <p className="text-sm text-bank-700">
                    Your settings have been saved successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
                <div className="p-6 bg-gradient-to-r from-bank-50 to-white border-b border-bank-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bank-600 to-bank-500 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        General Settings
                      </h2>
                      <p className="text-sm text-forest-600">
                        Basic system configuration
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                        placeholder="Village Savings Bank"
                      />
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Display name for your banking group
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                        placeholder="K"
                        maxLength={3}
                      />
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Currency symbol (max 3 characters)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contribution Settings */}
              <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        Contribution Settings
                      </h2>
                      <p className="text-sm text-forest-600">
                        Member contribution amounts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-bank-600" />
                        Share Price ({formData.currency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                          {formData.currency}
                        </span>
                        <input
                          type="number"
                          value={formData.sharePrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sharePrice: Number(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                          min="1"
                        />
                      </div>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Price per share unit
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Social Fund ({formData.currency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                          {formData.currency}
                        </span>
                        <input
                          type="number"
                          value={formData.socialContributionAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialContributionAmount: Number(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Monthly welfare contribution
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        Birthday Fund ({formData.currency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                          {formData.currency}
                        </span>
                        <input
                          type="number"
                          value={formData.birthdayContributionAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              birthdayContributionAmount: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Monthly birthday contribution
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Settings */}
              <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
                <div className="p-6 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center shadow-lg">
                      <HandCoins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        Loan Settings
                      </h2>
                      <p className="text-sm text-forest-600">
                        Interest rates and loan parameters
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-amber-600" />
                        Default Interest Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.defaultInterestRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              defaultInterestRate: Number(e.target.value),
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
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Applied to new loans
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Default Interest Type
                      </label>
                      <select
                        value={formData.defaultInterestType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultInterestType: e.target.value as
                              | "custom_simple"
                              | "normal_simple"
                              | "compound",
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200 bg-white"
                      >
                        <option value="normal_simple">
                          Normal Simple Interest
                        </option>
                        <option value="custom_simple">
                          Custom Simple Interest
                        </option>
                        <option value="compound">Compound Interest</option>
                      </select>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Interest calculation method:{" "}
                        {formData.defaultInterestType === "compound"
                          ? ""
                          : formData.defaultInterestType === "normal_simple"
                            ? "Prinical * Rate * Time"
                            : "Prinicipal * Rate"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Max Loan Multiplier
                      </label>
                      <input
                        type="number"
                        value={formData.maxLoanMultiplier}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxLoanMultiplier: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                        min="1"
                        max="10"
                        step="0.5"
                      />
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Max loan = Savings × Multiplier
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Loan Term (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.loanTermDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loanTermDays: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                        min="7"
                        max="365"
                      />
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Default repayment period
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Penalty Settings */}
              <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
                <div className="p-6 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        Penalty Settings
                      </h2>
                      <p className="text-sm text-forest-600">
                        Fines and late payment charges
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Late Payment Penalty (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.latePenaltyRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              latePenaltyRate: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 pr-10 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                          min="0"
                          max="50"
                          step="0.5"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Added to overdue loan balance
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-forest-700 mb-2">
                        Absentee Fine (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.absenteeFinePecentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              absenteeFinePecentage: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 pr-10 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                          min="0"
                          max="50"
                          step="0.5"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-forest-500 mt-2 font-medium">
                        Percentage of share price
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest-50 to-bank-50 p-8 border-2 border-forest-200">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
                  <div className="w-full h-full bg-bank-500 rounded-full blur-3xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-900">
                      Quick Preview
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-forest-200">
                      <p className="text-sm font-semibold text-forest-600 mb-1">
                        Share Price
                      </p>
                      <p className="text-2xl font-bold text-bank-600">
                        {formData.currency}
                        {formData.sharePrice}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-forest-200">
                      <p className="text-sm font-semibold text-forest-600 mb-1">
                        Max Loan (1 share)
                      </p>
                      <p className="text-2xl font-bold text-amber-600">
                        {formData.currency}
                        {formData.sharePrice * formData.maxLoanMultiplier}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-forest-200">
                      <p className="text-sm font-semibold text-forest-600 mb-1">
                        Interest on {formData.currency}1000
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formData.currency}
                        {(1000 * (formData.defaultInterestRate / 100)).toFixed(
                          2,
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-forest-200">
                      <p className="text-sm font-semibold text-forest-600 mb-1">
                        Monthly Total
                      </p>
                      <p className="text-2xl font-bold text-bank-600">
                        {formData.currency}
                        {formData.sharePrice +
                          formData.socialContributionAmount +
                          formData.birthdayContributionAmount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-forest-200 text-forest-700 font-semibold hover:bg-forest-50 hover:border-forest-300 transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset to Default
                </button>

                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-bold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
