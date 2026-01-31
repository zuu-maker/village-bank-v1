// Custom hooks for Village Banking System

import { useState, useEffect, useCallback } from "react";
import {
  Member,
  Transaction,
  Loan,
  Cycle,
  Settings,
  DashboardStats,
  PotSummary,
  SocialLoan,
} from "../utils/types";
import * as db from "../utils/database";

// hook for social Loans

export const useSocialLoans = (memberId?: string) => {
  const [loans, setLoans] = useState<SocialLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = memberId
      ? db.getSocialLoansByMember(memberId)
      : db.getSocialLoans();
    setLoans(data);
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loans,
    loading,
    refresh,
    createLoan: (
      memberId: string,
      amount: number,
      period: number,
      rate: number,
      type: "simple" | "compound",
    ) => {
      const result = db.createSocialLoan(memberId, amount, period, rate, type);
      refresh();
      return result;
    },
    approveLoan: (loanId: string) => {
      const result = db.approveSocialLoan(loanId);
      refresh();
      return result;
    },
    makePayment: (loanId: string, amount: number) => {
      const result = db.makeSocialLoanPayment(loanId, amount);
      refresh();
      return result;
    },
    // double check these at the bottom but i believe we are just passing the functions to be used later you feel me?
    checkEligibility: db.checkSocialLoanEligibility,
    getActiveSocialLoans: db.getActiveSocialLoans,
    getSocialPotSummary: db.getSocialPotSummary,
  };
};

// Hook for managing members
export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setMembers(db.getMembers());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback(
    (
      member: Omit<
        Member,
        | "id"
        | "totalSavings"
        | "totalShares"
        | "socialContributions"
        | "birthdayContributions"
      >,
    ) => {
      const newMember = db.addMember(member);
      refresh();
      return newMember;
    },
    [refresh],
  );

  const updateMember = useCallback(
    (id: string, updates: Partial<Member>) => {
      const updated = db.updateMember(id, updates);
      refresh();
      return updated;
    },
    [refresh],
  );

  const deleteMember = useCallback(
    (id: string) => {
      const result = db.deleteMember(id);
      refresh();
      return result;
    },
    [refresh],
  );

  return {
    members,
    loading,
    refresh,
    addMember,
    updateMember,
    deleteMember,
    getMemberById: db.getMemberById,
  };
};

// Hook for managing transactions
export const useTransactions = (memberId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (memberId) {
      setTransactions(db.getTransactionsByMember(memberId));
    } else {
      setTransactions(db.getTransactions());
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction = db.addTransaction(transaction);
      refresh();
      return newTransaction;
    },
    [refresh],
  );

  return {
    transactions,
    loading,
    refresh,
    addTransaction,
  };
};

// Hook for managing loans
export const useLoans = (memberId?: string) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (memberId) {
      setLoans(db.getLoansByMember(memberId));
    } else {
      setLoans(db.getLoans());
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLoan = useCallback(
    (
      memberId: string,
      amount: number,
      period: number,
      rate?: number,
      type?: "normal_simple" | "custom_simple" | "compound",
    ) => {
      const newLoan = db.createLoan(memberId, amount, period, rate, type);
      refresh();
      return newLoan;
    },
    [refresh],
  );

  const approveLoan = useCallback(
    (loanId: string) => {
      const result = db.approveLoan(loanId);
      refresh();
      return result;
    },
    [refresh],
  );

  const makePayment = useCallback(
    (loanId: string, amount: number) => {
      const result = db.makeLoanPayment(loanId, amount);
      refresh();
      return result;
    },
    [refresh],
  );

  const penalise = useCallback(
    (loanId: string, penalty: number) => {
      const result = db.penaliseLoan(loanId, penalty);
      refresh();
      return result;
    },
    [refresh],
  );

  const rolloverLoan = useCallback(
    (loanId: string) => {
      const result = db.rolloverLoan(loanId);
      refresh();
      return result;
    },
    [refresh],
  );

  return {
    loans,
    loading,
    refresh,
    createLoan,
    approveLoan,
    makePayment,
    rolloverLoan,

    penalise,
    checkEligibility: db.checkLoanEligibility,
    calculateInterest: db.calculateInterest,
    getActiveLoans: db.getActiveLoans,
  };
};

// Hook for managing cycles
export const useCycles = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<Cycle | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setCycles(db.getCycles());
    setActiveCycle(db.getActiveCycle());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCycle = useCallback(
    (name: string, startDate: string, endDate: string) => {
      const newCycle = db.createCycle(name, startDate, endDate);
      refresh();
      return newCycle;
    },
    [refresh],
  );

  const closeCycle = useCallback(
    (cycleId: string) => {
      const result = db.closeCycle(cycleId);
      refresh();
      return result;
    },
    [refresh],
  );

  return {
    cycles,
    activeCycle,
    loading,
    refresh,
    createCycle,
    closeCycle,
  };
};

// Hook for settings
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(db.getDefaultSettings());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setSettings(db.getSettings());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const updated = db.updateSettings(updates);
    setSettings(updated);
    return updated;
  }, []);

  return {
    settings,
    loading,
    refresh,
    updateSettings,
  };
};

// Hook for dashboard statistics
export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalSavings: 0,
    totalLoans: 0,
    activeLoans: 0,
    cashOnHand: 0,
    totalInterestEarned: 0,
    monthlyGrowth: 0,
  });
  const [potSummary, setPotSummary] = useState<PotSummary>({
    savingsPot: 0,
    socialPot: 0,
    birthdayPot: 0,
    loansPot: 0,
    totalFunds: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setStats(db.getDashboardStats());
    setPotSummary(db.getPotSummary());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    potSummary,
    loading,
    refresh,
  };
};

// Hook for data backup/restore
export const useBackup = () => {
  const exportData = useCallback(() => {
    return db.exportData();
  }, []);

  const importData = useCallback((jsonString: string) => {
    return db.importData(jsonString);
  }, []);

  const clearData = useCallback(() => {
    db.clearAllData();
  }, []);

  const seedDemo = useCallback(() => {
    db.seedDemoData();
  }, []);

  return {
    exportData,
    importData,
    clearData,
    seedDemo,
  };
};

// Hook for local storage sync
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
};
