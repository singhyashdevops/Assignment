/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from './types/types';
import { fetchProducts } from './utils/fetcher';
import { categoryMenu, pricePresets, formatCategoryName, filterAndSortProducts, MAX_PRICE_LIMIT, PRODUCTS_PER_FETCH } from './utils/productUtils';
import ProductCard from './components/ProductCard';
import GridListView from './components/GridListView';
import Skeleton from './components/Skeleton';

export default function HomeClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstRender = useRef(true);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [skip, setSkip] = useState(initialProducts.length || 0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [] as string[],
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || MAX_PRICE_LIMIT,
    minRating: Number(searchParams.get('minRating')) || 0,
    sortBy: searchParams.get('sortBy') || '',
    search: searchParams.get('search') || ''
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const applyFiltersToUrl = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.categories.length) params.set('categories', newFilters.categories.join(','));
    params.set('minPrice', newFilters.minPrice.toString());
    params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.minRating > 0) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.search) params.set('search', newFilters.search);

    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router]);

  const loadProducts = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const currentSkip = reset ? 0 : skip;
      const data = await fetchProducts({
        limit: PRODUCTS_PER_FETCH,
        skip: currentSkip,
        categories: filters.categories.length === 1 ? filters.categories : [],
        signal: controller.signal,
      });

      const processedItems = filterAndSortProducts(data.products, filters);
      setProducts(prev => (reset ? processedItems : [...prev, ...processedItems]));
      setSkip(currentSkip + data.products.length);
      setHasMore(data.products.length === PRODUCTS_PER_FETCH);
      
    } catch (err: any) {
      if (err.name !== 'AbortError') setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, skip, filters, hasMore]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const update = { ...filters, search: val };
      setFilters(update);
      applyFiltersToUrl(update);
    }, 500);
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadProducts(true);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) loadProducts();
    }, { threshold: 0.1 });
    if (observerTargetRef.current) observer.observe(observerTargetRef.current);
    return () => observer.disconnect();
  }, [loadProducts, loading, hasMore]);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 md:p-5 bg-gray-50 min-h-screen">
      
      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-24 space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
          <section>
            <h3 className="font-bold text-sm mb-2">Search</h3>
            <input
              type="text" 
              placeholder="Search products..." 
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange outline-none text-sm transition-all"
            />
          </section>

          <section>
            <h3 className="font-bold text-sm mb-2">Price</h3>
            <div className="grid grid-cols-2 gap-2">
              {pricePresets.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    const update = { ...filters, minPrice: p.min, maxPrice: p.max };
                    setFilters(update);
                    applyFiltersToUrl(update);
                  }}
                  className={`text-[10px] py-2 px-1 border rounded-md transition-all ${filters.minPrice === p.min && filters.maxPrice === p.max
                    ? 'bg-amazon-yellow border-amazon-orange font-bold text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-sm mb-2">Reviews</h3>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
              {[4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    const update = { ...filters, minRating: star };
                    setFilters(update);
                    applyFiltersToUrl(update);
                  }}
                  className={`flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 md:px-0 md:py-0 border md:border-0 rounded-full md:rounded-none transition-all ${filters.minRating === star ? 'bg-amazon-orange/10 border-amazon-orange text-amazon-orange font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  <span className="text-amazon-orange text-sm leading-none">
                    {"★".repeat(star)}{"☆".repeat(5 - star)}
                  </span>
                  <span className="hidden md:inline">& Up</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-sm mb-2">Categories</h3>
            <div className="max-h-40 md:max-h-64 overflow-y-auto pr-2 space-y-1 text-xs custom-scrollbar">
              {categoryMenu.map(cat => (
                <label key={cat} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-amazon-orange group">
                  <input
                    type="checkbox" 
                    className="accent-amazon-orange h-3.5 w-3.5 rounded"
                    checked={filters.categories.includes(cat)}
                    onChange={() => {
                      const newCats = filters.categories.includes(cat)
                        ? filters.categories.filter(c => c !== cat)
                        : [...filters.categories, cat];
                      const update = { ...filters, categories: newCats };
                      setFilters(update);
                      applyFiltersToUrl(update);
                    }}
                  />
                  <span className="group-hover:underline text-gray-700">{formatCategoryName(cat)}</span>
                </label>
              ))}
            </div>
          </section>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2 text-xs font-bold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100">
            Clear All
          </button>
          
        </div>
      </aside>
      
      <main className="flex-1 space-y-4">
        <header className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div>
            <h2 className="text-lg md:text-xl font-bold italic text-gray-800">Results</h2>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{products.length} Products Found</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <select
              value={filters.sortBy}
              onChange={(e) => {
                const update = { ...filters, sortBy: e.target.value };
                setFilters(update);
                applyFiltersToUrl(update);
              }}
              className="text-xs md:text-sm border border-gray-300 bg-gray-50 px-2 md:px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange cursor-pointer">
              <option value="">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="alpha">Name: A - Z</option>
            </select>
            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
            <GridListView view={view} setView={setView} />
          </div>
        </header>

        <div className={view === 'grid'
          ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
          : "flex flex-col gap-3 md:gap-4"}>
          {products.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} view={view} />
          ))}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} view={view} />
          ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No products match your filters.</p>
            <button onClick={() => window.location.href = '/'} className="mt-2 text-amazon-orange font-bold text-sm underline">Reset search</button>
          </div>
        )}

        {hasMore && <div ref={observerTargetRef} className="h-10 w-full" />}
      </main>
    </div>
  );
}