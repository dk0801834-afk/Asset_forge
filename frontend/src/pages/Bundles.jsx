import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import BundleCard from '../components/BundleCard';

const PRICE_RANGES = [
  { label: 'All prices', min: null, max: null },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: null },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popular', value: 'popular' },
];

export default function Bundles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bundles, setBundles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get('category') || '';
  const priceRange = searchParams.get('price') || '';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') === 'true';

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) {
      params.set('category_slug', activeCategory);
    }
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (featured) params.set('featured_only', 'true');
    const pr = PRICE_RANGES.find((p) => p.label === priceRange);
    if (pr) {
      if (pr.min !== null) params.set('min_price', pr.min);
      if (pr.max !== null) params.set('max_price', pr.max);
    }

    api.get(`/bundles?${params.toString()}`)
      .then((r) => setBundles(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, search, priceRange, sort, featured]);

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  const activeFiltersCount = [activeCategory, priceRange, featured ? 'featured' : ''].filter(Boolean).length + (search ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Browse Bundles</h1>
        <p className="text-dark-400 text-lg">Premium creative assets for every project</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="glass rounded-2xl p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bundles..."
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-brand-500 text-white text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <div className="hidden md:flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="hidden md:flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setParam('category', '')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !activeCategory
                ? 'bg-brand-500 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam('category', c.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === c.slug
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-dark-300 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setParam('featured', e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-brand-500 focus:ring-brand-500"
            />
            Featured only
          </label>
        </div>

        {/* Mobile filters */}
        {showFilters && (
          <div className="md:hidden mt-4 pt-4 border-t border-dark-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParam('category', '')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    !activeCategory ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setParam('category', c.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      activeCategory === c.slug ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300'
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Price</label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setParam('price', p.label === 'All prices' ? '' : p.label)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      priceRange === p.label || (!priceRange && p.label === 'All prices')
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-800 text-dark-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-dark-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setParam('featured', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded bg-dark-700 border-dark-600"
              />
              Featured only
            </label>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-dark-400">Active filters:</span>
          {activeCategory && (
            <button
              onClick={() => setParam('category', '')}
              className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-sm hover:bg-brand-500/30"
            >
              {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          {priceRange && (
            <button
              onClick={() => setParam('price', '')}
              className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-sm hover:bg-brand-500/30"
            >
              {priceRange} <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          {search && (
            <button
              onClick={() => { setSearch(''); setParam('search', ''); }}
              className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-sm hover:bg-brand-500/30"
            >
              "{search}" <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          {featured && (
            <button
              onClick={() => setParam('featured', '')}
              className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-sm hover:bg-brand-500/30"
            >
              Featured <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-dark-400 hover:text-white ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-dark-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-dark-700 rounded w-3/4" />
                <div className="h-4 bg-dark-700 rounded w-1/2" />
                <div className="h-8 bg-dark-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold mb-2">No bundles found</h3>
          <p className="text-dark-400 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bundles.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
      )}
    </div>
  );
}
