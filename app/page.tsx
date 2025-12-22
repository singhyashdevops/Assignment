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

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;

  const rawCat = resolvedParams.categories?.split(',')[0];
  const category = rawCat
    ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).replace(/-/g, ' ')
    : 'All Products';
  const minPrice = resolvedParams.minPrice
  const maxPrice = resolvedParams.maxPrice
  const minRating = resolvedParams.minRating

  return {
    title: rawCat ? `Shop ${category} Online | Best ${category} Products, Top Rated ${category} Items, Affordable Prices from $${minPrice} to $${maxPrice} at QuickCart`
      :
      `Shop All Products Online | Best Deals on Electronics, Fashion, Home, Kitchen, Beauty & More at QuickCart`,

    description: `${rawCat ? `Explore the best ${category} products at QuickCart. Rated more than ${minRating}★, priced from $${minPrice} to $${maxPrice}, with high quality guaranteed.`
      :
      `Discover a wide range of products at QuickCart, including beauty, fragrances, furniture, groceries, home decoration, kitchen accessories, laptops, men's shirts, shoes, watches, mobile accessories, smartphones, sports accessories, sunglasses, tablets, tops, vehicles, women's bags, dresses, jewellery, shoes, and watches. Shop high-quality products across all your favorite categories with fast delivery and guaranteed satisfaction.`}`

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
    <HomeClient preloadedProducts={initialProducts} />
  );
}