import { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categoryApi';

const TransactionFilters = ({ filters, onFilterChange, onClear }) => {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 0 });
  };

  const typeOptions = [
    { value: '', label: 'All' },
    { value: 'INCOME', label: 'Income' },
    { value: 'EXPENSE', label: 'Expense' },
  ];

  const hasFilters = filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.search;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
      {/* Row 1: Search + Type toggle (always visible) */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('type', opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                (filters.type || '') === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Expand filters (mobile) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        {/* Clear (desktop) */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Row 2: Category + Dates (expandable on mobile, always on desktop) */}
      <div className={`${expanded ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-gray-100 sm:border-0 sm:pt-0`}>
        {/* Category */}
        <select
          value={filters.categoryId || ''}
          onChange={(e) => handleChange('categoryId', e.target.value ? Number(e.target.value) : '')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white sm:min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2 flex-1">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear (mobile) */}
        {hasFilters && (
          <button
            onClick={() => { onClear(); setExpanded(false); }}
            className="sm:hidden flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
