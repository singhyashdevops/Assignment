import HomeClient from './HomeClient';
import { fetchProducts } from './utils/fetcher';
import { FetchParams } from './types/types';
import Navbar from '../app/components/Navbar';

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

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const params: FetchParams = {
    q: resolvedParams.q || undefined,
    categories: resolvedParams.categories?.split(',') || [],
    minPrice: Number(resolvedParams.minPrice) || 0,
    maxPrice: Number(resolvedParams.maxPrice) || 10000000,
    minRating: Number(resolvedParams.minRating) || 0,
    sortBy: (resolvedParams.sortBy as 'price' | 'rating' | 'title') || 'price',
    sortOrder: (resolvedParams.sortOrder as 'asc' | 'desc') || 'asc',
    limit: 10,
    skip: 0,
  };

  const { products: initialProducts } = await fetchProducts(params);

  return (
    <>
      <Navbar />
      <HomeClient preloadedProducts={initialProducts} />
    </>
  );
}