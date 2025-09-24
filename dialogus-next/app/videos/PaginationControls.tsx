import Link from "next/link";
export default function PaginationControls({
  currentPage,
  nextPageToken,
  prevPageToken,
}: {
  currentPage: number;
  nextPageToken?: string;
  prevPageToken?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-16 gap-4">
      <div className="w-full sm:w-auto">
        {prevPageToken && (
          <Link
            href={`/videos?page=${currentPage - 1}&token=${prevPageToken}`}
            className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Previous Page
          </Link>
        )}
      </div>

      <div className="text-gray-400 text-center text-lg font-medium">
        Page {currentPage}
      </div>

      <div className="w-full sm:w-auto">
        {nextPageToken && (
          <Link
            href={`/videos?page=${currentPage + 1}&token=${nextPageToken}`}
            className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
          >
            Next Page
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}