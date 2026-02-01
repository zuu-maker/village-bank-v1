// Helper utility functions for formatting and calculations

import { getSettings } from "./database";

// Format currency with settings
export const formatCurrency = (amount: number): string => {
  const settings = getSettings();
  return `${settings.currency}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date to readable string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format datetime
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate days between dates
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Check if date is past
export const isOverdue = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Calculate percentage
export const calculatePercentage = (part: number, whole: number): number => {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100 * 10) / 10;
};

// Status colors
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: "badge-success",
    approved: "badge-success",
    paid: "badge-success",
    pending: "badge-warning",
    suspended: "badge-warning",
    defaulted: "badge-danger",
    left: "badge-danger",
    closed: "badge-info",
  };
  return colors[status] || "badge-info";
};

// Transaction type labels
export const getTransactionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    share_purchase: "Share Purchase",
    social_contribution: "Social Contribution",
    birthday_contribution: "Birthday Contribution",
    loan_disbursement: "Loan Disbursement",
    loan_repayment: "Loan Repayment",
    fine: "Fine",
    dividend: "Dividend Payout",
    withdrawal: "Withdrawal",
    // NEW
    welfare_usage: "Welfare Usage",
    social_loan_disbursement: "Social Loan Out",
    social_loan_repayment: "Social Loan Repayment",
  };
  return labels[type] || type;
};

// Update getTransactionColor function
export const getTransactionColor = (type: string): string => {
  const colors: Record<string, string> = {
    share_purchase: "text-bank-600 bg-bank-50",
    social_contribution: "text-blue-600 bg-blue-50",
    birthday_contribution: "text-purple-600 bg-purple-50",
    loan_disbursement: "text-amber-600 bg-amber-50",
    loan_repayment: "text-bank-600 bg-bank-50",
    fine: "text-red-600 bg-red-50",
    dividend: "text-bank-600 bg-bank-50",
    withdrawal: "text-red-600 bg-red-50",
    // NEW
    welfare_usage: "text-red-600 bg-red-50",
    social_loan_disbursement: "text-blue-600 bg-blue-50",
    social_loan_repayment: "text-blue-600 bg-blue-50",
  };
  return colors[type] || "text-gray-600 bg-gray-50";
};

// Update isIncomeTransaction function
export const isIncomeTransaction = (type: string): boolean => {
  const incomeTypes = [
    "share_purchase",
    "social_contribution",
    "birthday_contribution",
    "loan_repayment",
    "fine",
    "social_loan_repayment", // NEW - money coming back
  ];
  return incomeTypes.includes(type);
};

// Generate loan schedule
export interface LoanScheduleItem {
  period: number;
  date: Date;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

export const generateLoanSchedule = (
  principal: number,
  rate: number,
  type: "normal_simple" | "custom_simple" | "compound",
  periods: number = 1,
): LoanScheduleItem[] => {
  const schedule: LoanScheduleItem[] = [];
  let balance = principal;
  const startDate = new Date();

  for (let i = 1; i <= periods; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);

    let interest: number;
    if (type === "normal_simple") {
      interest = principal * (rate / 100);
    } else if (type === "custom_simple") {
      interest = balance * (rate / 100);
    } else {
      interest = balance * (rate / 100);
    }

    const payment = principal / periods + interest;
    balance = Math.max(0, balance - principal / periods);

    schedule.push({
      period: i,
      date,
      principal: Math.round((principal / periods) * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      payment: Math.round(payment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
};

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Validate phone number (Zambian format)
export const isValidPhone = (phone: string): boolean => {
  const pattern = /^(\+260|0)?[79]\d{8}$/;
  return pattern.test(phone.replace(/\s/g, ""));
};

// Validate NRC number
export const isValidNRC = (nrc: string): boolean => {
  const pattern = /^\d{6}\/\d{2}\/\d$/;
  return pattern.test(nrc);
};

// Class name merger utility
export const cn = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
