'use client';

import Image from 'next/image';
import { Product } from '../types/types';

interface ProductCardProps {
  product: Product;
  view: 'grid' | 'list';
}

export default function ProductCard({ product, view }: ProductCardProps) {
  const isList = view === 'list';

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex ${isList ? 'flex-row h-64' : 'flex-col h-full'}`}>

      <div className={`relative bg-amazon-gray-light shrink-0 ${isList ? 'w-64 h-full' : 'w-full h-48'}`}>
        <Image src={product.thumbnail} alt={product.title} fill className="object-contain p-4" unoptimized />
        {product.discountPercentage > 10 && (
          <>
            <span className="absolute top-2 left-0 bg-red-400 text-white text-[11px] font-bold px-2 py-1">
              Limited time deal
            </span>
          </>
        )}
      </div>

      <div className="p-3 flex flex-col grow gap-1">
        <>
          <h3 className="text-sm font-medium leading-tight group-hover:text-amazon-orange line-clamp-2 mb-1">
            {product.title}
          </h3>
          <span className="w-fit bottom-46 left-0 bg-red-400 text-white text-[11px] font-bold px-2 py-1">
            {product.category}
          </span>
        </>

        <div className="flex items-center gap-1 mb-1">
          <span className="text-amazon-orange text-sm font-bold">
            {product.rating.toFixed(1)} ⭐
          </span>
          <span className="text-xs text-gray-500 font-normal">({product.stock} available)</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium self-start mt-1">$</span>
            <span className="text-2xl font-bold leading-none">{Math.floor(product.price)}</span>
            <span className="text-xs font-medium self-start mt-1">
              {(product.price % 1).toFixed(2).substring(2)}
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-2">
            Get it as soon as <span className="font-bold text-gray-700">Tomorrow</span>
          </p>

          {isList && (<p className="text-sm text-gray-500 mb-3 line-clamp-3">{product.description}</p>)}

          <button className="w-full bg-amazon-yellow hover:bg-amazon-orange text-black text-xs py-1.5 rounded-full shadow-sm border border-amazon-yellow hover:border-amazon-orange transition-all cursor-pointer">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}