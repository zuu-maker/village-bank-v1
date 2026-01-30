// Types for Village Banking System

export interface Member {
  id: string;
  name: string;
  nrc: string;
  phone: string;
  status: "active" | "suspended" | "left";
  totalSavings: number;
  totalShares: number;
  socialContributions: number;
  birthdayContributions: number;
  joinDate: string;
  lastPaymentDate?: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type:
    | "share_purchase"
    | "social_contribution"
    | "birthday_contribution"
    | "loan_disbursement"
    | "loan_repayment"
    | "fine"
    | "dividend"
    | "withdrawal"
    | "welfare_usage" // Money taken from social pot for emergencies
    | "social_loan_disbursement" // Social loan given to member
    | "social_loan_repayment"; // Social loan repaid by member
  amount: number;
  date: string;
  description: string;
  balanceAfter?: number;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  principalAmount: number;
  interestRate: number;
  interestType: "simple" | "compound";
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: "pending" | "approved" | "active" | "paid" | "defaulted";
  requestDate: string;
  approvalDate?: string;
  dueDate: string;
  lastPaymentDate?: string;
  rolloverCount: number;
}

export interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "closed";
  totalShares: number;
  totalSavings: number;
  totalLoansIssued: number;
  totalInterestEarned: number;
  totalFines: number;
  shareValue: number;
  dividendPerShare?: number;
}

export interface Meeting {
  id: string;
  cycleId: string;
  date: string;
  attendees: string[];
  absentees: string[];
  totalCollected: number;
  loansIssued: number;
  finesCollected: number;
  notes?: string;
}

export interface Settings {
  sharePrice: number;
  socialContributionAmount: number;
  birthdayContributionAmount: number;
  defaultInterestRate: number;
  defaultInterestType: "simple" | "compound";
  maxLoanMultiplier: number;
  loanTermDays: number;
  latePenaltyRate: number;
  absenteeFinePecentage: number;
  bankName: string;
  currency: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalSavings: number;
  totalLoans: number;
  activeLoans: number;
  cashOnHand: number;
  totalInterestEarned: number;
  monthlyGrowth: number;
}

// Interest calculation types
export interface InterestCalculation {
  principal: number;
  rate: number;
  type: "simple" | "compound";
  timeInMonths: number;
  interest: number;
  total: number;
}

// Pot summaries
export interface PotSummary {
  savingsPot: number;
  socialPot: number;
  birthdayPot: number;
  loansPot: number;
  totalFunds: number;
}

export interface SocialLoan {
  id: string;
  memberId: string;
  memberName: string;
  principalAmount: number;
  interestRate: number;
  interestType: "simple" | "compound";
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: "pending" | "approved" | "active" | "paid" | "defaulted";
  requestDate: string;
  approvalDate?: string;
  dueDate: string;
  lastPaymentDate?: string;
  rolloverCount: number;
}

export interface SocialPotSummary {
  totalContributions: number; // Total contributed by all members
  totalUsedForWelfare: number; // Used for emergencies
  totalLoanedOut: number; // Currently loaned out
  totalInterestEarned: number; // Interest from social loans
  availableForLoans: number; // Can still be loaned
  availableForDistribution: number; // At cycle end
}
