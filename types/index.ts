export interface Member {
  id: string;
  name: string;
  nrc: string;
  phone: string;
  status: "active" | "suspended" | "left";
  totalShares: number;
  totalSavings: number;
  socialContributions: number;
  birthdayContributions: number;
  joinedDate: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  type:
    | "share_purchase"
    | "social_contribution"
    | "birthday_contribution"
    | "loan_disbursement"
    | "loan_repayment"
    | "fine"
    | "dividend";
  amount: number;
  description: string;
  date: string;
  cycleId: string;
}

export interface Loan {
  id: string;
  memberId: string;
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  totalAmount: number;
  amountPaid: number;
  status:
    | "pending"
    | "approved"
    | "disbursed"
    | "partially_paid"
    | "paid"
    | "defaulted";
  requestDate: string;
  dueDate: string;
  disbursementDate?: string;
  cycleId: string;
}

export interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "closed";
  shareValue: number;
  totalShares: number;
  totalSavings: number;
  totalSocialFund: number;
  totalLoansIssued: number;
  totalInterestEarned: number;
}

export interface Meeting {
  id: string;
  cycleId: string;
  date: string;
  attendees: string[];
  absentees: string[];
  finesCollected: number;
  sharesCollected: number;
  socialCollected: number;
  loansIssued: number;
  loansRepaid: number;
  notes?: string;
}

export interface Attendance {
  memberId: string;
  meetingId: string;
  present: boolean;
  fine?: number;
}

export interface PotSummary {
  savings: number;
  social: number;
  birthday: number;
  cashOnHand: number;
  loansOutstanding: number;
}

export interface MemberLoanEligibility {
  memberId: string;
  maxLoanAmount: number;
  currentSavings: number;
  multiplier: number;
  hasOutstandingLoan: boolean;
}

export type TabType =
  | "dashboard"
  | "members"
  | "savings"
  | "loans"
  | "meetings"
  | "reports"
  | "settings";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}
