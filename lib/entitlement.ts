import { supabase } from './supabase';

export async function getEntitledLeadIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('lead_access')
    .select('lead_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching entitlements:', error);
    return new Set();
  }

  return new Set(data?.map((item) => item.lead_id) || []);
}

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching credits:', error);
    return 0;
  }

  return data?.reduce((sum, item) => sum + item.amount, 0) || 0;
}
