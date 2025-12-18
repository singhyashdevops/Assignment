/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from './types/types';
import { fetchProducts } from './utils/fetcher';
import { categoryMenu, pricePresets, formatCategoryName, filterAndSortProducts, maxLimit, productNo } from './utils/productUtils';
import ProductCard from './components/ProductCard';
import GridListView from './components/GridListView';
import Skeleton from './components/Skeleton';
import { toast } from 'sonner';

export default function HomeClient({ preloadedProducts }: { preloadedProducts: Product[] }) {
  const queryParams = useSearchParams();
  const navigation = useRouter();

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const firstRenderFlag = useRef(true);

  const [itemList, setItemList] = useState<Product[]>(preloadedProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');
  const [offset, setOffset] = useState(preloadedProducts.length || 0);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({
    categories: queryParams.get('categories')?.split(',').filter(Boolean) || [] as string[],
    minPrice: Number(queryParams.get('minPrice')) || 0,
    maxPrice: Number(queryParams.get('maxPrice')) || maxLimit,
    minRating: Number(queryParams.get('minRating')) || 0,
    sortBy: queryParams.get('sortBy') || '',
    search: queryParams.get('search') || ''
  });
  const [searchText, setSearchText] = useState(currentFilters.search);

  const applyFilter = (filters: typeof currentFilters) => {
    setCurrentFilters(filters);
    updateQueryUrl(filters);
  };

  const updateQueryUrl = useCallback((filters: typeof currentFilters) => {
    const params = new URLSearchParams();
    if (filters.categories.length) {
      params.set('categories', filters.categories.join(','));
      params.set('minPrice', filters.minPrice.toString());
      params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.minRating > 0) {
      params.set('minRating', filters.minRating.toString())
    }
    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy)
    }
    if (filters.search) {
      params.set('search', filters.search)
    }
    navigation.push(`/?${params.toString()}`, { scroll: false });
  }, [navigation]);

  const fetchItems = useCallback(async (reset = false) => {
    if (isLoading || (!moreAvailable && !reset)) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const data = await fetchProducts({
        limit: productNo,
        skip: currentOffset,
        categories: currentFilters.categories.length <= 1 ? currentFilters.categories : [],
        signal: controller.signal,
      });
      const filteredItems = filterAndSortProducts(data.products, currentFilters);
      setItemList(prev => reset ? filteredItems : [...prev, ...filteredItems]);
      setOffset(currentOffset + data.products.length);
      setMoreAvailable(data.products.length === productNo);
    } catch (err: any) {
      if (err.name !== 'AbortError') setMoreAvailable(false);
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, offset, currentFilters, moreAvailable]);

  const handleSearchInput = (text: string) => {
    setSearchText(text);
    searchDebounceRef.current && clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const updated = { ...currentFilters, search: text };
      setCurrentFilters(updated);
      updateQueryUrl(updated);
    }, 500);
  };

  useEffect(() => {
    if (firstRenderFlag.current) {
      firstRenderFlag.current = false;
      return;
    }
    setOffset(0);
    setMoreAvailable(true);
    fetchItems(true);
  }, [currentFilters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && !isLoading && moreAvailable && fetchItems(),
      { threshold: 0.4 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect();
  }, [fetchItems, isLoading, moreAvailable]);

  const copyPresetLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      toast.success("Preset Link Copied!", {
        description: "Save this URL to return to these filters later."
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 md:p-5 bg-gray-50 min-h-screen">

      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-19 space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

          <section className="relative">
            <h3 className="font-bold text-sm mb-2">Search</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchText}
              onChange={e => handleSearchInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange outline-none text-sm transition-all pr-8"
            />
            {searchText && (
              <button
                onClick={() => handleSearchInput('')}
                className="absolute right-2 top-9 text-gray-900 hover:text-gray-600 font-bold"
              >
                ×
              </button>
            )}
          </section>

          <section>
            <h3 className="font-bold text-sm mb-2">Price</h3>
            <div className="grid grid-cols-2 gap-2">
              {pricePresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => applyFilter({ ...currentFilters, minPrice: preset.min, maxPrice: preset.max })}
                  className={`text-[10px] py-2 px-1 border rounded-md transition-all ${currentFilters.minPrice === preset.min && currentFilters.maxPrice === preset.max
                    ? 'bg-amazon-yellow border-amazon-orange font-bold text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-sm mb-2">★ Ratings</h3>
            <div className="flex flex-row md:flex-row overflow-hidden gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb- scrollbar-hide ">
              {[4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => applyFilter({ ...currentFilters, minRating: star })}
                  className={`flex bg-red-200 items-center gap-1.5 text-xs whitespace-nowrap px-2 py-1 md:px-0 md:py-0 border md:border-0 rounded-full  transition-all ${currentFilters.minRating === star ? 'bg-amazon-orange/10 border-amazon-orange text-amazon-orange font-bold' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                >
                  <span className="text-amazon-orange text-sm leading-none px-2 py-1 ">
                    {"★".repeat(star)}{"☆".repeat(5 - star)}
                  </span>
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
                    checked={currentFilters.categories.includes(cat)}
                    onChange={() => {
                      const updatedCats = currentFilters.categories.includes(cat)
                        ? currentFilters.categories.filter(c => c !== cat)
                        : [...currentFilters.categories, cat];
                      applyFilter({ ...currentFilters, categories: updatedCats });
                    }}
                  />
                  <span className="group-hover:underline text-gray-700">{formatCategoryName(cat)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="pt-2 border-t border-gray-100">
            <button
              onClick={copyPresetLink}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-amazon-orange bg-amazon-orange/5 border border-amazon-orange/20 rounded-lg hover:bg-amazon-orange/10 transition-colors"
            >
              <span>🔗</span> Save Current View (Copy Link)
            </button>

            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Click to copy a shareable link of your current filters.
            </p>
          </section>

        </div>
      </aside>

      <main className="flex-1 space-y-4">

        {(currentFilters.categories.length || currentFilters.minPrice > 0 || currentFilters.maxPrice < maxLimit || currentFilters.minRating > 0 || currentFilters.search) && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentFilters.search && (
              <span className="flex items-center bg-amazon-orange/10 text-amazon-orange px-2 py-1 rounded-full text-xs">
                {currentFilters.search}
                <button className="ml-1 font-bold" onClick={() => applyFilter({ ...currentFilters, search: '' })}>×</button>
              </span>
            )}

            {currentFilters.categories.map(cat => (
              <span key={cat} className="flex items-center bg-amazon-orange/10 text-amazon-orange px-2 py-1 rounded-full text-xs">
                {formatCategoryName(cat)}
                <button className="ml-1 font-bold" onClick={() => applyFilter({ ...currentFilters, categories: currentFilters.categories.filter(c => c !== cat) })}>×</button>
              </span>
            ))}

            {(currentFilters.minPrice > 0 || currentFilters.maxPrice < maxLimit) && (
              <span className="flex items-center bg-amazon-orange/10 text-amazon-orange px-2 py-1 rounded-full text-xs">
                ${currentFilters.minPrice} - ${currentFilters.maxPrice}
                <button className="ml-1 font-bold" onClick={() => applyFilter({ ...currentFilters, minPrice: 0, maxPrice: maxLimit })}>×</button>
              </span>
            )}

            {currentFilters.minRating > 0 && (
              <span className="flex items-center bg-amazon-orange/10 text-amazon-orange px-2 py-1 rounded-full text-xs">
                {currentFilters.minRating}★ & Up
                <button className="ml-1 font-bold" onClick={() => applyFilter({ ...currentFilters, minRating: 0 })}>×</button>
              </span>
            )}

            {currentFilters && (
              <span className="flex items-center bg-amber-800 text-white px-2 py-1 rounded-full text-xs">
                <button
                  onClick={() => [window.location.href = '/', toast.success("Filter Removed")]}>
                  Clear All
                </button>
              </span>
            )}

          </div>
        )}

        <header className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div>
            <h2 className="text-lg md:text-xl font-bold italic text-gray-800">Results</h2>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{itemList.length} Products Found</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <select
              value={currentFilters.sortBy}
              onChange={e => applyFilter({ ...currentFilters, sortBy: e.target.value })}
              className="text-xs md:text-sm border border-gray-400 bg-gray-50 px-2 md:px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange cursor-pointer"
            >
              <option value="">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="alpha">Name: A - Z</option>
            </select>
            <GridListView view={layoutView} setView={setLayoutView} />
          </div>
        </header>

        <div
          className={`${layoutView === 'grid'
            ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-4"
            }`}>
          {itemList.map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} product={product} view={layoutView} />
          ))}

          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`loading-skeleton-${i}`} view={layoutView} />
          ))}
        </div>

        {!isLoading && itemList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No products match your filters.</p>
            <button onClick={() => window.location.href = '/'} className="mt-2 text-amazon-orange font-bold text-sm underline">Reset search</button>
          </div>
        )}
        {moreAvailable && <div ref={loaderRef} className="h-10 w-full" />}
      </main>
    </div>
  );
}
