import { supabase } from './supabase';
import { FeatureFlag } from '@/types';

export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, enabled');

  if (error) {
    console.error('Error fetching feature flags:', error);
    return {};
  }

  const flags: Record<string, boolean> = {};
  data?.forEach((flag: FeatureFlag) => {
    flags[flag.key] = flag.enabled;
  });

  return flags;
}
