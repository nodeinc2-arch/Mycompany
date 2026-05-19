export type IntegrationStatus = "connected" | "available" | "coming-soon"

export type IntegrationField = {
  key: string
  label: string
  type: "text" | "password" | "url"
  placeholder?: string
}

export type Integration = {
  id: string
  name: string
  vendor: string
  category: "HRIS" | "ERP" | "Accounting" | "Payroll" | "Time & Attendance"
  region: string[]
  status: IntegrationStatus
  capabilities: string[]
  fields: IntegrationField[]
  description: string
  initial: string
  accent: string
}

export const integrations: Integration[] = [
  {
    id: "workday",
    name: "Workday",
    vendor: "Workday, Inc.",
    category: "HRIS",
    region: ["Global"],
    status: "available",
    capabilities: ["Employee sync", "Comp & benefits", "Org structure", "Time off"],
    fields: [
      { key: "tenant", label: "Tenant URL", type: "url", placeholder: "https://impl-cc.workday.com/ccx/service/<tenant>" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
    ],
    description: "Bi-directional sync of workers, comp, and org hierarchy via Workday SOAP/REST.",
    initial: "W",
    accent: "#0a73b8",
  },
  {
    id: "sap-successfactors",
    name: "SAP SuccessFactors",
    vendor: "SAP SE",
    category: "HRIS",
    region: ["Global"],
    status: "available",
    capabilities: ["Employee Central", "Payroll posting", "Cost centers"],
    fields: [
      { key: "api_url", label: "API URL", type: "url", placeholder: "https://api{N}.sapsf.com" },
      { key: "company_id", label: "Company ID", type: "text" },
      { key: "username", label: "Username", type: "text" },
      { key: "password", label: "Password", type: "password" },
    ],
    description: "Push payroll postings into SAP and pull worker master data from Employee Central.",
    initial: "S",
    accent: "#0a6ed1",
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    vendor: "Intuit",
    category: "Accounting",
    region: ["CA", "US"],
    status: "available",
    capabilities: ["GL posting", "Vendor pay", "Chart of accounts"],
    fields: [
      { key: "realm_id", label: "Realm ID", type: "text" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
    ],
    description: "Post journal entries from each pay run directly into QuickBooks Online.",
    initial: "Q",
    accent: "#2ca01c",
  },
  {
    id: "adp",
    name: "ADP Workforce Now",
    vendor: "ADP",
    category: "Payroll",
    region: ["CA", "US"],
    status: "available",
    capabilities: ["Payroll runs", "Direct deposit", "Tax filing", "T4 / W-2"],
    fields: [
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
      { key: "cert", label: "Certificate (PEM)", type: "password" },
    ],
    description: "Run net pay calculations and direct deposit through ADP's WFN API.",
    initial: "A",
    accent: "#d50032",
  },
  {
    id: "ceridian-dayforce",
    name: "Ceridian Dayforce",
    vendor: "Dayforce, Inc.",
    category: "Payroll",
    region: ["CA", "US"],
    status: "available",
    capabilities: ["Pay runs", "Time & attendance", "Statutory remittance"],
    fields: [
      { key: "namespace", label: "Namespace", type: "text" },
      { key: "username", label: "API Username", type: "text" },
      { key: "password", label: "API Password", type: "password" },
    ],
    description: "Dayforce REST integration for Canadian payroll, T4s, and CRA remittance.",
    initial: "C",
    accent: "#e94e1b",
  },
  {
    id: "xero",
    name: "Xero",
    vendor: "Xero Limited",
    category: "Accounting",
    region: ["CA", "AU", "NZ", "UK"],
    status: "available",
    capabilities: ["GL posting", "Bank feeds", "Tax codes"],
    fields: [
      { key: "tenant_id", label: "Tenant ID", type: "text" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
    ],
    description: "Push payroll journals and CPP/EI summaries into Xero ledgers.",
    initial: "X",
    accent: "#13b5ea",
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    vendor: "Oracle Corporation",
    category: "ERP",
    region: ["Global"],
    status: "available",
    capabilities: ["GL posting", "Multi-entity", "Subsidiary mapping", "Revenue recognition"],
    fields: [
      { key: "account_id", label: "Account ID", type: "text" },
      { key: "consumer_key", label: "Consumer Key", type: "text" },
      { key: "consumer_secret", label: "Consumer Secret", type: "password" },
      { key: "token_id", label: "Token ID", type: "text" },
      { key: "token_secret", label: "Token Secret", type: "password" },
    ],
    description: "TBA-authenticated posting of payroll journals into NetSuite, with subsidiary and class mapping.",
    initial: "N",
    accent: "#125c9e",
  },
  {
    id: "zoho-books",
    name: "Zoho Books / People",
    vendor: "Zoho Corporation",
    category: "Accounting",
    region: ["CA", "US", "IN", "Global"],
    status: "available",
    capabilities: ["GL posting", "Employee sync (Zoho People)", "Vendor pay"],
    fields: [
      { key: "organization_id", label: "Organization ID", type: "text" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
      { key: "refresh_token", label: "Refresh Token", type: "password" },
    ],
    description: "OAuth integration with Zoho Books for GL and Zoho People for HR records.",
    initial: "Z",
    accent: "#c83a31",
  },
  {
    id: "rippling",
    name: "Rippling",
    vendor: "Rippling People Center",
    category: "HRIS",
    region: ["CA", "US"],
    status: "coming-soon",
    capabilities: ["Worker sync", "Benefits", "Device & app provisioning"],
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
    ],
    description: "Pull employees, benefits, and device assignments from Rippling.",
    initial: "R",
    accent: "#fdc70c",
  },
  {
    id: "cra-remittance",
    name: "CRA Remittance",
    vendor: "Canada Revenue Agency",
    category: "Payroll",
    region: ["CA"],
    status: "available",
    capabilities: ["PD7A filing", "T4 submission", "ROE filing"],
    fields: [
      { key: "business_number", label: "Business Number (BN)", type: "text" },
      { key: "web_access_code", label: "Web Access Code", type: "password" },
    ],
    description: "Submit PD7A remittances and T4 slips directly to the CRA.",
    initial: "$",
    accent: "#d52b1e",
  },
]

export function getIntegration(id: string) {
  return integrations.find((i) => i.id === id)
}
