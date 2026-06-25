// ─── Types ─────────────────────────────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high';
export type ContractStatus = 'draft' | 'pending' | 'active' | 'expiring' | 'expired' | 'terminated' | 'renewed';
export type ObligationStatus = 'pending' | 'completed' | 'overdue';
export type AlertType = 'renewal_90' | 'renewal_30' | 'renewal_7' | 'obligation_due';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  country: string;
  contactEmail: string;
  riskScore: RiskLevel;
  activeContractCount: number;
  totalSpend: number;
  createdAt: string;
}

export interface Contract {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  status: ContractStatus;
  contractType: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  noticePeriodDays: number;
  aiRiskScore: RiskLevel;
  aiSummary: string;
  governingLaw: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Obligation {
  id: string;
  contractId: string;
  contractTitle: string;
  vendorName: string;
  type: 'payment' | 'renewal' | 'audit' | 'review' | 'notice' | 'custom';
  description: string;
  dueDate: string;
  status: ObligationStatus;
  assignedTo: string;
}

export interface Alert {
  id: string;
  contractId: string;
  contractTitle: string;
  vendorName: string;
  alertType: AlertType;
  scheduledFor: string;
  sentAt: string | null;
  channel: 'email' | 'sms' | 'in_app';
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface DashboardStats {
  activeContracts: number;
  totalSpend: number;
  expiringIn30: number;
  expiringIn90: number;
  upcomingBilling: number;
  spendByCategory: { category: string; amount: number }[];
  contractStatusBreakdown: { status: string; count: number }[];
}

// ─── Vendors ───────────────────────────────────────────────────────────────────
export const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Salesforce Inc.', category: 'CRM Software', country: 'United States', contactEmail: 'contracts@salesforce.com', riskScore: 'low', activeContractCount: 2, totalSpend: 84000, createdAt: '2023-01-15' },
  { id: 'v2', name: 'AWS (Amazon Web Services)', category: 'Cloud Infrastructure', country: 'United States', contactEmail: 'billing@aws.amazon.com', riskScore: 'low', activeContractCount: 1, totalSpend: 120000, createdAt: '2022-06-01' },
  { id: 'v3', name: 'Gartner Advisory', category: 'Consulting', country: 'United States', contactEmail: 'legal@gartner.com', riskScore: 'medium', activeContractCount: 1, totalSpend: 48000, createdAt: '2023-03-20' },
  { id: 'v4', name: 'HubSpot Ltd.', category: 'Marketing Software', country: 'Ireland', contactEmail: 'contracts@hubspot.com', riskScore: 'low', activeContractCount: 1, totalSpend: 24000, createdAt: '2023-07-10' },
  { id: 'v5', name: 'Kroll Risk Advisory', category: 'Risk Management', country: 'United Kingdom', contactEmail: 'procurement@kroll.com', riskScore: 'high', activeContractCount: 1, totalSpend: 62000, createdAt: '2023-09-01' },
  { id: 'v6', name: 'Stripe Payments', category: 'Payments', country: 'United States', contactEmail: 'enterprise@stripe.com', riskScore: 'low', activeContractCount: 1, totalSpend: 18000, createdAt: '2023-11-05' },
];

// ─── Contracts ─────────────────────────────────────────────────────────────────
export const CONTRACTS: Contract[] = [
  {
    id: 'c1', vendorId: 'v1', vendorName: 'Salesforce Inc.', title: 'Salesforce CRM Enterprise License',
    status: 'active', contractType: 'SaaS License', value: 48000, currency: 'USD',
    startDate: '2024-01-01', endDate: '2026-07-15', autoRenewal: true, noticePeriodDays: 60,
    aiRiskScore: 'low', governingLaw: 'California, USA', paymentTerms: 'Annual upfront',
    aiSummary: 'Standard enterprise SaaS agreement with automatic renewal clause. 60-day notice required to terminate. Value within normal market range. No unusual liability clauses detected.',
    createdAt: '2024-01-01',
  },
  {
    id: 'c2', vendorId: 'v2', vendorName: 'AWS (Amazon Web Services)', title: 'AWS Enterprise Discount Program',
    status: 'active', contractType: 'Cloud Services', value: 120000, currency: 'USD',
    startDate: '2023-06-01', endDate: '2026-05-31', autoRenewal: false, noticePeriodDays: 90,
    aiRiskScore: 'low', governingLaw: 'Washington, USA', paymentTerms: 'Monthly usage-based',
    aiSummary: 'EDP agreement committing to minimum spend. Competitive pricing achieved. Data residency in us-east-1 confirmed. Termination requires 90-day notice with exit fee of 25% of remaining commitment.',
    createdAt: '2023-06-01',
  },
  {
    id: 'c3', vendorId: 'v3', vendorName: 'Gartner Advisory', title: 'Gartner Research & Advisory Services',
    status: 'expiring', contractType: 'Professional Services', value: 48000, currency: 'USD',
    startDate: '2024-07-01', endDate: '2026-07-25', autoRenewal: true, noticePeriodDays: 30,
    aiRiskScore: 'medium', governingLaw: 'Connecticut, USA', paymentTerms: 'Semi-annual',
    aiSummary: 'Advisory retainer with automatic renewal. Medium risk due to price escalation clause of up to 8% per year. Limited deliverable commitments in SoW. Early termination fee applies.',
    createdAt: '2024-07-01',
  },
  {
    id: 'c4', vendorId: 'v4', vendorName: 'HubSpot Ltd.', title: 'HubSpot Marketing Hub Professional',
    status: 'active', contractType: 'SaaS License', value: 24000, currency: 'USD',
    startDate: '2024-03-15', endDate: '2027-03-14', autoRenewal: true, noticePeriodDays: 30,
    aiRiskScore: 'low', governingLaw: 'Ireland', paymentTerms: 'Annual upfront',
    aiSummary: 'Standard marketing platform license. GDPR-compliant data processing agreement included. Auto-renewal with 30-day cancellation window. No unusual clauses detected.',
    createdAt: '2024-03-15',
  },
  {
    id: 'c5', vendorId: 'v5', vendorName: 'Kroll Risk Advisory', title: 'Vendor Due Diligence & Risk Assessment',
    status: 'active', contractType: 'Professional Services', value: 62000, currency: 'USD',
    startDate: '2024-09-01', endDate: '2026-08-31', autoRenewal: false, noticePeriodDays: 60,
    aiRiskScore: 'high', governingLaw: 'England & Wales', paymentTerms: 'Quarterly',
    aiSummary: 'High-risk advisory contract with broad IP assignment clauses favoring vendor. Indemnification scope is wide. Recommend legal review before next renewal. Data sharing provisions may conflict with GDPR.',
    createdAt: '2024-09-01',
  },
  {
    id: 'c6', vendorId: 'v6', vendorName: 'Stripe Payments', title: 'Stripe Enterprise Payment Processing',
    status: 'active', contractType: 'Payment Processing', value: 18000, currency: 'USD',
    startDate: '2024-11-01', endDate: '2027-10-31', autoRenewal: true, noticePeriodDays: 30,
    aiRiskScore: 'low', governingLaw: 'Ireland', paymentTerms: 'Monthly (0.15% per transaction)',
    aiSummary: 'Standard enterprise payment processing agreement with negotiated rates. PCI DSS compliance confirmed. No lock-in beyond notice period. Dispute resolution process is straightforward.',
    createdAt: '2024-11-01',
  },
  {
    id: 'c7', vendorId: 'v1', vendorName: 'Salesforce Inc.', title: 'Salesforce Service Cloud Add-on',
    status: 'draft', contractType: 'SaaS License', value: 36000, currency: 'USD',
    startDate: '2026-08-01', endDate: '2027-07-31', autoRenewal: true, noticePeriodDays: 60,
    aiRiskScore: 'medium', governingLaw: 'California, USA', paymentTerms: 'Annual upfront',
    aiSummary: 'Pending review. Terms appear standard but pricing is 12% above market rate for equivalent features.',
    createdAt: '2026-06-10',
  },
  {
    id: 'c8', vendorId: 'v3', vendorName: 'Gartner Advisory', title: 'Executive Peer Connect Program',
    status: 'expired', contractType: 'Professional Services', value: 15000, currency: 'USD',
    startDate: '2023-01-01', endDate: '2024-12-31', autoRenewal: false, noticePeriodDays: 30,
    aiRiskScore: 'low', governingLaw: 'Connecticut, USA', paymentTerms: 'Annual',
    aiSummary: 'Expired peer networking program. No outstanding obligations. Archive recommended.',
    createdAt: '2023-01-01',
  },
];

// ─── Obligations ───────────────────────────────────────────────────────────────
export const OBLIGATIONS: Obligation[] = [
  { id: 'o1', contractId: 'c3', contractTitle: 'Gartner Research & Advisory Services', vendorName: 'Gartner Advisory', type: 'notice', description: 'Send non-renewal notice to Gartner (30-day window)', dueDate: '2026-06-25', status: 'overdue', assignedTo: 'Priya Singh' },
  { id: 'o2', contractId: 'c1', contractTitle: 'Salesforce CRM Enterprise License', vendorName: 'Salesforce Inc.', type: 'renewal', description: 'Decision due: renew or terminate Salesforce CRM license', dueDate: '2026-07-01', status: 'pending', assignedTo: 'Priya Singh' },
  { id: 'o3', contractId: 'c5', contractTitle: 'Vendor Due Diligence & Risk Assessment', vendorName: 'Kroll Risk Advisory', type: 'review', description: 'Legal review of IP assignment and GDPR clauses', dueDate: '2026-07-10', status: 'pending', assignedTo: 'Rahul Mehta' },
  { id: 'o4', contractId: 'c2', contractTitle: 'AWS Enterprise Discount Program', vendorName: 'AWS', type: 'payment', description: 'Q3 minimum spend commitment review', dueDate: '2026-07-15', status: 'pending', assignedTo: 'Sneha Kapoor' },
  { id: 'o5', contractId: 'c4', contractTitle: 'HubSpot Marketing Hub Professional', vendorName: 'HubSpot Ltd.', type: 'payment', description: 'Annual renewal payment due', dueDate: '2026-08-15', status: 'pending', assignedTo: 'Sneha Kapoor' },
  { id: 'o6', contractId: 'c7', contractTitle: 'Salesforce Service Cloud Add-on', vendorName: 'Salesforce Inc.', type: 'audit', description: 'Internal approval sign-off required before activation', dueDate: '2026-07-25', status: 'pending', assignedTo: 'Priya Singh' },
  { id: 'o7', contractId: 'c6', contractTitle: 'Stripe Enterprise Payment Processing', vendorName: 'Stripe Payments', type: 'review', description: 'Annual security and compliance review', dueDate: '2026-09-01', status: 'pending', assignedTo: 'Rahul Mehta' },
  { id: 'o8', contractId: 'c2', contractTitle: 'AWS Enterprise Discount Program', vendorName: 'AWS', type: 'renewal', description: 'Begin EDP renewal negotiation (90-day lead time)', dueDate: '2026-08-31', status: 'pending', assignedTo: 'Rahul Mehta' },
  { id: 'o9', contractId: 'c1', contractTitle: 'Salesforce CRM Enterprise License', vendorName: 'Salesforce Inc.', type: 'payment', description: 'Q2 invoice payment', dueDate: '2026-06-01', status: 'completed', assignedTo: 'Sneha Kapoor' },
];

// ─── Alerts ────────────────────────────────────────────────────────────────────
export const ALERTS: Alert[] = [
  { id: 'a1', contractId: 'c3', contractTitle: 'Gartner Research & Advisory Services', vendorName: 'Gartner Advisory', alertType: 'renewal_7', scheduledFor: '2026-06-18T09:00:00Z', sentAt: '2026-06-18T09:00:05Z', channel: 'email', read: false },
  { id: 'a2', contractId: 'c1', contractTitle: 'Salesforce CRM Enterprise License', vendorName: 'Salesforce Inc.', alertType: 'renewal_30', scheduledFor: '2026-06-15T09:00:00Z', sentAt: '2026-06-15T09:00:03Z', channel: 'email', read: false },
  { id: 'a3', contractId: 'c2', contractTitle: 'AWS Enterprise Discount Program', vendorName: 'AWS', alertType: 'renewal_90', scheduledFor: '2026-06-01T09:00:00Z', sentAt: '2026-06-01T09:00:02Z', channel: 'in_app', read: true },
  { id: 'a4', contractId: 'o1', contractTitle: 'Gartner Research & Advisory Services', vendorName: 'Gartner Advisory', alertType: 'obligation_due', scheduledFor: '2026-06-25T09:00:00Z', sentAt: null, channel: 'in_app', read: false },
  { id: 'a5', contractId: 'c5', contractTitle: 'Vendor Due Diligence & Risk Assessment', vendorName: 'Kroll Risk Advisory', alertType: 'renewal_90', scheduledFor: '2026-05-31T09:00:00Z', sentAt: '2026-05-31T09:00:01Z', channel: 'email', read: true },
];

// ─── Audit Logs ────────────────────────────────────────────────────────────────
export const AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', user: 'Priya Singh', action: 'contract.created', entityType: 'Contract', entityId: 'c7', entityName: 'Salesforce Service Cloud Add-on', oldValue: null, newValue: '{"status":"draft"}', createdAt: '2026-06-10T14:32:11Z' },
  { id: 'al2', user: 'Rahul Mehta', action: 'obligation.updated', entityType: 'Obligation', entityId: 'o3', entityName: 'Legal review of IP clauses', oldValue: '{"status":"pending"}', newValue: '{"status":"pending","assignedTo":"Rahul Mehta"}', createdAt: '2026-06-12T09:15:00Z' },
  { id: 'al3', user: 'Sneha Kapoor', action: 'obligation.completed', entityType: 'Obligation', entityId: 'o9', entityName: 'Q2 invoice payment', oldValue: '{"status":"pending"}', newValue: '{"status":"completed"}', createdAt: '2026-06-01T11:00:00Z' },
  { id: 'al4', user: 'System', action: 'alert.sent', entityType: 'Alert', entityId: 'a1', entityName: 'Renewal alert — Gartner', oldValue: null, newValue: '{"channel":"email","sentAt":"2026-06-18T09:00:05Z"}', createdAt: '2026-06-18T09:00:05Z' },
  { id: 'al5', user: 'Priya Singh', action: 'contract.updated', entityType: 'Contract', entityId: 'c5', entityName: 'Vendor Due Diligence & Risk Assessment', oldValue: '{"aiRiskScore":"medium"}', newValue: '{"aiRiskScore":"high"}', createdAt: '2026-06-20T16:45:00Z' },
  { id: 'al6', user: 'Rahul Mehta', action: 'vendor.created', entityType: 'Vendor', entityId: 'v6', entityName: 'Stripe Payments', oldValue: null, newValue: '{"name":"Stripe Payments"}', createdAt: '2024-11-01T10:00:00Z' },
  { id: 'al7', user: 'Priya Singh', action: 'contract.archived', entityType: 'Contract', entityId: 'c8', entityName: 'Executive Peer Connect Program', oldValue: '{"status":"expired"}', newValue: '{"status":"archived"}', createdAt: '2026-06-22T08:30:00Z' },
  { id: 'al8', user: 'System', action: 'alert.sent', entityType: 'Alert', entityId: 'a2', entityName: 'Renewal alert — Salesforce', oldValue: null, newValue: '{"channel":"email","sentAt":"2026-06-15T09:00:03Z"}', createdAt: '2026-06-15T09:00:03Z' },
];

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const DASHBOARD_STATS: DashboardStats = {
  activeContracts: 5,
  totalSpend: 356000,
  expiringIn30: 2,
  expiringIn90: 4,
  upcomingBilling: 72000,
  spendByCategory: [
    { category: 'Cloud Infra', amount: 120000 },
    { category: 'CRM/Sales', amount: 84000 },
    { category: 'Consulting', amount: 63000 },
    { category: 'Marketing', amount: 24000 },
    { category: 'Payments', amount: 18000 },
    { category: 'Other', amount: 47000 },
  ],
  contractStatusBreakdown: [
    { status: 'Active', count: 5 },
    { status: 'Expiring', count: 1 },
    { status: 'Draft', count: 1 },
    { status: 'Expired', count: 1 },
  ],
};

// ─── Approvals ─────────────────────────────────────────────────────────────────
export const APPROVALS = [
  {
    id: 'ap1',
    contractId: 'c7',
    contractTitle: 'Salesforce Service Cloud Add-on',
    vendorName: 'Salesforce Inc.',
    requestedBy: 'Priya Singh',
    requestedAt: '2026-06-10T14:32:11Z',
    value: 36000,
    chain: [
      { name: 'Rahul Mehta', role: 'Procurement Manager', status: 'approved', at: '2026-06-11T10:00:00Z' },
      { name: 'Sneha Kapoor', role: 'CFO', status: 'pending', at: null },
      { name: 'Board Sign-off', role: 'Director', status: 'pending', at: null },
    ],
  },
];
