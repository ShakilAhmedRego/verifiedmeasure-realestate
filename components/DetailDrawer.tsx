'use client';

import { Lead } from '@/types';
import { formatCurrency, maskCompany, maskEmail, maskPhone } from '@/lib/format';

interface DetailDrawerProps {
  lead: Lead | null;
  isEntitled: boolean;
  onClose: () => void;
}

export default function DetailDrawer({ lead, isEntitled, onClose }: DetailDrawerProps) {
  if (!lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isEntitled ? lead.company : maskCompany(lead.company)}
          </h3>
          {isEntitled && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Entitled
            </span>
          )}
        </div>

        <div className="space-y-4">
          <DetailRow label="Property Value" value={formatCurrency(lead.meta?.property_value)} />
          <DetailRow label="Owner Type" value={lead.meta?.owner_type || 'Unknown'} />
          <DetailRow label="City" value={lead.meta?.city || 'Unknown'} />
          <DetailRow label="Last Sale" value={lead.meta?.last_sale || 'N/A'} />
          <DetailRow label="Location" value={lead.meta?.location || 'N/A'} />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Intelligence Score</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">{lead.intelligence_score}</span>
            <span className="text-sm text-gray-600">/ 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-brand-emerald to-brand-blue h-3 rounded-full transition-all duration-300"
              style={{ width: `${lead.intelligence_score}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
          <DetailRow
            label="Email"
            value={isEntitled ? (lead.email || 'N/A') : maskEmail(lead.email)}
          />
          <DetailRow
            label="Phone"
            value={isEntitled ? (lead.phone || 'N/A') : maskPhone(lead.phone)}
          />
          <DetailRow
            label="Website"
            value={isEntitled ? (lead.website || 'N/A') : '•••'}
          />
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h4>
          <DetailRow label="Stage" value={lead.stage || 'N/A'} />
          <DetailRow label="Workflow" value={lead.workflow} />
          <DetailRow label="Priority" value={lead.is_high_priority ? 'High' : 'Normal'} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
