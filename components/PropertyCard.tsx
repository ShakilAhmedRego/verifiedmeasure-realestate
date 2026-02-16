'use client';

import { Lead } from '@/types';
import { formatCurrency, maskCompany, maskEmail, maskPhone } from '@/lib/format';

interface PropertyCardProps {
  lead: Lead;
  isEntitled: boolean;
  isSelected: boolean;
  onToggleSelect: (leadId: string) => void;
}

export default function PropertyCard({ lead, isEntitled, isSelected, onToggleSelect }: PropertyCardProps) {
  const propertyValue = lead.meta?.property_value;
  const ownerType = lead.meta?.owner_type || 'Unknown';
  const city = lead.meta?.city || 'Unknown';
  const lastSale = lead.meta?.last_sale;
  const imageUrl = lead.meta?.image_url;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt={lead.company}
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isEntitled ? lead.company : maskCompany(lead.company)}
          </h3>
          {isEntitled && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              ✓ Entitled
            </span>
          )}
        </div>
        
        {!isEntitled ? (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(lead.id)}
              className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-2 focus:ring-brand-blue cursor-pointer"
            />
          </label>
        ) : (
          <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Property Value</span>
          <span className="text-sm font-semibold text-gray-900">
            {propertyValue ? formatCurrency(propertyValue) : 'N/A'}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {city}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
            {ownerType}
          </span>
        </div>

        {lastSale && (
          <div className="text-xs text-gray-500">
            Last Sale: {lastSale}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Intelligence Score</span>
            <span className="text-xs font-semibold text-gray-900">{lead.intelligence_score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-emerald to-brand-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${lead.intelligence_score}%` }}
            />
          </div>
        </div>

        {!isEntitled && (
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-400">{maskEmail(lead.email)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="text-gray-400">{maskPhone(lead.phone)}</span>
            </div>
          </div>
        )}

        {isEntitled && (
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-900 font-medium">{lead.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="text-gray-900 font-medium">{lead.phone || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
