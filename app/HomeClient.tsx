/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from './types/types';
import { fetchProducts } from './utils/fetcher';
import { categoryMenu, pricePresets, formatCategoryName, filterAndSortProducts, MAX_PRICE_LIMIT, PRODUCTS_PER_FETCH } from './utils/productUtils';
import ProductCard from './components/ProductCard';
import GridListToggle from './components/GridListView';
import SkeletonLoader from './components/Skeleton';

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
    <div className="flex flex-col md:flex-row gap-5 p-3 lg:p-3 bg-gray-50">
    
      <aside className="w-full md:w-60 shrink-0">
        <div className="sticky top-20 space-y-3 bg-white p-4 rounded-2xl border border-gray-300 shadow-sm">
          <section>
            <h3 className="font-bold text-sm mb-3">Search</h3>
            <div className="relative">
              <input
                type="text" placeholder="Search..." value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded focus:border-amazon-orange outline-none text-sm"
              />
            </div>
          </section>
          <section>
            <h3 className="font-bold text-sm mb-3">Price</h3>
            <div className="grid grid-cols-2 gap-2">
              {pricePresets.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    const update = { ...filters, minPrice: p.min, maxPrice: p.max };
                    setFilters(update);
                    applyFiltersToUrl(update);
                  }}
                  className={`text-[10px] py-2 px-1 border rounded transition-all ${filters.minPrice === p.min && filters.maxPrice === p.max
                    ? 'bg-amazon-yellow border-amazon-orange font-bold'
                    : 'bg-gray-50 border-gray-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-sm mb-3">Categories</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-1 text-xs custom-scrollbar">
              {categoryMenu.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-amazon-orange group">
                  <input
                    type="checkbox" className="accent-amazon-orange h-3 w-3"
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
                  <span className="group-hover:underline">{formatCategoryName(cat)}</span>
                </label>
              ))}
            </div>
          </section>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2 text-xs font-bold border border-gray-300 rounded hover:bg-gray-50">
            Clear Filters
          </button>
        </div>
      </aside>
      
      <section className="flex-1 space-y-4">
        <header className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold italic">Results</h2>
            <p className="text-xs text-gray-500">{products.length} Items found</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filters.sortBy}
              onChange={(e) => {
                const update = { ...filters, sortBy: e.target.value };
                setFilters(update);
                applyFiltersToUrl(update);
              }}
              className="text-sm border border-gray-300 bg-gray-50 px-3 py-1.5 rounded outline-none focus:border-amazon-orange">
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="alpha">A - Z</option>
            </select>
            <GridListToggle view={view} setView={setView} />
          </div>
        </header>
        <div className={view === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "flex flex-col gap-4"}>
          {products.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} view={view} />
          ))}
          {loading && Array.from({ length: 4 }).map((_, i) => (<SkeletonLoader key={i} view={view} />))}
        </div>
        {hasMore && <div ref={observerTargetRef} className="h-20 w-full" />}
      </section>
    </div>
  );
}