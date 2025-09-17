import Link from "next/link";
import Image from "next/image";

interface Short {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface ShortsCardProps {
  short: Short;
  isPlaying: boolean;
  onPlay: () => void;
}

export default function ShortsCard({ short, isPlaying, onPlay }: ShortsCardProps) {
  return (
    <div className="shorts-card-container group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-gray-700">
      {/* Vertical aspect ratio for shorts - 9:16 aspect ratio */}
      <div className="relative w-full aspect-[9/16] mb-4 rounded-xl overflow-hidden bg-black">
        <div
          className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer"
          onClick={onPlay}
        >
          <Image
            src={short.thumbnail}
            alt={short.title}
            width={360}
            height={640}
            className="w-full h-full object-cover"
            loading="lazy"
            unoptimized // YouTube images are already optimized
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center transform hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          
          {/* Shorts indicator badge */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-80 px-2 py-1 rounded-md">
            <span className="text-white text-xs font-semibold">SHORTS</span>
          </div>
        </div>

        {/* Only load the iframe when user clicks the play button */}
        {isPlaying && (
          <iframe
            src={`https://www.youtube.com/embed/${short.id}?rel=0&modestbranding=1&autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full absolute top-0 left-0"
            title={short.title}
            frameBorder="0"
          />
        )}
      </div>
      
      <div className="px-4 pb-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 hover:underline cursor-pointer transition-colors">
          <Link
            href={`https://www.youtube.com/watch?v=${short.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {short.title}
          </Link>
        </h3>
        <p className="text-gray-400 text-xs line-clamp-2">
          {short.description.substring(0, 80)}{short.description.length > 80 ? "..." : ""}
        </p>
      </div>
    </div>
  );
}
