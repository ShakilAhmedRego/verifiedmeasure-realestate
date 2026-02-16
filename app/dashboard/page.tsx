'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getEntitledLeadIds, getUserCredits } from '@/lib/entitlement';
import { getFeatureFlags } from '@/lib/flags';
import { Lead, DashboardMetrics, StageBreakdown } from '@/types';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import KpiCards from '@/components/KpiCards';
import PropertyGrid from '@/components/PropertyGrid';
import DetailDrawer from '@/components/DetailDrawer';
import CommandPalette from '@/components/CommandPalette';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import { KpiSkeleton, PropertyCardSkeleton, TableSkeleton } from '@/components/Skeletons';
import { showToast } from '@/components/Toasts';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [entitledSet, setEntitledSet] = useState<Set<string>>(new Set());
  const [credits, setCredits] = useState(0);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [stageBreakdown, setStageBreakdown] = useState<StageBreakdown[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    minScore: 0,
    maxScore: 100,
    cities: [],
    ownerTypes: [],
    minValue: 0,
    maxValue: 10000000,
    showEntitled: true,
    showUnentitled: true,
  });

  // Filtered leads based on search and filters
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          lead.company?.toLowerCase().includes(query) ||
          lead.meta?.city?.toLowerCase().includes(query) ||
          lead.meta?.location?.toLowerCase().includes(query) ||
          lead.meta?.owner_type?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Intelligence score filter
      if (lead.intelligence_score < filters.minScore || lead.intelligence_score > filters.maxScore) {
        return false;
      }

      // Property value filter
      const propertyValue = lead.meta?.property_value || 0;
      if (propertyValue < filters.minValue || propertyValue > filters.maxValue) {
        return false;
      }

      // Entitled/Unentitled filter
      const isEntitled = entitledSet.has(lead.id);
      if (!filters.showEntitled && isEntitled) return false;
      if (!filters.showUnentitled && !isEntitled) return false;

      return true;
    });
  }, [allLeads, searchQuery, filters, entitledSet]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }

    setUser(session.user);
    await loadData(session.user.id);
  };

  const loadData = async (userId: string) => {
    setIsLoading(true);

    try {
      // Load all data in parallel
      const [leadsRes, metricsRes, stagesRes, flagsData] = await Promise.all([
        supabase.from('leads').select('*').order('intelligence_score', { ascending: false }).limit(100),
        supabase.from('dashboard_metrics').select('*').single(),
        supabase.from('stage_breakdown').select('*').order('company_count', { ascending: false }),
        getFeatureFlags(),
      ]);

      // Load entitlements and credits
      const [accessSet, userCredits] = await Promise.all([
        getEntitledLeadIds(userId),
        getUserCredits(userId),
      ]);

      setAllLeads(leadsRes.data || []);
      setEntitledSet(accessSet);
      setCredits(userCredits);
      setMetrics(metricsRes.data);
      setStageBreakdown(stagesRes.data || []);
      setFlags(flagsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockComplete = async () => {
    if (user) {
      showToast('Refreshing data...', 'info');
      await loadData(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNav />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Intelligence</h1>
              <p className="text-gray-600">Enterprise real estate data with secure access control</p>
            </div>

            {flags.ENABLE_ANALYTICS_DASHBOARD && metrics && (
              <KpiCards
                totalProperties={metrics.total_companies}
                avgScore={Number(metrics.avg_score)}
                credits={credits}
                unlocksCount={entitledSet.size}
              />
            )}

            {stageBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Breakdown</h3>
                <div className="space-y-3">
                  {stageBreakdown.map((stage) => (
                    <div key={stage.stage} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-blue h-2 rounded-full"
                            style={{
                              width: `${(stage.company_count / (metrics?.total_companies || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {stage.company_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SearchAndFilters
              onSearchChange={setSearchQuery}
              onFilterChange={setFilters}
              totalCount={allLeads.length}
              filteredCount={filteredLeads.length}
            />

            <PropertyGrid
              leads={filteredLeads}
              entitledSet={entitledSet}
              onUnlockComplete={handleUnlockComplete}
              userCredits={credits}
            />
          </div>
        </main>
      </div>

      {flags.ENABLE_DETAIL_PANEL && selectedLead && (
        <DetailDrawer
          lead={selectedLead}
          isEntitled={entitledSet.has(selectedLead.id)}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {flags.ENABLE_COMMAND_PALETTE && <CommandPalette />}
    </div>
  );
}
