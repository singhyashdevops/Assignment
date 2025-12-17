'use client';
interface SkeletonLoaderProps { view?: 'grid' | 'list' }

export default function Skeleton({ view = 'grid' }: SkeletonLoaderProps) {
  const isList = view === 'list';

  return (
    <div
      className={`bg-white border border-gray-200 rounded-sm overflow-hidden animate-pulse flex ${isList ? 'flex-row h-64 w-full' : 'flex-col h-full'}`}>
      <div className={`bg-gray-200 ${isList ? 'w-64 h-full' : 'w-full h-48'}`} />
      <div className="p-3 flex flex-col grow space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="mt-auto space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          {isList && (
            <div className="space-y-2 py-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          )}
          <div className="h-8 bg-gray-200 rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}