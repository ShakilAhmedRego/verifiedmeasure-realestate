'use client';

import { useState } from 'react';
import { Lead } from '@/types';
import PropertyCard from './PropertyCard';
import { supabase } from '@/lib/supabase';
import { showToast } from './Toasts';

interface PropertyGridProps {
  leads: Lead[];
  entitledSet: Set<string>;
  onUnlockComplete: () => void;
  userCredits: number;
}

export default function PropertyGrid({ leads, entitledSet, onUnlockComplete, userCredits }: PropertyGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUnlocking, setIsUnlocking] = useState(false);

  const toggleSelect = (leadId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(leadId)) {
      newSet.delete(leadId);
    } else {
      newSet.add(leadId);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const unentitledIds = leads
      .filter(lead => !entitledSet.has(lead.id))
      .map(lead => lead.id);
    setSelectedIds(new Set(unentitledIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleUnlock = async () => {
    if (selectedIds.size === 0) {
      showToast('Please select properties to unlock', 'error');
      return;
    }

    if (selectedIds.size > userCredits) {
      showToast(`Insufficient credits. Need ${selectedIds.size}, have ${userCredits}`, 'error');
      return;
    }

    setIsUnlocking(true);

    try {
      const selectedArray = Array.from(selectedIds);
      
      const { error } = await supabase.rpc('unlock_leads_secure', {
        p_lead_ids: selectedArray,
      });

      if (error) {
        console.error('Unlock error:', error);
        throw error;
      }

      showToast(`Successfully unlocked ${selectedIds.size} ${selectedIds.size === 1 ? 'property' : 'properties'}!`, 'success');
      setSelectedIds(new Set());
      
      // Force refresh of parent component
      setTimeout(() => {
        onUnlockComplete();
      }, 500);
    } catch (error: any) {
      console.error('Unlock failed:', error);
      showToast(error.message || 'Failed to unlock properties', 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-48 h-48 mb-6 opacity-20">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 30L30 80V170H80V120H120V170H170V80L100 30Z" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties available yet</h3>
        <p className="text-gray-600 text-center max-w-md">
          Add property records to begin intelligence operations.
        </p>
      </div>
    );
  }

  const unentitledCount = leads.filter(lead => !entitledSet.has(lead.id)).length;

  return (
    <div>
      {/* Enhanced Selection Bar */}
      {unentitledCount > 0 && (
        <div className={`mb-6 bg-white rounded-xl border transition-all duration-200 ${
          selectedIds.size > 0 
            ? 'border-brand-blue shadow-lg' 
            : 'border-gray-200 shadow-sm'
        }`}>
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {selectedIds.size > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedIds.size} selected
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-sm text-gray-600">
                    Cost: <span className="font-semibold text-brand-blue">{selectedIds.size}</span> {selectedIds.size === 1 ? 'credit' : 'credits'}
                  </span>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-sm text-gray-600">
                    Available: <span className="font-semibold text-brand-emerald">{userCredits}</span> {userCredits === 1 ? 'credit' : 'credits'}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  Select properties to unlock contact information
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {selectedIds.size === 0 ? (
                <button
                  onClick={selectAll}
                  className="px-4 py-2 text-sm font-medium text-brand-blue hover:bg-blue-50 rounded-lg transition-colors border border-brand-blue"
                >
                  Select All ({unentitledCount})
                </button>
              ) : (
                <>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleUnlock}
                    disabled={isUnlocking || selectedIds.size > userCredits}
                    className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      isUnlocking
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : selectedIds.size > userCredits
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isUnlocking ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Unlocking...
                      </>
                    ) : selectedIds.size > userCredits ? (
                      'Insufficient Credits'
                    ) : (
                      `Unlock ${selectedIds.size}`
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <PropertyCard
            key={lead.id}
            lead={lead}
            isEntitled={entitledSet.has(lead.id)}
            isSelected={selectedIds.has(lead.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
