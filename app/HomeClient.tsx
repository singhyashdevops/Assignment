/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Product } from './types/types'
import { fetchProducts } from './utils/fetcher'
import { formatCategoryName, filterAndSortProducts, maxLimit, productNo } from './utils/productUtils'
import ProductCard from './components/ProductCard'
import GridListView from './components/GridListView'
import Skeleton from './components/Skeleton'
import ScrollToTop from './components/ScrollToTopButton'
import { toast } from 'sonner'
import SearchFilter from './components/SearchFilter'
import PriceFilter from './components/PriceFilter'
import RatingFilter from './components/RatingFilter'
import CategoryFilter from './components/CategoryFilter'
import ShareSection from './components/ShareSection'

export default function HomeClient({ preloadedProducts }: { preloadedProducts: Product[] }) {
  const queryParams = useSearchParams()
  const navigation = useRouter()

  const loaderRef = useRef<HTMLDivElement>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const firstRenderFlag = useRef(true)

  const [itemList, setItemList] = useState<Product[]>(preloadedProducts)
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid')
  const [offset, setOffset] = useState(preloadedProducts.length || 0)
  const [moreAvailable, setMoreAvailable] = useState(true)
  const [currentFilters, setCurrentFilters] = useState({
    categories: queryParams.get('categories')?.split(',').filter(Boolean) || [] as string[],
    minPrice: Math.max(0, Number(queryParams.get('minPrice')) || 0),
    maxPrice: queryParams.get('maxPrice') !== null ? Number(queryParams.get('maxPrice')) : maxLimit,
    minRating: Math.min(5, Math.max(0, Number(queryParams.get('minRating')) || 0)),
    sortBy: queryParams.get('sortBy') || '',
    search: queryParams.get('search') || ''
  })
  const [searchText, setSearchText] = useState(currentFilters.search)
  const [mounted, setMounted] = useState(false)
  const currentUrl = mounted ? window.location.href : ''
  const isNegativeRange = currentFilters.maxPrice < currentFilters.minPrice
  const isZeroRange = currentFilters.maxPrice - currentFilters.minPrice === 0

  const applyFilter = (filters: typeof currentFilters) => {
    setCurrentFilters(filters)
    updateQueryUrl(filters)
  }

  const handleSearchInput = (text: string) => {
    setSearchText(text)
    searchDebounceRef.current && clearTimeout(searchDebounceRef.current)

    searchDebounceRef.current = setTimeout(() => {
      const updated = { ...currentFilters, search: text }
      setCurrentFilters(updated)
      updateQueryUrl(updated)
    }, 500)

  }

  const fetchItems = useCallback(async (reset = false) => {
    if (isNegativeRange || isZeroRange) {
      if (reset) {
        setItemList([])
        setMoreAvailable(false)
      }
      return
    }

    if (isLoading || (!moreAvailable && !reset)) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    try {
      const currentOffset = reset ? 0 : offset
      const data = await fetchProducts({
        limit: productNo,
        skip: currentOffset,
        categories: currentFilters.categories.length <= 1 ? currentFilters.categories : [],
        signal: controller.signal,
        search: currentFilters.search,
      })
      const filteredItems = filterAndSortProducts(data.products, currentFilters)
      setItemList(prev => reset ? filteredItems : [...prev, ...filteredItems])
      setOffset(prev => prev + data.products.length)
      setMoreAvailable(data.products.length === productNo)
    } catch (err: any) {
      if (err.name !== 'AbortError') setMoreAvailable(false)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, offset, currentFilters, moreAvailable, isNegativeRange, isZeroRange])

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyPresetLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl)
      toast.success("Preset Link Copied!", {
        description: "Save this URL to return to these filters later."
      })
    }
  }

  const updateQueryUrl = useCallback((filters: typeof currentFilters) => {
    const params = new URLSearchParams()
    if (filters.categories.length) params.set('categories', filters.categories.join(','))
    params.set('minPrice', filters.minPrice.toString())
    params.set('maxPrice', filters.maxPrice.toString())
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.search) params.set('search', filters.search)
    navigation.push(`/?${params.toString()}`, { scroll: false })
  }, [navigation])

  useEffect(() => {
    if (firstRenderFlag.current) {
      firstRenderFlag.current = false;
      return
    }
    setOffset(0)
    setMoreAvailable(true)
    fetchItems(true)
  }, [currentFilters])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && !isLoading && moreAvailable && fetchItems(),
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchItems, isLoading, moreAvailable])

  useEffect(() => {
    setCurrentFilters({
      categories: queryParams.get('categories')?.split(',').filter(Boolean) || [],
      minPrice: Number(queryParams.get('minPrice')) || 0,
      maxPrice: queryParams.get('maxPrice') !== null ? Number(queryParams.get('maxPrice')) : maxLimit,
      minRating: Number(queryParams.get('minRating')) || 0,
      sortBy: queryParams.get('sortBy') || '',
      search: queryParams.get('search') || ''
    })
  }, [queryParams])

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 md:p-2 bg-amazon-bg min-h-screen">
      <ScrollToTop visible={visible} />
      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-19 space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <SearchFilter searchText={searchText} onSearch={handleSearchInput} />
          <PriceFilter minPrice={currentFilters.minPrice} maxPrice={currentFilters.maxPrice} onChange={(min, max) => applyFilter({ ...currentFilters, minPrice: min, maxPrice: max })} />
          <RatingFilter minRating={currentFilters.minRating} onChange={r => applyFilter({ ...currentFilters, minRating: r })} />
          <CategoryFilter selected={currentFilters.categories} onChange={c => applyFilter({ ...currentFilters, categories: c })} />
          <ShareSection currentUrl={currentUrl} onCopy={copyPresetLink} />
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
              <span className={`flex items-center px-2 py-1 rounded-full text-xs ${isNegativeRange ? 'bg-red-100 text-red-700' : 'bg-amazon-orange/10 text-amazon-orange'}`}>
                {isNegativeRange ? "Invalid Price Range" : `$${currentFilters.minPrice} - $${currentFilters.maxPrice}`}
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
              <span className="flex items-center bg-amazon-surface text-white px-2 py-1 rounded-full text-xs">
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
            <h2 className="text-lg md:text-xl font-bold italic text-gray-800">
              {currentFilters.categories.length ? `Products in ${currentFilters.categories.join(', ')}` : "All Products"}
            </h2>
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
          className={`${layoutView === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4"}`}>
          {!isNegativeRange && !isZeroRange && itemList.map((product, i) => (<ProductCard key={`${product.id}-${i}`} product={product} view={layoutView} />))}
          {isLoading && Array.from({ length: 8 }).map((_, i) => (<Skeleton key={`loading-skeleton-${i}`} view={layoutView} />))}</div>
        {!isLoading && (itemList.length === 0 || isNegativeRange || isZeroRange) && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-red-100 shadow-inner">
            {isNegativeRange ? (
              <div className="space-y-2">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="text-xl font-bold text-red-600">Wrong Search Request</h2>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">Min price (${currentFilters.minPrice}) cannot be higher than Max price (${currentFilters.maxPrice}).</p>
                <button
                  onClick={() => applyFilter({ ...currentFilters, minPrice: 0, maxPrice: maxLimit })}
                  className="mt-4 px-8 py-2.5 bg-red-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >Fix Price Range</button>
              </div>
            ) :
              isZeroRange ? (
                <div className="space-y-2">
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-xl font-bold text-gray-800">No Products Found</h2>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm">Searching for an exact price of ${currentFilters.minPrice} dont have results. Try a wider range.</p>
                  <button
                    onClick={() => applyFilter({ ...currentFilters, minPrice: 0, maxPrice: maxLimit })}
                    className="mt-4 px-8 py-2.5 bg-amazon-orange text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    Reset Price</button>
                </div>
              ) :
                (
                  <div className="space-y-2">
                    <div className="text-5xl mb-4">💸</div>
                    <p className="text-gray-500 font-medium">No products match your filters.</p>
                    <button onClick={() => window.location.href = '/'} className="text-amazon-blue underline mt-2">Clear all filters</button>
                  </div>
                )}
          </div>
        )}
        {moreAvailable && !isNegativeRange && !isZeroRange && <div ref={loaderRef} className="h-10 w-full" />}
      </main>

    </div>
  )
}
