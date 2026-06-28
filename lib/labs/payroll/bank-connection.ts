// Bank connection layer for Pay.ca.
//
// Models the "connect your payroll funding account" step that precedes paying
// anyone. In production this would be an aggregator handshake (Flinks / Plaid /
// MX style: link token -> user authenticates at their bank -> we exchange a
// public token for account + balance). Here it is a DETERMINISTIC MOCK: no
// OAuth window opens, no credentials are accepted, no real account is reached.
//
// The output of a connection is a `ConnectedBank`, which the payments engine
// consumes as its funding source via `connectedBankToFunding()`.

import type { FundingAccount } from "./sample-data"

export type ConnectableBank = {
  id: string
  name: string
  /** 3-digit CPA financial institution number. */
  institution: string
  /** Short tag shown in the UI. */
  kind: "Big Five" | "Aggregator"
  accent: string
  initial: string
  /** How the connection is described to the user. */
  blurb: string
}

/** A bank account the user has connected as their payroll funding source. */
export type ConnectedBank = {
  bankId: string
  bankName: string
  institution: string
  transit: string
  /** Full account number — kept for the EFT file; UI shows the masked form. */
  account: string
  /** Last-4 masked form for display, e.g. "•••• 0123". */
  accountMasked: string
  /** Available balance pulled at connect time. DEMO. */
  balance: number
  connectedAt: string
}

export const connectableBanks: ConnectableBank[] = [
  {
    id: "rbc",
    name: "RBC Royal Bank",
    institution: "003",
    kind: "Big Five",
    accent: "#0051a5",
    initial: "R",
    blurb: "Connect a business operating account to fund direct deposits and CRA remittances.",
  },
  {
    id: "td",
    name: "TD Canada Trust",
    institution: "004",
    kind: "Big Five",
    accent: "#54b948",
    initial: "T",
    blurb: "Link a TD business account for payroll EFT origination.",
  },
  {
    id: "scotiabank",
    name: "Scotiabank",
    institution: "002",
    kind: "Big Five",
    accent: "#ec111a",
    initial: "S",
    blurb: "Fund payroll runs from a Scotiabank operating account.",
  },
  {
    id: "bmo",
    name: "BMO Bank of Montreal",
    institution: "001",
    kind: "Big Five",
    accent: "#0079c1",
    initial: "B",
    blurb: "Connect a BMO business account as your payroll source of funds.",
  },
  {
    id: "cibc",
    name: "CIBC",
    institution: "010",
    kind: "Big Five",
    accent: "#b8242b",
    initial: "C",
    blurb: "Link a CIBC operating account for EFT and remittance debits.",
  },
  {
    id: "flinks",
    name: "Other bank (via aggregator)",
    institution: "999",
    kind: "Aggregator",
    accent: "#6d28d9",
    initial: "+",
    blurb: "Securely connect any Canadian financial institution through an open-banking aggregator.",
  },
]

export function getConnectableBank(id: string) {
  return connectableBanks.find((b) => b.id === id)
}

/**
 * Deterministic pseudo-balance so a given bank always "connects" with the same
 * figure within a build — enough to fund the demo runs, varied per bank. DEMO.
 */
function mockBalanceFor(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  // 55,000–95,000 range, rounded to the nearest 100.
  return 55000 + Math.round(((h % 400) * 100))
}

/** Deterministic last-7 account number for the connected account. DEMO. */
function mockAccountFor(id: string): string {
  let h = 7
  for (const ch of id) h = (h * 37 + ch.charCodeAt(0)) >>> 0
  return String(1000000 + (h % 8999999))
}

/**
 * Mock the aggregator token exchange. Returns the connected account that will
 * fund payroll. No network call, no credentials — purely derived from the id.
 */
export function connectBank(id: string): ConnectedBank | null {
  const bank = getConnectableBank(id)
  if (!bank) return null
  const account = mockAccountFor(id)
  return {
    bankId: bank.id,
    bankName: bank.name,
    institution: bank.institution,
    transit: "0" + String((account.charCodeAt(0) % 9) + 1).padStart(4, "0"),
    account,
    accountMasked: "•••• " + account.slice(-4),
    balance: mockBalanceFor(id),
    connectedAt: new Date().toISOString(),
  }
}

/** Adapt a connected bank into the FundingAccount shape the payments engine uses. */
export function connectedBankToFunding(bank: ConnectedBank): FundingAccount {
  return {
    label: `${bank.bankName} — ${bank.accountMasked}`,
    transit: bank.transit,
    institution: bank.institution,
    account: bank.account,
    balance: bank.balance,
  }
}
