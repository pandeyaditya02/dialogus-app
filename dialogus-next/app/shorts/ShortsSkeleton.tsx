export default function ShortsSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 animate-pulse">
      {/* Vertical aspect ratio for shorts skeleton - 9:16 aspect ratio */}
      <div className="relative w-full aspect-[9/16] mb-4 rounded-xl overflow-hidden bg-gray-800">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700" />
        
        {/* Shorts indicator badge skeleton */}
        <div className="absolute top-2 left-2 bg-gray-700 px-2 py-1 rounded-md">
          <div className="h-3 w-10 bg-gray-600 rounded" />
        </div>
        
        {/* Play button skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-700" />
        </div>
      </div>
      
      <div className="px-4 pb-4 space-y-2">
        {/* Title skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
