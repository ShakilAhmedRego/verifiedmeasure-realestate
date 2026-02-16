import { supabase } from '@/lib/supabase';

export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, enabled');

  if (error || !data) {
    console.error('Failed to load feature flags', error);
    return {};
  }

  const flags: Record<string, boolean> = {};

  data.forEach((flag) => {
    flags[flag.key] = flag.enabled;
  });

  return flags;
}
