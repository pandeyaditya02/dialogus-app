import Link from "next/link";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  onPlay: () => void;
}

export default function VideoCard({ video, isPlaying, onPlay }: VideoCardProps) {
  return (
    <div className="video-card-container group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-gray-700">
      <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-black">
        <div
          className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer"
          onClick={onPlay}
        >
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={640}
            height={360}
            className="w-full h-full object-cover"
            loading="lazy"
            unoptimized // YouTube images are already optimized
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white ml-1"
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
        </div>

        {/* Only load the iframe when user clicks the play button */}
        {isPlaying && (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full absolute top-0 left-0"
            title={video.title}
            frameBorder="0"
          />
        )}
      </div>
      <div className="px-5 pb-7">
        <h3 className="text-white font-bold text-xl mb-3 line-clamp-2 hover:underline cursor-pointer transition-colors">
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {video.title}
          </Link>
        </h3>
        <p className="text-gray-300 text-base line-clamp-3">
          {video.description.substring(0, 150)}{video.description.length > 150 ? "..." : ""}
        </p>
      </div>
    </div>
  );
}