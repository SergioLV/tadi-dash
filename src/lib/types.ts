export interface Visit {
  id?: string;
  timestamp: string;
  userAgent: string;
  referrer: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  ip?: string;
  // Parsed fields
  browser?: string;
  os?: string;
  device?: string;
}

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  age: number;
  rut: string;
  dependents: number;
  currentIsapre: string;
  monthlyIncome: number;
  region: string;
  reason: string;
  timestamp: string;
}

export interface DashboardStats {
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  conversionRate: number;
}
