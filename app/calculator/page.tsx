"use client";
import React from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import InterestCalculator from "@/components/InterestCalculator";
import { Calculator, Info } from "lucide-react";

export default function CalculatorPage() {
  return (
    <>
      <Head>
        <title>Interest Calculator | Village Banking System</title>
      </Head>

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
              Calculate loan interest using either simple or compound interest
              methods. Compare results to make informed lending decisions.
            </p>
          </div>

          {/* Calculator Component */}
          <div className="card p-6">
            <InterestCalculator showSchedule={true} />
          </div>

          {/* Educational Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                Simple Interest Explained
              </h3>
              <p className="text-forest-600 mb-4">
                Simple interest is calculated only on the original principal
                amount. It remains constant throughout the loan period, making
                it easier to predict total costs.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-mono text-blue-800">
                  <strong>Formula:</strong> I = P × r × t
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• I = Interest</li>
                  <li>• P = Principal amount</li>
                  <li>• r = Interest rate (decimal)</li>
                  <li>• t = Time period</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-forest-50 rounded-xl">
                <p className="text-sm text-forest-700">
                  <strong>Example:</strong> K1,000 at 10% for 1 month
                </p>
                <p className="text-sm text-forest-600 mt-1">
                  Interest = K1,000 × 0.10 × 1 = <strong>K100</strong>
                </p>
                <p className="text-sm text-forest-600">
                  Total Repayment = K1,000 + K100 = <strong>K1,100</strong>
                </p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Info className="w-4 h-4 text-purple-600" />
                </div>
                Compound Interest Explained
              </h3>
              <p className="text-forest-600 mb-4">
                Compound interest is calculated on both the principal and
                previously accumulated interest. This causes the debt to grow
                faster over time.
              </p>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-mono text-purple-800">
                  <strong>Formula:</strong> A = P(1 + r)^t
                </p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• A = Final amount</li>
                  <li>• P = Principal amount</li>
                  <li>• r = Interest rate (decimal)</li>
                  <li>• t = Number of periods</li>
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
                Quick Comparison: Simple vs Compound Interest
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
                    <th className="px-4 py-3 text-right">Simple Interest</th>
                    <th className="px-4 py-3 text-right">Total (Simple)</th>
                    <th className="px-4 py-3 text-right">Compound Interest</th>
                    <th className="px-4 py-3 text-right">Total (Compound)</th>
                    <th className="px-4 py-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 6, 12].map((months) => {
                    const simpleInterest = 1000 * 0.1 * months;
                    const simpleTotal = 1000 + simpleInterest;
                    const compoundTotal = 1000 * Math.pow(1.1, months);
                    const compoundInterest = compoundTotal - 1000;
                    const difference = compoundTotal - simpleTotal;

                    return (
                      <tr key={months} className="table-row">
                        <td className="px-4 py-3 font-medium">
                          {months} month{months > 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600">
                          K{simpleInterest.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          K{simpleTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-purple-600">
                          K{compoundInterest.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          K{compoundTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-600">
                          +K{difference.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                    Use simple interest for short-term loans (1 month)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Consider compound interest for loan rollovers
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Keep interest rates between 5-15% monthly
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Always explain interest terms to borrowers
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Document all interest calculations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-bank-600">✓</span>
                  <p className="text-sm text-forest-700">
                    Review interest rates at each cycle end
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
