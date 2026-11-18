import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paise into Indian Rupee format (e.g. 700000 paise -> "₹7,000")
 */
export function formatINR(paise: number, includeDecimals = false): string {
  if (isNaN(paise) || paise === null || paise === undefined) return "₹0";
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Format raw rupees into paise for database storage
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format date in Asia/Kolkata timezone
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "—";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/**
 * Format date and time in Asia/Kolkata timezone
 */
export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return "—";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/**
 * Calculate security deposit balance from transactions
 */
export function calculateDepositBalance(
  transactions: { transaction_type: "collected" | "deduction" | "refund"; amount_paise: number }[]
): { collected: number; deductions: number; refunds: number; balance: number } {
  let collected = 0;
  let deductions = 0;
  let refunds = 0;

  for (const tx of transactions) {
    if (tx.transaction_type === "collected") {
      collected += tx.amount_paise;
    } else if (tx.transaction_type === "deduction") {
      deductions += tx.amount_paise;
    } else if (tx.transaction_type === "refund") {
      refunds += tx.amount_paise;
    }
  }

  const balance = Math.max(0, collected - deductions - refunds);
  return { collected, deductions, refunds, balance };
}

/**
 * Check if a date is overdue compared to today in Asia/Kolkata
 */
export function isDateOverdue(dueDateString: string): boolean {
  if (!dueDateString) return false;
  const today = new Date().toISOString().split("T")[0];
  return dueDateString < today;
}
