// app/videos/PaginationControls.tsx
import Link from "next/link";

export default function PaginationControls({
  currentPage,
  nextPageToken,
  prevPageToken,
  totalPages,
}: {
  currentPage: number;
  nextPageToken: string | null;
  prevPageToken: string | null;
  totalPages: number;
}) {
  // Helper to generate a range of numbers for pagination
  const generatePageNumbers = () => {
    if (totalPages <= 1) return [];

    const pages = [];
    // Show a few pages around the current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust window if near the start
    if (currentPage < 3) {
      endPage = Math.min(totalPages, 5);
    }

    // Adjust window if near the end
    if (currentPage > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-16 gap-4">
      {/* --- PREVIOUS BUTTON --- */}
      <div className="w-full sm:w-auto">
        {prevPageToken ? (
          <Link
            href={`/videos?page=${currentPage - 1}&token=${prevPageToken}`}
            className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </Link>
        ) : (
          <div className="px-6 py-4 bg-gray-900 text-gray-600 rounded-xl w-full sm:w-auto font-medium text-lg cursor-not-allowed flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </div>
        )}
      </div>

      {/* --- PAGE NUMBERS --- */}
      <div className="hidden md:flex items-center gap-2">
        {totalPages > 5 && currentPage > 3 && (
            <>
                <span className="px-4 py-2 text-gray-400">1</span>
                <span className="text-gray-600">...</span>
            </>
        )}
        {pageNumbers.map(number => (
           <span
             key={number}
             className={`px-4 py-2 rounded-lg font-bold ${
               currentPage === number
                 ? 'bg-fuchsia-700 text-white' // Changed color here
                 : 'text-gray-400'
             }`}
           >
             {number}
           </span>
        ))}
        {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
                <span className="text-gray-600">...</span>
                <span className="px-4 py-2 text-gray-400">{totalPages}</span>
            </>
        )}
      </div>
      
       {/* Page indicator for mobile */}
       <div className="md:hidden text-gray-400 text-center text-lg font-medium">
         Page {currentPage} of {totalPages}
       </div>

      {/* --- NEXT BUTTON --- */}
      <div className="w-full sm:w-auto">
        {nextPageToken ? (
          <Link
            href={`/videos?page=${currentPage + 1}&token=${nextPageToken}`}
            className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <div className="px-6 py-4 bg-gray-900 text-gray-600 rounded-xl w-full sm:w-auto font-medium text-lg cursor-not-allowed flex items-center justify-center">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
