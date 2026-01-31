// utils/pdfGenerator.ts
// Pure JavaScript PDF generator for member reports (works in Electron)

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Member, Transaction, Loan, Settings } from "./types";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getTransactionLabel,
  isIncomeTransaction,
} from "./helpers";

interface MemberReportData {
  member: Member;
  transactions: Transaction[];
  loans: Loan[];
  socialLoans: Loan[];
  settings: Settings;
  stats: {
    maxLoanAmount: number;
    outstandingBalance: number;
    availableCredit: number;
    activeLoansCount: number;
  };
}

const COLORS = {
  primary: "#0369a1", // Blue
  secondary: "#059669", // Green
  tertiary: "#f59e0b", // Amber
  quaternary: "#2563eb", // Blue for social
  textDark: "#1e293b",
  textLight: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
};

export const generateMemberPDF = (data: MemberReportData) => {
  const { member, transactions, loans, socialLoans, settings, stats } = data;

  // Create PDF document (A4 size)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add header with background
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Member name and title
  doc.setTextColor("#ffffff");
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`Member Report: ${member.name}`, margin, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated on ${currentDate}`, margin, 28);

  // Status badge
  const statusText = member.status === "active" ? "Active Member" : "Inactive";
  const statusColor = member.status === "active" ? "#10b981" : "#ef4444";
  doc.setFillColor(statusColor);
  doc.roundedRect(margin, 33, 35, 7, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, margin + 17.5, 37.5, { align: "center" });

  yPosition = 60;

  // Member Details Table
  doc.setTextColor(COLORS.textDark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Member Details", margin, yPosition);
  yPosition += 8;

  const memberDetailsData = [
    ["Name:", member.name],
    ["Status:", member.status === "active" ? "Active" : "Inactive"],
    ["Phone:", member.phone || "N/A"],
    ["NRC:", member.nrc || "N/A"],
    ["Join Date:", formatDate(member.joinDate)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: memberDetailsData,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, fillColor: COLORS.bg },
      1: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;
  checkPageBreak(40);

  // Financial Overview
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Overview", margin, yPosition);
  yPosition += 8;

  const financialData = [
    ["Total Savings", "Total Shares", "Outstanding Loans", "Available Credit"],
    [
      formatCurrency(member.totalSavings, settings.currency),
      `${member.totalShares} shares`,
      formatCurrency(stats.outstandingBalance, settings.currency),
      formatCurrency(stats.availableCredit, settings.currency),
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [financialData[0]],
    body: [financialData[1]],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: "#ffffff",
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 11,
      fontStyle: "bold",
      halign: "center",
      fillColor: "#f0fdf4",
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(60);

  // Transaction History
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction History", margin, yPosition);
  yPosition += 8;

  if (transactions && transactions.length > 0) {
    const transactionRows = transactions
      .slice(0, 20)
      .map((trans) => [
        formatDate(trans.date),
        getTransactionLabel(trans.type),
        formatCurrency(trans.amount, settings.currency),
        trans.description.length > 40
          ? trans.description.substring(0, 40) + "..."
          : trans.description,
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Type", "Amount", "Description"]],
      body: transactionRows,
      theme: "striped",
      headStyles: {
        fillColor: COLORS.primary,
        textColor: "#ffffff",
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: "auto" },
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: COLORS.bg,
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight);
    doc.text("No transactions found.", margin, yPosition);
    yPosition += 15;
  }

  checkPageBreak(60);

  // Loan History
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textDark);
  doc.text("Loan History", margin, yPosition);
  yPosition += 8;

  if (loans && loans.length > 0) {
    const loanRows = loans.map((loan) => {
      const progress =
        loan.totalRepayment > 0
          ? Math.round((loan.amountPaid / loan.totalRepayment) * 100)
          : 0;
      return [
        formatDate(loan.requestDate),
        formatCurrency(loan.principalAmount, settings.currency),
        `${loan.interestRate}%`,
        formatCurrency(loan.totalRepayment, settings.currency),
        `${progress}%`,
        loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Principal", "Interest", "Total Due", "Paid", "Status"]],
      body: loanRows,
      theme: "striped",
      headStyles: {
        fillColor: COLORS.tertiary,
        textColor: "#ffffff",
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 28, halign: "right" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 25, halign: "center" },
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: "#fffbeb",
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight);
    doc.text("No loans found.", margin, yPosition);
    yPosition += 15;
  }

  checkPageBreak(60);

  // Social Loan History
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textDark);
  doc.text("Social Loan History", margin, yPosition);
  yPosition += 8;

  if (socialLoans && socialLoans.length > 0) {
    const socialLoanRows = socialLoans.map((loan) => {
      const progress =
        loan.totalRepayment > 0
          ? Math.round((loan.amountPaid / loan.totalRepayment) * 100)
          : 0;
      return [
        formatDate(loan.requestDate),
        formatCurrency(loan.principalAmount, settings.currency),
        `${loan.interestRate}%`,
        formatCurrency(loan.totalRepayment, settings.currency),
        `${progress}%`,
        loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Principal", "Interest", "Total Due", "Paid", "Status"]],
      body: socialLoanRows,
      theme: "striped",
      headStyles: {
        fillColor: COLORS.quaternary,
        textColor: "#ffffff",
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 28, halign: "right" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 25, halign: "center" },
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: "#eff6ff",
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight);
    doc.text("No social loans found.", margin, yPosition);
    yPosition += 15;
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Report generated by ${settings.bankName || "Village Banking System"} - Confidential`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" },
    );
  }

  // Generate filename
  const fileName = `${member.name.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;

  // Save the PDF
  doc.save(fileName);

  return fileName;
};
