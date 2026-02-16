'use client'

import React from 'react'
import { Lead } from '@/types'

interface PropertyCardProps {
  lead: Lead
  entitled: boolean
  selected: boolean
  onToggle: () => void
}

export default function PropertyCard({
  lead,
  entitled,
  selected,
  onToggle
}: PropertyCardProps) {

  const imageUrl = lead.meta?.image_url

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt={lead.company}
            className={`w-full h-52 object-cover transition-all duration-300 ${
              !entitled ? 'blur-sm brightness-75' : ''
            }`}
          />

          {!entitled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold shadow">
                🔒 Unlock to View
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-6 space-y-3">

        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {entitled ? lead.company : '••••••••••'}
          </h3>

          {!entitled && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4"
            />
          )}
        </div>

        <div className="text-sm text-gray-600">
          {entitled ? lead.email : 'Locked'}
        </div>

        <div className="text-sm text-gray-600">
          {entitled ? lead.phone : 'Locked'}
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            Score {lead.intelligence_score}
          </span>

          {lead.meta?.property_value && (
            <span className="text-sm font-semibold text-gray-800">
              ${Number(lead.meta.property_value).toLocaleString()}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
