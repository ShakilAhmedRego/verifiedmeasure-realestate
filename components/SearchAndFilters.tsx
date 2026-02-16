'use client';

import { useState } from 'react';

interface SearchAndFiltersProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export interface FilterState {
  minScore: number;
  maxScore: number;
  cities: string[];
  ownerTypes: string[];
  minValue: number;
  maxValue: number;
  showEntitled: boolean;
  showUnentitled: boolean;
}

export default function SearchAndFilters({
  onSearchChange,
  onFilterChange,
  totalCount,
  filteredCount,
}: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      minScore: 0,
      maxScore: 100,
      cities: [],
      ownerTypes: [],
      minValue: 0,
      maxValue: 10000000,
      showEntitled: true,
      showUnentitled: true,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setSearchQuery('');
    onSearchChange('');
  };

  const hasActiveFilters = 
    filters.minScore > 0 ||
    filters.maxScore < 100 ||
    filters.cities.length > 0 ||
    filters.ownerTypes.length > 0 ||
    filters.minValue > 0 ||
    filters.maxValue < 10000000 ||
    !filters.showEntitled ||
    !filters.showUnentitled ||
    searchQuery.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search properties by location, city, or owner type..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
            showFilters
              ? 'bg-brand-blue text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-brand-blue rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Intelligence Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intelligence Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => updateFilter('minScore', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore}
                  onChange={(e) => updateFilter('maxScore', parseInt(e.target.value) || 100)}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Property Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Value
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minValue}
                  onChange={(e) => updateFilter('minValue', parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxValue}
                  onChange={(e) => updateFilter('maxValue', parseInt(e.target.value) || 10000000)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showEntitled}
                    onChange={(e) => updateFilter('showEntitled', e.target.checked)}
                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Entitled</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showUnentitled}
                    onChange={(e) => updateFilter('showUnentitled', e.target.checked)}
                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Unentitled</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalCount}</span> properties
        </p>
      </div>
    </div>
  );
}
