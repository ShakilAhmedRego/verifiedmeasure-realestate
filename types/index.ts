export interface Lead {
  id: string;
  company: string;
  website?: string;
  domain?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  stage?: string;
  arr_estimate?: number;
  employees?: number;
  tech_stack?: string[];
  intelligence_score: number;
  workflow: 'new' | 'triaged' | 'qualified' | 'in_sequence' | 'engaged' | 'won' | 'lost' | 'do_not_contact';
  is_high_priority: boolean;
  is_archived: boolean;
  meta: {
    property_value?: number;
    owner_type?: string;
    city?: string;
    last_sale?: string;
    location?: string;
    signal?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface LeadAccess {
  id: string;
  user_id: string;
  lead_id: string;
  granted_at: string;
}

export interface CreditLedger {
  id: string;
  user_id: string;
  amount: number;
  reason?: string;
  ref_type?: string;
  ref_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  role: string;
  created_at: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_companies: number;
  avg_score: number;
}

export interface StageBreakdown {
  stage: string;
  company_count: number;
}
