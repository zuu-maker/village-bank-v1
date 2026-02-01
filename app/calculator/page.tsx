"use client";
import React from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import InterestCalculator from "@/components/InterestCalculator";
import { Calculator, Info, Zap } from "lucide-react";

export default function CalculatorPage() {
  return (
    <>
      <Layout title="Interest Calculator">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-bank-600 to-bank-500 flex items-center justify-center shadow-lg shadow-bank-500/25 mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-forest-900 mb-2">
              Interest Calculator
            </h1>
            <p className="text-forest-500 max-w-lg mx-auto">
              Calculate loan interest using normal simple, custom simple, or
              compound interest methods. Compare results to make informed
              lending decisions.
            </p>
          </div>

          {/* Calculator Component */}
          <div className="card p-6">
            <InterestCalculator showSchedule={true} />
          </div>

          {/* Educational Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Normal Simple Interest */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-blue-600" />
                </div>
                Normal Simple (PRT)
              </h3>
              <p className="text-forest-600 mb-4">
                Interest is calculated on the principal amount and multiplied by
                the number of time periods. Standard method for most village
                banking loans.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-mono text-blue-800">
                  <strong>Formula:</strong> I = P × R × T
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• I = Interest</li>
                  <li>• P = Principal amount</li>
                  <li>• R = Interest rate (decimal)</li>
                  <li>• T = Time period (months)</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-forest-50 rounded-xl">
                <p className="text-sm text-forest-700">
                  <strong>Example:</strong> K1,000 at 10% for 3 months
                </p>
                <p className="text-sm text-forest-600 mt-1">
                  Interest = K1,000 × 0.10 × 3 = <strong>K300</strong>
                </p>
                <p className="text-sm text-forest-600">
                  Total Repayment = K1,000 + K300 = <strong>K1,300</strong>
                </p>
              </div>
            </div>

            {/* Custom Simple Interest */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                Custom Simple (PR)
              </h3>
              <p className="text-forest-600 mb-4">
                A flat interest rate is applied once to the principal,
                regardless of the loan duration. Simple and predictable for
                short-term loans.
              </p>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-mono text-amber-800">
                  <strong>Formula:</strong> I = P × R
                </p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• I = Interest</li>
                  <li>• P = Principal amount</li>
                  <li>• R = Interest rate (decimal)</li>
                  <li>• No time factor</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-forest-50 rounded-xl">
                <p className="text-sm text-forest-700">
                  <strong>Example:</strong> K1,000 at 10% (any duration)
                </p>
                <p className="text-sm text-forest-600 mt-1">
                  Interest = K1,000 × 0.10 = <strong>K100</strong>
                </p>
                <p className="text-sm text-forest-600">
                  Total Repayment = K1,000 + K100 = <strong>K1,100</strong>
                </p>
              </div>
            </div>

            {/* Compound Interest */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Info className="w-4 h-4 text-purple-600" />
                </div>
                Compound Interest
              </h3>
              <p className="text-forest-600 mb-4">
                Interest is calculated on both the principal and previously
                accumulated interest. Results in exponential growth over time.
              </p>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-mono text-purple-800">
                  <strong>Formula:</strong> A = P(1 + R)^T
                </p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• A = Final amount</li>
                  <li>• P = Principal amount</li>
                  <li>• R = Interest rate (decimal)</li>
                  <li>• T = Number of periods</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-forest-50 rounded-xl">
                <p className="text-sm text-forest-700">
                  <strong>Example:</strong> K1,000 at 10% for 3 months
                </p>
                <p className="text-sm text-forest-600 mt-1">
                  Month 1: K1,000 × 1.10 = K1,100
                </p>
                <p className="text-sm text-forest-600">
                  Month 2: K1,100 × 1.10 = K1,210
                </p>
                <p className="text-sm text-forest-600">
                  Month 3: K1,210 × 1.10 = <strong>K1,331</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card mt-8 overflow-hidden">
            <div className="p-4 border-b border-forest-100 bg-forest-50">
              <h3 className="font-semibold text-forest-900">
                Quick Comparison: All Interest Methods
              </h3>
              <p className="text-sm text-forest-500">
                Based on K1,000 principal at 10% interest rate
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">Period</th>
                    <th className="px-4 py-3 text-right">Custom Simple (PR)</th>
                    <th className="px-4 py-3 text-right">
                      Normal Simple (PRT)
                    </th>
                    <th className="px-4 py-3 text-right">Compound</th>
                    <th className="px-4 py-3 text-right">Max Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 6, 12].map((months) => {
                    const customSimple = 1000 + 1000 * 0.1; // P × R (flat)
                    const normalSimple = 1000 + 1000 * 0.1 * months; // P × R × T
                    const compoundTotal = 1000 * Math.pow(1.1, months);
                    const maxDiff =
                      Math.max(customSimple, normalSimple, compoundTotal) -
                      Math.min(customSimple, normalSimple, compoundTotal);

                    return (
                      <tr key={months} className="table-row">
                        <td className="px-4 py-3 font-medium">
                          {months} month{months > 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-600 font-medium">
                          K{customSimple.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600 font-medium">
                          K{normalSimple.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-purple-600 font-medium">
                          K{compoundTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          K{maxDiff.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-forest-50 border-t border-forest-100">
              <p className="text-xs text-forest-600">
                <strong>Note:</strong> Custom Simple (PR) stays constant
                regardless of time. Normal Simple (PRT) grows linearly. Compound
                grows exponentially.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-6 mt-8 bg-gradient-to-r from-bank-50 to-bank-100/50 border-bank-200">
            <h3 className="text-lg font-semibold text-bank-800 mb-4">
              💡 Best Practices for Village Banking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Use <strong>Custom Simple (PR)</strong> for standard 1-month
                    loans
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Use <strong>Normal Simple (PRT)</strong> for multi-month
                    loans
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Consider <strong>Compound</strong> for loan rollovers or
                    late payments
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Always explain interest terms clearly to borrowers
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Document all interest calculations in loan agreements
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Review interest rates at each cycle end with the group
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
