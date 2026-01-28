import React, { useState, useMemo } from "react";
import {
  Calculator,
  Info,
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { calculateInterest } from "../utils/database";
import { formatCurrency, generateLoanSchedule } from "../utils/helpers";
import { useSettings } from "../hooks/useDatabase";

interface InterestCalculatorProps {
  onCalculate?: (result: ReturnType<typeof calculateInterest>) => void;
  initialPrincipal?: number;
  showSchedule?: boolean;
}

const InterestCalculator: React.FC<InterestCalculatorProps> = ({
  onCalculate,
  initialPrincipal = 1000,
  showSchedule = true,
}) => {
  const { settings } = useSettings();
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [rate, setRate] = useState(settings.defaultInterestRate);
  const [interestType, setInterestType] = useState<"simple" | "compound">(
    settings.defaultInterestType,
  );
  const [periods, setPeriods] = useState(1);

  const result = useMemo(() => {
    return calculateInterest(principal, rate, interestType, periods);
  }, [principal, rate, interestType, periods]);

  const schedule = useMemo(() => {
    if (!showSchedule || periods <= 1) return null;
    return generateLoanSchedule(principal, rate, interestType, periods);
  }, [principal, rate, interestType, periods, showSchedule]);

  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate(result);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Section */}
      <div className="rounded-2xl bg-white p-6 border border-forest-100 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-bank-600" />
          <h3 className="text-lg font-bold text-forest-900">Loan Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Principal Amount ({settings.currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                {settings.currency}
              </span>
              <input
                type="number"
                value={principal}
                onChange={(e) =>
                  setPrincipal(Math.max(0, Number(e.target.value)))
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                min="0"
                step="100"
                placeholder="Enter principal amount"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) =>
                  setRate(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                className="w-full px-4 pr-12 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
                min="0"
                max="100"
                step="0.5"
                placeholder="Enter interest rate"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-500 font-semibold">
                %
              </span>
            </div>
          </div>

          {/* Interest Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-forest-700 mb-3">
              Interest Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInterestType("simple")}
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                  interestType === "simple"
                    ? "border-bank-500 bg-gradient-to-br from-bank-50 to-white shadow-lg shadow-bank-500/10"
                    : "border-forest-200 bg-white hover:border-forest-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      interestType === "simple"
                        ? "bg-bank-600 text-white"
                        : "bg-forest-100 text-forest-600 group-hover:bg-forest-200"
                    }`}
                  >
                    <Calculator className="w-5 h-5" />
                  </div>
                  {interestType === "simple" && (
                    <div className="w-6 h-6 rounded-full bg-bank-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p
                  className={`font-bold text-lg mb-1 ${
                    interestType === "simple"
                      ? "text-bank-700"
                      : "text-forest-900"
                  }`}
                >
                  Simple Interest
                </p>
                <p className="text-xs text-forest-500 font-medium mb-2">
                  Interest on original principal only
                </p>
                <p className="text-xs font-mono px-3 py-1.5 rounded-lg inline-block bg-forest-100 text-forest-700">
                  I = P × r × t
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterestType("compound")}
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                  interestType === "compound"
                    ? "border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-lg shadow-purple-500/10"
                    : "border-forest-200 bg-white hover:border-forest-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      interestType === "compound"
                        ? "bg-purple-600 text-white"
                        : "bg-forest-100 text-forest-600 group-hover:bg-forest-200"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  {interestType === "compound" && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p
                  className={`font-bold text-lg mb-1 ${
                    interestType === "compound"
                      ? "text-purple-700"
                      : "text-forest-900"
                  }`}
                >
                  Compound Interest
                </p>
                <p className="text-xs text-forest-500 font-medium mb-2">
                  Interest on principal + accumulated interest
                </p>
                <p className="text-xs font-mono px-3 py-1.5 rounded-lg inline-block bg-forest-100 text-forest-700">
                  A = P(1+r)^t
                </p>
              </button>
            </div>
          </div>

          {/* Time Period */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-forest-700 mb-2">
              Time Period (Months)
            </label>
            <input
              type="number"
              value={periods}
              onChange={(e) =>
                setPeriods(Math.max(1, Math.min(12, Number(e.target.value))))
              }
              className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/20 transition-all duration-200"
              min="1"
              max="12"
              placeholder="Enter number of months"
            />
            <p className="text-xs text-forest-500 mt-2 font-medium">
              Choose between 1-12 months
            </p>
          </div>
        </div>
      </div>

      {/* Info boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="group relative rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-2">Simple Interest</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Interest is calculated only on the original principal amount
                throughout the loan period. The interest remains constant for
                each period.
              </p>
              <div className="mt-3 p-2 bg-blue-100/50 rounded-lg">
                <p className="text-xs font-mono text-blue-800">
                  Interest = Principal × Rate × Time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative rounded-2xl bg-gradient-to-br from-purple-50 to-white p-5 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-purple-900 mb-2">
                Compound Interest
              </p>
              <p className="text-sm text-purple-700 leading-relaxed">
                Interest is calculated on the principal plus all previously
                accumulated interest. This results in exponential growth over
                time.
              </p>
              <div className="mt-3 p-2 bg-purple-100/50 rounded-lg">
                <p className="text-xs font-mono text-purple-800">
                  Amount = Principal × (1 + Rate)^Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
        <div className="p-6 bg-gradient-to-r from-bank-50 to-white border-b border-bank-100">
          <h3 className="text-xl font-bold text-forest-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-bank-600" />
            Calculation Results
          </h3>
          <p className="text-sm text-forest-600 mt-1">
            Based on your parameters
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Three Column Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative text-center p-5 bg-gradient-to-br from-forest-50 to-white rounded-2xl border-2 border-forest-100 hover:border-forest-200 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest-500 to-forest-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-2">
                Principal
              </p>
              <p className="text-3xl font-bold text-forest-900">
                {formatCurrency(result.principal)}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="px-4 py-2 bg-bank-100 rounded-xl border border-bank-200">
                  <p className="text-sm font-bold text-bank-700">
                    +{result.rate}%
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-bank-600" />
                <div className="px-4 py-2 bg-forest-100 rounded-xl border border-forest-200">
                  <p className="text-xs font-semibold text-forest-700 uppercase">
                    {result.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative text-center p-5 bg-gradient-to-br from-bank-50 to-white rounded-2xl border-2 border-bank-200 hover:border-bank-300 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bank-500 to-bank-400 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide mb-2">
                Interest
              </p>
              <p className="text-3xl font-bold text-bank-600">
                {formatCurrency(result.interest)}
              </p>
            </div>
          </div>

          {/* Total Repayment Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            </div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-4">
                <DollarSign className="w-4 h-4 text-white" />
                <p className="text-sm font-semibold text-white uppercase tracking-wider">
                  Total Repayment Amount
                </p>
              </div>
              <p className="text-5xl font-display font-bold text-white mb-3">
                {formatCurrency(result.total)}
              </p>
              <p className="text-bank-100 text-sm">
                Over <span className="font-bold text-white">{periods}</span>{" "}
                month
                {periods > 1 ? "s" : ""} at{" "}
                <span className="font-bold text-white">{rate}%</span>{" "}
                {interestType} interest
              </p>
            </div>
          </div>

          {onCalculate && (
            <button
              onClick={handleCalculate}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-bold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Apply This Calculation
            </button>
          )}
        </div>
      </div>

      {/* Payment Schedule */}
      {schedule && schedule.length > 1 && (
        <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <h3 className="text-xl font-bold text-forest-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Payment Schedule
            </h3>
            <p className="text-sm text-forest-600 mt-1">
              Monthly breakdown of {periods} payments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-forest-50 border-b border-forest-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-forest-700 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-50">
                {schedule.map((item, index) => (
                  <tr
                    key={item.period}
                    className="hover:bg-forest-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-sm">
                        {item.period}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-forest-700 font-medium">
                      {item.date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-forest-900">
                      {formatCurrency(item.principal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-bank-600">
                      {formatCurrency(item.interest)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-purple-600">
                      {formatCurrency(item.payment)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-forest-600">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-forest-50 to-white border-t-2 border-forest-200">
                  <td
                    className="px-6 py-4 font-bold text-forest-900"
                    colSpan={2}
                  >
                    Total
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-forest-900">
                    {formatCurrency(principal)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-bank-600">
                    {formatCurrency(result.interest)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-purple-600 text-lg">
                    {formatCurrency(result.total)}
                  </td>
                  <td className="px-6 py-4 text-right text-forest-500">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;
