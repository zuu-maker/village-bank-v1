// LocalStorage Database Utility for Village Banking System
// This simulates a database using localStorage for offline-first functionality

import {
  Member,
  Transaction,
  Loan,
  Cycle,
  Meeting,
  Settings,
  DashboardStats,
  PotSummary,
  InterestCalculation,
} from "./types";

const STORAGE_KEYS = {
  MEMBERS: "vb_members",
  TRANSACTIONS: "vb_transactions",
  LOANS: "vb_loans",
  CYCLES: "vb_cycles",
  MEETINGS: "vb_meetings",
  SETTINGS: "vb_settings",
};

// Helper function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to safely parse JSON from localStorage
const safeJsonParse = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper function to safely store JSON in localStorage
const safeJsonStore = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error storing data:", error);
  }
};

// ============================================
// DEFAULT SETTINGS
// ============================================
export const getDefaultSettings = (): Settings => ({
  sharePrice: 100,
  socialContributionAmount: 50,
  birthdayContributionAmount: 20,
  defaultInterestRate: 10,
  defaultInterestType: "simple",
  maxLoanMultiplier: 3,
  loanTermDays: 30,
  latePenaltyRate: 10,
  absenteeFinePecentage: 5,
  bankName: "Village Savings Bank",
  currency: "K",
});

// ============================================
// SETTINGS OPERATIONS
// ============================================
export const getSettings = (): Settings => {
  return safeJsonParse(STORAGE_KEYS.SETTINGS, getDefaultSettings());
};

export const updateSettings = (settings: Partial<Settings>): Settings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  safeJsonStore(STORAGE_KEYS.SETTINGS, updated);
  return updated;
};

// ============================================
// MEMBER OPERATIONS
// ============================================
export const getMembers = (): Member[] => {
  return safeJsonParse(STORAGE_KEYS.MEMBERS, []);
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find((m) => m.id === id);
};

export const addMember = (
  member: Omit<
    Member,
    | "id"
    | "totalSavings"
    | "totalShares"
    | "socialContributions"
    | "birthdayContributions"
  >,
): Member => {
  const members = getMembers();
  const newMember: Member = {
    ...member,
    id: generateId(),
    totalSavings: 0,
    totalShares: 0,
    socialContributions: 0,
    birthdayContributions: 0,
  };
  members.push(newMember);
  safeJsonStore(STORAGE_KEYS.MEMBERS, members);
  return newMember;
};

export const updateMember = (
  id: string,
  updates: Partial<Member>,
): Member | null => {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;
  members[index] = { ...members[index], ...updates };
  safeJsonStore(STORAGE_KEYS.MEMBERS, members);
  return members[index];
};

export const deleteMember = (id: string): boolean => {
  const members = getMembers();
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  safeJsonStore(STORAGE_KEYS.MEMBERS, filtered);
  return true;
};

// ============================================
// TRANSACTION OPERATIONS
// ============================================
export const getTransactions = (): Transaction[] => {
  return safeJsonParse(STORAGE_KEYS.TRANSACTIONS, []);
};

export const getTransactionsByMember = (memberId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter((t) => t.memberId === memberId);
};

export const addTransaction = (
  transaction: Omit<Transaction, "id">,
): Transaction => {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
  };
  transactions.push(newTransaction);
  safeJsonStore(STORAGE_KEYS.TRANSACTIONS, transactions);

  // Update member balance based on transaction type
  const member = getMemberById(transaction.memberId);
  if (member) {
    switch (transaction.type) {
      case "share_purchase":
        const settings = getSettings();
        const shares = transaction.amount / settings.sharePrice;
        updateMember(member.id, {
          totalSavings: member.totalSavings + transaction.amount,
          totalShares: member.totalShares + shares,
          lastPaymentDate: transaction.date,
        });
        break;
      case "social_contribution":
        updateMember(member.id, {
          socialContributions: member.socialContributions + transaction.amount,
          lastPaymentDate: transaction.date,
        });
        break;
      case "birthday_contribution":
        updateMember(member.id, {
          birthdayContributions:
            member.birthdayContributions + transaction.amount,
          lastPaymentDate: transaction.date,
        });
        break;
      case "withdrawal":
      case "dividend":
        updateMember(member.id, {
          totalSavings: member.totalSavings - transaction.amount,
        });
        break;
    }
  }

  return newTransaction;
};

// ============================================
// LOAN OPERATIONS
// ============================================
export const getLoans = (): Loan[] => {
  return safeJsonParse(STORAGE_KEYS.LOANS, []);
};

export const getLoanById = (id: string): Loan | undefined => {
  const loans = getLoans();
  return loans.find((l) => l.id === id);
};

export const getLoansByMember = (memberId: string): Loan[] => {
  const loans = getLoans();
  return loans.filter((l) => l.memberId === memberId);
};

export const getActiveLoans = (): Loan[] => {
  const loans = getLoans();
  return loans.filter((l) => l.status === "active" || l.status === "approved");
};

// Interest Calculation Functions
export const calculateInterest = (
  principal: number,
  rate: number,
  type: "simple" | "compound",
  timeInMonths: number = 1,
): InterestCalculation => {
  let interest: number;
  let total: number;

  if (type === "simple") {
    // Simple Interest: I = P * r * t
    interest = principal * (rate / 100) * timeInMonths;
    total = principal + interest;
  } else {
    // Compound Interest: A = P(1 + r)^t - P
    const compoundedAmount = principal * Math.pow(1 + rate / 100, timeInMonths);
    interest = compoundedAmount - principal;
    total = compoundedAmount;
  }

  return {
    principal,
    rate,
    type,
    timeInMonths,
    interest: Math.round(interest * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export const checkLoanEligibility = (
  memberId: string,
  requestedAmount: number,
): { eligible: boolean; maxAmount: number; reason?: string } => {
  const member = getMemberById(memberId);
  const settings = getSettings();

  if (!member) {
    return { eligible: false, maxAmount: 0, reason: "Member not found" };
  }

  if (member.status !== "active") {
    return { eligible: false, maxAmount: 0, reason: "Member is not active" };
  }

  const maxLoanAmount = member.totalSavings * settings.maxLoanMultiplier;

  // Check for existing active loans
  const activeLoans = getLoansByMember(memberId).filter(
    (l) => l.status === "active",
  );
  if (activeLoans.length > 0) {
    return {
      eligible: false,
      maxAmount: 0,
      reason: "Member has an active loan",
    };
  }

  if (requestedAmount > maxLoanAmount) {
    return {
      eligible: false,
      maxAmount: maxLoanAmount,
      reason: `Maximum loan amount is ${settings.currency}${maxLoanAmount.toLocaleString()}`,
    };
  }

  return { eligible: true, maxAmount: maxLoanAmount };
};

export const createLoan = (
  memberId: string,
  principalAmount: number,
  interestRate?: number,
  interestType?: "simple" | "compound",
): Loan | null => {
  const member = getMemberById(memberId);
  const settings = getSettings();

  if (!member) return null;

  const rate = interestRate ?? settings.defaultInterestRate;
  const type = interestType ?? settings.defaultInterestType;
  const calculation = calculateInterest(principalAmount, rate, type);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.loanTermDays);

  const loans = getLoans();
  const newLoan: Loan = {
    id: generateId(),
    memberId,
    memberName: member.name,
    principalAmount,
    interestRate: rate,
    interestType: type,
    interestAmount: calculation.interest,
    totalRepayment: calculation.total,
    amountPaid: 0,
    status: "pending",
    requestDate: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    rolloverCount: 0,
  };

  loans.push(newLoan);
  safeJsonStore(STORAGE_KEYS.LOANS, loans);
  return newLoan;
};

export const approveLoan = (loanId: string): Loan | null => {
  const loans = getLoans();
  const index = loans.findIndex((l) => l.id === loanId);
  if (index === -1) return null;

  loans[index] = {
    ...loans[index],
    status: "active",
    approvalDate: new Date().toISOString(),
  };
  safeJsonStore(STORAGE_KEYS.LOANS, loans);

  // Record transaction
  addTransaction({
    memberId: loans[index].memberId,
    memberName: loans[index].memberName,
    type: "loan_disbursement",
    amount: loans[index].principalAmount,
    date: new Date().toISOString(),
    description: `Loan disbursement - Principal: ${loans[index].principalAmount}`,
  });

  return loans[index];
};

export const makeLoanPayment = (
  loanId: string,
  amount: number,
): Loan | null => {
  const loans = getLoans();
  const index = loans.findIndex((l) => l.id === loanId);
  if (index === -1) return null;

  const loan = loans[index];
  const newAmountPaid = loan.amountPaid + amount;

  loans[index] = {
    ...loan,
    amountPaid: newAmountPaid,
    status: newAmountPaid >= loan.totalRepayment ? "paid" : "active",
    lastPaymentDate: new Date().toISOString(),
  };
  safeJsonStore(STORAGE_KEYS.LOANS, loans);

  // Record transaction
  addTransaction({
    memberId: loan.memberId,
    memberName: loan.memberName,
    type: "loan_repayment",
    amount,
    date: new Date().toISOString(),
    description: `Loan repayment - Remaining: ${loan.totalRepayment - newAmountPaid}`,
  });

  return loans[index];
};

export const rolloverLoan = (loanId: string): Loan | null => {
  const loans = getLoans();
  const index = loans.findIndex((l) => l.id === loanId);
  if (index === -1) return null;

  const loan = loans[index];
  const settings = getSettings();
  const remainingBalance = loan.totalRepayment - loan.amountPaid;

  // Calculate new interest on remaining balance
  const calculation = calculateInterest(
    remainingBalance,
    loan.interestRate,
    loan.interestType,
  );

  const newDueDate = new Date();
  newDueDate.setDate(newDueDate.getDate() + settings.loanTermDays);

  loans[index] = {
    ...loan,
    principalAmount: remainingBalance,
    interestAmount: calculation.interest,
    totalRepayment: calculation.total,
    amountPaid: 0,
    status: "active",
    dueDate: newDueDate.toISOString(),
    rolloverCount: loan.rolloverCount + 1,
  };

  safeJsonStore(STORAGE_KEYS.LOANS, loans);
  return loans[index];
};

// ============================================
// CYCLE OPERATIONS
// ============================================
export const getCycles = (): Cycle[] => {
  return safeJsonParse(STORAGE_KEYS.CYCLES, []);
};

export const getActiveCycle = (): Cycle | undefined => {
  const cycles = getCycles();
  return cycles.find((c) => c.status === "active");
};

export const createCycle = (
  name: string,
  startDate: string,
  endDate: string,
): Cycle => {
  const settings = getSettings();
  const cycles = getCycles();

  const newCycle: Cycle = {
    id: generateId(),
    name,
    startDate,
    endDate,
    status: "active",
    totalShares: 0,
    totalSavings: 0,
    totalLoansIssued: 0,
    totalInterestEarned: 0,
    totalFines: 0,
    shareValue: settings.sharePrice,
  };

  cycles.push(newCycle);
  safeJsonStore(STORAGE_KEYS.CYCLES, cycles);
  return newCycle;
};

export const closeCycle = (cycleId: string): Cycle | null => {
  const cycles = getCycles();
  const index = cycles.findIndex((c) => c.id === cycleId);
  if (index === -1) return null;

  const members = getMembers().filter((m) => m.status === "active");
  const totalShares = members.reduce((sum, m) => sum + m.totalShares, 0);
  const totalProfit =
    cycles[index].totalInterestEarned + cycles[index].totalFines;
  const dividendPerShare = totalShares > 0 ? totalProfit / totalShares : 0;

  cycles[index] = {
    ...cycles[index],
    status: "closed",
    dividendPerShare: Math.round(dividendPerShare * 100) / 100,
    totalShares,
  };

  safeJsonStore(STORAGE_KEYS.CYCLES, cycles);
  return cycles[index];
};

// ============================================
// DASHBOARD & STATISTICS
// ============================================
export const getDashboardStats = (): DashboardStats => {
  const members = getMembers();
  const loans = getLoans();
  const transactions = getTransactions();

  const activeMembers = members.filter((m) => m.status === "active").length;
  const totalSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);
  const activeLoans = loans.filter((l) => l.status === "active");
  const totalActiveLoans = activeLoans.reduce(
    (sum, l) => sum + (l.totalRepayment - l.amountPaid),
    0,
  );
  const totalInterestEarned = loans
    .filter((l) => l.status === "paid")
    .reduce((sum, l) => sum + l.interestAmount, 0);

  // Calculate cash on hand (simplified: savings - active loans)
  const cashOnHand =
    totalSavings - activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);

  // Calculate monthly growth (compare last 30 days transactions)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTransactions = transactions.filter(
    (t) => new Date(t.date) > thirtyDaysAgo,
  );
  const monthlyIncome = recentTransactions
    .filter((t) =>
      ["share_purchase", "social_contribution", "loan_repayment"].includes(
        t.type,
      ),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalMembers: members.length,
    activeMembers,
    totalSavings,
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    cashOnHand: Math.max(0, cashOnHand),
    totalInterestEarned,
    monthlyGrowth: monthlyIncome,
  };
};

export const getPotSummary = (): PotSummary => {
  const members = getMembers();
  const loans = getLoans();

  const savingsPot = members.reduce((sum, m) => sum + m.totalSavings, 0);
  const socialPot = members.reduce((sum, m) => sum + m.socialContributions, 0);
  const birthdayPot = members.reduce(
    (sum, m) => sum + m.birthdayContributions,
    0,
  );
  const loansPot = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + (l.totalRepayment - l.amountPaid), 0);

  return {
    savingsPot,
    socialPot,
    birthdayPot,
    loansPot,
    totalFunds: savingsPot + socialPot + birthdayPot,
  };
};

// ============================================
// BACKUP & RESTORE
// ============================================
export const exportData = (): string => {
  const data = {
    members: getMembers(),
    transactions: getTransactions(),
    loans: getLoans(),
    cycles: getCycles(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
    version: "1.0.0",
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.members) safeJsonStore(STORAGE_KEYS.MEMBERS, data.members);
    if (data.transactions)
      safeJsonStore(STORAGE_KEYS.TRANSACTIONS, data.transactions);
    if (data.loans) safeJsonStore(STORAGE_KEYS.LOANS, data.loans);
    if (data.cycles) safeJsonStore(STORAGE_KEYS.CYCLES, data.cycles);
    if (data.settings) safeJsonStore(STORAGE_KEYS.SETTINGS, data.settings);
    return true;
  } catch {
    return false;
  }
};

export const clearAllData = (): void => {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// ============================================
// SEED DATA FOR DEMO
// ============================================
export const seedDemoData = (): void => {
  if (getMembers().length > 0) return; // Don't seed if data exists

  // Add demo members
  const demoMembers = [
    {
      name: "Mary Mwanza",
      nrc: "123456/10/1",
      phone: "+260 97 1234567",
      status: "active" as const,
      joinDate: "2024-01-15",
    },
    {
      name: "John Banda",
      nrc: "234567/10/1",
      phone: "+260 96 2345678",
      status: "active" as const,
      joinDate: "2024-01-15",
    },
    {
      name: "Grace Phiri",
      nrc: "345678/10/1",
      phone: "+260 95 3456789",
      status: "active" as const,
      joinDate: "2024-02-01",
    },
    {
      name: "Peter Tembo",
      nrc: "456789/10/1",
      phone: "+260 97 4567890",
      status: "active" as const,
      joinDate: "2024-02-15",
    },
    {
      name: "Sarah Mulenga",
      nrc: "567890/10/1",
      phone: "+260 96 5678901",
      status: "suspended" as const,
      joinDate: "2024-01-20",
    },
  ];

  demoMembers.forEach((m) => addMember(m));

  const members = getMembers();
  const settings = getSettings();

  // Add some transactions for demo
  members.slice(0, 4).forEach((member, index) => {
    // Add share purchases
    addTransaction({
      memberId: member.id,
      memberName: member.name,
      type: "share_purchase",
      amount: settings.sharePrice * (2 + index),
      date: new Date(2024, 2, 15).toISOString(),
      description: `Initial share purchase - ${2 + index} shares`,
    });

    // Add social contributions
    addTransaction({
      memberId: member.id,
      memberName: member.name,
      type: "social_contribution",
      amount: settings.socialContributionAmount,
      date: new Date(2024, 2, 15).toISOString(),
      description: "Monthly social contribution",
    });
  });

  // Create a demo cycle
  createCycle("Cycle 2024", "2024-01-01", "2024-10-31");

  // Create a demo loan
  const updatedMembers = getMembers();
  if (updatedMembers[0]) {
    const loan = createLoan(updatedMembers[0].id, 500, 10, "simple");
    if (loan) {
      approveLoan(loan.id);
    }
  }
};
