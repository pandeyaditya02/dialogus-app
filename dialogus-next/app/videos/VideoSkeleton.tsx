export default function VideoSkeleton() {
  return (
    <div className="video-skeleton group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 transition-all duration-300">
      {/* Video thumbnail area */}
      <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
      </div>
      
      {/* Content area */}
      <div className="px-5 pb-7">
        {/* Title line */}
        <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
        
        {/* Description lines */}
        <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
      </div>
    </div>
  );
}

// Add shimmer animation to your global CSS or in a style tag
// This is optional but makes it look more dynamic
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
`;

// Add this to your component or global CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .animate-shimmer {
      background: linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 20%, #1a1a1a 40%, #1a1a1a 100%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite;
    }
  `;
  document.head.appendChild(style);
}