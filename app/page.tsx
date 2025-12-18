import HomeClient from './HomeClient';
import { fetchProducts } from './utils/fetcher';
import { FetchParams } from './types/types';
import { Metadata } from 'next';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

// --- 1. Dynamic Metadata with Price Fix ---
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;

  const rawCat = resolvedParams.categories?.split(',')[0];
  const categoryDisplay = rawCat 
    ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).replace(/-/g, ' ') 
    : 'All Products';

  const minP = resolvedParams.minPrice;
  const maxP = resolvedParams.maxPrice;
  
  let priceTag = "";
  if (minP && maxP) {
    priceTag = `$${minP} - $${maxP}`;
  } else {
    priceTag = "Best Deals";
  }

  return {
    title: `Shop ${categoryDisplay} | ${priceTag} | QuickCart`,
    description: `Explore the best ${categoryDisplay.toLowerCase()} ${priceTag !== "Best Deals" ? `starting from ${priceTag}` : ""} at QuickCart. High quality guaranteed.`,
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const params: FetchParams = {
    categories: resolvedParams.categories?.split(',').filter(Boolean) || [],
    limit: 12,
    skip: 0,
    revalidate: 3600 
  };

  const { products: initialProducts } = await fetchProducts(params);

  return (
    <HomeClient 
      preloadedProducts={initialProducts} 
    />
  );
}